// =============================================
// PROJECT MODEL
// =============================================

import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const projectSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    completedAt: { type: Date },
    budget: { type: Number, default: 0 },
    budgetSpent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    category: {
      type: String,
      enum: ['social_media', 'seo', 'paid_ads', 'web_design', 'web_development', 'video_content', 'content', 'branding', 'video', 'graphic_design', 'mobile_app', 'e_commerce', 'other'],
      default: 'other',
    },
    proposalText: { type: String, default: '' },
    clientDiscussionNotes: { type: String, default: '' }, // Notes about what was discussed with client
    nextMeetupDate: { type: Date }, // Date of next scheduled meetup with client
    tags: [{ type: String }],
    milestones: [milestoneSchema],
    color: { type: String, default: '#6366f1' }, // for visual differentiation
    coverImage: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 }, // calculated field
    revisionCount: { type: Number, default: 0 },
    maxRevisions: { type: Number, default: 3 },
    files: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isTemplate: { type: Boolean, default: false },
    templateName: { type: String },
  },
  { timestamps: true }
);

projectSchema.index({ clientId: 1 });
projectSchema.index({ organizationId: 1 });
projectSchema.index({ brandId: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ status: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
