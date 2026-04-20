// src/pages/ProductionPage.jsx
import { useEffect, useState } from 'react';
import { getProduction, addProduction, deleteProduction } from '../api/api';
import './ProductionPage.css';

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
}

const emptyForm = { date: getTodayDate(), milkLiters: '', eggsCount: '', notes: '' };

function ProductionPage() {
  const [records, setRecords]     = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [showForm, setShowForm]   = useState(false);

  // --- date filter state ---
  const [filterMode,  setFilterMode]  = useState('all');
  const [filterDay,   setFilterDay]   = useState(getTodayDate());
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { fetchRecords(); }, []);

  async function fetchRecords() {
    try {
      setLoading(true);
      const res = await getProduction();
      setRecords(res.data);
    } catch {
      setError('Could not load records. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date) return alert('Please select a date.');
    if (!form.milkLiters && !form.eggsCount) return alert('Enter at least milk or eggs.');
    try {
      await addProduction({
        ...form,
        milkLiters: Number(form.milkLiters) || 0,
        eggsCount:  Number(form.eggsCount)  || 0,
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchRecords();
    } catch {
      alert('Could not save.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteProduction(id);
      fetchRecords();
    } catch {
      alert('Could not delete.');
    }
  }

  // ---- Filter logic ----
  const filtered = records.filter(r => {
    const d = new Date(r.date);
    if (filterMode === 'day') {
      return r.date?.slice(0, 10) === filterDay;
    }
    if (filterMode === 'month') {
      const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      return ym === filterMonth;
    }
    return true;
  });

  // ---- Totals from filtered records ----
  const filteredMilk = filtered.reduce((s, r) => s + (r.milkLiters || 0), 0);
  const filteredEggs = filtered.reduce((s, r) => s + (r.eggsCount  || 0), 0);

  // Always-fixed this-month stats for summary cards
  const thisMonth   = new Date().getMonth();
  const thisYear    = new Date().getFullYear();
  const monthRecs   = records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthMilk   = monthRecs.reduce((s, r) => s + (r.milkLiters || 0), 0);
  const monthEggs   = monthRecs.reduce((s, r) => s + (r.eggsCount  || 0), 0);
  const totalMilk   = records.reduce((s, r) => s + (r.milkLiters || 0), 0);
  const totalEggs   = records.reduce((s, r) => s + (r.eggsCount  || 0), 0);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function filterLabel() {
    if (filterMode === 'day') return `📅 ${formatDate(filterDay)}`;
    if (filterMode === 'month') {
      const [y, m] = filterMonth.split('-');
      return `📅 ${new Date(y, m-1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
    }
    return 'All time';
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🥛 Production</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Entry'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* ---- ADD FORM ---- */}
      {showForm && (
        <div className="card form-card">
          <h2 className="section-title">➕ Add Production Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label>🥛 Milk (Liters)</label>
                <input type="number" name="milkLiters" value={form.milkLiters} onChange={handleChange} placeholder="e.g. 12.5" min="0" step="0.1"/>
              </div>
              <div className="form-group">
                <label>🥚 Eggs (Count)</label>
                <input type="number" name="eggsCount" value={form.eggsCount} onChange={handleChange} placeholder="e.g. 45" min="0"/>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. One buffalo unwell"/>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">✅ Save Entry</button>
          </form>
        </div>
      )}

      {/* ---- SUMMARY CARDS (always this month) ---- */}
      <div className="prod-summary">
        <div className="prod-stat-card">
          <div className="prod-stat-icon">🥛</div>
          <div className="prod-stat-value">{monthMilk.toFixed(1)}L</div>
          <div className="prod-stat-label">Milk this month</div>
        </div>
        <div className="prod-stat-card">
          <div className="prod-stat-icon">🥚</div>
          <div className="prod-stat-value">{monthEggs}</div>
          <div className="prod-stat-label">Eggs this month</div>
        </div>
        <div className="prod-stat-card">
          <div className="prod-stat-icon">📊</div>
          <div className="prod-stat-value">{totalMilk.toFixed(1)}L</div>
          <div className="prod-stat-label">Total milk ever</div>
        </div>
        <div className="prod-stat-card">
          <div className="prod-stat-icon">📦</div>
          <div className="prod-stat-value">{totalEggs}</div>
          <div className="prod-stat-label">Total eggs ever</div>
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

        {/* Mini totals for filtered range */}
        <div className="filter-result-summary">
          <span className="filter-showing">
            Showing: <strong>{filterLabel()}</strong>
          </span>
          <span className="filter-total">
            {filtered.length} entries &nbsp;·&nbsp;
            🥛 <strong>{filteredMilk.toFixed(1)}L</strong>
            &nbsp;&nbsp;
            🥚 <strong>{filteredEggs} eggs</strong>
          </span>
        </div>
      </div>

      {/* ---- HISTORY TABLE ---- */}
      <div className="card">
        <h2 className="section-title">📋 History — {filterLabel()}</h2>
        {loading ? (
          <p className="loading-text">Loading records...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No records found for <strong>{filterLabel()}</strong>.</p>
            {filterMode !== 'all' && (
              <button className="btn" onClick={() => setFilterMode('all')}>
                Show all records
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="prod-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>🥛 Milk (L)</th>
                  <th>🥚 Eggs</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td className="date-cell">{formatDate(r.date)}</td>
                    <td className="num-cell milk-val">{r.milkLiters > 0 ? `${r.milkLiters}L` : '—'}</td>
                    <td className="num-cell egg-val">{r.eggsCount  > 0 ? r.eggsCount       : '—'}</td>
                    <td className="notes-cell">{r.notes || '—'}</td>
                    <td>
                      <button className="btn btn-danger delete-btn" onClick={() => handleDelete(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer row showing filtered totals */}
              {filtered.length > 1 && (
                <tfoot>
                  <tr className="table-total-row">
                    <td><strong>Total</strong></td>
                    <td className="num-cell milk-val"><strong>{filteredMilk.toFixed(1)}L</strong></td>
                    <td className="num-cell egg-val"><strong>{filteredEggs}</strong></td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductionPage;