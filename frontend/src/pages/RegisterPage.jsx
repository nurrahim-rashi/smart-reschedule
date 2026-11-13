import { useState } from 'react';
import { register } from '../utils/api.js';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function onSubmitHandler(event) {
    event.preventDefault();

    const result = await register({ name, email, password });

    if (result.error) {
      setMessage(result.message);
      return;
    }

    navigate('/');
  }

  return (
    <section>
      <h2>Daftar Akun</h2>
      <form onSubmit={onSubmitHandler}>
        <input
          type="text"
          placeholder="Nama"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
        <button type="submit">Daftar</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Sudah punya akun? <Link to="/">Masuk di sini</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
