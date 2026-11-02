import { getAccessToken } from '../utils/api.js';

function HomePage() {
    const isLoggedIn = Boolean(getAccessToken());

    return (
        <section>
            <h2>Beranda</h2>
            <p>{isLoggedIn ? 'Kamu sudah login.' : 'Kamu belum login.'}</p>
        </section>
    );
}

export default HomePage;