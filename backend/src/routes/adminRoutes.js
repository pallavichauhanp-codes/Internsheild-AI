import { Router } from 'express';
import { 
  handleGetAdminStats, 
  handleGetAdminReports, 
  handleUpdateReportStatus 
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import { validateAdminReportStatus } from '../middleware/validateMiddleware.js';

const router = Router();

// Enforce both authentication & administrator clearance on all admin routes
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', handleGetAdminStats);

// GET /api/admin/reports
router.get('/reports', handleGetAdminReports);

// PATCH /api/admin/reports/:id/status
router.patch('/reports/:id/status', validateAdminReportStatus, handleUpdateReportStatus);

export default router;
