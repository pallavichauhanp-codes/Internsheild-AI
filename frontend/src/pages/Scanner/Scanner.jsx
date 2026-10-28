import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  FileText, 
  Copy, 
  Check, 
  RotateCcw, 
  ExternalLink,
  Building,
  Mail,
  Globe,
  DollarSign,
  Info,
  Clock,
  Sparkles,
  Link2
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import RiskBadge from '../../components/common/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyzeStructuredScanApi } from '../../services/api';
import './Scanner.css';

export default function Scanner() {
  const navigate = useNavigate();

  // Form Fields State
  const [internshipTitle, setInternshipTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [internshipDescription, setInternshipDescription] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [offeredStipend, setOfferedStipend] = useState('');
  const [hasUpfrontFee, setHasUpfrontFee] = useState('no');
  const [upfrontFeeAmount, setUpfrontFeeAmount] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // UI / Analysis State
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isMockResult, setIsMockResult] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState(null);
  const [reportCopied, setReportCopied] = useState(false);

  // Preset demo loaders for testing validation & scoring
  const presets = [
    {
      label: '🚨 Critical Scam (Training Fee)',
      data: {
        internshipTitle: 'Frontend React Developer Intern',
        companyName: 'Apex Cloud Tech Solutions',
        recruiterEmail: 'apex-hr-recruiting@gmail.com',
        companyWebsite: 'https://apexcloud-tech.online',
        internshipDescription: 'Congratulations! You have been selected without technical interviews. We offer Rs. 25,000/month. You are required to deposit Rs. 2,499 for mandatory training materials and corporate laptop insurance prior to offer letter dispatch.',
        applicationUrl: 'https://bit.ly/apex-apply-2026',
        offeredStipend: '₹25,000 / month',
        hasUpfrontFee: 'yes',
        upfrontFeeAmount: '2499',
        additionalDetails: 'Recruiter contacted via WhatsApp from personal number and insisted on immediate payment within 2 hours.'
      }
    },
    {
      label: '⚠️ Telegram Task Scam',
      data: {
        internshipTitle: 'Digital Content Reviewer Intern',
        companyName: 'NextGen Task Freelance',
        recruiterEmail: '',
        companyWebsite: '',
        internshipDescription: 'Part-time remote internship for college students. Simple daily copy-paste and video review tasks. Daily payouts of Rs. 1,500. All instructions given on our official Telegram channel.',
        applicationUrl: 'https://t.me/quicktask_jobs',
        offeredStipend: '₹1,500 / day',
        hasUpfrontFee: 'no',
        upfrontFeeAmount: '',
        additionalDetails: 'Required to join a Telegram group where admin requests small recharge to activate withdrawal account.'
      }
    },
    {
      label: '✅ Verified Tech Internship',
      data: {
        internshipTitle: 'Software Engineering Intern (Summer 2026)',
        companyName: 'Microsoft India',
        recruiterEmail: 'university-hiring@microsoft.com',
        companyWebsite: 'https://careers.microsoft.com',
        internshipDescription: 'Qualifications: Enrolled in B.Tech/M.Tech Computer Science graduating in 2027. Strong algorithmic problem solving, data structures, and distributed systems. 2 rounds of coding assessment followed by 2 technical interview loops. No application fee or deposits.',
        applicationUrl: 'https://careers.microsoft.com/students/us/en/job/189201',
        offeredStipend: '₹80,000 / month',
        hasUpfrontFee: 'no',
        upfrontFeeAmount: '',
        additionalDetails: 'Application submitted directly via Microsoft university portal. Official recruiter verified on LinkedIn.'
      }
    },
    {
      label: '🔍 Unverified Startup (Uncertainty)',
      data: {
        internshipTitle: 'Junior Python Intern',
        companyName: 'Nebula Logic Labs',
        recruiterEmail: 'contact@nebulalogiclabs.in',
        companyWebsite: 'https://nebulalogiclabs.in',
        internshipDescription: 'Looking for a Python intern for building Django REST APIs. Unpaid learning internship for 2 months, converted to stipend based on performance. 1 technical assignment round.',
        applicationUrl: '',
        offeredStipend: 'Unpaid / Performance Based',
        hasUpfrontFee: 'no',
        upfrontFeeAmount: '',
        additionalDetails: 'Company website is under construction. No upfront fees requested.'
      }
    }
  ];

  const loadPreset = (presetData) => {
    setInternshipTitle(presetData.internshipTitle);
    setCompanyName(presetData.companyName);
    setRecruiterEmail(presetData.recruiterEmail);
    setCompanyWebsite(presetData.companyWebsite);
    setInternshipDescription(presetData.internshipDescription);
    setApplicationUrl(presetData.applicationUrl);
    setOfferedStipend(presetData.offeredStipend);
    setHasUpfrontFee(presetData.hasUpfrontFee);
    setUpfrontFeeAmount(presetData.upfrontFeeAmount);
    setAdditionalDetails(presetData.additionalDetails);
    setErrors({});
    setApiError('');
    setScanResult(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!internshipTitle.trim()) {
      newErrors.internshipTitle = 'Internship title is required.';
    }
    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    }
    if (!internshipDescription.trim()) {
      newErrors.internshipDescription = 'Please provide an internship description.';
    } else if (internshipDescription.trim().length < 15) {
      newErrors.internshipDescription = 'Description should be at least 15 characters long.';
    }
    if (hasUpfrontFee === 'yes' && !upfrontFeeAmount.trim()) {
      newErrors.upfrontFeeAmount = 'Please enter the requested fee amount.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');
    setScanResult(null);

    const payload = {
      internshipTitle,
      companyName,
      recruiterEmail,
      companyWebsite,
      internshipDescription,
      applicationUrl,
      offeredStipend,
      hasUpfrontFee,
      upfrontFeeAmount: hasUpfrontFee === 'yes' ? upfrontFeeAmount : '',
      additionalDetails
    };

    try {
      const response = await analyzeStructuredScanApi(payload);
      if (response.success) {
        setScanResult(response.data);
        setIsMockResult(response.isMockMode);
        window.scrollTo({ top: 400, behavior: 'smooth' });
      } else {
        setApiError(response.message || 'Scan could not be completed.');
      }
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
        setApiError('Validation failed. Please correct the highlighted errors.');
      } else {
        setApiError(err.message || 'An unexpected error occurred during threat scanning.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInternshipTitle('');
    setCompanyName('');
    setRecruiterEmail('');
    setCompanyWebsite('');
    setInternshipDescription('');
    setApplicationUrl('');
    setOfferedStipend('');
    setHasUpfrontFee('no');
    setUpfrontFeeAmount('');
    setAdditionalDetails('');
    setErrors({});
    setApiError('');
    setScanResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyQuestion = (question, index) => {
    navigator.clipboard?.writeText(question);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2500);
  };

  const handleCopyReport = () => {
    if (!scanResult) return;
    const textReport = `
=== INTERNSHIELD AI SCAN REPORT ===
Internship: ${internshipTitle} at ${companyName}
Threat Level: ${scanResult.riskLevel} (${scanResult.riskScore}/100)
Summary: ${scanResult.summary}

WARNING SIGNS:
${scanResult.warningSigns?.map(w => `- ${w.title}: ${w.explanation}`).join('\n')}

VERIFICATION STEPS:
${scanResult.verificationSteps?.map((v, i) => `${i + 1}. ${v}`).join('\n')}

DISCLAIMER:
${scanResult.disclaimer}
`;
    navigator.clipboard?.writeText(textReport.trim());
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 3000);
  };

  return (
    <div className="container scanner-page">
      {/* Page Header */}
      <div className="scanner-header">
        <div className="hero-pill" style={{ marginBottom: '1rem' }}>
          <Sparkles size={16} />
          <span>Real-Time Recruitment Fraud Detection Engine</span>
        </div>
        <h1 className="scanner-title">Internship Threat Scanner</h1>
        <p className="scanner-subtitle">
          Submit the internship details below. Our dual evaluation engine assesses fee indicators, recruiter domain authenticity, and recruitment compliance.
        </p>
      </div>

      {/* Preset Quick Loader Strip */}
      <div className="presets-bar">
        <span className="presets-label">Load Test Fixture:</span>
        {presets.map((preset, idx) => (
          <button 
            key={idx}
            type="button"
            className="preset-btn"
            onClick={() => loadPreset(preset.data)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Scanner Form */}
      {!scanResult && (
        <Card 
          title="Internship Verification Submission" 
          subtitle="Fields marked with * are required for threat evaluation"
          icon={<ShieldAlert size={22} />}
        >
          {apiError && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="scanner-form-grid">
              {/* 1. Internship Title */}
              <Input 
                label="Internship Title"
                placeholder="e.g. Frontend Developer Intern"
                value={internshipTitle}
                onChange={(e) => setInternshipTitle(e.target.value)}
                error={errors.internshipTitle}
                required
              />

              {/* 2. Company Name */}
              <Input 
                label="Company Name"
                placeholder="e.g. Apex Cloud Solutions"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                icon={<Building size={16} />}
                error={errors.companyName}
                required
              />

              {/* 3. Recruiter Email */}
              <Input 
                label="Recruiter Email Address"
                type="email"
                placeholder="e.g. hr@company.com or hr-apex@gmail.com"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                icon={<Mail size={16} />}
                helperText="Domain is analyzed against public/disposable email registries"
              />

              {/* 4. Company Website */}
              <Input 
                label="Company Website URL"
                placeholder="e.g. https://apexcloud.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                icon={<Globe size={16} />}
                helperText="Missing websites are treated as uncertainty, not automatic fraud"
              />

              {/* 5. Offered Stipend */}
              <Input 
                label="Offered Stipend / Compensation"
                placeholder="e.g. ₹15,000 / month or Unpaid"
                value={offeredStipend}
                onChange={(e) => setOfferedStipend(e.target.value)}
                icon={<DollarSign size={16} />}
              />

              {/* 6. Application URL */}
              <Input 
                label="Application / Portal URL"
                placeholder="e.g. https://linkedin.com/jobs/view/... or Telegram link"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                icon={<Link2 size={16} />}
              />

              {/* 7. Upfront Fee Switcher */}
              <div className="fee-toggle-box form-full-width">
                <label className="input-label">
                  Is any upfront payment, registration fee, or laptop deposit requested? <span className="input-required">*</span>
                </label>
                <div className="fee-options-row">
                  <label className="fee-option-label">
                    <input 
                      type="radio" 
                      name="upfrontFee" 
                      value="no" 
                      checked={hasUpfrontFee === 'no'} 
                      onChange={() => setHasUpfrontFee('no')}
                    />
                    <span>No (Zero fees requested)</span>
                  </label>
                  <label className="fee-option-label">
                    <input 
                      type="radio" 
                      name="upfrontFee" 
                      value="yes" 
                      checked={hasUpfrontFee === 'yes'} 
                      onChange={() => setHasUpfrontFee('yes')}
                    />
                    <span style={{ color: '#f87171', fontWeight: 600 }}>Yes (Fee demanded for training, kit, or security)</span>
                  </label>
                </div>

                {hasUpfrontFee === 'yes' && (
                  <div style={{ marginTop: '0.75rem', maxWidth: '320px' }}>
                    <Input 
                      label="Requested Amount (₹)"
                      type="number"
                      placeholder="e.g. 2499"
                      value={upfrontFeeAmount}
                      onChange={(e) => setUpfrontFeeAmount(e.target.value)}
                      error={errors.upfrontFeeAmount}
                      required
                    />
                  </div>
                )}
              </div>

              {/* 8. Internship Description */}
              <div className="form-full-width">
                <Input 
                  as="textarea"
                  rows={5}
                  label="Internship Description / Offer Letter Terms"
                  placeholder="Paste the job description, WhatsApp message, email body, or offer clauses here..."
                  value={internshipDescription}
                  onChange={(e) => setInternshipDescription(e.target.value)}
                  error={errors.internshipDescription}
                  required
                />
              </div>

              {/* 9. Additional Details */}
              <div className="form-full-width">
                <Input 
                  as="textarea"
                  rows={3}
                  label="Additional Recruiter Notes / Observations (Optional)"
                  placeholder="e.g. Recruiter insisted on immediate response within 2 hours; communication was on Telegram..."
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                loading={isLoading}
                icon={<ShieldAlert size={18} />}
              >
                Execute Threat Scan (POST /api/scans/analyze)
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={handleReset}
                disabled={isLoading}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card style={{ margin: '2rem 0' }}>
          <LoadingSpinner 
            text="Querying InternShield AI Threat Engine (POST /api/scans/analyze)..." 
          />
        </Card>
      )}

      {/* =========================================================
          RESULT DISPLAY SECTION
          ========================================================= */}
      {scanResult && !isLoading && (
        <div className="result-container">
          {/* Temporary Mock Mode Banner if offline */}
          {isMockResult && (
            <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} />
                <span><strong>TEMPORARY MOCK MODE:</strong> Backend API is currently offline. Evaluated via client-side heuristic threat simulator.</span>
              </div>
              <span className="demo-badge">Mock Mode</span>
            </div>
          )}

          {/* Result Hero Card with Visual Dial & Progress Bar */}
          <div className={`result-hero-card level-${scanResult.riskLevel?.toLowerCase() || 'medium'}`}>
            <div className="result-meter-header">
              <div className="score-badge-group">
                {/* Circular Score Dial */}
                <div className={`score-dial dial-${scanResult.riskLevel?.toLowerCase() || 'medium'}`}>
                  <span className="dial-number">{scanResult.riskScore}</span>
                  <span className="dial-label">/ 100</span>
                </div>

                <div className="score-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h2>Risk Level: {scanResult.riskLevel}</h2>
                    <RiskBadge level={scanResult.riskLevel} size="md" />
                  </div>
                  <p>{scanResult.summary}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyReport}
                  icon={reportCopied ? <Check size={14} /> : <Copy size={14} />}
                >
                  {reportCopied ? 'Report Copied' : 'Copy Report'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  icon={<RotateCcw size={14} />}
                >
                  Scan Another Offer
                </Button>
              </div>
            </div>

            {/* Linear Risk Meter */}
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
                  className={`risk-bar-fill bar-${scanResult.riskLevel?.toLowerCase() || 'medium'}`}
                  style={{ width: `${Math.max(5, scanResult.riskScore)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Warning Signs & Trust Indicators Grid */}
          <div className="result-sections-grid">
            {/* Warning Signs with Explanations */}
            <Card 
              title={`Warning Signs & Vulnerabilities (${scanResult.warningSigns?.length || 0})`}
              subtitle="Specific threat factors detected in the submission"
              icon={<ShieldAlert size={20} color="#f87171" />}
            >
              {scanResult.warningSigns && scanResult.warningSigns.length > 0 ? (
                <div>
                  {scanResult.warningSigns.map((w, idx) => (
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
                  No severe warning signs detected in the provided submission.
                </div>
              )}
            </Card>

            {/* Trust Indicators */}
            <Card 
              title={`Positive Trust Indicators (${scanResult.trustIndicators?.length || 0})`}
              subtitle="Signals aligning with verified recruitment standards"
              icon={<ShieldCheck size={20} color="#34d399" />}
            >
              {scanResult.trustIndicators && scanResult.trustIndicators.length > 0 ? (
                <div>
                  {scanResult.trustIndicators.map((t, idx) => (
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
          <div className="result-sections-grid">
            {/* Recommended Verification Steps */}
            <Card 
              title="Recommended Verification Checklist" 
              subtitle="Step-by-step actions before signing or responding"
              icon={<FileText size={20} color="#38bdf8" />}
            >
              <div>
                {scanResult.verificationSteps?.map((step, idx) => (
                  <div key={idx} className="step-item-box">
                    <span className="step-number-tag">{idx + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Questions to Ask Recruiter */}
            <Card 
              title="Pointed Questions to Ask Recruiter" 
              subtitle="Test recruiter legitimacy with these structured questions"
              icon={<HelpCircle size={20} color="#818cf8" />}
            >
              <div>
                {scanResult.recruiterQuestions?.map((q, idx) => (
                  <div key={idx} className="question-item-box">
                    <span className="question-text">{q}</span>
                    <button 
                      type="button"
                      className="copy-question-btn"
                      onClick={() => handleCopyQuestion(q, idx)}
                      title="Copy question text"
                    >
                      {copiedQuestionIndex === idx ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Report to Blacklist CTA if High / Critical */}
          {(scanResult.riskLevel === 'Critical' || scanResult.riskLevel === 'High') && (
            <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#fca5a5', fontSize: '1.1rem' }}>High Threat Detected</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  Help protect students across 180+ colleges by filing an anonymous report in the community blacklist.
                </p>
              </div>
              <Button 
                variant="danger" 
                size="md"
                onClick={() => navigate('/community')}
                icon={<ShieldAlert size={16} />}
              >
                File Community Scam Report
              </Button>
            </div>
          )}

          {/* Scan Footer & Disclaimer */}
          <div className="result-footer-box">
            <div className="result-actions-strip">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={15} />
                <span>Scan Completed: <strong>{new Date(scanResult.scanDate || Date.now()).toLocaleString()}</strong></span>
              </div>
              <div>
                Engine: <code>{scanResult.engine || 'InternShield Threat Intelligence Engine'}</code>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem', lineHeight: 1.5 }}>
              <strong>LEGAL & VERIFICATION DISCLAIMER:</strong> {scanResult.disclaimer} InternShield AI evaluates patterns against known threat indicators; absence of reported data is treated as uncertainty rather than definitive proof of fraud. Verification claims are never asserted without authenticated registry confirmation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
