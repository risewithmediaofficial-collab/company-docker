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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getMonthMatchers = (month, year) => {
  const mIndex = Math.max(0, Math.min(11, (parseInt(month, 10) || 1) - 1));
  const fullMonth = MONTH_NAMES[mIndex];
  const shortMonth = fullMonth.slice(0, 3);
  const monthRegex = new RegExp(`(${fullMonth}|${shortMonth})`, 'i');

  const startOfMonth = new Date(year, mIndex, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, mIndex + 1, 0, 23, 59, 59, 999);
  const bufferStart = new Date(startOfMonth.getTime() - 24 * 3600 * 1000);
  const bufferEnd = new Date(endOfMonth.getTime() + 24 * 3600 * 1000);

  return { fullMonth, shortMonth, monthRegex, startOfMonth, endOfMonth, bufferStart, bufferEnd };
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

// ── Helper: format "18:30" -> "6:30P", "10:00" -> "10A" ─────────────────────
export const formatShortTime = (timeStr) => {
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
    title.startsWith('story:') ||
    title.includes('story #')
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
    title.startsWith('reel:') ||
    title.includes('reel #') ||
    title.includes('reel ')
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

// ── Helper: merge tasks into day cells ────────────────────────────────────────
export const mergeTasksIntoDays = (
  days,
  clientTasks = [],
  daysInMonth,
  projectName = '',
  clientCompanyName = ''
) => {
  if (!Array.isArray(days) || clientTasks.length === 0) return { days, modified: false, taskCount: 0 };

  let modified = false;
  let taskCount = 0;
  let reelIdx = 1, postIdx = 1, storyIdx = 1;

  const getTaskDate = (t) =>
    t.postingScheduleDate || t.publishingDate || t.dueDate || t.editDueDate || t.designDueDate || t.startDate || t.createdAt;

  const sortedTasks = [...clientTasks].sort((a, b) => new Date(getTaskDate(a)) - new Date(getTaskDate(b)));

  sortedTasks.forEach((task) => {
    const pDate = getTaskDate(task);
    let dayNum = null;

    if (pDate) {
      const dObj = new Date(pDate);
      if (!isNaN(dObj.getTime())) {
        dayNum = dObj.getDate();
      }
    }

    if (!dayNum || dayNum < 1 || dayNum > daysInMonth) {
      const dayMatch = (task.title || '').match(/\b(?:day|date)[-:\s]*(\d{1,2})\b/i);
      if (dayMatch) {
        const parsedDay = parseInt(dayMatch[1], 10);
        if (parsedDay >= 1 && parsedDay <= daysInMonth) {
          dayNum = parsedDay;
        }
      }
    }

    if (!dayNum || dayNum < 1) dayNum = 1;
    if (dayNum > daysInMonth) dayNum = daysInMonth;

    const dayCell = days.find((d) => d.day === dayNum);
    if (!dayCell) return;

    const cType = classifyTaskContentType(task);
    const status = mapTaskStatusToCellStatus(task);
    const timeStr = formatShortTime(task.publishingTime || task.postingScheduleDate || pDate);

    // Extract reel/post/story number from title if present (e.g. "Reel #1: ...", "Post 2 - ...")
    let label = '';
    const reelMatch = (task.title || '').match(/reel\s*#?\s*(\d+)/i);
    const postMatch = (task.title || '').match(/post\s*#?\s*(\d+)/i);
    const storyMatch = (task.title || '').match(/story\s*#?\s*(\d+)/i);

    if (cType === 'reel') {
      const num = reelMatch ? parseInt(reelMatch[1], 10) : reelIdx++;
      label = `R${num} ${timeStr}`.trim();
    } else if (cType === 'story') {
      const num = storyMatch ? parseInt(storyMatch[1], 10) : storyIdx++;
      label = `S${num} ${timeStr}`.trim();
    } else {
      const num = postMatch ? parseInt(postMatch[1], 10) : postIdx++;
      label = `P${num} ${timeStr}`.trim();
    }

    if (!Array.isArray(dayCell.items)) {
      dayCell.items = [];
    }

    const taskIdStr = task._id?.toString();
    const existingIdx = taskIdStr ? dayCell.items.findIndex((it) => it.id === taskIdStr) : -1;
    const itemType = cType === 'story' ? 'story' : cType === 'reel' ? 'reel' : 'post';

    const dayItem = {
      id: taskIdStr || '',
      type: itemType,
      label,
      time: timeStr,
      status,
      title: task.title || '',
      projectName: projectName || task.project?.name || '',
      clientName: clientCompanyName || task.client?.company || '',
      note: task.description || '',
      driveLink: task.rawFootageLink || task.driveLink || '',
      postingDate: task.postingScheduleDate || task.publishingDate || pDate,
    };

    if (existingIdx >= 0) {
      dayCell.items[existingIdx] = { ...dayCell.items[existingIdx], ...dayItem };
    } else {
      dayCell.items.push(dayItem);
    }

    if (cType === 'reel' || cType === 'post') {
      if (!hasPosterContent(dayCell.postLabel)) {
        dayCell.postLabel = label;
        dayCell.postStatus = status;
        modified = true;
      } else if (status === 'done' && dayCell.postStatus !== 'done') {
        dayCell.postStatus = 'done';
        modified = true;
      }
    }

    if (cType === 'story') {
      if (!hasPosterContent(dayCell.storyLabel)) {
        dayCell.storyLabel = label;
        dayCell.storyStatus = status;
        modified = true;
      } else if (status === 'done' && dayCell.storyStatus !== 'done') {
        dayCell.storyStatus = 'done';
        modified = true;
      }
    }

    taskCount++;
  });

  return { days, modified, taskCount };
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

      const { monthRegex, bufferStart, bufferEnd } = getMonthMatchers(month, year);
      const rawClientTasks = await Task.find({
        $or: [
          { client: { $in: clientIds } },
          { clientName: { $regex: new RegExp(`^${(client.companyName || '').trim()}$`, 'i') } },
        ],
        $and: [
          {
            $or: [
              { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
              { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
              { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
              { title: monthRegex },
            ],
          },
          { isDevTask: { $ne: true } },
          { department: { $ne: 'Development' } },
          { taskCategory: { $ne: 'non_content' } },
        ],
      }).lean();

      const clientTasks = rawClientTasks.filter((t) => isSmmTask(t));

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

        if (clientTasks.length > 0) {
          const { modified: tasksMod } = mergeTasksIntoDays(
            updatedDays,
            clientTasks,
            daysInMonth,
            tracker.projectName || '',
            clientObj.companyName
          );
          if (tasksMod) modified = true;
        }

        if (modified && tracker._id) {
          SmmMonthlyTracker.findByIdAndUpdate(tracker._id, { $set: { days: updatedDays } }).catch(() => {});
        }

        rowData = { ...tracker, days: updatedDays, client: clientObj };
      } else {
        const scaffoldDays = buildEmptyDays(year, month);
        mergeTasksIntoDays(
          scaffoldDays,
          clientTasks,
          daysInMonth,
          '',
          clientObj.companyName
        );
        let rCount = clientTasks.filter((t) => classifyTaskContentType(t) === 'reel').length;
        let pCount = clientTasks.filter((t) => classifyTaskContentType(t) === 'post').length;
        let sCount = clientTasks.filter((t) => classifyTaskContentType(t) === 'story').length;
        const plan = (rCount > 0 || pCount > 0) ? `${rCount}R + ${pCount}P` : '';
        const storyPlan = sCount > 0 ? `${sCount} STORIES` : '30 STORIES';

        rowData = {
          _id: null,
          client: clientObj,
          team: 'RWM',
          plan,
          storyPlan,
          month,
          year,
          days: scaffoldDays,
          _scaffold: true,
        };
      }

      return res.json({ success: true, data: { rows: [rowData], month, year, daysInMonth } });
    }

    // 1. Fetch active projects within scope to map client -> project
    const projectFilter = withWorkspaceScope(req, { status: { $ne: 'cancelled' } });
    const projects = await Project.find(projectFilter).select('_id client name category').lean();
    const clientToProject = new Map();
    const projectToClient = new Map();
    projects.forEach((p) => {
      if (p.client) {
        const cId = p.client.toString();
        projectToClient.set(p._id.toString(), cId);
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
    const nameToClientId = new Map();

    crmClients.forEach((c) => {
      const cName = c.company || c.name || 'Client';
      const cIdStr = c._id.toString();
      clientMap.set(cIdStr, {
        _id: c._id,
        clientId: c.clientId,
        companyName: cName,
        status: 'Active',
      });
      const norm = cName.trim().toLowerCase();
      if (norm && !nameToClientId.has(norm)) {
        nameToClientId.set(norm, cIdStr);
      }
      // Background mirror to SmmClient for consistency
      SmmClient.findByIdAndUpdate(
        c._id,
        {
          $setOnInsert: {
            _id: c._id,
            clientId: c.clientId,
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
      const cIdStr = c._id.toString();
      const cName = c.companyName || 'Client';
      if (!clientMap.has(cIdStr)) {
        clientMap.set(cIdStr, {
          _id: c._id,
          clientId: c.clientId,
          companyName: cName,
          status: c.status || 'Active',
        });
      }
      const norm = cName.trim().toLowerCase();
      if (norm && !nameToClientId.has(norm)) {
        nameToClientId.set(norm, cIdStr);
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
      extraCrm.forEach((c) => {
        const cIdStr = c._id.toString();
        const cName = c.company || c.name || 'Client';
        clientMap.set(cIdStr, { _id: c._id, clientId: c.clientId, companyName: cName, status: 'Active' });
        const norm = cName.trim().toLowerCase();
        if (norm && !nameToClientId.has(norm)) nameToClientId.set(norm, cIdStr);
      });
      extraSmm.forEach((c) => {
        const cIdStr = c._id.toString();
        const cName = c.companyName || 'Client';
        if (!clientMap.has(cIdStr)) {
          clientMap.set(cIdStr, { _id: c._id, clientId: c.clientId, companyName: cName, status: c.status || 'Active' });
          const norm = cName.trim().toLowerCase();
          if (norm && !nameToClientId.has(norm)) nameToClientId.set(norm, cIdStr);
        }
      });
    }

    // 4. Check which clients have SMM tasks for this month
    const { monthRegex, bufferStart, bufferEnd } = getMonthMatchers(month, year);

    // Target project IDs explicitly mapped to this month (by name or deliverable)
    const monthProjectIds = projects
      .filter((p) => p.name && monthRegex.test(p.name))
      .map((p) => p._id.toString());

    // 5. Check which clients have monthly deliverables
    const deliverables = await ProjectMonthlyDeliverable.find(withWorkspaceScope(req, { month, year })).lean();
    const clientsWithDeliverables = new Set();
    const deliverablesByClient = {};
    const deliverableProjectIds = [];

    deliverables.forEach((d) => {
      const pIdStr = d.projectId?.toString();
      if (pIdStr) deliverableProjectIds.push(pIdStr);
      const proj = projects.find((p) => p._id.toString() === pIdStr);
      const cId = proj?.client ? proj.client.toString() : projectToClient.get(pIdStr);
      if (cId) {
        clientsWithDeliverables.add(cId);
        if (!deliverablesByClient[cId]) {
          deliverablesByClient[cId] = { reels: 0, posts: 0, stories: 0, total: 0, projectId: pIdStr };
        }
        const type = classifyDeliverableType(d.contentType);
        const qty = Number(d.targetQuantity) || 0;
        if (type === 'reel') deliverablesByClient[cId].reels += qty;
        else if (type === 'post') deliverablesByClient[cId].posts += qty;
        else if (type === 'story') deliverablesByClient[cId].stories += qty;
        deliverablesByClient[cId].total += qty;
      }
    });

    const targetProjectIds = Array.from(new Set([...monthProjectIds, ...deliverableProjectIds]));

    const taskQueryOr = [
      { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
      { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
      { editDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { designDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { startDate: { $gte: bufferStart, $lte: bufferEnd } },
      { title: monthRegex },
    ];

    if (targetProjectIds.length > 0) {
      taskQueryOr.push({ project: { $in: targetProjectIds } });
    }

    const rawMonthTasks = await Task.find(withWorkspaceScope(req, {
      $and: [
        { $or: taskQueryOr },
        { isDevTask: { $ne: true } },
        { department: { $ne: 'Development' } },
        { taskCategory: { $ne: 'non_content' } },
      ],
    })).populate('project', '_id name client').populate('client', '_id company name').lean();

    const monthTasks = rawMonthTasks.filter((t) => isSmmTask(t));
    const clientsWithTasks = new Set();
    const tasksByClient = {};
    const tasksByCompanyName = new Map();

    monthTasks.forEach((t) => {
      let cId = t.client?._id?.toString() || (t.client ? t.client.toString() : null) || (t.project?.client ? t.project.client.toString() : null) || projectToClient.get(t.project?._id?.toString());
      if (!cId && t.clientName) {
        cId = nameToClientId.get(t.clientName.trim().toLowerCase());
      }
      if (cId) {
        clientsWithTasks.add(cId);
        if (!tasksByClient[cId]) tasksByClient[cId] = [];
        tasksByClient[cId].push(t);
        if (t.project && !clientToProject.has(cId)) {
          clientToProject.set(cId, t.project);
        }
      }

      // Also index by company name and project name for cross-matching
      const compName = (t.client?.company || t.client?.name || t.clientName || '').trim().toLowerCase();
      if (compName) {
        if (!tasksByCompanyName.has(compName)) tasksByCompanyName.set(compName, []);
        tasksByCompanyName.get(compName).push(t);
      }
      if (t.project?.name) {
        const pKey = `proj::${t.project.name.trim().toLowerCase()}`;
        if (!tasksByCompanyName.has(pKey)) tasksByCompanyName.set(pKey, []);
        tasksByCompanyName.get(pKey).push(t);
      }
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

        const clientObj = clientMap.get(cIdStr) || { _id: t.client, companyName: 'Client', status: 'Active' };
        const proj = clientToProject.get(cIdStr) || null;
        const projectName = t.projectName || proj?.name || '';
        const compKey = (clientObj.companyName || '').trim().toLowerCase();
        const pKey = projectName ? `proj::${projectName.trim().toLowerCase()}` : '';

        // Live merge scheduled tasks into updatedDays for real-time visibility
        const clientMonthTasks = tasksByClient[cIdStr]
          || (compKey ? tasksByCompanyName.get(compKey) : null)
          || (pKey ? tasksByCompanyName.get(pKey) : null)
          || [];

        if (clientMonthTasks.length > 0) {
          const { modified: tasksMod } = mergeTasksIntoDays(
            updatedDays,
            clientMonthTasks,
            daysInMonth,
            projectName,
            clientObj.companyName
          );
          if (tasksMod) modified = true;
        }

        if (modified && t._id) {
          SmmMonthlyTracker.findByIdAndUpdate(t._id, { $set: { days: updatedDays } }).catch(() => {});
        }

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
    const seenCompanyKeys = new Set();
    const rows = [];

    // 1. Process all existing (saved) trackers first
    for (const existing of existingPopulatedList) {
      if (existing.isExcluded) continue;
      const cIdStr = existing.client?._id?.toString() || existing.client?.toString();
      const compKey = (existing.client?.companyName || '').trim().toLowerCase();
      if (compKey) seenCompanyKeys.add(compKey);
      if (cIdStr) handledClientIds.add(cIdStr);
      rows.push(existing);
    }

    // 2. Only scaffold clients that do NOT already have a row for this company
    for (const [cIdStr, client] of clientMap.entries()) {
      if (handledClientIds.has(cIdStr)) continue;
      const compKey = (client.companyName || '').trim().toLowerCase();
      if (compKey && seenCompanyKeys.has(compKey)) {
        continue; // Already has a tracker row for this company
      }

      const proj = clientToProject.get(cIdStr);
      const pKey = proj?.name ? `proj::${proj.name.trim().toLowerCase()}` : '';
      const clientMonthTasks = tasksByClient[cIdStr]
        || (compKey ? tasksByCompanyName.get(compKey) : null)
        || (pKey ? tasksByCompanyName.get(pKey) : null)
        || [];

      const hasTasks = clientMonthTasks.length > 0 || clientsWithTasks.has(cIdStr);
      const hasDelivs = clientsWithDeliverables.has(cIdStr);
      const isSmmProj = proj && (proj.category === 'smm' || proj.category === 'social_media');

      if (hasTasks || hasDelivs || isSmmProj) {
        if (compKey) seenCompanyKeys.add(compKey);
        handledClientIds.add(cIdStr);

        const scaffoldDays = buildEmptyDays(year, month);
        mergeTasksIntoDays(
          scaffoldDays,
          clientMonthTasks,
          daysInMonth,
          proj?.name || '',
          client.companyName
        );

        const clientDeliv = deliverablesByClient[cIdStr];
        let reelsTarget = clientDeliv?.reels ?? 0;
        let postsTarget = clientDeliv?.posts ?? 0;
        let storiesTarget = clientDeliv?.stories ?? 0;

        if (reelsTarget === 0 && postsTarget === 0) {
          const rCount = clientMonthTasks.filter((t) => classifyTaskContentType(t) === 'reel').length;
          const pCount = clientMonthTasks.filter((t) => classifyTaskContentType(t) === 'post').length;
          const sCount = clientMonthTasks.filter((t) => classifyTaskContentType(t) === 'story').length;
          if (rCount > 0) reelsTarget = rCount;
          if (pCount > 0) postsTarget = pCount;
          if (sCount > 0) storiesTarget = sCount;
        }

        const plan = (reelsTarget > 0 || postsTarget > 0) ? `${reelsTarget}R + ${postsTarget}P` : '';
        const storyPlan = `${storiesTarget || 30} STORIES`;

        rows.push({
          _id: null,
          client: { _id: client._id, clientId: client.clientId, companyName: client.companyName },
          projectName: proj?.name || '',
          project: proj ? { _id: proj._id, name: proj.name } : null,
          team: 'RWM',
          plan,
          storyPlan,
          month,
          year,
          days: scaffoldDays,
          _scaffold: true,
        });
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

// ── POST /api/smm/tracker/sync-tasks ─────────────────────────────────────────
// Syncs One-Page Tracker with Tasks and Project Monthly Deliverables:
// 1. Project monthly deliverables count sets target count for Reels and Posts in Plan
// 2. Task postingScheduleDate (post date) places tasks on corresponding day cells
export const syncTasksWithTracker = async (req, res) => {
  try {
    const month = parseInt(req.body.month, 10) || new Date().getMonth() + 1;
    const year  = parseInt(req.body.year, 10)  || new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();

    const { monthRegex, startOfMonth, endOfMonth, bufferStart, bufferEnd } = getMonthMatchers(month, year);

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

    // 4. Fetch content tasks — match either by date in month, project name matching month, title matching month, or deliverable projects
    const allTargetProjectIds = Array.from(new Set([
      ...projects.filter((p) => p.name && monthRegex.test(p.name)).map((p) => p._id.toString()),
      ...deliverables.map((d) => d.projectId?.toString()).filter(Boolean),
    ]));

    const taskQueryOr = [
      { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
      { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
      { editDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { designDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { startDate: { $gte: bufferStart, $lte: bufferEnd } },
      { title: monthRegex },
    ];

    if (allTargetProjectIds.length > 0) {
      taskQueryOr.push({ project: { $in: allTargetProjectIds } });
    }

    const rawTasks = await Task.find(withWorkspaceScope(req, {
      $and: [
        { $or: taskQueryOr },
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
        t.postingScheduleDate || t.publishingDate || t.dueDate || t.editDueDate || t.designDueDate || t.startDate || t.createdAt;

      clientTasks.sort((a, b) => new Date(getTaskDate(a)) - new Date(getTaskDate(b)));

      // Find project for this client
      const projInfo = clientProjectNameMap.get(cId)
        || clientToProject.get(cId)
        || (clientDeliv?.projectId ? projects.find((p) => p._id.toString() === clientDeliv.projectId) : null);
      const projectId = projInfo?._id || projInfo?.id || null;
      const projectName = projInfo?.name || '';

      mergeTasksIntoDays(days, clientTasks, daysInMonth, projectName, client.companyName);
      syncedTaskCount += clientTasks.length;

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

      const updateFields = {
        plan,
        storyPlan,
        days,
        project: projectId,
        projectName,
        isExcluded: false,
      };
      if (mongoose.Types.ObjectId.isValid(req.user?.organizationId)) {
        updateFields.organizationId = req.user.organizationId;
      }
      if (mongoose.Types.ObjectId.isValid(req.user?._id)) {
        updateFields.updatedBy = req.user._id;
      }

      await SmmMonthlyTracker.findOneAndUpdate(
        { client: client._id, month, year },
        { $set: updateFields },
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

    const { monthRegex, bufferStart, bufferEnd } = getMonthMatchers(month, year);

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

    const taskDateOr = [
      { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
      { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
      { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { startDate: { $gte: bufferStart, $lte: bufferEnd } },
      { title: monthRegex },
    ];

    const rawTasks = await Task.find({
      $or: [
        { client: clientId },
        { project: { $in: projectIds } },
      ],
      $and: [
        { $or: taskDateOr },
      ],
      isDevTask: { $ne: true },
      department: { $ne: 'Development' },
      taskCategory: { $ne: 'non_content' },
    }).lean();

    const tasks = rawTasks.filter((t) => isSmmTask(t));

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

// ── POST /api/smm/tracker/bulk-delete ─────────────────────────────────────────
// Bulk delete / exclude multiple tracker rows at once
export const bulkDeleteTrackers = async (req, res) => {
  try {
    const { items = [], clientIds = [], month, year, deleteClient = false } = req.body;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    const targetClientIds = new Set(clientIds.filter(Boolean));
    const targetTrackerIds = new Set();

    items.forEach((it) => {
      if (it.clientId) targetClientIds.add(it.clientId.toString());
      if (it.trackerId && it.trackerId !== 'scaffold' && it.trackerId !== 'null' && it.trackerId !== 'undefined') {
        targetTrackerIds.add(it.trackerId.toString());
      }
    });

    const cIdsArray = Array.from(targetClientIds);
    const tIdsArray = Array.from(targetTrackerIds);

    if (cIdsArray.length === 0 && tIdsArray.length === 0) {
      return res.status(400).json({ success: false, message: 'No items or clients specified for deletion' });
    }

    if (deleteClient) {
      // Permanently delete clients and all their tracker docs
      if (tIdsArray.length > 0) {
        await SmmMonthlyTracker.deleteMany({ _id: { $in: tIdsArray } });
      }
      if (cIdsArray.length > 0) {
        await SmmMonthlyTracker.deleteMany({ client: { $in: cIdsArray } });
        await Promise.allSettled([
          SmmClient.deleteMany({ _id: { $in: cIdsArray } }),
          Client.deleteMany({ _id: { $in: cIdsArray } }),
        ]);
        cIdsArray.forEach((cId) => emitLiveEvent('clientDeleted', cId));
      }

      emitLiveEvent('smmTrackerDeleted', { month: m, year: y, bulk: true });
      emitLiveEvent('smmTrackerUpdated', { month: m, year: y });

      return res.json({
        success: true,
        message: `Permanently deleted ${Math.max(cIdsArray.length, tIdsArray.length)} client(s) and their tracker history`,
        count: Math.max(cIdsArray.length, tIdsArray.length),
      });
    }

    // Otherwise, mark as isExcluded for this month so scaffold and views exclude them
    const updateOps = [];

    if (tIdsArray.length > 0) {
      updateOps.push(
        SmmMonthlyTracker.updateMany(
          { _id: { $in: tIdsArray } },
          { $set: { isExcluded: true, updatedBy: req.user?._id } }
        )
      );
    }

    for (const cId of cIdsArray) {
      updateOps.push(
        SmmMonthlyTracker.findOneAndUpdate(
          { client: cId, month: m, year: y },
          {
            $set: { isExcluded: true, updatedBy: req.user?._id },
            $setOnInsert: { days: buildEmptyDays(y, m), createdBy: req.user?._id },
          },
          { upsert: true }
        )
      );
    }

    await Promise.all(updateOps);

    emitLiveEvent('smmTrackerDeleted', { month: m, year: y, bulk: true });
    emitLiveEvent('smmTrackerUpdated', { month: m, year: y });

    return res.json({
      success: true,
      message: `Removed ${Math.max(cIdsArray.length, tIdsArray.length)} client(s) from this month's tracker`,
      count: Math.max(cIdsArray.length, tIdsArray.length),
    });
  } catch (err) {
    console.error('bulkDeleteTrackers error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

