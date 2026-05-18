// =============================================
// LEAD CONTROLLER - CRM Module
// =============================================

import Lead from '../models/lead.model.js';
import Referral from '../models/referral.model.js';
import { createNotification } from '../utils/notification.js';
import { runAutomation } from '../services/automation.service.js';
import { createActivityLog } from '../utils/activity.js';

const sourceMap = {
  Website: 'website',
  Referral: 'referral',
  'Cold Call': 'cold_call',
  Email: 'email_campaign',
  'Social Media': 'social_media',
  Event: 'other',
  Other: 'other',
};

const sourceLabels = {
  website: 'Website',
  referral: 'Referral',
  social_media: 'Social Media',
  cold_call: 'Cold Call',
  email_campaign: 'Email',
  walk_in: 'Walk In',
  other: 'Other',
};

const stageMap = {
  New: 'new',
  Contacted: 'qualified',
  Qualified: 'qualified',
  Proposal: 'proposal_sent',
  Negotiation: 'negotiation',
  Won: 'won',
  Lost: 'lost',
};

const stageLabels = {
  new: 'New',
  qualified: 'Qualified',
  meeting_booked: 'Meeting Booked',
  proposal_sent: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

const normalizeLeadPayload = (body = {}) => {
  const payload = { ...body };

  if (payload.source) payload.source = sourceMap[payload.source] || payload.source;
  if (payload.status) {
    payload.stage = stageMap[payload.status] || payload.status;
    delete payload.status;
  }
  if (payload.budget !== undefined) {
    payload.value = Number(payload.budget) || 0;
    delete payload.budget;
  }
  if (payload.expectedCloseDate) {
    payload.followUpDate = payload.expectedCloseDate;
    delete payload.expectedCloseDate;
  }
  if (payload.priority && !['low', 'medium', 'high', 'urgent'].includes(payload.priority)) {
    payload.priority = 'medium';
  }

  return payload;
};

const serializeLead = (lead) => {
  const item = lead?.toObject ? lead.toObject() : lead;
  if (!item) return null;

  return {
    ...item,
    status: stageLabels[item.stage] || item.stage,
    budget: item.value,
    expectedCloseDate: item.followUpDate,
    source: sourceLabels[item.source] || item.source,
  };
};

const assertLeadAccess = (req, lead) => {
  if (!lead) return { allowed: false, status: 404, message: 'Lead not found' };
  if (['superAdmin', 'manager'].includes(req.user.role)) return { allowed: true };
  if (req.user.role === 'employee' && lead.assignedTo?.toString() === req.user._id.toString()) return { allowed: true };
  if (req.user.role === 'referral' && lead.referredBy?.toString() === req.user._id.toString()) return { allowed: true };
  return { allowed: false, status: 403, message: 'Access denied' };
};

const buildScopedLeadFilter = (req, filter = {}) => {
  if (req.user.role === 'employee') {
    filter.assignedTo = req.user._id;
  }
  if (req.user.role === 'referral') {
    filter.referredBy = req.user._id;
  }
  return filter;
};

// @desc   Get all leads (with filters, search, pagination)
// @route  GET /api/leads
export const getLeads = async (req, res) => {
  try {
    const { stage, priority, assignedTo, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (stage) filter.stage = stageMap[stage] || stage;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const scopedFilter = buildScopedLeadFilter(req, filter);
    const total = await Lead.countDocuments(scopedFilter);
    const leads = await Lead.find(scopedFilter)
      .populate('assignedTo', 'name email avatar')
      .populate('convertedToClient', 'name company')
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      leads: leads.map(serializeLead),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get leads grouped by stage (for Kanban)
// @route  GET /api/leads/kanban
export const getLeadsKanban = async (req, res) => {
  try {
    const stages = ['new', 'qualified', 'meeting_booked', 'proposal_sent', 'negotiation', 'won', 'lost'];
    const filter = buildScopedLeadFilter(req, {});

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name avatar')
      .sort({ stageOrder: 1, updatedAt: -1, createdAt: -1 });

    const kanban = {};
    stages.forEach((stage) => { kanban[stage] = []; });
    leads.forEach((lead) => {
      if (kanban[lead.stage]) kanban[lead.stage].push(serializeLead(lead));
    });

    res.json({ success: true, kanban });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single lead
// @route  GET /api/leads/:id
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('activities.performedBy', 'name avatar')
      .populate('callLogs.calledBy', 'name avatar')
      .populate('convertedToClient', 'name company')
      .populate('referredBy', 'name email referralCode');

    const access = assertLeadAccess(req, lead);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    res.json({ success: true, lead: serializeLead(lead) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create lead
// @route  POST /api/leads
export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create(normalizeLeadPayload(req.body));

    lead.activities.push({
      type: 'note',
      description: 'Lead created',
      performedBy: req.user._id,
    });
    await lead.save();

    await runAutomation('lead_created', { lead, user: req.user, io: req.app.get('io') });

    if (lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: lead.assignedTo,
        sender: req.user._id,
        type: 'lead_assigned',
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${lead.name}`,
        link: '/crm/leads',
      }, req.app.get('io'));
    }

    await createActivityLog({
      actor: req.user,
      action: 'lead.created',
      entityType: 'lead',
      entityId: lead._id,
      title: 'Lead created',
      description: `${lead.name} was created.`,
      metadata: { stage: lead.stage, source: lead.source },
    });

    const populated = await Lead.findById(lead._id).populate('assignedTo', 'name email avatar');
    res.status(201).json({ success: true, lead: serializeLead(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc   Update lead
// @route  PUT /api/leads/:id
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    const access = assertLeadAccess(req, lead);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const prevStage = lead.stage;
    const prevAssignedTo = lead.assignedTo?.toString();
    Object.assign(lead, normalizeLeadPayload(req.body));

    if (prevStage !== lead.stage) {
      lead.activities.push({
        type: 'status_change',
        description: `Stage changed from ${stageLabels[prevStage] || prevStage} to ${stageLabels[lead.stage] || lead.stage}`,
        performedBy: req.user._id,
      });

      if (lead.stage === 'won') {
        await runAutomation('deal_won', { lead, user: req.user, io: req.app.get('io') });
      }
    }

    if (lead.assignedTo?.toString() && lead.assignedTo.toString() !== prevAssignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
      lead.activities.push({
        type: 'assignment',
        description: 'Lead reassigned',
        performedBy: req.user._id,
      });
    }

    await lead.save();

    if (lead.assignedTo?.toString() && lead.assignedTo.toString() !== prevAssignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: lead.assignedTo,
        sender: req.user._id,
        type: 'lead_assigned',
        title: 'Lead Assigned',
        message: `${lead.name} has been assigned to you.`,
        link: '/crm/leads',
      }, req.app.get('io'));
    }

    await createActivityLog({
      actor: req.user,
      action: 'lead.updated',
      entityType: 'lead',
      entityId: lead._id,
      title: 'Lead updated',
      description: `${lead.name} was updated.`,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    const updated = await Lead.findById(lead._id).populate('assignedTo', 'name email avatar');
    res.json({ success: true, lead: serializeLead(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc   Update lead stage (Kanban drag)
// @route  PATCH /api/leads/:id/stage
export const updateLeadStage = async (req, res) => {
  try {
    const { stage, stageOrder } = req.body;
    const normalizedStage = stageMap[stage] || stage;
    const lead = await Lead.findById(req.params.id);
    const access = assertLeadAccess(req, lead);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const prevStage = lead.stage;
    lead.stage = normalizedStage;
    if (stageOrder !== undefined) lead.stageOrder = Number(stageOrder) || 0;
    lead.activities.push({
      type: 'status_change',
      description: `Stage moved from ${stageLabels[prevStage] || prevStage} to ${stageLabels[normalizedStage] || normalizedStage}`,
      performedBy: req.user._id,
    });
    await lead.save();

    if (normalizedStage === 'won') {
      await runAutomation('deal_won', { lead, user: req.user, io: req.app.get('io') });
    }

    req.app.get('io')?.broadcastToCRM?.('leadStageUpdated', {
      leadId: lead._id,
      stage: normalizedStage,
      stageOrder: lead.stageOrder,
    });

    await createActivityLog({
      actor: req.user,
      action: 'lead.stage.updated',
      entityType: 'lead',
      entityId: lead._id,
      title: 'Lead stage updated',
      description: `${lead.name} moved to ${stageLabels[normalizedStage] || normalizedStage}.`,
      metadata: { stage: normalizedStage, stageOrder: lead.stageOrder },
    });

    res.json({ success: true, lead: serializeLead(lead) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc   Add call log
// @route  POST /api/leads/:id/call-log
export const addCallLog = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    const access = assertLeadAccess(req, lead);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    lead.callLogs.push({ ...req.body, calledBy: req.user._id });
    lead.lastContactDate = new Date();
    lead.activities.push({
      type: 'call',
      description: `Call logged${req.body.notes ? `: ${req.body.notes}` : ''}`,
      performedBy: req.user._id,
    });
    await lead.save();

    await createActivityLog({
      actor: req.user,
      action: 'lead.call.logged',
      entityType: 'lead',
      entityId: lead._id,
      title: 'Lead call logged',
      description: `A call was logged for ${lead.name}.`,
      metadata: { outcome: req.body.outcome, duration: req.body.duration },
    });

    res.json({ success: true, lead: serializeLead(lead) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc   Delete lead
// @route  DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    await Referral.deleteMany({ lead: lead._id });

    await createActivityLog({
      actor: req.user,
      action: 'lead.deleted',
      entityType: 'lead',
      entityId: lead._id,
      title: 'Lead deleted',
      description: `${lead.name} was deleted.`,
    });

    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
