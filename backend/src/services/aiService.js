import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Standard Ethical Intelligence Limitations & Disclaimers
 * Strictly enforces that zero active execution occurs on submitted links
 * and that uncertainty is never presented as definitive proof of fraud.
 */
export const STANDARD_LIMITATIONS = [
  'Automated Threat Assessment: This evaluation is generated via machine learning heuristics and pattern recognition; it does not constitute a certified legal verdict.',
  'Zero Active Execution: Submitted URLs and domains are analyzed purely via static syntactic rules. InternShield AI does NOT ping, fetch, execute, or crawl external links.',
  'Uncertainty vs Fraud: Missing information (e.g. absent recruiter email or under-construction website) is treated as uncertainty, NOT definitive proof of fraud.',
  'Verification Boundary: Authenticity is only declared when an entity is cross-referenced with officially integrated corporate registries (such as the Ministry of Corporate Affairs).'
];

/**
 * Consistent Scoring Methodology Documentation
 * Defines numeric ranges, categorical risk levels, and vector weights.
 */
export const SCORING_METHODOLOGY = {
  scale: '0 - 100 Risk Score',
  levels: {
    Low: { range: '0 - 29', description: 'Authentic hiring pattern, verified corporate domain, structured interview loops, zero fees required.' },
    Medium: { range: '30 - 59', description: 'Moderate risk or notable uncertainties (e.g. missing corporate website, unverified free email domain), but no direct payment demands.' },
    High: { range: '60 - 84', description: 'Multiple high-risk threat indicators (e.g. anonymous Telegram channel, direct selection without interview, unrealistic payout for trivial tasks).' },
    Critical: { range: '85 - 100', description: 'Immediate fraud vectors detected (e.g. mandatory upfront fee/deposit demanded, phishing for OTPs/banking credentials).' }
  },
  vectors: [
    { id: 'upfront_fee', name: 'Upfront Payments', weight: '+55 to +65 pts', rationale: 'Authentic employers never charge candidates for job offers, training materials, or equipment.' },
    { id: 'unrealistic_stipend', name: 'Unrealistic Stipends', weight: '+20 to +30 pts', rationale: 'Disproportionately high compensation for minimal/unskilled tasks is standard lure for prepaid task fraud.' },
    { id: 'suspicious_domain', name: 'Suspicious Email Domains', weight: '+15 to +35 pts (or -15 pts for matched enterprise domain)', rationale: 'Recruiters using free webmail or spoofed domains indicate unverified identity.' },
    { id: 'urgency_pressure', name: 'Pressure to Act Urgently', weight: '+15 pts', rationale: 'Artificial deadlines ("expires in 2 hours") induce panic and prevent candidate due diligence.' },
    { id: 'missing_details', name: 'Missing Company Details', weight: '+5 to +10 pts (Uncertainty)', rationale: 'Absence of verifiable website or corporate registration increases uncertainty without asserting fraud.' },
    { id: 'suspicious_links', name: 'Suspicious Application Links', weight: '+15 to +30 pts', rationale: 'Syntactic detection of Telegram redirection, WhatsApp channels, or URL shorteners masking destinations.' },
    { id: 'sensitive_info', name: 'Requests for Sensitive Information', weight: '+40 to +50 pts', rationale: 'Demands for bank OTPs, UPI PINs, netbanking passwords, or blank cheques represent direct compromise vectors.' },
    { id: 'vague_description', name: 'Vague Description & Screening Absence', weight: '+15 to +20 pts (or -15 pts for structured interviews)', rationale: 'Offers issued without technical evaluations or interviews strongly correlate with mass recruitment scams.' }
  ]
};

/**
 * Dynamically resolves the Google Generative AI client using server-side environment variables.
 * Never exposes the API key to frontend clients or logs.
 * 
 * @returns {{ client: GoogleGenerativeAI, modelName: string } | null}
 */
export function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim().length < 10) {
    return null;
  }
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return {
    client: new GoogleGenerativeAI(apiKey.trim()),
    modelName
  };
}

