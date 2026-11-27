import mongoose from 'mongoose';
import Lead from '../models/lead.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Invoice from '../models/invoice.model.js';
import Expense from '../models/expense.model.js';
import Attendance from '../models/attendance.model.js';
import DomainRenewal from '../models/domainRenewal.model.js';
import User from '../models/user.model.js';
import CallHistory from '../models/callHistory.model.js';
import SOP from '../models/sop.model.js';
import ActivityLog from '../models/activityLog.model.js';
import ProjectMonthlyDeliverable from '../models/projectMonthlyDeliverable.model.js';
import Branch from '../models/branch.model.js';
import SmmClient from '../models/smm/smmClient.model.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// In-memory cache for admin dashboard aggregation (45s TTL to balance real-time sync and DB load)
const dashboardCache = new Map();
const DASHBOARD_CACHE_TTL = 45 * 1000;
const MAX_DASHBOARD_CACHE_ENTRIES = 100;

export const clearAdminDashboardCache = () => {
  dashboardCache.clear();
};

export const getAdminDashboard = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        code: 'DB_UNAVAILABLE',
        message: 'Database connection is currently reconnecting. Please retry shortly.',
      });
    }

    const isManager = req.user?.role === 'manager';
    const now = new Date();
    const period = req.query.period || 'monthly';
    const { startDate: qStartDate, endDate: qEndDate, branchId: qBranchId } = req.query;

    const rawGhostOrgId =
      req.headers['x-impersonate-org-id'] ||
      req.headers['x-ghost-org-id'] ||
      (req.isGhostMode ? req.user.organizationId : null);
    const cacheOrgScope = rawGhostOrgId || req.user?.organizationId || 'global';

    const cacheKey = `${cacheOrgScope}:${req.user?.role || 'user'}:${period}:${qStartDate || ''}:${qEndDate || ''}:${qBranchId || 'all'}`;
    const cached = dashboardCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_TTL) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const todayAttendance = await Attendance.findOne({
        user: req.user._id,
        date: { $gte: startOfToday, $lte: endOfToday },
      }).sort({ createdAt: -1 }).lean();

      return res.json({
        ...cached.data,
        todayAttendance,
      });
    }

    let periodStart, periodEnd, priorPeriodStart, priorPeriodEnd;

    if (qStartDate || qEndDate) {
      const parseLocalDate = (str, endOfDay = false) => {
        if (!str) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(str).trim())) {
          const [y, m, d] = String(str).trim().split('-').map(Number);
          return endOfDay
            ? new Date(y, m - 1, d, 23, 59, 59, 999)
            : new Date(y, m - 1, d, 0, 0, 0, 0);
        }
        const dt = new Date(str);
        if (endOfDay) dt.setHours(23, 59, 59, 999);
        else dt.setHours(0, 0, 0, 0);
        return dt;
      };
      periodStart = parseLocalDate(qStartDate, false) || new Date(0);
      periodEnd = parseLocalDate(qEndDate, true) || new Date(now);

      const spanMs = Math.max(86400000, periodEnd.getTime() - periodStart.getTime());
      priorPeriodStart = new Date(periodStart.getTime() - spanMs);
      priorPeriodEnd = new Date(periodStart.getTime() - 1);
    } else if (period === 'weekly') {
      const day = now.getDay();
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(now);

      priorPeriodStart = new Date(periodStart);
      priorPeriodStart.setDate(priorPeriodStart.getDate() - 7);
      priorPeriodEnd = new Date(periodStart);
      priorPeriodEnd.setMilliseconds(-1);
    } else if (period === 'lastMonth' || period === 'previous_month') {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      priorPeriodStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      priorPeriodEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
    } else if (period === 'yearly') {
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      priorPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
      priorPeriodEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    } else if (period === 'allTime') {
      periodStart = new Date(0);
      periodEnd = new Date(now);

      priorPeriodStart = new Date(0);
      priorPeriodEnd = new Date(now);
    } else {
      // 'monthly' / 'this_month'
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      priorPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      priorPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    // 1. Core KPIs & Counts
    const ghostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'] || (req.isGhostMode ? req.user.organizationId : null);
    const orgId = ghostOrgId || (req.user.role !== 'superAdmin' ? req.user.organizationId : null);
    const orgFilter = orgId ? { organizationId: orgId } : {};
    const orgAggFilter = orgId && mongoose.Types.ObjectId.isValid(orgId)
      ? { organizationId: new mongoose.Types.ObjectId(orgId) }
      : orgFilter;

    // Branch filtering for superadmin, admin, organizationOwner
    let selectedBranchDoc = null;
    let branchUserIds = null;
    if (qBranchId && qBranchId !== 'all') {
      try {
        selectedBranchDoc = await Branch.findById(qBranchId).lean();
        if (selectedBranchDoc) {
          const branchUsers = await User.find({ branchId: qBranchId, ...(orgId ? { organizationId: orgId } : {}) }).select('_id').lean();
          branchUserIds = branchUsers.map((u) => u._id);
        }
      } catch (err) {
        console.warn('Branch resolution error in admin report:', err.message);
      }
    }

    const isBoundedPeriod = Boolean(periodStart && periodEnd && period !== 'allTime');
    const taskPeriodFilter = { parent: null, ...orgFilter };
    if (branchUserIds) {
      taskPeriodFilter.assignedTo = { $in: branchUserIds };
    }
    if (isBoundedPeriod) {
      taskPeriodFilter.$or = [
        { dueDate: { $gte: periodStart, $lte: periodEnd } },
        { postingScheduleDate: { $gte: periodStart, $lte: periodEnd } },
        { shootDate: { $gte: periodStart, $lte: periodEnd } },
        {
          $and: [
            { $or: [{ dueDate: null }, { dueDate: { $exists: false } }] },
            { $or: [{ postingScheduleDate: null }, { postingScheduleDate: { $exists: false } }] },
            { $or: [{ shootDate: null }, { shootDate: { $exists: false } }] },
            { createdAt: { $gte: periodStart, $lte: periodEnd } },
          ],
        },
      ];
    }

    const [
      totalLeads, newLeadsThisMonth, wonLeads,
      totalClients, activeClients,
      totalProjects, activeProjects,
      totalTasks, overdueTasks,
      monthRevenue, lastMonthRevenue,
      allTimeRevenue,
      totalExpensesData,
      adBudgetTotals,
      totalUsers,
      expiringRenewals,
      pendingBalanceAgg,
      allProjects,
      allTasks,
      allClients,
      allUsers,
      leadsList,
      allSmmClients,
    ] = await Promise.all([
      Lead.countDocuments(orgFilter),
      Lead.countDocuments({ ...orgFilter, createdAt: { $gte: periodStart, $lte: periodEnd } }),
      Lead.countDocuments({ ...orgFilter, stage: 'won', updatedAt: { $gte: periodStart, $lte: periodEnd } }),
      Client.countDocuments(orgFilter),
      Client.countDocuments({ ...orgFilter, status: { $in: ['active', 'Active'] } }),
      Project.countDocuments(orgFilter),
      Project.countDocuments({ ...orgFilter, status: { $in: ['active', 'In Progress'] } }),
      Task.countDocuments(taskPeriodFilter),
      Task.countDocuments({ parent: null, ...orgFilter, ...(branchUserIds ? { assignedTo: { $in: branchUserIds } } : {}), dueDate: { $lt: now }, status: { $nin: ['done', 'approved', 'Completed', 'Approved'] } }),
      Invoice.aggregate([{ $match: { ...orgAggFilter, status: 'paid', paidDate: { $gte: periodStart, $lte: periodEnd } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Invoice.aggregate([{ $match: { ...orgAggFilter, status: 'paid', paidDate: { $gte: priorPeriodStart, $lte: priorPeriodEnd } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Invoice.aggregate([{ $match: { ...orgAggFilter, status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Expense.aggregate([{ $match: { ...orgAggFilter, status: { $in: ['approved', 'reimbursed'] }, date: { $gte: periodStart, $lte: periodEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Project.aggregate([
        { $match: orgAggFilter },
        {
          $group: {
            _id: null,
            totalAdsBudget: { $sum: { $ifNull: ['$budgetDetails.adsAmount', 0] } },
          },
        },
      ]),
      branchUserIds
        ? branchUserIds.length
        : User.countDocuments({ isActive: true, ...(orgId ? { organizationId: orgId } : { role: { $ne: 'organizationOwner' } }) }),
      DomainRenewal.find({
        ...(orgId ? { organizationId: orgId } : {}),
        expiryDate: { $gte: now, $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59, 999) },
        status: { $in: ['active', 'pending'] },
      })
        .populate('clientId', 'name company')
        .sort({ expiryDate: 1 })
        .limit(5)
        .lean(),
      Invoice.aggregate([
        {
          $match: {
            ...orgAggFilter,
            status: { $in: ['sent', 'viewed', 'partially_paid', 'Sent', 'Partially Paid'] },
          },
        },
        {
          $group: {
            _id: null,
            pendingBalance: { $sum: { $ifNull: ['$balanceAmount', '$total', 0] } },
          },
        },
      ]),
      Project.find(orgFilter, 'name status priority startDate dueDate endDate progress budget client').populate('client', 'name company').lean(),
      Task.find(taskPeriodFilter, 'title taskTitle status priority dueDate taskCategory postingPlatforms shootStatus editingStatus reviewStatus postingStatus assignedTo').populate('assignedTo', 'name email avatar role department').lean(),
      Client.find(orgFilter, 'name company email clientId status monthlyRetainer service createdAt').lean(),
      User.find(
        {
          isActive: true,
          ...(branchUserIds
            ? { _id: { $in: branchUserIds } }
            : orgId
            ? { organizationId: orgId }
            : { role: { $ne: 'organizationOwner' } }),
        },
        'name email role department avatar position branchId'
      ).lean(),
      Lead.find(orgFilter, 'name company stage value createdAt source').lean(),
      SmmClient.find(orgFilter, 'companyName clientName clientId email status').lean(),
    ]);

    // Include standalone SMM clients not already linked to a CRM Client record so Overview matches Clients 360
    let mergedTotalClients = totalClients;
    let mergedActiveClients = activeClients;
    if (Array.isArray(allSmmClients) && allSmmClients.length > 0) {
      const crmIds = new Set(allClients.map((c) => String(c._id)));
      const crmClientIds = new Set(allClients.map((c) => c.clientId).filter(Boolean));
      const crmEmails = new Set(allClients.map((c) => c.email?.toLowerCase().trim()).filter(Boolean));
      const crmCompanies = new Set(allClients.map((c) => c.company?.toLowerCase().trim()).filter(Boolean));

      for (const smm of allSmmClients) {
        const cName = (smm.companyName || smm.clientName || '').trim();
        if (!cName) continue;
        const emailNorm = smm.email ? smm.email.toLowerCase().trim() : '';
        if (
          crmIds.has(String(smm._id)) ||
          (smm.clientId && crmClientIds.has(smm.clientId)) ||
          (emailNorm && crmEmails.has(emailNorm)) ||
          crmCompanies.has(cName.toLowerCase())
        ) {
          continue;
        }
        mergedTotalClients += 1;
        const st = String(smm.status || 'Active').toLowerCase().trim();
        if (['active', 'ongoing', 'live', 'running', 'enabled', 'approved'].includes(st)) {
          mergedActiveClients += 1;
        }
      }
    }

    // 2. Revenue Month-by-Month Trend (Past 6 Months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const rawRevenueChart = await Invoice.aggregate([
      { $match: { ...orgAggFilter, status: 'paid', paidDate: { $gte: sixMonthsAgo, $lte: periodEnd } } },
      { $group: { _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } }, revenue: { $sum: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format 6 months continuous array
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthLabel = MONTH_NAMES[d.getMonth()];
      const match = rawRevenueChart.find((r) => r._id.year === y && r._id.month === m);
      revenueTrend.push({
        month: monthLabel,
        year: y,
        revenue: match ? match.revenue : 0,
      });
    }

    // 3. Revenue by Client
    const rawRevenueByClient = await Invoice.aggregate([
      { $match: { ...orgAggFilter, status: 'paid' } },
      { $group: { _id: '$client', totalRevenue: { $sum: '$total' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);
    const clientMap = new Map();
    allClients.forEach((c) => clientMap.set(c._id.toString(), c));

    const revenueByClient = rawRevenueByClient.map((item) => {
      const clientDoc = item._id ? clientMap.get(item._id.toString()) : null;
      return {
        clientId: item._id,
        name: clientDoc?.company || clientDoc?.name || 'Internal / Direct',
        revenue: item.totalRevenue,
      };
    });

    // 4. Project Health Analysis
    let onTrackProjects = 0;
    let atRiskProjects = 0;
    let delayedProjects = 0;
    const projectStatusCounts = { Planning: 0, 'In Progress': 0, 'On Hold': 0, Completed: 0 };

    allProjects.forEach((p) => {
      const normStatus = p.status === 'in_progress' ? 'In Progress' : p.status === 'on_hold' ? 'On Hold' : p.status === 'planning' ? 'Planning' : p.status === 'completed' ? 'Completed' : 'In Progress';
      projectStatusCounts[normStatus] = (projectStatusCounts[normStatus] || 0) + 1;

      const isDelayed = p.dueDate && new Date(p.dueDate) < now && normStatus !== 'Completed';
      const isAtRisk = normStatus === 'On Hold' || (p.dueDate && new Date(p.dueDate).getTime() - now.getTime() < 7 * 86400000 && (p.progress || 0) < 50);

      if (isDelayed) {
        delayedProjects++;
      } else if (isAtRisk) {
        atRiskProjects++;
      } else {
        onTrackProjects++;
      }
    });

    // 5. Task Status Distribution
    const taskStatusCounts = {
      'To Do': 0,
      'On Process': 0,
      'Waiting for Client': 0,
      'Review Required': 0,
      Completed: 0,
    };
    let pendingApprovals = 0;

    allTasks.forEach((t) => {
      const s = t.status || 'To Do';
      if (s === 'To Do' || s === 'todo' || s === 'pending') taskStatusCounts['To Do']++;
      else if (s === 'On Process' || s === 'in_progress') taskStatusCounts['On Process']++;
      else if (s === 'Waiting for Client' || s === 'waiting_client') {
        taskStatusCounts['Waiting for Client']++;
        pendingApprovals++;
      } else if (s === 'Review Required' || s === 'review' || t.reviewStatus === 'review_ready') {
        taskStatusCounts['Review Required']++;
        pendingApprovals++;
      } else if (s === 'Completed' || s === 'Approved' || s === 'done') {
        taskStatusCounts['Completed']++;
      } else {
        taskStatusCounts['On Process']++;
      }
    });

    // 6. Client Health Analysis
    let healthyClients = 0;
    let attentionClients = 0;
    let atRiskClients = 0;
    const clientStatusBreakdown = { Active: 0, Prospect: 0, Renew: 0, Inactive: 0, Churned: 0 };

    allClients.forEach((c) => {
      const s = c.status || 'Active';
      clientStatusBreakdown[s] = (clientStatusBreakdown[s] || 0) + 1;

      if (s === 'Active') healthyClients++;
      else if (s === 'Prospect' || s === 'Renew') attentionClients++;
      else atRiskClients++;
    });

    // 7. All Users Performance, Workload & Metrics Matrix
    const currentMonthNum = now.getMonth() + 1;
    const currentYearNum = now.getFullYear();

    const monthlyDeliverablesList = await ProjectMonthlyDeliverable.find({
      ...orgFilter,
      month: currentMonthNum,
      year: currentYearNum,
    }).populate('projectId', 'name client status').lean();

    const allUserMetrics = allUsers.map((u) => {
      const uId = String(u._id);
      const userTasks = allTasks.filter((t) => {
        const isAssigned = (Array.isArray(t.assignedTo) && t.assignedTo.some((a) => String(a._id || a) === uId))
          || String(t.scriptWriterAssigned?._id || t.scriptWriterAssigned) === uId
          || String(t.videographerAssigned?._id || t.videographerAssigned) === uId
          || String(t.editorAssigned?._id || t.editorAssigned) === uId
          || String(t.publisherAssigned?._id || t.publisherAssigned) === uId;
        return isAssigned;
      });

      const totalAssigned = userTasks.length;
      const completed = userTasks.filter((t) => ['Completed', 'Approved', 'done', 'completed'].includes(t.status)).length;
      const inProgress = userTasks.filter((t) => ['On Process', 'in_progress', 'on_process'].includes(t.status)).length;
      const todo = userTasks.filter((t) => ['To Do', 'todo', 'pending'].includes(t.status) || !t.status).length;
      const overdue = userTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && !['Completed', 'Approved', 'done', 'completed'].includes(t.status)).length;
      const overTarget = userTasks.filter((t) => t.isOverTarget).length;
      const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
      const activeCount = totalAssigned - completed;

      return {
        userId: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department || u.position || u.role,
        avatar: u.avatar,
        totalTasks: totalAssigned,
        completedTasks: completed,
        inProgressTasks: inProgress,
        todoTasks: todo,
        overdueTasks: overdue,
        overTargetTasks: overTarget,
        activeTasks: activeCount,
        completionRate,
        workloadPercent: Math.min(Math.round((activeCount / 8) * 100), 100),
      };
    }).sort((a, b) => b.activeTasks - a.activeTasks);

    const teamWorkload = allUserMetrics.slice(0, 8);

    // Active monthly project deliverables quota progress
    const activeProjectDeliverables = monthlyDeliverablesList.map((target) => {
      const projId = String(target.projectId?._id || target.projectId);
      const projName = target.projectId?.name || 'Project';
      const matchingTasks = allTasks.filter((t) => {
        const tProj = String(t.project?._id || t.project);
        if (tProj !== projId) return false;
        const taskType = (t.taskType || '').toLowerCase();
        const contentType = (t.contentType || '').toLowerCase();
        const targetType = (target.contentType || '').toLowerCase();
        return taskType.includes(targetType) || contentType.includes(targetType) || targetType.includes(taskType);
      });
      const currentCount = matchingTasks.length;
      const targetQty = target.targetQuantity || 1;
      return {
        _id: target._id,
        projectId: projId,
        projectName: projName,
        contentType: target.contentType,
        targetQuantity: targetQty,
        currentCount,
        remaining: Math.max(0, targetQty - currentCount),
        isOver: currentCount > targetQty,
        exceededBy: Math.max(0, currentCount - targetQty),
        progressPercent: Math.min(100, Math.round((currentCount / targetQty) * 100)),
      };
    });

    const totalOverTargetTasks = allTasks.filter((t) => t.isOverTarget).length;

    // 8. Content Production Pipeline
    const contentPipeline = {
      ideas: allTasks.filter((t) => t.status === 'To Do' || t.status === 'todo' || t.status === 'pending').length,
      shoot: allTasks.filter((t) => t.shootStatus === 'in_progress' || t.shootStatus === 'pending').length,
      editing: allTasks.filter((t) => t.editingStatus === 'in_progress' || t.editingStatus === 'pending' || (t.status === 'On Process' && (t.taskCategory === 'video_content' || t.taskCategory === 'reel' || t.taskType?.toLowerCase().includes('video') || t.taskType?.toLowerCase().includes('reel')))).length,
      review: allTasks.filter((t) => t.status === 'Review Required' || t.reviewStatus === 'review_ready' || t.reviewStatus === 'in_review').length,
      approval: allTasks.filter((t) => t.status === 'Waiting for Client').length,
      published: allTasks.filter((t) => t.status === 'Completed' || t.status === 'Approved' || t.postingStatus === 'published').length,
    };

    // Platform distribution
    const platformCounts = { Instagram: 0, YouTube: 0, LinkedIn: 0, Facebook: 0, Twitter: 0 };
    allTasks.forEach((t) => {
      if (Array.isArray(t.postingPlatforms)) {
        t.postingPlatforms.forEach((p) => {
          const cap = p.charAt(0).toUpperCase() + p.slice(1);
          if (platformCounts[cap] !== undefined) platformCounts[cap]++;
        });
      }
    });

    // 9. Sales Funnel Breakdown
    const salesFunnel = [
      { stage: 'New', label: 'New Leads', count: leadsList.filter((l) => l.stage === 'new').length },
      { stage: 'Contacted', label: 'Contacted', count: leadsList.filter((l) => l.stage === 'contacted').length },
      { stage: 'Qualified', label: 'Qualified', count: leadsList.filter((l) => l.stage === 'qualified').length },
      { stage: 'Meeting', label: 'Meeting Booked', count: leadsList.filter((l) => l.stage === 'meeting_booked').length },
      { stage: 'Proposal', label: 'Proposal Sent', count: leadsList.filter((l) => l.stage === 'proposal_sent').length },
      { stage: 'Won', label: 'Won', count: leadsList.filter((l) => l.stage === 'won').length },
      { stage: 'Lost', label: 'Lost', count: leadsList.filter((l) => l.stage === 'lost').length },
    ];

    const thisMonthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : 0;
    const totalAdsBudget = adBudgetTotals[0]?.totalAdsBudget || 0;
    const totalIncome = allTimeRevenue[0]?.total || 0;
    const totalExpenses = totalExpensesData[0]?.total || 0;
    const netProfit = thisMonthRev - totalExpenses;
    const remainingAmount = thisMonthRev - totalExpenses - totalAdsBudget;
    const pendingBalance = pendingBalanceAgg[0]?.pendingBalance || 0;

    const recentActivityLogs = await ActivityLog.find(orgFilter)
      .populate('actor', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todayAttendance = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: startOfToday, $lte: endOfToday },
    }).sort({ createdAt: -1 }).lean();

    const responsePayload = {
      success: true,
      periodStart,
      periodEnd,
      stats: {
        totalLeads,
        newLeadsThisMonth,
        wonLeads,
        conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0,
        totalClients: mergedTotalClients,
        activeClients: mergedActiveClients,
        totalProjects,
        activeProjects,
        totalTasks,
        overdueTasks,
        totalOverTargetTasks,
        pendingApprovals,
        totalPending: pendingBalance,
        grossAmount: thisMonthRev,
        monthRevenue: thisMonthRev,
        revenueGrowth,
        totalIncome,
        totalExpenses,
        totalAdsBudget,
        netProfit,
        remainingAmount,
        totalUsers,
        expiringRenewalsCount: expiringRenewals.length,
      },
      visualizations: {
        revenueTrend,
        revenueByClient,
        projectHealth: {
          onTrack: onTrackProjects,
          atRisk: atRiskProjects,
          delayed: delayedProjects,
          byStatus: projectStatusCounts,
        },
        taskDistribution: taskStatusCounts,
        clientHealth: {
          healthy: healthyClients,
          attention: attentionClients,
          atRisk: atRiskClients,
          breakdown: clientStatusBreakdown,
        },
        teamWorkload,
        allUserMetrics,
        activeProjectDeliverables,
        contentPipeline,
        platformCounts,
        salesFunnel,
      },
      renewals: expiringRenewals,
      activityLogs: recentActivityLogs,
    };

    // Fetch all active company branches for the switcher
    try {
      const rawBranches = await Branch.find(orgFilter).sort({ isHeadquarters: -1, name: 1 }).lean();
      const bIds = rawBranches.map((b) => b._id);
      const branchUserCounts = await User.aggregate([
        { $match: { branchId: { $in: bIds } } },
        { $group: { _id: '$branchId', count: { $sum: 1 } } },
      ]);
      const countMap = {};
      branchUserCounts.forEach((c) => {
        countMap[String(c._id)] = c.count;
      });
      responsePayload.branches = rawBranches.map((b) => ({
        ...b,
        employeeCount: countMap[String(b._id)] || 0,
      }));
      responsePayload.selectedBranch = selectedBranchDoc
        ? {
            ...selectedBranchDoc,
            employeeCount: branchUserIds ? branchUserIds.length : (countMap[String(selectedBranchDoc._id)] || 0),
          }
        : null;
      responsePayload.activeBranchId = qBranchId || 'all';
    } catch (bErr) {
      console.warn('Error fetching company branches for overview:', bErr.message);
    }

    if (mongoose.connection.readyState === 1) {
      if (dashboardCache.size >= MAX_DASHBOARD_CACHE_ENTRIES) {
        const oldestKey = dashboardCache.keys().next().value;
        dashboardCache.delete(oldestKey);
      }
      dashboardCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
    }

    res.json({
      ...responsePayload,
      todayAttendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const skip = (page - 1) * limit;
    const { entityType, search, actor, actionType, timeframe, startDate, endDate } = req.query;

    const query = {};

    // Filter by entity type / module
    if (entityType && entityType !== 'all') {
      query.entityType = entityType;
    }

    // Filter by actor / user (including "me" for own actions)
    if (actor) {
      if (actor === 'me') {
        query.actor = req.user._id;
      } else if (mongoose.Types.ObjectId.isValid(actor)) {
        query.actor = actor;
      }
    }

    // Filter by action group
    if (actionType && actionType !== 'all') {
      if (['create', 'created'].includes(actionType)) {
        query.action = { $regex: 'created|added|registered', $options: 'i' };
      } else if (['update', 'updated'].includes(actionType)) {
        query.action = { $regex: 'updated|edited|status|assigned|approved|rejected|restored', $options: 'i' };
      } else if (['delete', 'deleted'].includes(actionType)) {
        query.action = { $regex: 'deleted|removed|purged', $options: 'i' };
      } else if (['login', 'auth'].includes(actionType)) {
        query.action = { $regex: 'login|auth', $options: 'i' };
      } else {
        query.action = { $regex: actionType, $options: 'i' };
      }
    }

    // Filter by date range / timeframe
    if (timeframe) {
      const now = new Date();
      if (timeframe === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query.createdAt = { $gte: start };
      } else if (timeframe === 'week') {
        const start = new Date(Date.now() - 7 * 24 * 3600000);
        query.createdAt = { $gte: start };
      } else if (timeframe === 'month') {
        const start = new Date(Date.now() - 30 * 24 * 3600000);
        query.createdAt = { $gte: start };
      }
    } else if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const s = /^\d{4}-\d{2}-\d{2}$/.test(String(startDate).trim())
          ? (() => {
              const [y, m, d] = String(startDate).trim().split('-').map(Number);
              return new Date(y, m - 1, d, 0, 0, 0, 0);
            })()
          : new Date(startDate);
        s.setHours(0, 0, 0, 0);
        query.createdAt.$gte = s;
      }
      if (endDate) {
        const e = /^\d{4}-\d{2}-\d{2}$/.test(String(endDate).trim())
          ? (() => {
              const [y, m, d] = String(endDate).trim().split('-').map(Number);
              return new Date(y, m - 1, d, 23, 59, 59, 999);
            })()
          : new Date(endDate);
        e.setHours(23, 59, 59, 999);
        query.createdAt.$lte = e;
      }
    }

    // Search query
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { action: { $regex: s, $options: 'i' } },
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { actorRole: { $regex: s, $options: 'i' } },
      ];
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [logs, total, todayCount, loginCount, createdCount, updatedCount, deletedCount] = await Promise.all([
      ActivityLog.find(query)
        .populate('actor', 'name email avatar role department')
        .populate('relatedClient', 'name company')
        .populate('relatedProject', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
      ActivityLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      ActivityLog.countDocuments({ action: { $regex: 'login|auth', $options: 'i' } }),
      ActivityLog.countDocuments({ action: { $regex: 'created|added', $options: 'i' } }),
      ActivityLog.countDocuments({ action: { $regex: 'updated|edited|status', $options: 'i' } }),
      ActivityLog.countDocuments({ action: { $regex: 'deleted|removed', $options: 'i' } }),
    ]);

    res.json({
      success: true,
      logs,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats: {
        total,
        todayCount,
        loginCount,
        createdCount,
        updatedCount,
        deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getEmployeeDashboard = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const weekStart = new Date(Date.now() - 7 * 24 * 3600000);

    const userPos = req.user.position ? req.user.position.toLowerCase() : null;

    const userTaskOr = [
      { assignedTo: req.user._id },
      { scriptWriterAssigned: req.user._id },
      { videographerAssigned: req.user._id },
      { editorAssigned: req.user._id },
      { publisherAssigned: req.user._id },
    ];

    const [
      myTasks,
      overdueTasks,
      todayAttendance,
      completedThisWeek,
      weeklyLoggedUpdates,
      personalTasksThisWeek,
      recentEodReports,
      sops,
      inProgressCount,
      overTargetCount,
      allAssignedCount,
    ] = await Promise.all([
      Task.find({
        $or: userTaskOr,
        status: { $nin: ['done', 'completed', 'approved'] },
      })
        .populate('project', 'name')
        .populate('client', 'name company logo')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Task.countDocuments({
        $or: userTaskOr,
        dueDate: { $lt: new Date() },
        status: { $nin: ['done', 'completed', 'approved'] },
      }),
      Attendance.findOne({
        user: req.user._id,
        date: { $gte: startOfToday, $lte: endOfToday },
      }).sort({ createdAt: -1 }).lean(),
      Task.countDocuments({
        $or: userTaskOr,
        status: { $in: ['done', 'completed', 'approved'] },
        updatedAt: { $gte: weekStart },
      }),
      Task.countDocuments({
        $or: userTaskOr,
        'progressUpdates.workDate': { $gte: weekStart },
      }),
      Task.countDocuments({
        createdBy: req.user._id,
        isPersonalTask: true,
        dueDate: { $gte: weekStart },
      }),
      Attendance.find({
        user: req.user._id,
        'eodReport.submittedAt': { $exists: true },
      })
        .sort({ date: -1 })
        .limit(7),
      SOP.find({
        status: 'active',
        $or: [
          { sopType: 'company' },
          { sopType: 'department' },
          { sopType: 'role_based', role: { $in: [req.user.role, userPos, 'employee', 'all'].filter(Boolean) } },
          { createdBy: req.user._id },
        ],
      })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
      Task.countDocuments({
        $or: userTaskOr,
        status: { $in: ['On Process', 'in_progress', 'on_process'] },
      }),
      Task.countDocuments({
        $or: userTaskOr,
        isOverTarget: true,
      }),
      Task.countDocuments({
        $or: userTaskOr,
      }),
    ]);

    res.json({
      success: true,
      myTasks,
      assignedTasks: myTasks,
      totalAssignedTasks: allAssignedCount,
      inProgressTasks: inProgressCount,
      overTargetTasks: overTargetCount,
      overdueTasks,
      todayAttendance,
      completedThisWeek,
      weeklyLoggedUpdates,
      personalTasksThisWeek,
      recentEodReports,
      sops,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClientDashboard = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client profile not found' });

    const projects = await Project.find({ client: client._id }).select('name status progress dueDate manager team');
    const invoices = await Invoice.find({ client: client._id }).select('invoiceNumber status total dueDate').sort({ createdAt: -1 }).limit(5);

    let teamUserIds = [];
    if (client.assignedManager) teamUserIds.push(client.assignedManager);
    if (client.assignedTeam && client.assignedTeam.length > 0) {
      teamUserIds.push(...client.assignedTeam);
    }
    projects.forEach((p) => {
      if (p.manager) teamUserIds.push(p.manager);
      if (p.team && p.team.length > 0) teamUserIds.push(...p.team);
    });

    const uniqueTeamIds = [...new Set(teamUserIds.map((id) => id.toString()))];

    const eodFilter = { 'eodReport.submittedAt': { $exists: true } };
    if (uniqueTeamIds.length > 0) {
      eodFilter.user = { $in: uniqueTeamIds };
    }

    const eodReports = await Attendance.find(eodFilter)
      .populate('user', 'name avatar department position role email')
      .sort({ date: -1 })
      .limit(10);

    res.json({ success: true, client, projects, invoices, eodReports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyEmployeeSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    const start = new Date(targetYear, targetMonth - 1, 1);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Ensure all Sundays in the selected month default to holiday records
    try {
      const { ensureSundayHolidaysForPeriod } = await import('./attendance.controller.js');
      await ensureSundayHolidaysForPeriod(start, end);
    } catch (err) {
      console.error('Error ensuring Sunday holidays in monthly summary:', err);
    }

    const users = await User.find({
      role: { $in: ['employee', 'manager'] },
      isActive: true,
    }).select('name email department role position');

    const reportPromises = users.map(async (userObj) => {
      const [attendanceRecords, callCount] = await Promise.all([
        Attendance.find({
          user: userObj._id,
          date: { $gte: start, $lte: end },
        }).sort({ date: 1 }),
        CallHistory.countDocuments({
          addedBy: userObj._id,
          callDate: { $gte: start, $lte: end },
        }),
      ]);

      const present = attendanceRecords.filter((r) => r.status === 'present').length;
      const absent = attendanceRecords.filter((r) => r.status === 'absent').length;
      const leave = attendanceRecords.filter((r) => r.status === 'leave').length;
      const holiday = attendanceRecords.filter((r) => r.status === 'holiday').length;
      const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);

      // Map daily records with full login & logout timestamps and all sessions
      const dailyRecords = attendanceRecords.map((r) => ({
        _id: r._id,
        date: r.date,
        status: r.status,
        clockIn: r.clockIn,
        clockOut: r.clockOut,
        totalHours: r.totalHours || 0,
        sessions: (r.sessions && r.sessions.length > 0)
          ? r.sessions
          : (r.clockIn ? [{ clockIn: r.clockIn, clockOut: r.clockOut, durationHours: r.totalHours || 0 }] : []),
        notes: r.notes || '',
      }));

      return {
        user: userObj,
        present,
        absent,
        leave,
        holiday,
        totalHours: parseFloat(totalHours.toFixed(2)),
        callCount,
        dailyRecords,
      };
    });

    const summary = await Promise.all(reportPromises);

    res.json({ success: true, month: targetMonth, year: targetYear, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
