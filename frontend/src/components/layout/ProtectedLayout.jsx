import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, LogIn } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ProtectedLayout({ requiredRole = null }) {
  const { user, isAuthenticated, loading, loginAsDemo } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Verifying authentication credentials..." />
      </div>
    );
  }

  // If unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <Card className="auth-gate-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 1.5rem', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            This section is protected by InternShield AI. Please sign in to access your personal threat dashboard, scan history, and saved bookmarks.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button 
                variant="primary" 
                icon={<LogIn size={18} />}
                style={{ width: '100%' }}
              >
                Sign In with Account
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => loginAsDemo('student')}
            >
              1-Click Demo Login as Student
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If specific role is required (e.g. admin) and current user is not admin
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <Card className="auth-gate-card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 1.5rem', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Clearance Required</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            You are logged in as a <strong>Student</strong> (<code>{user.email}</code>). The moderation portal requires Security Administrator privileges.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button 
              variant="primary" 
              onClick={() => loginAsDemo('admin')}
            >
              Switch to Admin Account
            </Button>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="outline">Back to Student Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
