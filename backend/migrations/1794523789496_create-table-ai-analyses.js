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
    pgm.createTable('ai_analyses', {
        id: 'id',
        request_id: { type: 'INTEGER', notNull: true, unique: true },
        intent: { type: 'VARCHAR(50)', notNull: true },
        confidence: { type: 'REAL', notNull: true },
        preferred_day: { type: 'VARCHAR(20)' },
        preferred_period: { type: 'VARCHAR(20)' },
        preferred_time: { type: 'VARCHAR(20)' },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });

    pgm.addConstraint('ai_analyses', 'fk_ai_analyses.request_id_reschedule_requests.id', 'FOREIGN KEY(request_id) REFERENCES reschedule_requests(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('ai_analyses');
};
