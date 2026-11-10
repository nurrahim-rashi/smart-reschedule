import { Link } from "react-router-dom";

function Navigation() {
    return (
        <nav>
            <ul>
                <li><Link to="/">Beranda</Link></li>
                <li><Link to="/reschedule">Ajukan Reschedule</Link></li>
                <li><Link to="/requests">Status Request</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Daftar</Link></li>
            </ul>
        </nav>
    );
}

export default Navigation;