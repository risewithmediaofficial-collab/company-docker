import express from 'express';
import {
  getPublicBillingPlans,
  getBillingPlans,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/billing.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public-plans', getPublicBillingPlans);

router.use(protect);

router.get('/plans', getBillingPlans);
router.post('/razorpay/order', authorize('organizationOwner', 'superAdmin', 'admin'), createRazorpayOrder);
router.post('/razorpay/verify', authorize('organizationOwner', 'superAdmin', 'admin'), verifyRazorpayPayment);

export default router;
