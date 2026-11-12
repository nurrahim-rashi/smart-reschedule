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
    pgm.createTable('time_slots', {
        id: 'id',
        start_time: { type: 'TIMESTAMPTZ', notNull: true },
        end_time: { type: 'TIMESTAMPTZ', notNull: true },
        session_type: { type: 'VARCHAR(50)', notNull: true },
        capacity: { type: 'INTEGER', notNull: true },
        is_active: { type: 'BOOLEAN', notNull: true, default: true },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('time_slots');
};
