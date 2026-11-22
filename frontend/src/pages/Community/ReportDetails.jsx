import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  Building,
  FileText,
  Calendar,
  Lock
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getReportByIdApi } from '../../services/api';
import './Community.css';

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchReport() {
      setLoading(true);
      setError('');
      try {
        const data = await getReportByIdApi(id);
        if (isMounted) setReport(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to retrieve scam report.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchReport();
    return () => { isMounted = false; };
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Report incident URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving verified incident record from database..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Report Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {error || 'The requested scam report does not exist or was removed.'}
            </p>
            <Link to="/community">
              <Button variant="primary" icon={<ArrowLeft size={16} />}>
                Back to Community Blacklist
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isVerified = report.status === 'verified_scam';
  const isPending = report.status === 'pending';
  const isUnderReview = report.status === 'under_review';

  return (
    <div className="container community-page" style={{ paddingTop: '2rem' }}>
      {/* Toast */}
      {toast && (
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
          <span>{toast}</span>
        </div>
      )}

      {/* Back button & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/community" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Back to Blacklist
          </Button>
        </Link>

        <Button variant="outline" size="sm" onClick={handleShare} icon={<Share2 size={15} />}>
          Share Incident Warning
        </Button>
      </div>

      {/* Legal & Review Notice Banner */}
      <div style={{
        background: isVerified ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${isVerified ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {isVerified ? (
          <ShieldAlert size={24} color="#ef4444" style={{ flexShrink: 0 }} />
        ) : (
          <AlertTriangle size={24} color="#fbbf24" style={{ flexShrink: 0 }} />
        )}
        <div>
          <strong style={{ color: isVerified ? '#fca5a5' : '#fde68a', fontSize: '1rem' }}>
            {isVerified ? 'VERIFIED SCAM REPORT' : isUnderReview ? 'UNDER ACTIVE INVESTIGATION' : 'UNREVIEWED COMMUNITY ALLEGATION'}
          </strong>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem', lineHeight: 1.5 }}>
            {report.verificationNotice}
          </p>
        </div>
      </div>

      {/* Main Incident Card */}
      <Card 
        title={report.company_name}
        subtitle={report.internship_title ? `Position Claim: ${report.internship_title}` : 'Unspecified Internship Role'}
        icon={<Building size={22} color={isVerified ? "#ef4444" : "#fbbf24"} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Review Status:</span>
            <div style={{ marginTop: '0.2rem' }}>
              {isVerified ? (
                <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.92rem' }}>
                  Confirmed Scam (Verified by SecOps Admin)
                </span>
              ) : isUnderReview ? (
                <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.92rem' }}>
                  Under Investigation
                </span>
              ) : (
                <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.92rem' }}>
                  Pending Moderation Review
                </span>
              )}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Date Filed:</span>
            <div style={{ marginTop: '0.2rem', fontWeight: 600, color: '#ffffff' }}>
              {new Date(report.created_at).toLocaleDateString()} ({new Date(report.created_at).toLocaleTimeString()})
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Report Reference:</span>
            <div style={{ marginTop: '0.2rem', fontFamily: 'monospace', color: '#94a3b8' }}>
              INCIDENT-#{report.id}
            </div>
          </div>
        </div>

        {/* Fraud Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Incident Description & Alleged Tactics
          </h3>
          <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            {report.description}
          </p>
        </div>

        {/* Evidence Reference */}
        {report.evidence_reference && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Evidence & Documentation Reference
            </h3>
            <p style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
              {report.evidence_reference}
            </p>
          </div>
        )}

        {/* Action Advisory Box */}
        <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '1rem' }}>
          <h4 style={{ color: '#f87171', marginBottom: '0.4rem', fontSize: '0.92rem' }}>
            Protective Recommendations for Candidates
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <li>Do not transfer monetary funds or deposits via UPI, net banking, or cryptocurrency.</li>
            <li>Never provide bank account login credentials, OTPs, or blank signed cheques.</li>
            <li>Cross-check company registration on the Ministry of Corporate Affairs (mca.gov.in) portal.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
