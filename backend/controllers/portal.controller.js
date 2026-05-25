// =============================================
// PORTAL CONTROLLER - Client Portal API
// =============================================

import Client from '../models/client.model.js';
import ContentItem from '../models/contentItem.model.js';
import ReportingEntry from '../models/reportingEntry.model.js';
import Task from '../models/task.model.js';
import Invoice from '../models/invoice.model.js';
import Project from '../models/project.model.js';
import { withWorkspaceScope } from '../middleware/auth.middleware.js';
import Notification from '../models/notification.model.js';

// Helper: get client from logged-in user
const getClientFromUser = async (userId) => {
  const client = await Client.findOne({ userId }).populate('assignedManager', 'name email avatar');
  return client;
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const getPortalDashboard = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req);
    
    const [
      totalContent,
      pendingApproval,
      approvedContent,
      doneContent,
      activeProjects,
      openInvoices,
      recentContent,
    ] = await Promise.all([
      ContentItem.countDocuments(scope),
      ContentItem.countDocuments({ ...scope, status: 'Send to Client', approved: false }),
      ContentItem.countDocuments({ ...scope, approved: true }),
      ContentItem.countDocuments({ ...scope, status: 'Done' }),
      Project.find({ ...scope, status: { $in: ['active', 'in_progress'] } }).select('name status progress dueDate'),
      Invoice.find({ ...scope, status: { $in: ['sent', 'overdue'] } }).select('invoiceNumber total dueDate status').sort({ dueDate: 1 }).limit(5),
      ContentItem.find(scope).sort({ updatedAt: -1 }).limit(10).populate('assignedEditor', 'name avatar'),
    ]);

    // Status breakdown for chart
    const statusBreakdown = await ContentItem.aggregate([
      { $match: scope },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalContent,
        pendingApproval,
        approvedContent,
        doneContent,
        activeProjects: activeProjects.length,
        openInvoices: openInvoices.length,
      },
      activeProjects,
      openInvoices,
      recentContent,
      statusBreakdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CONTENT ITEMS ─────────────────────────────────────────────────────────────

export const getContentItems = async (req, res) => {
  try {
    const { status, view, search, platform, priority, page = 1, limit = 50 } = req.query;

    let filter = withWorkspaceScope(req);

    if (view === 'review') {
      filter.status = 'Send to Client';
      filter.approved = false;
    } else if (view === 'done') {
      filter.status = 'Done';
    } else if (status) {
      filter.status = status;
    }

    if (platform) filter.platform = platform;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { taskName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      ContentItem.find(filter)
        .populate('assignedEditor', 'name avatar')
        .populate('approvedBy', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ContentItem.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContentItem = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });

    const item = await ContentItem.findOne(scope)
      .populate('assignedEditor', 'name avatar email')
      .populate('approvedBy', 'name');

    if (!item) return res.status(404).json({ success: false, message: 'Content item not found' });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveContentItem = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });
    const item = await ContentItem.findOne(scope);
    if (!item) return res.status(404).json({ success: false, message: 'Content item not found' });

    item.approved = true;
    item.status = 'Approved';
    item.approvedBy = req.user._id;
    item.approvedAt = new Date();
    item.clientFeedback = req.body.feedback || '';
    await item.save();

    try {
      await Notification.create({
        user: item.assignedEditor,
        title: 'Content Approved',
        message: `"${item.taskName}" has been approved by the client.`,
        type: 'success',
        link: `/tasks`,
      });
    } catch (_) {}

    res.json({ success: true, item, message: 'Content approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestRevision = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });
    const item = await ContentItem.findOne(scope);
    if (!item) return res.status(404).json({ success: false, message: 'Content item not found' });

    item.status = 'Revision Requested';
    item.approved = false;
    item.clientFeedback = req.body.feedback || '';
    item.revisionCount = (item.revisionCount || 0) + 1;
    await item.save();

    try {
      await Notification.create({
        user: item.assignedEditor,
        title: 'Revision Requested',
        message: `"${item.taskName}" needs revision. Feedback: ${req.body.feedback || 'No feedback provided'}`,
        type: 'warning',
        link: `/tasks`,
      });
    } catch (_) {}

    res.json({ success: true, item, message: 'Revision requested successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addContentFeedback = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });
    const item = await ContentItem.findOne(scope);
    if (!item) return res.status(404).json({ success: false, message: 'Content item not found' });

    item.clientFeedback = req.body.feedback;
    await item.save();

    res.json({ success: true, item, message: 'Feedback added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REPORTING ─────────────────────────────────────────────────────────────────

export const getReportingData = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear().toString();
    const scope = withWorkspaceScope(req, { month: { $regex: `^${targetYear}` } });

    const entries = await ReportingEntry.find(scope).sort({ month: 1 });

    const totals = entries.reduce(
      (acc, e) => ({
        adSpend: acc.adSpend + e.adSpend,
        optIns: acc.optIns + e.optIns,
        callsBooked: acc.callsBooked + e.callsBooked,
        newClients: acc.newClients + e.newClients,
        cashCollected: acc.cashCollected + e.cashCollected,
        totalRevenue: acc.totalRevenue + e.totalRevenue,
      }),
      { adSpend: 0, optIns: 0, callsBooked: 0, newClients: 0, cashCollected: 0, totalRevenue: 0 }
    );

    const latest = entries[entries.length - 1];
    const previous = entries[entries.length - 2];
    let growth = {};
    if (latest && previous) {
      const calc = (curr, prev) => prev > 0 ? (((curr - prev) / prev) * 100).toFixed(1) : 0;
      growth = {
        adSpend: calc(latest.adSpend, previous.adSpend),
        optIns: calc(latest.optIns, previous.optIns),
        callsBooked: calc(latest.callsBooked, previous.callsBooked),
        newClients: calc(latest.newClients, previous.newClients),
        cashCollected: calc(latest.cashCollected, previous.cashCollected),
        totalRevenue: calc(latest.totalRevenue, previous.totalRevenue),
      };
    }

    res.json({ success: true, entries, totals, growth, latestMonth: latest || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Manage Content Items ─────────────────────────────────────────────

export const createContentItem = async (req, res) => {
  try {
    const item = await ContentItem.create({
      ...req.body,
      assignedEditor: req.user._id,
      approved: false,
    });

    const populated = await item.populate('assignedEditor', 'name avatar');
    res.status(201).json({ success: true, item: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContentItem = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });
    const item = await ContentItem.findOneAndUpdate(scope, req.body, { new: true })
      .populate('assignedEditor', 'name avatar');
    if (!item) return res.status(404).json({ success: false, message: 'Content item not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteContentItem = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });
    await ContentItem.findOneAndDelete(scope);
    res.json({ success: true, message: 'Content item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Manage Reporting Entries ─────────────────────────────────────────

export const createReportingEntry = async (req, res) => {
  try {
    const entry = await ReportingEntry.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReportingEntry = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });
    const entry = await ReportingEntry.findOneAndUpdate(scope, req.body, { new: true });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReportingEntry = async (req, res) => {
  try {
    const scope = withWorkspaceScope(req, { _id: req.params.id });
    await ReportingEntry.findOneAndDelete(scope);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CLIENT INVOICES ──────────────────────────────────────────────────────────

export const getClientInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find(withWorkspaceScope(req))
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CLIENT PROJECTS ──────────────────────────────────────────────────────────

export const getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find(withWorkspaceScope(req))
      .populate('assignedTeam', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
