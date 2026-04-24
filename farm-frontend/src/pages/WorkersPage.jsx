// src/pages/WorkersPage.jsx
import { useEffect, useState } from 'react';
import {
  getWorkers, addWorker, deleteWorker, markAttendance
} from '../api/api';
import './WorkersPages.css';
import AdminOnly from '../components/AdminOnly';


const emptyForm = { name: '', phone: '', role: '', monthlySalary: '' };

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Each worker gets a unique avatar color based on their name
const AVATAR_COLORS = [
  '#2d6a4f','#7F77DD','#854F0B','#185FA5',
  '#993C1D','#0F6E56','#993556','#444441'
];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function WorkersPage() {
  const [workers,   setWorkers]   = useState([]);
  const [form,      setForm]      = useState(emptyForm);
  const [showForm,  setShowForm]  = useState(false);
  const [expanded,  setExpanded]  = useState(null); // worker _id that is expanded
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [today]                   = useState(getTodayDate());

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
      alert('Could not save worker.');
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove worker "${name}"?`)) return;
    try {
      await deleteWorker(id);
      if (expanded === id) setExpanded(null);
      fetchWorkers();
    } catch {
      alert('Could not delete.');
    }
  }

  // Mark present or absent for today
  async function handleAttendance(workerId, status) {
    try {
      await markAttendance(workerId, { date: today, present: status });
      fetchWorkers();
    } catch {
      alert('Could not mark attendance.');
    }
  }

  // Toggle expand/collapse for a worker row
  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id);
  }

  // ---- Helper functions ----
  function getTodayStatus(worker) {
    const rec = worker.attendance?.find(
      a => new Date(a.date).toDateString() === new Date(today).toDateString()
    );
    if (!rec) return null;       // not marked
    return rec.present;          // true = present, false = absent
  }

  function monthlyDaysPresent(worker) {
    const m = new Date().getMonth();
    const y = new Date().getFullYear();
    return (worker.attendance || []).filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === m && d.getFullYear() === y && a.present;
    }).length;
  }

  function workingDaysThisMonth() {
    // Days elapsed in current month so far
    return new Date().getDate();
  }

  function earnedSoFar(worker) {
    const days = monthlyDaysPresent(worker);
    return Math.round((worker.monthlySalary / 30) * days);
  }

  // ---- Summary numbers ----
  const totalSalary   = workers.reduce((s, w) => s + w.monthlySalary, 0);
  const presentToday  = workers.filter(w => getTodayStatus(w) === true).length;
  const absentToday   = workers.filter(w => getTodayStatus(w) === false).length;
  const workingDays   = workingDaysThisMonth();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👷 Workers</h1>
        <AdminOnly>

        <button
          className="btn btn-primary"
          onClick={() => { setForm(emptyForm); setShowForm(!showForm); }}
        >
          {showForm ? '✕ Cancel' : '+ Add Worker'}
        </button>
        </AdminOnly>

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

      {/* ---- SUMMARY CARDS ---- */}
      <div className="workers-summary">
        <div className="wsummary-item">
          <span className="wsummary-icon">👷</span>
          <div>
            <div className="wsummary-value">{workers.length}</div>
            <div className="wsummary-label">Total workers</div>
          </div>
        </div>
        <div className="wsummary-item">
          <span className="wsummary-icon">✅</span>
          <div>
            <div className="wsummary-value">{presentToday}</div>
            <div className="wsummary-label">Present today</div>
          </div>
        </div>
        <div className="wsummary-item">
          <span className="wsummary-icon">❌</span>
          <div>
            <div className="wsummary-value">{absentToday}</div>
            <div className="wsummary-label">Absent today</div>
          </div>
        </div>
        <div className="wsummary-item">
          <span className="wsummary-icon">💰</span>
          <div>
            <div className="wsummary-value">₹{totalSalary.toLocaleString()}</div>
            <div className="wsummary-label">Monthly payroll</div>
          </div>
        </div>
      </div>

      {/* ---- WORKERS TABLE ---- */}
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
        <div className="card workers-table-card">
          <div className="table-wrap">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Salary</th>
                  <th>This month</th>
                  <th>Today</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => {
                  const status      = getTodayStatus(worker);
                  const daysPresent = monthlyDaysPresent(worker);
                  const earned      = earnedSoFar(worker);
                  const remaining   = worker.monthlySalary - earned;
                  const isExpanded  = expanded === worker._id;
                  const progress    = workingDays > 0
                    ? Math.round((daysPresent / workingDays) * 100)
                    : 0;

                  return (
                    <>
                      {/* ---- MAIN ROW ---- */}
                      <tr
                        key={worker._id}
                        className={`worker-row ${isExpanded ? 'row-expanded' : ''}`}
                        onClick={() => toggleExpand(worker._id)}
                      >
                        {/* Name + avatar */}
                        <td>
                          <div className="name-cell">
                            <div
                              className="w-avatar"
                              style={{ background: avatarColor(worker.name) }}
                            >
                              {worker.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="w-name">{worker.name}</div>
                              <div className="w-sub">
                                {worker.role || 'Farm Worker'}
                                {worker.phone && ` · 📞 ${worker.phone}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Salary */}
                        <td>
                          <div className="w-salary">
                            ₹{worker.monthlySalary.toLocaleString()}
                          </div>
                          <div className="w-sub">per month</div>
                        </td>

                        {/* Days present + progress bar */}
                        <td>
                          <div className="w-days">
                            {daysPresent} / {workingDays} days
                          </div>
                          <div className="progress-bg">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${progress}%`,
                                background: avatarColor(worker.name)
                              }}
                            />
                          </div>
                          <div className="w-sub">
                            ₹{earned.toLocaleString()} earned
                          </div>
                        </td>

                        {/* Today's attendance pill */}
                        <td onClick={e => e.stopPropagation()}>
                          <AttendancePill
                            status={status}
                            onPresent={() => handleAttendance(worker._id, true)}
                            onAbsent={()  => handleAttendance(worker._id, false)}
                          />
                        </td>

                        {/* Expand toggle */}
                        <td>
                          <button
                            className={`expand-btn ${isExpanded ? 'open' : ''}`}
                            onClick={e => { e.stopPropagation(); toggleExpand(worker._id); }}
                          >
                            ▾
                          </button>
                        </td>
                      </tr>

                      {/* ---- EXPANDED PANEL ---- */}
                      {isExpanded && (
                        <tr key={`${worker._id}-exp`} className="expanded-row">
                          <td colSpan="5" style={{ padding: 0 }}>
                            <div className="expanded-panel">

                              {/* Stats row */}
                              <div className="exp-stats">
                                <div className="exp-stat">
                                  <div className="exp-stat-value">{daysPresent}</div>
                                  <div className="exp-stat-label">Days present</div>
                                </div>
                                <div className="exp-stat">
                                  <div className="exp-stat-value">
                                    {workingDays - daysPresent}
                                  </div>
                                  <div className="exp-stat-label">Days absent</div>
                                </div>
                                <div className="exp-stat">
                                  <div className="exp-stat-value">
                                    ₹{earned.toLocaleString()}
                                  </div>
                                  <div className="exp-stat-label">Earned so far</div>
                                </div>
                                <div className="exp-stat">
                                  <div className="exp-stat-value">
                                    ₹{remaining.toLocaleString()}
                                  </div>
                                  <div className="exp-stat-label">Remaining</div>
                                </div>
                              </div>

                              {/* Attendance marking + delete */}
                              <div className="exp-actions">
                                <span className="exp-action-label">
                                  Mark today's attendance:
                                </span>

                                {/* Toggle button group */}
                                <AdminOnly>

                                <div className="att-toggle-group">
                                  <button
                                    className={`att-opt ${status === true ? 'att-present-active' : ''}`}
                                    onClick={() => handleAttendance(worker._id, true)}
                                  >
                                    ✅ Present
                                  </button>
                                  <button
                                    className={`att-opt ${status === false ? 'att-absent-active' : ''}`}
                                    onClick={() => handleAttendance(worker._id, false)}
                                  >
                                    ❌ Absent
                                  </button>
                                </div>

                                <button
                                  className="remove-btn"
                                  onClick={() => handleDelete(worker._id, worker.name)}
                                >
                                  🗑️ Remove worker
                                </button>
                                </AdminOnly>

                              </div>
                              
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Small component for the today pill in the table ----
function AttendancePill({ status, onPresent, onAbsent }) {
  if (status === true) {
    return (
      <span className="att-pill present" onClick={onAbsent} title="Click to mark absent">
        <span className="att-dot green" /> Present
      </span>
    );
  }
  if (status === false) {
    return (
      <span className="att-pill absent" onClick={onPresent} title="Click to mark present">
        <span className="att-dot red" /> Absent
      </span>
    );
  }
  return (
    <span className="att-pill unmarked" onClick={onPresent} title="Click to mark present">
      <span className="att-dot gray" /> Not marked
    </span>
  );
}

export default WorkersPage;