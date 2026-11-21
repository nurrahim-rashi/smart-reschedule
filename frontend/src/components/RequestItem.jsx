import { useState } from "react";
import { showFormattedDate } from "../utils/date.js";
import { generateDecisionDraft } from "../utils/api.js";

const STATUS_BADGES = {
  pending: { label: "Menunggu Persetujuan", className: "badge-warning" },
  approved: { label: "Disetujui", className: "badge-success" },
  rejected: { label: "Ditolak", className: "badge-error" },
  cancelled: { label: "Dibatalkan Member", className: "badge-neutral" },
};

const INTENT_LABELS = {
  reschedule: "Reschedule",
  cancel: "Pembatalan",
  schedule_inquiry: "Tanya Jadwal",
  confirmation: "Konfirmasi",
  other: "Lainnya",
};

function RequestItem({
  request,
  onApprove,
  onReject,
}) {
  const [adminNote, setAdminNote] =
    useState("");

  const [rejectReason, setRejectReason] =
    useState("");

  const [draftSource, setDraftSource] =
    useState(null);

  const [generating, setGenerating] =
    useState(null);

  const [draftError, setDraftError] =
    useState("");

  const analysis = request.aiAnalysis;
  const isPending = request.status === "pending";
  const statusBadge = STATUS_BADGES[request.status];

  async function onGenerateDraft(decision) {
    setGenerating(decision);
    setDraftError("");

    const result =
      await generateDecisionDraft(
        request.id,
        {
          decision,
          reason:
            decision === "rejected"
              ? rejectReason
              : undefined,
        }
      );

    setGenerating(null);

    if (result.error) {
      setDraftError(result.message);
      return;
    }

    setAdminNote(
      result.data.draftReply.text
    );
    setDraftSource(
      result.data.draftReply.source
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h3 className="text-xl font-semibold">
            {request.customer.name}
          </h3>

          <p className="text-base-content/60">
            {request.sessionType}
          </p>
        </div>

        <div className={`badge badge-lg ${statusBadge.className}`}>
          {statusBadge.label}
        </div>
      </div>

      <div className="divider my-3"></div>

      <div className="grid md:grid-cols-2 gap-4">
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

      <div className="mt-4">
        <p className="text-sm text-base-content/60 mb-1">
          Pesan Member
        </p>

        <div className="bg-base-200 rounded-lg p-3 whitespace-pre-line">
          {request.message}
        </div>
      </div>

      {analysis ? (
        <div className="mt-4">
          <p className="text-sm text-base-content/60 mb-1">
            Hasil Analisis AI
          </p>

          <div className="flex flex-wrap gap-2">
            <div
              className={`badge ${
                analysis.intent === "reschedule"
                  ? "badge-success"
                  : "badge-warning"
              }`}
            >
              {INTENT_LABELS[analysis.intent] ??
                analysis.intent}{" "}
              ({Math.round(analysis.confidence * 100)}%)
            </div>

            <div className="badge badge-outline">
              Hari: {analysis.preferredDay || "-"}
            </div>

            <div className="badge badge-outline">
              Waktu: {analysis.preferredPeriod || "-"}
            </div>

            <div className="badge badge-outline">
              Jam: {analysis.preferredTime || "-"}
            </div>
          </div>

          {analysis.intent !== "reschedule" && (
            <p className="text-sm text-warning mt-2">
              AI membaca pesan ini bukan sebagai
              permintaan reschedule. Cek pesan
              member sebelum memutuskan.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-base-content/60">
          Analisis AI tidak tersedia untuk
          request ini.
        </p>
      )}

      {isPending ? (
        <div className="mt-4">
          <p className="text-sm text-base-content/60 mb-2">
            Catatan Admin
          </p>

          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <button
              type="button"
              className="btn btn-sm btn-outline btn-success"
              disabled={generating !== null}
              onClick={() =>
                onGenerateDraft("approved")
              }
            >
              {generating === "approved" && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              Draf AI: Setujui
            </button>

            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              placeholder="Alasan menolak (opsional), mis. slot penuh"
              value={rejectReason}
              onChange={(event) =>
                setRejectReason(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              className="btn btn-sm btn-outline btn-error"
              disabled={generating !== null}
              onClick={() =>
                onGenerateDraft("rejected")
              }
            >
              {generating === "rejected" && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              Draf AI: Tolak + Alternatif
            </button>
          </div>

          {draftError && (
            <p className="text-sm text-error mb-2">
              {draftError}
            </p>
          )}

          <textarea
            className="textarea textarea-bordered w-full whitespace-pre-line"
            rows="6"
            placeholder="Tulis catatan untuk member, atau buat draf dengan AI di atas..."
            value={adminNote}
            onChange={(event) =>
              setAdminNote(event.target.value)
            }
          />

          {draftSource && (
            <p className="text-xs text-base-content/60 mt-1">
              {draftSource === "gemini"
                ? "Draf dibuat AI dan sudah dicek hanya menyebut slot dari database. Silakan edit sebelum mengirim."
                : "AI sedang tidak tersedia, draf diisi dari template. Silakan edit sebelum mengirim."}
            </p>
          )}
        </div>
      ) : request.status === "cancelled" ? (
        <p className="mt-4 text-sm text-base-content/60">
          Member membatalkan jadwal {request.oldSchedule} sebelum
          request ini diputuskan.
        </p>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-base-content/60 mb-1">
            Catatan Admin
          </p>

          <div className="bg-base-200 rounded-lg p-3 whitespace-pre-line">
            {request.adminNote || "-"}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-base-content/60">
        Diajukan pada{" "}
        {showFormattedDate(
          request.createdAt
        )}

        {request.reviewedAt && (
          <>
            {" "}·{" "}
            {request.status === "cancelled"
              ? "Dibatalkan pada"
              : "Diputuskan pada"}{" "}
            {showFormattedDate(
              request.reviewedAt
            )}
          </>
        )}
      </div>

      {isPending && (
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <button
            type="button"
            className="btn btn-success flex-1"
            onClick={() =>
              onApprove(
                request.id,
                adminNote
              )
            }
          >
            Setujui
          </button>

          <button
            type="button"
            className="btn btn-error flex-1"
            onClick={() =>
              onReject(
                request.id,
                adminNote
              )
            }
          >
            Tolak
          </button>
        </div>
      )}
    </div>
  );
}

export default RequestItem;
