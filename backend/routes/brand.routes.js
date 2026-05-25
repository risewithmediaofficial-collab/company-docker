import express from 'express';
import { getAssignedBrands, getAllBrands } from '../controllers/brand.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/assigned', getAssignedBrands);
router.get('/all', authorize('superAdmin', 'organizationOwner', 'manager'), getAllBrands);

export default router;
