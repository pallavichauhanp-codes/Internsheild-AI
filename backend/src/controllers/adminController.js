import pool from '../config/db.js';

/**
 * GET /api/admin/stats
 * Platform-wide security analytics for administrators and charts
 */
export async function handleGetAdminStats(req, res, next) {
  try {
    // 1. Total registered accounts
    const [userCountRow] = await pool.query('SELECT COUNT(*) as total FROM users');
    
    // 2. Total scans processed
    const [scanCountRow] = await pool.query('SELECT COUNT(*) as total FROM internship_scans');

    // 3. Community reports count
    const [reportCountRow] = await pool.query('SELECT COUNT(*) as total FROM community_reports');

    // 4. Pending moderation review count
    const [pendingCountRow] = await pool.query(
      "SELECT COUNT(*) as total FROM community_reports WHERE status = 'pending'"
    );

    // 5. Under review count
    const [underReviewCountRow] = await pool.query(
      "SELECT COUNT(*) as total FROM community_reports WHERE status = 'under_review'"
    );

    // 6. Confirmed/Verified scams count
    const [verifiedCountRow] = await pool.query(
      "SELECT COUNT(*) as total FROM community_reports WHERE status = 'verified_scam'"
    );

    // 7. Rejected / False alarm count
    const [rejectedCountRow] = await pool.query(
      "SELECT COUNT(*) as total FROM community_reports WHERE status = 'rejected'"
    );

    // 8. Threat level distribution for charts
    const [riskRows] = await pool.query(
      'SELECT risk_level, COUNT(*) as count FROM internship_scans GROUP BY risk_level'
    );

    const riskDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const r of riskRows) {
      if (riskDistribution[r.risk_level] !== undefined) {
        riskDistribution[r.risk_level] = Number(r.count);
      }
    }

    return res.json({
      success: true,
      data: {
        totalUsers: userCountRow[0]?.total || 0,
        totalScans: scanCountRow[0]?.total || 0,
        totalReports: reportCountRow[0]?.total || 0,
        pendingReview: pendingCountRow[0]?.total || 0,
        underReview: underReviewCountRow[0]?.total || 0,
        verifiedScams: verifiedCountRow[0]?.total || 0,
        rejectedReports: rejectedCountRow[0]?.total || 0,
        riskDistribution
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports
 * Retrieves all community reports for moderation review (including pending, under review, and rejected)
 */
export async function handleGetAdminReports(req, res, next) {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT r.id, r.user_id, r.company_name, r.internship_title, r.description,
             r.evidence_reference, r.status, r.created_at, r.updated_at,
             u.name as reporter_name, u.email as reporter_email
      FROM community_reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      query += ' AND (r.company_name LIKE ? OR r.internship_title LIKE ? OR r.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.execute(query, params);

    return res.json({
      success: true,
      count: rows.length,
      data: rows.map(r => ({
        ...r,
        isVerified: r.status === 'verified_scam',
        reviewStatusLabel: 
          r.status === 'verified_scam' ? 'Verified Scam' :
          r.status === 'under_review' ? 'Under Review' :
          r.status === 'pending' ? 'Pending Review' : 'Rejected'
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id/status
 * Updates the verification status of a community report.
 * Only security administrators can execute this endpoint.
 */
export async function handleUpdateReportStatus(req, res, next) {
  try {
    const reportId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const allowed = ['pending', 'under_review', 'verified_scam', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`
      });
    }

    if (isNaN(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }

    const [existing] = await pool.execute(
      'SELECT id, company_name, status FROM community_reports WHERE id = ?',
      [reportId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    await pool.execute(
      'UPDATE community_reports SET status = ? WHERE id = ?',
      [status, reportId]
    );

    return res.json({
      success: true,
      message: `Report #${reportId} status successfully updated to "${status}".`,
      data: {
        id: reportId,
        companyName: existing[0].company_name,
        previousStatus: existing[0].status,
        newStatus: status
      }
    });
  } catch (err) {
    next(err);
  }
}
