// =============================================
// RELEASE MODEL (Development Module)
// =============================================
import mongoose from 'mongoose';

const releaseSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: [true, 'Release version is required (e.g. v2.4.1)'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Release name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'staging',
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'deployed', 'failed'],
      default: 'planned',
    },
    commit: {
      type: String,
      default: '',
      trim: true,
    },
    deployedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deploymentDate: {
      type: Date,
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

releaseSchema.index({ version: 1 });
releaseSchema.index({ status: 1 });
releaseSchema.index({ environment: 1 });

const Release = mongoose.model('Release', releaseSchema);
export default Release;
