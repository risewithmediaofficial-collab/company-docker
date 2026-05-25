import mongoose from 'mongoose';

const automationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    trigger: { type: String, required: true, trim: true, index: true },
    action: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true, index: true },
    schedule: {
      frequency: { type: String, enum: ['manual', 'daily', 'weekly', 'monthly'], default: 'manual' },
      time: { type: String, default: '' },
    },
    conditions: [{ field: String, operator: String, value: String }],
    lastRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

automationSchema.index({ name: 'text', description: 'text' });

const Automation = mongoose.model('Automation', automationSchema);
export default Automation;
