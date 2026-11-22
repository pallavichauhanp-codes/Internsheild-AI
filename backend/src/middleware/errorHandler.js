/**
 * Centralized Error Handling Middleware for InternShield AI
 * Handles database errors, syntax exceptions, and operational errors cleanly.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[Error] [${req.method} ${req.originalUrl}]:`, err.message);

  // MySQL Duplicate Entry (e.g. unique email or unique bookmark)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record with these unique details already exists.',
      error: process.env.NODE_ENV === 'development' ? err.sqlMessage : undefined
    });
  }

  // MySQL Database unreachable / offline
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unreachable. Please ensure MySQL is running.',
      code: 'DB_UNAVAILABLE'
    });
  }

  // MySQL Bad DB or table missing
  if (err.code === 'ER_BAD_DB_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({
      success: false,
      message: 'Database tables not yet initialized. Please run database/schema.sql in MySQL Workbench.',
      code: 'SCHEMA_NOT_INITIALIZED'
    });
  }

  // JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload provided.'
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
