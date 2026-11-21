import { describe, it, expect } from "vitest";
import { validateRecommendationQuery } from "./validator.js";
import { InvariantError } from "../../exceptions/index.js";

describe('validateRecommendationQuery', () => {
    it('harus lolos dan menormalkan huruf kecil', () => {
        const result = validateRecommendationQuery({
            day: 'Sabtu',
            period: 'PAGI',
            time: 'jam 8',
            excludeSlotId: '4',
        });

        expect(result).toEqual({ day: 'sabtu', period: 'pagi', time: 'jam 8', excludeSlotId: 4 });
    });

    it('harus menganggap string kosong sebagai tidak diisi', () => {
        expect(validateRecommendationQuery({ day: '', period: '', time: '' })).toEqual({});
    });

    it('harus error kalau periode tidak dikenal', () => {
        expect(() => validateRecommendationQuery({ period: 'subuh' })).toThrow(InvariantError);
    });

    it('harus error kalau excludeSlotId bukan angka', () => {
        expect(() => validateRecommendationQuery({ excludeSlotId: 'abc' })).toThrow(InvariantError);
    });
});