/**
 * Core AI Analysis Service for Internship Fraud Detection
 * Evaluates submitted internship details across all 8 threat dimensions.
 * Includes timeout handling, API error handling, validation, and a deterministic rule-based fallback.
 * 
 * @param {Object} data - Submitted internship details
 * @returns {Promise<Object>} Validated analysis object
 */
export async function analyzeInternshipOffer(data) {
  // 1. Sanitize and bound all input fields
  const sanitizedInput = sanitizeScanInput(data);
  const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || '8000', 10);

  // 2. Attempt AI provider call if configured
  const aiConfig = getAiClient();
  if (aiConfig) {
    try {
      const aiResult = await executeAiWithTimeout(sanitizedInput, aiConfig, timeoutMs);
      const validated = validateAiResponse(aiResult, sanitizedInput, aiConfig.modelName);
      if (validated) {
        return validated;
      }
    } catch (err) {
      console.warn(`⚠️  [AI Service] Provider request failed (${err.message}). Activating Rule-Based Fallback Engine.`);
    }
  }

  // 3. Deterministic rule-based fallback when AI is unconfigured, timed out, or unavailable
  return executeRuleBasedFallback(sanitizedInput);
}

/**
 * Executes the AI Provider with strict timeout handling and JSON extraction.
 * 
 * @param {Object} input - Sanitized input
 * @param {Object} aiConfig - { client, modelName }
 * @param {number} timeoutMs - Max execution timeout in ms
 * @returns {Promise<Object>} Parsed JSON output
 */
async function executeAiWithTimeout(input, aiConfig, timeoutMs) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`AI Provider request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const aiPromise = (async () => {
    const model = aiConfig.client.getGenerativeModel({
      model: aiConfig.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const prompt = buildEvaluationPrompt(input);
    const contentParts = [prompt];

    if (input.image && typeof input.image === 'string') {
      const match = input.image.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
      if (match) {
        contentParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const result = await model.generateContent(contentParts.length === 1 ? prompt : contentParts);
    const rawText = result?.response?.text();
    return extractJsonFromText(rawText);
  })();

  try {
    return await Promise.race([aiPromise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Builds the comprehensive prompt for AI evaluation across all 8 threat vectors.
 * Enforces explicit instructions regarding explainability, uncertainty vs facts,
 * and zero active execution.
 */
function buildEvaluationPrompt(input) {
  return `
You are the Chief Information Security Officer & Senior Fraud Investigator for "InternShield AI".
Analyze the submitted internship offer across the 8 core threat vectors:

1. Requests for Upfront Payments: Mandatory fees for registration, training kits, laptop insurance, security deposits, or background checks. (Authentic employers NEVER charge candidates).
2. Unrealistic Stipend Claims: Disproportionately high compensation promised for minimal, low-skill, or trivial tasks (e.g. ₹1,500–₹5,000/day for video reviews, copy-pasting, or 1 hour/day).
3. Suspicious Email Domains: Recruiters using free public email services (@gmail, @yahoo, @hotmail) or newly registered/spoofed domains instead of authentic corporate domains. Email domain mismatch with company website.
4. Pressure to Act Urgently: High-pressure manipulation, tight artificial deadlines (e.g. "offer expires in 2 hours", "immediate joining today only"), preventing due diligence.
5. Missing Company Details: Lack of verifiable corporate website, physical address, or verifiable corporate presence.
   CRITICAL PRINCIPLE: Missing company details must be treated as UNCERTAINTY, NOT definitive proof of fraud. Never present uncertain findings as established facts.
6. Suspicious Application Links: Redirection to anonymous Telegram channels (t.me), WhatsApp groups, URL shorteners (bit.ly, tinyurl), or unverified domains.
   NOTE: Static syntactic analysis only. Do NOT ping or execute URLs.
