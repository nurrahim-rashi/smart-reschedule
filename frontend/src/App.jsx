import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ReschedulePage from "./pages/ReschedulePage.jsx";
import RequestStatusPage from "./pages/RequestStatusPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import MemberPage from "./pages/MemberPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import Navigation from "./components/Navigation.jsx";
import { useState, useEffect } from "react";
import {
  getUserLogged,
  putAccessToken,
  removeAccessToken,
} from "./utils/api.js";

function App() {
  const [authedUser, setAuthedUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await getUserLogged();
        setAuthedUser(data);
      } catch {
        setAuthedUser(null);
      } finally {
        setInitializing(false);
      }
    }

    fetchUser();
  }, []);

  async function onLoginSuccess({ accessToken }) {
    putAccessToken(accessToken);
    const { data } = await getUserLogged();
    setAuthedUser(data);
  }

  function onLogout() {
    setAuthedUser(null);
    removeAccessToken();
  }

  if (initializing) {
    return null;
  }

  if (authedUser === null) {
    return (
      <div>
        <main>
          <Routes>
            <Route
              path="/*"
              element={<LoginPage loginSuccess={onLoginSuccess} />}
            />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <Navigation
          isAdmin={authedUser.role === "admin"}
          name={authedUser.name}
          logout={onLogout}
        />
      </header>
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<HomePage name={authedUser.name} logout={onLogout} />}
          />
          <Route
            path="/member"
            element={<MemberPage name={authedUser.name} />}
          />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/reschedule" element={<ReschedulePage />} />
          <Route path="/requests" element={<RequestStatusPage />} />
          {authedUser.role === "admin" && (
            <Route path="/admin" element={<AdminPage />} />
          )}
        </Routes>
      </main>

      <footer className="footer footer-center p-6 mt-8 text-base-content/60 border-t border-base-300">
        <p>© {new Date().getFullYear()} GymSync by Gymnasyum</p>
      </footer>
    </div>
  );
}

export default App;
