import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  Lock, 
  CheckCircle2, 
  Landmark, 
  PhoneCall,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { SAFETY_CHECKLIST } from '../../data/demoData';
import './Guidelines.css';

export default function SafetyGuidelines() {
  const archetypes = [
    {
      title: '1. The "Laptop Security Deposit" Scam',
      victimProfile: 'Remote software / content / data intern applicants',
      modusOperandi: 'Send a realistic-looking offer letter requiring ₹2,500 to ₹5,000 for "courier insurance" or "laptop security deposit", promising it is 100% refundable on your first payday.',
      redFlag: 'Real companies NEVER ask candidates to purchase or deposit money for work laptops.'
    },
    {
      title: '2. The Telegram "Task & Commission" Trap',
      victimProfile: 'College students looking for flexible part-time income',
      modusOperandi: 'Direct communication to Telegram channels. Pays ₹150 for liking 3 YouTube videos, then tricks victim into investing ₹2,000 to unlock higher tiered commissions.',
      redFlag: 'Legitimate companies do not conduct recruitment or daily work exclusively in anonymous Telegram chats.'
    },
    {
      title: '3. The "Unpaid MLM Certificate" Scheme',
      victimProfile: 'Marketing & business development student interns',
      modusOperandi: 'Offers a marketing internship where the only assignment is selling ₹999 certification courses to friends and college batchmates to "earn stipend".',
      redFlag: 'If earning a stipend depends on recruiting other students to pay money, it is a multi-level marketing pyramid.'
    },
    {
      title: '4. The KYC Identity Phishing Trap',
      victimProfile: 'Freshers eager for their first internship experience',
      modusOperandi: 'Directs students to an unverified Google Form or suspicious portal demanding Aadhaar photos, PAN cards, and bank account login OTPs prior to signing an agreement.',
      redFlag: 'Never share bank OTPs or unsigned blank cheques under the pretext of direct deposit setup.'
    }
  ];

  return (
    <div className="container guidelines-page">
      {/* Header */}
      <div className="guidelines-header">
        <div className="hero-pill" style={{ marginBottom: '1rem' }}>
          <Sparkles size={16} />
          <span>Student Cyber Defense Handbook</span>
        </div>
        <h1 className="guidelines-title">Internship Safety Guidelines & Red Flags</h1>
        <p className="guidelines-subtitle">
          Essential protocols to protect yourself, your finances, and your digital identity from recruitment frauds.
        </p>
      </div>

      {/* SECTION 1: GOLDEN RULES */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.4rem' }}>
            The 5 Golden Rules of Safe Campus Hiring
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Memorize these foundational cybersecurity checks before accepting any internship offer.
          </p>
        </div>

        <div className="rules-grid">
          {SAFETY_CHECKLIST.map((rule, idx) => (
            <div key={rule.id} className={`rule-card ${rule.critical ? 'critical-rule' : ''}`}>
              <div className="rule-num">{idx + 1}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{rule.title}</h3>
                  {rule.critical && <span className="badge badge-danger">Critical</span>}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: SCAM ARCHETYPES */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.4rem' }}>
            Common Recruitment Fraud Archetypes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Recognize the exact psychological traps used by scammers targeting college students.
          </p>
        </div>

        <div className="archetypes-grid">
          {archetypes.map((arch, i) => (
            <div key={i} className="archetype-box">
              <div className="archetype-header">
                <AlertTriangle size={20} color="#f59e0b" />
                <h3 className="archetype-title">{arch.title}</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                <strong>Target: </strong>{arch.victimProfile}
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {arch.modusOperandi}
              </p>
              <div className="archetype-red-box">
                <strong>Dead Giveaway: </strong>{arch.redFlag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: LEGAL RECOURSE & EMERGENCY STEPS */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.4rem' }}>
            What To Do If You Were Targeted or Scammed
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Follow these sequential emergency actions immediately to freeze financial transfers and document digital evidence.
          </p>
        </div>

        <div className="recourse-steps">
          <div className="recourse-step-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
              <Landmark size={22} />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Step 1: Contact Your Bank</strong>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              If you sent money via UPI or Net Banking, contact your bank branch and mobile banking app within the "Golden Hour" (first 2 hours) to freeze the recipient VPA account.
            </p>
          </div>

          <div className="recourse-step-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
              <PhoneCall size={22} />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Step 2: Dial 1930 & File Online</strong>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Call <strong>1930</strong> (National Cybercrime Reporting Helpline) immediately. Register an official FIR ticket at{' '}
              <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>
                cybercrime.gov.in
              </a>.
            </p>
          </div>

          <div className="recourse-step-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8' }}>
              <ShieldAlert size={22} />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Step 3: Alert Your College TPO</strong>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Inform your college Training and Placement Cell (TPO) to blacklist the recruiter from campus email lists, and submit a report on InternShield to protect other students.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Have an offer letter you are uncertain about?
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Run an instant AI text scan before signing or sharing personal details.
        </p>
        <Link to="/scanner">
          <Button variant="primary" size="lg" icon={<ShieldAlert size={18} />}>
            Open AI Threat Scanner
          </Button>
        </Link>
      </div>
    </div>
  );
}
