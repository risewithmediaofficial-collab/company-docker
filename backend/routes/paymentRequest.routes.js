// =============================================
// PAYMENT REQUEST ROUTES
// ─────────────────────────────────────────────
// QR-based manual payment verification system.
//
// RAZORPAY RESTORATION GUIDE:
//   When Razorpay is ready, create a new file
//   razorpay.routes.js and register it alongside
//   these routes. No changes needed here.
// =============================================

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  submitPaymentRequest,
  getUserPaymentRequests,
  getAllPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
} from '../controllers/paymentRequest.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ─── User Routes ─────────────────────────────────────────────────────────────
// POST /api/payment-requests         → submit a new payment request
// GET  /api/payment-requests/user    → get current user's payment history
router.post('/', submitPaymentRequest);
router.get('/user', getUserPaymentRequests);

// ─── Admin Routes ────────────────────────────────────────────────────────────
// GET /api/payment-requests/admin            → get all requests (superAdmin)
// PUT /api/payment-requests/:id/approve      → approve a request (superAdmin)
// PUT /api/payment-requests/:id/reject       → reject a request (superAdmin)
router.get('/admin', authorize('superAdmin'), getAllPaymentRequests);
router.put('/:id/approve', authorize('superAdmin'), approvePaymentRequest);
router.put('/:id/reject', authorize('superAdmin'), rejectPaymentRequest);

export default router;
