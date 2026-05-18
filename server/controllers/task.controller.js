// =============================================
// TASK CONTROLLER
// =============================================

import Task from '../models/task.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import ActivityLog from '../models/activityLog.model.js';
import { createNotification } from '../utils/notification.js';
import { runAutomation } from '../services/automation.service.js';
import { createActivityLog } from '../utils/activity.js';
import { withWorkspaceScope } from '../middleware/auth.middleware.js';

const taskStatusMap = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'In Review': 'review',
  Approved: 'approved',
  Done: 'done',
  Blocked: 'rejected',
  Rejected: 'rejected',
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  approved: 'Approved',
  rejected: 'Blocked',
  done: 'Done',
};

const priorityMap = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Urgent: 'urgent',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const uniqueIds = (items = []) => [...new Set(items.filter(Boolean).map((item) => item.toString()))];

const serializeTask = (task) => {
  const item = task?.toObject ? task.toObject() : task;
  if (!item) return null;

  return {
    ...item,
    status: statusLabels[item.status] || item.status,
    priority: priorityLabels[item.priority] || item.priority,
  };
};

const normalizeTaskPayload = (body = {}) => {
  const payload = { ...body };

  if (payload.status) payload.status = taskStatusMap[payload.status] || payload.status;
  if (payload.priority) payload.priority = priorityMap[payload.priority] || payload.priority;
  if (payload.assignedTo !== undefined) payload.assignedTo = uniqueIds(toArray(payload.assignedTo));
  if (payload.tags !== undefined) payload.tags = Array.isArray(payload.tags)
    ? payload.tags.filter(Boolean)
    : payload.tags
      .toString()
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  if (payload.estimatedHours !== undefined) payload.estimatedHours = Number(payload.estimatedHours) || 0;
  if (payload.loggedHours !== undefined) payload.loggedHours = Number(payload.loggedHours) || 0;
  if (payload.orderIndex !== undefined) payload.orderIndex = Number(payload.orderIndex) || 0;
  if (payload.isClientVisible !== undefined) payload.isClientVisible = Boolean(payload.isClientVisible);
  if (payload.approvalRequired !== undefined) payload.approvalRequired = Boolean(payload.approvalRequired);
  if (payload.actualStartDate !== undefined) payload.actualStartDate = payload.actualStartDate ? new Date(payload.actualStartDate) : undefined;

  return payload;
};

const getClientRecordForUser = async (userId) => Client.findOne({ userId }).select('_id assignedManager assignedTeam');

const getManagedScope = async (userId) => {
  const [projects, clients] = await Promise.all([
    Project.find({ manager: userId }).select('_id'),
    Client.find({ assignedManager: userId }).select('_id'),
  ]);

  return {
    projectIds: projects.map((project) => project._id),
    clientIds: clients.map((client) => client._id),
  };
};

const buildScopedTaskFilter = async (req, baseFilter = {}) => {
  const filter = { ...baseFilter };

  if (req.user.role === 'superAdmin') return filter;

  if (req.user.role === 'manager') {
    const { projectIds, clientIds } = await getManagedScope(req.user._id);
    filter.$or = [
      { project: { $in: projectIds.length ? projectIds : [null] } },
      { client: { $in: clientIds.length ? clientIds : [null] } },
      { createdBy: req.user._id },
      { assignedTo: req.user._id },
    ];
    return filter;
  }

  if (req.user.role === 'employee') {
    filter.$or = [
      { assignedTo: req.user._id },
      { createdBy: req.user._id },
    ];
    return filter;
  }

  if (req.user.role === 'client') {
    const client = await getClientRecordForUser(req.user._id);
    if (!client) {
      filter._id = null;
      return filter;
    }

    filter.client = client._id;
    filter.isClientVisible = true;
    return filter;
  }

  filter._id = null;
  return filter;
};

