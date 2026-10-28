import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  Search, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RiskBadge from '../../components/common/RiskBadge';
import { RECENT_SCANS } from '../../data/demoData';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quickText, setQuickText] = useState('');

  const handleQuickScan = (e) => {
    e.preventDefault();
    if (quickText.trim()) {
      navigate('/scanner');
    }
  };

  return (
    <div className="container dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="welcome-title">Student Security Center</h1>
          <p className="welcome-sub">
            Protecting your career applications against predatory hiring scams.
          </p>
          <div className="student-tag">
            <GraduationCap size={15} />
            <span>{user?.college || 'National Institute of Technology'} &bull; Verified Student</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/scanner">
            <Button variant="primary" size="md" icon={<ShieldAlert size={16} />}>
              New Scan
            </Button>
          </Link>
          <Link to="/community">
            <Button variant="outline" size="md">
              Browse Blacklist
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Counter Ribbon */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
            <Search size={24} />
          </div>
          <div>
            <div className="dash-stat-num">7</div>
            <div className="dash-stat-label">Total Offers Scanned</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="dash-stat-num">2</div>
            <div className="dash-stat-label">Scams Successfully Evaded</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="dash-stat-num">98%</div>
            <div className="dash-stat-label">Security Health Index</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="dash-stat-num">₹5,499</div>
            <div className="dash-stat-label">Estimated Fraud Loss Prevented</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="dash-columns">
        {/* Left Column: Recent Scans History */}
        <Card 
          title="Recent Scan Activity" 
          subtitle="Real-time timeline of internship offers you evaluated"
          icon={<Clock size={20} />}
          badge={<span className="demo-badge">Demo Records</span>}
        >
          <div className="scans-table-wrapper">
            <table className="scans-table">
              <thead>
                <tr>
                  <th>Internship Role & Company</th>
                  <th>Date</th>
                  <th>Threat Level</th>
                  <th>Key Finding</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_SCANS.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{scan.role}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{scan.companyClaim}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{scan.date}</td>
                    <td>
                      <RiskBadge level={scan.riskLevel} score={scan.riskScore} size="sm" />
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{scan.reason}</td>
                    <td>
                      <Link to="/scanner">
                        <Button variant="ghost" size="sm">Inspect</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Quick Scan Widget & Safety Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Scanner */}
          <Card 
            title="Fast Threat Scanner" 
            subtitle="Quickly paste suspicious email or message"
            icon={<Sparkles size={20} />}
          >
            <form onSubmit={handleQuickScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea 
                className="input-field textarea-field"
                placeholder="Paste offer letter snippet here to evaluate..."
                rows={4}
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
              />
              <Button type="submit" variant="primary" size="md" icon={<ArrowRight size={16} />} iconPosition="right">
                Analyze Threat Vector
              </Button>
            </form>
          </Card>

          {/* Quick Helpline Box */}
          <Card 
            title="Emergency Cyber Helplines" 
            subtitle="Immediate assistance if you shared financial details"
            icon={<AlertTriangle size={20} />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#cbd5e1' }}>National Cyber Helpline</span>
                <strong style={{ color: '#38bdf8' }}>Dial 1930</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#cbd5e1' }}>Online Complaint Portal</span>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>
                  cybercrime.gov.in
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: '#cbd5e1' }}>Bank Fraud Immediate Stop</span>
                <span style={{ color: '#f87171' }}>Block ATM & UPI via App</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
