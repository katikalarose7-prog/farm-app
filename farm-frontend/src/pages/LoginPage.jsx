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

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: ''
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error on input
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (mode === 'register') {
      if (!form.name.trim()) return setError('Please enter your name.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      const url  = mode === 'login'
        ? `${BASE_URL}/auth/login`
        : `${BASE_URL}/auth/register`;

      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await axios.post(url, body);

      saveUser(res.data);     // Save to context + localStorage
      navigate('/');          // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.message ||  err.response?.data?.error ||  err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">🌾</div>
        <h1 className="login-title">Farm Manager</h1>
        <p className="login-subtitle">
          {mode === 'login' ? 'Sign in to your farm account' : 'Create your farm account'}
        </p>

        {/* Error box */}
        {error && <div className="login-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                autoComplete="name"
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
              autoComplete="email"
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
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                autoComplete="new-password"
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
              : mode === 'login' ? '🔑 Sign In' : '✅ Create Account'
            }
          </button>
        </form>

        {/* Toggle login / register */}
        <div className="login-toggle">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button className="toggle-btn" onClick={() => {
                setMode('register'); setError('');
              }}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="toggle-btn" onClick={() => {
                setMode('login'); setError('');
              }}>
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