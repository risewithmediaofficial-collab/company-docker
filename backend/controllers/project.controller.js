// =============================================
// PROJECT CONTROLLER
// =============================================

import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Client from '../models/client.model.js';
import ActivityLog from '../models/activityLog.model.js';
import { createNotification } from '../utils/notification.js';
import { createActivityLog } from '../utils/activity.js';
import { withWorkspaceScope } from '../middleware/auth.middleware.js';

const projectStatusMap = {
  Planning: 'planning',
  'In Progress': 'active',
  'On Hold': 'on_hold',
  Completed: 'completed',
  Cancelled: 'cancelled',
};

const priorityMap = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'urgent',
  Urgent: 'urgent',
};

const serializeProject = (project) => {
  const item = project.toObject ? project.toObject() : project;
  return {
    ...item,
    status: {
      planning: 'Planning',
      active: 'In Progress',
      on_hold: 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }[item.status] || item.status,
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Critical',
    }[item.priority] || item.priority,
    endDate: item.dueDate,
  };
};

const normalizeProjectPayload = (body) => {
  const payload = { ...body };
  if (payload.status) payload.status = projectStatusMap[payload.status] || payload.status;
  if (payload.priority) payload.priority = priorityMap[payload.priority] || payload.priority;
  if (payload.endDate) {
    payload.dueDate = payload.endDate;
    delete payload.endDate;
  }
  if (payload.team && !Array.isArray(payload.team)) payload.team = [payload.team];
  if (!payload.currency) payload.currency = 'INR';
  return payload;
};

const assertProjectAccess = async (req, project) => {
  if (!project) return { allowed: false, status: 404, message: 'Project not found' };
  if (req.user.role === 'superAdmin') return { allowed: true };
  if (req.user.role === 'manager' && project.manager?.toString() === req.user._id.toString()) return { allowed: true };
  if (req.user.role === 'employee' && project.team?.some((member) => member.toString() === req.user._id.toString())) return { allowed: true };
  if (req.user.role === 'client') {
    const client = await Client.findOne({ userId: req.user._id }).select('_id');
    if (client && project.client?.toString() === client._id.toString()) return { allowed: true };
  }
  return { allowed: false, status: 403, message: 'Access denied' };
};

export const getProjects = async (req, res) => {
  try {
    const { status, client, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = projectStatusMap[status] || status;
    if (client) filter.client = client;
    if (search) filter.name = { $regex: search, $options: 'i' };
    
    // SuperAdmin and Manager can see all projects (for task creation)
    // Employee can see projects they're assigned to
    // Client can only see their own projects
    if (req.user.role === 'employee') filter.team = req.user._id;
    if (req.user.role === 'client') {
      const clientRecord = await Client.findOne({ userId: req.user._id }).select('_id');
      if (clientRecord) filter.client = clientRecord._id;
    }

    const scopedFilter = withWorkspaceScope(req, filter);

    const total = await Project.countDocuments(scopedFilter);
    const projects = await Project.find(scopedFilter)
      .populate('client', 'name email logo company')
      .populate('manager', 'name avatar')
      .populate('team', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, projects: projects.map(serializeProject) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email logo company')
      .populate('manager', 'name email avatar')
      .populate('team', 'name email avatar');

    const access = await assertProjectAccess(req, project);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const [totalTasks, doneTasks, recentActivity, recentTasks] = await Promise.all([
      Task.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id, status: { $in: ['done', 'approved'] } }),
      ActivityLog.find({ relatedProject: project._id })
        .populate('actor', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(20),
      Task.find({ project: project._id, parent: null })
        .populate('assignedTo', 'name avatar')
        .sort({ updatedAt: -1 })
        .limit(10),
    ]);

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      project: serializeProject({ ...project.toObject(), progress }),
      progress,
      recentActivity,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(normalizeProjectPayload(req.body));
    const populated = await Project.findById(project._id)
      .populate('client', 'name email logo company')
      .populate('manager', 'name avatar')
      .populate('team', 'name avatar');

    if (project.manager) {
      await createNotification({
        recipient: project.manager,
        sender: req.user._id,
        type: 'project_created',
        title: 'New Project Assigned',
        message: `You have been assigned as manager for: ${project.name}`,
        link: `/projects/${project._id}`,
      }, req.app.get('io'));
    }

    await Client.findByIdAndUpdate(project.client, {
      $set: {
        'onboardingSteps.projectCreated': true,
        lastActivityDate: new Date(),
      },
    });

    await createActivityLog({
      actor: req.user,
      action: 'project.created',
      entityType: 'project',
      entityId: project._id,
      title: 'Project created',
      description: `${project.name} was created.`,
      relatedClient: project.client,
      relatedProject: project._id,
      relatedUser: project.manager,
    });

    res.status(201).json({ success: true, project: serializeProject(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, normalizeProjectPayload(req.body), { new: true, runValidators: true })
      .populate('client', 'name email logo company')
      .populate('manager', 'name avatar')
      .populate('team', 'name avatar');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    req.app.get('io').broadcastToProject(project._id.toString(), 'projectUpdated', project);

    await createActivityLog({
      actor: req.user,
      action: 'project.updated',
      entityType: 'project',
      entityId: project._id,
      title: 'Project updated',
      description: `${project.name} was updated.`,
      relatedClient: project.client?._id || project.client,
      relatedProject: project._id,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    res.json({ success: true, project: serializeProject(project) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    await createActivityLog({
      actor: req.user,
      action: 'project.deleted',
      entityType: 'project',
      entityId: project._id,
      title: 'Project deleted',
      description: `${project.name} and its tasks were deleted.`,
      relatedClient: project.client,
      relatedProject: project._id,
    });

    res.json({ success: true, message: 'Project and associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectKanban = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('_id client manager team');
    const access = await assertProjectAccess(req, project);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const statuses = ['todo', 'in_progress', 'review', 'approved', 'rejected', 'done'];
    const taskFilter = { project: req.params.id, parent: null };
    if (req.user.role === 'client') taskFilter.isClientVisible = true;

    const tasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name avatar')
      .sort({ orderIndex: 1 });

    const kanban = {};
    statuses.forEach((status) => { kanban[status] = []; });
    tasks.forEach((task) => {
      if (kanban[task.status]) kanban[task.status].push(task);
    });

    res.json({ success: true, kanban });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
