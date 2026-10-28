import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, UserCheck } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

export default function ProtectedLayout({ requiredRole = null }) {
  const { user, isAuthenticated, login, switchRole } = useAuth();
  const location = useLocation();

  // If completely unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <Card className="auth-gate-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 1.5rem', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            This section is protected by InternShield AI. Please sign in to access personalized scan history and reports.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button 
              variant="primary" 
              onClick={() => login('demo.student@college.edu', 'password', 'student')}
              icon={<UserCheck size={18} />}
            >
              Quick Demo Access as Student
            </Button>
            <Button 
              variant="outline" 
              onClick={() => login('security.admin@internshield.ai', 'password', 'admin')}
            >
              Demo Access as Security Admin
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If specific role is required (like admin) and current user is not admin
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <Card className="auth-gate-card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 1.5rem', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Clearance Required</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            You are logged in as a <strong>Student</strong> (<code>{user.email}</code>). The moderation portal requires Security Admin privileges.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button 
              variant="primary" 
              onClick={() => switchRole('admin')}
            >
              Elevate to Admin Role (Demo Mode)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
