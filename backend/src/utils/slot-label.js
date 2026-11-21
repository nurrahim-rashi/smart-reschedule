const TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Jakarta';

const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    timeZone: TIMEZONE,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: TIMEZONE,
});

// Tanggal lokal dalam format YYYY-MM-DD
const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIMEZONE,
});

// 2026-11-22T01:00:00Z -> "Minggu, 22 Nov 08:00" (zona waktu APP_TIMEZONE)
export const formatSlotLabel = (startTime) => {
    const date = new Date(startTime);
    return `${dayFormatter.format(date)}, ${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
};

// Bagian-bagian waktu lokal slot, dipakai untuk mencocokkan preferensi customer
export const getSlotParts = (startTime) => {
    const date = new Date(startTime);

    return {
        day: dayFormatter.format(date).toLowerCase(),
        dateKey: dateKeyFormatter.format(date),
        hour: Number(timeFormatter.format(date).split(':')[0]),
    };
};

export const getDateKey = (date) => dateKeyFormatter.format(date);

// "Minggu, 20 Des"
export const formatDateLabel = (date) => `${dayFormatter.format(date)}, ${dateFormatter.format(date)}`;
