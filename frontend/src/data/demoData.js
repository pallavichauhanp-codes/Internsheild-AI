/**
 * Demo Dataset for InternShield AI
 * Note: Clearly flagged as verified demo & test fixtures for college hackathon showcase.
 */

export const PLATFORM_STATS = {
  totalScans: '14,820+',
  confirmedScams: '3,210',
  fundsProtected: '₹4.2 Cr',
  collegesCovered: '180+'
};

export const SAMPLE_REPORTS = [
  {
    id: 'rep-101',
    companyName: 'Apex Cloud Solutions Pvt Ltd',
    allegedRole: 'Full-Stack Developer Intern',
    platform: 'Telegram / WhatsApp',
    fraudType: 'Mandatory Training Kit Fee',
    demandedAmount: '₹3,499',
    riskScore: 95,
    riskLevel: 'HIGH_RISK',
    reporter: 'Rohan V. (IIT BHU)',
    date: '2026-10-24',
    status: 'Verified Scam',
    isDemo: true,
    summary: 'Received an offer letter without any technical interview. HR asked for ₹3,499 for security deposit and training kit delivery.',
    details: 'Recruiter contacted via WhatsApp pretending to be HR from Apex Cloud. Provided an offer letter on fake letterhead lacking CIN and official corporate email. Demanded immediate UPI payment to an individual VPA within 2 hours or offer would expire.',
    redFlags: [
      'No technical round or coding assessment before offer',
      'Demanded upfront fee for training kit / laptop dispatch',
      'Recruiter used personal Gmail and communicated only on Telegram',
      'Artificial urgency ("Pay within 2 hours to confirm slot")'
    ],
    upvotes: 84,
    commentsCount: 14,
    evidenceType: 'Fake Offer Letter PDF & WhatsApp Chat Screenshots'
  },
  {
    id: 'rep-102',
    companyName: 'NextGen AI Automations',
    allegedRole: 'Data Annotation Intern',
    platform: 'Instagram / Telegram',
    fraudType: 'Paid Task / Recharge Scam',
    demandedAmount: '₹5,000 - ₹25,000',
    riskScore: 92,
    riskLevel: 'HIGH_RISK',
    reporter: 'Priya M. (Anna University)',
    date: '2026-10-21',
    status: 'Verified Scam',
    isDemo: true,
    summary: 'Paid ₹500 for small review tasks initially, then asked to deposit ₹5,000 into a VIP wallet to unlock larger commissions.',
    details: 'Victim was added to a Telegram group with 40 bot accounts posting fake payout screenshots. After completing 3 simple copy-paste tasks, funds were locked and admin asked for higher crypto / UPI recharges.',
    redFlags: [
      'Task-based payout structure with wallet lock mechanism',
      'Telegram group filled with bot testimonials and fake payment slips',
      'Unrealistic earnings (₹2,500/day for 15 minutes of copy-pasting)'
    ],
    upvotes: 112,
    commentsCount: 29,
    evidenceType: 'Telegram Chat Export'
  },
  {
    id: 'rep-103',
    companyName: 'Zenith Global Logistics',
    allegedRole: 'Business Development Intern',
    platform: 'LinkedIn Cold InMail',
    fraudType: 'Identity Theft / Phishing',
    demandedAmount: '₹0 (Aadhaar & Bank Details)',
    riskScore: 78,
    riskLevel: 'HIGH_RISK',
    reporter: 'Kartik S. (Delhi University)',
    date: '2026-10-18',
    status: 'Verified Scam',
    isDemo: true,
    summary: 'Asked for Aadhaar card scan, PAN card, and bank account login verification before sharing job description.',
    details: 'Candidate received an InMail from an account created 2 weeks ago with stock photo avatar. Directed candidate to an unencrypted Google Form asking for Aadhaar OTP and bank IFSC with cancelled cheque.',
    redFlags: [
      'Requested sensitive KYC documents before contract signing',
      'Hosted application on unverified Google Form',
      'InMail profile created recently with zero industry endorsements'
    ],
    upvotes: 67,
    commentsCount: 9,
    evidenceType: 'Phishing Google Form URL'
  },
  {
    id: 'rep-104',
    companyName: 'HyperGrowth Media Labs',
    allegedRole: 'Digital Marketing Intern',
    platform: 'College Placement WhatsApp Group',
    fraudType: 'Unpaid Multi-Level Marketing (MLM)',
    demandedAmount: '₹1,200 Registration',
    riskScore: 65,
    riskLevel: 'MODERATE_RISK',
    reporter: 'Sneha K. (Pune University)',
    date: '2026-10-12',
    status: 'Under Review',
    isDemo: true,
    summary: 'Disguised marketing internship where stipend is solely dependent on getting 10 other students to buy paid certificates.',
    details: 'Internship contract required selling promotional packages to peers. No real marketing tasks or technical mentorship provided.',
    redFlags: [
      'Multi-level referral chain required to earn stipend',
      'Certificate only granted upon achieving student sales quota'
    ],
    upvotes: 43,
    commentsCount: 7,
    evidenceType: 'Course Agreement Copy'
  }
];

