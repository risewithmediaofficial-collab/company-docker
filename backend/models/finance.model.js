// =============================================
// FINANCE MODEL - Client Payment Tracking
// =============================================

import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    clientName: { type: String, default: '' },
    projectName: { type: String, default: '' },
    serviceName: { type: String, required: true, trim: true },
    
    // Amount fields
    totalProjectAmount: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, required: true, min: 0 },
    totalPaidAmount: { type: Number, default: 0, min: 0 },
    
    // Payment status
    paymentStatus: {
      type: String,
      enum: ['Not Paid', 'Partially Paid', 'Paid', 'Overdue'],
      default: 'Not Paid',
    },
    
    // Payment details
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other'],
      default: 'Other',
    },
    paymentDate: { type: Date },
    paymentDueDate: { type: Date },
    nextFollowUpDate: { type: Date },
    paymentNotesText: { type: String, default: '' },
    allowAssignedPersonAccess: { type: Boolean, default: false },
    
    // Invoice status
    invoiceStatus: {
      type: String,
      enum: ['Draft', 'Sent', 'Viewed', 'Partially Paid', 'Paid', 'Cancelled'],
      default: 'Draft',
    },
    
    // Notes
    paymentNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentNote',
      },
    ],
    
    // Internal follow-up notes (not visible to client)
    internalNotes: [
      {
        followUpNote: { type: String },
        followUpDate: { type: Date },
        nextFollowUpDate: { type: Date },
        spokenWith: { type: String },
        clientResponse: { type: String },
        paymentPromiseDate: { type: Date },
        amountPromised: { type: Number, min: 0 },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Calculate balance before saving
financeSchema.pre('save', function (next) {
  this.balanceAmount = this.totalProjectAmount - this.totalPaidAmount;
  
  // Update payment status based on amount paid
  if (this.balanceAmount === 0) {
    this.paymentStatus = 'Paid';
  } else if (this.totalPaidAmount > 0 && this.balanceAmount > 0) {
    this.paymentStatus = 'Partially Paid';
  } else if (this.totalPaidAmount === 0) {
    this.paymentStatus = 'Not Paid';
  }
  
  // Check if overdue
  if (this.paymentDueDate && new Date() > this.paymentDueDate && this.balanceAmount > 0) {
    this.paymentStatus = 'Overdue';
  }
  
  next();
});

// Indexes
financeSchema.index({ clientId: 1 });
financeSchema.index({ projectId: 1 });
financeSchema.index({ paymentStatus: 1 });
financeSchema.index({ paymentDueDate: 1 });
financeSchema.index({ nextFollowUpDate: 1 });
financeSchema.index({ organizationId: 1 });

const Finance = mongoose.model('Finance', financeSchema);
export default Finance;
