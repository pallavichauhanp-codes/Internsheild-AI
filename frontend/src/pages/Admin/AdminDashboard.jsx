import { useState, useEffect } from 'react';
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
  UserCheck,
  Clock,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Filter
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAdminStatsApi, getAdminReportsApi, updateReportStatusApi } from '../../services/api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'verified_scam', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, reportsData] = await Promise.all([
        getAdminStatsApi(),
        getAdminReportsApi({ status: activeTab, search: searchTerm })
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (err) {
      setError(err.message || 'Failed to load administrative security metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    try {
      await updateReportStatusApi(reportId, newStatus);
      // Optimistically update reports in local state
      setReports(prev => prev.map(r => r.id === reportId ? { 
        ...r, 
        status: newStatus,
        isVerified: newStatus === 'verified_scam',
        reviewStatusLabel: newStatus === 'verified_scam' ? 'Verified Scam' : newStatus === 'under_review' ? 'Under Review' : newStatus
      } : r));

      // Refresh admin stats count
      getAdminStatsApi().then(setStats).catch(() => {});

      const statusLabels = {
        verified_scam: 'verified as confirmed scam',
        under_review: 'marked under investigation',
        rejected: 'dismissed / rejected',
        pending: 'returned to pending review'
      };
      showToast(`Report #${reportId} successfully ${statusLabels[newStatus] || newStatus}!`);
    } catch (err) {
      alert(err.message || 'Failed to update report status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAdminData();
  };

  const riskDistribution = stats?.riskDistribution || { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const totalScans = stats?.totalScans || 0;
  const calcPct = (count) => totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;

  // Filtered reports for the active view
  const displayedReports = reports.filter(r => {
    if (activeTab === 'pending') {
      return r.status === 'pending' || r.status === 'under_review';
    }
    if (activeTab === 'verified_scam') {
      return r.status === 'verified_scam';
    }
    return true; // 'all'
  });

  return (
    <div className="container admin-page">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3000,
          background: '#0f172a',
          border: '1px solid #fbbf24',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
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
            SecOps Clearance Level 3 &bull; Authorized Threat Moderator
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadAdminData}
            title="Refresh database records"
            icon={<RefreshCw size={15} />}
          >
            Refresh
          </Button>
          <span className="demo-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
            Live MySQL Engine
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Stats Counter Ribbon based on Real Database Records */}
      {stats && (
        <>
          <div className="dash-stats-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.pendingReview}</div>
                <div className="dash-stat-label">Pending Scam Submissions</div>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.verifiedScams}</div>
                <div className="dash-stat-label">Verified Blacklisted Scams</div>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Database size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.totalScans}</div>
                <div className="dash-stat-label">Total Platform Scans</div>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <div className="dash-stat-num">{stats.totalUsers}</div>
                <div className="dash-stat-label">Registered Accounts</div>
              </div>
            </div>
          </div>

          {/* Real Database Analytics Visual Chart */}
          <Card 
            title="Platform Threat Distribution (MySQL Live Aggregation)"
            subtitle="Breakdown of evaluated internship offers categorized across 4 risk vectors"
            icon={<BarChart3 size={20} color="#fbbf24" />}
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '0.5rem 0' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Low Risk</span>
                  <span>{calcPct(riskDistribution.Low)}%</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                  {riskDistribution.Low}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskDistribution.Low)}%`, height: '100%', background: '#10b981' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Medium Risk</span>
                  <span>{calcPct(riskDistribution.Medium)}%</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                  {riskDistribution.Medium}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskDistribution.Medium)}%`, height: '100%', background: '#f59e0b' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fb923c', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>High Risk</span>
                  <span>{calcPct(riskDistribution.High)}%</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                  {riskDistribution.High}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskDistribution.High)}%`, height: '100%', background: '#f97316' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Critical Threat</span>
                  <span>{calcPct(riskDistribution.Critical)}%</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                  {riskDistribution.Critical}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${calcPct(riskDistribution.Critical)}%`, height: '100%', background: '#ef4444' }} />
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Moderation Queue Sub-Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          type="button" 
          className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Moderation Queue ({stats ? (stats.pendingReview + stats.underReview) : '...'})
        </button>
        <button 
          type="button" 
          className={`admin-tab-btn ${activeTab === 'verified_scam' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified_scam')}
        >
          Verified Blacklisted Scams ({stats?.verifiedScams || 0})
        </button>
        <button 
          type="button" 
          className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Community Submissions ({stats?.totalReports || 0})
        </button>
      </div>

      {/* Search Input for Reports */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search reports by company, role, or fraud keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <Button variant="outline" size="md" type="submit">Filter Queue</Button>
      </form>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="Retrieving moderation queue from database..." />
        </div>
      )}

      {/* Moderation Queue Table */}
      {!loading && (
        <Card 
          title={`Moderation Queue (${displayedReports.length} reports)`} 
          subtitle="Review unverified student submissions and decide on verification action"
        >
          {displayedReports.length > 0 ? (
            <div className="scans-table-wrapper">
              <table className="scans-table">
                <thead>
                  <tr>
                    <th>Target Entity</th>
                    <th>Reported Tactics</th>
                    <th>Filed By</th>
                    <th>Status</th>
                    <th>Moderator Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedReports.map((report) => (
                    <tr key={report.id}>
                      <td style={{ minWidth: '180px' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{report.company_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{report.internship_title || 'Unspecified Role'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          ID: #{report.id} &bull; {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ maxWidth: '320px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                          {report.description}
                        </div>
                        {report.evidence_reference && (
                          <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '0.3rem' }}>
                            Ref: {report.evidence_reference}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        <div>{report.reporter_name || 'Anonymous Student'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{report.reporter_email || 'Verified Student'}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 
                            report.status === 'verified_scam' ? 'rgba(239, 68, 68, 0.15)' :
                            report.status === 'under_review' ? 'rgba(56, 189, 248, 0.15)' :
                            report.status === 'rejected' ? 'rgba(148, 163, 184, 0.15)' :
                            'rgba(245, 158, 11, 0.15)',
                          color:
                            report.status === 'verified_scam' ? '#f87171' :
                            report.status === 'under_review' ? '#38bdf8' :
                            report.status === 'rejected' ? '#94a3b8' :
                            '#fbbf24',
                          border: `1px solid ${
                            report.status === 'verified_scam' ? 'rgba(239, 68, 68, 0.3)' :
                            report.status === 'under_review' ? 'rgba(56, 189, 248, 0.3)' :
                            report.status === 'rejected' ? 'rgba(148, 163, 184, 0.3)' :
                            'rgba(245, 158, 11, 0.3)'
                          }`
                        }}>
                          {report.reviewStatusLabel}
                        </span>
                      </td>
                      <td style={{ minWidth: '220px' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {report.status !== 'verified_scam' && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleUpdateStatus(report.id, 'verified_scam')}
                              loading={actionLoadingId === report.id}
                              icon={<Check size={13} />}
                              title="Confirm as Verified Scam (Publishes to confirmed blacklist)"
                            >
                              Verify Scam
                            </Button>
                          )}
                          {report.status !== 'under_review' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateStatus(report.id, 'under_review')}
                              loading={actionLoadingId === report.id}
                              title="Mark as under active SecOps investigation"
                            >
                              Review
                            </Button>
                          )}
                          {report.status !== 'rejected' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(report.id, 'rejected')}
                              loading={actionLoadingId === report.id}
                              icon={<X size={13} />}
                              title="Dismiss / Reject report"
                            >
                              Dismiss
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
              <h3>Queue is All Clear!</h3>
              <p style={{ marginTop: '0.25rem' }}>
                There are currently no reports awaiting moderation in this category.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
