import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <h1 className="h2 mb-4">Create your account</h1>
      <form className="panel" onSubmit={submit}>
        <label className="form-label" htmlFor="name">Full name</label>
        <input id="name" required className="form-control mb-3" value={form.name} onChange={set('name')} />
        <label className="form-label" htmlFor="email">Email</label>
        <input id="email" type="email" required className="form-control mb-3" value={form.email} onChange={set('email')} />
        <label className="form-label" htmlFor="phone">Phone (optional)</label>
        <input id="phone" className="form-control mb-3" value={form.phone} onChange={set('phone')} />
        <label className="form-label" htmlFor="pw">Password (6+ characters)</label>
        <input id="pw" type="password" minLength={6} required className="form-control mb-3" value={form.password} onChange={set('password')} />
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary w-100">Create account</button>
      </form>
      <p className="mt-3">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
