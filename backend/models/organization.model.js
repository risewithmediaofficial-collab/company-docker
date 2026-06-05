// =============================================
// ORGANIZATION MODEL
// =============================================

import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'pro',
    },
    industry: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    settings: {
      defaultCurrency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'UTC' },
    },
  },
  { timestamps: true }
);

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
