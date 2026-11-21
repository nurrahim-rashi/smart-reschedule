import { useEffect, useState } from "react";
import {
  getRescheduleRequests,
  approveRescheduleRequest,
  rejectRescheduleRequest,
} from "../utils/api.js";

import RequestItem from "../components/RequestItem.jsx";
import Toast from "../components/Toast.jsx";

const TABS = [
  { status: "pending", label: "Pending" },
  { status: "approved", label: "Disetujui" },
  { status: "rejected", label: "Ditolak" },
];

const EMPTY_MESSAGES = {
  pending: "Tidak ada request yang menunggu persetujuan.",
  approved: "Belum ada request yang disetujui.",
  rejected: "Belum ada request yang ditolak.",
};

function AdminPage() {
  const [rescheduleRequests, setRescheduleRequests] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("pending");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
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

  // Request tidak dihapus dari daftar, hanya pindah ke tab sesuai status barunya
  function updateRequest(id, status, adminNote) {
    setRescheduleRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              adminNote,
              reviewedAt:
                new Date().toISOString(),
            }
          : request
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

    updateRequest(id, "approved", adminNote);
    setSuccessMessage(
      "Request disetujui, jadwal member sudah dipindah."
    );
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

    updateRequest(id, "rejected", adminNote);
    setSuccessMessage("Request ditolak.");
  }

  const countByStatus = (status) =>
    rescheduleRequests.filter(
      (request) => request.status === status
    ).length;

  const visibleRequests =
    rescheduleRequests.filter(
      (request) =>
        request.status === activeTab
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Toast
        message={errorMessage}
        type="error"
        onClose={() => setErrorMessage("")}
      />

      <Toast
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-success">
          Dashboard Admin
        </h1>

        <p className="text-base-content/60 mt-2">
          Kelola permintaan
          reschedule member.
        </p>
      </div>

      {/* Statistics */}

      <div className="stats stats-vertical md:stats-horizontal shadow w-full mb-8">
        <div className="stat">
          <div className="stat-title">
            Menunggu
          </div>

          <div className="stat-value text-warning">
            {loading ? "-" : countByStatus("pending")}
          </div>

          <div className="stat-desc">
            Perlu diputuskan
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            Disetujui
          </div>

          <div className="stat-value text-success">
            {loading ? "-" : countByStatus("approved")}
          </div>

          <div className="stat-desc">
            Jadwal sudah dipindah
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            Ditolak
          </div>

          <div className="stat-value text-error">
            {loading ? "-" : countByStatus("rejected")}
          </div>

          <div className="stat-desc">
            Termasuk yang dibatalkan member
          </div>
        </div>
      </div>

      {/* Tabs */}

      <div
        role="tablist"
        className="tabs tabs-box mb-6 w-fit"
      >
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            role="tab"
            onClick={() =>
              setActiveTab(tab.status)
            }
            className={`tab gap-2 ${
              activeTab === tab.status
                ? "tab-active"
                : ""
            }`}
          >
            {tab.label}

            {!loading && (
              <span className="badge badge-sm">
                {countByStatus(tab.status)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((key) => (
            <div
              key={key}
              className="skeleton h-56 w-full"
            ></div>
          ))}
        </div>
      )}

      {/* Empty State */}

      {!loading &&
        visibleRequests.length === 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="alert alert-info">
                <span>
                  {EMPTY_MESSAGES[activeTab]}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Request List */}

      {!loading &&
        visibleRequests.length > 0 && (
          <div className="space-y-4">
            {visibleRequests.map(
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
        )}
    </div>
  );
}

export default AdminPage;
