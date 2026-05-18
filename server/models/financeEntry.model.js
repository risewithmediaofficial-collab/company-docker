import mongoose from 'mongoose';

const financeEntrySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Income', 'Expense'], required: true, index: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now, index: true },
    paymentMethod: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Completed', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

financeEntrySchema.index({ category: 1 });
financeEntrySchema.index({ createdAt: -1 });

const FinanceEntry = mongoose.model('FinanceEntry', financeEntrySchema);
export default FinanceEntry;
