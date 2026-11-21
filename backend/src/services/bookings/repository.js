import pkg from 'pg';
import { InvariantError } from "../../exceptions/index.js";

const { Pool } = pkg;

const UNIQUE_VIOLATION = '23505';

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

    async addBooking({ customerId, slotId }) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Kunci baris slot supaya dua booking bersamaan tidak melebihi kapasitas
            const slotResult = await client.query({
                text: `SELECT id, capacity, is_active, start_time > now() AS is_upcoming
                    FROM time_slots WHERE id = $1 FOR UPDATE`,
                values: [slotId],
            });

            const slot = slotResult.rows[0];
            if (!slot || !slot.is_active || !slot.is_upcoming) {
                throw new InvariantError('Slot tidak tersedia');
            }

            const countResult = await client.query({
                text: `SELECT COUNT(*)::int AS booked FROM bookings
                    WHERE slot_id = $1 AND status = 'active'`,
                values: [slotId],
            });

            if (countResult.rows[0].booked >= slot.capacity) {
                throw new InvariantError('Slot sudah penuh');
            }

            const result = await client.query({
                text: 'INSERT INTO bookings (customer_id, slot_id) VALUES ($1, $2) RETURNING id',
                values: [customerId, slotId],
            });

            await client.query('COMMIT');
            return result.rows[0].id;
        } catch (error) {
            await client.query('ROLLBACK');

            if (error.code === UNIQUE_VIOLATION) {
                throw new InvariantError('Anda sudah booking slot ini');
            }
            throw error;
        } finally {
            client.release();
        }
    }
}

export default new BookingsRepository();
