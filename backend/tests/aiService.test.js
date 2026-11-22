import assert from 'node:assert/strict';
import { 
  analyzeInternshipOffer, 
  executeRuleBasedFallback, 
  validateAiResponse,
  extractJsonFromText,
  STANDARD_LIMITATIONS, 
  SCORING_METHODOLOGY 
} from '../src/services/aiService.js';

console.log('🧪 =========================================================');
console.log('🧪 Starting InternShield AI Service Test Suite');
console.log('🧪 =========================================================\n');

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}\n`, err.stack);
    testsFailed++;
  }
}

// -----------------------------------------------------------------------------
// Test 1: Safe Legitimate Internship Offer (Low Risk)
// -----------------------------------------------------------------------------
await runTest('Safe Legitimate Offer: Evaluates Microsoft India SWE Intern as Low Risk', async () => {
  const safeOffer = {
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
  };

  const result = await analyzeInternshipOffer(safeOffer);

  // Validate all required schema fields
  assert.ok(typeof result.risk_score === 'number', 'risk_score must be a number');
  assert.ok(result.risk_score >= 0 && result.risk_score <= 29, `Expected Low risk score (0-29), got ${result.risk_score}`);
  assert.equal(result.risk_level, 'Low', 'risk_level must be Low');
  assert.ok(Array.isArray(result.warning_signs), 'warning_signs must be an array');
  assert.ok(Array.isArray(result.positive_indicators), 'positive_indicators must be an array');
  assert.ok(result.positive_indicators.length > 0, 'Should have positive trust indicators');
  assert.ok(typeof result.explanations === 'string', 'explanations must be string');
  assert.ok(Array.isArray(result.recommended_actions), 'recommended_actions must be array');
  assert.ok(Array.isArray(result.limitations), 'limitations must be array');
  assert.equal(result.limitations.length, 4, 'Must contain standard ethical threat intelligence limitations');
});

// -----------------------------------------------------------------------------
// Test 2: Critical Scam (Upfront Training Fee)
// -----------------------------------------------------------------------------
await runTest('Critical Scam: Upfront training fee demanded evaluates as Critical Risk', async () => {
  const scamOffer = {
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
  };

  const result = await analyzeInternshipOffer(scamOffer);

  assert.ok(result.risk_score >= 85, `Expected Critical risk score (>=85), got ${result.risk_score}`);
  assert.equal(result.risk_level, 'Critical', 'risk_level must be Critical');
  assert.ok(result.warning_signs.some(w => w.title.includes('Upfront Payment')), 'Must identify Upfront Payment warning sign');
  assert.ok(result.recommended_actions.some(a => a.includes('CEASE PAYMENT')), 'Must recommend immediately ceasing payment');
});

// -----------------------------------------------------------------------------
// Test 3: High Risk Telegram Task Scam
// -----------------------------------------------------------------------------
await runTest('High Risk Scam: Telegram task scam evaluates as High or Critical Risk', async () => {
  const telegramScam = {
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
  };

  const result = await analyzeInternshipOffer(telegramScam);

  assert.ok(result.risk_score >= 60, `Expected High/Critical risk score (>=60), got ${result.risk_score}`);
  assert.ok(['High', 'Critical'].includes(result.risk_level), `Expected High or Critical risk level, got ${result.risk_level}`);
  assert.ok(result.warning_signs.some(w => w.title.toLowerCase().includes('telegram')), 'Must flag Telegram communication');
});

// -----------------------------------------------------------------------------
// Test 4: Uncertainty vs Fact Test (Unverified Startup)
// -----------------------------------------------------------------------------
await runTest('Uncertainty vs Fact: Missing website treated as uncertainty, not certified fraud', async () => {
  const startupOffer = {
    internshipTitle: 'Junior Python Intern',
    companyName: 'Nebula Logic Labs',
    recruiterEmail: 'contact@nebulalogiclabs.in',
    companyWebsite: '', // Missing website
    internshipDescription: 'Looking for a Python intern for building Django REST APIs. Unpaid learning internship for 2 months, converted to stipend based on performance. 1 technical assignment round.',
    applicationUrl: '',
    offeredStipend: 'Unpaid / Performance Based',
    hasUpfrontFee: 'no',
    upfrontFeeAmount: '',
    additionalDetails: 'Company website is under construction. No upfront fees requested.'
  };

  const result = await analyzeInternshipOffer(startupOffer);

  // Missing website should raise caution (Medium), but NOT falsely classify as Critical fraud
  assert.ok(result.risk_score < 60, `Missing website should not trigger Critical/High fraud without fee, got score: ${result.risk_score}`);
  assert.ok(result.warning_signs.some(w => w.title.includes('Uncertainty')), 'Must label missing website as Uncertainty Factor');
});

// -----------------------------------------------------------------------------
// Test 5: Fallback Result Labeling & Provider Metadata
// -----------------------------------------------------------------------------
await runTest('Fallback Engine: Explicitly labels fallback mode and provider', async () => {
  const sampleInput = {
    internshipTitle: 'Node.js Intern',
    companyName: 'Acme Test Labs',
    internshipDescription: 'Backend internship working on Express APIs and MySQL databases. Coding round followed by interview.',
    hasUpfrontFee: 'no'
  };

  const fallbackResult = executeRuleBasedFallback(sampleInput);

  assert.equal(fallbackResult.is_fallback, true, 'is_fallback must be true');
  assert.ok(fallbackResult.provider.includes('Fallback Mode'), 'Provider string must mention Fallback Mode');
  assert.ok(fallbackResult.explanations.includes('[Fallback Mode'), 'Explanations must indicate fallback mode');
});

// -----------------------------------------------------------------------------
// Test 6: AI Response Validation and Sanitization (Edge Cases)
// -----------------------------------------------------------------------------
await runTest('Validation: Sanitizes out-of-range scores and normalizes schema', async () => {
  // Test 6a: Negative score clamped to 0
  const malformedNegative = {
    risk_score: -20,
    risk_level: 'InvalidLevel',
    warning_signs: ['Plain text warning string'],
    positive_indicators: ['Valid indicator'],
    explanations: 'Test explanation',
    recommended_actions: ['Test action']
  };
  const validatedNegative = validateAiResponse(malformedNegative, { hasUpfrontFee: 'no' });
  assert.equal(validatedNegative.risk_score, 0, 'Negative score must be clamped to 0');
  assert.equal(validatedNegative.risk_level, 'Low', 'Derived level for score 0 must be Low');
  assert.equal(validatedNegative.warning_signs[0].title, 'Identified Concern', 'String warning sign must be converted to object');

  // Test 6b: Score > 100 clamped to 100
  const malformedOver = {
    risk_score: 150,
    risk_level: 'Unknown',
    warning_signs: [],
    positive_indicators: [],
    explanations: 'High risk'
  };
  const validatedOver = validateAiResponse(malformedOver, { hasUpfrontFee: 'no' });
  assert.equal(validatedOver.risk_score, 100, 'Score > 100 must be clamped to 100');
  assert.equal(validatedOver.risk_level, 'Critical', 'Derived level for score 100 must be Critical');

  // Test 6c: Emergency warning injected if upfront fee requested
  const feeInput = { hasUpfrontFee: 'yes' };
  const validatedFee = validateAiResponse({ risk_score: 90, risk_level: 'Critical', recommended_actions: ['Check LinkedIn'] }, feeInput);
  assert.ok(validatedFee.recommended_actions[0].includes('CEASE PAYMENT'), 'Must prepend emergency cease payment warning');
});

// -----------------------------------------------------------------------------
// Test 7: Safe JSON Extractor
// -----------------------------------------------------------------------------
await runTest('JSON Extractor: Safely parses raw text, markdown blocks, and embedded objects', async () => {
  // Direct JSON
  const parsedDirect = extractJsonFromText('{"risk_score": 10}');
  assert.equal(parsedDirect.risk_score, 10);

  // Markdown code fence ```json ... ```
  const parsedMarkdown = extractJsonFromText('Here is the analysis:\n```json\n{"risk_score": 85}\n```\nHope this helps!');
  assert.equal(parsedMarkdown.risk_score, 85);

  // Embedded JSON without markdown fence
  const parsedEmbedded = extractJsonFromText('Analysis result: {"risk_score": 50, "risk_level": "Medium"} - End of evaluation.');
  assert.equal(parsedEmbedded.risk_score, 50);
  assert.equal(parsedEmbedded.risk_level, 'Medium');
});

// -----------------------------------------------------------------------------
// Test 8: Zero Active Execution Disclaimer
// -----------------------------------------------------------------------------
await runTest('Zero Active Execution: Standard limitations guarantee no URL ping/crawl', async () => {
  const limitationsText = STANDARD_LIMITATIONS.join(' ');
  assert.ok(limitationsText.includes('Zero Active Execution'), 'Must contain Zero Active Execution disclaimer');
  assert.ok(limitationsText.includes('does NOT ping, fetch, execute, or crawl'), 'Must explicitly disclaim opening/crawling submitted URLs');
});

// -----------------------------------------------------------------------------
// Test Summary
// -----------------------------------------------------------------------------
console.log('\n=========================================================');
console.log(`Test Results: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log('=========================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
