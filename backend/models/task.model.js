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
});

const taskSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    taskType: {
      type: String,
      enum: ['task', 'reel', 'poster', 'video', 'content', 'website_content', 'non_content'],
      default: 'task',
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // for subtasks
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'approved', 'rejected', 'done'],
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
    estimatedHours: { type: Number, default: 0 },
    loggedHours: { type: Number, default: 0 },
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
    milestone: { type: mongoose.Schema.Types.ObjectId }, // reference to project milestone id
    timeEntries: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hours: Number,
        description: String,
        date: { type: Date, default: Date.now },
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
