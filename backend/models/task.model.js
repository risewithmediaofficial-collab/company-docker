// =============================================
// TASK MODEL - ClickUp-style task management
// =============================================

import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [{ name: String, url: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const progressUpdateSchema = new mongoose.Schema({
  description: { type: String, required: true }, // what work was completed
  hours: { type: Number, default: 0 }, // hours spent on this update
  completedAt: { type: Date, default: Date.now }, // when this progress was logged
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who logged this
  workNotes: { type: String, default: '' },
  attachments: [{ name: String, url: String, type: String, size: Number }],
});

const taskSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    taskCategory: {
      type: String,
      enum: ['content', 'non_content'],
      default: 'content',
    },
    taskType: {
      type: String,
      enum: [
        'task',
        'content',
        'website_content',
        'non_content',
        'reel',
        'poster',
        'video',
        'social_media_post',
        'blog',
        'ad_creative',
        'video_content',
        'story',
        'carousel_post',
        'custom_content',
        'website_development',
        'website_update',
        'landing_page',
        'seo_work',
        'domain_hosting',
        'crm_update',
        'client_support',
        'lead_management',
        'ads_setup',
        'payment_follow_up',
        'report_preparation',
        'custom_task',
      ],
      default: 'task',
    },
    clientName: { type: String, default: '' },
    assignedPersonName: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // for subtasks
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: [
        'todo',
        'in_progress',
        'review',
        'approved',
        'rejected',
        'done',
        'on_process',
        'waiting_for_client',
        'completed',
        'rework',
        'rework_completed',
        'review_required',
      ],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: { type: Date },
    startDate: { type: Date },
    actualStartDate: { type: Date }, // when work actually started
    completedAt: { type: Date },
    deadline: { type: Date },
    estimatedHours: { type: Number, default: 0 },
    loggedHours: { type: Number, default: 0 },
    scriptText: { type: String, default: '' },
    scriptLink: { type: String, default: '' },
    caption: { type: String, default: '' },
    referenceLink: { type: String, default: '' },
    editorGuide: { type: String, default: '' },
    websiteType: { type: String, default: '' },
    websiteRequirements: { type: String, default: '' },
    pagesNeeded: [{ type: String }],
    contentAvailability: {
      type: String,
      enum: ['content_provided', 'need_content_creation', 'partially_provided', ''],
      default: '',
    },
    brandingAvailability: {
      type: String,
      enum: ['logo_available', 'need_logo', 'need_branding', ''],
      default: '',
    },
    domainDetails: { type: String, default: '' },
    hostingDetails: { type: String, default: '' },
    adminCredentials: { type: String, default: '' },
    requiredFeatures: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    clientVisibleNotes: { type: String, default: '' },
    tags: [{ type: String }],
    comments: [commentSchema],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    orderIndex: { type: Number, default: 0 }, // kanban column position
    isRecurring: { type: Boolean, default: false },
    recurringPattern: { type: String }, // daily, weekly, monthly
    approvalRequired: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    isClientVisible: { type: Boolean, default: false },
    clientResponse: {
      type: String,
      enum: ['pending', 'yes', 'no'],
      default: 'pending',
    },
    clientFeedback: { type: String, default: '' },
    clientResponseDate: { type: Date },
    clientResponseBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rework_requested'],
      default: 'pending',
    },
    milestone: { type: mongoose.Schema.Types.ObjectId }, // reference to project milestone id
    timeEntries: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hours: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    completedFiles: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    progressUpdates: [progressUpdateSchema], // track work completion progress
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ parent: 1 });
taskSchema.index({ organizationId: 1 });
taskSchema.index({ brandId: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
