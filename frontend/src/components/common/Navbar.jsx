import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut, CheckCircle, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { checkBackendHealth } from '../../services/api';
import Button from './Button';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function ping() {
      const res = await checkBackendHealth();
      setBackendOnline(res.status === 'online');
    }
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) => 
    `nav-item ${isActive ? 'nav-item-active' : ''}`;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <div className="brand-logo-glow">
            <Shield size={22} className="brand-logo-icon" />
          </div>
          <span className="brand-title">InternShield <span className="brand-accent">AI</span></span>
          <span className="brand-tag">CyberSec</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-only">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/scanner" className={navLinkClass}>Scanner</NavLink>
          <NavLink to="/community" className={navLinkClass}>Community Reports</NavLink>
          <NavLink to="/guidelines" className={navLinkClass}>Safety Tips</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          )}
        </div>

        {/* Desktop Actions & Status */}
        <div className="nav-right desktop-only">
          {/* Health indicator */}
          <div className="server-status-pill" title={backendOnline ? 'Backend Express API is running' : 'Backend offline or connecting'}>
            <span className={`status-indicator ${backendOnline ? 'status-green' : 'status-amber'}`} />
            <span className="status-label">{backendOnline ? 'API 5000' : 'Demo API'}</span>
          </div>

          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-badge" title={`Logged in as ${user.email}`}>
                <User size={15} />
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <span className={`user-role-tag ${user.role === 'admin' ? 'role-admin' : 'role-student'}`}>
                  {user.role}
                </span>
              </div>

              {/* Quick role toggle for hackathon demonstration */}
              <button 
                type="button"
                className="role-switcher-btn"
                onClick={() => switchRole(user.role === 'admin' ? 'student' : 'admin')}
                title="Switch role for testing"
              >
                Switch to {user.role === 'admin' ? 'Student' : 'Admin'}
              </button>

              <button 
                type="button" 
                className="btn-logout-icon" 
                onClick={handleLogout} 
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Protected</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          type="button" 
          className="mobile-toggle mobile-only"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="mobile-drawer mobile-only">
          <NavLink to="/" className={navLinkClass} onClick={() => setMenuOpen(false)} end>Home</NavLink>
          <NavLink to="/scanner" className={navLinkClass} onClick={() => setMenuOpen(false)}>Scanner</NavLink>
          <NavLink to="/community" className={navLinkClass} onClick={() => setMenuOpen(false)}>Community Reports</NavLink>
          <NavLink to="/guidelines" className={navLinkClass} onClick={() => setMenuOpen(false)}>Safety Tips</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin Panel</NavLink>
          )}

          <div className="mobile-drawer-footer">
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{user.name} ({user.role})</span>
                  <button 
                    type="button"
                    className="role-switcher-btn"
                    onClick={() => switchRole(user.role === 'admin' ? 'student' : 'admin')}
                  >
                    Role: {user.role}
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} icon={<LogOut size={16} />}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" style={{ width: '100%' }}>Login</Button>
                </Link>
                <Link to="/register" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>
                  <Button variant="primary" size="sm" style={{ width: '100%' }}>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
