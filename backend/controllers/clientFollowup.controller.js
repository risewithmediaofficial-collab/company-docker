import ClientFollowup from '../models/clientFollowup.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import { createActivityLog } from '../utils/activity.js';

const normalizePayload = (body = {}) => ({
  ...body,
  meetingDate: body.meetingDate ? new Date(body.meetingDate) : undefined,
  nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : undefined,
  project: body.project || undefined,
  assignedTo: body.assignedTo || undefined,
});

const assertClientProjectMatch = async ({ clientId, projectId }) => {
  const client = await Client.findById(clientId).select('_id name company');
  if (!client) return { ok: false, status: 404, message: 'Client not found' };

  if (!projectId) return { ok: true, client };

  const project = await Project.findById(projectId).select('_id client name');
  if (!project) return { ok: false, status: 404, message: 'Project not found' };
  if (project.client?.toString() !== client._id.toString()) {
    return { ok: false, status: 400, message: 'Selected project does not belong to the selected client' };
  }

  return { ok: true, client, project };
};

export const getClientFollowups = async (req, res) => {
  try {
    const { search, client, status, type, due, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (client) filter.client = client;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (due) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      if (due === 'today') filter.nextFollowUpDate = { $gte: todayStart, $lte: todayEnd };
      if (due === 'overdue') {
        filter.nextFollowUpDate = { $lt: todayStart };
        filter.status = { $nin: ['completed', 'cancelled'] };
      }
      if (due === 'upcoming') filter.nextFollowUpDate = { $gt: todayEnd };
    }
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { discussionNotes: { $regex: search, $options: 'i' } },
        { outcome: { $regex: search, $options: 'i' } },
        { nextAction: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await ClientFollowup.countDocuments(filter);
    const followups = await ClientFollowup.find(filter)
      .populate('client', 'name company email phone')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ nextFollowUpDate: 1, meetingDate: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, followups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClientFollowup = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.client) return res.status(400).json({ success: false, message: 'Client is required' });
    if (!payload.subject?.trim()) return res.status(400).json({ success: false, message: 'Subject is required' });

    const match = await assertClientProjectMatch({ clientId: payload.client, projectId: payload.project });
    if (!match.ok) return res.status(match.status).json({ success: false, message: match.message });

    const followup = await ClientFollowup.create({
      ...payload,
      createdBy: req.user._id,
    });

    await Client.findByIdAndUpdate(payload.client, { $set: { lastActivityDate: new Date() } });
    await createActivityLog({
      actor: req.user,
      action: 'client.followup.created',
      entityType: 'client_followup',
      entityId: followup._id,
      title: 'Client follow-up created',
      description: `${followup.subject} was recorded.`,
      relatedClient: followup.client,
      relatedProject: followup.project,
    });

    const populated = await ClientFollowup.findById(followup._id)
      .populate('client', 'name company email phone')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({ success: true, followup: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateClientFollowup = async (req, res) => {
  try {
    const current = await ClientFollowup.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    const payload = normalizePayload(req.body);
    const nextClient = payload.client || current.client;
    const nextProject = payload.project || current.project;
    const match = await assertClientProjectMatch({ clientId: nextClient, projectId: nextProject });
    if (!match.ok) return res.status(match.status).json({ success: false, message: match.message });

    Object.assign(current, payload);
    await current.save();

    await Client.findByIdAndUpdate(current.client, { $set: { lastActivityDate: new Date() } });
    await createActivityLog({
      actor: req.user,
      action: 'client.followup.updated',
      entityType: 'client_followup',
      entityId: current._id,
      title: 'Client follow-up updated',
      description: `${current.subject} was updated.`,
      relatedClient: current.client,
      relatedProject: current.project,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    const populated = await ClientFollowup.findById(current._id)
      .populate('client', 'name company email phone')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({ success: true, followup: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteClientFollowup = async (req, res) => {
  try {
    const followup = await ClientFollowup.findByIdAndDelete(req.params.id);
    if (!followup) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    await createActivityLog({
      actor: req.user,
      action: 'client.followup.deleted',
      entityType: 'client_followup',
      entityId: followup._id,
      title: 'Client follow-up deleted',
      description: `${followup.subject} was deleted.`,
      relatedClient: followup.client,
      relatedProject: followup.project,
    });

    res.json({ success: true, message: 'Follow-up deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
