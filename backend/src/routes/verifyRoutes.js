import { Router } from 'express';
import { handleVerifyDomain } from '../controllers/verifyController.js';

const router = Router();

router.get('/domain', handleVerifyDomain);

export default router;
