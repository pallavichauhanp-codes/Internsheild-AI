import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Copy, 
  Check, 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Clock, 
  Building, 
  Mail, 
  Globe, 
  DollarSign, 
  Link2 
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RiskBadge from '../../components/common/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getScanByIdApi, checkIsSavedApi, saveScanApi, unsaveScanApi, deleteScanApi } from '../../services/api';
import './Scanner.css';

export default function ScanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState(null);
  const [reportCopied, setReportCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [scanData, savedStatus] = await Promise.all([
          getScanByIdApi(id),
          checkIsSavedApi(id)
        ]);
        if (isMounted) {
          setScan(scanData);
          setIsSaved(savedStatus);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load scan details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [id]);

  const handleToggleSave = async () => {
    if (!scan) return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        await unsaveScanApi(scan.id);
        setIsSaved(false);
      } else {
        await saveScanApi(scan.id);
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to update bookmark.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      await deleteScanApi(scan.id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete scan.');
    }
  };

  const handleCopyQuestion = (question, index) => {
    navigator.clipboard?.writeText(question);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2500);
  };

  const handleCopyReport = () => {
    if (!scan) return;
    const textReport = `
=== INTERNSHIELD AI SCAN REPORT ===
Internship: ${scan.internship_title} at ${scan.company_name}
Threat Level: ${scan.risk_level} (${scan.risk_score}/100)
Summary: ${scan.explanations || scan.summary}

WARNING SIGNS:
${(scan.warning_signs || scan.warningSigns || []).map(w => `- ${w.title}: ${w.explanation}`).join('\n')}

VERIFICATION STEPS:
${(scan.recommended_actions || scan.verificationSteps || []).map((v, i) => `${i + 1}. ${v}`).join('\n')}
`;
    navigator.clipboard?.writeText(textReport.trim());
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving authenticated scan record from database..." />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Scan Record Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {error || 'The requested threat scan record does not exist or you do not have permission to view it.'}
            </p>
            <Link to="/dashboard">
              <Button variant="primary" icon={<ArrowLeft size={16} />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const riskLevel = scan.risk_level || scan.riskLevel || 'Medium';
  const riskScore = scan.risk_score !== undefined ? scan.risk_score : (scan.riskScore || 50);
  const warningSigns = scan.warning_signs || scan.warningSigns || [];
  const positiveIndicators = scan.positive_indicators || scan.trustIndicators || [];
  const recommendedActions = scan.recommended_actions || scan.verificationSteps || [];
  const questionsForRecruiter = scan.questions_for_recruiter || scan.recruiterQuestions || [];
  const limitations = scan.limitations || [];

  return (
    <div className="container scanner-page" style={{ paddingTop: '2rem' }}>
      {/* Navigation & Actions Top Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Back to Dashboard
          </Button>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant={isSaved ? "secondary" : "outline"} 
            size="sm"
            onClick={handleToggleSave}
            loading={saveLoading}
            icon={isSaved ? <BookmarkCheck size={16} color="#10b981" /> : <Bookmark size={16} />}
          >
            {isSaved ? 'Saved to Bookmarks' : 'Bookmark Scan'}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyReport}
            icon={reportCopied ? <Check size={14} /> : <Copy size={14} />}
          >
            {reportCopied ? 'Report Copied' : 'Copy Report'}
          </Button>

          <Button 
            variant="danger" 
            size="sm"
            onClick={handleDelete}
            icon={<Trash2 size={16} />}
          >
            {deleteConfirm ? 'Confirm Delete?' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Result Hero Card with Circular Dial & Score Meter */}
      <div className={`result-hero-card level-${riskLevel.toLowerCase()}`}>
        <div className="result-meter-header">
          <div className="score-badge-group">
            <div className={`score-dial dial-${riskLevel.toLowerCase()}`}>
              <span className="dial-number">{riskScore}</span>
              <span className="dial-label">/ 100</span>
            </div>

            <div className="score-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h2>Risk Level: {riskLevel}</h2>
                <RiskBadge level={riskLevel} size="md" />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: '0.2rem 0' }}>
                {scan.internship_title} at {scan.company_name}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {scan.explanations || scan.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Linear Meter */}
        <div className="linear-risk-meter">
          <div className="meter-labels">
            <span>0 (Safe)</span>
            <span>35 (Low / Neutral)</span>
            <span>60 (Medium Risk)</span>
            <span>85 (Critical Threat)</span>
            <span>100</span>
          </div>
          <div className="risk-bar-track">
            <div 
              className={`risk-bar-fill bar-${riskLevel.toLowerCase()}`}
              style={{ width: `${Math.max(5, riskScore)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Submitted Details Snapshot */}
      <Card title="Submitted Offer Parameters" subtitle="Original evaluation input stored in MySQL">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Company Claim:</span>
            <div style={{ fontWeight: 600, color: '#ffffff' }}>{scan.company_name}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Recruiter Email:</span>
            <div style={{ fontWeight: 600, color: '#ffffff' }}>{scan.recruiter_email || 'Not provided'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Company Website:</span>
            <div style={{ fontWeight: 600, color: '#ffffff' }}>{scan.company_website || 'Not provided'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Stipend Claimed:</span>
            <div style={{ fontWeight: 600, color: '#ffffff' }}>{scan.stipend || 'Unspecified'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Upfront Fee Demanded:</span>
            <div style={{ fontWeight: 600, color: scan.upfront_fee_requested ? '#ef4444' : '#10b981' }}>
              {scan.upfront_fee_requested ? 'Yes (Mandatory Fee Demanded)' : 'No Fee Requested'}
            </div>
          </div>
        </div>
        {scan.internship_description && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Description Snippet:</span>
            <p style={{ marginTop: '0.25rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {scan.internship_description}
            </p>
          </div>
        )}
      </Card>

      {/* Warning Signs & Trust Indicators Grid */}
      <div className="result-sections-grid" style={{ marginTop: '1.5rem' }}>
        {/* Warning Signs */}
        <Card 
          title={`Warning Signs Detected (${warningSigns.length})`}
          subtitle="Threat vectors identified in this offer"
          icon={<ShieldAlert size={20} color="#f87171" />}
        >
          {warningSigns.length > 0 ? (
            <div>
              {warningSigns.map((w, idx) => (
                <div key={idx} className="warning-item">
                  <div className="warning-item-header">
                    <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{w.title}</span>
                  </div>
                  <p className="warning-item-desc">{w.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No critical warning signs detected.
            </div>
          )}
        </Card>

        {/* Positive Indicators */}
        <Card 
          title={`Positive Trust Indicators (${positiveIndicators.length})`}
          subtitle="Signals aligning with verified recruitment standards"
          icon={<ShieldCheck size={20} color="#34d399" />}
        >
          {positiveIndicators.length > 0 ? (
            <div>
              {positiveIndicators.map((t, idx) => (
                <div key={idx} className="trust-item">
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No positive trust indicators detected.
            </div>
          )}
        </Card>
      </div>

      {/* Verification Steps & Questions Grid */}
      <div className="result-sections-grid" style={{ marginTop: '1.5rem' }}>
        {/* Recommended Actions */}
        <Card 
          title="Recommended Verification Actions" 
          subtitle="Candidate due diligence checklist"
          icon={<FileText size={20} color="#38bdf8" />}
        >
          <div>
            {recommendedActions.map((step, idx) => (
              <div key={idx} className="step-item-box">
                <span className="step-number-tag">{idx + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Questions for Recruiter */}
        <Card 
          title="Questions to Test Recruiter Legitimacy" 
          subtitle="Pointed questions before committing"
          icon={<HelpCircle size={20} color="#818cf8" />}
        >
          <div>
            {questionsForRecruiter.map((q, idx) => (
              <div key={idx} className="question-item-box">
                <span className="question-text">{q}</span>
                <button 
                  type="button" 
                  className="copy-question-btn"
                  onClick={() => handleCopyQuestion(q, idx)}
                >
                  {copiedQuestionIndex === idx ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer & Legal Limitations */}
      <div className="result-footer-box" style={{ marginTop: '1.5rem' }}>
        <div className="result-actions-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} />
            <span>Scanned: <strong>{new Date(scan.created_at || Date.now()).toLocaleString()}</strong></span>
          </div>
          <div>
            Record ID: <code>#{scan.id}</code>
          </div>
        </div>

        {limitations.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              ETHICAL INTELLIGENCE BOUNDARIES & VERIFICATION LIMITATIONS:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
              {limitations.map((limit, idx) => (
                <li key={idx}>{limit}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
