import { Router } from 'express';
import { 
  handleCreateReport, 
  handleGetReports, 
  handleGetReportById, 
  handleUpdateReport, 
  handleDeleteReport 
} from '../controllers/reportController.js';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { validateReportCreate } from '../middleware/validateMiddleware.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/reports
router.post('/', sensitiveLimiter, optionalAuthenticate, validateReportCreate, handleCreateReport);

// GET /api/reports
router.get('/', handleGetReports);

// GET /api/reports/:id
router.get('/:id', handleGetReportById);

// PATCH /api/reports/:id (Protected: author or admin)
router.patch('/:id', authenticate, handleUpdateReport);

// DELETE /api/reports/:id (Protected: author or admin)
router.delete('/:id', authenticate, handleDeleteReport);

export default router;
