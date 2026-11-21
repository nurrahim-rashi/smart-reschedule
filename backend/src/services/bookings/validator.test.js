import { describe, it, expect } from "vitest";
import { validateBookingPayload } from "./validator.js";
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
