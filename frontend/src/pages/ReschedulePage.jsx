import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SlotPicker from "../components/SlotPicker.jsx";
import Toast from "../components/Toast.jsx";
import { analyzeMessage } from "../utils/ai.js";
import {
  getMyBookings,
  getAvailableSlots,
  getRecommendedSlots,
  addRescheduleRequests,
  cancelBooking,
} from "../utils/api.js";

function SlotOption({ slot, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={`btn h-auto py-3 justify-between w-full ${
        selected ? "btn-success" : "btn-ghost border-base-300"
      }`}
    >
      <span className="font-semibold">{slot.label}</span>

      {slot.reason && (
        <span className={`badge ${selected ? "badge-ghost" : "badge-outline"}`}>
          {slot.reason}
        </span>
      )}
    </button>
  );
}

function ReschedulePage() {
  const [bookings, setBookings] = useState([]);
  const [booking, setBooking] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [initializing, setInitializing] = useState(true);

  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [bookingsResult, slotsResult] = await Promise.all([
        getMyBookings(),
        getAvailableSlots(),
      ]);

      setBookings(bookingsResult.data);
      setBooking(bookingsResult.data[0] ?? null);
      setTimeSlots(slotsResult.data);
      setInitializing(false);
    }

    fetchData();
  }, []);

  function resetSelection() {
    setAnalysis(null);
    setRecommendation(null);
    setSelectedSlot(null);
  }

  async function onAnalyze() {
    if (!message.trim()) {
      setErrorMessage("Masukkan pesan terlebih dahulu.");
      return;
    }

    setAnalyzing(true);
    setErrorMessage("");
    setSuccessMessage("");
    resetSelection();

    try {
      const result = await analyzeMessage(message);

      if (result.error) {
        setErrorMessage("Gagal menganalisis pesan. Coba lagi nanti.");
        return;
      }

      setAnalysis(result.data);

      const recommendationResult = await getRecommendedSlots({
        day: result.data.preferred_day,
        period: result.data.preferred_period,
        time: result.data.preferred_time,
        excludeSlotId: booking.slotId,
      });

      setRecommendation(recommendationResult.data);
    } catch {
      setErrorMessage("Tidak bisa terhubung ke layanan AI.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function submitRequest() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await addRescheduleRequests({
      bookingId: booking.id,
      requestedSlotId: selectedSlot.id,
      message,
    });

    setLoading(false);

    if (result.error) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(
      `Request pindah ke ${selectedSlot.label} berhasil dikirim. Tunggu persetujuan admin.`
    );
    setMessage("");
    resetSelection();
  }

  async function onCancelBooking() {
    if (!window.confirm(`Batalkan jadwal ${booking.schedule}?`)) {
      return;
    }

    setCancelling(true);
    setErrorMessage("");

    const result = await cancelBooking(booking.id);

    setCancelling(false);

    if (result.error) {
      setErrorMessage(result.message);
      return;
    }

    const remaining = bookings.filter((item) => item.id !== booking.id);

    setSuccessMessage(`Jadwal ${booking.schedule} berhasil dibatalkan.`);
    setBookings(remaining);
    setBooking(remaining[0] ?? null);
    setMessage("");
    resetSelection();
  }

  if (initializing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="skeleton h-10 w-72"></div>
        <div className="skeleton h-28 w-full"></div>
        <div className="skeleton h-48 w-full"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Toast
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />

        <h1 className="text-4xl font-bold text-success">Ajukan Reschedule</h1>

        <div className="alert alert-warning mt-6">
          <span>Anda belum memiliki jadwal. Booking jadwal pertama Anda dulu.</span>

          <Link to="/booking" className="btn btn-sm btn-success">
            Booking Jadwal
          </Link>
        </div>
      </div>
    );
  }

  const otherSlots = timeSlots.filter((slot) => slot.id !== booking.slotId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold text-success">Ajukan Reschedule</h1>

      <p className="text-base-content/60 mt-2 mb-6">
        Ceritakan jadwal yang Anda inginkan, AI akan mencarikan slot yang cocok.
      </p>

      <Toast
        message={errorMessage}
        type="error"
        onClose={() => setErrorMessage("")}
      />

      <Toast
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {/* Booking */}

      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title">Jadwal Saat Ini</h2>

          {bookings.length > 1 ? (
            <select
              className="select select-bordered w-full"
              value={booking.id}
              onChange={(e) => {
                setBooking(bookings.find((item) => item.id === Number(e.target.value)));
                resetSelection();
              }}
            >
              {bookings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.schedule}
                </option>
              ))}
            </select>
          ) : (
            <p>{booking.schedule}</p>
          )}
        </div>
      </div>

      {/* Message */}

      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title">Pesan Reschedule</h2>

          <textarea
            className="textarea textarea-bordered h-32 w-full"
            placeholder="Contoh: Besok saya tidak bisa hadir, ingin pindah ke Sabtu pagi."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={onAnalyze}
            disabled={analyzing}
            className="btn btn-primary mt-4"
          >
            {analyzing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Menganalisis...
              </>
            ) : (
              "Cari Slot dengan AI"
            )}
          </button>
        </div>
      </div>

      {/* Analysis */}

      {analysis && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title">Hasil Analisis AI</h2>

            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary">
                Intent: {analysis.intent}
                {analysis.intent_source === "keyword" && " (dari kata kunci)"}
              </span>
              <span className="badge badge-outline">Hari: {analysis.preferred_day || "-"}</span>
              <span className="badge badge-outline">Waktu: {analysis.preferred_period || "-"}</span>
              <span className="badge badge-outline">Jam: {analysis.preferred_time || "-"}</span>
            </div>

            {analysis.intent === "cancel" && (
              <div className="alert alert-warning mt-4">
                <span>
                  Sepertinya Anda ingin membatalkan jadwal {booking.schedule}.
                </span>

                <button
                  onClick={onCancelBooking}
                  disabled={cancelling}
                  className="btn btn-sm btn-error"
                >
                  {cancelling ? "Membatalkan..." : "Batalkan Jadwal Ini"}
                </button>
              </div>
            )}

            {analysis.intent !== "reschedule" && analysis.intent !== "cancel" && (
              <div className="alert alert-info mt-4">
                <span>
                  Pesan ini tidak terbaca sebagai permintaan reschedule, tapi Anda
                  tetap bisa memilih slot di bawah.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendation */}

      {recommendation && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title">Rekomendasi Slot</h2>

            {recommendation.assumedHour != null && (
              <p className="text-sm text-base-content/60">
                Jam tidak disebut, jadi kami pakai jam jadwal Anda sekarang (
                {String(recommendation.assumedHour).padStart(2, "0")}:00).
              </p>
            )}

            {recommendation.matched.length > 0 ? (
              <>
                <p className="text-sm opacity-70">Sesuai permintaan Anda</p>

                <div className="grid gap-2">
                  {recommendation.matched.map((slot) => (
                    <SlotOption
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot?.id === slot.id}
                      onSelect={setSelectedSlot}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="alert alert-warning">
                <span>
                  Tidak ada slot yang pas dengan permintaan Anda. Berikut beberapa
                  pilihan terdekat.
                </span>
              </div>
            )}

            {recommendation.alternatives.length > 0 && (
              <>
                <p className="text-sm opacity-70 mt-4">Alternatif lain</p>

                <div className="grid gap-2">
                  {recommendation.alternatives.map((slot) => (
                    <SlotOption
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot?.id === slot.id}
                      onSelect={setSelectedSlot}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* All slots */}

      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <button
            type="button"
            onClick={() => setShowAllSlots(!showAllSlots)}
            className="flex justify-between items-center w-full"
          >
            <h2 className="card-title">Pilih dari semua slot</h2>
            <span>{showAllSlots ? "−" : "+"}</span>
          </button>

          {showAllSlots && (
            <div className="mt-4">
              <SlotPicker
                slots={otherSlots}
                selectedId={selectedSlot?.id}
                onSelect={setSelectedSlot}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={submitRequest}
        disabled={loading || !selectedSlot}
        className="btn btn-success w-full"
      >
        {loading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Mengirim...
          </>
        ) : selectedSlot ? (
          `Ajukan pindah ke ${selectedSlot.label}`
        ) : (
          "Pilih slot terlebih dahulu"
        )}
      </button>
    </div>
  );
}

export default ReschedulePage;
