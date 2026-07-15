// =============================================
// TASK NOTE MODEL - Project briefs & pending task notes
// SuperAdmin posts briefs → Manager reads & assigns tasks
// =============================================

import mongoose from 'mongoose';

const taskNoteSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

    // Who wrote the note
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // Lifecycle status
    status: {
      type: String,
      enum: ['pending', 'assigned', 'dismissed'],
      default: 'pending',
    },

    // Manager who reviewed / acted on it
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },

    // After manager assigns
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },

    // Optional manager note / instructions back to employee
    managerNote: { type: String, default: '' },

    // Due date suggested by manager when assigning
    dueDate: { type: Date },

    // Project brief fields (set by SuperAdmin)
    startDate: { type: Date },
    deadline: { type: Date },
  },
  { timestamps: true }
);

taskNoteSchema.index({ submittedBy: 1, status: 1 });
taskNoteSchema.index({ status: 1 });
taskNoteSchema.index({ organizationId: 1 });

const TaskNote = mongoose.model('TaskNote', taskNoteSchema);
export default TaskNote;
