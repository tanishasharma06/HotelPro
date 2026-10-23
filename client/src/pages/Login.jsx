import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const u = await login(form);
      const fallback = ['staff', 'admin'].includes(u.role) ? '/admin' : '/';
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <h1 className="h2 mb-4">Log in</h1>
      <form className="panel" onSubmit={submit}>
        <label className="form-label" htmlFor="email">Email</label>
        <input id="email" type="email" required className="form-control mb-3" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="form-label" htmlFor="pw">Password</label>
        <input id="pw" type="password" required className="form-control mb-3" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary w-100">Log in</button>
      </form>
      <p className="mt-3">New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
