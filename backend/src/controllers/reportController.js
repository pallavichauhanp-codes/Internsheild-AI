import pool from '../config/db.js';

/**
 * Creates a new community scam report in MySQL community_reports table
 */
export async function handleCreateReport(req, res) {
  try {
    const {
      userId = null,
      companyName,
      internshipTitle,
      description,
      evidenceReference,
      status = 'pending'
    } = req.body;

    if (!companyName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Company name and fraud description are required fields.'
      });
    }

    try {
      // Safe parameterized query
      const [result] = await pool.execute(
        `INSERT INTO community_reports 
        (user_id, company_name, internship_title, description, evidence_reference, status) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId ? parseInt(userId, 10) : null,
          companyName.trim(),
          internshipTitle ? internshipTitle.trim() : null,
          description.trim(),
          evidenceReference ? evidenceReference.trim() : null,
          status
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Thank you for protecting fellow students!',
        reportId: result.insertId
      });
    } catch (dbErr) {
      console.warn('DB write skipped:', dbErr.message);
      return res.status(201).json({
        success: true,
        message: 'Report recorded (demo mode). Set up MySQL connection to persist data.',
        mock: true
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Retrieves community reports from MySQL community_reports table
 */
export async function handleGetReports(req, res) {
  try {
    try {
      const [rows] = await pool.query(
        'SELECT id, user_id, company_name, internship_title, description, evidence_reference, status, created_at, updated_at FROM community_reports ORDER BY created_at DESC LIMIT 50'
      );
      return res.json({ success: true, data: rows });
    } catch (dbErr) {
      console.warn('DB query skipped:', dbErr.message);
      // Fallback sample reports for UI testing when MySQL is not yet configured
      return res.json({
        success: true,
        demoMode: true,
        data: [
          {
            id: 1,
            company_name: 'Apex Cloud Tech Solutions',
            internship_title: 'React Developer Intern',
            description: 'Recruiter contacted via WhatsApp pretending to be HR. Asked for ₹2,499 for security deposit before sending offer letter.',
            evidence_reference: 'Fake offer PDF on unverified letterhead',
            status: 'verified_scam',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            company_name: 'NextGen Task Freelance',
            internship_title: 'Data Reviewer',
            description: 'Offered ₹1,500/day for review tasks in Telegram group. Demanded ₹5,000 recharge to unlock withdrawal.',
            evidence_reference: 'Telegram group chat export',
            status: 'verified_scam',
            created_at: new Date().toISOString()
          }
        ]
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
