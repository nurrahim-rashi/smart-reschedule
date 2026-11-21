import { useEffect, useState } from "react";
import {
  getMyRescheduleRequests,
} from "../utils/api.js";

function RequestStatusPage() {
  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const result =
          await getMyRescheduleRequests();

        if (result.error) {
          setErrorMessage(
            "Gagal memuat data request."
          );
          return;
        }

        setRequests(result.data);
      } catch {
        setErrorMessage(
          "Terjadi kesalahan saat mengambil data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  function renderBadge(status) {
    switch (status) {
      case "approved":
        return (
          <div className="badge badge-success">
            Disetujui
          </div>
        );

      case "rejected":
        return (
          <div className="badge badge-error">
            Ditolak
          </div>
        );

      default:
        return (
          <div className="badge badge-warning">
            Pending
          </div>
        );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-success">
          Status Request
        </h1>

        <p className="text-gray-500 mt-2">
          Pantau perkembangan request
          reschedule Anda.
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
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-success"></span>
        </div>
      )}

      {/* Empty State */}

      {!loading &&
        requests.length === 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="alert alert-info">
                <span>
                  Belum ada request
                  reschedule yang pernah
                  diajukan.
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Request List */}

      {!loading &&
        requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="card bg-base-100 shadow-lg"
              >
                <div className="card-body">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div>
                      <h2 className="card-title">
                        Request #
                        {request.id}
                      </h2>

                      <p className="text-sm text-gray-500">
                        Diajukan pada{" "}
                        {new Date(
                          request.createdAt
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>

                    {renderBadge(
                      request.status
                    )}
                  </div>

                  <div className="divider"></div>

                  <div>
                    <h3 className="font-semibold">
                      Pesan Member
                    </h3>

                    <p className="mt-1">
                      {request.message}
                    </p>
                  </div>

                  {request.adminNote && (
                    <>
                      <div className="divider"></div>

                      <div>
                        <h3 className="font-semibold">
                          Catatan Admin
                        </h3>

                        <p className="mt-1">
                          {
                            request.adminNote
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default RequestStatusPage;
