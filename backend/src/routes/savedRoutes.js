import { Router } from 'express';
import { handleSaveScan, handleGetSavedScans } from '../controllers/savedController.js';

const router = Router();

// POST /api/saved
router.post('/', handleSaveScan);

// GET /api/saved/:userId
router.get('/:userId', handleGetSavedScans);

export default router;
