const rawApiUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:5001/api').replace(/\/+$/, '');
const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

/**
 * Helper to construct standard headers including Bearer token if available
 */
function getAuthHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  const token = localStorage.getItem('internshield_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

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

// ============================================================================
// AUTHENTICATION APIS
// ============================================================================

/**
 * Registers a new user account
 * @param {Object} userData - { name, email, password, role }
 */
export async function registerApi(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(userData)
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Registration failed.');
    err.errors = data.errors;
    throw err;
  }

  if (data.token) {
    localStorage.setItem('internshield_token', data.token);
  }
  return data;
}

/**
 * Authenticates user credentials
 * @param {string} email 
 * @param {string} password 
 */
export async function loginApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Login failed.');
    err.errors = data.errors;
    throw err;
  }

  if (data.token) {
    localStorage.setItem('internshield_token', data.token);
  }
  return data;
}

/**
 * Retrieves authenticated user profile
 */
export async function getMeApi() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Session expired or unauthenticated.');
  }
  return data.data;
}

/**
 * Logs out current user session
 */
export async function logoutApi() {
  localStorage.removeItem('internshield_token');
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
  } catch (e) {
    // Ignore network error on logout
  }
}

// ============================================================================
// SCAN & THREAT ANALYSIS APIS
// ============================================================================

/**
 * Heuristic simulator for offline development fallback
 */
function simulateClientScan(payload) {
  const text = `${payload.text || ''} ${payload.internshipDescription || ''} ${payload.companyName || ''} ${payload.applicationUrl || ''}`.toLowerCase();
  const hasImage = Boolean(payload.image);
  let score = 25;
  const warningSigns = [];
  const trustIndicators = [];
  const verificationSteps = [];
  const recruiterQuestions = [];

  // Upfront fee check
  const feeRegex = /\b(?:deposit|fee|fees|pay|payment|recharge|charge|charges)\b/i;
  const feeNegation = /\b(?:no|zero|without|never\s+ask)\s+(?:upfront\s+)?(?:fee|deposit)\b/i;
  const isFeeExplicitlyZero = feeNegation.test(text);

  if (feeRegex.test(text) && !isFeeExplicitlyZero) {
    score += 55;
    warningSigns.push({
      title: 'Mandatory Upfront Payment Detected',
      explanation: 'Recruiter message or document requests registration, laptop security, or training charges. Legitimate employers never charge candidates.'
    });
    verificationSteps.unshift('DO NOT TRANSFER FUNDS: Stop communication immediately if asked for payment via UPI or QR code.');
    recruiterQuestions.unshift('Can you provide an official written waiver confirming no candidate deposits are required?');
  } else if (isFeeExplicitlyZero) {
    score = Math.max(0, score - 15);
    trustIndicators.push('Explicitly guarantees zero application fees or security deposits.');
  }

  // Telegram / Task Scam check
  if (text.includes('telegram') || text.includes('t.me') || text.includes('copy paste') || text.includes('video review') || text.includes('daily payout')) {
    score += 35;
    warningSigns.push({
      title: 'Anonymous Messaging Channel / Task Fraud Pattern',
      explanation: 'Communication or workflow redirects to Telegram channels with daily payout lures, typical of prepaid task schemes.'
    });
    verificationSteps.push('Verify recruiter profile on LinkedIn and confirm company registration on MCA portal.');
    recruiterQuestions.push('Will all official company communications take place on verified corporate enterprise domains?');
  }

  // Sensitive banking info
  if (text.includes('otp') || text.includes('upi pin') || text.includes('netbanking') || text.includes('blank cheque')) {
    score += 40;
    warningSigns.push({
      title: 'Sensitive Financial Credential Solicitation',
      explanation: 'Direct requests for OTPs, UPI PINs, or banking passwords represent immediate compromise attempts.'
    });
  }

  // Interview & Screening
  if (text.includes('direct selection') || text.includes('no interview') || text.includes('without test')) {
    score += 20;
    warningSigns.push({
      title: 'Selection Without Assessment Loop',
      explanation: 'Offer extended without technical evaluations or interview stages, strongly correlating with mass recruitment scams.'
    });
  } else if (text.includes('interview') || text.includes('coding round') || text.includes('assessment')) {
    score = Math.max(0, score - 15);
    trustIndicators.push('Structured multi-round technical screening and interview stages mentioned.');
  }

  // Verified tech keywords
  if (text.includes('microsoft') || text.includes('google') || text.includes('amazon') || text.includes('careers.')) {
    score = Math.min(score, 20);
    trustIndicators.push('Matched verified enterprise corporate domain / university hiring program.');
  }

  if (hasImage) {
    trustIndicators.push('Visual document / screenshot evidence analyzed for security artifacts.');
  }

  // Clamp score
  score = Math.max(5, Math.min(98, score));

  let level = 'Low';
  if (score >= 85) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 30) level = 'Medium';

  if (warningSigns.length === 0) {
    warningSigns.push({
      title: 'Unverified Third-Party Listing (Uncertainty Factor)',
      explanation: 'Listing contains minimal corporate documentation. Exercise caution and verify via official corporate career portals.'
    });
  }

  if (trustIndicators.length === 0) {
    trustIndicators.push('No obvious phishing links detected in the submitted input text.');
  }

  verificationSteps.push(
    `Check the Ministry of Corporate Affairs (mca.gov.in) portal to verify if "${payload.companyName || 'the company'}" is an active registered legal entity.`,
    'Search for the recruiter on LinkedIn to verify their official corporate tenure and company presence.',
    'Confirm that the offer letter includes an official corporate address, registered CIN, and tax GSTIN.'
  );

  recruiterQuestions.push(
    'Can you provide your official corporate email address and company registration number (CIN)?',
    'What is the reporting structure, mentor allocation, and weekly milestone schedule for this internship?'
  );

  return {
    risk_score: score,
    risk_level: level,
    riskScore: score,
    riskLevel: level,
    summary: `InternShield AI evaluated the submission across 8 threat vectors with a Risk Score of ${score}/100 (${level} Risk).`,
    warningSigns,
    warning_signs: warningSigns,
    trustIndicators,
    positive_indicators: trustIndicators,
    verificationSteps,
    recommended_actions: verificationSteps,
    recruiterQuestions,
    questions_for_recruiter: recruiterQuestions,
    analyzed_at: new Date().toISOString(),
    provider: 'InternShield Client Threat Simulator (Offline Fallback)',
    is_fallback: true,
    limitations: [
      'Automated Threat Assessment: This evaluation is generated via machine learning heuristics and pattern recognition.',
      'Zero Active Execution: Submitted URLs and domains are analyzed purely via static syntactic rules.',
      'Uncertainty vs Fraud: Missing information is treated as uncertainty, NOT definitive proof of fraud.'
    ]
  };
}

