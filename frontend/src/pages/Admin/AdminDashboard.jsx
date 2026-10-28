import { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Database, 
  AlertTriangle, 
  Search, 
  Check, 
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RiskBadge from '../../components/common/RiskBadge';
import { SAMPLE_REPORTS } from '../../data/demoData';
import './Admin.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'whitelist'
  const [reportsQueue, setReportsQueue] = useState(SAMPLE_REPORTS);
  const [toast, setToast] = useState('');

  // Sample company directory for whitelist / blacklist tab
  const [directory, setDirectory] = useState([
    { id: 1, name: 'Google India', domain: 'google.com', status: 'verified_authentic', category: 'Tech Enterprise' },
    { id: 2, name: 'Microsoft Careers', domain: 'microsoft.com', status: 'verified_authentic', category: 'Enterprise' },
    { id: 3, name: 'Apex Cloud Solutions', domain: 'apexcloud-jobs.online', status: 'confirmed_fraud', category: 'Scam Operation' },
    { id: 4, name: 'QuickTask Freelance', domain: 'freelancetask24.ru', status: 'confirmed_fraud', category: 'Telegram Recharge Fraud' }
  ]);

  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainUrl, setNewDomainUrl] = useState('');
  const [newDomainStatus, setNewDomainStatus] = useState('confirmed_fraud');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleApproveReport = (id) => {
    setReportsQueue(prev => prev.map(r => r.id === id ? { ...r, status: 'Verified Scam' } : r));
    showToast(`Report #${id} approved and propagated to live community feed!`);
  };

  const handleRejectReport = (id) => {
    setReportsQueue(prev => prev.filter(r => r.id !== id));
    showToast(`Report #${id} dismissed / marked as false alarm.`);
  };

  const handleAddDomain = (e) => {
    e.preventDefault();
    if (!newDomainName || !newDomainUrl) return;

    setDirectory([
      ...directory,
      {
        id: Date.now(),
        name: newDomainName,
        domain: newDomainUrl.toLowerCase().trim(),
        status: newDomainStatus,
        category: newDomainStatus === 'confirmed_fraud' ? 'Blacklisted Fraud Entity' : 'Enterprise Verified'
      }
    ]);

    setNewDomainName('');
    setNewDomainUrl('');
    showToast(`Domain ${newDomainUrl} added to global directory!`);
  };

  return (
    <div className="container admin-page">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000, background: '#0f172a', border: '1px solid #fbbf24', color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 color="#fbbf24" size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">
            <ShieldAlert size={28} color="#fbbf24" />
            Security Operations & Moderation Center
          </h1>
          <div className="admin-clearance-pill">
            Clearance Level 3 &bull; SecOps Threat Moderator
          </div>
        </div>

        <span className="demo-badge">Admin Demo Interface</span>
      </div>

      {/* Stats Counter Ribbon */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="dash-stat-num">{reportsQueue.length}</div>
            <div className="dash-stat-label">Pending Scam Submissions</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="dash-stat-num">142</div>
            <div className="dash-stat-label">Active Blacklisted Entities</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="dash-stat-num">1,890</div>
            <div className="dash-stat-label">Verified Authentic Firms</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Database size={24} />
          </div>
          <div>
            <div className="dash-stat-num">₹4.2 Cr</div>
            <div className="dash-stat-label">Threat Volume Blocked</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          type="button" 
          className={`admin-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          Scam Reports Moderation Queue ({reportsQueue.length})
        </button>
        <button 
          type="button" 
          className={`admin-tab-btn ${activeTab === 'whitelist' ? 'active' : ''}`}
          onClick={() => setActiveTab('whitelist')}
        >
          Corporate Directory & Domain Rules ({directory.length})
        </button>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === 'queue' && (
        <Card title="Submitted Scam Reports Awaiting Review" icon={<AlertTriangle size={20} />}>
          <div className="scans-table-wrapper">
            <table className="mod-table">
              <thead>
                <tr>
                  <th>Reported Company</th>
                  <th>Fraud Category</th>
                  <th>Demanded Amount</th>
                  <th>Platform</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Moderate</th>
                </tr>
              </thead>
              <tbody>
                {reportsQueue.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{rep.companyName}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Claimed: {rep.allegedRole}</div>
                    </td>
                    <td>{rep.fraudType}</td>
                    <td>
                      <span style={{ color: '#f87171', fontWeight: 600 }}>{rep.demandedAmount}</span>
                    </td>
                    <td>{rep.platform}</td>
                    <td>
                      <span className={`badge ${rep.status === 'Verified Scam' ? 'badge-danger' : 'badge-warning'}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Button 
                          variant="danger" 
                          size="sm"
                          icon={<Check size={14} />}
                          onClick={() => handleApproveReport(rep.id)}
                          title="Confirm as Verified Scam"
                        >
                          Confirm Scam
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          icon={<X size={14} />}
                          onClick={() => handleRejectReport(rep.id)}
                          title="Dismiss Report"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: DOMAIN DIRECTORY MANAGER */}
      {activeTab === 'whitelist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Add New Rule */}
          <Card title="Add Domain Verification Rule" icon={<Database size={20} />}>
            <form onSubmit={handleAddDomain} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="input-group">
                <label className="input-label">Company / Brand Name</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="e.g. Adobe India"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Corporate Domain</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="e.g. adobe.com"
                  value={newDomainUrl}
                  onChange={(e) => setNewDomainUrl(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Status Classification</label>
                <select 
                  className="input-field"
                  value={newDomainStatus}
                  onChange={(e) => setNewDomainStatus(e.target.value)}
                >
                  <option value="confirmed_fraud">Confirmed Fraud (Blacklist)</option>
                  <option value="verified_authentic">Verified Authentic (Whitelist)</option>
                  <option value="flagged_suspicious">Flagged Suspicious</option>
                </select>
              </div>

              <Button type="submit" variant="primary" size="md">
                Add Rule
              </Button>
            </form>
          </Card>

          {/* Directory Table */}
          <Card title="Indexed Corporate Domain Rules">
            <div className="scans-table-wrapper">
              <table className="mod-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Domain</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {directory.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: '#ffffff', fontWeight: 600 }}>{item.name}</td>
                      <td>
                        <code>{item.domain}</code>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`badge ${
                          item.status === 'verified_authentic' ? 'badge-safe' : 'badge-danger'
                        }`}>
                          {item.status === 'verified_authentic' ? 'Authentic Whitelist' : 'Blacklist Fraud'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
