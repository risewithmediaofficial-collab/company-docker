// =============================================
// PORTAL ROUTES - Client Portal API
// =============================================

import express from 'express';
import {
  getPortalDashboard,
  getContentItems,
  getContentItem,
  approveContentItem,
  requestRevision,
  addContentFeedback,
  getReportingData,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  createReportingEntry,
  updateReportingEntry,
  deleteReportingEntry,
  getClientFinanceOverview,
  getClientInvoices,
  getClientProjects,
  getClientTasks,
  getClientAdBudget,
  submitClientOnboarding,
  getClientOnboarding,
} from '../controllers/portal.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// ─── CLIENT ROUTES ────────────────────────────────────────────────────────────
const CLIENT_ROLES = ['client', 'clientAdmin', 'clientMember'];
const STAFF_EDIT_ROLES = ['superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager'];

router.get('/dashboard', authorize(...CLIENT_ROLES), getPortalDashboard);
router.get('/content', authorize(...CLIENT_ROLES), getContentItems);
router.get('/content/:id', authorize(...CLIENT_ROLES), getContentItem);
router.post('/content/:id/approve', authorize(...CLIENT_ROLES), approveContentItem);
router.post('/content/:id/revision', authorize(...CLIENT_ROLES), requestRevision);
router.post('/content/:id/feedback', authorize(...CLIENT_ROLES), addContentFeedback);
router.get('/reporting', authorize(...CLIENT_ROLES, 'superAdmin', 'manager'), getReportingData);
router.get('/finance', authorize(...CLIENT_ROLES), getClientFinanceOverview);
router.get('/invoices', authorize(...CLIENT_ROLES), getClientInvoices);
router.get('/projects', authorize(...CLIENT_ROLES), getClientProjects);
router.get('/tasks', authorize(...CLIENT_ROLES), getClientTasks);
router.get('/budget', authorize(...CLIENT_ROLES), getClientAdBudget);
router.post('/onboarding', authorize(...CLIENT_ROLES), submitClientOnboarding);
router.get('/onboarding', authorize(...CLIENT_ROLES, 'superAdmin', 'admin', 'manager'), getClientOnboarding);

// ─── ADMIN / MANAGER ROUTES ──────────────────────────────────────────────────
router.post('/content', authorize(...STAFF_EDIT_ROLES), createContentItem);
router.put('/content/:id', authorize(...STAFF_EDIT_ROLES), updateContentItem);
router.delete('/content/:id', authorize('superAdmin', 'manager'), deleteContentItem);

router.post('/reporting', authorize('superAdmin', 'manager'), createReportingEntry);
router.put('/reporting/:id', authorize('superAdmin', 'manager'), updateReportingEntry);
router.delete('/reporting/:id', authorize('superAdmin', 'manager'), deleteReportingEntry);

export default router;
