// =============================================
// CONTENT ITEM MODEL - Content Monitoring Board
// =============================================

import mongoose from 'mongoose';

const contentItemSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    taskName: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Editing', 'Send to Client', 'Revision Requested', 'Approved', 'Scheduled', 'Posted', 'Done'],
      default: 'Draft',
    },
    datePosted: { type: Date },
    contentUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    approved: { type: Boolean, default: false },
    assignedEditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    platform: {
      type: String,
      enum: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'TikTok', 'YouTube', 'Blog', 'Email', 'Other'],
      default: 'Instagram',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    clientFeedback: { type: String, default: '' },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    thumbnail: { type: String, default: '' },
    contentType: {
      type: String,
      enum: ['Reel', 'Post', 'Story', 'Carousel', 'Video', 'Blog', 'Email', 'Ad', 'Other'],
      default: 'Post',
    },
    revisionCount: { type: Number, default: 0 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

contentItemSchema.index({ client: 1, status: 1 });
contentItemSchema.index({ status: 1 });
contentItemSchema.index({ organizationId: 1 });
contentItemSchema.index({ brandId: 1 });

const ContentItem = mongoose.model('ContentItem', contentItemSchema);
export default ContentItem;
