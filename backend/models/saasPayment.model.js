// =============================================
// SAAS PAYMENT MODEL — Razorpay & Checkout Logs
// Tracks paid, failed, cancelled, and initiated checkouts
// with payer name and contact number for Super Admin dashboard
// =============================================

import mongoose from 'mongoose';

const saasPaymentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    // Payer & Company snapshot (explicitly stored even on failed payments)
    payerName: { type: String, trim: true, default: '' },
    payerEmail: { type: String, trim: true, lowercase: true, default: '' },
    contactNumber: { type: String, trim: true, default: '' },
    companyName: { type: String, trim: true, default: '' },
    companySlug: { type: String, trim: true, default: '' },

    // Plan & Amount
    planId: { type: String, trim: true, lowercase: true, required: true },
    planName: { type: String, trim: true, default: '' },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    amountPaise: { type: Number, default: 0, min: 0 },
    amountInr: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },

    // Gateway Details
    gateway: {
      type: String,
      enum: ['razorpay', 'sandbox', 'free'],
      default: 'razorpay',
    },
    razorpayOrderId: { type: String, trim: true, default: '', index: true },
    razorpayPaymentId: { type: String, trim: true, default: '', index: true },
    razorpaySignature: { type: String, trim: true, default: '' },

    // Payment Status & Failure Diagnostics
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'cancelled'],
      default: 'created',
      index: true,
    },
    failureCode: { type: String, trim: true, default: '' },
    failureReason: { type: String, trim: true, default: '' },
    failureSource: { type: String, trim: true, default: '' },
    failureStep: { type: String, trim: true, default: '' },
    failureMetadata: { type: mongoose.Schema.Types.Mixed, default: null },
    paidAt: { type: Date },
    failedAt: { type: Date },
  },
  { timestamps: true }
);

saasPaymentSchema.index({ createdAt: -1 });
saasPaymentSchema.index({ status: 1, createdAt: -1 });

const SaasPayment = mongoose.model('SaasPayment', saasPaymentSchema);
export default SaasPayment;
