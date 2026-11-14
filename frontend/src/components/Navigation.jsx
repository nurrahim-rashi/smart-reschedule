import { Link } from "react-router-dom";

function Navigation({ isAdmin }) {
    return (
        <nav>
            <ul>
                <li><Link to="/">Beranda</Link></li>
                <li><Link to="/reschedule">Ajukan Reschedule</Link></li>
                <li><Link to="/requests">Status Request</Link></li>
                {isAdmin && <li><Link to="/admin">Admin</Link></li>}
            </ul>
        </nav>
    );
}

export default Navigation;