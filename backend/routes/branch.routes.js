// =============================================
// BRANCH ROUTES — Company Branches & Locations
// =============================================

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller.js';

const router = express.Router();

router.use(protect);

// Any authenticated company member can view their branches
router.get('/', getBranches);
router.get('/:id', getBranchById);

// Admin roles can manage branches
router.post('/', authorize('superAdmin', 'organizationOwner', 'admin'), createBranch);
router.put('/:id', authorize('superAdmin', 'organizationOwner', 'admin'), updateBranch);
router.patch('/:id', authorize('superAdmin', 'organizationOwner', 'admin'), updateBranch);
router.delete('/:id', authorize('superAdmin', 'organizationOwner', 'admin'), deleteBranch);

export default router;
