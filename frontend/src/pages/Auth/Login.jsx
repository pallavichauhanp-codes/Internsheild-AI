import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email || 'alex.student@college.edu', password, role);
      setLoading(false);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    }, 600);
  };

  const handleQuickDemoLogin = (selectedRole) => {
    const demoEmail = selectedRole === 'admin' ? 'security.admin@internshield.ai' : 'alex.student@college.edu';
    login(demoEmail, 'password', selectedRole);
    navigate(selectedRole === 'admin' ? '/admin' : '/dashboard');
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

          {/* 1-Click Demo Login Box for hackathon judges */}
          <div className="demo-login-box">
            <div className="demo-login-header">
              <span>🚀 Hackathon 1-Click Demo Login</span>
              <span className="demo-badge">Instant</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickDemoLogin('student')}
                icon={<UserCheck size={14} />}
              >
                As Student
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleQuickDemoLogin('admin')}
                icon={<Shield size={14} />}
              >
                As Admin
              </Button>
            </div>
          </div>

          <div className="auth-divider">
            <span>Or continue with credentials</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input 
              label="College or Work Email"
              type="email"
              placeholder="student@college.edu"
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label className="input-label">Select Account Role</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="student" 
                    checked={role === 'student'} 
                    onChange={() => setRole('student')}
                  />
                  College Student
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="admin" 
                    checked={role === 'admin'} 
                    onChange={() => setRole('admin')}
                  />
                  Security Admin
                </label>
              </div>
            </div>

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
