import pool from '../config/db.js';

/**
 * Bookmark an internship scan for a user
 */
export async function handleSaveScan(req, res) {
  try {
    const { userId, scanId } = req.body;

    if (!userId || !scanId) {
      return res.status(400).json({
        success: false,
        message: 'userId and scanId are required.'
      });
    }

    try {
      const [result] = await pool.execute(
        'INSERT INTO saved_internships (user_id, scan_id) VALUES (?, ?)',
        [parseInt(userId, 10), parseInt(scanId, 10)]
      );

      return res.status(201).json({
        success: true,
        message: 'Internship scan bookmarked successfully.',
        savedId: result.insertId
      });
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'You have already saved this internship scan.'
        });
      }
      console.warn('MySQL Save Scan Skipped:', dbErr.message);
      return res.status(201).json({
        success: true,
        message: 'Scan saved in demo mode.',
        mock: true
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Retrieve saved internships for a specific user
 */
export async function handleGetSavedScans(req, res) {
  try {
    const { userId } = req.params;

    try {
      const [rows] = await pool.execute(
        `SELECT s.id AS saved_id, s.created_at AS saved_at,
                i.id AS scan_id, i.internship_title, i.company_name, i.risk_score, i.risk_level, i.created_at AS scanned_at
         FROM saved_internships s
         JOIN internship_scans i ON s.scan_id = i.id
         WHERE s.user_id = ?
         ORDER BY s.created_at DESC`,
        [parseInt(userId, 10)]
      );

      return res.json({ success: true, data: rows });
    } catch (dbErr) {
      console.warn('MySQL Get Saved Scans Skipped:', dbErr.message);
      return res.json({ success: true, data: [], mock: true });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
