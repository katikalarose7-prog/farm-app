// src/pages/ProductionPage.jsx
import { useEffect, useState } from 'react';
import {
  getProduction, addProduction, deleteProduction,
  getCategories, addCategory, deleteCategory
} from '../api/api';
import './ProductionPage.css';
import AdminOnly from '../components/AdminOnly';


function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}
function getCurrentMonth() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;
}

// Common emojis the farmer can pick for a new category
const EMOJI_OPTIONS = [
  '🥛','🥚','🍖','🥩','🍯','🌿','🍋','🍊','🥭','🍇',
  '🍌','🍅','🥬','🌾','🐑','🐟','🥜','🫚','🧀','📦'
];

const emptyForm    = { date: getTodayDate(), notes: '' };
const emptyCatForm = { name: '', unit: '', emoji: '📦' };

function ProductionPage() {
  const [records,     setRecords]     = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [values,      setValues]      = useState({}); // { categoryId: inputValue }
  const [form,        setForm]        = useState(emptyForm);
  const [catForm,     setCatForm]     = useState(emptyCatForm);
  const [showForm,    setShowForm]    = useState(false);
  const [showCatMgr,  setShowCatMgr]  = useState(false); // manage categories panel
  const [showCatAdd,  setShowCatAdd]  = useState(false); // add new category form
  const [filterMode,  setFilterMode]  = useState('all');
  const [filterDay,   setFilterDay]   = useState(getTodayDate());
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [recRes, catRes] = await Promise.all([
        getProduction(),
        getCategories()
      ]);
      setRecords(recRes.data);
      setCategories(catRes.data);
    } catch {
      setError('Could not load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  // When form opens reset all value inputs to 0
  function openAddForm() {
    const initial = {};
    categories.forEach(c => { initial[c._id] = ''; });
    setValues(initial);
    setForm(emptyForm);
    setShowForm(true);
  }

  function handleValueChange(catId, val) {
    setValues(prev => ({ ...prev, [catId]: val }));
  }

  // Submit production entry
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date) return alert('Please select a date.');

    // Build entries array from all categories
    const entries = categories.map(cat => ({
      categoryId:   cat._id,
      categoryName: cat.name,
      unit:         cat.unit,
      emoji:        cat.emoji,
      value:        Number(values[cat._id]) || 0,
    })).filter(e => e.value > 0); // Only include non-zero values

    if (entries.length === 0) {
      return alert('Please enter at least one value.');
    }

    // Pull out milk and eggs for backward compat with dashboard
    const milkCat = categories.find(c => c.name.toLowerCase() === 'milk');
    const eggCat  = categories.find(c => c.name.toLowerCase() === 'eggs');

    try {
      await addProduction({
        date:       form.date,
        notes:      form.notes,
        milkLiters: milkCat ? (Number(values[milkCat._id]) || 0) : 0,
        eggsCount:  eggCat  ? (Number(values[eggCat._id])  || 0) : 0,
        entries,
      });
      setShowForm(false);
      setValues({});
      loadAll();
    } catch {
      alert('Could not save. Please try again.');
    }
  }

  async function handleDeleteRecord(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteProduction(id);
      loadAll();
    } catch {
      alert('Could not delete.');
    }
  }

  // ---- Category management ----
  function handleCatFormChange(e) {
    setCatForm({ ...catForm, [e.target.name]: e.target.value });
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!catForm.name.trim() || !catForm.unit.trim()) {
      return alert('Category name and unit are required.');
    }
    try {
      await addCategory(catForm);
      setCatForm(emptyCatForm);
      setShowCatAdd(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add category.');
    }
  }

  async function handleDeleteCategory(id, name) {
    if (!window.confirm(`Delete category "${name}"? Past records won't be affected.`)) return;
    try {
      await deleteCategory(id);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete category.');
    }
  }

  // ---- Filter logic ----
  const filtered = records.filter(r => {
    const d = new Date(r.date);
    if (filterMode === 'day') return r.date?.slice(0,10) === filterDay;
    if (filterMode === 'month') {
      const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      return ym === filterMonth;
    }
    return true;
  });

  // ---- Summary totals per category (from filtered) ----
  function getCategoryTotal(catName) {
    return filtered.reduce((sum, r) => {
      const entry = r.entries?.find(e =>
        e.categoryName?.toLowerCase() === catName.toLowerCase()
      );
      return sum + (entry?.value || 0);
    }, 0);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', {
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

      {/* ---- HEADER ---- */}
      <div className="page-header">
        <h1 className="page-title">🌾 Production</h1>
        <div className="header-btns">
            <AdminOnly>

          <button
            className="btn btn-secondary"
            onClick={() => setShowCatMgr(!showCatMgr)}
          >
            ⚙️ Categories
          </button>
          <button
            className="btn btn-primary"
            onClick={() => showForm ? setShowForm(false) : openAddForm()}
          >
            {showForm ? '✕ Cancel' : '+ Add Entry'}
          </button>
            </AdminOnly>

        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* ---- CATEGORY MANAGER PANEL ---- */}
      {showCatMgr && (
        <div className="card cat-manager">
          <div className="cat-manager-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              ⚙️ Manage Categories
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCatAdd(!showCatAdd)}
            >
              {showCatAdd ? '✕ Cancel' : '+ New Category'}
            </button>
          </div>

          {/* Add new category form */}
          {showCatAdd && (
            <form onSubmit={handleAddCategory} className="cat-add-form">
              <div className="cat-form-row">

                {/* Emoji picker */}
                <div className="form-group">
                  <label>Emoji</label>
                  <div className="emoji-picker">
                    {EMOJI_OPTIONS.map(em => (
                      <button
                        key={em}
                        type="button"
                        className={`emoji-opt ${catForm.emoji === em ? 'selected' : ''}`}
                        onClick={() => setCatForm({ ...catForm, emoji: em })}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cat-inputs-row">
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      name="name"
                      value={catForm.name}
                      onChange={handleCatFormChange}
                      placeholder="e.g. Guava, Meat, Honey"
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit *</label>
                    <input
                      name="unit"
                      value={catForm.unit}
                      onChange={handleCatFormChange}
                      placeholder="e.g. kg, liters, pieces"
                    />
                  </div>
                </div>

              </div>
              <button type="submit" className="btn btn-primary">
                ✅ Add Category
              </button>
            </form>
          )}

          {/* List of existing categories */}
          <div className="cat-list">
            {categories.map(cat => (
              <div key={cat._id} className="cat-item">
                <span className="cat-emoji">{cat.emoji}</span>
                <div className="cat-info">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-unit">per {cat.unit}</span>
                </div>
                {cat.isDefault ? (
                  <span className="cat-default-badge">Built-in</span>
                ) : (
                  <button
                    className="cat-delete-btn"
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- ADD PRODUCTION FORM ---- */}
      {showForm && (
        <div className="card form-card">
          <h2 className="section-title">➕ Add Production Entry</h2>
          <form onSubmit={handleSubmit}>

            {/* Date + Notes */}
            <div className="grid-2">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  name="notes"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any observations..."
                />
              </div>
            </div>

            {/* Dynamic category inputs */}
            <div className="cat-inputs-grid">
              {categories.map(cat => (
                <div key={cat._id} className="cat-value-input">
                  <label>
                    <span className="cat-input-emoji">{cat.emoji}</span>
                    {cat.name}
                    <span className="cat-input-unit">({cat.unit})</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={values[cat._id] || ''}
                    onChange={e => handleValueChange(cat._id, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary">
              ✅ Save Entry
            </button>
          </form>
        </div>
      )}

      {/* ---- SUMMARY CARDS (per category) ---- */}
      <div className="prod-summary">
        {categories.map(cat => (
          <div key={cat._id} className="prod-stat-card">
            <div className="prod-stat-icon">{cat.emoji}</div>
            <div className="prod-stat-value">
              {getCategoryTotal(cat.name).toFixed(
                cat.unit === 'count' || cat.unit === 'pieces' ? 0 : 1
              )}
              <span className="prod-stat-unit"> {cat.unit}</span>
            </div>
            <div className="prod-stat-label">{cat.name} · {filterLabel()}</div>
          </div>
        ))}
      </div>

      {/* ---- DATE FILTER BAR ---- */}
      <div className="card filter-bar-card">
        <div className="filter-mode-tabs">
          <button className={`fmode-btn ${filterMode==='all'   ?'active':''}`} onClick={()=>setFilterMode('all')}>📋 All Time</button>
          <button className={`fmode-btn ${filterMode==='day'   ?'active':''}`} onClick={()=>setFilterMode('day')}>📅 By Day</button>
          <button className={`fmode-btn ${filterMode==='month' ?'active':''}`} onClick={()=>setFilterMode('month')}>🗓️ By Month</button>
        </div>
        {filterMode==='day' && (
          <div className="date-picker-row">
            <label>Select date:</label>
            <input type="date" value={filterDay} onChange={e=>setFilterDay(e.target.value)}/>
          </div>
        )}
        {filterMode==='month' && (
          <div className="date-picker-row">
            <label>Select month:</label>
            <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}/>
          </div>
        )}
        <div className="filter-result-summary">
          <span className="filter-showing">Showing: <strong>{filterLabel()}</strong></span>
          <span className="filter-total">{filtered.length} entries</span>
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
                  {categories.map(cat => (
                    <th key={cat._id}>{cat.emoji} {cat.name}</th>
                  ))}
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td className="date-cell">{formatDate(r.date)}</td>
                    {categories.map(cat => {
                      const entry = r.entries?.find(
                        e => e.categoryName?.toLowerCase() === cat.name.toLowerCase()
                      );
                      const val = entry?.value || 0;
                      return (
                        <td key={cat._id} className="num-cell">
                          {val > 0
                            ? <span className="prod-val">{val} <span className="prod-unit">{cat.unit}</span></span>
                            : <span className="prod-dash">—</span>
                          }
                        </td>
                      );
                    })}
                    <td className="notes-cell">{r.notes || '—'}</td>
                    <td>
                      <AdminOnly>

                      <button
                        className="btn btn-danger delete-btn"
                        onClick={() => handleDeleteRecord(r._id)}
                      >
                        🗑️
                      </button>
                      </AdminOnly>

                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Total row */}
              {filtered.length > 1 && (
                <tfoot>
                  <tr className="table-total-row">
                    <td><strong>Total</strong></td>
                    {categories.map(cat => {
                      const total = getCategoryTotal(cat.name);
                      return (
                        <td key={cat._id} className="num-cell">
                          <strong>
                            {total > 0
                              ? `${total.toFixed(cat.unit==='count'||cat.unit==='pieces'?0:1)} ${cat.unit}`
                              : '—'
                            }
                          </strong>
                        </td>
                      );
                    })}
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