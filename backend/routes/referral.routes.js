import express from 'express';
import {
  createReferral,
  deleteReferral,
  getReferralAnalytics,
  getReferralByClient,
  getReferrals,
  processPayout,
  requestPayout,
  submitReferralLead,
  updateReferral,
} from '../controllers/referral.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'referral', 'client'), getReferrals);
router.get('/analytics', authorize('superAdmin', 'manager', 'employee'), getReferralAnalytics);
router.get('/client/:clientId', authorize('superAdmin', 'manager', 'employee', 'client'), getReferralByClient);
router.post('/', authorize('superAdmin', 'manager', 'employee'), createReferral);
router.put('/:id', authorize('superAdmin', 'manager', 'employee'), updateReferral);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteReferral);
router.post('/submit', authorize('referral'), submitReferralLead);
router.post('/:id/payout-request', authorize('referral'), requestPayout);
router.post('/:id/process-payout', authorize('superAdmin'), processPayout);

export default router;
