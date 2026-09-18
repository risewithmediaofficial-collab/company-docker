// =============================================
// ORGANIZATION MODEL — SaaS Multi-Tenant
// =============================================

import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    // ── Basic Info ───────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    industry: { type: String, default: '' },
    website: { type: String, default: '' },
    phone: { type: String, default: '' },
    logo: { type: String, default: '' },
    address: { type: String, default: '' },

    // ── SaaS Plan & Status ───────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['trial', 'starter', 'growth', 'pro'],
      default: 'trial',
    },
    planStatus: {
      // pending = registered, not yet approved by super admin
      // active  = approved + using the software
      // suspended = super admin suspended this org
      // expired = trial ended or plan not renewed
      type: String,
      enum: ['pending', 'active', 'suspended', 'expired'],
      default: 'pending',
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    suspendedAt: { type: Date },
    suspendReason: { type: String, default: '' },

    // ── Enabled Modules (super admin controls per org) ───────────────────────
    enabledModules: {
      crm:         { type: Boolean, default: true  }, // always on
      clients:     { type: Boolean, default: true  }, // always on
      projects:    { type: Boolean, default: true  }, // always on
      tasks:       { type: Boolean, default: true  }, // always on
      finance:     { type: Boolean, default: false },
      hr:          { type: Boolean, default: false },
      attendance:  { type: Boolean, default: false },
      smm:         { type: Boolean, default: false },
      portal:      { type: Boolean, default: false }, // client portal
      sop:         { type: Boolean, default: false },
      assets:      { type: Boolean, default: false },
      proposals:   { type: Boolean, default: false },
      reports:     { type: Boolean, default: false },
      automations: { type: Boolean, default: false },
      influencers: { type: Boolean, default: false },
      ai:          { type: Boolean, default: false },
    },

    // ── Usage Limits ─────────────────────────────────────────────────────────
    maxUsers:   { type: Number, default: 3  },
    maxClients: { type: Number, default: 5  },

    // ── Settings ─────────────────────────────────────────────────────────────
    settings: {
      defaultCurrency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },

    // ── Super Admin Notes (internal) ─────────────────────────────────────────
    adminNotes: { type: String, default: '' },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

organizationSchema.index({ planStatus: 1 });
organizationSchema.index({ plan: 1 });
organizationSchema.index({ slug: 1 });
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ ownerId: 1 });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;

