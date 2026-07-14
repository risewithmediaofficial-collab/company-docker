// =============================================
// PAYMENT REQUEST MODEL
// ─────────────────────────────────────────────
// Temporary QR-based manual payment system.
// When Razorpay Live Mode is restored:
//   1. Uncomment the Razorpay routes/controller.
//   2. Remove/disable the QR payment flow.
//   This model can be kept for payment history.
// =============================================

import mongoose from 'mongoose';

const PLANS = ['Starter', 'Basic', 'Professional', 'Premium', 'Enterprise'];

const PAYMENT_METHODS = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer', 'Other'];

const paymentRequestSchema = new mongoose.Schema(
  {
    // ─── User Identity ───────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },

    // ─── Plan Selection ─────────────────────────────────────
    selectedPlan: {
      type: String,
      required: true,
      enum: PLANS,
    },
    // Admin may approve a different plan than requested
    approvedPlan: {
      type: String,
      enum: PLANS,
    },

    // ─── Payment Details ────────────────────────────────────
    amountPaid: { type: Number, required: true, min: 0 },
    transactionId: { type: String, required: true, trim: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: PAYMENT_METHODS,
    },
    paymentDate: { type: Date, required: true },
    screenshot: { type: String, default: '' }, // URL to uploaded screenshot

    // ─── Status & Admin ─────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },

    // ─── Activation Dates ───────────────────────────────────
    approvedAt: { type: Date },
    expiryDate: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ─── Subscription Duration (in months) ──────────────────
    subscriptionDuration: { type: Number, default: 1 }, // months
  },
  { timestamps: true }
);

paymentRequestSchema.index({ userId: 1, status: 1 });
paymentRequestSchema.index({ status: 1, createdAt: -1 });
paymentRequestSchema.index({ createdAt: -1 });

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);
export default PaymentRequest;