const assertTaskAccess = async (req, task) => {
  if (!task) return { allowed: false, status: 404, message: 'Task not found' };
  if (req.user.role === 'superAdmin') return { allowed: true };

  if (req.user.role === 'employee') {
    const isAssigned = task.assignedTo?.some((userId) => userId.toString() === req.user._id.toString());
    const isCreator = task.createdBy?.toString() === req.user._id.toString();
    return isAssigned || isCreator
      ? { allowed: true }
      : { allowed: false, status: 403, message: 'Access denied' };
  }

  if (req.user.role === 'client') {
    const client = await getClientRecordForUser(req.user._id);
    if (client && task.client?.toString() === client._id.toString() && task.isClientVisible) {
      return { allowed: true };
    }

    return { allowed: false, status: 403, message: 'Access denied' };
  }

  if (req.user.role === 'manager') {
    if (task.createdBy?.toString() === req.user._id.toString()) {
      return { allowed: true };
    }

    const [project, client] = await Promise.all([
      task.project ? Project.findById(task.project).select('manager') : null,
      task.client ? Client.findById(task.client).select('assignedManager') : null,
    ]);

    if (project?.manager?.toString() === req.user._id.toString()) return { allowed: true };
    if (client?.assignedManager?.toString() === req.user._id.toString()) return { allowed: true };

    return { allowed: false, status: 403, message: 'Access denied' };
  }

  return { allowed: false, status: 403, message: 'Access denied' };
};

const hydrateTask = async (taskId) => Task.findById(taskId)
  .populate('assignedTo', 'name email avatar role')
  .populate('createdBy', 'name email avatar role')
  .populate('project', 'name client manager')
  .populate('client', 'name company email')
  .populate('comments.author', 'name avatar')
  .populate('approvedBy', 'name avatar')
  .populate('timeEntries.user', 'name avatar')
  .populate('progressUpdates.updatedBy', 'name avatar');

const notifyNewAssignees = async ({ task, previousAssignedTo = [], actorId, io }) => {
  const previousIds = uniqueIds(previousAssignedTo);
  const nextIds = uniqueIds(task.assignedTo);

  const newlyAssigned = nextIds.filter(
    (userId) => !previousIds.includes(userId) && userId !== actorId.toString(),
  );

  await Promise.all(newlyAssigned.map((recipient) => createNotification({
    recipient,
    sender: actorId,
    type: 'task_assigned',
    title: 'Task Assigned',
    message: `You have been assigned: ${task.title}`,
    link: '/tasks',
  }, io)));
};

const updateCompletionState = (task) => {
  if (['done', 'approved'].includes(task.status)) {
    task.completedAt = task.completedAt || new Date();
    return;
  }

  task.completedAt = undefined;
  if (task.status !== 'approved') {
    task.approvedAt = undefined;
    task.approvedBy = undefined;
  }
};

