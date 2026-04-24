// src/pages/ExpensesPage.jsx
import { useEffect, useState } from 'react';
import { getExpenses, addExpense, deleteExpense } from '../api/api';
import './ExpensesPage.css';
import AdminOnly from '../components/AdminOnly';

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const emptyForm = { title: '', amount: '', category: 'feed', date: getTodayDate(), notes: '' };

const categoryConfig = {
  feed:      { label: 'Feed',      emoji: '🌾', color: 'badge-green'  },
  medicine:  { label: 'Medicine',  emoji: '💊', color: 'badge-blue'   },
  equipment: { label: 'Equipment', emoji: '🔧', color: 'badge-yellow' },
  salary:    { label: 'Salary',    emoji: '💵', color: 'badge-purple' },
  other:     { label: 'Other',     emoji: '📦', color: 'badge-red'    },
};

function ExpensesPage() {
  const [expenses, setExpenses]     = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [showForm, setShowForm]     = useState(false);
  const [filterCat, setFilterCat]   = useState('all');

  // --- NEW: date filter state ---
  const [filterMode, setFilterMode] = useState('all');       // 'all' | 'day' | 'month'
  const [filterDay,  setFilterDay]  = useState(getTodayDate());
  const [filterMonth,setFilterMonth]= useState(getCurrentMonth());

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { fetchExpenses(); }, []);

  async function fetchExpenses() {
    try {
      setLoading(true);
      const res = await getExpenses();
      setExpenses(res.data);
    } catch {
      setError('Could not load expenses. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.amount) return alert('Title and amount are required!');
    try {
      await addExpense({ ...form, amount: Number(form.amount) });
      setForm(emptyForm);
      setShowForm(false);
      fetchExpenses();
    } catch {
      alert('Could not save expense.');
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete expense "${title}"?`)) return;
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch {
      alert('Could not delete.');
    }
  }

  // ---- Filter logic ----
  // Step 1: filter by date mode
  const dateFiltered = expenses.filter(exp => {
    const d = new Date(exp.date);
    if (filterMode === 'day') {
      return exp.date?.slice(0, 10) === filterDay;
    }
    if (filterMode === 'month') {
      const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      return ym === filterMonth;
    }
    return true; // 'all'
  });

  // Step 2: filter by category on top of date filter
  const displayed = filterCat === 'all'
    ? dateFiltered
    : dateFiltered.filter(e => e.category === filterCat);

  // ---- Computed totals (always from dateFiltered so they match what's shown) ----
  const shownTotal  = dateFiltered.reduce((s, e) => s + e.amount, 0);
  const grandTotal  = expenses.reduce((s, e) => s + e.amount, 0);

  // This month stats (always fixed to current month for summary cards)
  const thisMonth = new Date().getMonth();
  const thisYear  = new Date().getFullYear();
  const monthExp  = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0);

  // Category totals for breakdown — from dateFiltered
  const categoryTotals = Object.keys(categoryConfig).map(cat => ({
    cat,
    total: dateFiltered.filter(e => e.category === cat).reduce((s,e) => s + e.amount, 0)
  })).filter(c => c.total > 0);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  // Label for what's currently being shown
  function filterLabel() {
    if (filterMode === 'day') {
      return `📅 ${formatDate(filterDay)}`;
    }
    if (filterMode === 'month') {
      const [y, m] = filterMonth.split('-');
      return `📅 ${new Date(y, m-1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
    }
    return 'All time';
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">💰 Expenses</h1>
        <AdminOnly>

        <button
          className="btn btn-primary"
          onClick={() => { setForm(emptyForm); setShowForm(!showForm); }}
        >
          {showForm ? '✕ Cancel' : '+ Add Expense'}
        </button>
        </AdminOnly>

      </div>

      {error && <div className="error-box">{error}</div>}

      {/* ---- ADD FORM ---- */}
      {showForm && (
        <div className="card form-card">
          <h2 className="section-title">➕ Add New Expense</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Cattle feed purchase"/>
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="e.g. 1500" min="0"/>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="feed">🌾 Feed</option>
                  <option value="medicine">💊 Medicine</option>
                  <option value="equipment">🔧 Equipment</option>
                  <option value="salary">💵 Salary</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange}/>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Any extra details..."/>
            </div>
            <button type="submit" className="btn btn-primary">✅ Save Expense</button>
          </form>
        </div>
      )}

      {/* ---- SUMMARY CARDS ---- */}
      <div className="exp-summary">
        <div className="exp-stat-card highlight">
          <div className="exp-stat-icon">📅</div>
          <div className="exp-stat-value">₹{monthTotal.toLocaleString()}</div>
          <div className="exp-stat-label">This month</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-icon">🧾</div>
          <div className="exp-stat-value">{monthExp.length}</div>
          <div className="exp-stat-label">Entries this month</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-icon">📊</div>
          <div className="exp-stat-value">₹{grandTotal.toLocaleString()}</div>
          <div className="exp-stat-label">All-time total</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-icon">📋</div>
          <div className="exp-stat-value">{expenses.length}</div>
          <div className="exp-stat-label">Total entries</div>
        </div>
      </div>

      {/* ---- DATE FILTER BAR ---- */}
      <div className="card filter-bar-card">
        <div className="filter-mode-tabs">
          <button
            className={`fmode-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            📋 All Time
          </button>
          <button
            className={`fmode-btn ${filterMode === 'day' ? 'active' : ''}`}
            onClick={() => setFilterMode('day')}
          >
            📅 By Day
          </button>
          <button
            className={`fmode-btn ${filterMode === 'month' ? 'active' : ''}`}
            onClick={() => setFilterMode('month')}
          >
            🗓️ By Month
          </button>
        </div>

        {/* Show date picker only when a filter mode is active */}
        {filterMode === 'day' && (
          <div className="date-picker-row">
            <label>Select date:</label>
            <input
              type="date"
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
            />
          </div>
        )}
        {filterMode === 'month' && (
          <div className="date-picker-row">
            <label>Select month:</label>
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
            />
          </div>
        )}

        {/* Summary of what's shown */}
        <div className="filter-result-summary">
          <span className="filter-showing">Showing: <strong>{filterLabel()}</strong></span>
          <span className="filter-total">
            {displayed.length} entries &nbsp;·&nbsp;
            Total: <strong>₹{shownTotal.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* ---- CATEGORY BREAKDOWN ---- */}
      {categoryTotals.length > 0 && (
        <div className="card">
          <h2 className="section-title">📊 Breakdown — {filterLabel()}</h2>
          <div className="cat-breakdown">
            {categoryTotals.map(({ cat, total }) => {
              const cfg     = categoryConfig[cat];
              const percent = shownTotal > 0 ? Math.round((total / shownTotal) * 100) : 0;
              return (
                <div key={cat} className="cat-row">
                  <div className="cat-row-top">
                    <span className="cat-label">{cfg.emoji} {cfg.label}</span>
                    <span className="cat-amount">
                      ₹{total.toLocaleString()}
                      <span className="cat-percent"> ({percent}%)</span>
                    </span>
                  </div>
                  <div className="cat-bar-bg">
                    <div className="cat-bar-fill" style={{ width: `${percent}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- CATEGORY FILTER TABS ---- */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterCat === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCat('all')}
        >
          All ({dateFiltered.length})
        </button>
        {Object.entries(categoryConfig).map(([key, cfg]) => {
          const count = dateFiltered.filter(e => e.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              className={`filter-tab ${filterCat === key ? 'active' : ''}`}
              onClick={() => setFilterCat(key)}
            >
              {cfg.emoji} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ---- EXPENSES LIST ---- */}
      <div className="card">
        {loading ? (
          <p className="loading-text">Loading expenses...</p>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p>No expenses found for <strong>{filterLabel()}</strong>.</p>
            {filterMode !== 'all' && (
              <button className="btn" onClick={() => setFilterMode('all')}>
                Show all expenses
              </button>
            )}
          </div>
        ) : (
          <div className="exp-list">
            {displayed.map(exp => {
              const cfg = categoryConfig[exp.category] || categoryConfig.other;
              return (
                <div key={exp._id} className="exp-item">
                  <div className="exp-item-icon">{cfg.emoji}</div>
                  <div className="exp-item-info">
                    <div className="exp-item-title">{exp.title}</div>
                    <div className="exp-item-meta">
                      <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                      <span className="exp-item-date">{formatDate(exp.date)}</span>
                      {exp.notes && <span className="exp-item-notes">· {exp.notes}</span>}
                    </div>
                  </div>
                  <div className="exp-item-right">
                    <div className="exp-item-amount">₹{exp.amount.toLocaleString()}</div>
                    <AdminOnly>

                    <button className="btn btn-danger delete-btn" onClick={() => handleDelete(exp._id, exp.title)}>🗑️</button>
                    </AdminOnly>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpensesPage;