import { describe, it, expect } from "vitest";
import { parsePreferredHour, recommendSlots, resolvePreferredDay } from "./slot-recommendation.js";
import { getSlotParts } from "./slot-label.js";

// Sabtu 21 Nov 2026 07:00 WIB
const NOW = new Date('2026-11-21T00:00:00Z');

// Slot tiap jam 07:00-20:00 WIB selama 7 hari (Sabtu 21 Nov - Jumat 27 Nov)
const buildSlots = () => {
    const slots = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        for (let hour = 7; hour <= 20; hour += 1) {
            const startTime = new Date(Date.UTC(2026, 10, 21 + dayOffset, hour - 7));
            slots.push({ id: slots.length + 1, startTime, ...getSlotParts(startTime) });
        }
    }

    return slots;
};

describe('parsePreferredHour', () => {
    it('membaca format jam yang umum', () => {
        expect(parsePreferredHour('16:00')).toBe(16);
        expect(parsePreferredHour('08.30')).toBe(8);
        expect(parsePreferredHour('jam 8', 'pagi')).toBe(8);
    });

    it('menyesuaikan jam dengan periode', () => {
        expect(parsePreferredHour('4 sore', 'sore')).toBe(16);
        expect(parsePreferredHour('jam 7', 'malam')).toBe(19);
        expect(parsePreferredHour('jam 2', 'siang')).toBe(14);
    });

    it('menganggap jam kecil tanpa periode sebagai siang/sore karena gym buka 07:00', () => {
        expect(parsePreferredHour('jam 3')).toBe(15);
    });

    it('mengembalikan null jika tidak ada jam', () => {
        expect(parsePreferredHour(null)).toBeNull();
        expect(parsePreferredHour('nanti')).toBeNull();
    });
});

describe('resolvePreferredDay', () => {
    it('membaca nama hari', () => {
        expect(resolvePreferredDay('Sabtu', NOW)).toEqual({ day: 'sabtu' });
    });

    it('membaca hari relatif menjadi satu tanggal', () => {
        expect(resolvePreferredDay('besok', NOW)).toEqual({ dateFrom: '2026-11-22', dateTo: '2026-11-22' });
        expect(resolvePreferredDay('5 hari lagi', NOW)).toEqual({ dateFrom: '2026-11-26', dateTo: '2026-11-26' });
    });

    it('membaca minggu relatif menjadi rentang 7 hari', () => {
        expect(resolvePreferredDay('minggu depan', NOW)).toEqual({ dateFrom: '2026-11-28', dateTo: '2026-12-04', isRange: true });
        expect(resolvePreferredDay('3 minggu lagi', NOW)).toEqual({ dateFrom: '2026-12-12', dateTo: '2026-12-18', isRange: true });
    });
});

