import { getDateKey } from "./slot-label.js";

const MAX_MATCHED = 5;
const MAX_ALTERNATIVES = 6;

// Jam tengah tiap periode, dipakai kalau customer hanya menyebut "pagi"/"sore"
const PERIOD_CENTER = {
    pagi: 8,
    siang: 13,
    sore: 16,
    malam: 19,
};

const RELATIVE_DAYS = {
    'hari ini': 0,
    besok: 1,
    lusa: 2,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const getPeriod = (hour) => {
    if (hour < 11) return 'pagi';
    if (hour < 15) return 'siang';
    if (hour < 18) return 'sore';
    return 'malam';
};

/**
 * Ubah teks jam dari ekstraksi AI menjadi jam 0-23.
 * "16:00" -> 16, "jam 8" -> 8, "4 sore" -> 16, "jam 2" -> 14 (gym buka 07:00)
 */
export const parsePreferredHour = (time, period) => {
    if (!time) {
        return null;
    }

    const match = String(time).match(/(\d{1,2})(?:[:.]\d{2})?/);
    if (!match) {
        return null;
    }

    let hour = Number(match[1]);

    if (hour < 12 && (period === 'sore' || period === 'malam')) {
        hour += 12;
    } else if (hour <= 5 && period === 'siang') {
        hour += 12;
    } else if (!period && hour < 7) {
        hour += 12;
    }

    return hour <= 23 ? hour : null;
};

const daysFromNow = (now, days) => getDateKey(new Date(now.getTime() + days * DAY_MS));

/**
 * Hari preferensi bisa berupa:
 * - nama hari: "sabtu" -> { day: 'sabtu' }
 * - hari relatif: "besok", "5 hari lagi" -> satu tanggal
 * - minggu relatif: "minggu depan", "3 minggu lagi" -> rentang 7 hari mulai N minggu dari sekarang
 *
 * Tanggal dalam format YYYY-MM-DD sehingga bisa dibandingkan sebagai string.
 */
export const resolvePreferredDay = (day, now = new Date()) => {
    if (!day) {
        return null;
    }

    const key = day.toLowerCase().trim();

    let offset = null;

    if (key in RELATIVE_DAYS) {
        offset = RELATIVE_DAYS[key];
    }

    const daysMatch = key.match(/^(\d+) hari lagi$/);
    if (daysMatch) {
        offset = Number(daysMatch[1]);
    }

    if (offset !== null) {
        const dateKey = daysFromNow(now, offset);
        return { dateFrom: dateKey, dateTo: dateKey };
    }

    const weeksMatch = key.match(/^(\d+) minggu lagi$/);
    const weeks = key === 'minggu depan' ? 1 : Number(weeksMatch?.[1]);

    if (weeks) {
        return {
            dateFrom: daysFromNow(now, weeks * 7),
            dateTo: daysFromNow(now, weeks * 7 + 6),
            isRange: true,
        };
    }

    return { day: key };
};

const isSameDay = (slot, preferredDay) => (preferredDay.day
    ? slot.day === preferredDay.day
    : slot.dateKey >= preferredDay.dateFrom && slot.dateKey <= preferredDay.dateTo);

// Jarak (hari) dari tanggal slot ke rentang tanggal yang diminta; 0 jika di dalam rentang
const dayDistance = (slot, preferredDay) => {
    const date = Date.parse(slot.dateKey);
    const from = Date.parse(preferredDay.dateFrom);
    const to = Date.parse(preferredDay.dateTo);

    if (date < from) return (from - date) / DAY_MS;
    if (date > to) return (date - to) / DAY_MS;
    return 0;
};

/**
 * Rekomendasi slot berdasarkan preferensi customer.
 *
 * slots: slot tersedia yang sudah diurutkan dari paling awal, masing-masing punya
 *        { id, day, dateKey, hour, ... } (lihat getSlotParts)
 *
 * Mengembalikan:
 * - matched: slot yang cocok dengan semua preferensi
 * - alternatives: pilihan cadangan jika slot yang cocok sedikit/tidak ada, dengan alasan:
 *   hari yang sama jam terdekat, jam yang sama di hari lain, lalu slot paling awal
 */
export const recommendSlots = (slots, { day, period, time } = {}, now = new Date()) => {
    const preferredDay = resolvePreferredDay(day, now);
    const preferredHour = parsePreferredHour(time, period);
    const preferredPeriod = period ?? (preferredHour !== null ? getPeriod(preferredHour) : null);
    const targetHour = preferredHour ?? PERIOD_CENTER[preferredPeriod] ?? null;

    const matchesTime = (slot) => {
        if (preferredHour !== null) return slot.hour === preferredHour;
        if (preferredPeriod) return getPeriod(slot.hour) === preferredPeriod;
        return true;
    };

    const hasPreference = Boolean(preferredDay || preferredPeriod);

    const matched = hasPreference
        ? slots
            .filter((slot) => (!preferredDay || isSameDay(slot, preferredDay)) && matchesTime(slot))
            .slice(0, MAX_MATCHED)
        : [];

    const usedIds = new Set(matched.map((slot) => slot.id));
    const alternatives = [];

    const addAlternatives = (candidates, reason, limit) => {
        for (const slot of candidates) {
            if (alternatives.length >= MAX_ALTERNATIVES || limit <= 0) {
                return;
            }

            if (!usedIds.has(slot.id)) {
                usedIds.add(slot.id);
                alternatives.push({ ...slot, reason: typeof reason === 'function' ? reason(slot) : reason });
                limit -= 1;
            }
        }
    };

    if (preferredDay) {
        const sameDay = slots.filter((slot) => isSameDay(slot, preferredDay));

        if (targetHour !== null) {
            sameDay.sort((a, b) => Math.abs(a.hour - targetHour) - Math.abs(b.hour - targetHour));
        }

        const sameDayReason = (slot) => {
            if (!preferredDay.isRange) return 'Hari sama, jam lain';
            return slot.hour === targetHour ? 'Minggu yang sama' : 'Minggu yang sama, jam lain';
        };

        addAlternatives(sameDay, sameDayReason, 3);

        // Tanggal yang diminta tidak punya slot (mis. di luar jangkauan jadwal):
        // tawarkan slot dengan tanggal paling dekat
        if (sameDay.length === 0 && preferredDay.dateFrom) {
            const nearestDate = [...slots].sort((a, b) => dayDistance(a, preferredDay) - dayDistance(b, preferredDay)
                || (targetHour === null ? 0 : Math.abs(a.hour - targetHour) - Math.abs(b.hour - targetHour)));

            addAlternatives(nearestDate, 'Tanggal terdekat', 3);
        }
    }

    if (preferredPeriod) {
        const isOtherDay = (slot) => !preferredDay || !isSameDay(slot, preferredDay);
        let sameTime = slots.filter((slot) => isOtherDay(slot) && matchesTime(slot));
        let reason = preferredHour !== null ? 'Jam sama, hari lain' : 'Waktu sama, hari lain';

        // Jam persisnya tidak ada (mis. jam 6, gym belum buka): pakai periode yang sama
        if (sameTime.length === 0 && preferredHour !== null) {
            sameTime = slots.filter((slot) => isOtherDay(slot) && getPeriod(slot.hour) === preferredPeriod);
            reason = 'Waktu sama, hari lain';
        }

        // Untuk permintaan bertanggal, utamakan hari lain yang paling dekat dengan tanggalnya
        if (preferredDay?.dateFrom) {
            sameTime = [...sameTime].sort((a, b) => dayDistance(a, preferredDay) - dayDistance(b, preferredDay));
        }

        addAlternatives(sameTime, reason, 3);
    }

    // Sisa pilihan: untuk permintaan bertanggal, urutkan dari tanggal yang paling dekat
    // dengan permintaan; selain itu, slot paling awal
    if (preferredDay?.dateFrom) {
        const byDate = [...slots].sort((a, b) => dayDistance(a, preferredDay) - dayDistance(b, preferredDay));
        addAlternatives(byDate, 'Tanggal terdekat', MAX_ALTERNATIVES);
    } else {
        addAlternatives(slots, 'Slot terdekat', MAX_ALTERNATIVES);
    }

    return { matched, alternatives };
};
