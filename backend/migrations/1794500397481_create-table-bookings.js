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
    pgm.createType('booking_status', ['active', 'cancelled']);

    pgm.createTable('bookings', {
        id: 'id',
        customer_id: { type: 'INTEGER', notNull: true },
        slot_id: { type: 'INTEGER', notNull: true },
        status: { type: 'booking_status', notNull: true, default: 'active' },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });

    pgm.addConstraint('bookings', 'fk_bookings.customer_id_users.id', 'FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE');
    pgm.addConstraint('bookings', 'fk_bookings.slot_id_time_slots.id', 'FOREIGN KEY(slot_id) REFERENCES time_slots(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('bookings');
    pgm.dropType('booking_status');
};
