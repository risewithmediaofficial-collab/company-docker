import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reason: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

accessRequestSchema.index({ project: 1, status: 1 });
accessRequestSchema.index({ requester: 1 });

const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);
export default AccessRequest;
