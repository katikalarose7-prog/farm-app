// src/pages/WorkersPage.jsx
import { useEffect, useState } from 'react';
import {
  getWorkers,
  addWorker,
  deleteWorker,
  markAttendance
} from '../api/api';
import './WorkersPages.css';

const emptyForm = { name: '', phone: '', role: '', monthlySalary: '' };

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function WorkersPage() {
  const [workers, setWorkers]     = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [today] = useState(getTodayDate());

  useEffect(() => { fetchWorkers(); }, []);

  async function fetchWorkers() {
    try {
      setLoading(true);
      const res = await getWorkers();
      setWorkers(res.data);
    } catch {
      setError('Could not load workers. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.monthlySalary) {
      return alert('Name and salary are required!');
    }
    try {
      await addWorker({ ...form, monthlySalary: Number(form.monthlySalary) });
      setForm(emptyForm);
      setShowForm(false);
      fetchWorkers();
    } catch {
      alert('Could not save worker. Please try again.');
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove worker "${name}"?`)) return;
    try {
      await deleteWorker(id);
      fetchWorkers();
    } catch {
      alert('Could not delete.');
    }
  }

  // Mark or toggle attendance for a worker for today
  async function handleAttendance(workerId, currentStatus) {
    try {
      await markAttendance(workerId, {
        date: today,
        present: !currentStatus   // Toggle present/absent
      });
      fetchWorkers();
    } catch {
      alert('Could not mark attendance.');
    }
  }

  // Check if a worker is marked present today
  function isTodayPresent(worker) {
    const todayRecord = worker.attendance?.find(
      a => new Date(a.date).toDateString() === new Date(today).toDateString()
    );
    return todayRecord?.present ?? null; // null = not marked yet
  }

  // Count how many days present this month
  function monthlyAttendanceCount(worker) {
    const thisMonth = new Date().getMonth();
    const thisYear  = new Date().getFullYear();
    return (worker.attendance || []).filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === thisMonth &&
             d.getFullYear() === thisYear &&
             a.present === true;
    }).length;
  }

  // Calculate earned salary based on days present vs working days this month
  function calculateEarned(worker) {
    const daysPresent = monthlyAttendanceCount(worker);
    const today       = new Date();
    // Working days so far this month (approximate: just calendar days)
    const dayOfMonth  = today.getDate();
    if (dayOfMonth === 0) return 0;
    const perDay = worker.monthlySalary / 30;
    return Math.round(perDay * daysPresent);
  }

  // Total salary of all workers
  const totalSalary = workers.reduce((s, w) => s + w.monthlySalary, 0);

  // How many marked present today
  const presentToday = workers.filter(w => isTodayPresent(w) === true).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👷 Workers</h1>
        <button
          className="btn btn-primary"
          onClick={() => { setForm(emptyForm); setShowForm(!showForm); }}
        >
          {showForm ? '✕ Cancel' : '+ Add Worker'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* ---- ADD FORM ---- */}
      {showForm && (
        <div className="card form-card">
          <h2 className="section-title">➕ Add New Worker</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Raju Kumar"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Milkman, Guard, Helper"
                />
              </div>
              <div className="form-group">
                <label>Monthly Salary (₹) *</label>
                <input
                  name="monthlySalary"
                  type="number"
                  value={form.monthlySalary}
                  onChange={handleChange}
                  placeholder="e.g. 8000"
                  min="0"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              ✅ Add Worker
            </button>
          </form>
        </div>
      )}

      {/* ---- SUMMARY BAR ---- */}
      <div className="workers-summary">
        <div className="wsummary-item">
          <span className="wsummary-icon">👷</span>
          <div>
            <div className="wsummary-value">{workers.length}</div>
            <div className="wsummary-label">Total Workers</div>
          </div>
        </div>
        <div className="wsummary-item">
          <span className="wsummary-icon">✅</span>
          <div>
            <div className="wsummary-value">{presentToday}</div>
            <div className="wsummary-label">Present Today</div>
          </div>
        </div>
        <div className="wsummary-item">
          <span className="wsummary-icon">❌</span>
          <div>
            <div className="wsummary-value">{workers.length - presentToday}</div>
            <div className="wsummary-label">Absent / Not Marked</div>
          </div>
        </div>
        <div className="wsummary-item">
          <span className="wsummary-icon">💰</span>
          <div>
            <div className="wsummary-value">₹{totalSalary.toLocaleString()}</div>
            <div className="wsummary-label">Total Monthly Salary</div>
          </div>
        </div>
      </div>

      {/* ---- WORKER CARDS ---- */}
      {loading ? (
        <p className="loading-text">Loading workers...</p>
      ) : workers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👷</div>
          <p>No workers added yet.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add first worker
          </button>
        </div>
      ) : (
        <div className="workers-grid">
          {workers.map(worker => {
            const todayStatus  = isTodayPresent(worker);
            const daysPresent  = monthlyAttendanceCount(worker);
            const earned       = calculateEarned(worker);

            return (
              <div key={worker._id} className="worker-card">

                {/* ---- TOP: Avatar + Info ---- */}
                <div className="worker-top">
                  <div className="worker-avatar">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="worker-info">
                    <h3 className="worker-name">{worker.name}</h3>
                    <span className="worker-role">
                      {worker.role || 'Farm Worker'}
                    </span>
                    {worker.phone && (
                      <span className="worker-phone">📞 {worker.phone}</span>
                    )}
                  </div>
                  <div className="worker-salary">
                    <div className="salary-amount">
                      ₹{worker.monthlySalary.toLocaleString()}
                    </div>
                    <div className="salary-label">per month</div>
                  </div>
                </div>

                {/* ---- ATTENDANCE STATS ---- */}
                <div className="worker-stats">
                  <div className="wstat">
                    <span className="wstat-value">{daysPresent}</span>
                    <span className="wstat-label">Days present</span>
                  </div>
                  <div className="wstat">
                    <span className="wstat-value">₹{earned.toLocaleString()}</span>
                    <span className="wstat-label">Earned so far</span>
                  </div>
                  <div className="wstat">
                    <span className="wstat-value">
                      ₹{(worker.monthlySalary - earned).toLocaleString()}
                    </span>
                    <span className="wstat-label">Remaining</span>
                  </div>
                </div>

                {/* ---- TODAY'S ATTENDANCE BUTTON ---- */}
                <div className="attendance-row">
                  <span className="attendance-label">Today's attendance:</span>
                  <div className="attendance-buttons">
                    <button
                      className={`att-btn present ${todayStatus === true ? 'active' : ''}`}
                      onClick={() => handleAttendance(worker._id, todayStatus === true)}
                    >
                      ✅ Present
                    </button>
                    <button
                      className={`att-btn absent ${todayStatus === false ? 'active' : ''}`}
                      onClick={() => handleAttendance(worker._id, todayStatus === false ? null : false)}
                    >
                      ❌ Absent
                    </button>
                  </div>
                </div>

                {/* ---- FOOTER: Delete ---- */}
                <div className="worker-footer">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(worker._id, worker.name)}
                  >
                    🗑️ Remove Worker
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkersPage;