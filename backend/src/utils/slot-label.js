const TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Jakarta';

const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    timeZone: TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: TIMEZONE,
});

// 2026-11-14T01:00:00Z -> "Sabtu 08:00" (zona waktu APP_TIMEZONE)
export const formatSlotLabel = (startTime) => {
    const date = new Date(startTime);
    return `${dayFormatter.format(date)} ${timeFormatter.format(date)}`;
};
