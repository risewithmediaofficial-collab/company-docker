// =============================================
// SMM CLIENT BUDGET MODEL (Decoupled Client Ad Budget Ledger)
// =============================================
import mongoose from 'mongoose';

// Sub-schema for individual deposit entries
const depositEntrySchema = new mongoose.Schema(
  {
    fromDate: {
      type: Date,
    },
    toDate: {
      type: Date,
    },
    depositDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const smmBudgetSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    clientName: {
      type: String,
      trim: true,
      default: '',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    // Overall Monthly Budget Period
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    // Keep date as the fromDate for backward compatibility & sorting
    date: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: String,
      trim: true,
      default: '',
    },
    monthlyBudget: {
      type: Number,
      required: true,
      default: 0,
    },
    // Multiple deposit entries (each can have fromDate, toDate, depositDate, amount, notes)
    deposits: {
      type: [depositEntrySchema],
      default: [],
    },
    // Computed totals (denormalized for fast queries and aggregations)
    amountDeposited: {
      type: Number,
      default: 0, // sum of all deposit amounts
    },
    balance: {
      type: Number,
      default: 0, // monthlyBudget - amountDeposited
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

smmBudgetSchema.index({ client: 1 });
smmBudgetSchema.index({ date: -1 });
smmBudgetSchema.index({ fromDate: -1 });
smmBudgetSchema.index({ companyName: 'text', clientName: 'text' });

const SmmBudget = mongoose.model('SmmBudget', smmBudgetSchema);
export default SmmBudget;
