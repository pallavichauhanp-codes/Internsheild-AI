import pool from '../config/db.js';

export async function handleCreateReport(req, res) {
  try {
    const {
      companyName,
      recruiterContact,
      platformSource,
      fraudType,
      description,
      requestedAmount,
      evidenceLink,
      reporterEmail
    } = req.body;

    if (!companyName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Company name and fraud description are required fields.'
      });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO scam_reports 
        (company_name, recruiter_contact, platform_source, fraud_type, description, requested_amount, evidence_link, reporter_email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyName,
          recruiterContact || '',
          platformSource || 'Other',
          fraudType || 'Registration Fee',
          description,
          parseFloat(requestedAmount) || 0.0,
          evidenceLink || '',
          reporterEmail || ''
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Thank you for protecting fellow students!',
        reportId: result.insertId
      });
    } catch (dbErr) {
      console.warn('DB write skipped:', dbErr.message);
      // Mock success response for hackathon demo when MySQL is not running yet
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

export async function handleGetReports(req, res) {
  try {
    try {
      const [rows] = await pool.query('SELECT * FROM scam_reports ORDER BY created_at DESC LIMIT 50');
      return res.json({ success: true, data: rows });
    } catch (dbErr) {
      console.warn('DB query skipped:', dbErr.message);
      // Fallback sample reports for UI testing
      return res.json({
        success: true,
        demoMode: true,
        data: [
          {
            id: 1,
            company_name: 'Apex Global Tech Solutions',
            platform_source: 'Telegram',
            fraud_type: 'Registration Fee',
            description: 'Demanded ₹2,500 security deposit for training kit before issuing offer letter.',
            requested_amount: '2500.00',
            status: 'verified_scam',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            company_name: 'CloudScale Softlabs',
            platform_source: 'WhatsApp',
            fraud_type: 'Fake Task / Investment',
            description: 'Offered ₹1,000/day for review tasks, then asked for ₹5,000 recharge to withdraw earnings.',
            requested_amount: '5000.00',
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
