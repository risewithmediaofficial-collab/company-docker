import Communication from '../models/communication.model.js';
import User from '../models/user.model.js';
import Client from '../models/client.model.js';
import { createNotification } from '../utils/notification.js';
import { createActivityLog } from '../utils/activity.js';

const canSeeAll = (role) => ['superAdmin', 'manager'].includes(role);

const normalizeCommunication = (communication, viewerRole) => {
  const item = communication?.toObject ? communication.toObject() : communication;
  if (!item) return null;

  if (viewerRole === 'client') {
    item.messages = (item.messages || []).filter((message) => !message.isInternalNote);
  }

  return item;
};

const getClientContextForUser = async (userId) => Client.findOne({ userId })
  .select('_id name company userId assignedManager assignedTeam');

const resolveParticipantTargets = async (participants = [], { allowClientParticipants = true } = {}) => {
  const participantMap = new Map();
  const relatedClientIds = new Set();

  for (const participant of participants) {
    if (!participant?.user) continue;

    if (participant.userModel === 'Client') {
      const client = await Client.findById(participant.user).select('_id userId');
      if (!client) continue;
      relatedClientIds.add(client._id.toString());
      if (!allowClientParticipants || !client.userId) continue;

      participantMap.set(client.userId.toString(), {
        user: client.userId.toString(),
        role: participant.role || 'observer',
      });
      continue;
    }

    const user = await User.findById(participant.user).select('_id role clientId');
    if (!user) continue;

    if (user.role === 'client' && user.clientId) {
      relatedClientIds.add(user.clientId.toString());
    }

    participantMap.set(user._id.toString(), {
      user: user._id.toString(),
      role: participant.role || 'observer',
    });
  }

  return {
    participants: [...participantMap.values()],
    relatedClientIds: [...relatedClientIds],
  };
};

const assertCommunicationAccess = async (req, communication) => {
  if (!communication) return { allowed: false, status: 404, message: 'Communication not found' };
  if (canSeeAll(req.user.role)) return { allowed: true };

  const isParticipant = communication.participants.some(
    (participant) => participant.user.toString() === req.user._id.toString(),
  );

  if (isParticipant) return { allowed: true };
  return { allowed: false, status: 403, message: 'Access denied' };
};

const hydrateCommunication = async (id) => Communication.findById(id)
  .populate('participants.user', 'name email avatar role clientId')
  .populate('messages.sender', 'name email avatar role clientId')
  .populate('relatedClient', 'name company email')
  .populate('relatedProject', 'name')
  .populate('relatedTask', 'title status')
  .populate('relatedInvoice', 'invoiceNumber status total');

