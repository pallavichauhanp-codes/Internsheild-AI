import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL 8 Connection Pool using mysql2/promise
 * Configured via environment variables for security and portability.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'internshield_ai',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true
});

/**
 * Tests the MySQL database connection on startup
 * Logs helpful, actionable diagnostics without terminating the server if MySQL is offline.
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  const dbName = process.env.DB_NAME || 'internshield_ai';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS ping, DATABASE() AS activeDb');
    connection.release();

    console.log(`\n✅ [MySQL] Successfully connected to database "${rows[0]?.activeDb || dbName}" at ${dbHost} as ${dbUser}`);
    return true;
  } catch (err) {
    console.warn(`\n⚠️  [MySQL] Database connection attempt failed: [${err.code || 'ERROR'}] ${err.message}`);

    if (err.code === 'ECONNREFUSED') {
      console.warn('ℹ️  [MySQL Guide] MySQL server is not running on port 3306. Please start your MySQL 8 service or XAMPP.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.warn(`ℹ️  [MySQL Guide] Database "${dbName}" does not exist yet.`);
      console.warn('ℹ️  Run the "database/schema.sql" script in MySQL Workbench to initialize tables.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.warn(`ℹ️  [MySQL Guide] Access denied for user "${dbUser}". Please check DB_USER and DB_PASSWORD in backend/.env.`);
    } else {
      console.warn('ℹ️  Ensure MySQL service is active and backend/.env credentials match your MySQL setup.');
    }

    console.warn('ℹ️  The backend will continue running with graceful fallback handling.\n');
    return false;
  }
}

/**
 * Safe parameterized query execution helper.
 * Enforces parameterization to eliminate SQL injection risks.
 * 
 * @param {string} sql - Parameterized SQL query string (e.g. "SELECT * FROM users WHERE email = ?")
 * @param {Array} params - Array of parameters to bind
 * @returns {Promise<[Array, Object]>} [rows, fields]
 */
export async function executeQuery(sql, params = []) {
  try {
    return await pool.execute(sql, params);
  } catch (err) {
    console.error('MySQL ExecuteQuery Error:', err.message);
    throw err;
  }
}

export default pool;
