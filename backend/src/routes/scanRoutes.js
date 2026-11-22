import { Router } from 'express';
import { 
  handleAnalyzeScan, 
  handleGetScanHistory, 
  handleGetScanById, 
  handleDeleteScan 
} from '../controllers/scanController.js';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { validateScanAnalyze } from '../middleware/validateMiddleware.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/scans/analyze (Available to authenticated users and guests)
router.post('/analyze', sensitiveLimiter, optionalAuthenticate, validateScanAnalyze, handleAnalyzeScan);

// GET /api/scans/history (Private to authenticated user)
router.get('/history', authenticate, handleGetScanHistory);

// GET /api/scans/:id (Private scan access verification)
router.get('/:id', authenticate, handleGetScanById);

// DELETE /api/scans/:id (Private scan deletion verification)
router.delete('/:id', authenticate, handleDeleteScan);

export default router;
