import { useNavigate } from 'react-router-dom';
import { getAccessToken, removeAccessToken, getUserLogged } from '../utils/api.js';
import { useEffect, useState } from 'react';

function HomePage() {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(getAccessToken());
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const { error, data } = await getUserLogged();
            if (!error) {
                setUser(data);
            }
        }

        if (isLoggedIn) {
            fetchUser();
        }
    }, [isLoggedIn]);

    function onLogoutHandler() {
        removeAccessToken();
        navigate('/login');
    }

    return (
        <section>
            <h2>Beranda</h2>
            {user && <p>Halo, {user.name}!</p>}
            <p>{isLoggedIn ? 'Kamu sudah login.' : 'Kamu belum login.'}</p>
            {isLoggedIn && <button type="button" onClick={onLogoutHandler}>Logout</button>}
        </section>
    );
}

export default HomePage;