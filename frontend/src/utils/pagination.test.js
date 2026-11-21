import { describe, it, expect } from 'vitest';
import { paginate } from './pagination.js';

const items = [1, 2, 3, 4, 5, 6, 7];

describe('paginate', () => {
    it('harus mengambil item sesuai halaman', () => {
        expect(paginate(items, 1, 3)).toEqual({ pageItems: [1, 2, 3], currentPage: 1, totalPages: 3 });
        expect(paginate(items, 3, 3)).toEqual({ pageItems: [7], currentPage: 3, totalPages: 3 });
    });

    it('harus memindah halaman yang terlalu besar ke halaman terakhir', () => {
        expect(paginate(items, 10, 3).currentPage).toBe(3);
    });

    it('harus memindah halaman di bawah 1 ke halaman pertama', () => {
        expect(paginate(items, 0, 3).currentPage).toBe(1);
    });

    it('harus tetap punya 1 halaman kalau daftar kosong', () => {
        expect(paginate([], 1, 3)).toEqual({ pageItems: [], currentPage: 1, totalPages: 1 });
    });
});
