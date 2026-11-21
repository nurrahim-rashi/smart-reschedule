import { describe, it, expect } from 'vitest';
import { groupSlotsByDate, splitSlotLabel, formatTimeRange, mergeBookedSlots } from './slot.js';

const slots = [
    { id: 1, dateKey: '2026-11-28', label: 'Sabtu, 28 Nov 08:00' },
    { id: 2, dateKey: '2026-11-28', label: 'Sabtu, 28 Nov 09:00' },
    { id: 3, dateKey: '2026-11-29', label: 'Minggu, 29 Nov 07:00' },
];

describe('groupSlotsByDate', () => {
    it('harus mengelompokkan slot per tanggal dengan urutan tetap', () => {
        const groups = groupSlotsByDate(slots);

        expect(groups.map(([dateKey]) => dateKey)).toEqual(['2026-11-28', '2026-11-29']);
        expect(groups[0][1].map((slot) => slot.id)).toEqual([1, 2]);
        expect(groups[1][1].map((slot) => slot.id)).toEqual([3]);
    });

    it('harus mengembalikan array kosong kalau tidak ada slot', () => {
        expect(groupSlotsByDate([])).toEqual([]);
    });
});

describe('splitSlotLabel', () => {
    it('harus memisahkan tanggal dan jam dari label slot', () => {
        expect(splitSlotLabel('Sabtu, 28 Nov 08:00')).toEqual({
            dateLabel: 'Sabtu, 28 Nov',
            time: '08:00',
        });
    });
});

describe('formatTimeRange', () => {
    it('harus menampilkan rentang 1 jam', () => {
        expect(formatTimeRange('11:00')).toBe('11:00 – 12:00');
        expect(formatTimeRange('07:00')).toBe('07:00 – 08:00');
        expect(formatTimeRange('20:00')).toBe('20:00 – 21:00');
    });
});

describe('mergeBookedSlots', () => {
    const timeSlots = [
        { id: 1, startTime: '2026-11-28T01:00:00Z', dateKey: '2026-11-28', label: 'Sabtu, 28 Nov 08:00' },
        { id: 2, startTime: '2026-11-28T02:00:00Z', dateKey: '2026-11-28', label: 'Sabtu, 28 Nov 09:00' },
    ];

    it('harus menandai slot tersedia yang sudah dibooking member', () => {
        const merged = mergeBookedSlots(timeSlots, [{ id: 10, slotId: 2 }]);

        expect(merged.find((slot) => slot.id === 2).bookingId).toBe(10);
        expect(merged.find((slot) => slot.id === 1).bookingId).toBeUndefined();
    });

    it('harus tetap menampilkan jadwal member walaupun slotnya penuh', () => {
        const fullSlotBooking = {
            id: 11,
            slotId: 3,
            schedule: 'Sabtu, 28 Nov 07:00',
            startTime: '2026-11-28T00:00:00Z',
            dateKey: '2026-11-28',
        };

        const merged = mergeBookedSlots(timeSlots, [fullSlotBooking]);

        expect(merged.map((slot) => slot.id)).toEqual([3, 1, 2]);
        expect(merged[0]).toMatchObject({ label: 'Sabtu, 28 Nov 07:00', bookingId: 11 });
    });
});
