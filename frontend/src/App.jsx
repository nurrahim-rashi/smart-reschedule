import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ReschedulePage from './pages/ReschedulePage.jsx';

function App() {
  return (
    <div>
      <header>
        <h1>Gymnasyum Smart Reschedule</h1>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/reschedule" element={<ReschedulePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;