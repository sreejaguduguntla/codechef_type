import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const CodeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="url(#grad)" />
    <text x="5" y="20" fontSize="14" fontWeight="700" fill="white" fontFamily="JetBrains Mono">{'</>'}</text>
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="28" y2="28">
        <stop offset="0%" stopColor="#4f8ef7" />
        <stop offset="100%" stopColor="#22d3a5" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Problems', path: '/problems' },
    { label: 'Leaderboard', path: '/leaderboard' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ label: 'Admin', path: '/admin' });
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <CodeIcon />
          <span className="brand-name">Code<span className="brand-accent">Arena</span></span>
        </Link>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to={`/profile/${user.username}`} className="nav-avatar" title={user.username}>
                <span>{user.username[0].toUpperCase()}</span>
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="mobile-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="mobile-divider" />
          {user ? (
            <>
              <Link to={`/profile/${user.username}`} className="mobile-link" onClick={() => setMenuOpen(false)}>
                Profile ({user.username})
              </Link>
              <button className="mobile-link" onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
