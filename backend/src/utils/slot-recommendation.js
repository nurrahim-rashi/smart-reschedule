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

/**
 * Hari preferensi bisa berupa nama hari ("sabtu") atau relatif ("besok").
 * Hari relatif diubah menjadi tanggal lokal supaya bisa dibandingkan dengan slot.
 */
export const resolvePreferredDay = (day, now = new Date()) => {
    if (!day) {
        return null;
    }

    const key = day.toLowerCase();

    if (key in RELATIVE_DAYS) {
        const date = new Date(now.getTime() + RELATIVE_DAYS[key] * 24 * 60 * 60 * 1000);
        return { dateKey: getDateKey(date) };
    }

    return { day: key };
};

const isSameDay = (slot, preferredDay) => (preferredDay.dateKey
    ? slot.dateKey === preferredDay.dateKey
    : slot.day === preferredDay.day);

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
                alternatives.push({ ...slot, reason });
                limit -= 1;
            }
        }
    };

    if (preferredDay) {
        const sameDay = slots.filter((slot) => isSameDay(slot, preferredDay));

        if (targetHour !== null) {
            sameDay.sort((a, b) => Math.abs(a.hour - targetHour) - Math.abs(b.hour - targetHour));
        }

        addAlternatives(sameDay, 'Hari sama, jam lain', 3);
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

        addAlternatives(sameTime, reason, 3);
    }

    addAlternatives(slots, 'Slot terdekat', MAX_ALTERNATIVES);

    return { matched, alternatives };
};
