import { useNavigate } from 'react-router-dom';
import { getAccessToken, removeAccessToken } from '../utils/api.js';

function HomePage() {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(getAccessToken());

    function onLogoutHandler() {
        removeAccessToken();
        navigate('/login');
    }

    return (
        <section>
            <h2>Beranda</h2>
            <p>{isLoggedIn ? 'Kamu sudah login.' : 'Kamu belum login.'}</p>
            {isLoggedIn && <button type="button" onClick={onLogoutHandler}>Logout</button>}
        </section>
    );
}

export default HomePage;