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
    // Satu slot umum per jam, jadi jenis sesi tidak perlu diisi lagi
    pgm.alterColumn('time_slots', 'session_type', { default: 'Gym' });

    // Slot hanya boleh tiap jam tepat, mulai 07:00 sampai 20:00 WIB, durasi 1 jam.
    // NOT VALID: data lama tidak dicek ulang, tapi semua slot baru wajib ikut aturan ini.
    pgm.sql(`
        ALTER TABLE time_slots ADD CONSTRAINT time_slots_hourly_rule CHECK (
            EXTRACT(HOUR FROM start_time AT TIME ZONE 'Asia/Jakarta') BETWEEN 7 AND 20
            AND date_trunc('hour', start_time) = start_time
            AND end_time = start_time + interval '1 hour'
        ) NOT VALID
    `);

    pgm.createIndex('time_slots', 'start_time', {
        name: 'unique_time_slots_start_time',
        unique: true,
    });

    // Customer tidak boleh booking slot yang sama dua kali
    pgm.createIndex('bookings', ['customer_id', 'slot_id'], {
        name: 'unique_active_booking_per_slot',
        unique: true,
        where: "status = 'active'",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropIndex('bookings', ['customer_id', 'slot_id'], { name: 'unique_active_booking_per_slot' });
    pgm.dropIndex('time_slots', 'start_time', { name: 'unique_time_slots_start_time' });
    pgm.dropConstraint('time_slots', 'time_slots_hourly_rule');
    pgm.alterColumn('time_slots', 'session_type', { default: null });
};
