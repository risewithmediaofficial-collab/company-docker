import mongoose from 'mongoose';
import CalendarMeeting from '../models/calendarMeeting.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import { withWorkspaceScope } from '../middleware/auth.middleware.js';
import { createActivityLog } from '../utils/activity.js';
import { createNotification } from '../utils/notification.js';
import { emitLiveEvent } from '../utils/socketEmitter.js';

const MEETING_POPULATE = [
  { path: 'client', select: 'name company email phone' },
  { path: 'project', select: 'name status category color' },
  { path: 'organizer', select: 'name email avatar role' },
  { path: 'attendees', select: 'name email avatar role department' },
];

const toValidId = (val) => {
  if (!val) return undefined;
  const raw = typeof val === 'object' && val._id ? val._id : val;
  const str = String(raw).trim();
  return mongoose.Types.ObjectId.isValid(str) ? str : undefined;
};

const normalizeAttendees = (val) => {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  const ids = arr.map(toValidId).filter(Boolean);
  return [...new Set(ids)];
};

const parseMeetingDate = (val) => {
  if (!val) return undefined;
  const raw = String(val).trim();
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]), 12, 0, 0, 0);
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const resolveClientProject = async ({ clientId, projectId }) => {
  const project = projectId ? await Project.findById(projectId).select('_id name client') : null;
  if (projectId && !project) {
    return { ok: false, status: 404, message: 'Project not found' };
  }

  const effectiveClientId = clientId || project?.client;
  const client = effectiveClientId ? await Client.findById(effectiveClientId).select('_id name company userId') : null;
  if (effectiveClientId && !client) {
    return { ok: false, status: 404, message: 'Client not found' };
  }

  if (project && client && project.client && project.client.toString() !== client._id.toString()) {
    return { ok: false, status: 400, message: 'Selected project does not belong to the selected client' };
  }

  return { ok: true, client, project };
};

const getClientRecordForUser = async (user) => {
  if (!user) return null;
  const byUser = await Client.findOne({ userId: user._id }).select('_id name company');
  if (byUser) return byUser;
  if (user.clientId) {
    return Client.findById(user.clientId).select('_id name company');
  }
  return null;
};

