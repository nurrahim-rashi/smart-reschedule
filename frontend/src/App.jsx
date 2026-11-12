import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ReschedulePage from './pages/ReschedulePage.jsx';
import RequestStatusPage from './pages/RequestStatusPage.jsx';
import Navigation from './components/Navigation.jsx';
import { useState, useEffect } from 'react';
import { getUserLogged, putAccessToken, removeAccessToken } from './utils/api.js';

function App() {
  const [authedUser, setAuthedUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await getUserLogged();
      setAuthedUser(data);
      setInitializing(false);
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
        <header>
          <h1>Gymnasyum Smart Reschedule</h1>
        </header>
        <main>
          <Routes>
            <Route path="/*" element={<LoginPage loginSuccess={onLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>Gymnasyum Smart Reschedule</h1>
        <Navigation />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage logout={onLogout} />} />
          <Route path="/reschedule" element={<ReschedulePage />} />
          <Route path="/requests" element={<RequestStatusPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;