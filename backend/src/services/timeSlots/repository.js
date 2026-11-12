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
}

export default new TimeSlotsRepository();