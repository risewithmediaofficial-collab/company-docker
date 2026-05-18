// =============================================
// REPORTING ENTRY MODEL - AF Reporting Board
// =============================================

import mongoose from 'mongoose';

const reportingEntrySchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    month: {
      type: String, // e.g. "2025-01" (YYYY-MM)
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    adSpend: { type: Number, default: 0, min: 0 },
    optIns: { type: Number, default: 0, min: 0 },
    callsBooked: { type: Number, default: 0, min: 0 },
    newClients: { type: Number, default: 0, min: 0 },
    cashCollected: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reportingEntrySchema.index({ client: 1, month: 1 });
reportingEntrySchema.index({ organizationId: 1 });
reportingEntrySchema.index({ brandId: 1 });

const ReportingEntry = mongoose.model('ReportingEntry', reportingEntrySchema);
export default ReportingEntry;
