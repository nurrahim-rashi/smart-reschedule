import pkg from 'pg';

const { Pool } = pkg;

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

    async getAvailableTimeSlots(sessionType) {
        const query = {
            text: `SELECT ts.id, ts.start_time, ts.end_time, ts.session_type,
                    ts.capacity - COUNT(b.id)::int AS remaining
                FROM time_slots ts
                LEFT JOIN bookings b ON b.slot_id = ts.id AND b.status = 'active'
                WHERE ts.is_active = true
                    AND ts.start_time > now()
                    AND ($1::varchar IS NULL OR ts.session_type = $1)
                GROUP BY ts.id
                HAVING ts.capacity - COUNT(b.id) > 0
                ORDER BY ts.start_time`,
            values: [sessionType ?? null],
        };

        const result = await this.pool.query(query);
        return result.rows;
    }
}

export default new TimeSlotsRepository();