import { useEffect, useState } from "react";
import {
  getRescheduleRequests,
  approveRescheduleRequest,
  rejectRescheduleRequest,
} from "../utils/api.js";

import RequestItem from "../components/RequestItem.jsx";

function AdminPage() {
  const [rescheduleRequests, setRescheduleRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const result =
          await getRescheduleRequests();

        if (result.error) {
          setErrorMessage(
            "Gagal memuat data request."
          );
          return;
        }

        setRescheduleRequests(
          result.data
        );
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

  function removeRequest(id) {
    setRescheduleRequests((prev) =>
      prev.filter(
        (request) =>
          request.id !== id
      )
    );
  }

  async function onApproveHandler(
    id,
    adminNote
  ) {
    setErrorMessage("");

    const result =
      await approveRescheduleRequest(
        id,
        adminNote
      );

    if (result.error) {
      setErrorMessage(
        result.message
      );
      return;
    }

    removeRequest(id);
  }

  async function onRejectHandler(
    id,
    adminNote
  ) {
    setErrorMessage("");

    const result =
      await rejectRescheduleRequest(
        id,
        adminNote
      );

    if (result.error) {
      setErrorMessage(
        result.message
      );
      return;
    }

    removeRequest(id);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-success">
          Dashboard Admin
        </h1>

        <p className="text-gray-500 mt-2">
          Kelola permintaan
          reschedule member.
        </p>
      </div>

      {/* Statistics */}

      <div className="stats shadow w-full mb-8">
        <div className="stat">
          <div className="stat-title">
            Request Pending
          </div>

          <div className="stat-value text-warning">
            {
              rescheduleRequests.length
            }
          </div>

          <div className="stat-desc">
            Menunggu persetujuan
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            AI Assistant
          </div>

          <div className="stat-value text-success">
            Aktif
          </div>

          <div className="stat-desc">
            Smart Reschedule
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            Sistem
          </div>

          <div className="stat-value text-primary">
            Online
          </div>

          <div className="stat-desc">
            GymSync
          </div>
        </div>
      </div>

      {/* Error */}

      {errorMessage && (
        <div className="alert alert-error mb-6">
          <span>
            {errorMessage}
          </span>
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
        rescheduleRequests.length ===
          0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="alert alert-info">
                <span>
                  Tidak ada request
                  yang menunggu
                  persetujuan.
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Request List */}

      {!loading &&
        rescheduleRequests.length >
          0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Request Pending
            </h2>

            <div className="space-y-4">
              {rescheduleRequests.map(
                (request) => (
                  <div
                    key={request.id}
                    className="card bg-base-100 shadow-lg"
                  >
                    <div className="card-body">
                      <RequestItem
                        request={
                          request
                        }
                        onApprove={
                          onApproveHandler
                        }
                        onReject={
                          onRejectHandler
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
    </div>
  );
}

export default AdminPage;
