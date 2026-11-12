import pkg from 'pg';
import { InvariantError, NotFoundError } from "../../exceptions/index.js";

const { Pool } = pkg;

const UNIQUE_VIOLATION = '23505';

const REQUEST_COLUMNS = `
    r.id, r.customer_id, r.booking_id, r.message, r.status, r.admin_note,
    r.reviewed_at, r.created_at,
    old_ts.session_type, old_ts.start_time AS old_start_time,
    new_ts.start_time AS new_start_time
`;

const REQUEST_JOINS = `
    JOIN time_slots old_ts ON old_ts.id = r.old_slot_id
    JOIN time_slots new_ts ON new_ts.id = r.requested_slot_id
`;

class RescheduleRequestsRepository {
    constructor() {
        this.pool = new Pool();
    }

    async getBookingWithSlot(bookingId) {
        const query = {
            text: `SELECT b.id, b.customer_id, b.slot_id, b.status, ts.session_type, ts.start_time
                FROM bookings b
                JOIN time_slots ts ON ts.id = b.slot_id
                WHERE b.id = $1`,
            values: [bookingId],
        };

        const result = await this.pool.query(query);
        return result.rows[0] ?? null;
    }

    async getSlotWithRemaining(slotId, client = this.pool) {
        const query = {
            text: `SELECT ts.id, ts.session_type, ts.start_time, ts.is_active,
                    ts.start_time > now() AS is_upcoming,
                    ts.capacity - (
                        SELECT COUNT(*)::int FROM bookings b
                        WHERE b.slot_id = ts.id AND b.status = 'active'
                    ) AS remaining
                FROM time_slots ts
                WHERE ts.id = $1`,
            values: [slotId],
        };

        const result = await client.query(query);
        return result.rows[0] ?? null;
    }

    async addRequest({ customerId, bookingId, oldSlotId, requestedSlotId, message }) {
        const query = {
            text: `INSERT INTO reschedule_requests
                    (customer_id, booking_id, old_slot_id, requested_slot_id, message)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
            values: [customerId, bookingId, oldSlotId, requestedSlotId, message],
        };

        try {
            const result = await this.pool.query(query);
            return result.rows[0].id;
        } catch (error) {
            if (error.code === UNIQUE_VIOLATION) {
                throw new InvariantError('Booking ini masih punya request reschedule yang menunggu persetujuan');
            }
            throw error;
        }
    }

    async addAiResult(requestId, aiResult) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            await client.query({
                text: `INSERT INTO ai_analyses
                        (request_id, intent, confidence, preferred_day, preferred_period, preferred_time)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                values: [
                    requestId,
                    aiResult.intent,
                    aiResult.confidence,
                    aiResult.preferred_day,
                    aiResult.preferred_period,
                    aiResult.preferred_time,
                ],
            });

            await client.query({
                text: `INSERT INTO reply_drafts (request_id, draft_text, source, needs_review)
                    VALUES ($1, $2, $3, $4)`,
                values: [requestId, aiResult.draft_reply, aiResult.source, aiResult.needs_review],
            });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getRequestsByCustomer(customerId) {
        const query = {
            text: `SELECT ${REQUEST_COLUMNS}
                FROM reschedule_requests r
                ${REQUEST_JOINS}
                WHERE r.customer_id = $1
                ORDER BY r.created_at DESC`,
            values: [customerId],
        };

        const result = await this.pool.query(query);
        return result.rows;
    }

    async getRequests(status) {
        const query = {
            text: `SELECT ${REQUEST_COLUMNS},
                    u.name AS customer_name, u.phone AS customer_phone,
                    a.intent, a.confidence, a.preferred_day, a.preferred_period, a.preferred_time,
                    d.draft_text, d.source AS draft_source, d.needs_review
                FROM reschedule_requests r
                ${REQUEST_JOINS}
                JOIN users u ON u.id = r.customer_id
                LEFT JOIN ai_analyses a ON a.request_id = r.id
                LEFT JOIN LATERAL (
                    SELECT draft_text, source, needs_review FROM reply_drafts
                    WHERE request_id = r.id
                    ORDER BY created_at DESC
                    LIMIT 1
                ) d ON true
                WHERE ($1::request_status IS NULL OR r.status = $1)
                ORDER BY r.created_at DESC`,
            values: [status ?? null],
        };

        const result = await this.pool.query(query);
        return result.rows;
    }

    async approveRequest({ requestId, adminId, adminNote }) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const request = await this.lockPendingRequest(client, requestId);

            // Kunci baris slot supaya dua approval bersamaan tidak melebihi kapasitas
            await client.query({
                text: 'SELECT id FROM time_slots WHERE id = $1 FOR UPDATE',
                values: [request.requested_slot_id],
            });

            const slot = await this.getSlotWithRemaining(request.requested_slot_id, client);
            if (!slot.is_active || !slot.is_upcoming || slot.remaining <= 0) {
                throw new InvariantError('Slot yang diminta sudah penuh atau tidak tersedia');
            }

            const bookingResult = await client.query({
                text: `UPDATE bookings SET slot_id = $1
                    WHERE id = $2 AND status = 'active' AND slot_id = $3
                    RETURNING id`,
                values: [request.requested_slot_id, request.booking_id, request.old_slot_id],
            });

            if (!bookingResult.rows.length) {
                throw new InvariantError('Booking sudah dibatalkan atau jadwalnya sudah berubah');
            }

            await this.markReviewed(client, { requestId, status: 'approved', adminId, adminNote });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async rejectRequest({ requestId, adminId, adminNote }) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            await this.lockPendingRequest(client, requestId);
            await this.markReviewed(client, { requestId, status: 'rejected', adminId, adminNote });
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async lockPendingRequest(client, requestId) {
        const result = await client.query({
            text: 'SELECT * FROM reschedule_requests WHERE id = $1 FOR UPDATE',
            values: [requestId],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Request reschedule tidak ditemukan');
        }

        const request = result.rows[0];
        if (request.status !== 'pending') {
            throw new InvariantError(`Request ini sudah ${request.status}`);
        }

        return request;
    }

    async markReviewed(client, { requestId, status, adminId, adminNote }) {
        await client.query({
            text: `UPDATE reschedule_requests
                SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = now()
                WHERE id = $4`,
            values: [status, adminNote ?? null, adminId, requestId],
        });
    }
}

export default new RescheduleRequestsRepository();
