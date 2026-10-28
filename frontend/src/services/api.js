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
 * Analyzes internship job description or offer letter text
 * @param {string} text 
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
 * @param {string} domain 
 */
export async function verifyDomain(domain) {
  const res = await fetch(`${API_BASE}/verify/domain?domain=${encodeURIComponent(domain)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to verify domain');
  return data;
}

/**
 * Submits a new community scam report
 * @param {Object} reportData 
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
