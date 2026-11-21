import { describe, it, expect, vi, afterEach } from 'vitest';
import { getAvailableSlots, getRecommendedSlots, addBooking, cancelBooking, generateDecisionDraft } from './api.js';

function mockFetch(responseJson) {
    return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => responseJson,
    });
}

// api.js membaca token dari localStorage, yang tidak ada di lingkungan test Node
globalThis.localStorage = {
    getItem: () => 'token-test',
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getAvailableSlots', () => {
    it('harus mengambil semua slot tersedia tanpa filter jenis sesi', async () => {
        const timeSlots = [{ id: 1, label: 'Sabtu, 28 Nov 08:00' }];
        const fetchSpy = mockFetch({ status: 'success', data: { timeSlots } });

        const result = await getAvailableSlots();

        expect(fetchSpy.mock.calls[0][0]).toBe('http://localhost:5000/time-slots/available');
        expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe('Bearer token-test');
        expect(result).toEqual({ error: false, data: timeSlots });
    });
});

describe('getRecommendedSlots', () => {
    it('harus mengirim preferensi sebagai query dan melewati nilai kosong', async () => {
        const data = { matched: [{ id: 2 }], alternatives: [{ id: 3, reason: 'Slot terdekat' }] };
        const fetchSpy = mockFetch({ status: 'success', data });

        const result = await getRecommendedSlots({
            day: 'sabtu',
            period: 'pagi',
            time: null,
            excludeSlotId: 7,
        });

        const url = new URL(fetchSpy.mock.calls[0][0]);
        expect(url.pathname).toBe('/time-slots/recommendations');
        expect(Object.fromEntries(url.searchParams)).toEqual({
            day: 'sabtu',
            period: 'pagi',
            excludeSlotId: '7',
        });
        expect(result).toEqual({ error: false, data });
    });

    it('harus mengembalikan daftar kosong kalau backend gagal', async () => {
        mockFetch({ status: 'fail', message: 'error' });

        const result = await getRecommendedSlots({});

        expect(result).toEqual({ error: true, data: { matched: [], alternatives: [] } });
    });
});

describe('addBooking', () => {
    it('harus mengirim slotId dan mengembalikan bookingId', async () => {
        const fetchSpy = mockFetch({ status: 'success', data: { bookingId: 5 } });

        const result = await addBooking(3);

        expect(fetchSpy.mock.calls[0][0]).toBe('http://localhost:5000/bookings');
        expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
        expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toEqual({ slotId: 3 });
        expect(result).toEqual({ error: false, data: { bookingId: 5 } });
    });

    it('harus meneruskan pesan error dari backend, misalnya slot penuh', async () => {
        mockFetch({ status: 'fail', message: 'Slot sudah penuh' });

        const result = await addBooking(3);

        expect(result).toEqual({ error: true, message: 'Slot sudah penuh' });
    });
});

describe('cancelBooking', () => {
    it('harus memanggil endpoint cancel untuk booking yang dipilih', async () => {
        const fetchSpy = mockFetch({ status: 'success', data: { closedRequests: 1 } });

        const result = await cancelBooking(9);

        expect(fetchSpy.mock.calls[0][0]).toBe('http://localhost:5000/bookings/9/cancel');
        expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
        expect(result).toEqual({ error: false, data: { closedRequests: 1 } });
    });

    it('harus meneruskan pesan error, misalnya jadwal sudah berjalan', async () => {
        mockFetch({ status: 'fail', message: 'Jadwal yang sudah berjalan tidak bisa dibatalkan' });

        const result = await cancelBooking(9);

        expect(result).toEqual({ error: true, message: 'Jadwal yang sudah berjalan tidak bisa dibatalkan' });
    });
});

describe('generateDecisionDraft', () => {
    it('harus mengirim keputusan dan alasan lalu mengembalikan draf', async () => {
        const data = {
            draftReply: { text: 'Maaf Kak, slot penuh.', source: 'gemini', needsReview: false },
            alternatives: ['Minggu, 29 Nov 08:00'],
        };
        const fetchSpy = mockFetch({ status: 'success', data });

        const result = await generateDecisionDraft(4, { decision: 'rejected', reason: 'slot penuh' });

        expect(fetchSpy.mock.calls[0][0]).toBe('http://localhost:5000/reschedule-requests/4/decision-draft');
        expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toEqual({ decision: 'rejected', reason: 'slot penuh' });
        expect(result).toEqual({ error: false, data });
    });

    it('harus meneruskan pesan error kalau AI tidak tersedia', async () => {
        mockFetch({ status: 'fail', message: 'Layanan AI sedang tidak tersedia' });

        const result = await generateDecisionDraft(4, { decision: 'approved' });

        expect(result).toEqual({ error: true, message: 'Layanan AI sedang tidak tersedia' });
    });
});
