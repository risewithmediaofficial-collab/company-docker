// =============================================
// DEPARTMENT MODEL
// =============================================

import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

departmentSchema.index({ organizationId: 1 });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
