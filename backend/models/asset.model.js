import mongoose from 'mongoose';

const assetFileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false },
);

const assetSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['logo', 'brand_guideline', 'image', 'video', 'document', 'creative', 'other'],
      default: 'other',
    },
    description: { type: String, default: '' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    tags: [{ type: String }],
    files: { type: [assetFileSchema], default: [] },
    isClientVisible: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

assetSchema.index({ client: 1, category: 1, createdAt: -1 });
assetSchema.index({ project: 1, createdAt: -1 });
assetSchema.index({ organizationId: 1 });
assetSchema.index({ brandId: 1 });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
