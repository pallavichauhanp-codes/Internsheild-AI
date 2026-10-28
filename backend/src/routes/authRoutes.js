import { Router } from 'express';
import { handleRegister, handleLogin } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/register
router.post('/register', handleRegister);

// POST /api/auth/login
router.post('/login', handleLogin);

export default router;
