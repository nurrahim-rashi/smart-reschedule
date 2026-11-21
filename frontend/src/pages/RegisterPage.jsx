import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/gymsync-logo.png";
import { register } from "../utils/api.js";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  async function onSubmitHandler(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage(
        "Konfirmasi password tidak cocok."
      );
      return;
    }

    setLoading(true);

    const result = await register({
      name,
      email,
      password,
    });

    setLoading(false);

    if (result.error) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(
      "Registrasi berhasil. Mengarahkan ke halaman login..."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Logo */}

          <div className="text-center">
            <img
              src={logo}
              alt="GymSync Logo"
              className="h-24 mx-auto mb-4 object-contain"
            />

            <h1 className="text-3xl font-bold text-success">
              GymSync
            </h1>

            <p className="text-sm text-base-content/60 mt-2">
              Smart Reschedule Assistant
            </p>
          </div>

          <div className="divider"></div>

          {/* Header */}

          <div className="text-center">
            <h2 className="text-2xl font-semibold">
              Daftar Akun
            </h2>

            <p className="text-sm text-base-content/60 mt-2">
              Buat akun baru untuk mulai
              menggunakan GymSync.
            </p>
          </div>

          {/* Form */}

          <form
            onSubmit={onSubmitHandler}
            className="space-y-4 mt-4"
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Nama Lengkap
                </span>
              </label>

              <input
                type="text"
                placeholder="Masukkan nama"
                className="input input-bordered w-full"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Email
                </span>
              </label>

              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Password
                </span>
              </label>

              <input
                type="password"
                placeholder="Minimal 8 karakter"
                className="input input-bordered w-full"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Konfirmasi Password
                </span>
              </label>

              <input
                type="password"
                placeholder="Ulangi password"
                className="input input-bordered w-full"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-success w-full"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          {/* Error */}

          {errorMessage && (
            <div className="alert alert-error mt-4">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success */}

          {successMessage && (
            <div className="alert alert-success mt-4">
              <span>
                {successMessage}
              </span>
            </div>
          )}

          <div className="divider">
            ATAU
          </div>

          {/* Links */}

          <div className="text-center text-sm">
            Sudah punya akun?
            <Link
              to="/login"
              className="ml-1 text-success font-semibold hover:underline"
            >
              Masuk sekarang
            </Link>
          </div>

          <div className="text-center text-sm mt-2">
            <Link
              to="/"
              className="link link-hover text-base-content/60"
            >
              ← Kembali ke Beranda
            </Link>
          </div>

          <div className="text-center text-xs text-base-content/50 mt-4">
            © GymSync by Gymnasyum
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
