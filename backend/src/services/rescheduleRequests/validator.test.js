import { describe, it, expect } from "vitest";
import { validateRequestPayload, validateRequestQuery, validateRequestParams } from "./validator.js";
import { InvariantError } from "../../exceptions/index.js";

describe('validateRequestPayload', () => {
    it('harus lolos kalau data request lengkap', () => {
        const payload = {
            bookingId: 1,
            requestedSlotId: 3,
            message: 'Mau pindah ke Sabtu pagi',
        };

        const result = validateRequestPayload(payload);

        expect(result).toEqual(payload);
    });

    it('harus error kalau message kosong', () => {
        const payload = {
            bookingId: 1,
            requestedSlotId: 3,
        };

        expect(() => validateRequestPayload(payload)).toThrow(InvariantError);
    });

    it('harus error kalau bookingId bukan angka positif', () => {
        const payload = {
            bookingId: -1,
            requestedSlotId: 3,
            message: 'Mau pindah ke Sabtu pagi',
        };

        expect(() => validateRequestPayload(payload)).toThrow(InvariantError);
    });
});

describe('validateRequestQuery', () => {
    it('harus lolos kalau status pending', () => {
        const result = validateRequestQuery({ status: 'pending' });

        expect(result.status).toBe('pending');
    });

    it('harus error kalau status tidak dikenal', () => {
        expect(() => validateRequestQuery({ status: 'selesai'})).toThrow(InvariantError);
    });
});

describe('validateRequestParams', () => {
    it('harus mengubah id dari teks menjadi angka', () => {
        const result = validateRequestParams({ id: '5' });

        expect(result.id).toBe(5);
    });

    it('harus error kalau id bukan angka', () => {
        expect(() => validateRequestParams({ id: 'abc' })).toThrow(InvariantError);
    });
});
