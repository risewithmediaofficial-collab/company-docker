// =============================================
// SPRINT MODEL (Development Module)
// =============================================
import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sprint name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Sprint start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Sprint end date is required'],
    },
    goal: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

sprintSchema.index({ status: 1 });
sprintSchema.index({ project: 1 });
sprintSchema.index({ startDate: 1, endDate: 1 });

const Sprint = mongoose.model('Sprint', sprintSchema);
export default Sprint;
