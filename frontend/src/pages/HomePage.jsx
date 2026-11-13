function HomePage({ name, logout }) {
    return (
        <section>
            <h2>Beranda</h2>
            <p>Halo, {name}!</p>
            <button type="button" onClick={logout}>Logout</button>
        </section>
    );
}

export default HomePage;