import pool from '../config/db.js';

/**
 * POST /api/reports
 * Creates a new community scam report.
 * Public and student submissions are strictly initialized with status 'pending'.
 */
export async function handleCreateReport(req, res, next) {
  try {
    const {
      companyName,
      internshipTitle,
      description,
      evidenceReference
    } = req.body;

    if (!companyName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Company name and fraud description are required.'
      });
    }

    // Use authenticated user ID if logged in, otherwise null for anonymous
    const userId = req.user ? req.user.id : null;
    const initialStatus = 'pending'; // Enforce pending status for student submissions

    const [result] = await pool.execute(
      `INSERT INTO community_reports 
      (user_id, company_name, internship_title, description, evidence_reference, status) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        companyName.trim(),
        internshipTitle ? internshipTitle.trim() : null,
        description.trim(),
        evidenceReference ? evidenceReference.trim() : null,
        initialStatus
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Scam report submitted successfully and placed in moderation review queue.',
      data: {
        id: result.insertId,
        companyName: companyName.trim(),
        internshipTitle: internshipTitle ? internshipTitle.trim() : null,
        status: initialStatus,
        isVerified: false,
        reviewStatusLabel: 'Pending Moderation Review'
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports
 * Retrieves community reports with search, filter, and pagination.
 * Excludes rejected reports from public feed by default.
 */
export async function handleGetReports(req, res, next) {
  try {
    const { status, search, page = 1, limit = 6 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 6));
    const offset = (pageNum - 1) * limitNum;

    let baseFilter = ' WHERE 1=1';
    const params = [];

    // Filter by specific review status
    if (status && status !== 'all') {
      baseFilter += ' AND r.status = ?';
      params.push(status);
    } else {
      // Don't show rejected reports on public feed
      baseFilter += " AND r.status != 'rejected'";
    }

    // Search query on company, role, or description
    if (search && search.trim()) {
      baseFilter += ' AND (r.company_name LIKE ? OR r.internship_title LIKE ? OR r.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // Count total matching records for pagination
    const countSql = `SELECT COUNT(*) as total FROM community_reports r ${baseFilter}`;
    const [countRows] = await pool.execute(countSql, params);
    const totalRecords = countRows[0]?.total || 0;

    // Fetch paginated results
    const dataSql = `
      SELECT r.id, r.user_id, r.company_name, r.internship_title, r.description,
             r.evidence_reference, r.status, r.created_at, r.updated_at,
             u.name as reporter_name
      FROM community_reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${baseFilter}
      ORDER BY r.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const [rows] = await pool.execute(dataSql, params);

    // Format review status metadata on each report
    const formattedReports = rows.map(r => ({
      ...r,
      isVerified: r.status === 'verified_scam',
      reviewStatusLabel: 
        r.status === 'verified_scam' ? 'Verified Scam' :
        r.status === 'under_review' ? 'Under SecOps Review' :
        r.status === 'pending' ? 'Unreviewed Allegation' : 'Rejected'
    }));

    return res.json({
      success: true,
      count: formattedReports.length,
      total: totalRecords,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum) || 1,
      data: formattedReports
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/:id
 * Retrieves a single report by ID with full review audit info
 */
export async function handleGetReportById(req, res, next) {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (isNaN(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }

    const [rows] = await pool.execute(
      `SELECT r.id, r.user_id, r.company_name, r.internship_title, r.description,
              r.evidence_reference, r.status, r.created_at, r.updated_at,
              u.name as reporter_name, u.email as reporter_email
       FROM community_reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reportId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scam report not found.' });
    }

    const report = rows[0];
    const isVerified = report.status === 'verified_scam';

    return res.json({
      success: true,
      data: {
        ...report,
        isVerified,
        reviewStatusLabel: 
          report.status === 'verified_scam' ? 'Verified Scam (Confirmed by Security Operations)' :
          report.status === 'under_review' ? 'Under Active Investigation by SecOps' :
          report.status === 'pending' ? 'Pending Moderation (Unreviewed Allegation)' : 'Dismissed / Rejected',
        verificationNotice: isVerified 
          ? 'Confirmed Fraud: This entity has been reviewed and verified as a fraudulent recruitment scheme by authorized security moderators.'
          : 'Community Allegation Notice: This report represents an unverified user submission. It has not been verified by administrators and should be treated as an allegation.'
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/reports/:id
 * Updates report details. Only report owner or admin can edit.
 * Public/students cannot change status to 'verified_scam'.
 */
export async function handleUpdateReport(req, res, next) {
  try {
    const reportId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, user_id, status FROM community_reports WHERE id = ?',
      [reportId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scam report not found.' });
    }

    const report = rows[0];

    // Authorization: author or admin only
    if (report.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update reports you authored.'
      });
    }

    const { companyName, internshipTitle, description, evidenceReference, status } = req.body;

    // Security Rule: Public/student users cannot mark reports as verified
    if (status && status !== report.status && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only security administrators can modify report verification status.'
      });
    }

    const updates = [];
    const params = [];

    if (companyName) {
      updates.push('company_name = ?');
      params.push(companyName.trim());
    }
    if (internshipTitle !== undefined) {
      updates.push('internship_title = ?');
      params.push(internshipTitle ? internshipTitle.trim() : null);
    }
    if (description) {
      updates.push('description = ?');
      params.push(description.trim());
    }
    if (evidenceReference !== undefined) {
      updates.push('evidence_reference = ?');
      params.push(evidenceReference ? evidenceReference.trim() : null);
    }
    if (status && userRole === 'admin') {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid update fields provided.'
      });
    }

    params.push(reportId);
    await pool.execute(
      `UPDATE community_reports SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return res.json({
      success: true,
      message: 'Scam report updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/reports/:id
 * Deletes a report. Authorized for author or admin only.
 */
export async function handleDeleteReport(req, res, next) {
  try {
    const reportId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, user_id FROM community_reports WHERE id = ?',
      [reportId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scam report not found.' });
    }

    const report = rows[0];
    if (report.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete reports you authored.'
      });
    }

    await pool.execute('DELETE FROM community_reports WHERE id = ?', [reportId]);

    return res.json({
      success: true,
      message: 'Scam report deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}
