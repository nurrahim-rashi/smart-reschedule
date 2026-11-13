import { describe, it, expect } from "vitest";
import { validateUserPayload } from "./validator.js";
import { InvariantError } from "../../exceptions/index.js";

describe('validateUserPayload', () => {
    it('harus lolos data register lengkap', () => {
        const payload = {
            name: 'Rahiel',
            email: 'rahiel@contoh.com',
            password: '123456',
        };

        const result = validateUserPayload(payload);

        expect(result).toEqual(payload);
    });

    it('harus error kalau email tidak diisi', () => {
        const payload = {
            name: 'Rahiel',
            password: '123456',
        };

        expect(() => validateUserPayload(payload)).toThrow(InvariantError);
    });

    it('harus error kalau format email salah', () => {
        const payload = {
            name:'Rahiel',
            email: 'email-salah',
            password: '123456',
        };

        expect(() => validateUserPayload(payload)).toThrow(InvariantError);
    });

    it('harus error kalau password kurang dari 6 karakter', () => {
        const payload = {
            name: 'Rahiel',
            email: 'rahiel@contoh.com',
            password: '123',
        };

        expect(() => validateUserPayload(payload)).toThrow(InvariantError);
    });
});