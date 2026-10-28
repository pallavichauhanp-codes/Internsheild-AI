import { Router } from 'express';
import { handleAnalyzeScan } from '../controllers/scanController.js';

const router = Router();

// POST /api/scans/analyze
router.post('/analyze', handleAnalyzeScan);

export default router;
