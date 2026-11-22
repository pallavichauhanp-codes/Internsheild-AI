import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (selectedRole) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginAsDemo(selectedRole);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-badge">
              <Shield size={28} />
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to InternShield AI security portal</p>
          </div>

          {/* 1-Click Demo Login Box with real database accounts */}
          <div className="demo-login-box">
            <div className="demo-login-header">
              <span>🚀 1-Click Test Login (Seeded Accounts)</span>
              <span className="demo-badge">Real Auth</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Button 
                variant="outline" 
                size="sm" 
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                icon={<UserCheck size={14} />}
                disabled={loading}
              >
                As Student
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                icon={<Shield size={14} />}
                disabled={loading}
              >
                As Admin
              </Button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
              alex.student@college.edu &bull; security.admin@internshield.ai
            </div>
          </div>

          <div className="auth-divider">
            <span>Or enter your credentials</span>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#f87171',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input 
              label="Email Address"
              type="email"
              placeholder="e.g. alex.student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />

            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            <Button 
              type="submit" 
              variant="primary" 
              size="md" 
              loading={loading}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              style={{ marginTop: '0.5rem' }}
            >
              Sign In to InternShield
            </Button>
          </form>

          <div className="auth-footer">
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
