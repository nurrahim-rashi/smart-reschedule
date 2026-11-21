/**
 * Ambil isi satu halaman dari sebuah daftar.
 * Halaman di luar jangkauan otomatis dipindah ke halaman terdekat,
 * misalnya setelah item terakhir di halaman terakhir dihapus.
 */
function paginate(items, page, pageSize) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;

    return {
        pageItems: items.slice(start, start + pageSize),
        currentPage,
        totalPages,
    };
}

export { paginate };
