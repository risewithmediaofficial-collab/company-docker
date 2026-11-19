// =============================================
// SMM MONTHLY TRACKER CONTROLLER
// =============================================
import mongoose from 'mongoose';
import SmmMonthlyTracker from '../../models/smm/smmMonthlyTracker.model.js';
import SmmClient from '../../models/smm/smmClient.model.js';
import SmmContent from '../../models/smm/smmContent.model.js';
import Client from '../../models/client.model.js';
import Task from '../../models/task.model.js';
import Project from '../../models/project.model.js';
import ProjectMonthlyDeliverable from '../../models/projectMonthlyDeliverable.model.js';
import { emitLiveEvent } from '../../utils/socketEmitter.js';
import { withWorkspaceScope } from '../../middleware/auth.middleware.js';

// ── Helpers: SMM task verification & assignment check ────────────────────────
const SMM_CONTENT_TYPES = [
  'reel',
  'post',
  'poster',
  'video',
  'social_media_post',
  'story',
  'carousel_post',
  'custom_content',
  'content',
];

const isSmmTask = (task) => {
  if (!task) return false;
  if (task.isDevTask || task.department === 'Development') return false;
  if (task.taskCategory === 'non_content' || task.nonContentCategory) return false;
  return true;
};

const isTaskAssigned = (task) => {
  if (!task) return false;
  if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) return true;
  if (task.assignedManager) return true;
  if (task.publisherAssigned) return true;
  if (task.editorAssigned) return true;
  if (task.videographerAssigned) return true;
  if (task.scriptWriterAssigned) return true;
  if (task.designerAssigned) return true;
  if (task.assignedPersonName && String(task.assignedPersonName).trim() !== '') return true;
  return false;
};

// ── Helper: build empty days array for a month ─────────────────────────────
const buildEmptyDays = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based
  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    postLabel: '',
    postStatus: 'todo',
    storyLabel: '',
    storyStatus: 'todo',
    note: '',
    items: [],
  }));
};

// ── Helper: detect if label contains actual poster/content text (not just dashes or blank) ──
const hasPosterContent = (label) => {
  if (!label) return false;
  const clean = String(label).trim();
  if (!clean) return false;
  return !/^[-—–\s]+$/.test(clean);
};

// ── Helper: determine if a day is before the live date (in the past) ────────
const isDayBeforeToday = (dayNum, month, year) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const numYear = Number(year);
  const numMonth = Number(month);
  const numDay = Number(dayNum);

  if (numYear < currentYear) return true;
  if (numYear > currentYear) return false;
  if (numMonth < currentMonth) return true;
  if (numMonth > currentMonth) return false;
  return numDay < currentDay;
};

// ── Helper: resolve a client object from either SmmClient or CRM Client ────
const resolveClientObj = async (clientId) => {
  if (!clientId) return null;
  const idStr = clientId.toString();
  try {
    const smmClient = await SmmClient.findById(idStr).select('companyName status brandLogo email phone').lean();
    if (smmClient) {
      return {
        _id: smmClient._id,
        companyName: smmClient.companyName || 'Client',
        status: smmClient.status || 'Active',
      };
    }
    const crmClient = await Client.findById(idStr).select('company name status logo email phone').lean();
    if (crmClient) {
      const cName = crmClient.company || crmClient.name || 'Client';
      // Auto-mirror to SmmClient so future queries & refs also find it
      SmmClient.findByIdAndUpdate(
        crmClient._id,
        {
          $setOnInsert: {
            _id: crmClient._id,
            companyName: cName,
            status: crmClient.status === 'active' || crmClient.status === 'Active' ? 'Active' : 'Inactive',
            email: crmClient.email || '',
            phone: crmClient.phone || '',
          },
        },
        { upsert: true }
      ).catch(() => {});

      return {
        _id: crmClient._id,
        companyName: cName,
        status: crmClient.status === 'active' || crmClient.status === 'Active' ? 'Active' : 'Inactive',
      };
    }
  } catch (err) {
    console.error('resolveClientObj error:', err);
  }
  return { _id: clientId, companyName: 'Client', status: 'Active' };
};

// ── Helper: resolve client details from logged-in client user ───────────────
const resolveClientForUser = async (user) => {
  if (!user) return null;
  const userId = user._id;
  let client = await Client.findOne({ userId }).select('_id company name email phone').lean();
  if (!client && user.clientId) {
    client = await Client.findById(user.clientId).select('_id company name email phone').lean();
  }
  if (!client && user.email) {
    client = await Client.findOne({ email: user.email }).select('_id company name email phone').lean();
  }
  if (!client) {
    let smmC = user.clientId ? await SmmClient.findById(user.clientId).select('_id companyName email phone').lean() : null;
    if (!smmC && user.email) {
      smmC = await SmmClient.findOne({ email: user.email }).select('_id companyName email phone').lean();
    }
    if (smmC) return { id: smmC._id.toString(), smmId: smmC._id.toString(), companyName: smmC.companyName };
  }
  if (client) {
    let smmId = client._id.toString();
    const smmC = await SmmClient.findById(client._id).select('_id companyName').lean()
      || (client.company ? await SmmClient.findOne({ companyName: { $regex: new RegExp(`^${client.company.trim()}$`, 'i') } }).select('_id companyName').lean() : null);
    return {
      id: client._id.toString(),
      smmId: smmC ? smmC._id.toString() : client._id.toString(),
      companyName: client.company || client.name,
    };
  }
  return null;
};

