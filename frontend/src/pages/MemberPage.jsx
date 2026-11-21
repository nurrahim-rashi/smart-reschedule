import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyBookings,
  getMyRescheduleRequests,
} from "../utils/api.js";
import { splitSlotLabel, formatTimeRange } from "../utils/slot.js";
import { paginate } from "../utils/pagination.js";
import Pagination from "../components/Pagination.jsx";

const BOOKINGS_PER_PAGE = 5;

function MemberPage({ name }) {
  const [bookings, setBookings] =
    useState([]);

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [bookingPage, setBookingPage] =
    useState(1);

  useEffect(() => {
    async function fetchData() {
      const [bookingsResult, requestsResult] =
        await Promise.all([
          getMyBookings(),
          getMyRescheduleRequests(),
        ]);

      setBookings(bookingsResult.data);
      setRequests(requestsResult.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "pending"
  );

  // Jadwal yang sedang diajukan pindah, dicocokkan dari jadwal lamanya
  const pendingSchedules = new Set(
    pendingRequests.map(
      (request) => request.oldSchedule
    )
  );

  const nextBooking = bookings[0];

  const {
    pageItems: visibleBookings,
    currentPage: currentBookingPage,
    totalPages: totalBookingPages,
  } = paginate(bookings, bookingPage, BOOKINGS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-success">
          Dashboard Member
        </h1>

        <p className="text-base-content/60 mt-2">
          Selamat datang, {name}.
        </p>
      </div>

      {/* Statistik */}

      <div className="stats stats-vertical md:stats-horizontal shadow w-full mb-8">
        <div className="stat">
          <div className="stat-title">
            Jadwal Aktif
          </div>

          <div className="stat-value text-success">
            {loading ? "-" : bookings.length}
          </div>

          <div className="stat-desc">
            Sesi yang akan datang
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            Request Menunggu
          </div>

          <div className="stat-value text-warning">
            {loading ? "-" : pendingRequests.length}
          </div>

          <div className="stat-desc">
            Menunggu persetujuan admin
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            Sesi Berikutnya
          </div>

          <div className="stat-value text-primary text-2xl">
            {nextBooking
              ? nextBooking.schedule
              : "-"}
          </div>

          <div className="stat-desc">
            Datang 10 menit sebelum mulai
          </div>
        </div>
      </div>

      {/* Jadwal Saya */}

      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="card-title">
              🗓️ Jadwal Saya
            </h2>

            {bookings.length > 0 && (
              <Link
                to="/booking"
                className="btn btn-sm btn-outline btn-success"
              >
                + Tambah Jadwal
              </Link>
            )}
          </div>

          {loading && (
            <div className="space-y-3 py-3">
              <div className="skeleton h-6 w-2/3"></div>
              <div className="skeleton h-6 w-1/2"></div>
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="text-center py-6">
              <p className="text-base-content/60 mb-4">
                Anda belum punya jadwal latihan.
              </p>

              <Link
                to="/booking"
                className="btn btn-success"
              >
                Booking Jadwal Pertama
              </Link>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <ul className="divide-y divide-base-200">
              {visibleBookings.map((booking) => {
                const { dateLabel, time } =
                  splitSlotLabel(booking.schedule);

                const isNext =
                  booking.id === nextBooking?.id;

                return (
                  <li
                    key={booking.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {dateLabel}
                      </p>

                      <p className="text-sm text-base-content/60">
                        {formatTimeRange(time)} WIB
                      </p>

                      {(isNext ||
                        pendingSchedules.has(booking.schedule)) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {isNext && (
                            <span className="badge badge-sm badge-success">
                              Berikutnya
                            </span>
                          )}

                          {pendingSchedules.has(booking.schedule) && (
                            <span className="badge badge-sm badge-warning">
                              Menunggu reschedule
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Link
                      to="/reschedule"
                      state={{ bookingId: booking.id }}
                      className="btn btn-sm btn-outline btn-success shrink-0"
                    >
                      Reschedule
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && (
            <Pagination
              currentPage={currentBookingPage}
              totalPages={totalBookingPages}
              onPageChange={setBookingPage}
            />
          )}
        </div>
      </div>

      {/* Features */}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              🎟️ Booking Jadwal
            </h2>

            <p>
              Pilih jadwal latihan baru dari
              slot yang tersedia setiap hari
              pukul 07:00 - 21:00.
            </p>

            <div className="card-actions justify-end">
              <Link
                to="/booking"
                className="btn btn-success"
              >
                Booking Sekarang
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              📅 Ajukan Reschedule
            </h2>

            <p>
              Kirim permintaan perubahan
              jadwal latihan dan dapatkan
              rekomendasi slot yang tersedia.
            </p>

            <div className="card-actions justify-end">
              <Link
                to="/reschedule"
                className="btn btn-outline btn-success"
              >
                Ajukan Reschedule
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              📋 Status Request
            </h2>

            <p>
              Pantau status pengajuan
              reschedule Anda secara real-time.
            </p>

            <div className="card-actions justify-end">
              <Link
                to="/requests"
                className="btn btn-outline btn-success"
              >
                Cek Status Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tentang */}

      <div className="card bg-base-100 shadow-lg mt-8">
        <div className="card-body">
          <h2 className="card-title">
            Tentang GymSync
          </h2>

          <p>
            GymSync membantu pelanggan
            Gymnasyum mengelola perubahan
            jadwal latihan secara lebih
            efisien melalui teknologi
            Artificial Intelligence.
          </p>

          <p className="text-success font-medium italic mt-2">
            "Sehat dan Kuat, Dunia Akhirat"
          </p>
        </div>
      </div>
    </div>
  );
}

export default MemberPage;
