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
    pgm.createType('user_role', ['customer', 'admin']);

    pgm.createTable('users', {
        id: 'id',
        name: { type: 'VARCHAR(100)', notNull: true },
        phone: { type: 'VARCHAR(20)' },
        email: { type: 'VARCHAR(255)', unique: true },
        role: { type: 'user_role', notNull: true, default: 'customer' },
        password_hash: { type: 'TEXT' },
        created_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('users');
    pgm.dropType('user_role');
};
