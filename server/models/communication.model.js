import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  attachments: [{ name: String, url: String }],
  isInternalNote: { type: Boolean, default: false }, // If true, invisible to Clients
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
});

const communicationSchema = new mongoose.Schema(
  {
    threadId: { type: String, unique: true },
    subject: { type: String, required: true, trim: true },
    
    // Polymorphic routing map
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
      role: { type: String, enum: ['initiator', 'assignee', 'observer'], default: 'observer' }
    }],
    
    category: {
      type: String,
      enum: ['support', 'project', 'billing', 'general', 'internal', 'approval'],
      default: 'general',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'open', 'pending_client', 'pending_internal', 'resolved', 'closed'],
      default: 'new',
      index: true,
    },
    
    messages: [messageSchema],
    
    // Relational Context
    relatedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    relatedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

communicationSchema.pre('save', async function (next) {
  if (!this.threadId) {
    const count = await mongoose.model('Communication').countDocuments();
    this.threadId = `MSG-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

communicationSchema.index({ subject: 'text' });

const Communication = mongoose.model('Communication', communicationSchema);
export default Communication;
