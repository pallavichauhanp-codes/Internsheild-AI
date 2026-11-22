import { Router } from 'express';
import { 
  handleRegister, 
  handleLogin, 
  handleLogout, 
  handleGetMe 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validateMiddleware.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/auth/register
router.post('/register', sensitiveLimiter, validateRegister, handleRegister);

// POST /api/auth/login
router.post('/login', sensitiveLimiter, validateLogin, handleLogin);

// POST /api/auth/logout
router.post('/logout', handleLogout);

// GET /api/auth/me
router.get('/me', authenticate, handleGetMe);

export default router;
