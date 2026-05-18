// =============================================
// JOB POSTING MODEL - HR Module
// =============================================

import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  stage: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
    default: 'applied',
  },
  interviewDate: { type: Date },
  notes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  appliedAt: { type: Date, default: Date.now },
});

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String },
    location: { type: String, default: 'Remote' },
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship'],
      default: 'full_time',
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    applicants: [applicantSchema],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    closingDate: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
