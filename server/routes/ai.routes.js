import express from 'express';
import { generateContentStrategy } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate-strategy', authorize('superAdmin', 'manager', 'employee'), generateContentStrategy);

export default router;
