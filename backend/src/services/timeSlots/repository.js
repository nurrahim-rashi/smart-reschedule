import pkg from 'pg';

const { Pool } = pkg;

const TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Jakarta';
const SLOT_CAPACITY = Number(process.env.SLOT_CAPACITY) || 20;
const SLOT_DAYS_AHEAD = Number(process.env.SLOT_DAYS_AHEAD) || 14;

// Jam buka gym: slot pertama 07:00, slot terakhir 20:00 (selesai 21:00)
const FIRST_SLOT_HOUR = 7;
const LAST_SLOT_HOUR = 20;

class TimeSlotsRepository {
    constructor() {
        this.pool = new Pool();
    }

    async getTimeSlots() {
        const query = {
            text: 'SELECT id, start_time, end_time, session_type, capacity FROM time_slots WHERE is_active = true ORDER BY start_time',
        };

        const result = await this.pool.query(query);
        return result.rows;
    }

    /**
     * Pastikan slot tiap jam (07:00-21:00, durasi 1 jam) sudah ada untuk
     * hari ini sampai SLOT_DAYS_AHEAD hari ke depan. Slot yang sudah ada tidak diubah.
     */
    async ensureUpcomingSlots() {
        const query = {
            text: `INSERT INTO time_slots (start_time, end_time, session_type, capacity)
                SELECT slot_start, slot_start + interval '1 hour', 'Gym', $2
                FROM (
                    SELECT (day + make_interval(hours => hour)) AT TIME ZONE $1 AS slot_start
                    FROM generate_series(
                        date_trunc('day', now() AT TIME ZONE $1),
                        date_trunc('day', now() AT TIME ZONE $1) + make_interval(days => $3 - 1),
                        interval '1 day'
                    ) AS day,
                    generate_series($4::int, $5::int) AS hour
                ) AS slots
                WHERE slot_start > now()
                ON CONFLICT (start_time) DO NOTHING`,
            values: [TIMEZONE, SLOT_CAPACITY, SLOT_DAYS_AHEAD, FIRST_SLOT_HOUR, LAST_SLOT_HOUR],
        };

        const result = await this.pool.query(query);
        return result.rowCount;
    }

    async getAvailableTimeSlots() {
        const query = {
            text: `SELECT ts.id, ts.start_time, ts.end_time, ts.session_type,
                    ts.capacity - COUNT(b.id)::int AS remaining
                FROM time_slots ts
                LEFT JOIN bookings b ON b.slot_id = ts.id AND b.status = 'active'
                WHERE ts.is_active = true
                    AND ts.start_time > now()
                GROUP BY ts.id
                HAVING ts.capacity - COUNT(b.id) > 0
                ORDER BY ts.start_time`,
        };

        const result = await this.pool.query(query);
        return result.rows;
    }
}

export default new TimeSlotsRepository();
