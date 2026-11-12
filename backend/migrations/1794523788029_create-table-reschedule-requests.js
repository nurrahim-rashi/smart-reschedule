/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createType('request_status', ['pending', 'approved', 'rejected']);

    pgm.createTable('reschedule_requests', {
        id: 'id',
        customer_id: { type: 'INTEGER', notNull: true },
        booking_id: { type: 'INTEGER', notNull: true },
        old_slot_id: { type: 'INTEGER', notNull: true },
        requested_slot_id: { type: 'INTEGER', notNull: true },
        message: { type: 'TEXT', notNull: true },
        status: { type: 'request_status', notNull: true, default: 'pending' },
        admin_note: { type: 'TEXT' },
        reviewed_by: { type: 'INTEGER' },
        reviewed_at: { type: 'TIMESTAMPTZ' },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });

    pgm.addConstraint('reschedule_requests', 'fk_reschedule_requests.customer_id_users.id', 'FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE');
    pgm.addConstraint('reschedule_requests', 'fk_reschedule_requests.booking_id_bookings.id', 'FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE');
    pgm.addConstraint('reschedule_requests', 'fk_reschedule_requests.old_slot_id_time_slots.id', 'FOREIGN KEY(old_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE');
    pgm.addConstraint('reschedule_requests', 'fk_reschedule_requests.requested_slot_id_time_slots.id', 'FOREIGN KEY(requested_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE');
    pgm.addConstraint('reschedule_requests', 'fk_reschedule_requests.reviewed_by_users.id', 'FOREIGN KEY(reviewed_by) REFERENCES users(id) ON DELETE SET NULL');

    // Satu booking hanya boleh punya satu request yang masih pending
    pgm.createIndex('reschedule_requests', 'booking_id', {
        name: 'unique_pending_request_per_booking',
        unique: true,
        where: "status = 'pending'",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('reschedule_requests');
    pgm.dropType('request_status');
};
