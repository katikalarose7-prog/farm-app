// src/components/Navbar.jsx
// The navigation bar shown at the top on every page.
// On mobile it becomes a bottom tab bar for easy thumb access.

import { NavLink } from 'react-router-dom';
import './Navbar.css';

const links = [
  { to: '/',           label: '🏠 Home'       },
  { to: '/livestock',  label: '🐐 Livestock'  },
  { to: '/production', label: '🥛 Production' },
  { to: '/workers',    label: '👷 Workers'    },
  { to: '/expenses',   label: '💰 Expenses'   },
];

function Navbar() {
  return (
    <>
      {/* Top bar (desktop) */}
      <nav className="navbar">
        <span className="navbar-brand">🌾 Tully's Farm</span>
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
        </div>
      </nav>

      {/* Bottom tab bar (mobile) */}
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
      </nav>
    </>
    
  );
}

export default Navbar;