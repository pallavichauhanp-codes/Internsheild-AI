import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Auth.css';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email || 'new.student@college.edu', password, 'student');
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-badge">
              <Shield size={28} />
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the student threat defense community</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input 
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={16} />}
              required
            />

            <Input 
              label="College Email"
              type="email"
              placeholder="rahul@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              helperText="Use your institutional email for verified student status"
              required
            />

            <Input 
              label="College / University Name"
              placeholder="e.g. National Institute of Technology"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              icon={<GraduationCap size={16} />}
              required
            />

            <Input 
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
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
              Get Protected Now
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
