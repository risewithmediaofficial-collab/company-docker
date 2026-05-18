// =============================================
// TICKET MODEL - Support Tickets
// =============================================

import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_client', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['bug', 'feature_request', 'billing', 'general', 'technical'],
      default: 'general',
    },
    replies: [replySchema],
    attachments: [{ name: String, url: String }],
    resolvedAt: { type: Date },
    firstResponseAt: { type: Date },
  },
  { timestamps: true }
);

ticketSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

ticketSchema.index({ client: 1 });
ticketSchema.index({ status: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
