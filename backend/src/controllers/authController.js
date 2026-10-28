import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

/**
 * Register a new user in MySQL users table.
 * Uses bcrypt to salt and hash passwords; never stores plaintext passwords.
 */
export async function handleRegister(req, res) {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    try {
      // Check if email already registered
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [cleanEmail]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      // Hash password using bcrypt (Cost Factor: 10)
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Parameterized INSERT
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name.trim(), cleanEmail, passwordHash, assignedRole]
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: {
          id: result.insertId,
          name: name.trim(),
          email: cleanEmail,
          role: assignedRole
        }
      });
    } catch (dbErr) {
      console.warn('MySQL User Registration Skipped (DB offline):', dbErr.message);
      // Demo fallback response when MySQL is not yet configured
      return res.status(201).json({
        success: true,
        message: 'Registration simulated (demo mode). Please run database/schema.sql in MySQL Workbench to persist.',
        data: {
          id: Date.now(),
          name: name.trim(),
          email: cleanEmail,
          role: assignedRole,
          isDemo: true
        }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to server error.',
      error: err.message
    });
  }
}

/**
 * Login user by verifying bcrypt password hash
 */
export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      // Parameterized query to retrieve user
      const [rows] = await pool.execute(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
        [cleanEmail]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const user = rows[0];

      // Compare password against bcrypt hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      return res.json({
        success: true,
        message: 'Login successful.',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (dbErr) {
      console.warn('MySQL Login Skipped (DB offline):', dbErr.message);
      // Demo fallback for test users
      return res.json({
        success: true,
        message: 'Login simulated (demo mode).',
        data: {
          id: 1,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: cleanEmail.includes('admin') ? 'admin' : 'student',
          isDemo: true
        }
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed due to server error.',
      error: err.message
    });
  }
}
