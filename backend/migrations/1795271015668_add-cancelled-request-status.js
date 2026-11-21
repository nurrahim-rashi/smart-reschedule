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
    // Nilai enum baru harus di-commit dulu sebelum bisa dipakai migration berikutnya
    pgm.noTransaction();

    // Request yang ditutup karena member membatalkan jadwalnya
    pgm.addTypeValue('request_status', 'cancelled', { ifNotExists: true });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = () => {
    // PostgreSQL tidak bisa menghapus nilai enum. Data 'cancelled' dikembalikan
    // ke 'rejected' oleh migration berikutnya saat di-rollback.
};
