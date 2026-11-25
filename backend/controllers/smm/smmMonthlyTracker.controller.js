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

// ── Helper: verify if task is planned/scheduled for target month & year ─────
export const isTaskInTargetMonth = (task, targetMonth, targetYear, monthRegex = null) => {
  if (!task || !targetMonth || !targetYear) return false;

  const dateValues = [
    task.postingScheduleDate,
    task.publishingDate,
    task.dueDate,
    task.editDueDate,
    task.designDueDate,
    task.startDate,
  ].filter(Boolean);

  if (dateValues.length > 0) {
    // If any date exists, task MUST strictly fall into targetMonth and targetYear
    return dateValues.some((d) => {
      const dObj = new Date(d);
      return (
        !isNaN(dObj.getTime()) &&
        dObj.getMonth() + 1 === targetMonth &&
        dObj.getFullYear() === targetYear
      );
    });
  }

  // If no scheduled date exists at all, match monthRegex in title if provided
  if (monthRegex && task.title && monthRegex.test(task.title)) {
    return true;
  }

  return false;
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

const ALL_MONTHS_REGEX = /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\b/i;

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

export const isProjectInTargetMonth = (
  project,
  targetMonth,
  targetYear,
  { monthRegex, startOfMonth, endOfMonth, hasDeliverables = false, hasTasks = false } = {}
) => {
  if (!project || !targetMonth || !targetYear) return false;

  const pName = String(project.name || '').trim();
  const matchers = monthRegex && startOfMonth && endOfMonth
    ? { monthRegex, startOfMonth, endOfMonth }
    : getMonthMatchers(targetMonth, targetYear);

  // 1. If the project name explicitly specifies a month (e.g. "Client - Oct 2026"), match strictly against targetMonth/targetYear
  if (pName && ALL_MONTHS_REGEX.test(pName)) {
    if (!matchers.monthRegex.test(pName)) return false;
    const yearMatch = pName.match(/\b(20\d{2})\b/);
    if (yearMatch && Number(yearMatch[1]) !== Number(targetYear)) return false;
    return true;
  }

  // 2. If the project has monthly deliverables or scheduled SMM tasks specifically for this month/year
  if (hasDeliverables || hasTasks) {
    return true;
  }

  // 3. Check project startDate / dueDate range overlap against [startOfMonth, endOfMonth]
  const start = project.startDate ? new Date(project.startDate) : null;
  const due = project.dueDate ? new Date(project.dueDate) : null;
  const hasValidStart = start && !isNaN(start.getTime());
  const hasValidDue = due && !isNaN(due.getTime());

  if (hasValidStart && hasValidDue) {
    return start <= matchers.endOfMonth && due >= matchers.startOfMonth;
  }
  if (hasValidDue) {
    return due >= matchers.startOfMonth && due <= matchers.endOfMonth;
  }
  if (hasValidStart) {
    return start >= matchers.startOfMonth && start <= matchers.endOfMonth;
  }

  // 4. Fallback when no dates, no month name, no deliverables, and no tasks: match createdAt month
  if (project.createdAt) {
    const created = new Date(project.createdAt);
    if (!isNaN(created.getTime())) {
      return created >= matchers.startOfMonth && created <= matchers.endOfMonth;
    }
  }

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
    let smmC = user.clientId ? await SmmClient.findById(user.clientId).select('_id companyName primaryContact email phone').lean() : null;
    if (!smmC && user.email) {
      smmC = await SmmClient.findOne({ email: user.email }).select('_id companyName primaryContact email phone').lean();
    }
    if (smmC) {
      return {
        id: smmC._id.toString(),
        smmId: smmC._id.toString(),
        companyName: smmC.companyName,
        clientName: smmC.primaryContact || '',
        contactName: smmC.primaryContact || '',
      };
    }
  }
  if (client) {
    let smmId = client._id.toString();
    const smmC = await SmmClient.findById(client._id).select('_id companyName primaryContact').lean()
      || (client.company ? await SmmClient.findOne({ companyName: { $regex: new RegExp(`^${client.company.trim()}$`, 'i') } }).select('_id companyName primaryContact').lean() : null);
    const contName = client.contactName || (client.company && client.name !== client.company ? client.name : (smmC?.primaryContact || ''));
    return {
      id: client._id.toString(),
      smmId: smmC ? smmC._id.toString() : client._id.toString(),
      companyName: client.company || client.name,
      clientName: contName,
      contactName: contName,
    };
  }
  return null;
};

