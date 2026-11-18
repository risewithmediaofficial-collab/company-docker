// =============================================
// BRANCH MODEL — Multi-Tenant Company Branches
// =============================================

import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [120, 'Branch name cannot exceed 120 characters'],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    isHeadquarters: {
      type: Boolean,
      default: false,
    },
    managerName: {
      type: String,
      trim: true,
      default: '',
    },
    managerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    managerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
    },
    operatingHours: {
      type: String,
      trim: true,
      default: '9:30 AM - 6:30 PM',
    },
    workingDays: {
      type: String,
      trim: true,
      default: 'Monday - Saturday',
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    radiusKm: {
      type: Number,
      default: 0.5,
    },
    isActive: {
      type: Boolean,
      default: true,
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

branchSchema.index({ organization: 1, isActive: 1 });
branchSchema.index({ organization: 1, name: 1 });
branchSchema.index({ organization: 1, isHeadquarters: 1 });

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
