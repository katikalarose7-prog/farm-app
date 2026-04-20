// src/components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const links = [
  { to: '/',           label: '🏠 Home'       },
  { to: '/livestock',  label: '🐐 Livestock'  },
  { to: '/production', label: '🥛 Production' },
  { to: '/workers',    label: '👷 Workers'    },
  { to: '/expenses',   label: '💰 Expenses'   },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">🌾 Tully's Farm</span>

        <div className="navbar-links">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* User info + logout */}
        <div className="navbar-user">
          <span className="navbar-username">👤 {user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Bottom tab bar (mobile) */}
      <nav className="bottom-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}
          >
            {link.label}
          </NavLink>
        ))}
        {/* Logout tab on mobile */}
        <button className="bottom-link bottom-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </nav>
    </>
  );
}

export default Navbar;