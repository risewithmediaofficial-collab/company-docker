import mongoose from 'mongoose';

const clientFollowupSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    type: {
      type: String,
      enum: ['call', 'meeting', 'whatsapp', 'email', 'review', 'other'],
      default: 'call',
    },
    status: {
      type: String,
      enum: ['open', 'completed', 'waiting', 'cancelled'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    contactPerson: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true },
    summary: { type: String, default: '' },
    discussionNotes: { type: String, default: '' },
    outcome: { type: String, default: '' },
    meetingDate: { type: Date },
    nextFollowUpDate: { type: Date },
    nextAction: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

clientFollowupSchema.index({ client: 1, nextFollowUpDate: 1 });
clientFollowupSchema.index({ status: 1 });
clientFollowupSchema.index({ createdBy: 1 });

const ClientFollowup = mongoose.model('ClientFollowup', clientFollowupSchema);
export default ClientFollowup;
