import { useEffect, useState } from "react";

import {
  getMyBookings,
  getAvailableSlots,
  addRescheduleRequests,
} from "../utils/api.js";

function ReschedulePage() {
  const [booking, setBooking] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [timeSlots, setTimeSlots] =
    useState([]);

  const [selectedSlot, setSelectedSlot] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function fetchBooking() {
      const result =
        await getMyBookings();

      if (!result.error &&
          result.data.length > 0) {
        const firstBooking =
          result.data[0];

        setBooking(firstBooking);

        const slotsResult =
          await getAvailableSlots(
            firstBooking.sessionType
          );

        if (!slotsResult.error) {
          setTimeSlots(
            slotsResult.data
          );
        }
      }
    }

    fetchBooking();
  }, []);

  async function analyzeMessage() {
    if (!message.trim()) {
      setErrorMessage(
        "Masukkan pesan terlebih dahulu."
      );
      return;
    }

    setAnalyzing(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/analyze-message",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message,
          }),
        }
      );

      const result =
        await response.json();

      setAnalysis(result);
    } catch {
      setErrorMessage(
        "Gagal menganalisis pesan."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function submitRequest() {
    if (!selectedSlot) {
      setErrorMessage(
        "Pilih slot terlebih dahulu."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const slot = timeSlots.find(
      (item) =>
        item.label === selectedSlot
    );

    const result =
      await addRescheduleRequests({
        bookingId: booking.id,
        requestedSlotId: slot.id,
        message,
      });

    setLoading(false);

    if (result.error) {
      setErrorMessage(
        result.message
      );
      return;
    }

    setSuccessMessage(
      "Request reschedule berhasil dikirim."
    );

    setMessage("");
    setSelectedSlot("");
    setAnalysis(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold text-success">
        Ajukan Reschedule
      </h1>

      <p className="text-gray-500 mt-2 mb-6">
        Kirim permintaan perubahan
        jadwal latihan Anda.
      </p>

      {/* Booking */}

      {booking ? (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title">
              Booking Saat Ini
            </h2>

            <p>
              {booking.sessionType}
            </p>

            <p>
              {booking.schedule}
            </p>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-6">
          <span>
            Anda belum memiliki
            booking aktif.
          </span>
        </div>
      )}

      {/* Error */}

      {errorMessage && (
        <div className="alert alert-error mb-6">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success */}

      {successMessage && (
        <div className="alert alert-success mb-6">
          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* Message */}

      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title">
            Pesan Reschedule
          </h2>

          <textarea
            className="textarea textarea-bordered h-32"
            placeholder="Contoh: Besok saya tidak bisa hadir, ingin pindah ke Sabtu pagi."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
          />

          <button
            onClick={analyzeMessage}
            disabled={analyzing}
            className="btn btn-primary mt-4"
          >
            {analyzing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Menganalisis...
              </>
            ) : (
              "Analisis dengan AI"
            )}
          </button>
        </div>
      </div>

      {/* Analysis */}

      {analysis && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title">
              Hasil Analisis AI
            </h2>

            <p>
              <strong>Intent:</strong>{" "}
              {analysis.intent}
            </p>

            {analysis.entities && (
              <>
                <p>
                  <strong>Hari:</strong>{" "}
                  {analysis.entities
                    ?.preferred_day ||
                    "-"}
                </p>

                <p>
                  <strong>Periode:</strong>{" "}
                  {analysis.entities
                    ?.preferred_period ||
                    "-"}
                </p>
              </>
            )}

            {analysis.draft_reply && (
              <>
                <div className="divider"></div>

                <div>
                  <h3 className="font-semibold">
                    Draft Balasan
                  </h3>

                  <p className="mt-2">
                    {
                      analysis.draft_reply
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Slots */}

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">
            Slot Tersedia
          </h2>

          <select
            className="select select-bordered w-full"
            value={selectedSlot}
            onChange={(e) =>
              setSelectedSlot(
                e.target.value
              )
            }
          >
            <option value="">
              Pilih slot
            </option>

            {timeSlots.map((slot) => (
              <option
                key={slot.id}
                value={slot.label}
              >
                {slot.label}
              </option>
            ))}
          </select>

          <button
            onClick={submitRequest}
            disabled={
              loading ||
              !selectedSlot
            }
            className="btn btn-success mt-4"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Mengirim...
              </>
            ) : (
              "Ajukan Reschedule"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReschedulePage;
