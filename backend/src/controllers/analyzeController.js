import { analyzeInternshipScam } from '../services/aiService.js';
import pool from '../config/db.js';

export async function handleAnalyze(req, res) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 10 characters of job description or offer text.'
      });
    }

    const report = await analyzeInternshipScam(text);

    // Optional logging to MySQL if database is connected
    try {
      await pool.query(
        'INSERT INTO analysis_logs (input_text, risk_score, risk_level, red_flags, ai_recommendation) VALUES (?, ?, ?, ?, ?)',
        [
          text.slice(0, 1000),
          report.riskScore,
          report.riskLevel,
          JSON.stringify(report.redFlags || []),
          report.recommendation || ''
        ]
      );
    } catch (dbErr) {
      // Non-blocking log failure
      console.warn('DB log skipped:', dbErr.message);
    }

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Analysis controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze text',
      error: error.message
    });
  }
}
