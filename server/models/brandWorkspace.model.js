// =============================================
// BRAND WORKSPACE MODEL (Client Workspace)
// =============================================

import mongoose from 'mongoose';

const brandWorkspaceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true }, // The brand/client name (e.g. Nike)
    industry: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Internal team assigned to this brand
    clientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // The client's own users
    status: {
      type: String,
      enum: ['active', 'inactive', 'onboarding', 'churned'],
      default: 'active',
    },
    settings: {
      portalEnabled: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: true },
    },
    contractValue: { type: Number, default: 0 },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'one_time'],
      default: 'monthly',
    },
  },
  { timestamps: true }
);

brandWorkspaceSchema.index({ organizationId: 1 });
brandWorkspaceSchema.index({ teamMembers: 1 });
brandWorkspaceSchema.index({ clientUsers: 1 });

const BrandWorkspace = mongoose.model('BrandWorkspace', brandWorkspaceSchema);
export default BrandWorkspace;
