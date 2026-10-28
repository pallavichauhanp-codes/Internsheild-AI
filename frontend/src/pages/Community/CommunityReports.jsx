import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  PlusCircle, 
  ThumbsUp, 
  MessageSquare, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import RiskBadge from '../../components/common/RiskBadge';
import { SAMPLE_REPORTS } from '../../data/demoData';
import { submitScamReport } from '../../services/api';
import './Community.css';

export default function CommunityReports() {
  const [reports, setReports] = useState(SAMPLE_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');

  // Form state for modal
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPlatform, setFormPlatform] = useState('Telegram');
  const [formType, setFormType] = useState('Mandatory Training Kit Fee');
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const filters = ['All', 'Mandatory Training Kit Fee', 'Paid Task / Recharge Scam', 'Identity Theft / Phishing', 'Unpaid Multi-Level Marketing (MLM)'];

  const filteredReports = reports.filter((rep) => {
    const matchesFilter = selectedFilter === 'All' || rep.fraudType === selectedFilter;
    const matchesSearch = 
      rep.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.allegedRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpvote = (id) => {
    setUpvotedIds(prev => {
      const next = new Set(prev);
      const isAlready = next.has(id);
      if (isAlready) {
        next.delete(id);
        setReports(r => r.map(x => x.id === id ? { ...x, upvotes: x.upvotes - 1 } : x));
      } else {
        next.add(id);
        setReports(r => r.map(x => x.id === id ? { ...x, upvotes: x.upvotes + 1 } : x));
        showToast('Upvote recorded! Helps raise community awareness.');
      }
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!formCompany || !formDesc) return;
    setFormSubmitting(true);

    const newReport = {
      id: `rep-${Date.now()}`,
      companyName: formCompany,
      allegedRole: formRole || 'Internship Applicant',
      platform: formPlatform,
      fraudType: formType,
      demandedAmount: formAmount ? `₹${formAmount}` : '₹0',
      riskScore: 90,
      riskLevel: 'HIGH_RISK',
      reporter: 'Anonymous Student (Demo)',
      date: 'Just now',
      status: 'Under Review',
      isDemo: true,
      summary: formDesc.slice(0, 140) + '...',
      details: formDesc,
      redFlags: ['Student reported predatory fee requirement or fake tasks'],
      upvotes: 1,
      commentsCount: 0
    };

    try {
      await submitScamReport({
        companyName: formCompany,
        recruiterContact: formPlatform,
        platformSource: formPlatform,
        fraudType: formType,
        description: formDesc,
        requestedAmount: formAmount || 0
      });
    } catch (err) {
      console.warn('Backend unavailable, saving to local demo feed:', err);
    }

    setReports([newReport, ...reports]);
    setFormSubmitting(false);
    setIsModalOpen(false);
    showToast('Report submitted! Thank you for warning other students.');

    // Reset form
    setFormCompany('');
    setFormRole('');
    setFormAmount('');
    setFormDesc('');
  };

  return (
    <div className="container community-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000, background: '#0f172a', border: '1px solid #38bdf8', color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 color="#38bdf8" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="community-header">
        <div>
          <h1 className="community-title">Campus Scam Blacklist</h1>
          <p className="community-subtitle">
            Crowd-sourced database of fraudulent companies, fake recruiters, and Telegram task scams.
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

      {/* Search & Filter Bar */}
      <div className="community-controls">
        <Input 
          placeholder="Search by company name, alleged role, or fraud keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={16} />}
        />

        <div className="filter-chips">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '0.25rem' }}>
            Filter by:
          </span>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-chip ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="reports-grid">
        {filteredReports.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No reports match your search criteria.
          </div>
        ) : (
          filteredReports.map((rep) => {
            const hasUpvoted = upvotedIds.has(rep.id);
            return (
              <div key={rep.id} className="report-item-card">
                <div>
                  <div className="report-top-meta">
                    <div>
                      <h3 className="report-company">{rep.companyName}</h3>
                      <p className="report-role">{rep.allegedRole}</p>
                    </div>
                    <RiskBadge level={rep.riskLevel} score={rep.riskScore} size="sm" />
                  </div>

                  <div className="report-details-box">
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Fraud Type:</span>
                      <div style={{ color: '#ffffff', fontWeight: 500 }}>{rep.fraudType}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Demanded Amount:</span>
                      <div style={{ color: '#fca5a5', fontWeight: 600 }}>{rep.demandedAmount}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Platform:</span>
                      <div style={{ color: '#cbd5e1' }}>{rep.platform}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Reported by:</span>
                      <div style={{ color: '#cbd5e1' }}>{rep.reporter}</div>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {rep.summary}
                  </p>
                </div>

                <div className="report-actions-row">
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button 
                      type="button"
                      className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
                      onClick={() => handleUpvote(rep.id)}
                      title="Verify and endorse this threat report"
                    >
                      <ThumbsUp size={14} />
                      <span>{rep.upvotes}</span>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-dim)', padding: '0.35rem 0.5rem' }}>
                      <MessageSquare size={14} />
                      <span>{rep.commentsCount}</span>
                    </div>
                  </div>

                  <Link to={`/community/${rep.id}`}>
                    <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />} iconPosition="right">
                      Full Investigation
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REPORT SUBMISSION MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldAlert size={22} color="#ef4444" />
                <h2 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Report an Internship Scam</h2>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input 
                label="Company / Recruiter Entity Name"
                placeholder="e.g. Apex Global Tech Solutions"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                required
              />

              <Input 
                label="Alleged Role"
                placeholder="e.g. React Developer Intern"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Platform Source</label>
                  <select 
                    className="input-field"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                  >
                    <option value="Telegram">Telegram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="College Placement Portal">College Placement Portal</option>
                    <option value="Email">Direct Email</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>

                <Input 
                  label="Demanded Amount (₹)"
                  type="number"
                  placeholder="e.g. 2499"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Fraud Category</label>
                <select 
                  className="input-field"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  <option value="Mandatory Training Kit Fee">Mandatory Training Kit Fee</option>
                  <option value="Paid Task / Recharge Scam">Paid Task / Recharge Scam</option>
                  <option value="Identity Theft / Phishing">Identity Theft / Phishing</option>
                  <option value="Unpaid Multi-Level Marketing (MLM)">Unpaid Multi-Level Marketing (MLM)</option>
                  <option value="Fake Certificate Fee">Fake Certificate Fee</option>
                </select>
              </div>

              <Input 
                as="textarea"
                rows={4}
                label="Detailed Description of Fraud"
                placeholder="Describe what the recruiter said, payment mode requested, or suspicious links..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" loading={formSubmitting}>
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