// ── Helper: format "18:30" -> "6:30P", "10:00" -> "10A" ─────────────────────
export const formatShortTime = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr instanceof Date) {
    const h = timeStr.getHours();
    const m = timeStr.getMinutes();
    // Ignore midnight 00:00:00 (pure date without explicit scheduled time)
    if (h === 0 && m === 0 && timeStr.getSeconds() === 0) {
      return '';
    }
    const ampm = h >= 12 ? 'P' : 'A';
    const h12 = h % 12 || 12;
    const mStr = String(m).padStart(2, '0');
    return mStr === '00' ? `${h12}${ampm}` : `${h12}:${mStr}${ampm}`;
  }
  const str = String(timeStr).trim();
  if (!str) return '';

  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes();
      if (h === 0 && m === 0 && d.getSeconds() === 0) {
        return '';
      }
      const ampm = h >= 12 ? 'P' : 'A';
      const h12 = h % 12 || 12;
      const mStr = String(m).padStart(2, '0');
      return mStr === '00' ? `${h12}${ampm}` : `${h12}:${mStr}${ampm}`;
    }
  }

  // 12-hour format e.g. "6:30 PM", "7pm", "08:30 AM", "6P"
  const match12 = str.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m|[ap])$/i);
  if (match12) {
    const h = parseInt(match12[1], 10);
    const m = match12[2] || '00';
    const ap = match12[3].toUpperCase().startsWith('P') ? 'P' : 'A';
    return m === '00' ? `${h}${ap}` : `${h}:${m}${ap}`;
  }

  // 24-hour format e.g. "18:30", "09:00"
  const match24 = str.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    let h = parseInt(match24[1], 10);
    const m = match24[2];
    const ampm = h >= 12 ? 'P' : 'A';
    h = h % 12 || 12;
    return m === '00' ? `${h}${ampm}` : `${h}:${m}${ampm}`;
  }

  return str;
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

