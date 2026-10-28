import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Analyzes internship offer text or job description for scam indicators
 * @param {string} text - Raw text from email, job posting, or offer letter
 * @returns {Promise<Object>} Analysis report with riskScore, riskLevel, redFlags, reasoning
 */
export async function analyzeInternshipScam(text) {
  if (!genAI) {
    // Fallback heuristic analyzer when API key is not yet configured
    return fallbackAnalysis(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are an expert cybersecurity and recruitment fraud investigator for "InternShield AI".
Analyze the following internship offer / job post details for fraud and scams.

Internship Text:
"""
${text}
"""

Check for key scam signals:
1. Demands upfront fee, training fee, registration fee, laptop deposit, security deposit.
2. Unofficial communication channels (Telegram, WhatsApp only, random Gmail/Yahoo addresses instead of corporate domain).
3. Unrealistic stipend for trivial / no-interview work.
4. Grammar inconsistencies, urgency, threatening language, or lack of concrete company registration details.
5. "Pay to get certificate" or multi-level marketing task scams.

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "riskScore": <number from 0 to 100>,
  "riskLevel": "<SAFE | MODERATE_RISK | HIGH_RISK>",
  "summary": "<concise 2-sentence summary>",
  "redFlags": ["<list of identified red flags>"],
  "safeSignals": ["<list of positive signals or empty>"],
  "recommendation": "<clear actionable advice for the student>"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean potential markdown wrap
    const cleanedJson = responseText.replace(/^```json/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('AI analysis error, utilizing fallback:', error.message);
    return fallbackAnalysis(text);
  }
}

/**
 * Heuristic fallback for testing without active Gemini API key
 */
function fallbackAnalysis(text) {
  const lower = (text || '').toLowerCase();
  const redFlags = [];

  if (lower.includes('fee') || lower.includes('deposit') || lower.includes('registration charge') || lower.includes('pay rs') || lower.includes('pay $')) {
    redFlags.push('Demands monetary fee/deposit, which legitimate internships never require.');
  }
  if (lower.includes('telegram') || lower.includes('whatsapp only')) {
    redFlags.push('Directs communication exclusively to Telegram/WhatsApp channels.');
  }
  if (lower.includes('@gmail.com') || lower.includes('@yahoo.com') || lower.includes('@hotmail.com')) {
    redFlags.push('Uses free public email provider instead of verified corporate domain.');
  }
  if (lower.includes('no interview') || lower.includes('immediate selection')) {
    redFlags.push('Promises immediate selection without rigorous interview or assessment.');
  }

  const riskScore = redFlags.length >= 2 ? 85 : redFlags.length === 1 ? 50 : 15;
  const riskLevel = riskScore >= 70 ? 'HIGH_RISK' : riskScore >= 40 ? 'MODERATE_RISK' : 'SAFE';

  return {
    riskScore,
    riskLevel,
    summary: redFlags.length > 0 
      ? `Detected ${redFlags.length} suspicious pattern(s) typical of internship frauds.` 
      : 'No obvious fraudulent keywords detected in the initial heuristic scan.',
    redFlags,
    safeSignals: redFlags.length === 0 ? ['No immediate fee requests detected', 'Standard job vocabulary'] : [],
    recommendation: riskScore >= 70 
      ? 'DO NOT send money or personal identity documents. Verify through official company careers page.' 
      : 'Verify recruiter profile on LinkedIn and ensure communication is from official corporate domain.'
  };
}
