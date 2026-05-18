// =============================================
// LEAD MODEL - CRM Pipeline
// =============================================

import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
  calledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  duration: { type: Number, default: 0 }, // in seconds
  notes: { type: String },
  outcome: { type: String, enum: ['no_answer', 'callback', 'interested', 'not_interested', 'converted'] },
  calledAt: { type: Date, default: Date.now },
});

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'note', 'status_change', 'assignment', 'whatsapp', 'meeting', 'proposal'],
  },
  description: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    website: { type: String, trim: true },
    source: {
      type: String,
      enum: ['website', 'referral', 'social_media', 'cold_call', 'email_campaign', 'walk_in', 'other'],
      default: 'other',
    },
    stage: {
      type: String,
      enum: ['new', 'qualified', 'meeting_booked', 'proposal_sent', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    value: { type: Number, default: 0 }, // estimated deal value
    currency: { type: String, default: 'USD' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }],
    notes: { type: String },
    followUpDate: { type: Date },
    lastContactDate: { type: Date },
    proposalUrl: { type: String },
    meetingDate: { type: Date },
    lostReason: { type: String },
    callLogs: [callLogSchema],
    activities: [activitySchema],
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // referral partner
    convertedToClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    isConverted: { type: Boolean, default: false },
    stageOrder: { type: Number, default: 0 }, // for kanban ordering
  },
  { timestamps: true }
);

leadSchema.index({ stage: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