// ── Helper: format plan deliverables string (e.g. "15R + 10P", "15R", "10P") ──
export const formatPlanDeliverables = ({
  reels = 0,
  posts = 0,
  fallbackPlan = '',
  tasks = [],
  days = [],
} = {}) => {
  const r = Number(reels) || 0;
  const p = Number(posts) || 0;

  // 1. Quotas explicitly supplied (from ProjectMonthlyDeliverable)
  if (r > 0 && p > 0) {
    return `${r}R + ${p}P`;
  }
  if (r > 0) {
    return `${r}R`;
  }
  if (p > 0) {
    return `${p}P`;
  }

  // 2. If fallbackPlan was manually saved with R or P notation, preserve it
  if (fallbackPlan && typeof fallbackPlan === 'string' && /[rp]/i.test(fallbackPlan)) {
    return fallbackPlan.trim();
  }

  // 3. Detect from scheduled tasks
  if (Array.isArray(tasks) && tasks.length > 0) {
    let tReels = 0;
    let tPosts = 0;
    for (const t of tasks) {
      const type = classifyTaskContentType(t);
      if (type === 'reel') tReels++;
      else if (type === 'post') tPosts++;
    }
    if (tReels > 0 && tPosts > 0) return `${tReels}R + ${tPosts}P`;
    if (tReels > 0) return `${tReels}R`;
    if (tPosts > 0) return `${tPosts}P`;
  }

  // 4. Detect from day cells items/postLabel
  if (Array.isArray(days) && days.length > 0) {
    let dayReels = 0;
    let dayPosts = 0;
    for (const d of days) {
      if (Array.isArray(d.items) && d.items.length > 0) {
        for (const it of d.items) {
          if (it.type === 'reel') dayReels++;
          else if (it.type === 'post') dayPosts++;
        }
      } else if (d.postLabel) {
        const lbl = String(d.postLabel).trim().toUpperCase();
        if (lbl.startsWith('R') || lbl.includes('REEL')) dayReels++;
        else if (lbl.startsWith('P') || lbl.startsWith('POST')) dayPosts++;
      }
    }
    if (dayReels > 0 && dayPosts > 0) return `${dayReels}R + ${dayPosts}P`;
    if (dayReels > 0) return `${dayReels}R`;
    if (dayPosts > 0) return `${dayPosts}P`;
  }

  // 5. If fallbackPlan is plain number or string, return it
  if (fallbackPlan && typeof fallbackPlan === 'string' && fallbackPlan.trim()) {
    return fallbackPlan.trim();
  }

  if (Array.isArray(tasks) && tasks.length > 0) {
    return `${tasks.length}P`;
  }

  return '';
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
  // Scheduled post on exact date: ready to post
  const isScheduledPost = Boolean(task.postingScheduleDate || task.publishingDate);
  if (isScheduledPost && (pStatus === 'scheduled' || status === 'to do' || status === 'todo' || status === 'scheduled')) {
    return 'todo';
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
  clientCompanyName = '',
  targetMonth = null,
  targetYear = null
) => {
  if (!Array.isArray(days) || clientTasks.length === 0) return { days, modified: false, taskCount: 0 };

  let modified = false;
  let taskCount = 0;
  let reelIdx = 1, postIdx = 1, storyIdx = 1;

  // Filter tasks to only those planned for the target month & year
  const validTasks = (targetMonth && targetYear)
    ? clientTasks.filter((t) => isTaskInTargetMonth(t, targetMonth, targetYear))
    : clientTasks;

  const getTaskDate = (t) => {
    const dates = [
      t.postingScheduleDate,
      t.publishingDate,
      t.dueDate,
      t.editDueDate,
      t.designDueDate,
      t.startDate,
    ].filter(Boolean);

    if (targetMonth && targetYear) {
      const match = dates.find((d) => {
        const dObj = new Date(d);
        return (
          !isNaN(dObj.getTime()) &&
          dObj.getMonth() + 1 === targetMonth &&
          dObj.getFullYear() === targetYear
        );
      });
      if (match) return match;
    }
    return dates[0] || null;
  };

  const sortedTasks = [...validTasks].sort((a, b) => {
    const da = getTaskDate(a);
    const db = getTaskDate(b);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return new Date(da) - new Date(db);
  });

  sortedTasks.forEach((task) => {
    const pDate = getTaskDate(task);
    let dayNum = null;

    if (pDate) {
      const dObj = new Date(pDate);
      if (!isNaN(dObj.getTime())) {
        if (targetMonth && targetYear) {
          if (dObj.getMonth() + 1 === targetMonth && dObj.getFullYear() === targetYear) {
            dayNum = dObj.getDate();
          }
        } else {
          dayNum = dObj.getDate();
        }
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

    // Never default unplaced/out-of-month tasks to day 1; skip if no valid day in this month
    if (!dayNum || dayNum < 1 || dayNum > daysInMonth) {
      return;
    }

    const dayCell = days.find((d) => d.day === dayNum);
    if (!dayCell) return;

    const cType = classifyTaskContentType(task);
    const status = mapTaskStatusToCellStatus(task);

    // Look for explicit time or scheduled posting time
    const explicitTime = task.publishingTime || task.dueTime;
    let timeStr = explicitTime
      ? formatShortTime(explicitTime)
      : formatShortTime(task.postingScheduleDate || task.publishingDate);

    // If still no time, check title for time e.g. "Reel #2 at 6:30 PM"
    if (!timeStr && task.title) {
      const titleTimeMatch = task.title.match(/\b((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:AM|PM|am|pm|[apAP])|(?:[01]?[0-9]|2[0-3]):[0-5][0-9])\b/i);
      if (titleTimeMatch) {
        timeStr = formatShortTime(titleTimeMatch[1]);
      }
    }

    // Extract reel/post/story number from title if present (e.g. "Reel #1: ...", "Post 2 - ...")
    const reelMatch = (task.title || '').match(/reel\s*#?\s*(\d+)/i);
    const postMatch = (task.title || '').match(/post\s*#?\s*(\d+)/i);
    const storyMatch = (task.title || '').match(/story\s*#?\s*(\d+)/i);

    let tag = '';
    if (cType === 'reel') {
      const num = reelMatch ? parseInt(reelMatch[1], 10) : reelIdx++;
      tag = num > 1 ? `R${num}` : 'R';
    } else if (cType === 'story') {
      const num = storyMatch ? parseInt(storyMatch[1], 10) : storyIdx++;
      tag = num > 1 ? `S${num}` : 'S';
    } else {
      const num = postMatch ? parseInt(postMatch[1], 10) : postIdx++;
      tag = num > 1 ? `P${num}` : 'POST';
    }

    const label = timeStr ? `${tag} ${timeStr}` : tag;

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
        dayCell.postTime = timeStr;
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
        dayCell.storyTime = timeStr;
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

    // STRICT CLIENT SCOPING: When logged in as client, ONLY return their own trackers (supports multiple projects)
    if (req.user?.role === 'client') {
      const client = await resolveClientForUser(req.user);
      if (!client) {
        return res.json({ success: true, data: { rows: [], month, year, daysInMonth } });
      }

      const clientIds = [client.id, client.smmId].filter(Boolean);
      const existingTrackers = await SmmMonthlyTracker.find({
        client: { $in: clientIds },
        month,
        year,
      }).lean();

      const clientObj = {
        _id: client.id,
        clientId: client.clientId,
        companyName: client.companyName || 'My Company',
        clientName: client.clientName || client.contactName || '',
        contactName: client.contactName || '',
        status: 'Active',
      };

      // Find all live client projects for this client
      const clientProjects = await Project.find(withWorkspaceScope(req, {
        client: { $in: clientIds },
        status: { $ne: 'cancelled' },
        isInternal: { $ne: true },
      })).select('_id name client category startDate dueDate createdAt').lean();

      const projectIds = clientProjects.map((p) => p._id.toString());
      const deliverables = await ProjectMonthlyDeliverable.find(withWorkspaceScope(req, {
        projectId: { $in: projectIds },
        month,
        year,
      })).lean();

      const deliverablesByProject = new Map();
      deliverables.forEach((d) => {
        const pIdStr = d.projectId?.toString();
        if (!pIdStr) return;
        if (!deliverablesByProject.has(pIdStr)) {
          deliverablesByProject.set(pIdStr, { reels: 0, posts: 0, stories: 0, totalFeed: 0, total: 0 });
        }
        const entry = deliverablesByProject.get(pIdStr);
        const type = classifyDeliverableType(d.contentType);
        const qty = Number(d.targetQuantity) || 0;
        if (type === 'reel') {
          entry.reels += qty;
          entry.totalFeed += qty;
        } else if (type === 'post') {
          entry.posts += qty;
          entry.totalFeed += qty;
        } else if (type === 'story') {
          entry.stories += qty;
        }
        entry.total += qty;
      });

      const { monthRegex, startOfMonth, endOfMonth, bufferStart, bufferEnd } = getMonthMatchers(month, year);
      const rawClientTasks = await Task.find({
        $or: [
          { client: { $in: clientIds } },
          { project: { $in: projectIds } },
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

      const clientTasks = rawClientTasks.filter(
        (t) => isSmmTask(t) && isTaskInTargetMonth(t, month, year, monthRegex)
      );

      // Keep only projects belonging to the selected month/year
      const monthClientProjects = clientProjects.filter((proj) => {
        const pIdStr = proj._id.toString();
        return isProjectInTargetMonth(proj, month, year, {
          monthRegex,
          startOfMonth,
          endOfMonth,
          hasDeliverables: deliverablesByProject.has(pIdStr),
          hasTasks: clientTasks.some((t) => t.project?.toString() === pIdStr),
        });
      });

      const rows = [];
      const handledTrackerIds = new Set();

      if (monthClientProjects.length > 0) {
        for (let projIndex = 0; projIndex < monthClientProjects.length; projIndex++) {
          const proj = monthClientProjects[projIndex];
          const pIdStr = proj._id.toString();
          const projTasks = clientTasks.filter((t) => t.project?.toString() === pIdStr);
          const tracker = existingTrackers.find(
            (t) => t.project?.toString() === pIdStr || (!t.project && t.projectName && t.projectName.trim().toLowerCase() === proj.name.trim().toLowerCase())
          );
          if (tracker) handledTrackerIds.add(tracker._id.toString());
          if (tracker?.isExcluded) continue;

          const projDeliv = deliverablesByProject.get(pIdStr);
          const quotaCount = projDeliv ? projDeliv.totalFeed : 0;
          const plan = formatPlanDeliverables({
            reels: projDeliv?.reels,
            posts: projDeliv?.posts,
            tasks: projTasks,
            fallbackPlan: tracker?.plan,
            days: tracker?.days,
          });
          const storyPlan = (projDeliv?.stories && projDeliv.stories > 0) ? `${projDeliv.stories} STORIES` : (tracker?.storyPlan || '30 STORIES');

          if (tracker) {
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

            if (projTasks.length > 0) {
              const { modified: tasksMod } = mergeTasksIntoDays(
                updatedDays,
                projTasks,
                daysInMonth,
                proj.name,
                clientObj.companyName,
                month,
                year
              );
              if (tasksMod) modified = true;
            }

            if (modified && tracker._id) {
              SmmMonthlyTracker.findByIdAndUpdate(tracker._id, { $set: { days: updatedDays } }).catch(() => {});
            }

            rows.push({
              ...tracker,
              days: updatedDays,
              client: clientObj,
              project: { _id: proj._id, name: proj.name },
              projectName: proj.name,
              projectIndex: projIndex + 1,
              totalProjects: monthClientProjects.length,
              plan,
              planQuota: quotaCount,
              storyPlan,
            });
          } else {
            const scaffoldDays = buildEmptyDays(year, month);
            mergeTasksIntoDays(
              scaffoldDays,
              projTasks,
              daysInMonth,
              proj.name,
              clientObj.companyName,
              month,
              year
            );

            rows.push({
              _id: null,
              client: clientObj,
              project: { _id: proj._id, name: proj.name },
              projectName: proj.name,
              projectIndex: projIndex + 1,
              totalProjects: monthClientProjects.length,
              team: 'RWM',
              plan,
              planQuota: quotaCount,
              storyPlan,
              month,
              year,
              days: scaffoldDays,
              _scaffold: true,
            });
          }
        }
      }

      return res.json({ success: true, data: { rows, month, year, daysInMonth } });
    }

    // 1. Fetch live non-cancelled projects within scope
    const projectFilter = withWorkspaceScope(req, { status: { $ne: 'cancelled' }, isInternal: { $ne: true } });
    const allLiveProjects = await Project.find(projectFilter)
      .select('_id client name category startDate dueDate createdAt status')
      .lean();
    const projectToClient = new Map();
    allLiveProjects.forEach((p) => {
      if (p.client) {
        projectToClient.set(p._id.toString(), p.client.toString());
      }
    });

    // 2. Fetch active/onboarding/renew clients from CRM Client and SMM Client within scope
    const clientFilter = withWorkspaceScope(req, {
      status: { $nin: ['churned', 'inactive', 'Churned', 'Inactive'] },
    });
    const smmFilter = withWorkspaceScope(req, {
      status: { $nin: ['churned', 'inactive', 'Churned', 'Inactive'] },
    });
    const [crmClients, smmClientsList] = await Promise.all([
      Client.find(clientFilter).sort({ company: 1, name: 1 }).lean(),
      SmmClient.find(smmFilter).sort({ companyName: 1 }).lean(),
    ]);

    const clientMap = new Map();
    const nameToClientId = new Map();

    crmClients.forEach((c) => {
      const cCompany = c.company || c.name || 'Client';
      const cContact = c.contactName || (c.company && c.name !== c.company ? c.name : '') || '';
      const cIdStr = c._id.toString();
      clientMap.set(cIdStr, {
        _id: c._id,
        clientId: c.clientId,
        companyName: cCompany,
        clientName: cContact,
        contactName: cContact,
        status: 'Active',
      });
      const norm = cCompany.trim().toLowerCase();
      if (norm && !nameToClientId.has(norm)) {
        nameToClientId.set(norm, cIdStr);
      }
    });

    smmClientsList.forEach((c) => {
      const cIdStr = c._id.toString();
      const cCompany = c.companyName || 'Client';
      const cContact = c.primaryContact || '';
      if (!clientMap.has(cIdStr)) {
        clientMap.set(cIdStr, {
          _id: c._id,
          clientId: c.clientId,
          companyName: cCompany,
          clientName: cContact,
          contactName: cContact,
          status: c.status || 'Active',
        });
      }
      const norm = cCompany.trim().toLowerCase();
      if (norm && !nameToClientId.has(norm)) {
        nameToClientId.set(norm, cIdStr);
      }
    });

    // 3. Fetch existing tracker docs for this month/year within scope (used only for live projects)
    const trackerFilter = withWorkspaceScope(req, { month, year });
    const existingTrackers = await SmmMonthlyTracker.find(trackerFilter).lean();

    // Resolve any client referenced by a live project if not already in clientMap
    const missingProjectClientIds = allLiveProjects
      .map((p) => p.client?.toString())
      .filter((id) => id && !clientMap.has(id));

    if (missingProjectClientIds.length > 0) {
      const [extraCrm, extraSmm] = await Promise.all([
        Client.find({ _id: { $in: missingProjectClientIds }, status: { $nin: ['churned', 'inactive', 'Churned', 'Inactive'] } }).lean(),
        SmmClient.find({ _id: { $in: missingProjectClientIds }, status: { $nin: ['churned', 'inactive', 'Churned', 'Inactive'] } }).lean(),
      ]);
      extraCrm.forEach((c) => {
        const cIdStr = c._id.toString();
        const cCompany = c.company || c.name || 'Client';
        const cContact = c.contactName || (c.company && c.name !== c.company ? c.name : '') || '';
        clientMap.set(cIdStr, {
          _id: c._id,
          clientId: c.clientId,
          companyName: cCompany,
          clientName: cContact,
          contactName: cContact,
          status: 'Active',
        });
        const norm = cCompany.trim().toLowerCase();
        if (norm && !nameToClientId.has(norm)) nameToClientId.set(norm, cIdStr);
      });
      extraSmm.forEach((c) => {
        const cIdStr = c._id.toString();
        const cCompany = c.companyName || 'Client';
        const cContact = c.primaryContact || '';
        if (!clientMap.has(cIdStr)) {
          clientMap.set(cIdStr, {
            _id: c._id,
            clientId: c.clientId,
            companyName: cCompany,
            clientName: cContact,
            contactName: cContact,
            status: c.status || 'Active',
          });
          const norm = cCompany.trim().toLowerCase();
          if (norm && !nameToClientId.has(norm)) nameToClientId.set(norm, cIdStr);
        }
      });
    }

    // 4. Fetch deliverables mapped by live project for this month/year
    const liveProjectIds = allLiveProjects.map((p) => p._id);
    const deliverables = await ProjectMonthlyDeliverable.find(withWorkspaceScope(req, {
      projectId: { $in: liveProjectIds },
      month,
      year,
    })).lean();
    const deliverablesByProject = new Map(); // pIdStr -> { reels, posts, stories, totalFeed, total }
    const deliverableProjectIds = [];

    deliverables.forEach((d) => {
      const pIdStr = d.projectId?.toString();
      if (!pIdStr) return;
      deliverableProjectIds.push(pIdStr);
      if (!deliverablesByProject.has(pIdStr)) {
        deliverablesByProject.set(pIdStr, { reels: 0, posts: 0, stories: 0, totalFeed: 0, total: 0 });
      }
      const entry = deliverablesByProject.get(pIdStr);
      const type = classifyDeliverableType(d.contentType);
      const qty = Number(d.targetQuantity) || 0;
      if (type === 'reel') {
        entry.reels += qty;
        entry.totalFeed += qty;
      } else if (type === 'post') {
        entry.posts += qty;
        entry.totalFeed += qty;
      } else if (type === 'story') {
        entry.stories += qty;
      }
      entry.total += qty;
    });

    // 5. Fetch tasks strictly for this month & year tied to live projects
    const { monthRegex, startOfMonth, endOfMonth, bufferStart, bufferEnd } = getMonthMatchers(month, year);
    const monthProjectIds = allLiveProjects
      .filter((p) => p.name && monthRegex.test(p.name))
      .map((p) => p._id.toString());
    const targetProjectIds = Array.from(new Set([...monthProjectIds, ...deliverableProjectIds]));

    const taskDateOr = [
      { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
      { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
      { editDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { designDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { startDate: { $gte: bufferStart, $lte: bufferEnd } },
    ];

    const taskQueryOr = [
      ...taskDateOr,
      {
        $and: [
          { $or: [{ project: { $in: targetProjectIds } }, { title: monthRegex }] },
          {
            postingScheduleDate: null,
            publishingDate: null,
            dueDate: null,
            editDueDate: null,
            designDueDate: null,
            startDate: null,
          },
        ],
      },
    ];

    const rawMonthTasks = await Task.find(withWorkspaceScope(req, {
      $and: [
        { $or: taskQueryOr },
        { isDevTask: { $ne: true } },
        { department: { $ne: 'Development' } },
        { taskCategory: { $ne: 'non_content' } },
      ],
    })).populate('project', '_id name client').populate('client', '_id company name').lean();

    const monthTasks = rawMonthTasks.filter(
      (t) => isSmmTask(t) && isTaskInTargetMonth(t, month, year, monthRegex)
    );
    const tasksByProject = new Map(); // pIdStr -> [tasks]

    monthTasks.forEach((t) => {
      const pId = t.project?._id?.toString() || (t.project ? t.project.toString() : null);
      if (pId) {
        if (!tasksByProject.has(pId)) tasksByProject.set(pId, []);
        tasksByProject.get(pId).push(t);
      }
    });

    // 6. Filter live projects strictly by selected month/year and group by active client
    const monthProjects = allLiveProjects.filter((proj) => {
      const pIdStr = proj._id.toString();
      return isProjectInTargetMonth(proj, month, year, {
        monthRegex,
        startOfMonth,
        endOfMonth,
        hasDeliverables: deliverablesByProject.has(pIdStr),
        hasTasks: (tasksByProject.get(pIdStr)?.length || 0) > 0,
      });
    });

    const clientProjectsMap = new Map();
    monthProjects.forEach((p) => {
      const cId = p.client?.toString();
      if (!cId || !clientMap.has(cId)) return;
      if (!clientProjectsMap.has(cId)) {
        clientProjectsMap.set(cId, []);
      }
      clientProjectsMap.get(cId).push(p);
    });

    const handledTrackerIds = new Set();
    const rows = [];

    // Map existing trackers for quick lookup by (client, project)
    const existingByClientAndProj = new Map();
    existingTrackers.forEach((t) => {
      const cIdStr = t.client?.toString();
      const pIdStr = t.project?.toString();
      if (cIdStr && pIdStr) {
        existingByClientAndProj.set(`${cIdStr}_${pIdStr}`, t);
      } else if (cIdStr && t.projectName) {
        existingByClientAndProj.set(`${cIdStr}_name_${t.projectName.trim().toLowerCase()}`, t);
      }
    });

    // Render ONLY clients with live projects matching the selected month/year (sorted by client name)
    const orderedClients = Array.from(clientMap.entries())
      .filter(([cIdStr]) => (clientProjectsMap.get(cIdStr)?.length || 0) > 0)
      .sort((a, b) => (a[1].companyName || '').localeCompare(b[1].companyName || ''));

    for (const [cIdStr, clientObj] of orderedClients) {
      const clientProjs = clientProjectsMap.get(cIdStr) || [];

      for (let projIndex = 0; projIndex < clientProjs.length; projIndex++) {
        const proj = clientProjs[projIndex];
        const pIdStr = proj._id.toString();
        const existing = existingByClientAndProj.get(`${cIdStr}_${pIdStr}`)
          || existingByClientAndProj.get(`${cIdStr}_name_${proj.name.trim().toLowerCase()}`)
          || existingTrackers.find(
            (t) => !handledTrackerIds.has(t._id.toString()) &&
                   t.client?.toString() === cIdStr &&
                   (!t.project || t.project.toString() === pIdStr)
          );

        if (existing) handledTrackerIds.add(existing._id.toString());
        if (existing?.isExcluded) continue;

        const projTasks = (tasksByProject.get(pIdStr) || []).filter(
          (t) => isTaskInTargetMonth(t, month, year, monthRegex)
        );
        const projDeliv = deliverablesByProject.get(pIdStr);
        const quotaCount = projDeliv ? projDeliv.totalFeed : 0;
        const plan = formatPlanDeliverables({
          reels: projDeliv?.reels,
          posts: projDeliv?.posts,
          tasks: projTasks,
          fallbackPlan: existing?.plan,
          days: existing?.days,
        });
        const storyPlan = (projDeliv?.stories && projDeliv.stories > 0) ? `${projDeliv.stories} STORIES` : (existing?.storyPlan || '30 STORIES');

        if (existing) {
          let modified = false;
          const updatedDays = (existing.days || []).map((day) => {
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

          if (projTasks.length > 0) {
            const { modified: tasksMod } = mergeTasksIntoDays(
              updatedDays,
              projTasks,
              daysInMonth,
              proj.name,
              clientObj.companyName,
              month,
              year
            );
            if (tasksMod) modified = true;
          }

          if (modified && existing._id) {
            SmmMonthlyTracker.findByIdAndUpdate(existing._id, { $set: { days: updatedDays } }).catch(() => {});
          }

          rows.push({
            ...existing,
            days: updatedDays,
            client: clientObj,
            project: { _id: proj._id, name: proj.name },
            projectName: proj.name,
            projectIndex: projIndex + 1,
            totalProjects: clientProjs.length,
            plan,
            planQuota: quotaCount,
            storyPlan,
          });
        } else {
          // Scaffold project row for this live month-matched project
          const scaffoldDays = buildEmptyDays(year, month);
          mergeTasksIntoDays(
            scaffoldDays,
            projTasks,
            daysInMonth,
            proj.name,
            clientObj.companyName,
            month,
            year
          );

          rows.push({
            _id: null,
            client: clientObj,
            project: { _id: proj._id, name: proj.name },
            projectName: proj.name,
            projectIndex: projIndex + 1,
            totalProjects: clientProjs.length,
            team: 'RWM',
            plan,
            planQuota: quotaCount,
            storyPlan,
            month,
            year,
            days: scaffoldDays,
            _scaffold: true,
          });
        }
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
    const { clientId, month, year, plan, storyPlan, team, days, projectName, projectId, trackerId } = req.body;

    if (!clientId || !month || !year) {
      return res.status(400).json({ success: false, message: 'clientId, month, year are required' });
    }

    let finalProjectName = projectName || '';
    let finalProjectId = projectId || null;
    if (!finalProjectName && !finalProjectId) {
      const proj = await Project.findOne(withWorkspaceScope(req, { client: clientId, status: { $ne: 'cancelled' } })).select('_id name').lean();
      if (proj) {
        finalProjectName = proj.name;
        finalProjectId = proj._id;
      }
    }

    const filter = trackerId
      ? { _id: trackerId }
      : { client: clientId, project: finalProjectId, month, year };

    const tracker = await SmmMonthlyTracker.findOneAndUpdate(
      filter,
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
          project: finalProjectId,
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

    // 1. Fetch live non-cancelled projects within scope
    const allLiveProjects = await Project.find(withWorkspaceScope(req, { status: { $ne: 'cancelled' }, isInternal: { $ne: true } }))
      .select('_id client name category startDate dueDate createdAt')
      .lean();
    const projectMap = new Map();
    allLiveProjects.forEach((p) => {
      projectMap.set(p._id.toString(), p);
    });

    // 2. Fetch active clients from both CRM Client and SmmClient within scope
    const [crmClients, smmClientsList] = await Promise.all([
      Client.find(withWorkspaceScope(req, { status: { $nin: ['churned', 'inactive', 'Churned', 'Inactive'] } })).lean(),
      SmmClient.find(withWorkspaceScope(req, { status: { $nin: ['churned', 'inactive', 'Churned', 'Inactive'] } })).lean(),
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

    // 3. Fetch monthly deliverables for this month and year tied to live projects
    const liveProjectIds = allLiveProjects.map((p) => p._id);
    const deliverables = await ProjectMonthlyDeliverable.find(withWorkspaceScope(req, {
      projectId: { $in: liveProjectIds },
      month,
      year,
    })).lean();
    const deliverablesByProject = new Map();
    deliverables.forEach((d) => {
      const pIdStr = d.projectId?.toString();
      if (!pIdStr || !projectMap.has(pIdStr)) return;

      if (!deliverablesByProject.has(pIdStr)) {
        deliverablesByProject.set(pIdStr, { reels: 0, posts: 0, stories: 0, total: 0 });
      }
      const entry = deliverablesByProject.get(pIdStr);
      const type = classifyDeliverableType(d.contentType);
      const qty = Number(d.targetQuantity) || 0;
      if (type === 'reel') entry.reels += qty;
      else if (type === 'post') entry.posts += qty;
      else if (type === 'story') entry.stories += qty;
      entry.total += qty;
    });

    // 4. Fetch content tasks strictly tied to live projects for this month & year
    const monthProjectIds = allLiveProjects
      .filter((p) => p.name && monthRegex.test(p.name))
      .map((p) => p._id.toString());
    const allTargetProjectIds = Array.from(new Set([
      ...monthProjectIds,
      ...deliverablesByProject.keys(),
    ]));

    const taskDateOr = [
      { postingScheduleDate: { $gte: bufferStart, $lte: bufferEnd } },
      { publishingDate: { $gte: bufferStart, $lte: bufferEnd } },
      { editDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { designDueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { dueDate: { $gte: bufferStart, $lte: bufferEnd } },
      { startDate: { $gte: bufferStart, $lte: bufferEnd } },
    ];

    const taskQueryOr = [
      ...taskDateOr,
      {
        $and: [
          { $or: [{ project: { $in: allTargetProjectIds } }, { title: monthRegex }] },
          {
            postingScheduleDate: null,
            publishingDate: null,
            dueDate: null,
            editDueDate: null,
            designDueDate: null,
            startDate: null,
          },
        ],
      },
    ];

    const rawTasks = await Task.find(withWorkspaceScope(req, {
      $and: [
        { $or: taskQueryOr },
        { project: { $in: liveProjectIds } },
        { isDevTask: { $ne: true } },
        { department: { $ne: 'Development' } },
        { taskCategory: { $ne: 'non_content' } },
      ],
    }))
      .populate('project', '_id client name')
      .populate('client', '_id company name')
      .lean();

    const tasks = rawTasks.filter((t) => isSmmTask(t) && isTaskInTargetMonth(t, month, year, monthRegex));

    const tasksByProject = new Map();
    tasks.forEach((t) => {
      const pIdStr = t.project?._id?.toString() || (t.project ? t.project.toString() : null);
      if (!pIdStr || !projectMap.has(pIdStr)) return;
      if (!tasksByProject.has(pIdStr)) tasksByProject.set(pIdStr, []);
      tasksByProject.get(pIdStr).push(t);
    });

    // Sync ONLY live projects that belong to this month/year AND have deliverables or tasks
    let updatedCount = 0;
    let syncedTaskCount = 0;

    for (const proj of allLiveProjects) {
      const pIdStr = proj._id.toString();
      const projTasks = tasksByProject.get(pIdStr) || [];
      const projDeliv = deliverablesByProject.get(pIdStr);
      if (!projDeliv && projTasks.length === 0) continue;
      if (
        !isProjectInTargetMonth(proj, month, year, {
          monthRegex,
          startOfMonth,
          endOfMonth,
          hasDeliverables: Boolean(projDeliv),
          hasTasks: projTasks.length > 0,
        })
      ) {
        continue;
      }

      const cId = proj.client?.toString();
      if (!cId) continue;
      const client = clientMap.get(cId) || { _id: cId, companyName: 'Client' };

      let reelsTarget = projDeliv?.reels ?? 0;
      let postsTarget = projDeliv?.posts ?? 0;
      let storiesTarget = projDeliv?.stories ?? 0;

      if (!projDeliv || (reelsTarget === 0 && postsTarget === 0)) {
        const rTaskCount = projTasks.filter((t) => classifyTaskContentType(t) === 'reel').length;
        const pTaskCount = projTasks.filter((t) => classifyTaskContentType(t) === 'post').length;
        const sTaskCount = projTasks.filter((t) => classifyTaskContentType(t) === 'story').length;
        if (reelsTarget === 0 && rTaskCount > 0) reelsTarget = rTaskCount;
        if (postsTarget === 0 && pTaskCount > 0) postsTarget = pTaskCount;
        if (storiesTarget === 0 && sTaskCount > 0) storiesTarget = sTaskCount;
      }

      const plan = formatPlanDeliverables({
        reels: reelsTarget,
        posts: postsTarget,
        tasks: projTasks,
      });
      const storyPlan = `${storiesTarget || 30} STORIES`;

      let tracker = await SmmMonthlyTracker.findOne({ client: client._id, project: proj._id, month, year });
      const days = tracker?.days && tracker.days.length > 0 ? tracker.days : buildEmptyDays(year, month);

      const getTaskDate = (t) =>
        t.postingScheduleDate || t.publishingDate || t.dueDate || t.editDueDate || t.designDueDate || t.startDate || t.createdAt;
      projTasks.sort((a, b) => new Date(getTaskDate(a)) - new Date(getTaskDate(b)));

      mergeTasksIntoDays(days, projTasks, daysInMonth, proj.name, client.companyName, month, year);
      syncedTaskCount += projTasks.length;

      const updateFields = {
        plan,
        storyPlan,
        days,
        project: proj._id,
        projectName: proj.name,
        isExcluded: false,
      };
      if (mongoose.Types.ObjectId.isValid(req.user?.organizationId)) {
        updateFields.organizationId = req.user.organizationId;
      }
      if (mongoose.Types.ObjectId.isValid(req.user?._id)) {
        updateFields.updatedBy = req.user._id;
      }

      await SmmMonthlyTracker.findOneAndUpdate(
        { client: client._id, project: proj._id, month, year },
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

      const plan = formatPlanDeliverables({
        reels: reelsCount,
        posts: postsCount,
        days,
      });
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

