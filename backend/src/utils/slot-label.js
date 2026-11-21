const DEFAULT_TIMEZONE = 'Asia/Jakarta';

// Nilai env bisa membawa spasi/baris baru saat di-paste ke dashboard hosting;
// zona yang tidak dikenali memakai default alih-alih membuat server crash
const resolveTimezone = () => {
    const timezone = (process.env.APP_TIMEZONE || '').trim() || DEFAULT_TIMEZONE;

    try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        return timezone;
    } catch {
        console.error(`APP_TIMEZONE tidak valid (${JSON.stringify(process.env.APP_TIMEZONE)}), memakai ${DEFAULT_TIMEZONE}`);
        return DEFAULT_TIMEZONE;
    }
};

export const TIMEZONE = resolveTimezone();

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
