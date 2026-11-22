import pool from '../config/db.js';

/**
 * POST /api/saved
 * Bookmark an internship scan for the authenticated user
 */
export async function handleSaveScan(req, res, next) {
  try {
    const userId = req.user ? req.user.id : parseInt(req.body.userId, 10);
    const scanId = parseInt(req.body.scanId, 10);

    if (!userId || isNaN(scanId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID and scan ID are required.'
      });
    }

    // Verify the scan exists
    const [scanRows] = await pool.execute('SELECT id FROM internship_scans WHERE id = ?', [scanId]);
    if (scanRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship scan record not found.'
      });
    }

    try {
      const [result] = await pool.execute(
        'INSERT INTO saved_internships (user_id, scan_id) VALUES (?, ?)',
        [userId, scanId]
      );

      return res.status(201).json({
        success: true,
        message: 'Internship scan bookmarked successfully.',
        data: {
          savedId: result.insertId,
          scanId,
          userId
        }
      });
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY' || String(dbErr.message).includes('UNIQUE constraint')) {
        return res.status(409).json({
          success: false,
          message: 'You have already bookmarked this internship scan.'
        });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/saved/:scanId
 * Removes a bookmark for the authenticated user
 */
export async function handleUnsaveScan(req, res, next) {
  try {
    const userId = req.user ? req.user.id : parseInt(req.query.userId || req.body.userId, 10);
    const scanId = parseInt(req.params.scanId, 10);

    if (!userId || isNaN(scanId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID and scan ID are required.'
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM saved_internships WHERE user_id = ? AND scan_id = ?',
      [userId, scanId]
    );

    return res.json({
      success: true,
      message: 'Internship scan bookmark removed.',
      data: {
        scanId,
        userId,
        affectedRows: result.affectedRows || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/saved
 * Retrieves all saved scans for the authenticated user with full details
 */
export async function handleGetSavedScans(req, res, next) {
  try {
    const userId = req.user ? req.user.id : parseInt(req.params.userId || req.query.userId, 10);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required to retrieve saved scans.'
      });
    }

    const [rows] = await pool.execute(
      `SELECT s.id AS saved_id, s.created_at AS saved_at,
              i.id AS scan_id, i.internship_title, i.company_name, i.recruiter_email,
              i.company_website, i.stipend, i.upfront_fee_requested, i.risk_score,
              i.risk_level, i.analysis_json, i.created_at AS scanned_at
       FROM saved_internships s
       JOIN internship_scans i ON s.scan_id = i.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
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
 * GET /api/saved/check/:scanId
 * Checks whether a scan is bookmarked by the current user
 */
export async function handleCheckIsSaved(req, res, next) {
  try {
    const userId = req.user ? req.user.id : parseInt(req.query.userId, 10);
    const scanId = parseInt(req.params.scanId, 10);

    if (!userId || isNaN(scanId)) {
      return res.json({ success: true, isSaved: false });
    }

    const [rows] = await pool.execute(
      'SELECT id FROM saved_internships WHERE user_id = ? AND scan_id = ?',
      [userId, scanId]
    );

    return res.json({
      success: true,
      isSaved: rows.length > 0
    });
  } catch (err) {
    next(err);
  }
}
