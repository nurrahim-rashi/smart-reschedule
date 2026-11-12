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
    pgm.createTable('reply_drafts', {
        id: 'id',
        request_id: { type: 'INTEGER', notNull: true },
        draft_text: { type: 'TEXT', notNull: true },
        source: { type: 'VARCHAR(20)', notNull: true },
        needs_review: { type: 'BOOLEAN', notNull: true, default: true },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });

    pgm.addConstraint('reply_drafts', 'fk_reply_drafts.request_id_reschedule_requests.id', 'FOREIGN KEY(request_id) REFERENCES reschedule_requests(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('reply_drafts');
};
