import express from 'express';
import {
  addCallLog,
  createLead,
  deleteLead,
  getLead,
  getLeads,
  getLeadsKanban,
  updateLead,
  updateLeadStage,
} from '../controllers/lead.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/kanban', authorize('superAdmin', 'manager', 'employee', 'referral'), getLeadsKanban);
router.get('/', authorize('superAdmin', 'manager', 'employee', 'referral'), getLeads);
router.get('/:id', authorize('superAdmin', 'manager', 'employee', 'referral'), getLead);
router.post('/', authorize('superAdmin', 'manager', 'employee'), createLead);
router.put('/:id', authorize('superAdmin', 'manager', 'employee'), updateLead);
router.patch('/:id/stage', authorize('superAdmin', 'manager', 'employee'), updateLeadStage);
router.post('/:id/call-log', authorize('superAdmin', 'manager', 'employee'), addCallLog);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteLead);

export default router;
