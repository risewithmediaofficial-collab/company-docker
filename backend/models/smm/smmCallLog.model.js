// =============================================
// SMM CALL LOG MODEL
// =============================================
import mongoose from 'mongoose';

const smmCallLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String, default: '', trim: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String, default: '', trim: true },
    callDate: { type: Date, required: true, default: Date.now },
    callTime: { type: String, default: '' },
    callType: {
      type: String,
      enum: ['Outgoing', 'Incoming', 'WhatsApp Call', 'Google Meet', 'Zoom', 'Direct Meeting'],
      default: 'Outgoing',
    },
    callPurpose: {
      type: String,
      enum: [
        'Strategy & Planning',
        'Performance Review',
        'Content / Creative Approval',
        'Lead Discussion',
        'Monthly Review',
        'Issue / Escalation',
        'General Update',
        'Other',
      ],
      default: 'General Update',
    },
    status: {
      type: String,
      enum: ['Connected', 'Follow-up Needed', 'Scheduled', 'No Answer / Busy', 'Completed', 'Cancelled'],
      default: 'Connected',
    },
    spokenWith: { type: String, default: '', trim: true },
    contactNumber: { type: String, default: '', trim: true },
    duration: { type: String, default: '' },
    notes: { type: String, required: true },
    nextAction: { type: String, default: '' },
    nextFollowUpDate: { type: Date },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

smmCallLogSchema.index({ clientId: 1, callDate: -1 });
smmCallLogSchema.index({ projectId: 1, callDate: -1 });
smmCallLogSchema.index({ status: 1 });
smmCallLogSchema.index({ loggedBy: 1 });
smmCallLogSchema.index({ nextFollowUpDate: 1 });

const SmmCallLog = mongoose.model('SmmCallLog', smmCallLogSchema);
export default SmmCallLog;
