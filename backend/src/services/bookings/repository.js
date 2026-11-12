import pkg from 'pg';

const { Pool } = pkg;

class BookingsRepository {
    constructor() {
        this.pool = new Pool();
    }

    async getActiveBookingsByCustomer(customerId) {
        const query = {
            text: `SELECT b.id, b.slot_id, ts.session_type, ts.start_time, ts.end_time
                FROM bookings b
                JOIN time_slots ts ON ts.id = b.slot_id
                WHERE b.customer_id = $1 AND b.status = 'active'
                ORDER BY ts.start_time`,
            values: [customerId],
        };

        const result = await this.pool.query(query);
        return result.rows;
    }
}

export default new BookingsRepository();
