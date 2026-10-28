import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Analyzes structured internship scan data using AI with rule-based heuristics & verification
 * @param {Object} data 
 * @returns {Promise<Object>} Comprehensive analysis result
 */
export async function analyzeStructuredScan(data) {
  const {
    internshipTitle = '',
    companyName = '',
    recruiterEmail = '',
    companyWebsite = '',
    internshipDescription = '',
    applicationUrl = '',
    offeredStipend = '',
    hasUpfrontFee = 'no',
    upfrontFeeAmount = '',
    additionalDetails = ''
  } = data;

  // Perform domain directory lookup if database is reachable
  let verifiedDirectoryStatus = null;
  if (companyWebsite) {
    try {
      const cleanDomain = companyWebsite.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
      const [rows] = await pool.query('SELECT * FROM company_directory WHERE domain = ?', [cleanDomain]);
      if (rows && rows.length > 0) {
        verifiedDirectoryStatus = rows[0].verification_status;
      }
    } catch (e) {
      // Non-blocking database check
    }
  }

  // Attempt Google Gemini AI scan if API key is configured
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
You are the senior threat analyst for InternShield AI, an intelligent cybersecurity platform protecting students from internship recruitment fraud.
Evaluate the following submitted internship details:

- Title: ${internshipTitle}
- Company: ${companyName}
- Recruiter Email: ${recruiterEmail}
- Company Website: ${companyWebsite}
- Application URL: ${applicationUrl}
- Offered Stipend: ${offeredStipend}
- Upfront Fee Requested: ${hasUpfrontFee} (Amount: ${upfrontFeeAmount})
- Description: ${internshipDescription}
- Additional Details: ${additionalDetails}
- Database Status: ${verifiedDirectoryStatus || 'Not indexed'}

Evaluation Rules:
1. Treat missing information as UNCERTAINTY, not automatic proof of fraud.
2. Upfront fee request is an IMMEDIATE critical scam indicator (legitimate internships never charge students for kits, laptops, or processing).
3. If recruiter uses a free public email (@gmail, @yahoo) while claiming to represent a recognized company, flag as suspicious recruiter impersonation.
4. Check for high-pressure urgency ("pay in 2 hours", "slots limited"), Telegram/WhatsApp-only communication, or lack of interview.

Respond ONLY with valid JSON in this exact structure without markdown:
{
  "riskScore": <integer 0 to 100>,
  "riskLevel": "<Low | Medium | High | Critical>",
  "summary": "<2-sentence clear objective summary>",
  "warningSigns": [
    { "title": "<warning title>", "explanation": "<why this represents a risk>" }
  ],
  "trustIndicators": [
    "<positive trust signal>"
  ],
  "verificationSteps": [
    "<practical action step to independently verify this offer>"
  ],
  "recruiterQuestions": [
    "<pointed professional question the student can ask the recruiter>"
  ]
}
`;
      const result = await model.generateContent(prompt);
      const cleaned = result.response.text().trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        ...parsed,
        scanDate: new Date().toISOString(),
        disclaimer: 'InternShield AI scan assessment is an algorithmic threat analysis based on provided inputs and known fraud patterns. It does not constitute legal certification. Always independently verify offers before signing or transferring funds.',
        engine: 'Gemini-1.5-Flash + Threat Heuristics'
      };
    } catch (err) {
      console.warn('Gemini structured scan failed, engaging rule-based threat engine:', err.message);
    }
  }

  // Rule-based heuristic analyzer (fallback & baseline)
  return heuristicStructuredScan(data, verifiedDirectoryStatus);
}

/**
 * Robust rule-based analyzer when AI API is unavailable
 */
export function heuristicStructuredScan(data, directoryStatus = null) {
  const {
    internshipTitle = '',
    companyName = '',
    recruiterEmail = '',
    companyWebsite = '',
    internshipDescription = '',
    applicationUrl = '',
    offeredStipend = '',
    hasUpfrontFee = 'no',
    upfrontFeeAmount = '',
    additionalDetails = ''
  } = data;

  let riskScore = 10; // Baseline safe score
  const warningSigns = [];
  const trustIndicators = [];
  const verificationSteps = [];
  const recruiterQuestions = [];

  const combinedText = `${internshipTitle} ${companyName} ${internshipDescription} ${additionalDetails}`.toLowerCase();
  const cleanEmail = (recruiterEmail || '').toLowerCase().trim();
  const cleanWebsite = (companyWebsite || '').toLowerCase().trim();

  // 1. Upfront Fee Evaluation (Crucial Check)
  if (hasUpfrontFee === 'yes' || hasUpfrontFee === true) {
    riskScore += 65;
    warningSigns.push({
      title: 'Upfront Payment Demanded',
      explanation: `Recruiter requested an upfront fee (${upfrontFeeAmount ? `₹${upfrontFeeAmount}` : 'fee requested'}) for training, laptop security, or application processing. Authentic internships NEVER charge candidates.`
    });
  } else {
    trustIndicators.push('No upfront monetary charges or security deposits reported.');
  }

  // 2. Email Domain Evaluation
  const freeEmailProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'protonmail.com', 'icloud.com'];
  const emailDomain = cleanEmail.split('@')[1];

  if (emailDomain) {
    if (freeEmailProviders.includes(emailDomain)) {
      riskScore += 25;
      warningSigns.push({
        title: 'Free Public Email Provider Used',
        explanation: `Recruiter is contacting via @${emailDomain} instead of an authenticated company domain. Legitimate hiring managers almost exclusively communicate via corporate email addresses.`
      });
    } else {
      trustIndicators.push(`Recruiter communicates using custom domain (@${emailDomain}).`);
      
      // Check if email domain matches website domain
      if (cleanWebsite) {
        const webDomain = cleanWebsite.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        if (webDomain && (emailDomain.includes(webDomain) || webDomain.includes(emailDomain))) {
          riskScore -= 10;
          trustIndicators.push(`Recruiter email domain matches the provided company website (${webDomain}).`);
        } else {
          riskScore += 15;
          warningSigns.push({
            title: 'Domain Mismatch',
            explanation: `Recruiter email domain (@${emailDomain}) does not match the company website (${webDomain}). Verify recruiter identity on LinkedIn.`
          });
        }
      }
    }
  } else {
    warningSigns.push({
      title: 'Recruiter Email Omitted',
      explanation: 'No recruiter email address was provided. Note: Missing information represents uncertainty rather than automatic proof of fraud.'
    });
  }

  // 3. Website & Application URL Evaluation
  if (cleanWebsite) {
    if (cleanWebsite.includes('wixsite.com') || cleanWebsite.includes('weebly.com') || cleanWebsite.includes('blogspot.com')) {
      riskScore += 15;
      warningSigns.push({
        title: 'Free Subdomain Hosting',
        explanation: 'Company website is hosted on a free subdomain platform, which is frequently used for disposable phishing sites.'
      });
    } else {
      trustIndicators.push('Provided independent company website URL for research.');
    }
  } else {
    warningSigns.push({
      title: 'Company Website Not Specified',
      explanation: 'Without an official website, independent corporate verification must rely on social platforms or MCA registry.'
    });
  }

  // 4. Communication Channel & Keyword Heuristics
  if (combinedText.includes('telegram')) {
    riskScore += 30;
    warningSigns.push({
      title: 'Telegram Channel Requirement',
      explanation: 'Directing recruitment or task completion through anonymous Telegram channels is the leading pattern in prepaid task fraud.'
    });
  }

  if (combinedText.includes('no interview') || combinedText.includes('direct selection') || combinedText.includes('immediate selection')) {
    riskScore += 20;
    warningSigns.push({
      title: 'No Screening or Interview Required',
      explanation: 'Unsolicited offers without technical assessment, resume review, or face-to-face interview are standard bait for mass recruitment fraud.'
    });
  }

  if (combinedText.includes('aadhaar otp') || combinedText.includes('bank otp') || combinedText.includes('blank cheque')) {
    riskScore += 45;
    warningSigns.push({
      title: 'High-Risk Identity / Banking Phishing',
      explanation: 'Requests for live OTPs or blank cheques constitute critical identity theft and banking compromise vectors.'
    });
  }

  // Check known directory status
  if (directoryStatus === 'verified_authentic') {
    riskScore = Math.max(5, riskScore - 30);
    trustIndicators.push('Company domain is indexed as an authenticated enterprise in InternShield Directory.');
  } else if (directoryStatus === 'confirmed_fraud') {
    riskScore = 98;
    warningSigns.unshift({
      title: 'Blacklisted in Global Fraud Directory',
      explanation: 'This company or domain is already flagged for fraudulent recruitment activity in our verified community database.'
    });
  }

  // Trust indicators for technical description
  if (internshipDescription && internshipDescription.length > 150) {
    trustIndicators.push('Detailed role responsibilities and requirements provided.');
  }

  // Bound score between 0 and 100
  riskScore = Math.max(5, Math.min(99, riskScore));

  // Determine Risk Level: Low, Medium, High, or Critical
  let riskLevel = 'Low';
  if (riskScore >= 85) riskLevel = 'Critical';
  else if (riskScore >= 60) riskLevel = 'High';
  else if (riskScore >= 35) riskLevel = 'Medium';
  else riskLevel = 'Low';

  // Generate Verification Steps
  verificationSteps.push(
    `Verify "${companyName || 'the company'}" on the Ministry of Corporate Affairs (mca.gov.in) to verify active CIN and registered office address.`,
    `Search for the recruiter on LinkedIn to verify their tenure, mutual connections, and employment history with ${companyName || 'the company'}.`,
    `Cross-check the job requisition on ${cleanWebsite ? cleanWebsite : "the company's official careers portal"} rather than third-party messaging groups.`
  );
  if (hasUpfrontFee === 'yes') {
    verificationSteps.unshift('CEASE ALL PAYMENTS: Do not transfer money via UPI, net banking, or gift cards under any circumstances.');
  }

  // Generate Recruiter Questions
  recruiterQuestions.push(
    `"Can you share the official Corporate Identification Number (CIN) and registered office address for ${companyName || 'your organization'}?"`,
    `"Will all subsequent onboarding contracts and NDAs be dispatched from an authenticated corporate email domain?"`,
    `"What is the formal interview and evaluation structure for the ${internshipTitle || 'internship'} position prior to final confirmation?"`
  );
  if (hasUpfrontFee === 'yes') {
    recruiterQuestions.unshift('"Can you provide written documentation explaining why a refundable fee is requested, signed by the company Legal/Finance department on corporate letterhead?"');
  }

  const summary = riskLevel === 'Critical' || riskLevel === 'High'
    ? `Elevated threat detected with a risk score of ${riskScore}/100. Key vulnerabilities include ${warningSigns[0]?.title || 'suspicious recruitment practices'}. Exercise extreme caution.`
    : riskLevel === 'Medium'
    ? `Moderate caution advised (${riskScore}/100). The offer exhibits several unverified factors or missing corporate details that warrant proactive verification.`
    : `Low risk profile (${riskScore}/100). The internship offer aligns with customary recruitment standards without fee demands or severe red flags.`;

  return {
    riskScore,
    riskLevel,
    summary,
    warningSigns,
    trustIndicators,
    verificationSteps,
    recruiterQuestions,
    scanDate: new Date().toISOString(),
    disclaimer: 'InternShield AI scan assessment is an algorithmic threat analysis based on provided inputs and known fraud patterns. It does not constitute legal certification. Always independently verify offers before signing or transferring funds.',
    engine: 'InternShield Threat Intelligence Engine v2.4 (Heuristic & Directory Analysis)'
  };
}

// Backward-compatible text analyzer
export async function analyzeInternshipScam(text) {
  return heuristicStructuredScan({
    internshipDescription: text,
    hasUpfrontFee: text.toLowerCase().includes('fee') || text.toLowerCase().includes('deposit') ? 'yes' : 'no'
  });
}
