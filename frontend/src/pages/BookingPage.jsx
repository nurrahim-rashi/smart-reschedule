import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SlotPicker from "../components/SlotPicker.jsx";
import {
  getMyBookings,
  getAvailableSlots,
  addBooking,
  cancelBooking,
} from "../utils/api.js";

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [bookingsResult, slotsResult] = await Promise.all([
        getMyBookings(),
        getAvailableSlots(),
      ]);

      setBookings(bookingsResult.data);
      setTimeSlots(slotsResult.data);
      setInitializing(false);
    }

    fetchData();
  }, [reloadKey]);

  async function submitBooking() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await addBooking(selectedSlot.id);

    setLoading(false);

    if (result.error) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(`Booking ${selectedSlot.label} berhasil dibuat.`);
    setSelectedSlot(null);
    setReloadKey((key) => key + 1);
  }

  function openCancelModal(booking) {
    setBookingToCancel(booking);
    document.getElementById("cancel_booking_modal")?.showModal();
  }

  async function confirmCancel() {
    setCancelling(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await cancelBooking(bookingToCancel.id);

    setCancelling(false);
    document.getElementById("cancel_booking_modal")?.close();

    if (result.error) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(`Jadwal ${bookingToCancel.schedule} berhasil dibatalkan.`);
    setBookingToCancel(null);
    setReloadKey((key) => key + 1);
  }

  const bookedSlotIds = new Set(bookings.map((booking) => booking.slotId));
  const selectableSlots = timeSlots.filter(
    (slot) => !bookedSlotIds.has(slot.id)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold text-success">
        Booking Jadwal
      </h1>

      <p className="text-gray-500 mt-2 mb-6">
        Pilih jadwal latihan. Gym buka setiap hari 07:00 - 21:00,
        tiap slot berdurasi 1 jam.
      </p>

      {errorMessage && (
        <div className="alert alert-error mb-6">
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success mb-6">
          <span>{successMessage}</span>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title">Jadwal Saya</h2>

            <ul className="space-y-2">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span>{booking.schedule}</span>

                  <div className="flex gap-2">
                    <Link
                      to="/reschedule"
                      className="btn btn-sm btn-outline btn-success"
                    >
                      Reschedule
                    </Link>

                    <button
                      type="button"
                      onClick={() => openCancelModal(booking)}
                      className="btn btn-sm btn-outline btn-error"
                    >
                      Batalkan
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Slot Tersedia</h2>

          {initializing ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <SlotPicker
              slots={selectableSlots}
              selectedId={selectedSlot?.id}
              onSelect={setSelectedSlot}
            />
          )}

          <button
            onClick={submitBooking}
            disabled={loading || !selectedSlot}
            className="btn btn-success mt-4"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Memproses...
              </>
            ) : selectedSlot ? (
              `Booking ${selectedSlot.label}`
            ) : (
              "Pilih slot terlebih dahulu"
            )}
          </button>
        </div>
      </div>

      <dialog id="cancel_booking_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Batalkan Jadwal</h3>

          <p className="py-4">
            Yakin ingin membatalkan jadwal {bookingToCancel?.schedule}?
            Request reschedule untuk jadwal ini yang masih menunggu juga akan
            ditutup.
          </p>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn" disabled={cancelling}>
                Kembali
              </button>
            </form>

            <button
              onClick={confirmCancel}
              disabled={cancelling}
              className="btn btn-error"
            >
              {cancelling ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Membatalkan...
                </>
              ) : (
                "Ya, Batalkan"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default BookingPage;
