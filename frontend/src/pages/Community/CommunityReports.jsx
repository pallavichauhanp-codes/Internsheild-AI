import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  PlusCircle, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getCommunityReportsApi, submitCommunityReportApi } from '../../services/api';
import './Community.css';

export default function CommunityReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'verified_scam', 'pending', 'under_review'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEvidence, setFormEvidence] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchReports = async (pageToFetch = page, statusToFetch = statusFilter, searchToFetch = searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const response = await getCommunityReportsApi({
        page: pageToFetch,
        limit: 6,
        status: statusToFetch,
        search: searchToFetch
      });
      setReports(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
      setPage(response.page || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch community scam reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, statusFilter, searchTerm);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(1, statusFilter, searchTerm);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchReports(newPage, statusFilter, searchTerm);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formCompany.trim()) {
      setFormError('Company or Recruiter claim name is required.');
      return;
    }
    if (!formDesc.trim() || formDesc.trim().length < 15) {
      setFormError('Please provide a detailed fraud description (at least 15 characters).');
      return;
    }

    setFormSubmitting(true);
    try {
      await submitCommunityReportApi({
        companyName: formCompany,
        internshipTitle: formRole,
        description: formDesc,
        evidenceReference: formEvidence
      });

      setIsModalOpen(false);
      setFormCompany('');
      setFormRole('');
      setFormDesc('');
      setFormEvidence('');
      showToast('Report submitted! Placed in pending moderation queue for SecOps review.');
      // Refresh current feed
      fetchReports(1, statusFilter, searchTerm);
    } catch (err) {
      setFormError(err.message || 'Failed to submit report.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="container community-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3000,
          background: '#0f172a',
          border: '1px solid #38bdf8',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 color="#38bdf8" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="community-header">
        <div>
          <h1 className="community-title">Community Scam Blacklist</h1>
          <p className="community-subtitle">
            Crowd-sourced database of fraudulent organizations, phishing recruiters, and Telegram task scams.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="md" 
          icon={<PlusCircle size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Report an Internship Scam
        </Button>
      </div>

      {/* Trust Notice Banner: Unreviewed vs Verified */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        color: '#bae6fd',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <ShieldCheck size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
        <span>
          <strong>VERIFICATION INTEGRITY POLICY:</strong> Unreviewed student submissions are treated strictly as allegations. Reports are only marked as <strong>Verified Scam</strong> after independent review by an authorized administrator.
        </span>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="community-controls">
        <form onSubmit={handleSearchSubmit} className="search-bar" style={{ flex: 1, minWidth: '260px' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by company name, role, or scam tactics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button variant="ghost" size="sm" type="submit">Search</Button>
        </form>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className={`admin-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('all'); setPage(1); }}
          >
            All Reports ({totalCount})
          </button>
          <button 
            type="button"
            className={`admin-tab-btn ${statusFilter === 'verified_scam' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('verified_scam'); setPage(1); }}
            style={{ color: statusFilter === 'verified_scam' ? '#ffffff' : '#34d399' }}
          >
            Verified Scams Only
          </button>
          <button 
            type="button"
            className={`admin-tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('pending'); setPage(1); }}
            style={{ color: statusFilter === 'pending' ? '#ffffff' : '#fbbf24' }}
          >
            Unreviewed Allegations
          </button>
          <button 
            type="button"
            className={`admin-tab-btn ${statusFilter === 'under_review' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('under_review'); setPage(1); }}
            style={{ color: statusFilter === 'under_review' ? '#ffffff' : '#38bdf8' }}
          >
            Under Review
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', margin: '1rem 0' }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="Retrieving verified reports from database..." />
        </div>
      )}

      {/* Reports Grid */}
      {!loading && !error && (
        <>
          {reports.length > 0 ? (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-card-header">
                    <div>
                      <h3 className="company-name">{report.company_name}</h3>
                      <div className="alleged-role">{report.internship_title || 'Internship Offer'}</div>
                    </div>

                    {/* Status Badge clearly separating Allegations from Verified Findings */}
                    <div>
                      {report.isVerified ? (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <ShieldAlert size={13} />
                          Verified Scam
                        </span>
                      ) : report.status === 'under_review' ? (
                        <span style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <Clock size={13} />
                          Under Investigation
                        </span>
                      ) : (
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          color: '#fbbf24',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <AlertTriangle size={13} />
                          Unreviewed Allegation
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="report-summary" style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, minHeight: '60px' }}>
                    {report.description.length > 160 ? report.description.slice(0, 160) + '...' : report.description}
                  </p>

                  {report.evidence_reference && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Evidence: <span style={{ color: '#94a3b8' }}>{report.evidence_reference}</span>
                    </div>
                  )}

                  <div className="report-card-footer">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Reported: {new Date(report.created_at).toLocaleDateString()}
                    </div>

                    <Link to={`/community/${report.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />} iconPosition="right">
                        View Incident Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', margin: '1rem 0' }}>
              <FileText size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3>No Community Reports Found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
                {searchTerm ? 'No reports matched your search criteria.' : 'No scam reports have been recorded in this category yet.'}
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                Submit First Report
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                icon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} reports total)
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal: Report an Internship Scam */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report a Recruitment Scam</h2>
              <button 
                type="button" 
                className="modal-close" 
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Your report will be placed in the moderation review queue. Once verified by security administrators, it will be added to the confirmed scam directory.
            </p>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <Input 
                label="Company / Recruiter Name Claim"
                placeholder="e.g. Apex Cloud Tech Solutions"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                required
              />

              <Input 
                label="Internship Position Title (Optional)"
                placeholder="e.g. React Developer Intern or Data Reviewer"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
              />

              <Input 
                as="textarea"
                rows={4}
                label="Detailed Description of the Fraud"
                placeholder="Describe what happened: Did they demand a deposit? Was it a Telegram task scam? What UPI or phone numbers were provided?"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                required
              />

              <Input 
                label="Evidence Reference (URL, WhatsApp export, or offer letter description)"
                placeholder="e.g. Fake offer PDF on WhatsApp or link to phishing form"
                value={formEvidence}
                onChange={(e) => setFormEvidence(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={formSubmitting}
                  icon={<PlusCircle size={16} />}
                >
                  Submit Scam Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
