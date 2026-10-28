import { Router } from 'express';
import { handleAnalyze } from '../controllers/analyzeController.js';

const router = Router();

router.post('/', handleAnalyze);

export default router;
