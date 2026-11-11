import { describe, it, expect } from 'vitest';
import { getPeriod, getRecommendedSlots } from './slot.js';

const slots = ['Sabtu 08:00', 'Sabtu 10:00', 'Minggu 09:00', 'Minggu 16:00'];

describe('getPeriod', () => {
    it('harus mengubah jam menjadi pagi, siang, sore, atau malam', () => {
        expect(getPeriod(8)).toBe('pagi');
        expect(getPeriod(12)).toBe('siang');
        expect(getPeriod(16)).toBe('sore');
        expect(getPeriod(19)).toBe('malam');
    });
});

describe('getRecommendedSlots', () => {
    it('harus memisahkan slot yang cocok dengan hari yang diminta', () => {
        const result = getRecommendedSlots(slots, 'sabtu', null);

        expect(result.matched).toEqual(['Sabtu 08:00', 'Sabtu 10:00']);
        expect(result.others).toEqual(['Minggu 09:00', 'Minggu 16:00']);
    });

    it('harus mencocokkan hari dan waktu sekaligus', () => {
        const result = getRecommendedSlots(slots, 'minggu', 'sore');

        expect(result.matched).toEqual(['Minggu 16:00']);
    });

    it('harus mencocokkan waktu saja kalau hari tidak disebut', () => {
        const result = getRecommendedSlots(slots, null, 'pagi');

        expect(result.matched).toEqual(['Sabtu 08:00', 'Sabtu 10:00', 'Minggu 09:00']);
    });

    it('harus mengembalikan matched kosong kalau tidak ada preferensi', () => {
        const result = getRecommendedSlots(slots, null, null);

        expect(result.matched).toEqual([]);
        expect(result.others).toEqual(slots);
    });
});