7. Requests for Sensitive Information: Demands for bank OTPs, UPI PINs, netbanking passwords, Aadhaar OTPs, or blank cheques.
8. Vague or Inconsistent Job Descriptions: Extremely vague duties, lack of technical tooling, or offers issued immediately with NO interview, test, or screening loop.

SUBMITTED DATA FOR ANALYSIS:
- Internship Title: ${input.internshipTitle}
- Company Name: ${input.companyName}
- Recruiter Email: ${input.recruiterEmail || 'Not provided'}
- Company Website: ${input.companyWebsite || 'Not provided'}
- Application URL: ${input.applicationUrl || 'Not provided'}
- Offered Stipend: ${input.offeredStipend || 'Not provided'}
- Upfront Fee Demanded: ${input.hasUpfrontFee} (Amount: ${input.upfrontFeeAmount || 'None specified'})
- Internship Description: ${input.internshipDescription}
- Additional Recruiter Notes: ${input.additionalDetails || 'None'}

SCORING METHODOLOGY (0 - 100 Scale):
- 0 to 29 (Low Risk): Authentic hiring patterns, corporate domain, structured interviews, zero fees, verifiable presence.
- 30 to 59 (Medium Risk): Minor red flags or notable uncertainties (e.g. missing corporate website, unverified free email domain).
- 60 to 84 (High Risk): Multiple strong threat signals (e.g. anonymous Telegram task group, direct selection without interview, unrealistic pay for trivial tasks).
- 85 to 100 (Critical Risk): Immediate fraud vector present (e.g. upfront fee/deposit demanded, request for bank OTP/credentials, known fraudulent syndicate scheme).

