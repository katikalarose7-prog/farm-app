// src/components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '../api/api';
import './Navbar.css';

const links = [
  { to: '/dashboard',            label: '🏠 Home'       },
  { to: '/dashboard/livestock',  label: '🐐 Livestock'  },
  { to: '/dashboard/production', label: '🌾 Production' },
  { to: '/dashboard/workers',    label: '👷 Workers'    },
  { to: '/dashboard/expenses',   label: '💰 Expenses'   },
];



function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate                  = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for new orders every 30 seconds
  useEffect(() => {
    if (!isAdmin) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  async function fetchUnread() {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {
      // silent fail
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">🌾 Tully Farm</span>

        <div className="navbar-links">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Orders link with notification bell */}
          {isAdmin && (
            <NavLink
              to="/dashboard/orders"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              📦 Orders
              {unreadCount > 0 && (
                <span className="nav-notif-badge">{unreadCount}</span>
              )}
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/dashboard/users"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              👥 Users
            </NavLink>
          )}
        </div>

        <div className="navbar-user">
          <span className="navbar-username">👤 {user?.name}</span>
          <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-guest'}`}>
            {isAdmin ? '🔑 Admin' : '👁️ Guest'}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      <nav className="bottom-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              isActive ? 'bottom-link active' : 'bottom-link'
            }
          >
            {link.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              isActive ? 'bottom-link active' : 'bottom-link'
            }
            style={{ position: 'relative' }}
          >
            📦 Orders
            {unreadCount > 0 && (
              <span className="bottom-notif-badge">{unreadCount}</span>
            )}
          </NavLink>
        )}
        <button className="bottom-link bottom-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </nav>
    </>
  );
}

export default Navbar;