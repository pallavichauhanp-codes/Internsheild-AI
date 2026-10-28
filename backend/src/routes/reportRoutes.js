import { Router } from 'express';
import { handleCreateReport, handleGetReports } from '../controllers/reportController.js';

const router = Router();

router.post('/', handleCreateReport);
router.get('/', handleGetReports);

export default router;