describe('recommendSlots', () => {
    const slots = buildSlots();

    it('mencocokkan hari dan jam yang diminta', () => {
        const { matched } = recommendSlots(slots, { day: 'minggu', time: '08:00' }, NOW);

        expect(matched).toHaveLength(1);
        expect(matched[0]).toMatchObject({ day: 'minggu', hour: 8 });
    });

    it('mencocokkan hari dan periode', () => {
        const { matched } = recommendSlots(slots, { day: 'senin', period: 'pagi' }, NOW);

        expect(matched.map((slot) => slot.hour)).toEqual([7, 8, 9, 10]);
        expect(matched.every((slot) => slot.day === 'senin')).toBe(true);
    });

    it('membaca hari relatif seperti besok', () => {
        const { matched } = recommendSlots(slots, { day: 'besok', period: 'sore' }, NOW);

        expect(matched.every((slot) => slot.dateKey === '2026-11-22')).toBe(true);
        expect(matched.map((slot) => slot.hour)).toEqual([15, 16, 17]);
    });

    it('tetap memberi banyak alternatif saat slot yang diminta tidak ada', () => {
        // Jam 06:00 di luar jam buka, jadi tidak ada slot yang cocok
        const { matched, alternatives } = recommendSlots(slots, { day: 'minggu', time: '06:00', period: 'pagi' }, NOW);

        expect(matched).toHaveLength(0);
        expect(alternatives.length).toBeGreaterThanOrEqual(5);

        // Alternatif pertama: hari sama, jam paling dekat
        expect(alternatives[0]).toMatchObject({ day: 'minggu', hour: 7, reason: 'Hari sama, jam lain' });
    });

    it('menawarkan periode yang sama di hari lain jika jamnya tidak pernah ada', () => {
        const { alternatives } = recommendSlots(slots, { day: 'besok', time: 'jam 6', period: 'pagi' }, NOW);
        const otherDays = alternatives.filter((slot) => slot.reason === 'Waktu sama, hari lain');

        expect(otherDays.length).toBeGreaterThan(0);
        expect(otherDays.every((slot) => slot.dateKey !== '2026-11-22' && slot.hour < 11)).toBe(true);
    });

    it('menawarkan jam yang sama di hari lain sebagai alternatif', () => {
        const { alternatives } = recommendSlots(slots, { day: 'minggu', time: '08:00' }, NOW);
        const sameTime = alternatives.filter((slot) => slot.reason === 'Jam sama, hari lain');

        expect(sameTime.length).toBeGreaterThan(0);
        expect(sameTime.every((slot) => slot.hour === 8 && slot.day !== 'minggu')).toBe(true);
    });

    it('tidak mengulang slot yang sudah ada di matched', () => {
        const { matched, alternatives } = recommendSlots(slots, { day: 'selasa', period: 'malam' }, NOW);
        const matchedIds = new Set(matched.map((slot) => slot.id));

        expect(alternatives.some((slot) => matchedIds.has(slot.id))).toBe(false);
    });

    it('memberi slot terdekat jika tidak ada preferensi', () => {
        const { matched, alternatives } = recommendSlots(slots, {}, NOW);

        expect(matched).toHaveLength(0);
        expect(alternatives.map((slot) => slot.id)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(alternatives[0].reason).toBe('Slot terdekat');
    });

    it('mencocokkan slot dalam rentang "minggu depan"', () => {
        // Slot test hanya sampai Jumat 27 Nov, minggu depan mulai Sabtu 28 Nov
        const extraSlots = [...slots, ...[28, 29].map((day, index) => {
            const startTime = new Date(Date.UTC(2026, 10, day, 1));
            return { id: 1000 + index, startTime, ...getSlotParts(startTime) };
        })];

        const { matched } = recommendSlots(extraSlots, { day: 'minggu depan' }, NOW);

        expect(matched.map((slot) => slot.dateKey)).toEqual(['2026-11-28', '2026-11-29']);
    });

    it('menawarkan tanggal terdekat jika minggu yang diminta belum punya slot', () => {
        // "3 minggu lagi" = 12-18 Des, sedangkan slot test hanya sampai 27 Nov
        const { matched, alternatives } = recommendSlots(slots, { day: '3 minggu lagi', period: 'pagi' }, NOW);
        const nearest = alternatives.filter((slot) => slot.reason === 'Tanggal terdekat');

        expect(matched).toHaveLength(0);
        expect(nearest.length).toBeGreaterThan(0);
        expect(nearest.every((slot) => slot.dateKey === '2026-11-27' && slot.hour < 11)).toBe(true);
    });

    it('memakai jam yang sama setiap hari dalam rentang minggu yang diminta', () => {
        const { matched, alternatives } = recommendSlots(slots, { day: '3 minggu lagi', time: '10:00' }, NOW);

        // 12-18 Des di luar slot test, jadi alternatif jam sama diambil dari tanggal terdekat (Jumat 27 Nov)
        expect(matched).toHaveLength(0);
        expect(alternatives[0]).toMatchObject({ dateKey: '2026-11-27', hour: 10 });
    });
});
