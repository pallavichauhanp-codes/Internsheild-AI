import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowLeft, 
  ThumbsUp, 
  Share2, 
  AlertTriangle, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2, 
  Send,
  Lock
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import RiskBadge from '../../components/common/RiskBadge';
import Input from '../../components/common/Input';
import { SAMPLE_REPORTS } from '../../data/demoData';
import './Community.css';

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find report by id or default to first sample
  const report = SAMPLE_REPORTS.find(r => r.id === id) || SAMPLE_REPORTS[0];

  const [upvotes, setUpvotes] = useState(report.upvotes || 84);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [toast, setToast] = useState('');

  // Comments state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Vikram S. (IIT Roorkee)',
      date: '2 days ago',
      text: 'I got the exact same WhatsApp message yesterday claiming to be from HR. They even sent a forged stamp on the offer PDF.'
    },
    {
      id: 2,
      author: 'Ananya P. (Delhi Tech Univ)',
      date: '1 day ago',
      text: 'Thanks for posting! They called me and pressured me saying "only 3 slots left". Blocked them immediately.'
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(upvotes - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(upvotes + 1);
      setHasUpvoted(true);
      showToast('Upvote confirmed! You boosted this warning.');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Report URL copied to clipboard!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      ...comments,
      {
        id: Date.now(),
        author: 'Current Student (Demo User)',
        date: 'Just now',
        text: newComment
      }
    ]);
    setNewComment('');
    showToast('Comment posted to discussion thread.');
  };

  return (
    <div className="container community-page">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000, background: '#0f172a', border: '1px solid #38bdf8', color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 color="#38bdf8" size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link to="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} />
          <span>Back to All Scam Reports</span>
        </Link>
      </div>

      <div className="report-detail-layout">
        {/* Left Column: Investigation Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="demo-badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  Verified Case File #{report.id}
                </span>
                <h1 style={{ fontSize: '1.85rem', color: '#ffffff' }}>{report.companyName}</h1>
                <p style={{ color: 'var(--primary)', fontSize: '1.05rem', fontWeight: 600 }}>{report.allegedRole}</p>
              </div>
              <RiskBadge level={report.riskLevel} score={report.riskScore} size="lg" />
            </div>

            <p style={{ color: '#e2e8f0', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {report.details || report.summary}
            </p>

            {/* Red Flags List */}
            {report.redFlags && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#fca5a5', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Identified Red Flags & Threat Signals:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {report.redFlags.map((flag, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.9rem' }}>
                      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Buttons */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
              <Button 
                variant={hasUpvoted ? 'primary' : 'outline'} 
                size="md" 
                onClick={handleUpvote}
                icon={<ThumbsUp size={16} />}
              >
                {hasUpvoted ? `Endorsed (${upvotes})` : `Upvote Report (${upvotes})`}
              </Button>
              <Button 
                variant="outline" 
                size="md" 
                onClick={handleShare}
                icon={<Share2 size={16} />}
              >
                Share Case Link
              </Button>
            </div>
          </Card>

          {/* Student Discussion Thread */}
          <Card 
            title="Student Discussion & Warnings" 
            subtitle="Campus peers sharing similar encounters"
            icon={<MessageSquare size={20} />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {comments.map((c) => (
                <div key={c.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{c.author}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{c.date}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.75rem' }}>
              <Input 
                placeholder="Add a comment or confirm if you were contacted by this entity..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" variant="primary" size="md" icon={<Send size={15} />}>
                Post
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Case Summary Card & Reporting Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Case Meta Summary" icon={<Lock size={18} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)' }}>Fraud Category:</span>
                <strong style={{ color: '#ffffff' }}>{report.fraudType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)' }}>Demanded Sum:</span>
                <strong style={{ color: '#f87171' }}>{report.demandedAmount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)' }}>Primary Channel:</span>
                <span style={{ color: '#cbd5e1' }}>{report.platform}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)' }}>Report Date:</span>
                <span style={{ color: '#cbd5e1' }}>{report.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Verification Status:</span>
                <span className="badge badge-danger">{report.status}</span>
              </div>
            </div>
          </Card>

          {/* Legal Recourse Card */}
          <Card title="Official Reporting" icon={<ExternalLink size={18} />}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              If you have already paid money or shared Aadhaar/Bank details with this entity, register a cybercrime ticket immediately:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="danger" size="md" style={{ width: '100%' }} icon={<ExternalLink size={15} />}>
                  File National Cybercrime Ticket
                </Button>
              </a>
              <a href="tel:1930" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="md" style={{ width: '100%' }}>
                  Call Toll-Free Helpline: 1930
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
