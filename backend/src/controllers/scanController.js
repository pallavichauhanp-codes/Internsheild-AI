import { analyzeStructuredScan } from '../services/aiService.js';
import pool from '../config/db.js';

export async function handleAnalyzeScan(req, res) {
  try {
    const {
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

    // Process scan with AI and rule-based verification engine
    const analysisResult = await analyzeStructuredScan({
      internshipTitle,
      companyName,
      recruiterEmail,
      companyWebsite,
      internshipDescription,
      applicationUrl,
      offeredStipend,
      hasUpfrontFee: hasUpfrontFee === 'yes' || hasUpfrontFee === true ? 'yes' : 'no',
      upfrontFeeAmount,
      additionalDetails
    });

    // Asynchronously log to MySQL analysis_logs if connected
    try {
      await pool.query(
        `INSERT INTO analysis_logs (input_text, risk_score, risk_level, red_flags, ai_recommendation) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          `[${companyName}] ${internshipTitle}: ${internshipDescription.slice(0, 400)}`,
          analysisResult.riskScore,
          analysisResult.riskLevel === 'Low' ? 'SAFE' : analysisResult.riskLevel === 'Medium' ? 'MODERATE_RISK' : 'HIGH_RISK',
          JSON.stringify(analysisResult.warningSigns || []),
          analysisResult.summary
        ]
      );
    } catch (dbErr) {
      // Non-blocking log
    }

    return res.json({
      success: true,
      data: analysisResult
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
