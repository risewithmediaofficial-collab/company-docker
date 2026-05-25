// =============================================
// INVOICE MODEL - Finance Module
// =============================================

import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number }, // computed: quantity * unitPrice
});

const invoiceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    invoiceNumber: { type: String, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    lineItems: [lineItemSchema],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 }, // percentage
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paidDate: { type: Date },
    paidAmount: { type: Number, default: 0 },
    paymentMethod: { type: String },
    paymentReference: { type: String },
    notes: { type: String },
    terms: { type: String, default: 'Payment due within 30 days' },
    pdfUrl: { type: String },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  // Compute line item totals
  this.lineItems = this.lineItems.map((item) => ({
    ...item.toObject(),
    total: item.quantity * item.unitPrice,
  }));
  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.total = this.subtotal + this.taxAmount - this.discount;
  next();
});

invoiceSchema.index({ client: 1 });
invoiceSchema.index({ organizationId: 1 });
invoiceSchema.index({ brandId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
