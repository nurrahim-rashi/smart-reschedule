import { describe, it, expect } from "vitest";
import { validateBookingPayload, validateBookingParams } from "./validator.js";
import { InvariantError } from "../../exceptions/index.js";

describe('validateBookingPayload', () => {
    it('harus lolos kalau slotId angka positif', () => {
        expect(validateBookingPayload({ slotId: 3 })).toEqual({ slotId: 3 });
    });

    it('harus error kalau slotId tidak ada', () => {
        expect(() => validateBookingPayload({})).toThrow(InvariantError);
    });

    it('harus error kalau slotId bukan angka positif', () => {
        expect(() => validateBookingPayload({ slotId: 0 })).toThrow(InvariantError);
        expect(() => validateBookingPayload({ slotId: 'abc' })).toThrow(InvariantError);
    });

    it('harus error kalau payload kosong', () => {
        expect(() => validateBookingPayload(null)).toThrow(InvariantError);
    });
});

describe('validateBookingParams', () => {
    it('harus mengubah id dari URL menjadi angka', () => {
        expect(validateBookingParams({ id: '12' })).toEqual({ id: 12 });
    });

    it('harus error kalau id bukan angka positif', () => {
        expect(() => validateBookingParams({ id: 'abc' })).toThrow(InvariantError);
        expect(() => validateBookingParams({ id: '-1' })).toThrow(InvariantError);
    });
});
