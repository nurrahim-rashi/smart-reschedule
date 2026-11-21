import { Link } from "react-router-dom";

function MemberPage({ name }) {

    console.log("MEMBER PAGE");
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-success">
          Dashboard Member
        </h1>

        <p className="text-gray-500 mt-2">
          Selamat datang, {name}.
        </p>
      </div>

      {/* Welcome Card */}

      <div className="hero bg-base-100 rounded-2xl shadow-lg">
        <div className="hero-content text-center py-10">
          <div>
            <h2 className="text-3xl font-bold">
              Smart Reschedule Assistant
            </h2>

            <p className="py-4 text-gray-500">
              Kelola perubahan jadwal latihan
              Anda dengan lebih mudah menggunakan
              bantuan Artificial Intelligence.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                to="/booking"
                className="btn btn-success"
              >
                Booking Jadwal
              </Link>

              <Link
                to="/reschedule"
                className="btn btn-outline btn-success"
              >
                Ajukan Reschedule
              </Link>

              <Link
                to="/requests"
                className="btn btn-outline btn-success"
              >
                Lihat Status Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik */}

      <div className="stats shadow w-full mt-8">
        <div className="stat">
          <div className="stat-title">
            Smart Assistant
          </div>

          <div className="stat-value text-success">
            AI
          </div>

          <div className="stat-desc">
            Aktif
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            Status Sistem
          </div>

          <div className="stat-value text-primary">
            Online
          </div>

          <div className="stat-desc">
            GymSync Ready
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">
            Role
          </div>

          <div className="stat-value text-secondary">
            Member
          </div>

          <div className="stat-desc">
            Customer Area
          </div>
        </div>
      </div>

      {/* Features */}

      <div className="grid md:grid-cols-2 gap-6 mt-8">
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
                className="btn btn-success"
              >
                Mulai
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
                Lihat Status
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