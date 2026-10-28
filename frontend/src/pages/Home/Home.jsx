import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Cpu, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles,
  Database,
  ExternalLink
} from 'lucide-react';
import Button from '../../components/common/Button';
import RiskBadge from '../../components/common/RiskBadge';
import { PLATFORM_STATS, SAMPLE_REPORTS, FAQ_LIST } from '../../data/demoData';
import './Home.css';

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="container hero-container">
          <div className="hero-pill">
            <Sparkles size={16} />
            <span>AI-Driven Threat Intelligence for College Students</span>
          </div>

          <h1 className="hero-title">
            Your Shield Against <br />
            <span className="hero-gradient-text">Internship Scams</span>
          </h1>

          <p className="hero-description">
            Instant fraud risk scoring, red-flag analysis, company domain verification, and community threat intelligence. Never lose your hard-earned money to fake offers, training fee traps, or predatory WhatsApp recruiters.
          </p>

          <div className="hero-actions">
            <Link to="/scanner">
              <Button variant="primary" size="lg" icon={<ShieldAlert size={20} />} iconPosition="left">
                Analyze Internship Offer
              </Button>
            </Link>
            <Link to="/community">
              <Button variant="outline" size="lg" icon={<Search size={18} />} iconPosition="left">
                Explore Scam Blacklist
              </Button>
            </Link>
          </div>

          {/* Stats Ribbon */}
          <div className="stats-ribbon">
            <div className="stat-item">
              <span className="stat-number">{PLATFORM_STATS.totalScans}</span>
              <span className="stat-label">Offers Scanned</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{PLATFORM_STATS.confirmedScams}</span>
              <span className="stat-label">Scams Flagged</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{PLATFORM_STATS.fundsProtected}</span>
              <span className="stat-label">Student Money Saved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{PLATFORM_STATS.collegesCovered}</span>
              <span className="stat-label">Campus Networks</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container">
        <div className="section-header">
          <span className="section-tag">
            <Cpu size={15} /> Simple 3-Step Verification
          </span>
          <h2 className="section-title">How InternShield AI Protects You</h2>
          <p className="section-subtitle">
            Engineered specifically to detect patterns common to Indian & global campus recruitment frauds.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon-box">
              <Search size={24} />
            </div>
            <h3 className="step-title">Paste Offer or Domain</h3>
            <p className="step-desc">
              Paste the text from your offer letter, WhatsApp message, email, or enter the recruiter's domain or contact handles.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon-box">
              <Cpu size={24} />
            </div>
            <h3 className="step-title">AI & Threat Engine Scan</h3>
            <p className="step-desc">
              Our Google Gemini AI pipeline & heuristic rules evaluate upfront fees, unverified domains, and high-urgency psychological traps.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon-box">
              <ShieldCheck size={24} />
            </div>
            <h3 className="step-title">Instant Risk Score & Advice</h3>
            <p className="step-desc">
              Receive a 0–100 risk score, highlighted red flags, corporate verification status, and safe reporting instructions.
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="container">
        <div className="section-header">
          <span className="section-tag">
            <Shield size={15} /> Comprehensive Defense Suite
          </span>
          <h2 className="section-title">Built for High-Stakes Campus Hiring</h2>
          <p className="section-subtitle">
            Every feature is designed to give students actionable clarity before submitting identity documents or money.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <ShieldAlert size={28} />
            </div>
            <div className="feature-content">
              <h3>AI Offer Text Scanner</h3>
              <p>
                Advanced NLP identifies deceptive terms like "laptop security deposit", "mandatory training charges", and "certificate processing fee" within seconds.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Search size={28} />
            </div>
            <div className="feature-content">
              <h3>Recruiter Domain Verifier</h3>
              <p>
                Cross-reference recruiters claiming to be from top tech firms against public email domains (@gmail.com) and suspicious lookalike URLs.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Database size={28} />
            </div>
            <div className="feature-content">
              <h3>Crowd-Sourced Scam Blacklist</h3>
              <p>
                Peer-verified database of deceptive companies, Telegram task channels, and UPI VPA IDs submitted by students across 180+ colleges.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Lock size={28} />
            </div>
            <div className="feature-content">
              <h3>Direct Cyber Crime Portals</h3>
              <p>
                Instant 1-click access to the National Cyber Crime Reporting Portal (1930) and MCA CIN registry for immediate legal recourse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE REPORTS PREVIEWS */}
      <section className="container">
        <div className="section-header">
          <span className="section-tag">
            <AlertTriangle size={15} /> Live Threat Feed
          </span>
          <h2 className="section-title">Recent Flagged Internship Scams</h2>
          <p className="section-subtitle">
            Real patterns reported by fellow students to keep your campus batch vigilant.
          </p>
        </div>

        <div className="reports-preview-grid">
          {SAMPLE_REPORTS.slice(0, 3).map((rep) => (
            <div key={rep.id} className="report-preview-card">
              <div>
                <div className="report-card-top">
                  <div>
                    <h3 className="report-company-name">{rep.companyName}</h3>
                    <p className="report-role-name">{rep.allegedRole}</p>
                  </div>
                  <RiskBadge level={rep.riskLevel} score={rep.riskScore} size="sm" />
                </div>
                <p className="report-card-desc" style={{ marginTop: '0.85rem' }}>
                  {rep.summary}
                </p>
              </div>

              <div>
                <div className="report-card-footer">
                  <span>Demanded: <strong style={{ color: '#fca5a5' }}>{rep.demandedAmount}</strong></span>
                  <span>{rep.platform}</span>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to={`/community/${rep.id}`}>
                    <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} iconPosition="right" style={{ width: '100%' }}>
                      View Investigation Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/community">
            <Button variant="outline" size="md" icon={<ArrowRight size={16} />} iconPosition="right">
              Explore All Community Scam Reports
            </Button>
          </Link>
        </div>
      </section>

      {/* SAFETY TIPS BANNER */}
      <section className="container">
        <div className="safety-banner">
          <div>
            <div className="hero-pill" style={{ marginBottom: '1rem' }}>
              <Lock size={15} />
              <span>Crucial Golden Rule</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Legitimate Internships Pay You, Never The Other Way Around
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              No genuine company, startup, or MNC requires an upfront deposit for "training", "laptop courier", or "certificate issuance".
            </p>
            <Link to="/guidelines">
              <Button variant="secondary" size="md">
                Read Full Safety Checklist
              </Button>
            </Link>
          </div>

          <ul className="safety-points">
            <li className="safety-point-item">
              <CheckCircle2 size={20} className="safety-check-icon" />
              <span>Always verify recruiter email domains (e.g. @company.com vs @gmail.com).</span>
            </li>
            <li className="safety-point-item">
              <CheckCircle2 size={20} className="safety-check-icon" />
              <span>Reject offers requiring daily paid tasks in Telegram or WhatsApp channels.</span>
            </li>
            <li className="safety-point-item">
              <CheckCircle2 size={20} className="safety-check-icon" />
              <span>Never share Aadhaar OTPs, bank passwords, or blank cheques for "KYC".</span>
            </li>
            <li className="safety-point-item">
              <CheckCircle2 size={20} className="safety-check-icon" />
              <span>Cross-check corporate CIN numbers on the Ministry of Corporate Affairs portal.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="container">
        <div className="section-header">
          <span className="section-tag">
            <Sparkles size={15} /> Frequently Asked Questions
          </span>
          <h2 className="section-title">Got Questions? We’ve Got Answers</h2>
          <p className="section-subtitle">
            Everything you need to know about internship fraud detection and reporting.
          </p>
        </div>

        <div className="faq-list">
          {FAQ_LIST.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'faq-open' : ''}`}>
                <button 
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="#38bdf8" /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="container">
        <div className="cta-box">
          <h2 className="cta-title">Received a Suspicious Offer Letter?</h2>
          <p className="cta-desc">
            Don't pay a single rupee or sign away sensitive identity documents. Paste the text into our AI scanner and verify in under 5 seconds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/scanner">
              <Button variant="primary" size="lg" icon={<ShieldAlert size={20} />}>
                Scan Offer Letter Free
              </Button>
            </Link>
            <Link to="/community">
              <Button variant="outline" size="lg">
                Report A Fraud Company
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
