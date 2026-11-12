import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api.js';

function LoginPage({ loginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function onSubmitHandler(event) {
        event.preventDefault();

        const result = await login({ email, password });

        if (result.error) {
            setMessage(result.message);
            return;
        }

        await loginSuccess(result.data);
        navigate('/');
    }

    return (
        <section>
            <h2>Masuk</h2>
            <form onSubmit={onSubmitHandler}>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit">Masuk</button>
            </form>
            {message && <p>{message}</p>}
        </section>
    );
}

export default LoginPage;