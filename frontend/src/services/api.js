const API_BASE = 'http://localhost:5000/api';

/**
 * Checks backend API health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

/**
 * Submits structured internship scan form to POST /api/scans/analyze
 * @param {Object} formData 
 */
export async function analyzeStructuredScanApi(formData) {
  try {
    const res = await fetch(`${API_BASE}/scans/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Threat scan failed.');
      error.errors = data.errors;
      throw error;
    }
    return {
      success: true,
      data: data.data,
      isMockMode: false
    };
  } catch (err) {
    if (err.errors) {
      // Form validation error from backend
      throw err;
    }
    // Network failure / backend offline fallback
    console.warn('Backend unavailable, engaging dynamic fallback evaluator:', err.message);
    const mockResult = evaluateClientSideMockScan(formData);
    return {
      success: true,
      data: mockResult,
      isMockMode: true
    };
  }
}

/**
 * Client-side dynamic threat evaluator for temporary mock mode when backend is offline
 */
function evaluateClientSideMockScan(formData) {
  const {
    internshipTitle = '',
    companyName = '',
    recruiterEmail = '',
    companyWebsite = '',
    internshipDescription = '',
    offeredStipend = '',
    hasUpfrontFee = 'no',
    upfrontFeeAmount = ''
  } = formData;

  let riskScore = 15;
  const warningSigns = [];
  const trustIndicators = [];
  const verificationSteps = [];
  const recruiterQuestions = [];

  const text = `${internshipTitle} ${companyName} ${internshipDescription}`.toLowerCase();
  const cleanEmail = (recruiterEmail || '').toLowerCase().trim();
  const cleanWeb = (companyWebsite || '').toLowerCase().trim();

  // Upfront fee check
  if (hasUpfrontFee === 'yes') {
    riskScore += 60;
    warningSigns.push({
      title: 'Upfront Payment Demanded',
      explanation: `Recruiter requested an upfront fee (${upfrontFeeAmount ? `₹${upfrontFeeAmount}` : 'fee requested'}) for training, laptop security, or application processing. Authentic internships never charge candidates.`
    });
  } else {
    trustIndicators.push('No upfront fees or security deposits requested.');
  }

  // Email check
  const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const domain = cleanEmail.split('@')[1];
  if (domain) {
    if (freeProviders.includes(domain)) {
      riskScore += 25;
      warningSigns.push({
        title: 'Free Public Email Provider Used',
        explanation: `Recruiter is contacting via @${domain} instead of an authenticated company domain.`
      });
    } else {
      trustIndicators.push(`Recruiter communicates using custom enterprise domain (@${domain}).`);
    }
  } else {
    warningSigns.push({
      title: 'Recruiter Email Omitted',
      explanation: 'No recruiter email was provided. Note: Missing information is treated as uncertainty rather than proof of fraud.'
    });
  }

  // Website check
  if (!cleanWeb) {
    warningSigns.push({
      title: 'Company Website Not Provided',
      explanation: 'Without a website, independent corporate verification must rely on social platforms or MCA registry.'
    });
  } else {
    trustIndicators.push('Provided independent company website URL for research.');
  }

  // Keywords
  if (text.includes('telegram')) {
    riskScore += 30;
    warningSigns.push({
      title: 'Telegram Channel Requirement',
      explanation: 'Directing communication through Telegram channels is strongly correlated with task-based advance payment fraud.'
    });
  }

  if (text.includes('no interview') || text.includes('immediate selection')) {
    riskScore += 20;
    warningSigns.push({
      title: 'No Screening or Interview Required',
      explanation: 'Promises of selection without technical evaluation are standard bait for mass recruitment fraud.'
    });
  }

  riskScore = Math.max(5, Math.min(99, riskScore));

  let riskLevel = 'Low';
  if (riskScore >= 85) riskLevel = 'Critical';
  else if (riskScore >= 60) riskLevel = 'High';
  else if (riskScore >= 35) riskLevel = 'Medium';
  else riskLevel = 'Low';

  verificationSteps.push(
    `Verify "${companyName}" on the Ministry of Corporate Affairs (mca.gov.in) to verify active CIN and registered office address.`,
    `Search for the recruiter on LinkedIn to verify their tenure and employment with ${companyName}.`,
    `Cross-check the job requisition on ${cleanWeb ? cleanWeb : 'the company careers portal'}.`
  );

  recruiterQuestions.push(
    `"Can you share the official Corporate Identification Number (CIN) and registered office address for ${companyName}?"`,
    `"Will all subsequent onboarding contracts and NDAs be dispatched from an authenticated corporate email domain?"`,
    `"What is the formal interview structure for the ${internshipTitle} position prior to confirmation?"`
  );

  return {
    riskScore,
    riskLevel,
    summary: riskLevel === 'Critical' || riskLevel === 'High'
      ? `Elevated threat detected with a risk score of ${riskScore}/100. Key vulnerabilities include ${warningSigns[0]?.title || 'suspicious recruitment practices'}. Exercise extreme caution.`
      : riskLevel === 'Medium'
      ? `Moderate caution advised (${riskScore}/100). The offer exhibits several unverified factors or missing corporate details that warrant proactive verification.`
      : `Low risk profile (${riskScore}/100). The internship offer aligns with customary recruitment standards without fee demands or severe red flags.`,
    warningSigns,
    trustIndicators,
    verificationSteps,
    recruiterQuestions,
    scanDate: new Date().toISOString(),
    disclaimer: 'InternShield AI scan assessment is an algorithmic threat analysis based on provided inputs and known fraud patterns. It does not constitute legal certification. Always independently verify offers before signing or transferring funds.',
    engine: 'InternShield Fallback Engine (Temporary Mock Mode - Backend Offline)'
  };
}

/**
 * Legacy text scanner
 */
export async function analyzeScamText(text) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to analyze text');
  return data;
}

/**
 * Verifies if an email or recruiter domain is authentic
 */
export async function verifyDomain(domain) {
  const res = await fetch(`${API_BASE}/verify/domain?domain=${encodeURIComponent(domain)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to verify domain');
  return data;
}

/**
 * Submits a new community scam report
 */
export async function submitScamReport(reportData) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit report');
  return data;
}

/**
 * Fetches recent scam reports
 */
export async function fetchScamReports() {
  const res = await fetch(`${API_BASE}/reports`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reports');
  return data;
}
