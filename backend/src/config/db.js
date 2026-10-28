import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'internshield_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to test database connectivity without terminating the process
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [MySQL] Successfully connected to database:', process.env.DB_NAME || 'internshield_db');
    connection.release();
    return true;
  } catch (err) {
    console.warn('⚠️  [MySQL] Database connection failed:', err.message);
    console.warn('ℹ️  Please ensure MySQL service is running and credentials in .env are correct.');
    return false;
  }
}

export default pool;
