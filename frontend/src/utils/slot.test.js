import { describe, it, expect } from 'vitest';
import { groupSlotsByDate, splitSlotLabel } from './slot.js';

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
