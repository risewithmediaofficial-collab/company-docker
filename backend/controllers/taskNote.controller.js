// =============================================
// TASK NOTE CONTROLLER
// Employees create notes → Manager assigns them
// =============================================

import TaskNote from '../models/taskNote.model.js';

// ── Employee: Create a new pending note ──────────────────────────────────────
export const createNote = async (req, res) => {
  try {
    const { title, description, priority, startDate, deadline } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const note = await TaskNote.create({
      organizationId: req.user.organizationId,
      submittedBy: req.user._id,
      title,
      description,
      priority: priority || 'medium',
      startDate: startDate || null,
      deadline: deadline || null,
    });

    const populated = await TaskNote.findById(note._id).populate('submittedBy', 'name email role');
    res.status(201).json({ success: true, note: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Employee: List own notes ──────────────────────────────────────────────────
export const getMyNotes = async (req, res) => {
  try {
    const notes = await TaskNote.find({ submittedBy: req.user._id })
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Employee: Update own pending note (only while still pending) ──────────────
export const updateNote = async (req, res) => {
  try {
    const note = await TaskNote.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const isOwner = note.submittedBy.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (note.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot edit a note that has already been reviewed' });
    }

    const { title, description, priority } = req.body;
    if (title) note.title = title;
    if (description !== undefined) note.description = description;
    if (priority) note.priority = priority;
    await note.save();

    const populated = await TaskNote.findById(note._id)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewedBy', 'name email role');

    res.json({ success: true, note: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Employee: Delete own pending note ────────────────────────────────────────
export const deleteNote = async (req, res) => {
  try {
    const note = await TaskNote.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const isOwner = note.submittedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';
    if (!isOwner && !isSuperAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Manager / SuperAdmin: List all pending notes ──────────────────────────────
export const getAllNotes = async (req, res) => {
  try {
    const filter = { organizationId: req.user.organizationId };
    if (req.query.status) filter.status = req.query.status;

    const notes = await TaskNote.find(filter)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Manager: Assign a note to an employee ────────────────────────────────────
export const assignNote = async (req, res) => {
  try {
    const note = await TaskNote.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const { assignedTo, managerNote, dueDate } = req.body;
    if (!assignedTo) return res.status(400).json({ success: false, message: 'assignedTo is required' });

    note.assignedTo = assignedTo;
    note.managerNote = managerNote || '';
    note.dueDate = dueDate || null;
    note.status = 'assigned';
    note.reviewedBy = req.user._id;
    note.reviewedAt = new Date();
    note.assignedAt = new Date();

    await note.save();

    const populated = await TaskNote.findById(note._id)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewedBy', 'name email role');

    res.json({ success: true, note: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Manager: Dismiss a note ──────────────────────────────────────────────────
export const dismissNote = async (req, res) => {
  try {
    const note = await TaskNote.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.status = 'dismissed';
    note.reviewedBy = req.user._id;
    note.reviewedAt = new Date();
    if (req.body.managerNote) note.managerNote = req.body.managerNote;
    await note.save();

    const populated = await TaskNote.findById(note._id)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewedBy', 'name email role');

    res.json({ success: true, note: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
