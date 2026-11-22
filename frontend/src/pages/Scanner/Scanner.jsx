import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building,
  Link2,
  Clock,
  Info,
  ArrowRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import RiskBadge from '../../components/common/RiskBadge';
import { analyzeStructuredScanApi } from '../../services/api';
import './Scanner.css';

export default function Scanner() {
  const navigate = useNavigate();

  // Primary Input States
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // { file, previewUrl, base64, name, sizeFormatted, type }
  const [isDragActive, setIsDragActive] = useState(false);

  // Optional Quick Fields
  const [companyName, setCompanyName] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);

  // Form State & Feedback
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Scan Results State
  const [scanResult, setScanResult] = useState(null);
  const [isMockResult, setIsMockResult] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState(null);
  const [reportCopied, setReportCopied] = useState(false);

  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  // Dynamic loading phase messages for cybersecurity telemetry
  const loadingSteps = [
    'Extracting text & visual features...',
    'Analyzing scam risk factors across 8 threat vectors...',
    'Checking recruiter domain authenticity & payment demands...',
    'Generating forensic risk report...'
  ];

  // Rotate loading steps every 1100ms when scanning
  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Test presets for rapid demonstration & grading
  const presets = [
    {
      label: '🚨 WhatsApp Fee Scam (₹2,499)',
      text: `Congratulations! Your resume has been shortlisted for Remote React Developer Intern at Apex Tech Solutions.\n\nStipend: ₹25,000/month.\nDirect selection without technical interview.\n\nIMPORTANT: You must deposit ₹2,499 for mandatory developer kit registration and corporate laptop insurance within 2 hours. Send screenshot of payment to this WhatsApp number to confirm your offer letter.`,
      company: 'Apex Cloud Solutions',
      url: 'https://bit.ly/apex-apply-now'
    },
    {
      label: '⚠️ Telegram Task Scam (₹1,500/day)',
      text: `Part-time online freelance internship for college students. Simple daily copy-paste and video review tasks. Daily payouts of ₹1,500 via UPI. Zero experience needed. Direct hiring today only.\n\nJoin our official Telegram task group to activate your account: https://t.me/quicktask_jobs`,
      company: 'NextGen Task Freelance',
      url: 'https://t.me/quicktask_jobs'
    },
    {
      label: '✅ Verified Tech Offer (Microsoft)',
      text: `Software Engineering Intern (Summer 2026) - Microsoft India R&D.\n\nEligibility: B.Tech / M.Tech in CS or related branch graduating 2027.\nRequirements: Strong algorithms, data structures, and computer science fundamentals.\n\nInterview Process: Online coding assessment on Microsoft Careers portal followed by 2 technical interview loops. Microsoft never charges any application fees, training deposits, or hardware costs.`,
      company: 'Microsoft India',
      url: 'https://careers.microsoft.com/students'
    },
    {
      label: '🔍 Unverified Startup (Uncertainty)',
      text: `Looking for a Junior Python Intern to build REST APIs using Django. 2-month unpaid internship with performance-based stipend conversion. 1 technical assignment round. Company website currently under development.`,
      company: 'Nebula Logic Labs',
      url: 'https://nebulalogiclabs.in'
    }
  ];

  const handleLoadPreset = (preset) => {
    setInputText(preset.text);
    setCompanyName(preset.company || '');
    setApplicationUrl(preset.url || '');
    if (preset.company || preset.url) {
      setIsOptionalOpen(true);
    }
    setValidationError('');
    setApiError('');
    setScanResult(null);
  };

  // Helper to format file sizes
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Process selected file
  const processFile = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationError('Please upload a valid image file (PNG, JPG, JPEG, or WEBP).');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('File size exceeds 10MB limit. Please upload a smaller screenshot.');
      return;
    }

    setValidationError('');
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      setSelectedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        base64: base64Data,
        name: file.name,
        sizeFormatted: formatFileSize(file.size),
        type: file.type.split('/')[1]?.toUpperCase() || 'IMAGE'
      });
    };
    reader.readAsDataURL(file);
  };

  // File input change handler
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText((prev) => (prev ? `${prev}\n\n${text}` : text));
          setValidationError('');
        }
      }
    } catch (err) {
      // Permission denied or clipboard empty
    }
  };

  // Main Form Submission Handler
  const handleSubmitScan = async (e) => {
    if (e) e.preventDefault();

    const trimmedText = inputText.trim();
    const hasImage = Boolean(selectedImage?.base64);

    // Validation: Require either text, image, or both
    if (!trimmedText && !hasImage) {
      setValidationError('Please provide internship text, upload a screenshot/image, or both to initiate the scan.');
      return;
    }

    setValidationError('');
    setApiError('');
    setIsLoading(true);
    setScanResult(null);

    // Construct unified payload for POST /api/scans/analyze
    const payload = {
      text: trimmedText,
      image: selectedImage ? selectedImage.base64 : undefined,
      companyName: companyName.trim() || undefined,
      applicationUrl: applicationUrl.trim() || undefined,
      // Compatibility aliases
      internshipDescription: trimmedText || (hasImage ? 'Screenshot/Document analysis submitted' : ''),
      internshipTitle: companyName.trim() ? `${companyName.trim()} Internship Offer` : 'Internship Verification Scan'
    };

    try {
      const response = await analyzeStructuredScanApi(payload);
      if (response.success && response.data) {
        setScanResult(response.data);
        setIsMockResult(response.isMockMode);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        setApiError(response.message || 'Threat scan could not be completed.');
      }
    } catch (err) {
      if (err.errors?.submission) {
        setValidationError(err.errors.submission);
      } else {
        setApiError(err.message || 'An unexpected error occurred during threat scanning.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    handleRemoveImage();
    setCompanyName('');
    setApplicationUrl('');
    setValidationError('');
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
    const reportText = `
=== INTERNSHIELD AI SCAN REPORT ===
Threat Score: ${scanResult.riskScore ?? scanResult.risk_score}/100
Threat Level: ${scanResult.riskLevel ?? scanResult.risk_level}
Company / Target: ${companyName || 'Unspecified'}
Summary: ${scanResult.summary || scanResult.explanations}

WARNING SIGNS:
${(scanResult.warningSigns || scanResult.warning_signs || []).map(w => `- ${w.title}: ${w.explanation}`).join('\n')}

TRUST INDICATORS:
${(scanResult.trustIndicators || scanResult.positive_indicators || []).map(t => `+ ${t}`).join('\n')}

VERIFICATION STEPS:
${(scanResult.verificationSteps || scanResult.recommended_actions || []).map((v, i) => `${i + 1}. ${v}`).join('\n')}

DISCLAIMER:
${scanResult.disclaimer || scanResult.limitations?.[0] || 'Automated Threat Assessment.'}
`;
    navigator.clipboard?.writeText(reportText.trim());
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 3000);
  };

  return (
    <div className="container scanner-page">
      {/* Page Header */}
      <div className="scanner-header">
        <div className="scanner-badge">
          <span className="scanner-badge-dot" />
          <Sparkles size={14} />
          <span>Real-Time Recruitment Fraud & Threat Analyzer</span>
        </div>
        <h1 className="scanner-title">
          Internship <span className="gradient-text">Threat Scanner</span>
        </h1>
        <p className="scanner-subtitle">
          Instantly evaluate job postings, suspicious WhatsApp/Telegram messages, offer letters, or recruitment screenshots across 8 cybersecurity threat vectors.
        </p>
      </div>

      {/* Preset Quick Loader Strip */}
      <div className="presets-bar">
        <span className="presets-label">
          <Sparkles size={14} color="#38bdf8" />
          Quick Test Fixtures:
        </span>
        {presets.map((preset, idx) => (
          <button 
            key={idx}
            type="button"
            className="preset-btn"
            onClick={() => handleLoadPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Scanner Input Workspace */}
      {!scanResult && (
        <div className="scanner-workspace">
          {/* Top API Error if present */}
          {apiError && (
            <div className="validation-alert-banner" style={{ marginBottom: '1.25rem' }}>
              <AlertTriangle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          {/* Primary Dual Input Grid: Text Input + Image Upload */}
          <div className="dual-input-grid">
            {/* 1. Large Text Input Section */}
            <div className="input-section-card">
              <div className="section-card-header">
                <div className="section-title">
                  <div className="section-icon-badge">
                    <FileText size={16} />
                  </div>
                  <span>Paste Text / Message</span>
                </div>
                <span className="section-counter">
                  {inputText.length} chars
                </span>
              </div>

              <div className="scanner-textarea-wrap">
                <textarea
                  id="scanner-text-input"
                  className="scanner-textarea"
                  placeholder="Paste job description, recruiter WhatsApp message, suspicious email, offer letter text, or stipend terms here..."
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  rows={8}
                />

                <div className="textarea-footer">
                  <span>Supports chats, job descriptions, emails, and payment demands</span>
                  <div className="textarea-actions">
                    <button 
                      type="button" 
                      className="text-action-link"
                      onClick={handlePasteFromClipboard}
                      title="Paste text from clipboard"
                    >
                      Paste Clipboard
                    </button>
                    {inputText.length > 0 && (
                      <button 
                        type="button" 
                        className="text-action-link"
                        onClick={() => setInputText('')}
                        style={{ color: '#f87171' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Drag-and-Drop Image Upload Section */}
            <div className="input-section-card">
              <div className="section-card-header">
                <div className="section-title">
                  <div className="section-icon-badge">
                    <ImageIcon size={16} />
                  </div>
                  <span>Upload Screenshot / Offer</span>
                </div>
                <span className="section-counter">
                  PNG, JPG, WEBP
                </span>
              </div>

              <div className="dropzone-container">
                <input 
                  ref={fileInputRef}
                  id="scanner-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />

                {!selectedImage ? (
                  <div 
                    className={`upload-dropzone ${isDragActive ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="dropzone-icon-wrap">
                      <UploadCloud size={28} />
                    </div>
                    <div className="dropzone-title">
                      Drop screenshot here, or <span className="browse-highlight">browse</span>
                    </div>
                    <p className="dropzone-subtitle">
                      Upload WhatsApp chat, Telegram screenshot, LinkedIn message, or offer letter
                    </p>
                    <div className="dropzone-tags">
                      <span className="format-tag">PNG</span>
                      <span className="format-tag">JPG</span>
                      <span className="format-tag">WEBP</span>
                      <span className="format-tag">Max 10MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="image-preview-card">
                    <div className="preview-thumbnail-wrap">
                      <img 
                        src={selectedImage.previewUrl} 
                        alt="Screenshot Preview" 
                        className="preview-image" 
                      />
                      <div className="preview-overlay-badge">
                        <ImageIcon size={13} />
                        <span>{selectedImage.type}</span>
                      </div>
                    </div>

                    <div className="preview-meta-strip">
                      <div className="preview-file-info">
                        <span className="preview-filename" title={selectedImage.name}>
                          {selectedImage.name}
                        </span>
                        <span className="preview-filesize">
                          {selectedImage.sizeFormatted}
                        </span>
                      </div>

                      <div className="preview-actions">
                        <button 
                          type="button" 
                          className="preview-btn"
                          onClick={() => fileInputRef.current?.click()}
                          title="Change screenshot"
                        >
                          Change
                        </button>
                        <button 
                          type="button" 
                          className="preview-btn btn-remove"
                          onClick={handleRemoveImage}
                          title="Remove screenshot"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional Quick Fields (Collapsible Accordion) */}
          <div className="optional-fields-wrap">
            <button 
              type="button" 
              className="optional-toggle-btn"
              onClick={() => setIsOptionalOpen(!isOptionalOpen)}
              aria-expanded={isOptionalOpen}
            >
              <div className="optional-toggle-left">
                <Building size={16} />
                <span>Optional Details (Company Name & Application Link)</span>
                <span className="optional-toggle-hint">
                  {isOptionalOpen ? '— Click to collapse' : '— Click to expand'}
                </span>
              </div>
              {isOptionalOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isOptionalOpen && (
              <div className="optional-fields-body">
                <div className="quick-field-group">
                  <label className="quick-field-label" htmlFor="company-name-input">
                    <Building size={14} color="#38bdf8" />
                    Company Name (Optional)
                  </label>
                  <div className="quick-field-input-wrap">
                    <Building size={16} className="quick-field-icon" />
                    <input 
                      id="company-name-input"
                      type="text" 
                      className="quick-field-input"
                      placeholder="e.g. Acme Tech Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="quick-field-group">
                  <label className="quick-field-label" htmlFor="app-url-input">
                    <Link2 size={14} color="#38bdf8" />
                    Application URL / Link (Optional)
                  </label>
                  <div className="quick-field-input-wrap">
                    <Link2 size={16} className="quick-field-icon" />
                    <input 
                      id="app-url-input"
                      type="text" 
                      className="quick-field-input"
                      placeholder="e.g. https://careers.example.com or Telegram link"
                      value={applicationUrl}
                      onChange={(e) => setApplicationUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Alert if empty submission */}
          {validationError && (
            <div className="validation-alert-banner">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submission Bar */}
          <div className="scanner-submit-bar">
            <div className="submission-note">
              <Info size={14} />
              <span>Submit Text, Image, or Both. No registration required.</span>
            </div>

            <div className="submit-btn-group">
              {(inputText || selectedImage || companyName || applicationUrl) && (
                <button 
                  type="button" 
                  className="reset-clear-btn"
                  onClick={handleReset}
                  title="Clear all fields"
                >
                  <RotateCcw size={15} />
                  <span>Reset</span>
                </button>
              )}

              <button 
                id="execute-scan-btn"
                type="button" 
                className="cyber-scan-btn"
                onClick={handleSubmitScan}
                disabled={isLoading}
              >
                <ShieldCheck size={18} />
                <span>Scan for Fraud & Red Flags</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CYBERSECURITY LOADING ANIMATION
          ========================================================= */}
      {isLoading && (
        <div className="cyber-loading-panel">
          <div className="cyber-radar-rig">
            <div className="radar-ring ring-outer" />
            <div className="radar-ring ring-mid" />
            <div className="radar-ring ring-inner" />
            <div className="radar-beam" />
            <div className="radar-core">
              <ShieldAlert size={14} />
            </div>
          </div>

          <h3 className="loading-status-text">
            <span>Threat Intelligence Analysis in Progress</span>
          </h3>

          <p className="loading-substatus">
            {loadingSteps[loadingStepIndex]}
          </p>

          <div className="cyber-steps-track">
            {loadingSteps.map((step, idx) => {
              const isPast = idx < loadingStepIndex;
              const isCurrent = idx === loadingStepIndex;
              return (
                <div 
                  key={idx}
                  className={`cyber-step-pill ${isPast ? 'completed' : isCurrent ? 'active' : ''}`}
                >
                  {isPast ? (
                    <Check size={12} />
                  ) : (
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{idx + 1}</span>
                  )}
                  <span>{step.split('...')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          SCAN RESULT DISPLAY SECTION
          ========================================================= */}
      {scanResult && !isLoading && (
        <div ref={resultRef} className="result-container">
          {/* Offline Mock Mode Banner */}
          {isMockResult && (
            <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} />
                <span><strong>OFFLINE FALLBACK SIMULATOR:</strong> Backend API offline or unreachable. Analyzed via client heuristic threat engine.</span>
              </div>
              <span className="demo-badge">Offline Fallback</span>
            </div>
          )}

          {/* Backend Rule-Based Fallback Mode Banner */}
          {!isMockResult && scanResult.is_fallback && (
            <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '8px', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} />
                <span><strong>RULE-BASED FALLBACK ENGINE:</strong> Evaluated using deterministic threat intelligence heuristics (AI provider unconfigured or offline).</span>
              </div>
              <span className="demo-badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>Rule Fallback</span>
            </div>
          )}

          {/* Result Hero Card with Visual Dial & Progress Bar */}
          <div className={`result-hero-card level-${(scanResult.riskLevel || scanResult.risk_level || 'medium').toLowerCase()}`}>
            <div className="result-meter-header">
              <div className="score-badge-group">
                {/* Circular Score Dial */}
                <div className={`score-dial dial-${(scanResult.riskLevel || scanResult.risk_level || 'medium').toLowerCase()}`}>
                  <span className="dial-number">{scanResult.riskScore ?? scanResult.risk_score}</span>
                  <span className="dial-label">/ 100</span>
                </div>

                <div className="score-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h2>Risk Level: {scanResult.riskLevel || scanResult.risk_level}</h2>
                    <RiskBadge level={scanResult.riskLevel || scanResult.risk_level} size="md" />
                  </div>
                  <p>{scanResult.summary || scanResult.explanations}</p>
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
                <span>30 (Low Risk)</span>
                <span>60 (Medium Risk)</span>
                <span>85 (Critical Threat)</span>
                <span>100</span>
              </div>
              <div className="risk-bar-track">
                <div 
                  className={`risk-bar-fill bar-${(scanResult.riskLevel || scanResult.risk_level || 'medium').toLowerCase()}`}
                  style={{ width: `${Math.max(5, scanResult.riskScore ?? scanResult.risk_score ?? 10)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Warning Signs & Trust Indicators Grid */}
          <div className="result-sections-grid">
            {/* Warning Signs */}
            <Card 
              title={`Warning Signs & Vulnerabilities (${(scanResult.warningSigns || scanResult.warning_signs || []).length})`}
              subtitle="Specific threat vectors identified in this submission"
              icon={<ShieldAlert size={20} color="#f87171" />}
            >
              {(scanResult.warningSigns || scanResult.warning_signs) && (scanResult.warningSigns || scanResult.warning_signs).length > 0 ? (
                <div>
                  {(scanResult.warningSigns || scanResult.warning_signs).map((w, idx) => (
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

            {/* Positive Trust Indicators */}
            <Card 
              title={`Positive Trust Indicators (${(scanResult.trustIndicators || scanResult.positive_indicators || []).length})`}
              subtitle="Signals aligning with verified recruitment standards"
              icon={<ShieldCheck size={20} color="#34d399" />}
            >
              {(scanResult.trustIndicators || scanResult.positive_indicators) && (scanResult.trustIndicators || scanResult.positive_indicators).length > 0 ? (
                <div>
                  {(scanResult.trustIndicators || scanResult.positive_indicators).map((t, idx) => (
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
            {/* Recommended Verification Checklist */}
            <Card 
              title="Recommended Verification Checklist" 
              subtitle="Step-by-step actions before responding or signing"
              icon={<FileText size={20} color="#38bdf8" />}
            >
              <div>
                {(scanResult.verificationSteps || scanResult.recommended_actions || []).map((step, idx) => (
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
                {(scanResult.recruiterQuestions || scanResult.questions_for_recruiter || []).map((q, idx) => (
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
          {((scanResult.riskLevel || scanResult.risk_level) === 'Critical' || (scanResult.riskLevel || scanResult.risk_level) === 'High') && (
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
                <span>Scan Completed: <strong>{new Date(scanResult.analyzed_at || scanResult.scanDate || Date.now()).toLocaleString()}</strong></span>
              </div>
              <div>
                Engine: <code>{scanResult.provider || scanResult.engine || 'InternShield Threat Intelligence Engine'}</code>
              </div>
            </div>

            {scanResult.limitations && Array.isArray(scanResult.limitations) && scanResult.limitations.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  ETHICAL INTELLIGENCE BOUNDARIES & VERIFICATION LIMITATIONS:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {scanResult.limitations.map((limit, idx) => (
                    <li key={idx}>{limit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
              <strong>LEGAL & VERIFICATION DISCLAIMER:</strong> {scanResult.disclaimer || scanResult.limitations?.[0]} InternShield AI evaluates patterns against known threat indicators; absence of reported data is treated as uncertainty rather than definitive proof of fraud. Verification claims are never asserted without authenticated registry confirmation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
