import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/gymsync-logo.png";

function Navigation({
  isAdmin,
  name,
  logout,
}) {
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  function openLogoutModal() {
    document
      .getElementById("logout_modal")
      ?.showModal();
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    logout();
  }

  return (
    <>
      <div className="navbar bg-base-100 shadow-md border-b border-base-300">
        {/* Left */}

        <div className="navbar-start">
          <div className="dropdown">
            <button
              tabIndex={0}
              className="btn btn-ghost lg:hidden"
            >
              ☰
            </button>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow bg-base-100 rounded-box w-56"
            >
              {isAdmin ? (
                <li>
                  <Link to="/admin">
                    Dashboard Admin
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/member">
                      Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link to="/booking">
                      Booking
                    </Link>
                  </li>

                  <li>
                    <Link to="/reschedule">
                      Reschedule
                    </Link>
                  </li>

                  <li>
                    <Link to="/requests">
                      Status Request
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <Link
            to={
              isAdmin
                ? "/admin"
                : "/member"
            }
            className="btn btn-ghost normal-case"
          >
            <img
              src={logo}
              alt="GymSync"
              className="h-10 w-10 object-contain"
            />

            <div className="ml-2 text-left">
              <div className="font-bold text-lg text-success">
                GymSync
              </div>

              <div className="text-xs opacity-70">
                by Gymnasyum
              </div>
            </div>
          </Link>
        </div>

        {/* Center */}

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {isAdmin ? (
              <li>
                <Link to="/admin">
                  Dashboard Admin
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/member">
                    Dashboard
                  </Link>
                </li>

                <li>
                  <Link to="/booking">
                    Booking
                  </Link>
                </li>

                <li>
                  <Link to="/reschedule">
                    Reschedule
                  </Link>
                </li>

                <li>
                  <Link to="/requests">
                    Status Request
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Right */}

        <div className="navbar-end gap-3">
          <div className="hidden md:block text-right">
            <div className="font-medium">
              {name}
            </div>

            <div className="text-xs opacity-60">
              {isAdmin
                ? "Administrator"
                : "Member"}
            </div>
          </div>

          <button
            onClick={openLogoutModal}
            className="btn btn-outline btn-error btn-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Modal Logout */}

      <dialog
        id="logout_modal"
        className="modal"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Konfirmasi Logout
          </h3>

          <p className="py-4">
            Apakah Anda yakin ingin keluar
            dari GymSync?
          </p>

          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn"
                disabled={isLoggingOut}
              >
                Batal
              </button>
            </form>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn btn-error"
            >
              {isLoggingOut ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Logging out...
                </>
              ) : (
                "Ya, Logout"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default Navigation;
