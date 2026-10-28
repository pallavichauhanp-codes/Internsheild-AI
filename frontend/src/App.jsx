import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  FileText, 
  Database, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { checkBackendHealth, analyzeScamText, verifyDomain, fetchScamReports } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState({ checked: false, online: false });

  // AI Analyzer state
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Domain Verifier state
  const [domainInput, setDomainInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // Reports state
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Poll backend health on mount
  useEffect(() => {
    async function checkHealth() {
      const res = await checkBackendHealth();
      setBackendStatus({
        checked: true,
        online: res.status === 'online',
        details: res
      });
    }
    checkHealth();
  }, []);

  // Quick template helpers for college demo
  const sampleTemplates = [
    {
      title: 'Paid Telegram Task Scam',
      text: 'Congratulations! You are selected as Remote Web Developer Intern. No interview needed! Daily stipend Rs. 1500. Join our Telegram channel @quicktask_jobs and pay Rs. 999 registration fee for kit.'
    },
    {
      title: 'Training Kit Fee Scam',
      text: 'Dear Candidate, we are pleased to offer you Frontend Internship. You need to deposit a refundable security fee of $49 for laptop dispatch and compliance verification. Reply to hr-team@gmail.com'
    },
    {
      title: 'Legitimate Internship Posting',
      text: 'Software Engineer Intern - Google. Qualifications: Enrolled in BS/MS in Computer Science. Will work on scalable cloud services. Technical rounds and coding interview required. Apply via google.com/careers'
    }
  ];

  async function handleRunAnalysis() {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const response = await analyzeScamText(inputText);
      if (response.success) {
        setAnalysisResult(response.data);
      } else {
        setAnalysisError(response.message || 'Analysis failed');
      }
    } catch (err) {
      setAnalysisError(err.message || 'Could not connect to backend API');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleDomainCheck() {
    if (!domainInput.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyDomain(domainInput);
      if (res.success) {
        setVerifyResult(res.data);
      }
    } catch (err) {
      setVerifyResult({ error: err.message });
    } finally {
      setIsVerifying(false);
    }
  }

  async function loadCommunityReports() {
    setLoadingReports(true);
    try {
      const res = await fetchScamReports();
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.warn('Reports load error:', err);
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'reports') {
      loadCommunityReports();
    }
  }, [activeTab]);

  return (
    <div className="app-wrapper">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="container nav-container">
          <div className="brand">
            <div className="brand-icon">
              <Shield size={22} />
            </div>
            <span>InternShield AI</span>
            <span className="brand-badge">Hackathon Core</span>
          </div>

          <div className="nav-actions">
            <div className="status-pill">
              <span className={`status-dot ${backendStatus.online ? 'online' : 'offline'}`} />
              <span>{backendStatus.online ? 'Backend API Online (Port 5000)' : 'Backend API Connecting...'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-tag">
            <Sparkles size={16} />
            AI-Powered Student Defense Against Internship Frauds
          </div>
          <h1 className="hero-title">Protecting Students From Fake Offers & Scams</h1>
          <p className="hero-subtitle">
            A full-stack verification engine built with React, Node.js, Express, MySQL, and AI.
            Detect upfront registration fee traps, fake task scams, and unverified recruiter domains.
          </p>

          {/* Navigation Tabs */}
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Cpu size={18} />
              Architecture & Plan
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyzer')}
            >
              <ShieldAlert size={18} />
              AI Scam Analyzer
            </button>
            <button 
              className={`tab-btn ${activeTab === 'verifier' ? 'active' : ''}`}
              onClick={() => setActiveTab('verifier')}
            >
              <Search size={18} />
              Domain & Email Checker
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <Database size={18} />
              Scam Database Feed
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="container">
          
          {/* TAB 1: OVERVIEW & SETUP CHECKLIST */}
          {activeTab === 'overview' && (
            <div>
              <div className="glass-panel card">
                <div className="card-header">
                  <h2 className="card-title">
                    <CheckCircle2 size={24} color="#38bdf8" />
                    Project Scaffold & Initial Setup Complete
                  </h2>
                  <span className="badge badge-safe">Stage 1 Initialized</span>
                </div>

                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  The clean project structure has been generated with separate <code>frontend/</code> and <code>backend/</code> environments, 
                  configured dependencies, standard CSS design tokens, and MySQL database schema.
                </p>

                <div className="arch-grid">
                  <div className="arch-card">
                    <div className="arch-card-header">
                      <Sparkles size={20} color="#38bdf8" />
                      Frontend (React + Vite)
                    </div>
                    <div className="arch-card-desc">
                      Vanilla JavaScript with Vite 6, custom CSS variables, glassmorphic styling, and REST API integration.
                    </div>
                  </div>

                  <div className="arch-card">
                    <div className="arch-card-header">
                      <Terminal size={20} color="#818cf8" />
                      Backend (Node.js + Express)
                    </div>
                    <div className="arch-card-desc">
                      ES Module architecture, CORS configuration, modular route controllers, and Gemini AI integration layer.
                    </div>
                  </div>

                  <div className="arch-card">
                    <div className="arch-card-header">
                      <Database size={20} color="#34d399" />
                      Database (MySQL)
                    </div>
                    <div className="arch-card-desc">
                      <code>mysql2</code> connection pool with pre-built SQL schema for <code>scam_reports</code>, <code>company_directory</code>, and <code>analysis_logs</code>.
                    </div>
                  </div>

                  <div className="arch-card">
                    <div className="arch-card-header">
                      <ShieldCheck size={20} color="#f59e0b" />
                      AI Fraud Detection Layer
                    </div>
                    <div className="arch-card-desc">
                      Google Generative AI SDK with built-in heuristic fallback engine for prompt analysis and risk scoring.
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#ffffff' }}>
                    Quick Start Commands:
                  </h3>
                  <div className="terminal-box">
                    # Terminal 1 - Start Express Backend API (Port 5000)<br />
                    cd backend<br />
                    npm run dev<br />
                    <br />
                    # Terminal 2 - Start React Vite Frontend (Port 5173)<br />
                    cd frontend<br />
                    npm run dev
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI SCAM ANALYZER */}
          {activeTab === 'analyzer' && (
            <div className="glass-panel card">
              <div className="card-header">
                <h2 className="card-title">
                  <ShieldAlert size={24} color="#f87171" />
                  Analyze Internship Offer or Job Posting
                </h2>
                <span className="badge badge-warning">AI Model & Heuristics</span>
              </div>

              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Paste the text from an internship offer letter, WhatsApp message, email, or job portal description to evaluate fraud risk.
              </p>

              {/* Template chips */}
              <div className="template-bar">
                <span className="template-label">Try sample data:</span>
                {sampleTemplates.map((tpl, i) => (
                  <button 
                    key={i} 
                    className="template-chip"
                    onClick={() => setInputText(tpl.text)}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>

              <textarea 
                className="textarea-control"
                placeholder="Paste internship text here (e.g. 'Pay ₹1500 registration fee for offer letter...')"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || !inputText.trim()}
                >
                  {isAnalyzing ? 'Analyzing with AI...' : 'Scan For Fraud Signals'}
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => { setInputText(''); setAnalysisResult(null); }}
                >
                  Clear
                </button>
              </div>

              {analysisError && (
                <div style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.9rem' }}>
                  ⚠️ {analysisError}
                </div>
              )}

              {/* Analysis Result Display */}
              {analysisResult && (
                <div className={`result-box ${
                  analysisResult.riskLevel === 'HIGH_RISK' ? 'risk-high' : 
                  analysisResult.riskLevel === 'MODERATE_RISK' ? 'risk-medium' : 'risk-safe'
                }`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {analysisResult.riskLevel === 'HIGH_RISK' ? (
                        <ShieldAlert size={26} color="#ef4444" />
                      ) : (
                        <ShieldCheck size={26} color="#10b981" />
                      )}
                      <h3 style={{ fontSize: '1.25rem' }}>
                        Risk Assessment: {analysisResult.riskLevel}
                      </h3>
                    </div>
                    <span className={`badge ${
                      analysisResult.riskLevel === 'HIGH_RISK' ? 'badge-danger' : 
                      analysisResult.riskLevel === 'MODERATE_RISK' ? 'badge-warning' : 'badge-safe'
                    }`}>
                      Risk Score: {analysisResult.riskScore}/100
                    </span>
                  </div>

                  <p style={{ marginTop: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                    {analysisResult.summary}
                  </p>

                  {analysisResult.redFlags && analysisResult.redFlags.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong style={{ color: '#fca5a5', fontSize: '0.9rem' }}>Detected Red Flags:</strong>
                      <ul className="flag-list">
                        {analysisResult.redFlags.map((flag, idx) => (
                          <li key={idx} className="flag-item">
                            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.recommendation && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>Recommendation: </strong>
                      <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>{analysisResult.recommendation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOMAIN VERIFIER */}
          {activeTab === 'verifier' && (
            <div className="glass-panel card">
              <div className="card-header">
                <h2 className="card-title">
                  <Search size={24} color="#38bdf8" />
                  Company & Recruiter Domain Verification
                </h2>
                <span className="badge badge-safe">Database + Heuristics</span>
              </div>

              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Verify if the email sender or job poster is using a legitimate enterprise domain or an untrusted public mail service.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
                <input 
                  type="text"
                  className="input-control"
                  placeholder="Enter domain (e.g. google.com or gmail.com)"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleDomainCheck}
                  disabled={isVerifying || !domainInput.trim()}
                >
                  {isVerifying ? 'Checking...' : 'Verify'}
                </button>
              </div>

              {verifyResult && (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  {verifyResult.error ? (
                    <div style={{ color: '#f87171' }}>⚠️ {verifyResult.error}</div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {verifyResult.isLegit ? (
                          <CheckCircle2 color="#10b981" size={20} />
                        ) : (
                          <XCircle color="#ef4444" size={20} />
                        )}
                        <strong>Domain: {verifyResult.domain}</strong>
                        <span className={`badge ${verifyResult.isLegit ? 'badge-safe' : 'badge-danger'}`}>
                          {verifyResult.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {verifyResult.message || verifyResult.notes || 'Verified in corporate database'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCAM DATABASE FEED */}
          {activeTab === 'reports' && (
            <div className="glass-panel card">
              <div className="card-header">
                <h2 className="card-title">
                  <Database size={24} color="#34d399" />
                  Community Scam Blacklist Feed
                </h2>
                <button className="btn btn-outline" onClick={loadCommunityReports}>
                  Refresh
                </button>
              </div>

              {loadingReports ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading reported scams from MySQL...</p>
              ) : reports.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No reports recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.map((rep) => (
                    <div key={rep.id} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <strong style={{ color: '#ffffff' }}>{rep.company_name}</strong>
                        <span className="badge badge-danger">{rep.fraud_type || 'Scam Report'}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                        {rep.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        <span>Platform: {rep.platform_source}</span>
                        {rep.requested_amount > 0 && <span>Requested: ₹{rep.requested_amount}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>InternShield AI &bull; Full-Stack College Hackathon Project &bull; Built with React, Vite, Node.js, Express & MySQL</p>
        </div>
      </footer>
    </div>
  );
}