export const getTasks = async (req, res) => {
  try {
    const {
      project,
      client,
      taskType,
      status,
      assignedTo,
      priority,
      search,
      parent,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (project) filter.project = project;
    if (client) filter.client = client;
    if (taskType) filter.taskType = taskType;
    if (parent === 'all') {
      // leave unfiltered
    } else if (parent) {
      filter.parent = parent;
    } else {
      filter.parent = null;
    }

    if (status) filter.status = taskStatusMap[status] || status;
    if (priority) filter.priority = priorityMap[priority] || priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const scopedFilter = withWorkspaceScope(req, await buildScopedTaskFilter(req, filter));

    const total = await Task.countDocuments(scopedFilter);
    const tasks = await Task.find(scopedFilter)
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar')
      .populate('project', 'name')
      .populate('client', 'name company')
      .sort({ dueDate: 1, orderIndex: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit || 1)),
      tasks: tasks.map(serializeTask),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await hydrateTask(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const [subtasks, recentActivity] = await Promise.all([
      Task.find({ parent: task._id })
        .populate('assignedTo', 'name avatar')
        .populate('createdBy', 'name avatar')
        .sort({ orderIndex: 1, createdAt: -1 }),
      ActivityLog.find({ relatedTask: task._id })
        .populate('actor', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(15),
    ]);

    res.json({
      success: true,
      task: serializeTask(task),
      subtasks: subtasks.map(serializeTask),
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const payload = normalizeTaskPayload(req.body);
    if (!payload.title?.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    if (!payload.project && !payload.client) {
      return res.status(400).json({ success: false, message: 'Project or client is required to create a task' });
    }

    const project = payload.project
      ? await Project.findById(payload.project).select('name client manager team')
      : null;
    if (payload.project && !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project && !payload.client) payload.client = project.client;

    const client = payload.client
      ? await Client.findById(payload.client).select('name assignedManager assignedTeam')
      : null;
    if (payload.client && !client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const task = await Task.create({
      ...payload,
      createdBy: req.user._id,
    });

    const io = req.app.get('io');
    await notifyNewAssignees({
      task,
      previousAssignedTo: [],
      actorId: req.user._id,
      io,
    });

    if (task.project) {
      io?.broadcastToProject?.(task.project.toString(), 'taskCreated', task);
    }

    await Promise.all([
      client?._id ? Client.findByIdAndUpdate(client._id, { $set: { lastActivityDate: new Date() } }) : Promise.resolve(),
      createActivityLog({
        actor: req.user,
        action: 'task.created',
        entityType: 'task',
        entityId: task._id,
        title: 'Task created',
        description: `${task.title} was created.`,
        relatedClient: task.client,
        relatedProject: task.project,
        relatedTask: task._id,
      }),
    ]);

    const populated = await hydrateTask(task._id);
    res.status(201).json({ success: true, task: serializeTask(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const previousAssignedTo = [...(task.assignedTo || [])];
    const payload = normalizeTaskPayload(req.body);

    Object.assign(task, payload);
    updateCompletionState(task);
    await task.save();

    if (payload.status && ['done', 'approved'].includes(task.status)) {
      const project = task.project ? await Project.findById(task.project).select('manager name') : null;
      await runAutomation('task_completed', { task, project, user: req.user, io: req.app.get('io') });
    }

    const io = req.app.get('io');
    await notifyNewAssignees({
      task,
      previousAssignedTo,
      actorId: req.user._id,
      io,
    });

    const updated = await hydrateTask(task._id);
    if (task.project) {
      io?.broadcastToProject?.(task.project.toString(), 'taskUpdated', serializeTask(updated));
    }

    await createActivityLog({
      actor: req.user,
      action: 'task.updated',
      entityType: 'task',
      entityId: task._id,
      title: 'Task updated',
      description: `${task.title} was updated.`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    res.json({ success: true, task: serializeTask(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status, orderIndex } = req.body;
    const task = await Task.findById(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    task.status = taskStatusMap[status] || status;
    if (orderIndex !== undefined) task.orderIndex = Number(orderIndex) || 0;
    updateCompletionState(task);
    await task.save();

    const updated = await hydrateTask(task._id);
    const io = req.app.get('io');
    if (task.project) {
      io?.broadcastToProject?.(task.project.toString(), 'taskStatusUpdated', {
        taskId: task._id,
        status: task.status,
        orderIndex: task.orderIndex,
      });
    }

    await createActivityLog({
      actor: req.user,
      action: 'task.status.updated',
      entityType: 'task',
      entityId: task._id,
      title: 'Task status updated',
      description: `${task.title} moved to ${statusLabels[task.status] || task.status}.`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { status: task.status, orderIndex: task.orderIndex },
    });

    res.json({ success: true, task: serializeTask(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (!req.body.content?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    task.comments.push({
      content: req.body.content.trim(),
      author: req.user._id,
      attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [],
    });
    await task.save();

    const updated = await hydrateTask(task._id);
    const comment = updated.comments[updated.comments.length - 1];
    const io = req.app.get('io');

    if (task.project) {
      io?.broadcastToProject?.(task.project.toString(), 'taskCommentAdded', {
        taskId: task._id,
        comment,
      });
    }

    const recipients = uniqueIds([
      ...(task.assignedTo || []),
      task.createdBy,
    ]).filter((userId) => userId !== req.user._id.toString());

    await Promise.all(recipients.map((recipient) => createNotification({
      recipient,
      sender: req.user._id,
      type: 'task_comment',
      title: 'Task comment added',
      message: `${req.user.name} commented on ${task.title}`,
      link: '/tasks',
      metadata: { taskId: task._id },
    }, io)));

    await createActivityLog({
      actor: req.user,
      action: 'task.comment.added',
      entityType: 'task',
      entityId: task._id,
      title: 'Task comment added',
      description: `A comment was added to ${task.title}.`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
    });

    res.json({ success: true, task: serializeTask(updated), comment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveTask = async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    const task = await Task.findById(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (req.user.role === 'client' && !task.isClientVisible) {
      return res.status(403).json({ success: false, message: 'This task is not visible to the client' });
    }

    task.status = action === 'approve' ? 'approved' : 'rejected';
    task.approvedBy = req.user._id;
    task.approvedAt = new Date();
    task.rejectionReason = action === 'reject' ? (reason || '') : '';
    updateCompletionState(task);
    await task.save();

    const io = req.app.get('io');
    const recipients = uniqueIds([
      ...(task.assignedTo || []),
      task.createdBy,
    ]).filter((userId) => userId !== req.user._id.toString());

    await Promise.all(recipients.map((recipient) => createNotification({
      recipient,
      sender: req.user._id,
      type: 'approval_done',
      title: `Task ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `"${task.title}" was ${action === 'approve' ? 'approved' : 'rejected'}${reason ? `: ${reason}` : ''}`,
      link: '/tasks',
    }, io)));

    await createActivityLog({
      actor: req.user,
      action: 'task.approval.updated',
      entityType: 'task',
      entityId: task._id,
      title: 'Task approval updated',
      description: `${task.title} was ${action === 'approve' ? 'approved' : 'rejected'}.`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { reason },
    });

    const updated = await hydrateTask(task._id);
    res.json({ success: true, task: serializeTask(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logTime = async (req, res) => {
  try {
    const { hours, description } = req.body;
    const parsedHours = Number(hours);
    if (!parsedHours || parsedHours <= 0) {
      return res.status(400).json({ success: false, message: 'Hours must be greater than zero' });
    }

    const task = await Task.findById(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    task.timeEntries.push({
      user: req.user._id,
      hours: parsedHours,
      description: description || '',
    });
    task.loggedHours = (task.loggedHours || 0) + parsedHours;
    await task.save();

    await createActivityLog({
      actor: req.user,
      action: 'task.time.logged',
      entityType: 'task',
      entityId: task._id,
      title: 'Task time logged',
      description: `${parsedHours} hour(s) were logged for ${task.title}.`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { hours: parsedHours, description },
    });

    const updated = await hydrateTask(task._id);
    res.json({ success: true, task: serializeTask(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addProgressUpdate = async (req, res) => {
  try {
    const { description, hours } = req.body;
    
    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: 'Progress description is required' });
    }

    const task = await Task.findById(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    // If work is just starting and actualStartDate is not set, set it now
    if (!task.actualStartDate && task.status === 'todo') {
      task.actualStartDate = new Date();
      task.status = 'in_progress';
    }

    const progressEntry = {
      description: description.trim(),
      hours: Number(hours) || 0,
      completedAt: new Date(),
      updatedBy: req.user._id,
    };

    task.progressUpdates.push(progressEntry);
    
    // Update loggedHours if hours were provided
    if (Number(hours) > 0) {
      task.loggedHours = (task.loggedHours || 0) + Number(hours);
    }

    await task.save();

    await createActivityLog({
      actor: req.user,
      action: 'task.progress.updated',
      entityType: 'task',
      entityId: task._id,
      title: 'Task progress updated',
      description: `Progress logged: ${description.trim()}`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { hours: Number(hours) || 0, description: description.trim() },
    });

    const updated = await hydrateTask(task._id);
    const io = req.app.get('io');
    
    if (task.project) {
      io?.broadcastToProject?.(task.project.toString(), 'taskProgressUpdated', {
        taskId: task._id,
        progress: updated.progressUpdates[updated.progressUpdates.length - 1],
        loggedHours: updated.loggedHours,
      });
    }

    res.json({ success: true, task: serializeTask(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const access = await assertTaskAccess(req, task);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    await Task.deleteMany({ $or: [{ parent: task._id }, { _id: task._id }] });

    const io = req.app.get('io');
    if (task.project) {
      io?.broadcastToProject?.(task.project.toString(), 'taskDeleted', { taskId: task._id });
    }

    await createActivityLog({
      actor: req.user,
      action: 'task.deleted',
      entityType: 'task',
      entityId: task._id,
      title: 'Task deleted',
      description: `${task.title} was deleted.`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
    });

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