export const getCommunications = async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (!canSeeAll(req.user.role)) {
      filter['participants.user'] = req.user._id;
      if (req.user.role === 'client') {
        filter.category = { $ne: 'internal' };
      }
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { 'messages.content': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Communication.countDocuments(filter);
    const communications = await Communication.find(filter)
      .populate('participants.user', 'name email avatar role clientId')
      .populate('messages.sender', 'name email avatar role clientId')
      .populate('relatedClient', 'name company')
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      communications: communications.map((item) => normalizeCommunication(item, req.user.role)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCommunication = async (req, res) => {
  try {
    const communication = await hydrateCommunication(req.params.id);
    const access = await assertCommunicationAccess(req, communication);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    res.json({
      success: true,
      communication: normalizeCommunication(communication, req.user.role),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCommunication = async (req, res) => {
  try {
    const { subject, message, category, priority, relatedProject, relatedTask, relatedInvoice, participants = [] } = req.body;

    if (!subject?.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Initial message is required' });
    }

    const isClient = req.user.role === 'client';
    let resolvedParticipants = [];
    let relatedClient = null;

    if (isClient) {
      const client = await getClientContextForUser(req.user._id);
      if (!client) {
        return res.status(400).json({ success: false, message: 'Client profile not found for this account' });
      }

      relatedClient = client._id;
      const fallbackTeam = client.assignedTeam?.length
        ? client.assignedTeam.map((userId) => ({ user: userId.toString(), role: 'assignee' }))
        : [];
      if (client.assignedManager) {
        fallbackTeam.unshift({ user: client.assignedManager.toString(), role: 'assignee' });
      }

      if (!fallbackTeam.length) {
        const defaultRecipients = await User.find({ role: { $in: ['superAdmin', 'manager'] }, isActive: true })
          .select('_id')
          .limit(5);
        fallbackTeam.push(...defaultRecipients.map((user) => ({ user: user._id.toString(), role: 'assignee' })));
      }

      resolvedParticipants = fallbackTeam;
    } else {
      const { participants: normalizedParticipants, relatedClientIds } = await resolveParticipantTargets(
        participants,
        { allowClientParticipants: category !== 'internal' },
      );

      resolvedParticipants = normalizedParticipants;
      relatedClient = relatedClientIds[0] || null;
    }

    const participantMap = new Map();
    participantMap.set(req.user._id.toString(), {
      user: req.user._id.toString(),
      role: 'initiator',
    });

    resolvedParticipants.forEach((participant) => {
      if (!participant?.user) return;
      if (!participantMap.has(participant.user.toString())) {
        participantMap.set(participant.user.toString(), {
          user: participant.user.toString(),
          role: participant.role || 'observer',
        });
      }
    });

    if (!participantMap.size) {
      return res.status(400).json({ success: false, message: 'At least one participant is required' });
    }

    const communication = await Communication.create({
      subject: subject.trim(),
      category: category || (isClient ? 'support' : 'general'),
      priority: priority || 'medium',
      relatedClient,
      relatedProject: relatedProject || undefined,
      relatedTask: relatedTask || undefined,
      relatedInvoice: relatedInvoice || undefined,
      participants: [...participantMap.values()],
      messages: [{
        content: message.trim(),
        sender: req.user._id,
        isInternalNote: false,
        readBy: [{ user: req.user._id }],
      }],
    });

    const hydrated = await hydrateCommunication(communication._id);
    const io = req.app.get('io');
    const recipients = hydrated.participants
      .map((participant) => participant.user?._id?.toString() || participant.user?.toString())
      .filter((userId) => userId && userId !== req.user._id.toString());

    await Promise.all(recipients.map((recipient) => createNotification({
      recipient,
      sender: req.user._id,
      type: 'general',
      title: 'New conversation',
      message: `${req.user.name} started "${communication.subject}"`,
      link: '/chat',
      metadata: { communicationId: communication._id },
    }, io)));

    await createActivityLog({
      actor: req.user,
      action: 'communication.created',
      entityType: 'communication',
      entityId: communication._id,
      title: 'Conversation created',
      description: `${communication.subject} was started.`,
      relatedClient: communication.relatedClient,
      relatedProject: communication.relatedProject,
      relatedTask: communication.relatedTask,
    });

    res.status(201).json({ success: true, communication: normalizeCommunication(hydrated, req.user.role) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCommunication = async (req, res) => {
  try {
    const { status, priority, category, addParticipants, subject } = req.body;
    const communication = await Communication.findById(req.params.id);
    const access = await assertCommunicationAccess(req, communication);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (req.user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Clients cannot edit conversation settings' });
    }

    if (status) communication.status = status;
    if (priority) communication.priority = priority;
    if (category) communication.category = category;
    if (subject?.trim()) communication.subject = subject.trim();

    if (Array.isArray(addParticipants) && addParticipants.length) {
      const { participants: normalizedParticipants, relatedClientIds } = await resolveParticipantTargets(
        addParticipants,
        { allowClientParticipants: communication.category !== 'internal' },
      );

      normalizedParticipants.forEach((participant) => {
        if (!communication.participants.some((existing) => existing.user.toString() === participant.user.toString())) {
          communication.participants.push(participant);
        }
      });

      if (!communication.relatedClient && relatedClientIds[0]) {
        communication.relatedClient = relatedClientIds[0];
      }
    }

    if (['resolved', 'closed'].includes(communication.status)) {
      communication.resolvedAt = new Date();
    } else {
      communication.resolvedAt = undefined;
    }

    await communication.save();

    await createActivityLog({
      actor: req.user,
      action: 'communication.updated',
      entityType: 'communication',
      entityId: communication._id,
      title: 'Conversation updated',
      description: `${communication.subject} was updated.`,
      relatedClient: communication.relatedClient,
      relatedProject: communication.relatedProject,
      relatedTask: communication.relatedTask,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    const hydrated = await hydrateCommunication(communication._id);
    res.json({ success: true, communication: normalizeCommunication(hydrated, req.user.role) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const replyCommunication = async (req, res) => {
  try {
    const { content, isInternalNote, attachments, newStatus } = req.body;
    const communication = await Communication.findById(req.params.id);
    const access = await assertCommunicationAccess(req, communication);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const safeInternal = req.user.role === 'client' ? false : Boolean(isInternalNote);

    communication.messages.push({
      content: content.trim(),
      sender: req.user._id,
      isInternalNote: safeInternal,
      attachments: Array.isArray(attachments) ? attachments : [],
      readBy: [{ user: req.user._id }],
    });

    if (newStatus) {
      communication.status = newStatus;
    } else if (req.user.role === 'client') {
      communication.status = 'open';
    } else if (communication.relatedClient) {
      communication.status = 'pending_client';
    } else {
      communication.status = 'open';
    }

    if (!communication.participants.some((participant) => participant.user.toString() === req.user._id.toString())) {
      communication.participants.push({ user: req.user._id, role: 'observer' });
    }

    if (['resolved', 'closed'].includes(communication.status)) {
      communication.resolvedAt = new Date();
    } else {
      communication.resolvedAt = undefined;
    }

    await communication.save();

    const populated = await hydrateCommunication(communication._id);
    const io = req.app.get('io');
    const recipients = populated.participants
      .map((participant) => participant.user?._id?.toString() || participant.user?.toString())
      .filter((userId) => userId && userId !== req.user._id.toString());

    await Promise.all(recipients.map((recipient) => createNotification({
      recipient,
      sender: req.user._id,
      type: 'general',
      title: 'New message',
      message: `${req.user.name} replied to "${communication.subject}"`,
      link: '/chat',
      metadata: { communicationId: communication._id },
    }, io)));

    await createActivityLog({
      actor: req.user,
      action: 'communication.reply.added',
      entityType: 'communication',
      entityId: communication._id,
      title: 'Reply added',
      description: `${req.user.name} replied in ${communication.subject}.`,
      relatedClient: communication.relatedClient,
      relatedProject: communication.relatedProject,
      relatedTask: communication.relatedTask,
      metadata: { status: communication.status, isInternalNote: safeInternal },
    });

    res.json({ success: true, communication: normalizeCommunication(populated, req.user.role) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCommunication = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);
    if (!communication) return res.status(404).json({ success: false, message: 'Communication not found' });
    if (!canSeeAll(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    await communication.deleteOne();

    await createActivityLog({
      actor: req.user,
      action: 'communication.deleted',
      entityType: 'communication',
      entityId: communication._id,
      title: 'Conversation deleted',
      description: `${communication.subject} was deleted.`,
      relatedClient: communication.relatedClient,
      relatedProject: communication.relatedProject,
      relatedTask: communication.relatedTask,
    });

    res.json({ success: true, message: 'Communication deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
