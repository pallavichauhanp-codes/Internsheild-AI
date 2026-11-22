import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { generateToken, COOKIE_OPTIONS } from '../middleware/authMiddleware.js';

/**
 * POST /api/auth/register
 * Registers a new user, hashes password with bcrypt, generates JWT, and sets HttpOnly cookie
 */
export async function handleRegister(req, res, next) {
  try {
    const { name, email, password, role = 'student' } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    // 1. Check if user already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // 2. Hash password with bcrypt (Cost: 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert into MySQL `users` table with parameterized query
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash, assignedRole]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole
    };

    // 4. Generate JWT & set HttpOnly cookie
    const token = generateToken(newUser);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: newUser,
      token // also return in JSON for mobile or non-browser clients
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials, generates JWT, and sets secure HttpOnly cookie
 */
export async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Retrieve user by email
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const user = rows[0];

    // 2. Compare password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const authenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // 3. Generate JWT & set HttpOnly cookie
    const token = generateToken(authenticatedUser);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: 'Authentication successful.',
      data: authenticatedUser,
      token
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Clears authentication HttpOnly cookie
 */
export function handleLogout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile
 */
export function handleGetMe(req, res) {
  return res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.created_at
    }
  });
}
