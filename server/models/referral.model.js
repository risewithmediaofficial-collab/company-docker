// =============================================
// REFERRAL MODEL
// =============================================

import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    referrer: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'referrerModel' },
    referrerModel: { type: String, required: true, enum: ['User', 'Client'] },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    referralCode: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'qualified', 'converted', 'rejected'],
      default: 'pending',
    },
    commissionType: {
      type: String,
      enum: ['percentage', 'monthly'],
      default: 'percentage'
    },
    commissionRate: { type: Number, default: 10 }, // percentage %
    commissionAmount: { type: Number, default: 0 }, // one-time flat / calc
    monthlyAmount: { type: Number, default: 0 }, // for monthly recurring
    dealValue: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    payoutRequest: {
      requestedAt: Date,
      method: String,
      accountDetails: String,
      status: { type: String, enum: ['pending', 'processing', 'paid', 'rejected'], default: 'pending' },
    },
    notes: { type: String },
  },
  { timestamps: true }
);

referralSchema.index({ referrer: 1 });
referralSchema.index({ referralCode: 1 });

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
