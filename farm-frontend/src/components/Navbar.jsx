// src/components/Navbar.jsx
// The navigation bar shown at the top on every page.
// On mobile it becomes a bottom tab bar for easy thumb access.

import { NavLink } from 'react-router-dom';
import './Navbar.css';

import { useTranslation } from '../i18n';


const links = [
  { to: '/',           label: '🏠 Home'       },
  { to: '/livestock',  label: '🐐 Livestock'  },
  { to: '/production', label: '🥛 Production' },
  { to: '/workers',    label: '👷 Workers'    },
  { to: '/expenses',   label: '💰 Expenses'   },
];

function Navbar() {
    const { lang, setLang } = useTranslation();

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">🌾 Farm Manager</span>

        {/* ---- LANGUAGE SWITCHER ---- */}
        <div className="lang-switcher">
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >EN</button>
          <button
            className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
            onClick={() => setLang('hi')}
          >हि</button>
          <button
            className={`lang-btn ${lang === 'te' ? 'active' : ''}`}
            onClick={() => setLang('te')}
          >తె</button>
        </div>

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