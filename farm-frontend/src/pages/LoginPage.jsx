// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function LoginPage() {
  const { saveUser } = useAuth();
  const navigate     = useNavigate();

  const [mode,    setMode]    = useState('login');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({
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
      if (form.password !== form.confirm)
        return setError('Passwords do not match.');
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
      setError(
        err.response?.data?.message || 'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">

      {/* Left panel — branding */}
      <div className="admin-login-left">
        <div className="admin-login-brand">
          <div className="admin-brand-logo">🌾</div>
          <h1 className="admin-brand-name">Tully Farm</h1>
          <p className="admin-brand-tagline">Farm Management Dashboard</p>
        </div>

        <div className="admin-login-features">
          <div className="admin-feature">
            <span>🐐</span>
            <span>Manage Livestock</span>
          </div>
          <div className="admin-feature">
            <span>🥛</span>
            <span>Track Production</span>
          </div>
          <div className="admin-feature">
            <span>👷</span>
            <span>Worker Attendance</span>
          </div>
          <div className="admin-feature">
            <span>💰</span>
            <span>Expenses & Profit</span>
          </div>
          <div className="admin-feature">
            <span>📦</span>
            <span>Order Management</span>
          </div>
          <div className="admin-feature">
            <span>📊</span>
            <span>Revenue Analytics</span>
          </div>
        </div>

        <div className="admin-login-back">
          <Link to="/">← Back to farm website</Link>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="admin-login-right">
        <div className="admin-login-card">

          <div className="admin-card-header">
            <div className="admin-card-icon">🔑</div>
            <h2>Admin Access</h2>
            <p>Sign in to manage your farm</p>
          </div>

          {/* Mode tabs */}
          <div className="admin-login-tabs">
            <button
              type="button"
              className={`admin-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`admin-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="admin-login-error">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">

            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Farm owner's name"
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
                placeholder="tullyfarm@gmail.com"
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
                placeholder="Enter password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
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
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading
                ? '⏳ Please wait...'
                : mode === 'login'
                  ? '🔑 Sign In to Dashboard'
                  : '✅ Create Admin Account'}
            </button>

          </form>

          {/* Info box */}
          <div className="admin-login-info">
            <span>🛒</span>
            <span>
              Are you a customer?{' '}
              <Link to="/customer/login">Shop here →</Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;