// ── GET all tracker rows for a given month/year ─────────────────────────────
// GET /api/smm/tracker?month=9&year=2026
export const getMonthlyTrackers = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();

    // STRICT CLIENT SCOPING: When logged in as client, ONLY return their own tracker
    if (req.user.role === 'client') {
      const client = await resolveClientForUser(req.user);
      if (!client) {
        return res.json({ success: true, data: { rows: [], month, year, daysInMonth } });
      }

      const clientIds = [client.id, client.smmId].filter(Boolean);
      let tracker = await SmmMonthlyTracker.findOne({
        client: { $in: clientIds },
        month,
        year,
      }).lean();

      if (!tracker && client.companyName) {
        const smmC = await SmmClient.findOne({
          companyName: { $regex: new RegExp(`^${client.companyName.trim()}$`, 'i') },
        }).lean();
        if (smmC) {
          tracker = await SmmMonthlyTracker.findOne({ client: smmC._id, month, year }).lean();
        }
      }

      const clientObj = {
        _id: client.id,
        companyName: client.companyName || 'My Company',
        status: 'Active',
      };

      let rowData;
      if (tracker && !tracker.isExcluded) {
        let modified = false;
        const updatedDays = (tracker.days || []).map((day) => {
          const isPast = isDayBeforeToday(day.day, month, year);
          let newDay = day;
          if (isPast) {
            if (hasPosterContent(day.postLabel) && (!day.postStatus || day.postStatus === 'todo')) {
              if (newDay === day) newDay = { ...day };
              newDay.postStatus = 'pending';
              modified = true;
            }
            if (hasPosterContent(day.storyLabel) && (!day.storyStatus || day.storyStatus === 'todo')) {
              if (newDay === day) newDay = { ...day };
              newDay.storyStatus = 'pending';
              modified = true;
            }
          }
          return newDay;
        });

        if (modified && tracker._id) {
          SmmMonthlyTracker.findByIdAndUpdate(tracker._id, { $set: { days: updatedDays } }).catch(() => {});
        }

        rowData = { ...tracker, days: updatedDays, client: clientObj };
      } else {
        rowData = {
          _id: null,
          client: clientObj,
          team: 'RWM',
          plan: '',
          storyPlan: '30 STORIES',
          month,
          year,
          days: buildEmptyDays(year, month),
          _scaffold: true,
        };
      }

      return res.json({ success: true, data: { rows: [rowData], month, year, daysInMonth } });
    }

    // 1. Fetch active projects within scope to map client -> project
    const projectFilter = withWorkspaceScope(req, { status: { $ne: 'cancelled' } });
    const projects = await Project.find(projectFilter).select('_id client name category').lean();
    const clientToProject = new Map();
    projects.forEach((p) => {
      if (p.client) {
        const cId = p.client.toString();
        if (!clientToProject.has(cId) || p.category === 'smm' || p.category === 'social_media') {
          clientToProject.set(cId, p);
        }
      }
    });

    // 2. Fetch all active clients from BOTH CRM Client and SMM Client within scope
    const clientFilter = withWorkspaceScope(req, { status: { $regex: /^active$/i } });
    const [crmClients, smmClientsList] = await Promise.all([
      Client.find(clientFilter).sort({ company: 1, name: 1 }).lean(),
      SmmClient.find(withWorkspaceScope(req, { status: { $regex: /^active$/i } })).sort({ companyName: 1 }).lean(),
    ]);

    // Build unified active client map
    const clientMap = new Map();
    crmClients.forEach((c) => {
      const cName = c.company || c.name || 'Client';
      clientMap.set(c._id.toString(), {
        _id: c._id,
        companyName: cName,
        status: 'Active',
      });
      // Background mirror to SmmClient for consistency
      SmmClient.findByIdAndUpdate(
        c._id,
        {
          $setOnInsert: {
            _id: c._id,
            companyName: cName,
            status: 'Active',
            email: c.email || '',
            phone: c.phone || '',
          },
        },
        { upsert: true }
      ).catch(() => {});
    });

    smmClientsList.forEach((c) => {
      if (!clientMap.has(c._id.toString())) {
        clientMap.set(c._id.toString(), {
          _id: c._id,
          companyName: c.companyName || 'Client',
          status: c.status || 'Active',
        });
      }
    });

    // 3. Fetch existing tracker docs for this month/year within scope
    const trackerFilter = withWorkspaceScope(req, { month, year });
    const existingTrackers = await SmmMonthlyTracker.find(trackerFilter).lean();

    // Look for any client IDs in existingTrackers not yet in clientMap
    const missingClientIds = existingTrackers
      .map((t) => t.client?.toString())
      .filter((id) => id && !clientMap.has(id));

    if (missingClientIds.length > 0) {
      const [extraCrm, extraSmm] = await Promise.all([
        Client.find({ _id: { $in: missingClientIds } }).lean(),
        SmmClient.find({ _id: { $in: missingClientIds } }).lean(),
      ]);
      extraCrm.forEach((c) => clientMap.set(c._id.toString(), { _id: c._id, companyName: c.company || c.name || 'Client', status: 'Active' }));
      extraSmm.forEach((c) => {
        if (!clientMap.has(c._id.toString())) {
          clientMap.set(c._id.toString(), { _id: c._id, companyName: c.companyName || 'Client', status: c.status || 'Active' });
        }
      });
    }

    // 4. Check which clients have SMM tasks for this month
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const bufferStart = new Date(startOfMonth.getTime() - 24 * 3600 * 1000);
    const bufferEnd = new Date(endOfMonth.getTime() + 24 * 3600 * 1000);

    const rawMonthTasks = await Task.find(withWorkspaceScope(req, {
      $and: [
        {
          $or: [
            { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
            { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
            { editDueDate: { $gte: bufferStart, $lte: bufferEnd } },
            { designDueDate: { $gte: bufferStart, $lte: bufferEnd } },
            { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
          ],
        },
        { isDevTask: { $ne: true } },
        { department: { $ne: 'Development' } },
        { taskCategory: { $ne: 'non_content' } },
      ],
    })).populate('project', '_id name client').lean();

    const monthTasks = rawMonthTasks.filter((t) => isSmmTask(t));
    const clientsWithTasks = new Set();
    monthTasks.forEach((t) => {
      const cId = t.client?._id?.toString() || (t.client ? t.client.toString() : null) || (t.project?.client ? t.project.client.toString() : null);
      if (cId) {
        clientsWithTasks.add(cId);
        if (t.project && !clientToProject.has(cId)) {
          clientToProject.set(cId, t.project);
        }
      }
    });

    // 5. Check which clients have monthly deliverables
    const deliverables = await ProjectMonthlyDeliverable.find(withWorkspaceScope(req, { month, year })).lean();
    const clientsWithDeliverables = new Set();
    deliverables.forEach((d) => {
      const pIdStr = d.projectId?.toString();
      const proj = projects.find((p) => p._id.toString() === pIdStr);
      if (proj?.client) clientsWithDeliverables.add(proj.client.toString());
    });

    const trackerMap = {};
    const existingPopulatedList = [];

    existingTrackers.forEach((t) => {
      const cIdStr = t.client?.toString();
      if (cIdStr) {
        let modified = false;
        const updatedDays = (t.days || []).map((day) => {
          const isPast = isDayBeforeToday(day.day, month, year);
          let newDay = day;
          if (isPast) {
            if (hasPosterContent(day.postLabel) && (!day.postStatus || day.postStatus === 'todo')) {
              if (newDay === day) newDay = { ...day };
              newDay.postStatus = 'pending';
              modified = true;
            }
            if (hasPosterContent(day.storyLabel) && (!day.storyStatus || day.storyStatus === 'todo')) {
              if (newDay === day) newDay = { ...day };
              newDay.storyStatus = 'pending';
              modified = true;
            }
          }
          return newDay;
        });

        if (modified && t._id) {
          SmmMonthlyTracker.findByIdAndUpdate(t._id, { $set: { days: updatedDays } }).catch(() => {});
        }

        const clientObj = clientMap.get(cIdStr) || { _id: t.client, companyName: 'Client', status: 'Active' };
        const proj = clientToProject.get(cIdStr) || null;
        const projectName = t.projectName || proj?.name || '';
        const pop = {
          ...t,
          days: updatedDays,
          client: clientObj,
          projectName,
          project: proj ? { _id: proj._id, name: proj.name } : (t.project ? { _id: t.project, name: projectName } : null),
        };
        trackerMap[cIdStr] = pop;
        existingPopulatedList.push(pop);
      }
    });

    const handledClientIds = new Set();
    const rows = [];

    // Filter to only clients that have SMM relevance (saved tracker, assigned SMM tasks, or deliverables)
    for (const [cIdStr, client] of clientMap.entries()) {
      handledClientIds.add(cIdStr);
      const existing = trackerMap[cIdStr];

      // If explicitly marked as excluded for this month, skip it
      if (existing?.isExcluded) {
        continue;
      }

      if (existing) {
        rows.push(existing);
      } else {
        // Only scaffold if client actually has SMM tasks, project deliverables, or SMM project
        const hasTasks = clientsWithTasks.has(cIdStr);
        const hasDelivs = clientsWithDeliverables.has(cIdStr);
        const proj = clientToProject.get(cIdStr);
        const isSmmProj = proj && (proj.category === 'smm' || proj.category === 'social_media');

        if (hasTasks || hasDelivs || isSmmProj) {
          rows.push({
            _id: null,
            client: { _id: client._id, companyName: client.companyName },
            projectName: proj?.name || '',
            project: proj ? { _id: proj._id, name: proj.name } : null,
            team: 'RWM',
            plan: '',
            storyPlan: '30 STORIES',
            month,
            year,
            days: buildEmptyDays(year, month),
            _scaffold: true,
          });
        }
      }
    }

    // Also include any other non-excluded trackers for this month
    for (const existing of existingPopulatedList) {
      const cIdStr = existing.client?._id?.toString();
      if (cIdStr && !handledClientIds.has(cIdStr) && !existing.isExcluded) {
        const proj = clientToProject.get(cIdStr) || null;
        existing.projectName = existing.projectName || proj?.name || '';
        existing.project = proj ? { _id: proj._id, name: proj.name } : (existing.project ? { _id: existing.project, name: existing.projectName } : null);
        rows.push(existing);
      }
    }

    res.json({ success: true, data: { rows, month, year, daysInMonth } });
  } catch (err) {
    console.error('getMonthlyTrackers error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// ── GET single tracker row by clientId + month/year ─────────────────────────
export const getTrackerByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    if (req.user.role === 'client') {
      const client = await resolveClientForUser(req.user);
      if (!client || (client.id !== clientId && client.smmId !== clientId)) {
        return res.status(403).json({ success: false, message: 'Access denied to this client tracker' });
      }
    }

    const tracker = await SmmMonthlyTracker.findOne({ client: clientId, month, year }).lean();

    if (!tracker) {
      return res.status(404).json({ success: false, message: 'Tracker not found' });
    }
    let modified = false;
    const updatedDays = (tracker.days || []).map((day) => {
      const isPast = isDayBeforeToday(day.day, month, year);
      let newDay = day;
      if (isPast) {
        if (hasPosterContent(day.postLabel) && (!day.postStatus || day.postStatus === 'todo')) {
          if (newDay === day) newDay = { ...day };
          newDay.postStatus = 'pending';
          modified = true;
        }
        if (hasPosterContent(day.storyLabel) && (!day.storyStatus || day.storyStatus === 'todo')) {
          if (newDay === day) newDay = { ...day };
          newDay.storyStatus = 'pending';
          modified = true;
        }
      }
      return newDay;
    });

    if (modified && tracker._id) {
      SmmMonthlyTracker.findByIdAndUpdate(tracker._id, { $set: { days: updatedDays } }).catch(() => {});
    }

    const proj = await Project.findOne(withWorkspaceScope(req, { client: clientId, status: { $ne: 'cancelled' } })).select('_id name').lean();
    tracker.days = updatedDays;
    tracker.client = await resolveClientObj(clientId);
    tracker.projectName = tracker.projectName || proj?.name || '';
    tracker.project = proj ? { _id: proj._id, name: proj.name } : null;
    res.json({ success: true, data: tracker });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── UPSERT (create or update) a tracker row ─────────────────────────────────
// POST /api/smm/tracker  { clientId, month, year, plan, storyPlan, team, days, projectName, projectId }
export const upsertTracker = async (req, res) => {
  try {
    const { clientId, month, year, plan, storyPlan, team, days, projectName, projectId } = req.body;

    if (!clientId || !month || !year) {
      return res.status(400).json({ success: false, message: 'clientId, month, year are required' });
    }

    let finalProjectName = projectName || '';
    let finalProjectId = projectId || null;
    if (!finalProjectName) {
      const proj = await Project.findOne(withWorkspaceScope(req, { client: clientId, status: { $ne: 'cancelled' } })).select('_id name').lean();
      if (proj) {
        finalProjectName = proj.name;
        finalProjectId = proj._id;
      }
    }

    const tracker = await SmmMonthlyTracker.findOneAndUpdate(
      { client: clientId, month, year },
      {
        $set: {
          team: team || 'RWM',
          plan: plan || '',
          storyPlan: storyPlan || '30 STORIES',
          days: days || buildEmptyDays(year, month),
          project: finalProjectId,
          projectName: finalProjectName,
          organizationId: req.user?.organizationId,
          isExcluded: false,
          updatedBy: req.user?._id,
        },
        $setOnInsert: {
          client: clientId,
          month,
          year,
          createdBy: req.user?._id,
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    tracker.client = await resolveClientObj(clientId);
    tracker.projectName = finalProjectName;
    tracker.project = finalProjectId ? { _id: finalProjectId, name: finalProjectName } : null;

    emitLiveEvent('smmTrackerUpdated', {
      trackerId: tracker._id,
      clientId,
      month,
      year,
    });

    res.json({ success: true, data: tracker });
  } catch (err) {
    console.error('upsertTracker error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── PATCH a single day cell status & items ─────────────────────────────────
// PATCH /api/smm/tracker/:id/day/:day  { field, value } OR { items, postStatus, postLabel, storyStatus, storyLabel, note }
export const updateDayCell = async (req, res) => {
  try {
    const { id, day } = req.params;
    const dayNum = parseInt(day);

    const tracker = await SmmMonthlyTracker.findById(id);
    if (!tracker) {
      return res.status(404).json({ success: false, message: 'Tracker not found' });
    }

    let dayCell = tracker.days.find((d) => d.day === dayNum);
    if (!dayCell) {
      dayCell = { day: dayNum, postLabel: '', postStatus: 'todo', storyLabel: '', storyStatus: 'todo', items: [] };
      tracker.days.push(dayCell);
      dayCell = tracker.days.find((d) => d.day === dayNum);
    }

    // 1. Direct items update (from Day Details Drawer)
    if (req.body.items !== undefined) {
      const itemsList = Array.isArray(req.body.items) ? req.body.items : [];
      dayCell.items = itemsList;

      // Two-way sync: if item has an id matching a Task and title is edited, update the Task in MongoDB!
      if (Array.isArray(itemsList)) {
        for (const it of itemsList) {
          if (it.id && mongoose.Types.ObjectId.isValid(it.id) && it.title) {
            Task.findByIdAndUpdate(it.id, { $set: { title: it.title.trim() } }).catch(() => {});
          }
        }
      }

      // Automatically sync primary post/story fields from items if not explicitly provided
      const contentItems = itemsList.filter((it) => ['reel', 'post', 'video', 'carousel'].includes(it.type));
      const storyItems = itemsList.filter((it) => it.type === 'story');

      if (req.body.postLabel !== undefined) {
        dayCell.postLabel = req.body.postLabel;
      } else if (contentItems.length > 0) {
        dayCell.postLabel = contentItems[0].label || '';
      } else {
        dayCell.postLabel = '';
      }

      if (req.body.postStatus !== undefined) {
        dayCell.postStatus = req.body.postStatus;
      } else if (contentItems.length > 0) {
        // If all done, done; if any pending, pending; else first item status
        const allDone = contentItems.every((it) => it.status === 'done');
        const anyPending = contentItems.some((it) => it.status === 'pending');
        dayCell.postStatus = allDone ? 'done' : (anyPending ? 'pending' : (contentItems[0].status || 'todo'));
      } else {
        dayCell.postStatus = 'todo';
      }

      if (req.body.storyLabel !== undefined) {
        dayCell.storyLabel = req.body.storyLabel;
      } else if (storyItems.length > 0) {
        dayCell.storyLabel = storyItems[0].label || '';
      } else {
        dayCell.storyLabel = '';
      }

      if (req.body.storyStatus !== undefined) {
        dayCell.storyStatus = req.body.storyStatus;
      } else if (storyItems.length > 0) {
        const allDone = storyItems.every((it) => it.status === 'done');
        const anyPending = storyItems.some((it) => it.status === 'pending');
        dayCell.storyStatus = allDone ? 'done' : (anyPending ? 'pending' : (storyItems[0].status || 'todo'));
      } else {
        dayCell.storyStatus = 'todo';
      }

      if (req.body.note !== undefined) {
        dayCell.note = req.body.note;
      }
    } else if (req.body.field) {
      // 2. Legacy single-field update
      const { field, value } = req.body;
      const allowedFields = ['postStatus', 'postLabel', 'storyStatus', 'storyLabel', 'note', 'items'];
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ success: false, message: 'Invalid field' });
      }
      dayCell[field] = value;
    } else {
      // 3. Selective field updates
      if (req.body.postLabel !== undefined) dayCell.postLabel = req.body.postLabel;
      if (req.body.postStatus !== undefined) dayCell.postStatus = req.body.postStatus;
      if (req.body.storyLabel !== undefined) dayCell.storyLabel = req.body.storyLabel;
      if (req.body.storyStatus !== undefined) dayCell.storyStatus = req.body.storyStatus;
      if (req.body.note !== undefined) dayCell.note = req.body.note;
    }

    tracker.updatedBy = req.user?._id;
    await tracker.save();

    const result = tracker.toObject();
    result.client = await resolveClientObj(tracker.client);

    emitLiveEvent('smmTrackerCellUpdated', {
      trackerId: tracker._id.toString(),
      clientId: tracker.client?._id?.toString() || tracker.client?.toString(),
      day: dayNum,
      cell: dayCell,
      field: req.body.field || 'cell',
      value: req.body.value !== undefined ? req.body.value : dayCell,
      month: tracker.month,
      year: tracker.year,
      updatedBy: req.user?._id,
    });
    emitLiveEvent('smmTrackerUpdated', {
      trackerId: tracker._id.toString(),
      month: tracker.month,
      year: tracker.year,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('updateDayCell error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── PATCH plan/team/storyPlan meta for a tracker ─────────────────────────────
// PATCH /api/smm/tracker/:id/meta  { plan, storyPlan, team }
export const updateTrackerMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, storyPlan, team } = req.body;

    const tracker = await SmmMonthlyTracker.findByIdAndUpdate(
      id,
      { $set: { plan, storyPlan, team, updatedBy: req.user?._id } },
      { new: true }
    ).lean();

    if (!tracker) {
      return res.status(404).json({ success: false, message: 'Tracker not found' });
    }
    tracker.client = await resolveClientObj(tracker.client);

    emitLiveEvent('smmTrackerMetaUpdated', {
      trackerId: tracker._id.toString(),
      clientId: tracker.client?._id?.toString() || tracker.client?.toString(),
      month: tracker.month,
      year: tracker.year,
      plan,
      storyPlan,
      team,
    });
    emitLiveEvent('smmTrackerUpdated', {
      trackerId: tracker._id.toString(),
      clientId: tracker.client?._id?.toString() || tracker.client?.toString(),
      month: tracker.month,
      year: tracker.year,
    });

    res.json({ success: true, data: tracker });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── Helper: format "18:30" -> "6:30P", "10:00" -> "10A"
const formatShortTime = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr instanceof Date) {
    let h = timeStr.getHours();
    const m = String(timeStr.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'P' : 'A';
    h = h % 12 || 12;
    return m === '00' ? `${h}${ampm}` : `${h}:${m}${ampm}`;
  }
  const str = String(timeStr);
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'P' : 'A';
      h = h % 12 || 12;
      return m === '00' ? `${h}${ampm}` : `${h}:${m}${ampm}`;
    }
  }
  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return str;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'P' : 'A';
  h = h % 12 || 12;
  return m === '00' ? `${h}${ampm}` : `${h}:${m}${ampm}`;
};

// ── Helper: classify task content type (Reel vs Post vs Story) ───────────────
export const classifyTaskContentType = (task) => {
  const tType = (task.taskType || '').toLowerCase();
  const cType = (task.contentType || '').toLowerCase();
  const vType = (task.videoType || '').toLowerCase();
  const title = (task.title || '').toLowerCase();

  if (
    tType === 'story' ||
    title.includes('[story]') ||
    title.startsWith('story:')
  ) {
    return 'story';
  }

  if (
    tType === 'reel' ||
    tType === 'video' ||
    tType === 'video_content' ||
    cType === 'videos' ||
    vType === 'reels' ||
    vType === 'shorts' ||
    vType === 'youtube' ||
    vType === 'long_video' ||
    title.includes('[reel]') ||
    title.startsWith('reel:')
  ) {
    return 'reel';
  }

  return 'post';
};

// ── Helper: classify deliverable type from ProjectMonthlyDeliverable ──────────
export const classifyDeliverableType = (contentType) => {
  const norm = (contentType || '').toLowerCase().trim();
  if (
    norm.includes('reel') ||
    norm.includes('short') ||
    norm.includes('video') ||
    norm.includes('youtube')
  ) {
    return 'reel';
  }
  if (norm.includes('story') || norm.includes('stories')) {
    return 'story';
  }
  return 'post';
};

// ── Helper: map task workflow status to tracker cell status ───────────────────
export const mapTaskStatusToCellStatus = (task) => {
  const pStatus = (task.postingStatus || '').toLowerCase();
  const status = (task.status || '').toLowerCase();

  if (pStatus === 'posted' || status === 'completed' || status === 'done' || status === 'approved') {
    return 'done';
  }
  if (status === 'rejected') {
    return 'skip';
  }
  if (
    pStatus === 'scheduled' ||
    ['in_progress', 'review', 'client_approval', 'smm_team', 'on_process', 'review_required'].includes(status)
  ) {
    return 'pending';
  }
  return 'todo';
};

// ── POST /api/smm/tracker/sync-tasks ─────────────────────────────────────────
// Syncs One-Page Tracker with Tasks and Project Monthly Deliverables:
// 1. Project monthly deliverables count sets target count for Reels and Posts in Plan
// 2. Task postingScheduleDate (post date) places tasks on corresponding day cells
export const syncTasksWithTracker = async (req, res) => {
  try {
    const month = parseInt(req.body.month, 10) || new Date().getMonth() + 1;
    const year  = parseInt(req.body.year, 10)  || new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();

    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const bufferStart = new Date(startOfMonth.getTime() - 24 * 3600 * 1000);
    const bufferEnd = new Date(endOfMonth.getTime() + 24 * 3600 * 1000);

    // 1. Fetch active projects within scope to map project -> client & client -> project
    const projects = await Project.find(withWorkspaceScope(req, { status: { $ne: 'cancelled' } }))
      .select('_id client name category')
      .lean();
    const projectToClient = new Map();
    const clientToProject = new Map();
    projects.forEach((p) => {
      if (p.client) {
        const cId = p.client.toString();
        projectToClient.set(p._id.toString(), cId);
        if (!clientToProject.has(cId) || p.category === 'smm' || p.category === 'social_media') {
          clientToProject.set(cId, p);
        }
      }
    });

    // 2. Fetch all active clients from both CRM Client and SmmClient within scope
    const [crmClients, smmClientsList] = await Promise.all([
      Client.find(withWorkspaceScope(req, { status: { $regex: /^active$/i } })).lean(),
      SmmClient.find(withWorkspaceScope(req, { status: { $regex: /^active$/i } })).lean(),
    ]);

    const clientMap = new Map();
    crmClients.forEach((c) => {
      clientMap.set(c._id.toString(), { _id: c._id, companyName: c.company || c.name || 'Client' });
    });
    smmClientsList.forEach((c) => {
      if (!clientMap.has(c._id.toString())) {
        clientMap.set(c._id.toString(), { _id: c._id, companyName: c.companyName || 'Client' });
      }
    });

    const nameToClientId = new Map();
    crmClients.forEach((c) => {
      const name = (c.company || c.name || '').trim().toLowerCase();
      if (name) nameToClientId.set(name, c._id.toString());
    });
    smmClientsList.forEach((c) => {
      const name = (c.companyName || '').trim().toLowerCase();
      if (name && !nameToClientId.has(name)) nameToClientId.set(name, c._id.toString());
    });

    // 3. Fetch monthly deliverables for this month and year from projects within scope
    const deliverables = await ProjectMonthlyDeliverable.find(withWorkspaceScope(req, { month, year })).lean();
    const deliverablesByClient = {};
    deliverables.forEach((d) => {
      const pIdStr = d.projectId?.toString();
      const cId = projectToClient.get(pIdStr);
      if (!cId) return;

      if (!deliverablesByClient[cId]) {
        deliverablesByClient[cId] = { reels: 0, posts: 0, stories: 0, total: 0, projectId: pIdStr };
      }
      const type = classifyDeliverableType(d.contentType);
      const qty = Number(d.targetQuantity) || 0;
      if (type === 'reel') deliverablesByClient[cId].reels += qty;
      else if (type === 'post') deliverablesByClient[cId].posts += qty;
      else if (type === 'story') deliverablesByClient[cId].stories += qty;
      deliverablesByClient[cId].total += qty;
    });

    // 4. Fetch content tasks — match by any date field in target month
    const rawTasks = await Task.find(withWorkspaceScope(req, {
      $and: [
        {
          $or: [
            { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
            { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
            { editDueDate: { $gte: bufferStart, $lte: bufferEnd } },
            { designDueDate: { $gte: bufferStart, $lte: bufferEnd } },
            { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
          ],
        },
        { isDevTask: { $ne: true } },
        { department: { $ne: 'Development' } },
        { taskCategory: { $ne: 'non_content' } },
      ],
    }))
      .populate('project', '_id client name')
      .populate('client', '_id company name')
      .lean();

    const tasks = rawTasks.filter((t) => isSmmTask(t));

    const tasksByClient = {};
    const clientProjectNameMap = new Map();

    tasks.forEach((t) => {
      let cId = t.client?._id?.toString() || (t.client ? t.client.toString() : null);
      if (!cId && t.project) {
        cId = t.project.client?._id?.toString() || (t.project.client ? t.project.client.toString() : null) || projectToClient.get(t.project._id?.toString());
      }
      if (!cId && t.clientName) {
        cId = nameToClientId.get(t.clientName.trim().toLowerCase());
      }
      if (cId) {
        if (!tasksByClient[cId]) tasksByClient[cId] = [];
        tasksByClient[cId].push(t);

        if (!clientMap.has(cId)) {
          const cName = t.client?.company || t.client?.name || t.clientName || 'Client';
          clientMap.set(cId, { _id: cId, companyName: cName });
        }

        if (t.project?.name) {
          clientProjectNameMap.set(cId, { id: t.project._id, name: t.project.name });
        }
      }
    });

    // ONLY sync clients that actually have SMM tasks OR active project deliverables
    const eligibleClientIds = new Set([
      ...Object.keys(tasksByClient),
      ...Object.keys(deliverablesByClient),
    ]);

    let updatedCount = 0;
    let syncedTaskCount = 0;

    for (const cId of eligibleClientIds) {
      const client = clientMap.get(cId) || { _id: cId, companyName: 'Client' };
      const clientTasks = tasksByClient[cId] || [];
      const clientDeliv = deliverablesByClient[cId];

      // If client has neither deliverables nor tasks scheduled, skip
      if (!clientDeliv && clientTasks.length === 0) {
        continue;
      }

      // Calculate reels, posts, stories target from project deliverables
      let reelsTarget = clientDeliv?.reels ?? 0;
      let postsTarget = clientDeliv?.posts ?? 0;
      let storiesTarget = clientDeliv?.stories ?? 0;

      // Fallback: If no project monthly deliverables found, fallback to count of scheduled tasks
      if (!clientDeliv || (reelsTarget === 0 && postsTarget === 0)) {
        const rTaskCount = clientTasks.filter((t) => classifyTaskContentType(t) === 'reel').length;
        const pTaskCount = clientTasks.filter((t) => classifyTaskContentType(t) === 'post').length;
        const sTaskCount = clientTasks.filter((t) => classifyTaskContentType(t) === 'story').length;
        if (reelsTarget === 0 && rTaskCount > 0) reelsTarget = rTaskCount;
        if (postsTarget === 0 && pTaskCount > 0) postsTarget = pTaskCount;
        if (storiesTarget === 0 && sTaskCount > 0) storiesTarget = sTaskCount;
      }

      const plan = `${reelsTarget}R + ${postsTarget}P`;
      const storyPlan = `${storiesTarget || 30} STORIES`;

      let tracker = await SmmMonthlyTracker.findOne({ client: client._id, month, year });
      const days = tracker?.days && tracker.days.length > 0 ? tracker.days : buildEmptyDays(year, month);

      // Sort tasks chronologically using best post date
      const getTaskDate = (t) =>
        t.postingScheduleDate || t.publishingDate || t.dueDate || t.editDueDate || t.designDueDate || t.createdAt;

      clientTasks.sort((a, b) => new Date(getTaskDate(a)) - new Date(getTaskDate(b)));

      // Find project for this client
      const projInfo = clientProjectNameMap.get(cId)
        || clientToProject.get(cId)
        || (clientDeliv?.projectId ? projects.find((p) => p._id.toString() === clientDeliv.projectId) : null);
      const projectId = projInfo?._id || projInfo?.id || null;
      const projectName = projInfo?.name || '';

      let reelIdx = 1, postIdx = 1, storyIdx = 1;
      clientTasks.forEach((task) => {
        const pDate = getTaskDate(task);
        if (!pDate) return;
        const dObj = new Date(pDate);
        let dayNum = dObj.getDate();
        if (dObj.getMonth() + 1 !== month && dObj.getUTCMonth() + 1 === month) {
          dayNum = dObj.getUTCDate();
        }
        if (dayNum < 1 || dayNum > daysInMonth) return;

        const dayCell = days.find((d) => d.day === dayNum);
        if (!dayCell) return;

        const timeStr = formatShortTime(task.publishingTime || pDate);
        const status = mapTaskStatusToCellStatus(task);
        const cType = classifyTaskContentType(task);

        let label = '';
        let itemType = 'post';

        if (cType === 'reel') {
          itemType = 'reel';
          label = `R${reelIdx++} ${timeStr}`.trim();
          dayCell.postLabel = label;
          dayCell.postStatus = status;
        } else if (cType === 'story') {
          itemType = 'story';
          label = `S${storyIdx++} ${timeStr}`.trim();
          dayCell.storyLabel = label;
          dayCell.storyStatus = status;
        } else {
          itemType = 'post';
          label = `P${postIdx++} ${timeStr}`.trim();
          dayCell.postLabel = label;
          dayCell.postStatus = status;
        }

        if (!dayCell.note && (task.description || task.notes)) {
          dayCell.note = (task.description || task.notes || '').slice(0, 200);
        }

        if (!Array.isArray(dayCell.items)) {
          dayCell.items = [];
        }
        const existingIdx = dayCell.items.findIndex((it) => it.id === task._id.toString());
        const dayItem = {
          id: task._id.toString(),
          type: itemType,
          label,
          time: timeStr,
          status,
          title: task.title || '',
          projectName: projectName || task.project?.name || '',
          clientName: client.companyName || task.client?.company || '',
          note: task.description || '',
          driveLink: task.rawFootageLink || '',
        };
        if (existingIdx >= 0) {
          dayCell.items[existingIdx] = dayItem;
        } else {
          dayCell.items.push(dayItem);
        }
        syncedTaskCount++;
      });

      // Mirror to SmmClient for consistency
      await SmmClient.findByIdAndUpdate(
        client._id,
        {
          $setOnInsert: {
            _id: client._id,
            companyName: client.companyName || 'Client',
            status: 'Active',
          },
        },
        { upsert: true }
      ).catch(() => {});

      await SmmMonthlyTracker.findOneAndUpdate(
        { client: client._id, month, year },
        {
          $set: {
            plan,
            storyPlan,
            days,
            project: projectId,
            projectName,
            organizationId: req.user?.organizationId,
            isExcluded: false,
            updatedBy: req.user?._id,
          },
        },
        { upsert: true, new: true }
      );
      updatedCount++;
    }

    emitLiveEvent('smmTrackerUpdated', { month, year });

    res.json({
      success: true,
      message: `Successfully synced ${syncedTaskCount} assigned SMM tasks across ${updatedCount} clients`,
      syncedClients: updatedCount,
      totalTasks: syncedTaskCount,
      totalDeliverables: deliverables.length,
    });
  } catch (err) {
    console.error('syncTasksWithTracker error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// ── GET /api/smm/tracker/client-deliverables-summary ────────────────────────
// Fetches deliverables and scheduled tasks for a single client for Add Client modal
export const getClientDeliverablesSummary = async (req, res) => {
  try {
    const { clientId } = req.query;
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year, 10)  || new Date().getFullYear();

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'clientId is required' });
    }

    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Find all projects for this client
    const projects = await Project.find({ client: clientId }).select('_id name category').lean();
    const projectIds = projects.map((p) => p._id);

    // Find ProjectMonthlyDeliverable for these projects
    const deliverables = await ProjectMonthlyDeliverable.find({
      projectId: { $in: projectIds },
      month,
      year,
    }).lean();

    let reelsCount = 0;
    let postsCount = 0;
    let storiesCount = 0;

    deliverables.forEach((d) => {
      const type = classifyDeliverableType(d.contentType);
      const qty = Number(d.targetQuantity) || 0;
      if (type === 'reel') reelsCount += qty;
      else if (type === 'post') postsCount += qty;
      else if (type === 'story') storiesCount += qty;
    });

    // Find assigned SMM tasks scheduled with postingScheduleDate, publishingDate, or dueDate
    const rawTasks = await Task.find({
      $or: [
        { client: clientId },
        { project: { $in: projectIds } },
      ],
      $and: [
        {
          $or: [
            { postingScheduleDate: { $gte: startOfMonth, $lte: endOfMonth } },
            { publishingDate: { $gte: startOfMonth, $lte: endOfMonth } },
            { dueDate: { $gte: startOfMonth, $lte: endOfMonth } },
          ],
        },
      ],
      taskCategory: { $in: ['content', 'smm'] },
      isDevTask: { $ne: true },
      department: { $ne: 'Development' },
    }).lean();

    const tasks = rawTasks.filter((t) => isSmmTask(t) && isTaskAssigned(t));

    const taskReels = tasks.filter((t) => classifyTaskContentType(t) === 'reel').length;
    const taskPosts = tasks.filter((t) => classifyTaskContentType(t) === 'post').length;
    const taskStories = tasks.filter((t) => classifyTaskContentType(t) === 'story').length;

    const finalReels = reelsCount > 0 ? reelsCount : taskReels;
    const finalPosts = postsCount > 0 ? postsCount : taskPosts;
    const finalStories = storiesCount > 0 ? storiesCount : taskStories;

    const items = tasks.map((t) => {
      const pDate = t.postingScheduleDate || t.publishingDate;
      const cType = classifyTaskContentType(t);
      return {
        id: t._id.toString(),
        title: t.title,
        taskType: t.taskType,
        contentType: cType === 'reel' ? 'Reel' : cType === 'story' ? 'Story' : 'Post',
        scheduledDate: pDate,
        postingStatus: t.postingStatus,
        status: t.status,
      };
    });

    res.json({
      success: true,
      reels: finalReels,
      posts: finalPosts,
      stories: finalStories,
      total: items.length,
      hasDeliverables: deliverables.length > 0,
      items,
    });
  } catch (err) {
    console.error('getClientDeliverablesSummary error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── POST /api/smm/tracker/sync-content ──────────────────────────────────────
// Auto-pulls Reels, Posts, and Stories from SmmContent module into the tracker
export const syncContentWithTracker = async (req, res) => {
  try {
    const month = parseInt(req.body.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.body.year)  || new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch all content items for this month
    const contents = await SmmContent.find({
      $or: [
        { scheduledDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { actualPostedDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { createdAt: { $gte: startOfMonth, $lte: endOfMonth } },
      ],
    }).populate('client', 'companyName name company').lean();

    // Map contents by client ID and client companyName
    const contentByClient = {};
    contents.forEach((item) => {
      const cId = item.client?._id?.toString();
      const cName = (item.client?.companyName || item.client?.company || item.client?.name || '').trim().toUpperCase();
      if (cId) {
        if (!contentByClient[cId]) contentByClient[cId] = [];
        contentByClient[cId].push(item);
      }
      if (cName) {
        if (!contentByClient[cName]) contentByClient[cName] = [];
        contentByClient[cName].push(item);
      }
    });

    // Fetch all active clients from BOTH CRM Client and SmmClient
    const [crmClients, smmClientsList] = await Promise.all([
      Client.find({ status: { $regex: /^active$/i } }).lean(),
      SmmClient.find({ status: { $regex: /^active$/i } }).lean(),
    ]);

    const clientMap = new Map();
    crmClients.forEach((c) => {
      clientMap.set(c._id.toString(), { _id: c._id, companyName: c.company || c.name || 'Client' });
    });
    smmClientsList.forEach((c) => {
      if (!clientMap.has(c._id.toString())) {
        clientMap.set(c._id.toString(), { _id: c._id, companyName: c.companyName || 'Client' });
      }
    });

    const clients = Array.from(clientMap.values());

    let updatedCount = 0;
    for (const client of clients) {
      const cId = client._id.toString();
      const cName = (client.companyName || '').trim().toUpperCase();
      const items = contentByClient[cId] || contentByClient[cName] || [];

      if (items.length === 0) continue;

      let tracker = await SmmMonthlyTracker.findOne({ client: client._id, month, year });
      const days = tracker?.days && tracker.days.length > 0 ? tracker.days : buildEmptyDays(year, month);

      let reelIdx = 1, postIdx = 1, storyIdx = 1;
      let reelsCount = 0, postsCount = 0, storiesCount = 0;

      // Sort items chronologically
      items.sort((a, b) => new Date(a.scheduledDate || a.createdAt) - new Date(b.scheduledDate || b.createdAt));

      items.forEach((item) => {
        const dDate = item.scheduledDate || item.actualPostedDate || item.createdAt;
        const dayNum = new Date(dDate).getDate();
        if (dayNum < 1 || dayNum > daysInMonth) return;

        const timeStr = formatShortTime(item.scheduledTime || item.actualPostedTime);
        const status = item.postingStatus === 'Published' ? 'done' : item.postingStatus === 'Cancelled' ? 'skip' : 'pending';

        const dayCell = days.find((d) => d.day === dayNum);
        if (!dayCell) return;

        if (['Reel', 'Video', 'Short'].includes(item.contentType)) {
          reelsCount++;
          dayCell.postLabel = `R${reelIdx++} ${timeStr}`.trim();
          dayCell.postStatus = status;
        } else if (item.contentType === 'Post') {
          postsCount++;
          dayCell.postLabel = `P${postIdx++} ${timeStr}`.trim();
          dayCell.postStatus = status;
        } else if (item.contentType === 'Story') {
          storiesCount++;
          dayCell.storyLabel = `S${storyIdx++} ${timeStr}`.trim();
          dayCell.storyStatus = status;
        } else if (item.contentType === 'Reel / Story') {
          reelsCount++;
          storiesCount++;
          dayCell.postLabel = `R${reelIdx++} ${timeStr}`.trim();
          dayCell.postStatus = status;
          dayCell.storyLabel = `S${storyIdx++} ${timeStr}`.trim();
          dayCell.storyStatus = status;
        }
      });

      const plan = `${reelsCount}R + ${postsCount}P`;
      const storyPlan = `${storiesCount || 30} STORIES`;

      await SmmMonthlyTracker.findOneAndUpdate(
        { client: client._id, month, year },
        {
          $set: {
            plan,
            storyPlan,
            days,
            isExcluded: false,
            updatedBy: req.user?._id,
          },
        },
        { upsert: true, new: true }
      );
      updatedCount++;
    }

    emitLiveEvent('smmTrackerUpdated', { month, year });

    res.json({
      success: true,
      message: `Successfully synced ${contents.length} content items across ${updatedCount} clients`,
      syncedClients: updatedCount,
      totalContents: contents.length,
    });
  } catch (err) {
    console.error('syncContentWithTracker error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── DELETE a tracker row ─────────────────────────────────────────────────────
export const deleteTracker = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteClient = req.query.deleteClient === 'true' || req.body?.deleteClient === true;
    const month = parseInt(req.query.month) || parseInt(req.body?.month);
    const year = parseInt(req.query.year) || parseInt(req.body?.year);
    const clientId = req.query.clientId || req.body?.clientId;

    let targetClientId = clientId;

    // If id is a valid Mongo tracker ID, locate tracker
    if (id && id !== 'scaffold' && id !== 'null' && id !== 'undefined') {
      const tracker = await SmmMonthlyTracker.findById(id);
      if (tracker) {
        if (!targetClientId && tracker.client) {
          targetClientId = tracker.client.toString();
        }
        if (!deleteClient) {
          tracker.isExcluded = true;
          tracker.updatedBy = req.user?._id;
          await tracker.save();
        }
      }
    }

    if (deleteClient && targetClientId) {
      // Permanently remove client and all trackers for this client
      await SmmMonthlyTracker.deleteMany({ client: targetClientId });
      await Promise.allSettled([
        SmmClient.findByIdAndDelete(targetClientId),
        Client.findByIdAndDelete(targetClientId),
      ]);

      emitLiveEvent('clientDeleted', targetClientId);
      emitLiveEvent('smmTrackerDeleted', { trackerId: id, clientId: targetClientId, month, year });
      emitLiveEvent('smmTrackerUpdated', { month, year });

      return res.json({ success: true, message: 'Client and all tracker data permanently deleted' });
    }

    if (!deleteClient && targetClientId && month && year) {
      // Exclude from this month's tracker so scaffold doesn't regenerate it
      await SmmMonthlyTracker.findOneAndUpdate(
        { client: targetClientId, month, year },
        {
          $set: {
            isExcluded: true,
            updatedBy: req.user?._id,
          },
          $setOnInsert: {
            days: buildEmptyDays(year, month),
            createdBy: req.user?._id,
          },
        },
        { upsert: true, new: true }
      );

      emitLiveEvent('smmTrackerDeleted', { trackerId: id, clientId: targetClientId, month, year });
      emitLiveEvent('smmTrackerUpdated', { month, year });

      return res.json({ success: true, message: 'Client removed from monthly tracker' });
    }

    emitLiveEvent('smmTrackerUpdated', { month, year });
    res.json({ success: true, message: 'Tracker updated' });
  } catch (err) {
    console.error('deleteTracker error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

