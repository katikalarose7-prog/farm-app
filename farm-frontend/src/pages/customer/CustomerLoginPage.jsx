// src/pages/customer/CustomerLoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerLogin, customerRegister } from '../../api/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import './CustomerLoginPage.css';

function CustomerLoginPage() {
  const { saveCustomer } = useCustomerAuth();
  const navigate         = useNavigate();

  const [mode,    setMode]    = useState('login');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
    confirm:  '',
    phone:    '',
    address:  ''
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setError('');

  if (mode === 'register') {
    if (!form.name.trim())
      return setError('Please enter your name.');
    if (!form.phone.trim())
      return setError('Please enter your phone number.');
    if (!form.email.trim())
      return setError('Please enter your email.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm)
      return setError('Passwords do not match.');
  }

  try {
    setLoading(true);
    let res;

    if (mode === 'login') {
      console.log('🔑 Logging in:', form.email);
      res = await customerLogin({
        email:    form.email,
        password: form.password
      });
    } else {
      console.log('📝 Registering:', form.email);
      res = await customerRegister({
        name:     form.name,
        email:    form.email,
        password: form.password,
        phone:    form.phone,
        address:  form.address || ''
      });
    }

    console.log('✅ Success:', res.data);
    saveCustomer(res.data);
    navigate('/customer/shop');

  } catch (err) {
    // Log everything so we can see the exact error
    console.log('❌ Status:', err.response?.status);
    console.log('❌ Data:', err.response?.data);
    console.log('❌ Message:', err.message);

    setError(
      err.response?.data?.message ||
      err.response?.data?.error   ||
      err.message                  ||
      'Something went wrong. Please try again.'
    );
  } finally {
    setLoading(false);
  }
}

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
    setForm({ name:'', email:'', password:'', confirm:'', phone:'', address:'' });
  }

  return (
    <div className="clogin-page">
      <Link to="/" className="clogin-back">← Back to Tully Farm</Link>

      <div className="clogin-card">
        <div className="clogin-logo">🌾</div>
        <h1 className="clogin-title">Tully Farm</h1>
        <p className="clogin-subtitle">
          {mode === 'login'
            ? 'Sign in to your account'
            : 'Create a customer account'}
        </p>

        {/* Tab switcher */}
        <div className="clogin-tabs">
          <button
            type="button"
            className={`clogin-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`clogin-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>

        {error && <div className="clogin-error">{error}</div>}

        {/* ---- FORM — no action attribute, uses onSubmit ---- */}
        <form onSubmit={handleSubmit} className="clogin-form">

          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your mobile number"
                autoComplete="tel"
              />
            </div>
          )}

          <div className="form-group">
            <label>Password *</label>
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
            <>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Delivery Address (optional)</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Your default delivery address"
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </>
          )}

          {/* type="submit" — triggers onSubmit, NOT a page navigation */}
          <button
            type="submit"
            className="clogin-btn"
            disabled={loading}
          >
            {loading
              ? '⏳ Please wait...'
              : mode === 'login'
                ? '🔑 Sign In'
                : '✅ Create Account'}
          </button>

        </form>

        <div className="clogin-footer">
          <p>
            {mode === 'login'
              ? 'New customer? '
              : 'Already have an account? '}
            <button
              type="button"
              className="clogin-switch"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default CustomerLoginPage;