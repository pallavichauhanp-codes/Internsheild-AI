-- InternShield AI Database Schema
-- Run this script in MySQL Workbench or via command line:
-- mysql -u root -p < backend/src/db/schema.sql

CREATE DATABASE IF NOT EXISTS internshield_db;
USE internshield_db;

-- 1. Table for storing user-submitted scam reports
CREATE TABLE IF NOT EXISTS scam_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  recruiter_contact VARCHAR(255),
  platform_source VARCHAR(100) COMMENT 'LinkedIn, Telegram, WhatsApp, Email, Job Portal',
  fraud_type VARCHAR(100) COMMENT 'Registration Fee, Fake Task, Identity Theft, Phishing, Fake Offer',
  description TEXT NOT NULL,
  requested_amount DECIMAL(10, 2) DEFAULT 0.00,
  evidence_link VARCHAR(500),
  status ENUM('pending', 'verified_scam', 'rejected') DEFAULT 'pending',
  reporter_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for verified legit companies & known blacklisted entities
CREATE TABLE IF NOT EXISTS company_directory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  verification_status ENUM('verified_authentic', 'flagged_suspicious', 'confirmed_fraud') NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for logging AI analysis requests and results
CREATE TABLE IF NOT EXISTS analysis_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  input_text TEXT NOT NULL,
  risk_score INT NOT NULL COMMENT 'Score from 0 (Safe) to 100 (Severe Fraud)',
  risk_level ENUM('SAFE', 'MODERATE_RISK', 'HIGH_RISK') NOT NULL,
  red_flags JSON,
  ai_recommendation TEXT,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial known records
INSERT IGNORE INTO company_directory (name, domain, verification_status, notes) VALUES
('Google', 'google.com', 'verified_authentic', 'Global technology company'),
('Microsoft', 'microsoft.com', 'verified_authentic', 'Global technology enterprise'),
('Amazon', 'amazon.com', 'verified_authentic', 'E-commerce and cloud enterprise'),
('Telegram Tasks Pro', 'freelancetask24.ru', 'confirmed_fraud', 'Known paid-task Telegram investment scam impersonating tech recruiters');
