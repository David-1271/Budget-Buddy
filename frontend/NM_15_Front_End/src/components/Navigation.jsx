import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navigation.css';
import logo from '../assets/budget_buddy_icon_white.png';

function Navigation({ user, onLogout }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setIsMenuOpen(false);

  if (!user) {
    // Show minimal nav for unauthenticated users
    return (
      <nav className="navbar">
        <div className="nav-brand">
          <img src={logo} alt="Budget Buddy Logo" className="nav-logo" />
          <Link to="/">Budget Buddy</Link>
        </div>
        <div className="nav-links">
          <Link
            to="/login"
            className={isActive('/login') ? 'nav-link active' : 'nav-link'}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={isActive('/signup') ? 'nav-link active' : 'nav-link'}
          >
            Sign Up
          </Link>
        </div>
      </nav>
    );
  }

  // Show full nav for authenticated users
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src={logo} alt="Budget Buddy Logo" className="nav-logo" />
        <Link to="/">Budget Buddy</Link>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
        <div className="nav-links">
          <Link
            to="/dashboard"
            className={isActive('/dashboard') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            Dashboard
          </Link>
          <Link
            to="/budget"
            className={isActive('/budget') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            Budget
          </Link>
          <Link
            to="/transaction-history"
            className={isActive('/transaction-history') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            Transactions
          </Link>
          <Link
            to="/smart-spending"
            className={isActive('/smart-spending') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            Smart Spending
          </Link>

          <Link
            to="/investment"
            className={isActive('/investment') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            Investment
          </Link>
          
          <Link
            to="/backup-restore"
            className={isActive('/backup-restore') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            Backup
          </Link>
          <Link
            to="/about"
            className={isActive('/about') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            About
          </Link>
          <Link
            to="/profile"
            className={isActive('/profile') ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            Profile
          </Link>
        </div>
        
        <div className="nav-actions">
          {user.role === 'admin' && (
            <span className="admin-tag">Admin</span>
          )}
          <button
            onClick={() => {
              closeMenu();
              onLogout();
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;