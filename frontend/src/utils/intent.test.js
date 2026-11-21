import { describe, it, expect } from 'vitest';
import { intentLabel } from './intent.js';

describe('intentLabel', () => {
    it('harus menerjemahkan intent ke label bahasa Indonesia', () => {
        expect(intentLabel('cancel')).toBe('Pembatalan');
        expect(intentLabel('schedule_inquiry')).toBe('Tanya Jadwal');
    });

    it('harus mengembalikan intent apa adanya kalau tidak dikenal', () => {
        expect(intentLabel('xyz')).toBe('xyz');
    });
});
