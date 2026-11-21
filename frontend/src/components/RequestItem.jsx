import { useState } from "react";
import { showFormattedDate } from "../utils/date.js";

function RequestItem({
  request,
  onApprove,
  onReject,
}) {
  const [adminNote, setAdminNote] =
    useState("");

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h3 className="text-xl font-semibold">
            {request.customer.name}
          </h3>

          <p className="text-gray-500">
            {request.sessionType}
          </p>
        </div>

        <div className="badge badge-warning badge-lg">
          Menunggu Persetujuan
        </div>
      </div>

      <div className="divider my-3"></div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Jadwal Lama
          </p>

          <p className="font-medium">
            {request.oldSchedule}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Jadwal Baru
          </p>

          <p className="font-medium text-green-700">
            {request.newSchedule}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-1">
          Pesan Member
        </p>

        <div className="bg-base-200 rounded-lg p-3">
          {request.message}
        </div>
      </div>

      {request.aiAnalysis && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">
            Hasil Analisis AI
          </p>

          <div className="badge badge-success">
            {request.aiAnalysis.intent}
          </div>
        </div>
      )}

      {request.draftReply && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">
            Draft Balasan AI
          </p>

          <textarea
            className="textarea textarea-bordered w-full"
            value={request.draftReply.text}
            readOnly
          />
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">
          Catatan Admin
        </p>

        <textarea
          className="textarea textarea-bordered w-full"
          rows="3"
          placeholder="Tambahkan catatan untuk member (opsional)..."
          value={adminNote}
          onChange={(event) =>
            setAdminNote(event.target.value)
          }
        />
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Diajukan pada{" "}
        {showFormattedDate(
          request.createdAt
        )}
      </div>

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
    </div>
  );
}

export default RequestItem;