OUTPUT FORMAT:
Respond ONLY with a valid, raw JSON object matching this structure:
{
  "risk_score": <integer between 0 and 100>,
  "risk_level": "<Low | Medium | High | Critical>",
  "warning_signs": [
    { "title": "<Concise warning title>", "explanation": "<Objective explanation of why this represents a threat or uncertainty>" }
  ],
  "positive_indicators": [
    "<Observable trust signal, e.g. corporate domain, structured interview loop>"
  ],
  "explanations": "<Detailed, explainable justification of the score and evaluated dimensions, explicitly distinguishing between confirmed threat signals and uncertainty factors>",
  "recommended_actions": [
    "<Step-by-step verification action for the candidate, e.g. MCA CIN verification, LinkedIn lookup, refusal of upfront payment>"
  ],
  "questions_for_recruiter": [
    "<Direct, professional question to test recruiter legitimacy>"
  ]
}
`;
}

/**
 * Extracts and parses JSON safely from model response text.
 * Handles clean JSON, markdown code blocks, and embedded JSON objects.
 */
export function extractJsonFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI Provider returned an empty response.');
  }

  const trimmed = rawText.trim();

  // 1. Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // 2. Strip markdown fences if present (```json ... ``` or ``` ... ```)
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (innerE) {}
    }

    // 3. Fallback: extract substring between first { and last }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch (sliceE) {}
    }

    throw new Error(`Unable to parse valid JSON from AI response: ${trimmed.slice(0, 100)}...`);
  }
}

/**
 * Validates and normalizes AI provider responses against our security schema.
 * Ensures the response structure is strictly compliant before saving to MySQL.
 * 
 * @param {Object} parsed - Parsed AI response object
 * @param {Object} input - Sanitized input
 * @param {string} [modelName] - Name of the AI model
 * @returns {Object|null} Validated analysis object or null if invalid
 */
export function validateAiResponse(parsed, input, modelName = 'Google Gemini') {
  if (!parsed || typeof parsed !== 'object') return null;

  // 1. Validate and clamp risk_score (0 - 100)
  let score = parseInt(parsed.risk_score, 10);
  if (isNaN(score)) {
    score = 50;
  }
  score = Math.max(0, Math.min(100, score));

  // 2. Validate risk_level against allowed ENUM values
  const validLevels = ['Low', 'Medium', 'High', 'Critical'];
  let level = parsed.risk_level;
  if (!validLevels.includes(level)) {
    if (score >= 85) level = 'Critical';
    else if (score >= 60) level = 'High';
    else if (score >= 30) level = 'Medium';
    else level = 'Low';
  }

  // 3. Validate warning_signs (Array of { title, explanation })
  const warningSigns = Array.isArray(parsed.warning_signs)
    ? parsed.warning_signs.map(w => {
        if (typeof w === 'string') return { title: 'Identified Concern', explanation: w };
        return {
          title: String(w?.title || 'Threat Signal').trim(),
          explanation: String(w?.explanation || w?.title || 'Suspicious recruitment pattern detected.').trim()
        };
      }).filter(w => w.title && w.explanation)
    : [];

  // 4. Validate positive_indicators (Array of strings)
  const positiveIndicators = Array.isArray(parsed.positive_indicators)
    ? parsed.positive_indicators.map(p => String(p).trim()).filter(Boolean)
    : [];

  // 5. Validate recommended_actions (Array of strings)
  const recommendedActions = Array.isArray(parsed.recommended_actions)
    ? parsed.recommended_actions.map(a => String(a).trim()).filter(Boolean)
    : [];

  // Ensure emergency payment warning is present if an upfront fee was requested
  if (input.hasUpfrontFee === 'yes' && !recommendedActions.some(a => a.toLowerCase().includes('cease') || a.toLowerCase().includes('not transfer'))) {
    recommendedActions.unshift('IMMEDIATELY CEASE PAYMENT: Legitimate companies never charge candidates for job offers, training, or equipment.');
  }

  // 6. Validate questions_for_recruiter (Array of strings)
  const questionsForRecruiter = Array.isArray(parsed.questions_for_recruiter)
    ? parsed.questions_for_recruiter.map(q => String(q).trim()).filter(Boolean)
    : [];

  // 7. Validate explanations (String)
  const explanations = String(
    parsed.explanations ||
    `Score: ${score}/100 (${level} Risk). Evaluated across 8 recruitment fraud threat vectors.`
  ).trim();

  // 8. Construct validated response with dual property mappings for frontend compatibility
  return {
    risk_score: score,
    risk_level: level,
    warning_signs: warningSigns,
    positive_indicators: positiveIndicators,
    explanations: explanations,
    recommended_actions: recommendedActions,
    questions_for_recruiter: questionsForRecruiter,
    limitations: STANDARD_LIMITATIONS,
    is_fallback: false,
    provider: `${modelName} (Server-Side AI)`,
    analyzed_at: new Date().toISOString(),

    // CamelCase compatibility bindings for frontend UI
    riskScore: score,
    riskLevel: level,
    warningSigns: warningSigns,
    trustIndicators: positiveIndicators,
    summary: explanations,
    verificationSteps: recommendedActions,
    recruiterQuestions: questionsForRecruiter,
    disclaimer: STANDARD_LIMITATIONS[0]
  };
}

/**
 * Deterministic Rule-Based Fallback Engine
 * Executes when AI provider is offline, unconfigured, or timed out.
 * Implements a transparent, explainable scoring methodology across all 8 vectors.
 * 
 * @param {Object} input - Sanitized submission details
 * @returns {Object} Validated analysis object labeled as fallback
 */
export function executeRuleBasedFallback(input) {
  let score = 5; // Base score for neutral submission
  const warningSigns = [];
  const positiveIndicators = [];
  const recommendedActions = [];
  const questionsForRecruiter = [];
  const scoreBreakdown = [];

  const text = `${input.internshipTitle} ${input.companyName} ${input.internshipDescription} ${input.additionalDetails}`.toLowerCase();
  const cleanEmail = (input.recruiterEmail || '').toLowerCase().trim();
  const cleanWebsite = (input.companyWebsite || '').toLowerCase().trim();
  const cleanUrl = (input.applicationUrl || '').toLowerCase().trim();

  // =========================================================================
  // Vector 1: Upfront Payment Demands (+65 points)
  // Handles explicit 'no fee' declarations gracefully to avoid false positives.
  // =========================================================================
  const feeNegationRegex = /\b(?:no|zero|without|never\s+ask(?:s)?\s+for)\s+(?:any\s+)?(?:upfront\s+|application\s+|registration\s+|training\s+|security\s+)?(?:fee|fees|deposit|deposits|charge|charges)\b/i;
  const isExplicitlyNoFee = feeNegationRegex.test(text);

  const demandFeeRegex = /\b(?:pay|deposit|transfer|send|recharge)\s+(?:rs\.?|inr|₹)?\s*\d+|\b(?:mandatory|required|refundable)\s+(?:security\s+deposit|training\s+fee|kit\s+charge|registration\s+fee)\b/i;
  const hasFeeDemand = demandFeeRegex.test(text);
  const isFeeRequested = input.hasUpfrontFee === 'yes' || (input.hasUpfrontFee !== 'no' && hasFeeDemand && !isExplicitlyNoFee);

  if (isFeeRequested) {
    score += 65;
    scoreBreakdown.push('+65 points: Mandatory fee or security deposit requested.');
    warningSigns.push({
      title: 'Mandatory Upfront Payment Requested',
      explanation: `Recruiter requested an upfront payment (${input.upfrontFeeAmount ? `₹${input.upfrontFeeAmount}` : 'specified fee'}) for training, laptop security, or application processing. Authentic companies NEVER charge candidates.`
    });
  } else {
    if (isExplicitlyNoFee) {
      score = Math.max(0, score - 5);
      scoreBreakdown.push('-5 points: Explicitly guarantees zero application fees or security deposits.');
      positiveIndicators.push('Explicitly guarantees no application fees, training charges, or security deposits.');
    } else {
      positiveIndicators.push('No upfront fees, training charges, or security deposits demanded.');
    }
  }

  if (input.image) {
    positiveIndicators.push('Visual document / screenshot evidence uploaded for verification analysis.');
  }

  // =========================================================================
  // Vector 2: Sensitive Information & Phishing (+45 points)
  // =========================================================================
  const sensitiveKeywords = ['bank otp', 'aadhaar otp', 'blank cheque', 'netbanking password', 'atm pin', 'upi pin', 'credit card cvv'];
  if (sensitiveKeywords.some(k => text.includes(k))) {
    score += 45;
    scoreBreakdown.push('+45 points: High-risk financial credentials or OTPs requested.');
    warningSigns.push({
      title: 'Critical Phishing Vector for Financial Credentials',
      explanation: 'The offer mentions or requests live OTPs, net banking credentials, or blank cheques, which are hallmark signals of banking compromise.'
    });
  }

  // =========================================================================
  // Vector 3: Unrealistic Stipend Claims & Task Fraud (+25 to +35 points)
  // =========================================================================
  const cleanStipendText = `${input.offeredStipend || ''} ${text}`.replace(/[,₹]/g, '').toLowerCase();
  const highDailyPayRegex = /\b(?:1[5-9]\d{2}|[2-9]\d{3})\s*(?:\/|\s*per\s*)day\b|\bdaily\s+payouts?\b/i;
  const taskScamKeywords = ['recharge to activate', 'recharge to unlock', 'recharge', 'withdrawal account', 'telegram channel', 'telegram group', 'copy paste', 'video review', 'video like', 'youtube review', 'simple task', 'no experience'];

  const hasHighDailyPay = highDailyPayRegex.test(cleanStipendText);
  const matchedTaskKeywords = taskScamKeywords.filter(k => text.includes(k));

  if (hasHighDailyPay && matchedTaskKeywords.length > 0) {
    score += 30;
    scoreBreakdown.push('+30 points: Disproportionate daily stipend promised for minimal/trivial tasks.');
    warningSigns.push({
      title: 'Disproportionate Compensation for Low-Skill Work',
      explanation: 'Promising high daily payouts (₹1,500–₹5,000/day) for trivial tasks like video liking or copy-pasting is standard bait for prepaid task fraud.'
    });
  } else if (matchedTaskKeywords.some(k => k.includes('recharge') || k.includes('withdrawal'))) {
    score += 30;
    scoreBreakdown.push('+30 points: Demands account recharge to unlock withdrawal.');
    warningSigns.push({
      title: 'Prepaid Task Fraud Mechanics',
      explanation: 'Demanding recharges or advance deposits to unlock earned withdrawals is the definitive signature of cyber task syndicates.'
    });
  }

  // =========================================================================
  // Vector 4: Suspicious Email Domains (+20 to +35 points, or -15 points)
  // =========================================================================
  const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'protonmail.com', 'icloud.com'];
  const disposableProviders = ['mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 'throwawaymail.com'];
  const emailDomain = cleanEmail.split('@')[1];

  if (emailDomain) {
    if (disposableProviders.includes(emailDomain)) {
      score += 35;
      scoreBreakdown.push(`+35 points: Recruiter uses a temporary disposable email domain (@${emailDomain}).`);
      warningSigns.push({
        title: 'Disposable Email Domain Used',
        explanation: `Recruiter is contacting via a known temporary email service (@${emailDomain}), strongly indicating anonymity and evasion.`
      });
    } else if (freeProviders.includes(emailDomain)) {
      score += 20;
      scoreBreakdown.push(`+20 points: Recruiter uses free public email provider (@${emailDomain}).`);
      warningSigns.push({
        title: 'Free Public Email Provider Used by Recruiter',
        explanation: `Recruiter is contacting via @${emailDomain} rather than an authenticated corporate domain. Authentic corporate HR teams use enterprise domain addresses.`
      });
    } else {
      score = Math.max(0, score - 10);
      scoreBreakdown.push(`-10 points: Recruiter email utilizes a custom enterprise domain (@${emailDomain}).`);
      positiveIndicators.push(`Recruiter communicates using custom enterprise domain (@${emailDomain}).`);

      if (cleanWebsite) {
        const webDomain = cleanWebsite.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        if (webDomain && (emailDomain.includes(webDomain) || webDomain.includes(emailDomain))) {
          score = Math.max(0, score - 10);
          scoreBreakdown.push(`-10 points: Email domain matches provided corporate website.`);
          positiveIndicators.push(`Recruiter email domain directly matches the corporate website (${webDomain}).`);
        } else {
          score += 15;
          scoreBreakdown.push(`+15 points: Email domain (@${emailDomain}) does not match company website domain (${webDomain}).`);
          warningSigns.push({
            title: 'Recruiter Domain and Website Mismatch',
            explanation: `Recruiter email (@${emailDomain}) does not match the company website domain (${webDomain}). Verify recruiter identity independently.`
          });
        }
      }
    }
  } else {
    score += 5;
    scoreBreakdown.push('+5 points: Recruiter email omitted (evaluated as uncertainty factor).');
    warningSigns.push({
      title: 'Recruiter Email Omitted (Uncertainty Factor)',
      explanation: 'No recruiter email address was provided. Note: Missing contact details are treated as uncertainty rather than definitive proof of fraud.'
    });
  }

  // =========================================================================
  // Vector 5: Urgency & High-Pressure Tactics (+15 points)
  // =========================================================================
  const urgencyKeywords = ['urgent', 'within 2 hours', 'within 24 hours', 'today only', 'slots limited', 'immediate joining', 'hurry up', 'last date today'];
  if (urgencyKeywords.some(k => text.includes(k))) {
    score += 15;
    scoreBreakdown.push('+15 points: Artificial urgency or high-pressure recruitment tactics.');
    warningSigns.push({
      title: 'High-Pressure Urgency Tactics',
      explanation: 'Artificial deadlines ("offer expires in 2 hours") are designed to induce panic and prevent candidates from conducting due diligence.'
    });
  }

  // =========================================================================
  // Vector 6: Suspicious Application Links & Anonymous Channels (+15 to +30 points)
  // Purely static syntactic analysis — NO HTTP requests or active pings.
  // =========================================================================
  if (text.includes('telegram') || cleanUrl.includes('t.me') || cleanUrl.includes('telegram.me')) {
    score += 30;
    scoreBreakdown.push('+30 points: Communication directed through Telegram channel.');
    warningSigns.push({
      title: 'Communication Exclusively on Telegram',
      explanation: 'Directing recruitment or daily assignments through anonymous Telegram channels is the primary infrastructure for investment and task fraud.'
    });
  }

  const shorteners = ['bit.ly', 'tinyurl.com', 'cutt.ly', 'ow.ly', 'is.gd', 'rb.gy'];
  if (shorteners.some(s => cleanUrl.includes(s) || text.includes(s))) {
    score += 15;
    scoreBreakdown.push('+15 points: URL shortener masks destination domain.');
    warningSigns.push({
      title: 'Obfuscated Application Link',
      explanation: 'URL shorteners mask the destination domain, preventing inspection of the hosting infrastructure.'
    });
  }

  const suspiciousTlds = ['.xyz', '.top', '.tk', '.buzz', '.cf', '.ml', '.ga', '.click', '.work'];
  if (suspiciousTlds.some(t => cleanUrl.includes(t) || cleanWebsite.includes(t))) {
    score += 15;
    scoreBreakdown.push('+15 points: Uses low-reputation or high-abuse TLD.');
    warningSigns.push({
      title: 'High-Abuse Top-Level Domain (TLD) Detected',
      explanation: 'The application or website uses a low-reputation generic TLD frequently associated with disposable phishing campaigns.'
    });
  }

  // =========================================================================
  // Vector 7: Missing Company Details (Uncertainty Factor, +8 points)
  // =========================================================================
  if (!cleanWebsite) {
    score += 8;
    scoreBreakdown.push('+8 points: Company website not provided (treated as uncertainty).');
    warningSigns.push({
      title: 'Missing Corporate Website (Uncertainty Factor)',
      explanation: 'No official corporate website was provided. Without a verifiable website, corporate registration must be independently confirmed on registry portals (mca.gov.in).'
    });
  } else {
    positiveIndicators.push('Provided independent company website URL for research.');
  }

  // =========================================================================
  // Vector 8: Vague Description & Lack of Technical Interview (+15 to +20 points, or -15 points)
  // =========================================================================
  const directSelectionKeywords = ['no interview', 'direct selection', 'without interview', 'selected directly', 'no technical round', 'direct hiring without test'];
  const structuredInterviewKeywords = ['interview', 'coding round', 'technical assessment', 'technical assignment', 'assignment round', 'coding assessment', 'hackerrank', 'screening call', 'portfolio review'];

  if (directSelectionKeywords.some(k => text.includes(k))) {
    score += 20;
    scoreBreakdown.push('+20 points: Direct selection promised without interview assessment.');
    warningSigns.push({
      title: 'Offer Issued Without Technical Interview',
      explanation: 'Legitimate tech and corporate internships conduct at least one interview loop or technical assessment before extending an offer.'
    });
  } else if (structuredInterviewKeywords.some(k => text.includes(k))) {
    score = Math.max(0, score - 15);
    scoreBreakdown.push('-15 points: Rigorous technical screening or interview rounds mentioned.');
    positiveIndicators.push('Application mentions structured interview loops or technical assessments.');
  }

  if (input.internshipDescription.length < 50) {
    score += 10;
    scoreBreakdown.push('+10 points: Excessively vague or brief internship description.');
    warningSigns.push({
      title: 'Vague Job Description (Uncertainty Factor)',
      explanation: 'The job description is brief and lacks concrete role responsibilities, tech stack requirements, or deliverables.'
    });
  }

  // Clamp score between 5 and 99
  score = Math.max(5, Math.min(99, score));

  // Determine categorical risk level
  let level = 'Low';
  if (score >= 85) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 30) level = 'Medium';
  else level = 'Low';

  // Tailored recommended verification actions
  recommendedActions.push(
    `Check the Ministry of Corporate Affairs (mca.gov.in) portal to confirm if "${input.companyName}" has an active Corporate Identification Number (CIN).`,
    `Search for the recruiter on LinkedIn to verify their official employment tenure and mutual connections with ${input.companyName}.`,
    `Cross-check the job opening on ${cleanWebsite ? cleanWebsite : "the organization's official careers portal"} instead of third-party chat groups.`
  );
  if (isFeeRequested) {
    recommendedActions.unshift('IMMEDIATELY CEASE PAYMENT: Do not transfer money via UPI, net banking, or cryptocurrency under any circumstances.');
  }

  // Tailored questions for recruiter
  questionsForRecruiter.push(
    `"Can you provide the official Corporate Identification Number (CIN) and registered office address for ${input.companyName}?"`,
    `"Will all official employment contracts and NDAs be dispatched from an authenticated corporate email domain?"`,
    `"What is the structured mentor allocation and evaluation rubric for the ${input.internshipTitle} position?"`
  );
  if (isFeeRequested) {
    questionsForRecruiter.unshift('"Can you provide written documentation on corporate letterhead from your Legal department explaining why an upfront fee is required from interns?"');
  }

  const explanations = `[Fallback Mode: Rule-Based Evaluation] Score: ${score}/100 (${level} Risk). Breakdown: ${scoreBreakdown.join(' ')}`;

  return {
    risk_score: score,
    risk_level: level,
    warning_signs: warningSigns,
    positive_indicators: positiveIndicators,
    explanations: explanations,
    recommended_actions: recommendedActions,
    questions_for_recruiter: questionsForRecruiter,
    limitations: STANDARD_LIMITATIONS,
    is_fallback: true,
    provider: 'InternShield Rule-Based Threat Engine (Fallback Mode)',
    analyzed_at: new Date().toISOString(),

    // CamelCase compatibility bindings for frontend UI
    riskScore: score,
    riskLevel: level,
    warningSigns: warningSigns,
    trustIndicators: positiveIndicators,
    summary: explanations,
    verificationSteps: recommendedActions,
    recruiterQuestions: questionsForRecruiter,
    disclaimer: STANDARD_LIMITATIONS[0]
  };
}

/**
 * Sanitizes and bounds input fields
 */
function sanitizeScanInput(data = {}) {
  return {
    internshipTitle: String(data.internshipTitle || data.title || '').slice(0, 255).trim(),
    companyName: String(data.companyName || data.company || '').slice(0, 255).trim(),
    recruiterEmail: String(data.recruiterEmail || data.email || '').slice(0, 255).trim(),
    companyWebsite: String(data.companyWebsite || data.website || '').slice(0, 255).trim(),
    internshipDescription: String(data.internshipDescription || data.description || data.text || '').slice(0, 5000).trim(),
    applicationUrl: String(data.applicationUrl || data.url || '').slice(0, 500).trim(),
    offeredStipend: String(data.offeredStipend || data.stipend || '').slice(0, 100).trim(),
    hasUpfrontFee: data.hasUpfrontFee === 'yes' || data.hasUpfrontFee === true ? 'yes' : 'no',
    upfrontFeeAmount: String(data.upfrontFeeAmount || '').slice(0, 50).trim(),
    additionalDetails: String(data.additionalDetails || data.notes || '').slice(0, 2000).trim(),
    text: data.text ? String(data.text).slice(0, 5000).trim() : '',
    image: data.image && typeof data.image === 'string' ? data.image : ''
  };
}

/**
 * Legacy text-only analysis helper for backwards compatibility
 */
export async function analyzeInternshipScam(text) {
  return analyzeInternshipOffer({
    internshipTitle: 'Unspecified Position',
    companyName: 'Unspecified Organization',
    internshipDescription: text,
    hasUpfrontFee: text.toLowerCase().includes('fee') || text.toLowerCase().includes('deposit') ? 'yes' : 'no'
  });
}
