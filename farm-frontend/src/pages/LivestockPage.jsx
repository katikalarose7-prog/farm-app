// src/pages/LivestockPage.jsx
import { useEffect, useState } from 'react';
import {
  getLivestock,
  addLivestock,
  updateLivestock,
  deleteLivestock
} from '../api/api';
import './LivestockPage.css';

import AdminOnly from '../components/AdminOnly';
import { useAuth } from '../context/AuthContext';



// Empty form state — reused for both Add and Edit
const emptyForm = { name: '', type: 'goat', count: '', breed: '', notes: '' };

function LivestockPage() {
  const [animals, setAnimals]       = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editingId, setEditingId]   = useState(null);  // null = adding, id = editing
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const { isAdmin } = useAuth();

  useEffect(() => { fetchAnimals(); }, []);

  async function fetchAnimals() {
    try {
      setLoading(true);
      const res = await getLivestock();
      setAnimals(res.data);
    } catch {
      setError('Could not load animals. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  // Handle any form field change
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Submit — either ADD or UPDATE depending on editingId
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.count) return alert('Name and count are required!');
    try {
      if (editingId) {
        await updateLivestock(editingId, form);
      } else {
        await addLivestock(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAnimals(); // Refresh list
    } catch {
      alert('Something went wrong. Please try again.');
    }
  }

  // Fill form with animal's data for editing
  function handleEdit(animal) {
    setForm({
      name:   animal.name,
      type:   animal.type,
      count:  animal.count,
      breed:  animal.breed || '',
      notes:  animal.notes || ''
    });
    setEditingId(animal._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteLivestock(id);
      fetchAnimals();
    } catch {
      alert('Could not delete. Please try again.');
    }
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  // Total count across all animals
  const totalAnimals = animals.reduce((sum, a) => sum + a.count, 0);

  const animalEmoji = { goat:'🐐', buffalo:'🐃', hen:'🐔', cow:'🐄', other:'🐾' };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🐐 Livestock</h1>
       <AdminOnly>
  <button
    className="btn btn-primary"
    onClick={() => { handleCancel(); setShowForm(!showForm); }}
  >
    {showForm ? '✕ Cancel' : '+ Add Animal'}
  </button>
</AdminOnly>
      </div>

      {error && <div className="error-box">{error}</div>}

      {!isAdmin && (
  <div className="guest-banner">
    👁️ You are in view-only mode. Contact the admin to make changes.
  </div>
)}




      {/* ---- ADD / EDIT FORM ---- */}
      {showForm && (
        <div className="card form-card">
          <h2 className="section-title">
            {editingId ? '✏️ Edit Animal' : '➕ Add New Animal'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Animal Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Nandini"
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="goat">🐐 Goat</option>
                  <option value="buffalo">🐃 Buffalo</option>
                  <option value="hen">🐔 Hen</option>
                  <option value="cow">🐄 Cow</option>
                  <option value="other">🐾 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Count *</label>
                <input
                  name="count"
                  type="number"
                  min="1"
                  value={form.count}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="form-group">
                <label>Breed</label>
                <input
                  name="breed"
                  value={form.breed}
                  onChange={handleChange}
                  placeholder="e.g. Boer, Murrah, Local"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any extra info..."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? '💾 Save Changes' : '✅ Add Animal'}
              </button>
              <button type="button" className="btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- SUMMARY BAR ---- */}
      {animals.length > 0 && (
        <div className="summary-bar">
          <span>Total: <strong>{animals.length} groups</strong></span>
          <span>Animals: <strong>{totalAnimals}</strong></span>
        </div>
      )}

      {/* ---- ANIMAL LIST ---- */}
      {loading ? (
        <p className="loading-text">Loading animals...</p>
      ) : animals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <p>No animals added yet.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add your first animal
          </button>
        </div>
      ) : (
        <div className="animal-grid">
          {animals.map(animal => (
            <div key={animal._id} className="animal-card">
              <div className="animal-card-header">
                <span className="animal-big-emoji">
                  {animalEmoji[animal.type] || '🐾'}
                </span>
                <div className="animal-card-info">
                  <h3 className="animal-card-name">{animal.name}</h3>
                  <span className="badge badge-green">{animal.type}</span>
                </div>
                <div className="animal-card-count">{animal.count}</div>
              </div>

              {(animal.breed || animal.notes) && (
                <div className="animal-card-details">
                  {animal.breed && (
                    <span className="detail-chip">🏷️ {animal.breed}</span>
                  )}
                  {animal.notes && (
                    <span className="detail-chip">📝 {animal.notes}</span>
                  )}
                </div>
              )}

            <div className="animal-card-footer">
  <AdminOnly>
    <button
      className="btn btn-warning"
      onClick={() => handleEdit(animal)}
    >
      ✏️ Edit
    </button>
    <button
      className="btn btn-danger"
      onClick={() => handleDelete(animal._id, animal.name)}
    >
      🗑️ Delete
    </button>
  </AdminOnly>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LivestockPage;