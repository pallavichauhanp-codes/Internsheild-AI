import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '../../../database');
const DB_FILE = path.join(DB_DIR, 'internshield.sqlite');

let sqliteDb = null;

/**
 * Initializes SQLite database tables and initial fixtures
 */
export function initSqliteDb() {
  if (sqliteDb) return sqliteDb;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  sqliteDb = new DatabaseSync(DB_FILE);

  // Initialize schema
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS internship_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NULL,
      internship_title TEXT NOT NULL,
      company_name TEXT NOT NULL,
      recruiter_email TEXT NULL,
      company_website TEXT NULL,
      internship_description TEXT NOT NULL,
      application_url TEXT NULL,
      stipend TEXT NULL,
      upfront_fee_requested INTEGER NOT NULL DEFAULT 0,
      risk_score INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      analysis_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS community_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NULL,
      company_name TEXT NOT NULL,
      internship_title TEXT NULL,
      description TEXT NOT NULL,
      evidence_reference TEXT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS saved_internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scan_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, scan_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (scan_id) REFERENCES internship_scans(id) ON DELETE CASCADE
    );
  `);

  // Seed default test fixtures if users table is empty
  seedInitialFixtures(sqliteDb);

  return sqliteDb;
}

/**
 * Seeds initial demo accounts and fixtures matching database/schema.sql
 */
function seedInitialFixtures(db) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (countRow && countRow.count > 0) {
    return; // Already seeded
  }

  console.log('🌱 [Database Seed] Populating initial demo fixtures...');

  // 1. Demo Student & Admin (Bcrypt cost: 10)
  const studentHash = bcrypt.hashSync('Password@123', 10);
  const adminHash = bcrypt.hashSync('Admin@123', 10);

  const insertUser = db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
  insertUser.run(1, 'Alex Sharma', 'alex.student@college.edu', studentHash, 'student');
  insertUser.run(2, 'Security Admin', 'security.admin@internshield.ai', adminHash, 'admin');

  // 2. Initial Sample Scans
  const insertScan = db.prepare(`
    INSERT INTO internship_scans 
    (id, user_id, internship_title, company_name, recruiter_email, company_website, internship_description, application_url, stipend, upfront_fee_requested, risk_score, risk_level, analysis_json) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const scamAnalysis = JSON.stringify({
    risk_score: 99,
    risk_level: 'Critical',
    riskScore: 99,
    riskLevel: 'Critical',
    warning_signs: [
      { title: 'Mandatory Upfront Payment Requested', explanation: 'Recruiter requested ₹2,500 for training kit.' },
      { title: 'Free Public Email Provider Used', explanation: 'Recruiter is contacting via @gmail.com.' }
    ],
    positive_indicators: [],
    explanations: 'High threat detected. Demanded ₹2,500 security deposit for training materials.',
    summary: 'High threat detected. Demanded ₹2,500 security deposit for training materials.',
    recommended_actions: ['IMMEDIATELY CEASE PAYMENT', 'Verify on MCA registry'],
    verificationSteps: ['IMMEDIATELY CEASE PAYMENT', 'Verify on MCA registry'],
    questions_for_recruiter: ['"Can you provide your CIN number?"'],
    recruiterQuestions: ['"Can you provide your CIN number?"'],
    limitations: [
      'Automated Threat Assessment: Does not constitute a certified legal verdict.',
      'Zero Active Execution: Submitted URLs are analyzed purely via static syntactic rules.'
    ],
    is_fallback: true,
    provider: 'InternShield Threat Intelligence Engine'
  });

  const legitAnalysis = JSON.stringify({
    risk_score: 5,
    risk_level: 'Low',
    riskScore: 5,
    riskLevel: 'Low',
    warning_signs: [],
    positive_indicators: [
      'Corporate domain matches company website.',
      'Mentions structured interview rounds.'
    ],
    explanations: 'Authentic enterprise recruitment pattern. Corporate email and structured screening.',
    summary: 'Authentic enterprise recruitment pattern. Corporate email and structured screening.',
    recommended_actions: ['Proceed with application on official Microsoft portal.'],
    verificationSteps: ['Proceed with application on official Microsoft portal.'],
    questions_for_recruiter: ['"What is the mentor allocation rubric?"'],
    recruiterQuestions: ['"What is the mentor allocation rubric?"'],
    limitations: [
      'Automated Threat Assessment: Does not constitute a certified legal verdict.',
      'Zero Active Execution: Submitted URLs are analyzed purely via static syntactic rules.'
    ],
    is_fallback: true,
    provider: 'InternShield Threat Intelligence Engine'
  });

  insertScan.run(1, 1, 'Frontend React Developer', 'Apex Cloud Solutions', 'apex-hr@gmail.com', 'https://apexcloud.com', 'Selected without interview. Demanded Rs. 2,500 security deposit for training kit.', 'https://bit.ly/apex-apply', '₹25,000', 1, 99, 'Critical', scamAnalysis);
  insertScan.run(2, 1, 'Software Engineering Intern', 'Microsoft India', 'university-hiring@microsoft.com', 'https://careers.microsoft.com', '2 technical interview loops. No application fee or deposits.', 'https://careers.microsoft.com/jobs/1892', '₹80,000', 0, 5, 'Low', legitAnalysis);

  // 3. Initial Community Reports (With separate review statuses: verified_scam, pending, under_review)
  const insertReport = db.prepare(`
    INSERT INTO community_reports 
    (id, user_id, company_name, internship_title, description, evidence_reference, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertReport.run(
    1, 1, 'Apex Cloud Tech Solutions', 'React Developer Intern',
    'Recruiter contacted via WhatsApp pretending to be HR. Asked for ₹2,499 for security deposit before sending offer letter.',
    'Fake offer PDF on unverified letterhead', 'verified_scam'
  );

  insertReport.run(
    2, 1, 'NextGen Task Freelance', 'Data Reviewer',
    'Offered ₹1,500/day for review tasks in Telegram group. Demanded ₹5,000 recharge to unlock withdrawal.',
    'Telegram group chat export', 'verified_scam'
  );

  insertReport.run(
    3, 1, 'CloudPeak Analytics', 'Python AI Intern',
    'Offered direct selection without technical interview, asks for candidate Aadhaar card and blank cancelled cheque.',
    'WhatsApp chat logs & unencrypted Google Form', 'pending'
  );

  insertReport.run(
    4, 1, 'SwiftByte Innovations', 'Content Writer',
    'Demanding ₹1,200 certificate registration charge before assigning first writing project.',
    'Email thread with recruiter', 'under_review'
  );

  // 4. Initial Saved Internships
  const insertSaved = db.prepare('INSERT INTO saved_internships (user_id, scan_id) VALUES (?, ?)');
  insertSaved.run(1, 1);
  insertSaved.run(1, 2);

  console.log('✅ [Database Seed] Completed seeding demo accounts:');
  console.log('   - Student: alex.student@college.edu / Password@123');
  console.log('   - Admin:   security.admin@internshield.ai / Admin@123');
}

/**
 * Executes a query on the SQLite database with MySQL-compatible output format: [rows, fields]
 */
export function executeSqlite(sql, params = []) {
  const db = initSqliteDb();
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // Normalize params: convert boolean/undefined/null appropriately
  const cleanParams = params.map(p => {
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (p === undefined) return null;
    return p;
  });

  if (upper.startsWith('SELECT')) {
    const stmt = db.prepare(trimmed);
    const rows = stmt.all(...cleanParams);
    return [rows, []];
  } else if (upper.startsWith('INSERT')) {
    const stmt = db.prepare(trimmed);
    const result = stmt.run(...cleanParams);
    return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes }, []];
  } else if (upper.startsWith('UPDATE') || upper.startsWith('DELETE')) {
    const stmt = db.prepare(trimmed);
    const result = stmt.run(...cleanParams);
    return [{ affectedRows: result.changes, changedRows: result.changes }, []];
  } else {
    db.exec(trimmed);
    return [{ affectedRows: 0 }, []];
  }
}
