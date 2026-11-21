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
    pgm.addColumn('bookings', {
        cancelled_at: { type: 'TIMESTAMPTZ' },
    });

    // Data lama: request yang ditutup karena pembatalan sebelumnya tercatat sebagai 'rejected'
    // dengan keterangan di catatan admin. Sekarang cukup statusnya, catatan admin dikosongkan.
    pgm.sql(`
        UPDATE reschedule_requests
        SET status = 'cancelled', admin_note = NULL
        WHERE status = 'rejected' AND admin_note = 'Booking dibatalkan oleh member'
    `);

    pgm.sql(`
        UPDATE bookings b
        SET cancelled_at = COALESCE(
            (SELECT MAX(r.reviewed_at) FROM reschedule_requests r WHERE r.booking_id = b.id AND r.status = 'cancelled'),
            b.created_at
        )
        WHERE b.status = 'cancelled'
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        UPDATE reschedule_requests
        SET status = 'rejected', admin_note = 'Booking dibatalkan oleh member'
        WHERE status = 'cancelled'
    `);
    pgm.dropColumn('bookings', 'cancelled_at');
};