export const getMeetings = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      client,
      project,
      assignedTo,
      status,
      meetingType,
      search,
      limit = 500,
    } = req.query;

    const filter = {};
    const andClauses = [];

    if (client) filter.client = client;
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (meetingType) filter.meetingType = meetingType;

    if (assignedTo) {
      andClauses.push({
        $or: [{ organizer: assignedTo }, { attendees: assignedTo }],
      });
    }

    if (startDate || endDate) {
      const dateRange = {};
      if (startDate) {
        const s = new Date(startDate);
        if (!Number.isNaN(s.getTime())) {
          s.setHours(0, 0, 0, 0);
          dateRange.$gte = s;
        }
      }
      if (endDate) {
        const e = new Date(endDate);
        if (!Number.isNaN(e.getTime())) {
          e.setHours(23, 59, 59, 999);
          dateRange.$lte = e;
        }
      }
      if (Object.keys(dateRange).length > 0) {
        filter.meetingDate = dateRange;
      }
    }

    if (search) {
      andClauses.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
          { platform: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Role scoping
    if (req.user.role === 'client') {
      const clientDoc = await getClientRecordForUser(req.user);
      if (!clientDoc) {
        return res.json({ success: true, meetings: [] });
      }
      const clientProjects = await Project.find({ client: clientDoc._id }).select('_id');
      const projectIds = clientProjects.map((p) => p._id);
      andClauses.push({
        $or: [{ client: clientDoc._id }, { project: { $in: projectIds } }],
      });
      filter.visibleToClient = { $ne: false };
    } else if (!['superAdmin', 'admin', 'organizationOwner', 'manager'].includes(req.user.role)) {
      const userProjects = await Project.find({
        $or: [{ team: req.user._id }, { manager: req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      andClauses.push({
        $or: [
          { organizer: req.user._id },
          { attendees: req.user._id },
          ...(projectIds.length ? [{ project: { $in: projectIds } }] : []),
        ],
      });
    }

    if (andClauses.length > 0) {
      filter.$and = andClauses;
    }

    const scopedFilter = withWorkspaceScope(req, filter);

    const meetings = await CalendarMeeting.find(scopedFilter)
      .populate(MEETING_POPULATE)
      .sort({ meetingDate: 1, startTime: 1, createdAt: -1 })
      .limit(Math.min(Number(limit) || 500, 1000));

    res.json({ success: true, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMeeting = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    if (!title) {
      return res.status(400).json({ success: false, message: 'Meeting title is required' });
    }

    const meetingDate = parseMeetingDate(req.body.meetingDate);
    if (!meetingDate) {
      return res.status(400).json({ success: false, message: 'Valid meeting date is required' });
    }

    const clientId = toValidId(req.body.client);
    const projectId = toValidId(req.body.project);
    const match = await resolveClientProject({ clientId, projectId });
    if (!match.ok) {
      return res.status(match.status).json({ success: false, message: match.message });
    }

    const attendees = normalizeAttendees(req.body.attendees);
    const organizer = toValidId(req.body.organizer) || req.user._id;

    const meeting = await CalendarMeeting.create({
      organizationId: req.user.organizationId,
      brandId: req.headers['x-workspace-id'] || undefined,
      title,
      description: req.body.description || '',
      meetingType: req.body.meetingType || (match.client ? 'client_meeting' : 'internal_team'),
      platform: req.body.platform || 'Google Meet',
      meetingLink: req.body.meetingLink || '',
      location: req.body.location || '',
      meetingDate,
      startTime: req.body.startTime || '10:00',
      endTime: req.body.endTime || '11:00',
      client: match.client?._id,
      project: match.project?._id,
      organizer,
      attendees,
      externalAttendees: Array.isArray(req.body.externalAttendees)
        ? req.body.externalAttendees.map((v) => String(v).trim()).filter(Boolean)
        : [],
      status: req.body.status || 'scheduled',
      color: req.body.color || '#7c3aed',
      notes: req.body.notes || '',
      visibleToClient: req.body.visibleToClient !== undefined ? Boolean(req.body.visibleToClient) : true,
    });

    const populated = await CalendarMeeting.findById(meeting._id).populate(MEETING_POPULATE);

    try {
      await createActivityLog({
        actor: req.user,
        action: 'meeting.scheduled',
        entityType: 'meeting',
        entityId: meeting._id,
        title: 'Meeting scheduled',
        description: `${meeting.title} scheduled on ${meetingDate.toISOString().slice(0, 10)} at ${meeting.startTime}.`,
        relatedClient: meeting.client,
        relatedProject: meeting.project,
      });

      const recipients = attendees.filter((id) => id.toString() !== req.user._id.toString());
      await Promise.all(
        recipients.map((recipientId) =>
          createNotification({
            recipient: recipientId,
            sender: req.user._id,
            type: 'system',
            title: `Meeting: ${meeting.title}`,
            message: `${req.user.name || 'Teammate'} scheduled "${meeting.title}" on ${meetingDate.toISOString().slice(0, 10)} at ${meeting.startTime}.`,
            link: '/calendar',
            metadata: { meetingId: meeting._id },
          }).catch(() => null)
        )
      );
    } catch (_) {
      // Non-fatal side effects
    }

    emitLiveEvent('meetingCreated', populated);
    res.status(201).json({ success: true, meeting: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const meeting = await CalendarMeeting.findOne(withWorkspaceScope(req, { _id: req.params.id }));
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    const isPrivileged = ['superAdmin', 'admin', 'organizationOwner', 'manager'].includes(req.user.role);
    const isParticipant =
      meeting.organizer?.toString() === req.user._id.toString() ||
      (meeting.attendees || []).some((id) => id.toString() === req.user._id.toString());

    if (!isPrivileged && !isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this meeting' });
    }

    const nextClient = req.body.client !== undefined ? toValidId(req.body.client) : meeting.client;
    const nextProject = req.body.project !== undefined ? toValidId(req.body.project) : meeting.project;
    const match = await resolveClientProject({ clientId: nextClient, projectId: nextProject });
    if (!match.ok) {
      return res.status(match.status).json({ success: false, message: match.message });
    }

    if (req.body.title !== undefined) {
      if (!req.body.title?.trim()) {
        return res.status(400).json({ success: false, message: 'Meeting title cannot be empty' });
      }
      meeting.title = req.body.title.trim();
    }
    if (req.body.description !== undefined) meeting.description = req.body.description;
    if (req.body.meetingType !== undefined) meeting.meetingType = req.body.meetingType;
    if (req.body.platform !== undefined) meeting.platform = req.body.platform;
    if (req.body.meetingLink !== undefined) meeting.meetingLink = req.body.meetingLink;
    if (req.body.location !== undefined) meeting.location = req.body.location;
    if (req.body.meetingDate !== undefined) {
      const parsed = parseMeetingDate(req.body.meetingDate);
      if (!parsed) return res.status(400).json({ success: false, message: 'Invalid meeting date' });
      meeting.meetingDate = parsed;
    }
    if (req.body.startTime !== undefined) meeting.startTime = req.body.startTime;
    if (req.body.endTime !== undefined) meeting.endTime = req.body.endTime;
    if (req.body.client !== undefined) meeting.client = match.client?._id;
    if (req.body.project !== undefined) meeting.project = match.project?._id;
    if (req.body.attendees !== undefined) meeting.attendees = normalizeAttendees(req.body.attendees);
    if (req.body.externalAttendees !== undefined) {
      meeting.externalAttendees = Array.isArray(req.body.externalAttendees)
        ? req.body.externalAttendees.map((v) => String(v).trim()).filter(Boolean)
        : [];
    }
    if (req.body.status !== undefined) meeting.status = req.body.status;
    if (req.body.color !== undefined) meeting.color = req.body.color;
    if (req.body.notes !== undefined) meeting.notes = req.body.notes;
    if (req.body.visibleToClient !== undefined) meeting.visibleToClient = Boolean(req.body.visibleToClient);

    await meeting.save();
    const populated = await CalendarMeeting.findById(meeting._id).populate(MEETING_POPULATE);

    emitLiveEvent('meetingUpdated', populated);
    res.json({ success: true, meeting: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await CalendarMeeting.findOne(withWorkspaceScope(req, { _id: req.params.id }));
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    const isPrivileged = ['superAdmin', 'admin', 'organizationOwner', 'manager'].includes(req.user.role);
    const isOrganizer = meeting.organizer?.toString() === req.user._id.toString();

    if (!isPrivileged && !isOrganizer) {
      return res.status(403).json({ success: false, message: 'Only organizer or managers can delete meetings' });
    }

    await CalendarMeeting.findByIdAndDelete(meeting._id);
    emitLiveEvent('meetingDeleted', { _id: meeting._id });
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
