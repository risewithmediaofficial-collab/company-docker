import mongoose from 'mongoose';

const domainProgressSchema = new mongoose.Schema(
  {
    note: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'pending', 'renewed', 'expired'],
      default: 'active',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const domainRenewalSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    itemName: { type: String, required: true, trim: true },
    itemType: {
      type: String,
      enum: ['domain', 'hosting', 'ssl', 'workspace', 'subscription', 'other'],
      default: 'domain',
    },
    domainName: { type: String, default: '', trim: true },
    provider: { type: String, default: '', trim: true },
    purchaseDate: { type: Date, default: null },
    expiryDate: { type: Date, required: true },
    renewalCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'pending', 'renewed', 'expired'],
      default: 'active',
    },
    notes: { type: String, default: '', trim: true },
    progressNotes: [domainProgressSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

domainRenewalSchema.index({ organizationId: 1, expiryDate: 1 });
domainRenewalSchema.index({ organizationId: 1, status: 1 });
domainRenewalSchema.index({ clientId: 1, projectId: 1 });

const DomainRenewal = mongoose.model('DomainRenewal', domainRenewalSchema);

export default DomainRenewal;
