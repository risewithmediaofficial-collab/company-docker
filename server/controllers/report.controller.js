// =============================================
// REPORT CONTROLLER - Analytics & Dashboards
// =============================================

import Lead from '../models/lead.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Invoice from '../models/invoice.model.js';
import Attendance from '../models/attendance.model.js';
import User from '../models/user.model.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalLeads, newLeadsThisMonth, wonLeads,
      totalClients, activeClients,
      totalProjects, activeProjects,
      totalTasks, overdueTasks,
      monthRevenue, lastMonthRevenue,
      totalUsers,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Lead.countDocuments({ stage: 'won' }),
      Client.countDocuments(),
      Client.countDocuments({ status: 'active' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Task.countDocuments({ parent: null }),
      Task.countDocuments({ dueDate: { $lt: now }, status: { $nin: ['done', 'approved'] } }),
      Invoice.aggregate([{ $match: { status: 'paid', paidDate: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Invoice.aggregate([{ $match: { status: 'paid', paidDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      User.countDocuments({ isActive: true }),
    ]);

    // Lead stage funnel
    const stageFunnel = await Lead.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    // Monthly revenue for chart (last 6 months)
    const revenueChart = await Invoice.aggregate([
      { $match: { status: 'paid', paidDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } }, revenue: { $sum: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Task status breakdown
    const taskBreakdown = await Task.aggregate([
      { $match: { parent: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const thisMonthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalLeads, newLeadsThisMonth, wonLeads,
        conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0,
        totalClients, activeClients,
        totalProjects, activeProjects,
        totalTasks, overdueTasks,
        monthRevenue: thisMonthRev,
        revenueGrowth,
        totalUsers,
      },
      charts: { stageFunnel, revenueChart, taskBreakdown },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [myTasks, overdueTasks, todayAttendance, completedThisWeek] = await Promise.all([
      Task.find({ assignedTo: req.user._id, status: { $nin: ['done'] }, parent: null })
        .populate('project', 'name')
        .sort({ dueDate: 1 })
        .limit(10),
      Task.countDocuments({ assignedTo: req.user._id, dueDate: { $lt: new Date() }, status: { $nin: ['done', 'approved'] } }),
      Attendance.findOne({ user: req.user._id, date: today }),
      Task.countDocuments({ assignedTo: req.user._id, status: 'done', completedAt: { $gte: new Date(Date.now() - 7 * 24 * 3600000) } }),
    ]);

    res.json({ success: true, myTasks, overdueTasks, todayAttendance, completedThisWeek });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClientDashboard = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client profile not found' });

    const [projects, invoices] = await Promise.all([
      Project.find({ client: client._id }).select('name status progress dueDate'),
      Invoice.find({ client: client._id }).select('invoiceNumber status total dueDate').sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({ success: true, client, projects, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
