import { analyzeStructuredScan } from '../services/aiService.js';
import pool from '../config/db.js';

export async function handleAnalyzeScan(req, res) {
  try {
    const {
      userId = null,
      internshipTitle,
      companyName,
      recruiterEmail,
      companyWebsite,
      internshipDescription,
      applicationUrl,
      offeredStipend,
      hasUpfrontFee,
      upfrontFeeAmount,
      additionalDetails
    } = req.body;

    // Field Validation
    const errors = {};
    if (!internshipTitle || !internshipTitle.trim()) {
      errors.internshipTitle = 'Internship title is required.';
    }
    if (!companyName || !companyName.trim()) {
      errors.companyName = 'Company name is required.';
    }
    if (!internshipDescription || internshipDescription.trim().length < 15) {
      errors.internshipDescription = 'Please provide a description of at least 15 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please fill in the required fields.',
        errors
      });
    }

    const isFeeRequested = hasUpfrontFee === 'yes' || hasUpfrontFee === true ? 1 : 0;

    // Process scan with AI and rule-based verification engine
    const analysisResult = await analyzeStructuredScan({
      internshipTitle,
      companyName,
      recruiterEmail,
      companyWebsite,
      internshipDescription,
      applicationUrl,
      offeredStipend,
      hasUpfrontFee: isFeeRequested === 1 ? 'yes' : 'no',
      upfrontFeeAmount,
      additionalDetails
    });

    // Save scan to MySQL table `internship_scans` using parameterized queries
    let scanRecordId = null;
    try {
      const [insertResult] = await pool.execute(
        `INSERT INTO internship_scans (
          user_id,
          internship_title,
          company_name,
          recruiter_email,
          company_website,
          internship_description,
          application_url,
          stipend,
          upfront_fee_requested,
          risk_score,
          risk_level,
          analysis_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId ? parseInt(userId, 10) : null,
          internshipTitle.trim(),
          companyName.trim(),
          recruiterEmail ? recruiterEmail.trim() : null,
          companyWebsite ? companyWebsite.trim() : null,
          internshipDescription.trim(),
          applicationUrl ? applicationUrl.trim() : null,
          offeredStipend ? offeredStipend.trim() : null,
          isFeeRequested,
          analysisResult.riskScore,
          analysisResult.riskLevel, // 'Low', 'Medium', 'High', 'Critical'
          JSON.stringify(analysisResult)
        ]
      );
      scanRecordId = insertResult.insertId;
    } catch (dbErr) {
      // Non-blocking log if MySQL is not yet configured by the user
      console.warn('MySQL Scan Record Insert Skipped:', dbErr.message);
    }

    return res.json({
      success: true,
      data: {
        ...analysisResult,
        scanId: scanRecordId
      }
    });
  } catch (err) {
    console.error('Scan analysis error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete threat analysis.',
      error: err.message
    });
  }
}
