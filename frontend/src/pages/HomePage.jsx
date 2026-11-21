import { Link } from "react-router-dom";
import logo from "../assets/gymsync-logo.png";

function HomePage() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}

      <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="navbar-start">
            <img
              src={logo}
              alt="GymSync Logo"
              className="h-12 w-12 object-contain animate-bounce"
            />

            <div className="ml-3">
              <h1 className="text-2xl font-bold text-success">
                GymSync
              </h1>

              <p className="text-xs text-gray-500">
                by Gymnasyum
              </p>
            </div>
          </div>

          <div className="navbar-end gap-2">
            <Link
              to="/login"
              className="btn btn-ghost hover:scale-105 transition-all duration-300"
            >
              Masuk
            </Link>

            <Link
              to="/register"
              className="btn btn-success hover:scale-105 transition-all duration-300"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}

      <section className="hero min-h-[80vh]">
        <div className="hero-content text-center">
          <div className="max-w-4xl animate-[fadeIn_1s_ease-out]">
            <img
              src={logo}
              alt="GymSync Logo"
              className="h-40 mx-auto mb-8 object-contain animate-[float_4s_ease-in-out_infinite]"
            />

            <h1 className="text-5xl md:text-6xl font-bold text-success">
              GymSync
            </h1>

            <div className="badge badge-success badge-lg mt-6 animate-pulse">
              Smart Reschedule Assistant
            </div>

            <p className="py-6 text-lg text-gray-600">
              Membantu customer dan admin Gymnasyum
              mengelola perubahan jadwal latihan
              dengan lebih cepat, mudah, dan
              terorganisir menggunakan teknologi AI.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="btn btn-success btn-lg hover:scale-105 transition-all duration-300"
              >
                Masuk Sekarang
              </Link>

              <Link
                to="/register"
                className="btn btn-outline btn-success btn-lg hover:scale-105 transition-all duration-300"
              >
                Buat Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Fitur Utama
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="card-body">
              <h3 className="card-title">
                🤖 Intent Classification
              </h3>

              <p>
                AI memahami intent customer
                seperti reschedule,
                cancellation, confirmation,
                atau schedule inquiry.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="card-body">
              <h3 className="card-title">
                📅 Smart Schedule Recommendation
              </h3>

              <p>
                Menampilkan rekomendasi slot
                terbaik berdasarkan preferensi
                customer dan ketersediaan jadwal.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="card-body">
              <h3 className="card-title">
                ✨ AI Draft Response
              </h3>

              <p>
                Membantu admin membuat draft
                balasan otomatis untuk
                mempercepat komunikasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}

      <section className="bg-base-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Tentang GymSync
          </h2>

          <p className="leading-relaxed text-gray-600">
            GymSync merupakan Smart Reschedule
            Assistant yang dikembangkan untuk
            membantu proses pengelolaan
            perubahan jadwal latihan di
            Gymnasyum dengan dukungan
            Artificial Intelligence.
          </p>

          <p className="mt-6 text-success font-semibold italic">
            "Sehat dan Kuat, Dunia Akhirat"
          </p>
        </div>
      </section>

      {/* CTA */}

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="card bg-success text-success-content shadow-xl">
            <div className="card-body text-center">
              <h2 className="text-3xl font-bold">
                Siap Menggunakan GymSync?
              </h2>

              <p>
                Bergabung sekarang dan kelola
                perubahan jadwal latihan dengan
                lebih mudah.
              </p>

              <div className="card-actions justify-center mt-4">
                <Link
                  to="/register"
                  className="btn btn-neutral hover:scale-105 transition-all duration-300"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="footer footer-center bg-neutral text-neutral-content p-8">
        <div>
          <img
            src={logo}
            alt="GymSync"
            className="h-12"
          />

          <p className="font-bold">
            GymSync by Gymnasyum
          </p>

          <p>
            Smart Reschedule Assistant
          </p>

          <p>
            © 2026 All Rights Reserved
          </p>
        </div>
      </footer>

      {/* Custom Animation */}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(25px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0% {
              transform: translateY(0px);
            }

            50% {
              transform: translateY(-10px);
            }

            100% {
              transform: translateY(0px);
            }
          }
        `}
      </style>
    </div>
  );
}

export default HomePage;
