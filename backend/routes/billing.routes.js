import express from 'express';
import {
  getPublicBillingPlans,
  getBillingPlans,
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordRazorpayFailure,
  handleRazorpayWebhook,
} from '../controllers/billing.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public-plans', getPublicBillingPlans);
router.post('/razorpay/webhook', handleRazorpayWebhook);

router.use(protect);

router.get('/plans', getBillingPlans);
router.post('/razorpay/order', authorize('organizationOwner', 'superAdmin', 'admin'), createRazorpayOrder);
router.post('/razorpay/verify', authorize('organizationOwner', 'superAdmin', 'admin'), verifyRazorpayPayment);
router.post('/razorpay/failure', authorize('organizationOwner', 'superAdmin', 'admin'), recordRazorpayFailure);

export default router;
