// =============================================
// PLATFORM ROUTES — Super Admin Only
// =============================================

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getPlatformStats,
  getAllOrganizations,
  getOrganizationDetail,
  approveOrganization,
  updateOrganizationPlan,
  suspendOrganization,
  reactivateOrganization,
  rejectOrganization,
  toggleModule,
  getMyOrganization,
} from '../controllers/platform.controller.js';

const router = express.Router();

// All platform routes require auth
router.use(protect);

// ── My Organization (any logged-in user can get their own org info) ───────────
router.get('/my-organization', getMyOrganization);

// ── All routes below are superAdmin only ─────────────────────────────────────
router.use(authorize('superAdmin'));

// Stats overview
router.get('/stats', getPlatformStats);

// Organization CRUD
router.get('/organizations', getAllOrganizations);
router.get('/organizations/:id', getOrganizationDetail);

// Actions
router.put('/organizations/:id/approve', approveOrganization);
router.put('/organizations/:id/plan', updateOrganizationPlan);
router.put('/organizations/:id/suspend', suspendOrganization);
router.put('/organizations/:id/reactivate', reactivateOrganization);
router.delete('/organizations/:id', rejectOrganization);

// Module toggle
router.put('/organizations/:id/modules/:moduleName', toggleModule);

export default router;
