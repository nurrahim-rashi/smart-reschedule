import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/gymsync-logo.png";
import { login } from "../utils/api.js";

function LoginPage({ loginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  async function onSubmitHandler(event) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const result = await login({
      email,
      password,
    });

    if (result.error) {
      setErrorMessage(result.message);
      setLoading(false);
      return;
    }

    const user = await loginSuccess(
      result.data
    );

    setLoading(false);

    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/member");
    }
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
              Masuk
            </h2>

            <p className="text-sm text-base-content/60 mt-2">
              Kelola perubahan jadwal latihan
              dengan lebih mudah.
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
                placeholder="Masukkan password"
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
                "Masuk"
              )}
            </button>
          </form>

          {/* Error */}

          {errorMessage && (
            <div className="alert alert-error mt-4">
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="divider">
            ATAU
          </div>

          {/* Links */}

          <div className="text-center text-sm">
            Belum punya akun?
            <Link
              to="/register"
              className="ml-1 text-success font-semibold hover:underline"
            >
              Daftar sekarang
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

export default LoginPage;
