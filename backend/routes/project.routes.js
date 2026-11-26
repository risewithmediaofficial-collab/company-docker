import express from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  getProjectKanban,
  getProjects,
  updateProject,
} from '../controllers/project.controller.js';
import {
  getProjectMonthlyDeliverables,
  saveProjectMonthlyDeliverable,
  batchSaveProjectMonthlyDeliverables,
  deleteProjectMonthlyDeliverable,
  checkTaskDeliverableQuota,
} from '../controllers/projectMonthlyDeliverable.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

const PROJECT_VIEW_ROLES = ['superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager', 'accountManager', 'financeManager', 'client', 'clientAdmin', 'clientMember'];
const PROJECT_STAFF_ROLES = ['superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager', 'accountManager', 'financeManager'];

router.get('/', authorize(...PROJECT_VIEW_ROLES), getProjects);
router.get('/:id', authorize(...PROJECT_VIEW_ROLES), getProject);
router.get('/:id/kanban', authorize(...PROJECT_VIEW_ROLES), getProjectKanban);
router.post('/', authorize('superAdmin', 'admin', 'manager'), createProject);
router.put('/:id', authorize('superAdmin', 'admin', 'manager'), updateProject);
router.delete('/:id', authorize('superAdmin', 'admin', 'manager'), deleteProject);

// Project Monthly Deliverables & Targets
router.get('/:projectId/monthly-deliverables', authorize(...PROJECT_VIEW_ROLES), getProjectMonthlyDeliverables);
router.get('/:projectId/monthly-deliverables/check-quota', authorize(...PROJECT_STAFF_ROLES), checkTaskDeliverableQuota);
router.post('/:projectId/monthly-deliverables', authorize('superAdmin', 'admin', 'manager'), saveProjectMonthlyDeliverable);
router.post('/:projectId/monthly-deliverables/batch', authorize('superAdmin', 'admin', 'manager'), batchSaveProjectMonthlyDeliverables);
router.delete('/:projectId/monthly-deliverables/:targetId', authorize('superAdmin', 'admin', 'manager'), deleteProjectMonthlyDeliverable);

export default router;
