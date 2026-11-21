import { useEffect, useState } from "react";
import {
  getMyRescheduleRequests,
  getMyCancelledBookings,
} from "../utils/api.js";
import { paginate } from "../utils/pagination.js";
import Pagination from "../components/Pagination.jsx";

const PAGE_SIZE = 5;

const STATUS_BADGES = {
  pending: { label: "Pending", className: "badge-warning" },
  approved: { label: "Disetujui", className: "badge-success" },
  rejected: { label: "Ditolak", className: "badge-error" },
  cancelled: { label: "Dibatalkan", className: "badge-neutral" },
};

function formatDateTime(date) {
  return new Date(date).toLocaleString("id-ID");
}

function StatusBadge({ status }) {
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.pending;

  return (
    <div className={`badge ${badge.className}`}>
      {badge.label}
    </div>
  );
}

function RequestCard({ request }) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <h2 className="card-title">
              Request Reschedule #{request.id}
            </h2>

            <p className="text-sm text-base-content/60">
              Diajukan pada{" "}
              {formatDateTime(request.createdAt)}
            </p>
          </div>

          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm text-base-content/60">
              Jadwal Lama
            </p>

            <p className="font-medium">
              {request.oldSchedule}
            </p>
          </div>

          <div>
            <p className="text-sm text-base-content/60">
              Jadwal Baru
            </p>

            <p className="font-medium text-success">
              {request.newSchedule}
            </p>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div>
          <h3 className="font-semibold">
            Pesan Anda
          </h3>

          <p className="mt-1 whitespace-pre-line">
            {request.message}
          </p>
        </div>

        {request.status === "cancelled" && (
          <p className="text-sm text-base-content/60 mt-2">
            Request ini ditutup karena jadwal{" "}
            {request.oldSchedule} Anda batalkan.
          </p>
        )}

        {request.adminNote && (
          <>
            <div className="divider my-2"></div>

            <div>
              <h3 className="font-semibold">
                Catatan Admin
              </h3>

              <p className="mt-1 whitespace-pre-line">
                {request.adminNote}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CancellationCard({ booking }) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <h2 className="card-title">
              Pembatalan Jadwal
            </h2>

            {booking.cancelledAt && (
              <p className="text-sm text-base-content/60">
                Dibatalkan pada{" "}
                {formatDateTime(booking.cancelledAt)}
              </p>
            )}
          </div>

          <StatusBadge status="cancelled" />
        </div>

        <div className="mt-2">
          <p className="text-sm text-base-content/60">
            Jadwal yang dibatalkan
          </p>

          <p className="font-medium line-through opacity-70">
            {booking.schedule}
          </p>
        </div>
      </div>
    </div>
  );
}

function RequestStatusPage() {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [page, setPage] =
    useState(1);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const [requestsResult, cancelledResult] =
          await Promise.all([
            getMyRescheduleRequests(),
            getMyCancelledBookings(),
          ]);

        if (requestsResult.error || cancelledResult.error) {
          setErrorMessage(
            "Gagal memuat data request."
          );
        }

        // Gabungkan request reschedule dan pembatalan jadwal, terbaru di atas
        const history = [
          ...requestsResult.data.map((request) => ({
            type: "request",
            key: `request-${request.id}`,
            date: request.createdAt,
            data: request,
          })),
          ...cancelledResult.data.map((booking) => ({
            type: "cancellation",
            key: `cancellation-${booking.id}`,
            date: booking.cancelledAt,
            data: booking,
          })),
        ].sort(
          (a, b) =>
            new Date(b.date ?? 0) - new Date(a.date ?? 0)
        );

        setItems(history);
      } catch {
        setErrorMessage(
          "Terjadi kesalahan saat mengambil data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const { pageItems, currentPage, totalPages } =
    paginate(items, page, PAGE_SIZE);

  function onPageChange(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-success">
          Status Request
        </h1>

        <p className="text-base-content/60 mt-2">
          Pantau perkembangan request
          reschedule dan pembatalan jadwal Anda.
        </p>
      </div>

      {/* Error */}

      {errorMessage && (
        <div className="alert alert-error mb-6">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading */}

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((key) => (
            <div key={key} className="skeleton h-40 w-full"></div>
          ))}
        </div>
      )}

      {/* Empty State */}

      {!loading &&
        items.length === 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="alert alert-info">
                <span>
                  Belum ada request reschedule
                  atau pembatalan jadwal.
                </span>
              </div>
            </div>
          </div>
        )}

      {/* History */}

      {!loading &&
        items.length > 0 && (
          <div className="space-y-4">
            {pageItems.map((item) =>
              item.type === "request" ? (
                <RequestCard
                  key={item.key}
                  request={item.data}
                />
              ) : (
                <CancellationCard
                  key={item.key}
                  booking={item.data}
                />
              )
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
    </div>
  );
}

export default RequestStatusPage;
