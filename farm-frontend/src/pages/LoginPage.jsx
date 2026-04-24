// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function LoginPage() {
  const { saveUser } = useAuth();
  const navigate     = useNavigate();
  const [mode, setMode]       = useState('login');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    name: '', email: '', password: '', confirm: ''
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!form.name.trim()) return setError('Please enter your name.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
    }
    try {
      setLoading(true);
      const url  = `${BASE_URL}/auth/${mode}`;
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await axios.post(url, body);
      saveUser(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🌾</div>
        <h1 className="login-title">Farm Manager</h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Sign in to your farm account'
            : 'Create your farm account'}
        </p>

        {/* Role info banner on register */}
        {mode === 'register' && (
          <div className="role-info-box">
            <span>ℹ️</span>
            <span>
              The <strong>first account</strong> created becomes
              the <strong>Admin</strong>. All other accounts are
              <strong> Guests</strong> (view only).
            </span>
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat your password"
              />
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading
              ? '⏳ Please wait...'
              : mode === 'login' ? '🔑 Sign In' : '✅ Create Account'}
          </button>
        </form>

        <div className="login-toggle">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button className="toggle-btn" onClick={() => { setMode('register'); setError(''); }}>
                Create one
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button className="toggle-btn" onClick={() => { setMode('login'); setError(''); }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;