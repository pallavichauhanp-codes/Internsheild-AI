import { Router } from 'express';
import { handleGetDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/dashboard/stats (Protected: authenticated student)
router.get('/stats', authenticate, handleGetDashboardStats);

export default router;
