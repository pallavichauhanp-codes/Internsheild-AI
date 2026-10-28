import pool from '../config/db.js';

export async function handleVerifyDomain(req, res) {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ success: false, message: 'Domain query parameter is required' });
    }

    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();

    // Free public providers are suspicious for official recruiting
    const publicMailProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'protonmail.com'];
    if (publicMailProviders.includes(cleanDomain)) {
      return res.json({
        success: true,
        data: {
          domain: cleanDomain,
          status: 'SUSPICIOUS_PUBLIC_PROVIDER',
          isLegit: false,
          message: 'Free public email domain. Legitimate companies recruit using official corporate domain addresses.'
        }
      });
    }

    // Check MySQL directory if available
    try {
      const [rows] = await pool.query('SELECT * FROM company_directory WHERE domain = ?', [cleanDomain]);
      if (rows && rows.length > 0) {
        return res.json({
          success: true,
          data: {
            domain: cleanDomain,
            status: rows[0].verification_status,
            name: rows[0].name,
            notes: rows[0].notes,
            isLegit: rows[0].verification_status === 'verified_authentic'
          }
        });
      }
    } catch (err) {
      console.warn('MySQL lookup skipped:', err.message);
    }

    // Default response if not indexed
    return res.json({
      success: true,
      data: {
        domain: cleanDomain,
        status: 'UNVERIFIED',
        isLegit: null,
        message: 'Domain not yet verified in directory. Cross-check MCA / LinkedIn corporate registration.'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
