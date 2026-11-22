import pool from '../config/db.js';

/**
 * GET /api/dashboard/stats
 * Retrieves personalized security metrics and scan timeline for authenticated student
 */
export async function handleGetDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Total Scans Conducted by user
    const [scansCountRow] = await pool.execute(
      'SELECT COUNT(*) as total FROM internship_scans WHERE user_id = ?',
      [userId]
    );

    // 2. High / Critical Threats Evaded by user
    const [threatsEvadedRow] = await pool.execute(
      "SELECT COUNT(*) as total FROM internship_scans WHERE user_id = ? AND risk_level IN ('High', 'Critical')",
      [userId]
    );

    // 3. User Risk Distribution for Charts
    const [userRiskRows] = await pool.execute(
      'SELECT risk_level, COUNT(*) as count FROM internship_scans WHERE user_id = ? GROUP BY risk_level',
      [userId]
    );

    // 4. Community Reports Submitted by user
    const [reportsCountRow] = await pool.execute(
      'SELECT COUNT(*) as total FROM community_reports WHERE user_id = ?',
      [userId]
    );

    // 5. Saved Bookmarks Count by user
    const [savedCountRow] = await pool.execute(
      'SELECT COUNT(*) as total FROM saved_internships WHERE user_id = ?',
      [userId]
    );

    // 6. Recent Scans by user (Top 8)
    const [recentScans] = await pool.execute(
      `SELECT id, internship_title, company_name, recruiter_email, company_website,
              stipend, risk_score, risk_level, analysis_json, created_at
       FROM internship_scans
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 8`,
      [userId]
    );

    // 7. Platform-Wide Analytics for Comparison & Charting
    const [platformScansRow] = await pool.query('SELECT COUNT(*) as total FROM internship_scans');
    const [platformReportsRow] = await pool.query('SELECT COUNT(*) as total FROM community_reports');
    const [platformVerifiedScamsRow] = await pool.query("SELECT COUNT(*) as total FROM community_reports WHERE status = 'verified_scam'");
    const [platformRiskDistribution] = await pool.query(
      'SELECT risk_level, COUNT(*) as count FROM internship_scans GROUP BY risk_level'
    );

    const totalScans = scansCountRow[0]?.total || 0;
    const scamsEvaded = threatsEvadedRow[0]?.total || 0;
    const reportsSubmitted = reportsCountRow[0]?.total || 0;
    const savedBookmarks = savedCountRow[0]?.total || 0;

    // Build normalized risk map: { Low: 0, Medium: 0, High: 0, Critical: 0 }
    const riskMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const r of userRiskRows) {
      if (riskMap[r.risk_level] !== undefined) {
        riskMap[r.risk_level] = Number(r.count);
      }
    }

    const platformRiskMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const r of platformRiskDistribution) {
      if (platformRiskMap[r.risk_level] !== undefined) {
        platformRiskMap[r.risk_level] = Number(r.count);
      }
    }

    // Estimated fraud loss prevented (assuming average ₹2,500 per scam evaded)
    const estimatedSavedRupees = scamsEvaded * 2500;

    return res.json({
      success: true,
      data: {
        userId,
        totalScans,
        scamsEvaded,
        reportsSubmitted,
        savedBookmarks,
        estimatedLossPrevented: `₹${estimatedSavedRupees.toLocaleString('en-IN')}`,
        safetyIndex: totalScans > 0 ? Math.round(((totalScans - scamsEvaded) / totalScans) * 100) : 100,
        riskBreakdown: riskMap,
        recentScans,
        platformSummary: {
          totalScans: platformScansRow[0]?.total || 0,
          totalReports: platformReportsRow[0]?.total || 0,
          verifiedScams: platformVerifiedScamsRow[0]?.total || 0,
          riskDistribution: platformRiskMap
        }
      }
    });
  } catch (err) {
    next(err);
  }
}
