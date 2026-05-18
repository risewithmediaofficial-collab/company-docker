import express from 'express';
import {
  getReferrals,
  processPayout,
  requestPayout,
  submitReferralLead,
} from '../controllers/referral.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'referral', 'client'), getReferrals);
router.post('/submit', authorize('referral'), submitReferralLead);
router.post('/:id/payout-request', authorize('referral'), requestPayout);
router.post('/:id/process-payout', authorize('superAdmin'), processPayout);

export default router;
