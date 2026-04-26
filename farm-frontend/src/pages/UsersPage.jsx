// src/pages/UsersPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserRole } from '../api/api'; // adjust path
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function UsersPage() {
  const { isAdmin, user } = useAuth();
  const navigate          = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    fetchUsers();
  }, [isAdmin]);

  /*async function fetchUsers() {
    try {
      const res = await axios.get(`${BASE_URL}/auth/users`);
      setUsers(res.data);
    } catch {
      alert('Could not load users.');
    } finally {
      setLoading(false);
    }
  }*/
 async function fetchUsers() {
  try {
    const res = await getAllUsers();
    setUsers(res.data);
  } catch {
    alert('Could not load users.');
  } finally {
    setLoading(false);
  }
}

  async function handleRoleChange(id, newRole) {
    try {
      await axios.put(`${BASE_URL}/auth/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update role.');
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  const AVATAR_COLORS = ['#2d6a4f','#7F77DD','#854F0B','#185FA5','#993C1D'];
  function avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  // Separate admins/guests from customers
  const farmUsers     = users.filter(u => u.role !== 'customer');
  const customerUsers = users.filter(u => u.role === 'customer');

  return (
    <div className="page">
      <h1 className="page-title">👥 Manage Users</h1>

      {loading ? (
        <p className="loading-text">Loading users...</p>
      ) : (
        <>
          {/* ---- Farm Staff (admin/guest) ---- */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 className="section-title">🔑 Farm Staff</h2>
            <div className="table-wrap">
              <table style={{
                width: '100%', borderCollapse: 'collapse', fontSize: 14
              }}>
                <thead>
                  <tr>
                    {['User','Email','Role','Joined','Change Role'].map(h => (
                      <th key={h} style={{
                        background: '#f7fafc',
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#4a5568',
                        borderBottom: '2px solid #e2e8f0',
                        whiteSpace: 'nowrap'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {farmUsers.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: avatarColor(u.name),
                            color: 'white', fontWeight: 700, fontSize: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{u.name}</div>
                            {u._id === user._id && (
                              <div style={{ fontSize: 11, color: '#718096' }}>You</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#4a5568' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: u.role === 'admin' ? '#c6f6d5' : '#fefcbf',
                          color: u.role === 'admin' ? '#22543d' : '#744210',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600
                        }}>
                          {u.role === 'admin' ? '🔑 Admin' : '👁️ Guest'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#718096', fontSize: 13 }}>
                        {formatDate(u.createdAt)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {u._id === user._id ? (
                          <span style={{ fontSize: 12, color: '#a0aec0' }}>—</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            style={{
                              padding: '6px 10px', borderRadius: 7,
                              border: '1.5px solid #e2e8f0', fontSize: 13,
                              cursor: 'pointer', background: 'white',
                              color: '#2d3748'
                            }}
                          >
                            <option value="guest">👁️ Guest</option>
                            <option value="admin">🔑 Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---- Customers ---- */}
          <div className="card">
            <h2 className="section-title">
              🛒 Customers ({customerUsers.length})
            </h2>
            {customerUsers.length === 0 ? (
              <p style={{ color: '#a0aec0', fontSize: 14 }}>
                No customers registered yet.
              </p>
            ) : (
              <div className="table-wrap">
                <table style={{
                  width: '100%', borderCollapse: 'collapse', fontSize: 14
                }}>
                  <thead>
                    <tr>
                      {['Customer','Email','Phone','Address','Joined'].map(h => (
                        <th key={h} style={{
                          background: '#f7fafc',
                          padding: '10px 14px',
                          textAlign: 'left',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#4a5568',
                          borderBottom: '2px solid #e2e8f0',
                          whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customerUsers.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: avatarColor(u.name),
                              color: 'white', fontWeight: 700, fontSize: 13,
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center', flexShrink: 0
                            }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#4a5568' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#4a5568' }}>
                          {u.phone || '—'}
                        </td>
                        <td style={{
                          padding: '12px 14px', color: '#4a5568',
                          fontSize: 13, maxWidth: 180
                        }}>
                          {u.address || '—'}
                        </td>
                        <td style={{
                          padding: '12px 14px', color: '#718096', fontSize: 13
                        }}>
                          {formatDate(u.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UsersPage;