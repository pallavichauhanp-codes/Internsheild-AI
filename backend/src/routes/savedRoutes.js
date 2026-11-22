import { Router } from 'express';
import { 
  handleSaveScan, 
  handleUnsaveScan, 
  handleGetSavedScans, 
  handleCheckIsSaved 
} from '../controllers/savedController.js';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/saved (Save a scan)
router.post('/', authenticate, handleSaveScan);

// GET /api/saved (Get all saved scans for current user)
router.get('/', authenticate, handleGetSavedScans);

// GET /api/saved/check/:scanId (Check if scan is saved)
router.get('/check/:scanId', optionalAuthenticate, handleCheckIsSaved);

// DELETE /api/saved/:scanId (Unsave a scan)
router.delete('/:scanId', authenticate, handleUnsaveScan);

// Legacy compat: GET /api/saved/:userId
router.get('/:userId', optionalAuthenticate, handleGetSavedScans);

export default router;
