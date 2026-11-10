const currentBooking = {
    id: 1,
    sessionType: 'Yoga',
    schedule: 'Rabu 10:00',
};

const availableSlots = [
    'Sabtu 08:00',
    'Sabtu 10:00',
    'Minggu 09:00',
    'Minggu 16:00',
];

const rescheduleRequests = [
    {
        id: 1,
        sessionType: 'Yoga',
        oldSchedule: 'Rabu 10:00',
        newSchedule: 'Sabtu 08:00',
        message: 'Rabu aku ada keperluan, tolong pindah ke Sabtu pagi yaa',
        status: 'pending',
        adminNote: null,
        createdAt: '2026-11-10',
    },
    {
        id: 2,
        sessionType: 'Pilates',
        oldSchedule: 'Senin 15:00',
        newSchedule: 'Kamis 15:00',
        message: 'Bisa geser ke Kamis sore?',
        status: 'approved',
        adminNote: 'Okayy! sudah dipindah ke Kamis 15:00',
        createdAt: '2026-11-05',
    },
    {
        id: 3,
        sessionType: 'Zumba',
        oldSchedule: 'Jumat 18:00',
        newSchedule: 'Jumat 09:00',
        message: 'Mau pindah ke jam 9 pagi untuk hari inii',
        status: 'rejected',
        adminNote: 'Sorry banget kakk, tapi untuk slot jam 09:00 sudah penuh',
        createdAt: '2026-11-01',
    },
];

export { currentBooking, availableSlots, rescheduleRequests };