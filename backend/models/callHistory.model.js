import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    callDate: { type: Date, required: true },
    callTime: { type: String, default: '' },
    callType: {
      type: String,
      enum: ['Incoming', 'Outgoing', 'Missed', 'WhatsApp Call', 'Google Meet', 'Zoom', 'Direct Meeting'],
      default: 'Outgoing',
    },
    spokenWith: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    callPurpose: {
      type: String,
      enum: ['Payment Follow-up', 'Task Discussion', 'Requirement Collection', 'Approval Follow-up', 'Rework Discussion', 'General Update', 'Complaint', 'Other'],
      default: 'General Update',
    },
    callSummary: { type: String, default: '' },
    clientResponse: { type: String, default: '' },
    nextAction: { type: String, default: '' },
    nextFollowUpDate: { type: Date },
    relatedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    relatedInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    visibleToClient: { type: Boolean, default: false },
    allowAssignedPersonAccess: { type: Boolean, default: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

callHistorySchema.index({ clientId: 1, callDate: -1 });
callHistorySchema.index({ projectId: 1, callDate: -1 });
callHistorySchema.index({ nextFollowUpDate: 1 });
callHistorySchema.index({ organizationId: 1 });

const CallHistory = mongoose.model('CallHistory', callHistorySchema);
export default CallHistory;
