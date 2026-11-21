import { describe, it, expect } from "vitest";
import { formatSlotLabel, getSlotParts } from "./slot-label.js";

describe('formatSlotLabel', () => {
    it('harus menampilkan hari, tanggal, dan jam dalam WIB', () => {
        // 01:00 UTC = 08:00 WIB
        expect(formatSlotLabel('2026-11-22T01:00:00Z')).toBe('Minggu, 22 Nov 08:00');
    });

    it('harus memakai tanggal lokal saat jam UTC masih hari sebelumnya', () => {
        // 23 Nov 00:00 WIB masih 22 Nov di UTC
        expect(formatSlotLabel('2026-11-22T17:00:00Z')).toBe('Senin, 23 Nov 00:00');
    });
});

describe('getSlotParts', () => {
    it('harus mengembalikan hari, tanggal, dan jam lokal', () => {
        expect(getSlotParts('2026-11-28T13:00:00Z')).toEqual({
            day: 'sabtu',
            dateKey: '2026-11-28',
            hour: 20,
        });
    });
});
