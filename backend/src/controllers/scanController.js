import pool from '../config/db.js';
import { analyzeInternshipOffer } from '../services/aiService.js';

/**
 * POST /api/scans/analyze
 * Analyzes submitted internship details via server-side AI provider (with rule-based fallback)
 * Validates the analysis and persists the record into MySQL `internship_scans`.
 */
export async function handleAnalyzeScan(req, res, next) {
  try {
    const {
      text,
      image,
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

    const isFeeRequested = hasUpfrontFee === 'yes' || hasUpfrontFee === true ? 1 : 0;
    const userId = req.user ? req.user.id : null;

    // Harmonize title, description, and company name from either new minimal inputs or legacy inputs
    const resolvedDescription = (internshipDescription && String(internshipDescription).trim()) 
      || (text && String(text).trim()) 
      || (image ? 'Visual scan: document/screenshot artifact uploaded for inspection.' : 'Internship verification details');

    const resolvedCompany = (companyName && String(companyName).trim()) || 'Unspecified / From Scan';

    let resolvedTitle = (internshipTitle && String(internshipTitle).trim()) || '';
    if (!resolvedTitle) {
      if (text && String(text).trim()) {
        const firstLine = String(text).trim().split('\n')[0].replace(/^[#*-]\s*/, '').trim();
        resolvedTitle = firstLine.length > 55 ? `${firstLine.slice(0, 52)}...` : firstLine;
      }
      if (!resolvedTitle) {
        resolvedTitle = companyName ? `${String(companyName).trim()} Internship Scan` : (image ? 'Screenshot / Offer Scan' : 'Internship Threat Scan');
      }
    }

    // 1. Call dedicated AI threat analysis service
    const analysisResult = await analyzeInternshipOffer({
      internshipTitle: resolvedTitle,
      companyName: resolvedCompany,
      recruiterEmail,
      companyWebsite,
      internshipDescription: resolvedDescription,
      applicationUrl,
      offeredStipend,
      hasUpfrontFee: isFeeRequested === 1 ? 'yes' : 'no',
      upfrontFeeAmount,
      additionalDetails,
      text: text ? String(text).trim() : undefined,
      image: image || undefined
    });

    // 2. Validate all required AI response fields prior to MySQL persistence
    const isValidAnalysis =
      analysisResult &&
      typeof analysisResult.risk_score === 'number' &&
      analysisResult.risk_score >= 0 &&
      analysisResult.risk_score <= 100 &&
      ['Low', 'Medium', 'High', 'Critical'].includes(analysisResult.risk_level) &&
      Array.isArray(analysisResult.warning_signs) &&
      Array.isArray(analysisResult.positive_indicators) &&
      typeof analysisResult.explanations === 'string' &&
      Array.isArray(analysisResult.recommended_actions) &&
      Array.isArray(analysisResult.limitations);

    if (!isValidAnalysis) {
      throw new Error('AI analysis validation failed: Response does not meet required security schema specifications.');
    }

    // 3. Persist scan into MySQL `internship_scans` using parameterized query
    let scanId = null;
    try {
      const [result] = await pool.execute(
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
          userId,
          resolvedTitle.slice(0, 255),
          resolvedCompany.slice(0, 255),
          recruiterEmail ? String(recruiterEmail).trim().slice(0, 255) : null,
          companyWebsite ? String(companyWebsite).trim().slice(0, 255) : null,
          resolvedDescription.slice(0, 5000),
          applicationUrl ? String(applicationUrl).trim().slice(0, 500) : null,
          offeredStipend ? String(offeredStipend).trim().slice(0, 100) : null,
          isFeeRequested,
          analysisResult.risk_score,
          analysisResult.risk_level, // 'Low', 'Medium', 'High', 'Critical'
          JSON.stringify(analysisResult)
        ]
      );
      scanId = result.insertId;
    } catch (dbErr) {
      console.warn('MySQL Scan Record Insert Skipped (DB offline):', dbErr.message);
    }

    // 4. Return validated analysis to the frontend
    return res.status(201).json({
      success: true,
      message: 'Internship analysis completed successfully.',
      data: {
        ...analysisResult,
        scanId,
        userId
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/scans/history
 * Retrieves scans for current authenticated user only
 */
export async function handleGetScanHistory(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT id, user_id, internship_title, company_name, recruiter_email,
              company_website, stipend, upfront_fee_requested, risk_score,
              risk_level, analysis_json, created_at
       FROM internship_scans
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/scans/:id
 * Retrieves a single scan by ID. Enforces private access ownership.
 */
export async function handleGetScanById(req, res, next) {
  try {
    const scanId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(scanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scan ID parameter.'
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, user_id, internship_title, company_name, recruiter_email,
              company_website, internship_description, application_url, stipend,
              upfront_fee_requested, risk_score, risk_level, analysis_json, created_at
       FROM internship_scans
       WHERE id = ?`,
      [scanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship scan record not found.'
      });
    }

    const scan = rows[0];

    // Ownership check: users must only access their own private scans unless admin
    if (scan.user_id && scan.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view this private scan.'
      });
    }

    let parsedAnalysis = {};
    try {
      parsedAnalysis = typeof scan.analysis_json === 'string' ? JSON.parse(scan.analysis_json) : (scan.analysis_json || {});
    } catch (e) {
      parsedAnalysis = {};
    }

    return res.json({
      success: true,
      data: {
        ...scan,
        analysis: parsedAnalysis,
        ...parsedAnalysis
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/scans/:id
 * Deletes a scan by ID if owned by the requesting user or admin
 */
export async function handleDeleteScan(req, res, next) {
  try {
    const scanId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(scanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scan ID parameter.'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, user_id FROM internship_scans WHERE id = ?',
      [scanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship scan record not found.'
      });
    }

    const scan = rows[0];
    if (scan.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own private scans.'
      });
    }

    await pool.execute('DELETE FROM internship_scans WHERE id = ?', [scanId]);

    return res.json({
      success: true,
      message: 'Internship scan deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}
