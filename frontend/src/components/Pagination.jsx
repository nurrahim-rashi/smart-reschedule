// Navigasi halaman: « 1 2 3 », tidak tampil kalau hanya ada 1 halaman
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex justify-center mt-4">
      <div className="join">
        <button
          type="button"
          className="join-item btn btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman sebelumnya"
        >
          «
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`join-item btn btn-sm ${
              page === currentPage ? "btn-success" : ""
            }`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="join-item btn btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman berikutnya"
        >
          »
        </button>
      </div>
    </div>
  );
}

export default Pagination;