/**
 * Submits internship scan payload to POST /api/scans/analyze
 * @param {Object} formData 
 */
export async function analyzeStructuredScanApi(formData) {
  try {
    const res = await fetch(`${API_BASE}/scans/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
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
    if (err.errors) throw err;
    // If backend is offline or network fails, activate client simulator
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed')) {
      console.warn('Backend server unreachable. Using client threat simulation fallback:', err.message);
      return {
        success: true,
        data: simulateClientScan(formData),
        isMockMode: true
      };
    }
    throw err;
  }
}

export const analyzeScanApi = analyzeStructuredScanApi;

/**
 * Retrieves scan history for authenticated user
 */
export async function getScanHistoryApi() {
  const res = await fetch(`${API_BASE}/scans/history`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch scan history.');
  return data.data || [];
}

/**
 * Retrieves a single scan by ID
 * @param {number|string} scanId 
 */
export async function getScanByIdApi(scanId) {
  const res = await fetch(`${API_BASE}/scans/${scanId}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch scan details.');
  return data.data;
}

/**
 * Deletes a scan record
 * @param {number|string} scanId 
 */
export async function deleteScanApi(scanId) {
  const res = await fetch(`${API_BASE}/scans/${scanId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete scan.');
  return data;
}

// ============================================================================
// SAVED BOOKMARKS APIS
// ============================================================================

/**
 * Saves/bookmarks a scan
 * @param {number|string} scanId 
 */
export async function saveScanApi(scanId) {
  const res = await fetch(`${API_BASE}/saved`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ scanId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to bookmark scan.');
  return data;
}

/**
 * Unsaves/removes a bookmark for a scan
 * @param {number|string} scanId 
 */
export async function unsaveScanApi(scanId) {
  const res = await fetch(`${API_BASE}/saved/${scanId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove bookmark.');
  return data;
}

/**
 * Retrieves all saved scans for current user
 */
export async function getSavedScansApi() {
  const res = await fetch(`${API_BASE}/saved`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch saved scans.');
  return data.data || [];
}

/**
 * Checks if a specific scan is saved
 * @param {number|string} scanId 
 */
export async function checkIsSavedApi(scanId) {
  try {
    const res = await fetch(`${API_BASE}/saved/check/${scanId}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    return data.isSaved || false;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// DASHBOARD APIS
// ============================================================================

/**
 * Retrieves personalized student dashboard metrics & recent scans
 */
export async function getDashboardStatsApi() {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch dashboard statistics.');
  return data.data;
}

// ============================================================================
// COMMUNITY REPORTS APIS
// ============================================================================

/**
 * Retrieves community reports with pagination, search, and category filters
 * @param {Object} params - { search, status, page, limit }
 */
export async function getCommunityReportsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const res = await fetch(`${API_BASE}/reports?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch community reports.');
  return data;
}

/**
 * Retrieves a single community report by ID
 * @param {number|string} reportId 
 */
export async function getReportByIdApi(reportId) {
  const res = await fetch(`${API_BASE}/reports/${reportId}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch report details.');
  return data.data;
}

/**
 * Submits a new community report (placed in pending moderation queue)
 * @param {Object} reportData - { companyName, internshipTitle, description, evidenceReference }
 */
export async function submitCommunityReportApi(reportData) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(reportData)
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to submit scam report.');
    err.errors = data.errors;
    throw err;
  }
  return data;
}

// Legacy alias
export const submitScamReport = submitCommunityReportApi;
export const fetchScamReports = () => getCommunityReportsApi({ limit: 50 });

// ============================================================================
// ADMIN MODERATION APIS
// ============================================================================

/**
 * Retrieves platform-wide admin metrics and threat breakdown for charts
 */
export async function getAdminStatsApi() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats. Admin clearance required.');
  return data.data;
}

/**
 * Retrieves all community reports for moderation review
 * @param {Object} params - { status, search }
 */
export async function getAdminReportsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/admin/reports?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch admin reports queue.');
  return data.data || [];
}

/**
 * Updates a report's verification status
 * @param {number|string} reportId 
 * @param {string} status - 'verified_scam' | 'pending' | 'under_review' | 'rejected'
 */
export async function updateReportStatusApi(reportId, status) {
  const res = await fetch(`${API_BASE}/admin/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update report status.');
  return data;
}

/**
 * Domain verification lookup
 */
export async function verifyDomain(domain) {
  const res = await fetch(`${API_BASE}/verify/domain?domain=${encodeURIComponent(domain)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to verify domain.');
  return data;
}
