// =============================================
// PAYMENT NOTE MODEL - Individual Payment Records
// =============================================

import mongoose from 'mongoose';

const paymentNoteSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    financeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Finance', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    
    // Payment details
    noteTitle: { type: String, required: true, trim: true },
    noteDescription: { type: String },
    amountPaid: { type: Number, required: true, min: 0 },
    
    // Payment mode
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other'],
      default: 'Other',
    },
    
    paymentDate: { type: Date, required: true },
    balanceAfterPayment: { type: Number, required: true, min: 0 },
    nextFollowUpDate: { type: Date },
    
    // Visibility
    visibleToClient: { type: Boolean, default: false },
    
    // Audit
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes
paymentNoteSchema.index({ financeId: 1 });
paymentNoteSchema.index({ clientId: 1 });
paymentNoteSchema.index({ projectId: 1 });
paymentNoteSchema.index({ paymentDate: -1 });
paymentNoteSchema.index({ organizationId: 1 });

const PaymentNote = mongoose.model('PaymentNote', paymentNoteSchema);
export default PaymentNote;
