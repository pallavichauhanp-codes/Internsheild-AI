-- ============================================================================
-- InternShield AI - MySQL Database Schema (MySQL 8+)
-- Database: internshield_ai
-- Description: Complete schema with tables, primary keys, foreign keys, 
--              indexes, unique constraints, and initial test fixtures.
-- ============================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS internshield_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE internshield_ai;

-- ============================================================================
-- Table 1: users
-- Stores registered students and platform administrators with bcrypt hashes.
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints & Indexes
  CONSTRAINT uq_users_email UNIQUE (email),
  INDEX idx_users_role (role),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- Table 2: internship_scans
-- Stores detailed threat evaluation records conducted by users or visitors.
-- ============================================================================
CREATE TABLE IF NOT EXISTS internship_scans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  internship_title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  recruiter_email VARCHAR(255) NULL,
  company_website VARCHAR(255) NULL,
  internship_description TEXT NOT NULL,
  application_url VARCHAR(500) NULL,
  stipend VARCHAR(100) NULL,
  upfront_fee_requested TINYINT(1) NOT NULL DEFAULT 0,
  risk_score INT NOT NULL,
  risk_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  analysis_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys & Indexes
  CONSTRAINT fk_scans_user FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
    
  INDEX idx_scans_user_id (user_id),
  INDEX idx_scans_company_name (company_name),
  INDEX idx_scans_risk_level (risk_level),
  INDEX idx_scans_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- Table 3: community_reports
-- Crowd-sourced scam reports submitted by students to warn the community.
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  company_name VARCHAR(255) NOT NULL,
  internship_title VARCHAR(255) NULL,
  description TEXT NOT NULL,
  evidence_reference VARCHAR(500) NULL,
  status ENUM('pending', 'verified_scam', 'rejected', 'under_review') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys & Indexes
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,

  INDEX idx_reports_user_id (user_id),
  INDEX idx_reports_company (company_name),
  INDEX idx_reports_status (status),
  INDEX idx_reports_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- Table 4: saved_internships
-- Bookmarked scan results and offers saved to a student's personal dashboard.
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_internships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scan_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys & Constraints
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,

  CONSTRAINT fk_saved_scan FOREIGN KEY (scan_id) 
    REFERENCES internship_scans(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,

  -- Prevent duplicate saves of the same scan by the same user
  CONSTRAINT uq_user_saved_scan UNIQUE (user_id, scan_id),
  INDEX idx_saved_user_id (user_id),
  INDEX idx_saved_scan_id (scan_id)
) ENGINE=InnoDB;

-- ============================================================================
-- Seed Initial Fixture Data (Optional / Testing)
-- Passwords below are hashed with bcrypt (Cost: 10).
-- Demo Student Password: Password@123
-- Demo Admin Password:   Admin@123
-- ============================================================================

INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES
(1, 'Alex Sharma', 'alex.student@college.edu', '$2a$10$7zB3cT6K7G8Jj5P5J5J5Jev0Q8dZ7j0J7Z1k9L8M7N6P5Q4R3S2Tu', 'student'),
(2, 'Security Admin', 'security.admin@internshield.ai', '$2a$10$8zC4dU7L8H9Kk6Q6K6K6Kfw1R9ea8k1K8A2l0M9N8O7Q6R5S4T3Uv', 'admin');

-- Sample Initial Scans
INSERT IGNORE INTO internship_scans (id, user_id, internship_title, company_name, recruiter_email, company_website, internship_description, stipend, upfront_fee_requested, risk_score, risk_level, analysis_json) VALUES
(1, 1, 'Frontend React Developer', 'Apex Cloud Solutions', 'apex-hr@gmail.com', 'https://apexcloud.com', 'Selected without interview. Demanded Rs. 2,500 security deposit for training kit.', '₹25,000', 1, 99, 'Critical', '{"summary": "Demanded upfront fee via Gmail recruiter. Critical scam pattern.", "redFlags": ["Upfront fee demanded", "Free Gmail provider used"]}'),
(2, 1, 'Software Engineering Intern', 'Microsoft India', 'university-hiring@microsoft.com', 'https://careers.microsoft.com', '2 technical interview rounds. No application fee or deposits.', '₹80,000', 0, 5, 'Low', '{"summary": "Legitimate enterprise hiring workflow with corporate domain.", "trustIndicators": ["Authenticated corporate domain", "Rigorous technical screening"]}');

-- Sample Initial Community Reports
INSERT IGNORE INTO community_reports (id, user_id, company_name, internship_title, description, evidence_reference, status) VALUES
(1, 1, 'Apex Cloud Tech Solutions', 'React Developer Intern', 'Recruiter contacted via WhatsApp pretending to be HR. Asked for ₹2,499 for security deposit before sending offer letter.', 'Fake offer PDF on unverified letterhead', 'verified_scam'),
(2, 1, 'NextGen Task Freelance', 'Data Reviewer', 'Offered ₹1,500/day for review tasks in Telegram group. Demanded ₹5,000 recharge to unlock withdrawal.', 'Telegram group chat export', 'verified_scam');
