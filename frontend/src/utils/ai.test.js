import { describe, it, expect, vi, afterEach } from 'vitest';
import { analyzeMessage, generateReply, getDraftReply } from './ai.js';

describe('analyzeMessage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('harus mengirim pesan ke /analyze-message dan mengembalikan hasil analisis', async () => {
        const fakeResult = {
            message: 'pindah Senin siang ya!',
            intent: 'reschedule',
            confidence: 0.99,
            preferred_day: 'senin',
            preferred_period: 'siang',
            preferred_time: null,
        };
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => fakeResult,
        });

        const result = await analyzeMessage('pindah Senin siang ya!');

        expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:8000/analyze-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'pindah Senin siang ya!' }),
        });
        expect(result).toEqual({ error: false, data: fakeResult });
    });

    it('harus mengembalikan error true ketika ai-service gagal', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });

        const result = await analyzeMessage('halo');

        expect(result).toEqual({ error: true, data: null });
    });
});

describe('generateReply', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('harus mengirim intent, slots, dan message lalu mengembalikan draft balasan', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ draft_reply: 'Halo, Kak! Bisa pindah ke Senin jam 13:00 yaa.' }),
        });
        const payload = {
            intent: 'reschedule',
            slots: ['Senin 13:00', 'Rabu 18:30'],
            message: 'pindah Senin siang ya!'
        };

        const result = await generateReply(payload);

        expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:8000/generate-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual({ error: false, data: 'Halo, Kak! Bisa pindah ke Senin jam 13:00 yaa.' });
    });

    it('harus mengembalikan error true ketika ai-service gagal', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });

        const result = await generateReply({
            intent: 'reschedule',
            slots: [],
            message: 'x'
        });

        expect(result).toEqual({
            error: true,
            data: null
        });
    });
});

describe('getDraftReply', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('harus mengirim message dan slots lalu mengembalikan analisis dan draft balasan', async () => {
        const fakeResult = {
            intent: 'reschedule',
            confidence: 0.99,
            preferred_day: 'sabtu',
            preferred_period: 'pagi',
            preferred_time: null,
            draft_reply: 'Halo, Kak! Ada slot di hari Sabtu 08:00 yaa',
        };
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => fakeResult,
        });
        const payload = {
            message: 'pindah Sabtu pagi yaa',
            slots: ['Sabtu 08:00', 'Minggu 09:00'],
        };

        const result = await getDraftReply(payload);

        expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:8000/draft-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        expect(result).toEqual({ error: false, data: fakeResult });
    });

    it('harus mengembalikan error true ketika ai-service gagal', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });

        const result = await getDraftReply({
            message: 'x',
            slots: []
        });
        
        expect(result).toEqual({ error: true, data: null });
    });
});