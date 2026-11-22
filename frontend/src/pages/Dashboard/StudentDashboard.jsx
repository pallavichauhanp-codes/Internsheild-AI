import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Search, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  Trash2,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RiskBadge from '../../components/common/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboardStatsApi, getSavedScansApi, unsaveScanApi } from '../../services/api';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [savedScans, setSavedScans] = useState([]);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'saved'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickText, setQuickText] = useState('');
  const [unsavingId, setUnsavingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, savedData] = await Promise.all([
        getDashboardStatsApi(),
        getSavedScansApi()
      ]);
      setStats(statsData);
      setSavedScans(savedData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUnsave = async (scanId) => {
    setUnsavingId(scanId);
    try {
      await unsaveScanApi(scanId);
      setSavedScans(prev => prev.filter(s => s.scan_id !== scanId));
      if (stats) {
        setStats(prev => ({
          ...prev,
          savedBookmarks: Math.max(0, (prev.savedBookmarks || 1) - 1)
        }));
      }
      showToast('Scan bookmark removed from dashboard.');
    } catch (err) {
      alert(err.message || 'Failed to remove bookmark.');
    } finally {
      setUnsavingId(null);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleQuickScan = (e) => {
    e.preventDefault();
    if (quickText.trim()) {
      navigate('/scanner', { state: { prefilledDescription: quickText } });
    }
  };

  const riskBreakdown = stats?.riskBreakdown || { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const totalScans = stats?.totalScans || 0;

  // Calculate percentages for chart
  const calcPct = (count) => totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;

  return (
    <div className="container dashboard-page">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3000,
          background: '#0f172a',
          border: '1px solid #10b981',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <BookmarkCheck color="#10b981" size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="welcome-title">Student Threat Defense Dashboard</h1>
          <p className="welcome-sub">
            Continuous verification and historical protection for your career applications.
          </p>
          <div className="student-tag">
            <GraduationCap size={15} />
            <span>{user?.email} &bull; Verified Student Account</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/scanner" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md" icon={<ShieldAlert size={16} />}>
              Scan New Offer
            </Button>
          </Link>
          <Link to="/community" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md">
              Scam Blacklist
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="md" 
            onClick={fetchDashboardData}
            title="Refresh statistics"
            icon={<RefreshCw size={15} />}
          />
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#f87171',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>Retry</Button>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && !stats && (
        <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="Querying database for real student security analytics..." />
        </div>
      )}

      {stats && (
        <>
          {/* Stats Counter Ribbon based on Real Database Records */}
          <div className="dash-stats-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                <Search size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.totalScans}</div>
                <div className="dash-stat-label">Total Offers Scanned</div>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.scamsEvaded}</div>
                <div className="dash-stat-label">Threats Evaded</div>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.safetyIndex}%</div>
                <div className="dash-stat-label">Safety Index Score</div>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.estimatedLossPrevented}</div>
                <div className="dash-stat-label">Estimated Fraud Prevented</div>
              </div>
            </div>
          </div>

          {/* Visual Chart Card: Real Risk Distribution Chart */}
          <Card 
            title="Real-Time Threat Level Distribution Chart" 
            subtitle="Aggregated evaluation of all internship scans recorded in MySQL"
            icon={<BarChart3 size={20} color="#38bdf8" />}
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', padding: '0.5rem 0' }}>
              {/* Low Risk */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Low Risk</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{calcPct(riskBreakdown.Low)}%</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff' }}>{riskBreakdown.Low}</div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskBreakdown.Low)}%`, height: '100%', background: '#10b981' }} />
                </div>
              </div>

              {/* Medium Risk */}
              <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>Medium Risk</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{calcPct(riskBreakdown.Medium)}%</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff' }}>{riskBreakdown.Medium}</div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskBreakdown.Medium)}%`, height: '100%', background: '#f59e0b' }} />
                </div>
              </div>

              {/* High Risk */}
              <div style={{ background: 'rgba(249, 115, 22, 0.06)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#fb923c', fontWeight: 600 }}>High Risk</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{calcPct(riskBreakdown.High)}%</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff' }}>{riskBreakdown.High}</div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskBreakdown.High)}%`, height: '100%', background: '#f97316' }} />
                </div>
              </div>

              {/* Critical Threat */}
              <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#f87171', fontWeight: 600 }}>Critical Threat</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{calcPct(riskBreakdown.Critical)}%</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff' }}>{riskBreakdown.Critical}</div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskBreakdown.Critical)}%`, height: '100%', background: '#ef4444' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Main Two-Column Layout */}
          <div className="dash-columns">
            {/* Left Column: Tabbed Scan History & Saved Bookmarks */}
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  className={`admin-tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recent')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Clock size={16} />
                  Recent Scans ({stats.recentScans?.length || 0})
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Bookmark size={16} />
                  Saved Bookmarks ({savedScans.length})
                </button>
              </div>

              {activeTab === 'recent' && (
                <Card 
                  title="Your Personal Scan History" 
                  subtitle="Scans conducted on your account with detailed verification results"
                  icon={<Clock size={20} />}
                >
                  {stats.recentScans && stats.recentScans.length > 0 ? (
                    <div className="scans-table-wrapper">
                      <table className="scans-table">
                        <thead>
                          <tr>
                            <th>Role & Organization</th>
                            <th>Date</th>
                            <th>Threat Assessment</th>
                            <th>Stipend</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentScans.map((scan) => (
                            <tr key={scan.id}>
                              <td>
                                <strong style={{ color: '#ffffff' }}>{scan.internship_title}</strong>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{scan.company_name}</div>
                              </td>
                              <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                {new Date(scan.created_at).toLocaleDateString()}
                              </td>
                              <td>
                                <RiskBadge level={scan.risk_level} score={scan.risk_score} size="sm" />
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>
                                {scan.stipend || 'Unspecified'}
                              </td>
                              <td>
                                <Link to={`/scans/${scan.id}`}>
                                  <Button variant="ghost" size="sm">Inspect</Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <Search size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <h3>No Internship Scans Recorded</h3>
                      <p style={{ marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                        You haven't evaluated any internship offers yet.
                      </p>
                      <Link to="/scanner">
                        <Button variant="primary" size="sm" icon={<ShieldAlert size={14} />}>
                          Scan an Offer Now
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              )}

              {activeTab === 'saved' && (
                <Card 
                  title="Bookmarked Internship Offers" 
                  subtitle="Saved scan results and verification records"
                  icon={<Bookmark size={20} color="#10b981" />}
                >
                  {savedScans.length > 0 ? (
                    <div className="scans-table-wrapper">
                      <table className="scans-table">
                        <thead>
                          <tr>
                            <th>Saved Position</th>
                            <th>Threat Score</th>
                            <th>Bookmarked At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedScans.map((saved) => (
                            <tr key={saved.saved_id}>
                              <td>
                                <strong style={{ color: '#ffffff' }}>{saved.internship_title}</strong>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{saved.company_name}</div>
                              </td>
                              <td>
                                <RiskBadge level={saved.risk_level} score={saved.risk_score} size="sm" />
                              </td>
                              <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                {new Date(saved.saved_at).toLocaleDateString()}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <Link to={`/scans/${saved.scan_id}`}>
                                    <Button variant="ghost" size="sm">Inspect</Button>
                                  </Link>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUnsave(saved.scan_id)}
                                    loading={unsavingId === saved.scan_id}
                                    title="Remove from saved bookmarks"
                                  >
                                    Unsave
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <Bookmark size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <h3>No Bookmarks Saved</h3>
                      <p style={{ marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                        Click "Bookmark Scan" on any scan result page to save it to your personal dashboard.
                      </p>
                      <Link to="/scanner">
                        <Button variant="outline" size="sm">Go to Scanner</Button>
                      </Link>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right Column: Quick Scan Widget & Safety Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Quick Scanner */}
              <Card 
                title="Fast Threat Scanner" 
                subtitle="Evaluate text or WhatsApp message quickly"
                icon={<Sparkles size={20} />}
              >
                <form onSubmit={handleQuickScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea 
                    className="input-field textarea-field"
                    placeholder="Paste job message, Telegram recruitment pitch, or offer terms here..."
                    rows={4}
                    value={quickText}
                    onChange={(e) => setQuickText(e.target.value)}
                  />
                  <Button type="submit" variant="primary" size="md" icon={<ArrowRight size={16} />} iconPosition="right">
                    Open in Threat Scanner
                  </Button>
                </form>
              </Card>

              {/* Emergency Helplines */}
              <Card 
                title="Emergency Fraud Helplines" 
                subtitle="Immediate protocol if financial credentials were provided"
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
                    <span style={{ color: '#cbd5e1' }}>Immediate Mitigation</span>
                    <span style={{ color: '#f87171' }}>Freeze UPI & Netbanking</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