export const RECENT_SCANS = [
  {
    id: 'scan-1',
    role: 'React Frontend Developer',
    companyClaim: 'Nexus Tech Global',
    date: 'Today, 2:15 PM',
    riskScore: 92,
    riskLevel: 'HIGH_RISK',
    reason: 'Demanded ₹2,000 security deposit via WhatsApp',
    isDemo: true
  },
  {
    id: 'scan-2',
    role: 'Cybersecurity Analyst Intern',
    companyClaim: 'Infosys Careers',
    date: 'Yesterday, 6:40 PM',
    riskScore: 12,
    riskLevel: 'SAFE',
    reason: 'Verified official corporate domain (@infosys.com)',
    isDemo: true
  },
  {
    id: 'scan-3',
    role: 'Data Science Intern',
    companyClaim: 'CloudVision Analytics',
    date: '23 Oct 2026',
    riskScore: 58,
    riskLevel: 'MODERATE_RISK',
    reason: 'Suspicious email domain; no corporate MCA registration',
    isDemo: true
  }
];

export const SAFETY_CHECKLIST = [
  {
    id: 'rule-1',
    title: 'Legitimate Companies NEVER Charge You',
    description: 'No authentic company, startup, or MNC asks candidates to pay for training, registration, laptop shipping, or document verification. Any fee request is an immediate 100% scam indicator.',
    critical: true
  },
  {
    id: 'rule-2',
    title: 'Verify the Recruiter’s Official Email Domain',
    description: 'Always inspect the sender address. Legitimate recruiters use @google.com, @microsoft.com, etc. Avoid recruiters using @gmail.com, @yahoo.com, or weird lookalikes like @amaz0n-careers.com.',
    critical: true
  },
  {
    id: 'rule-3',
    title: 'Beware of "Immediate Selection Without Interview"',
    description: 'Real tech internships involve at least one screening round, technical assessment, or interview. If you receive an offer within 10 minutes of applying, it is almost certainly a predatory trap.',
    critical: true
  },
  {
    id: 'rule-4',
    title: 'Never Share Bank OTPs or Sign Blank Cheques',
    description: 'Scammers frequently request bank verification under the guise of direct-deposit stipend setup. Never provide OTPs, net banking credentials, or signed blank cheques.',
    critical: false
  },
  {
    id: 'rule-5',
    title: 'Validate Indian Companies on MCA Portal',
    description: 'Check the Ministry of Corporate Affairs (mca.gov.in) portal to confirm if the Corporate Identification Number (CIN) and registered office address actually exist.',
    critical: false
  }
];

export const FAQ_LIST = [
  {
    q: 'How does InternShield AI detect internship scams?',
    a: 'InternShield AI utilizes a hybrid detection engine combining LLM natural language analysis, regex pattern recognition for known scam phrases, domain DNS authentication, and our crowd-sourced student blacklist database.'
  },
  {
    q: 'What if a company asks for a "refundable" laptop deposit?',
    a: 'This is the #1 most common scam. Legitimate companies dispatch equipment at their own expense or provide a remote stipend after your official start date. Never pay for your own internship.'
  },
  {
    q: 'Can I report a scam anonymously?',
    a: 'Yes. When submitting a community report, you can check the "Anonymous Submission" option to protect your personal identity while alerting thousands of other students.'
  },
  {
    q: 'Where can I file an official police complaint in India?',
    a: 'You can register an official cyber fraud complaint at the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call the toll-free national helpline 1930.'
  }
];
