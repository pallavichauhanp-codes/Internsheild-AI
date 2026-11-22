import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'internshield_dev_secret_key_jwt_2026_super_secure';

/**
 * Cookie options configured for development and production environments
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Generates signed JWT token for authenticated user
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Authentication middleware: verifies HttpOnly cookie or Authorization Bearer header
 * Attaches verified user to `req.user`
 */
export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.token;

    // Fallback: check Authorization Bearer header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication session. Please sign in again.'
      });
    }
    next(err);
  }
}

/**
 * Optional authentication middleware:
 * Attaches user to `req.user` if authenticated, but allows anonymous requests to proceed.
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await pool.execute(
          'SELECT id, name, email, role FROM users WHERE id = ?',
          [decoded.id]
        );
        if (rows.length > 0) {
          req.user = rows[0];
        }
      } catch (e) {
        // Token invalid/expired - proceed as guest
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Authorization middleware: restricts route to users with 'admin' role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Security Administrator clearance required.'
    });
  }
  next();
}
