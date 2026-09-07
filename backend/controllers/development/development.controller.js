// =============================================
// DEVELOPMENT MODULE CONTROLLER
// Builds development-specific workflow around existing CRM Tasks
// =============================================

import mongoose from 'mongoose';
import Task from '../../models/task.model.js';
import Sprint from '../../models/development/sprint.model.js';
import Release from '../../models/development/release.model.js';
import User from '../../models/user.model.js';
import Project from '../../models/project.model.js';
import { createNotification } from '../../utils/notification.js';
import { createActivityLog } from '../../utils/activity.js';

// ── Helper: Query for identifying Development tasks ──────────────────────────
export const getDevTaskQuery = (additionalQuery = {}) => {
  return {
    $or: [
      { department: { $regex: /^development$/i } },
      { 'development.isDevTask': true },
      { nonContentCategory: { $in: ['development_task', 'website', 'crm', 'bug_fix'] } },
      { taskType: { $in: ['website_development', 'website_update', 'crm_update', 'custom_task'] } },
    ],
    ...additionalQuery,
  };
};

// ── Helper: Safe mapping from Dev Stage to Global Task Status ─────────────────
export const mapDevStageToGlobalStatus = (stage) => {
  const map = {
    backlog: 'todo',
    analysis: 'todo',
    ready_for_dev: 'todo',
    in_development: 'in_progress',
    code_review: 'review',
    qa_testing: 'review',
    client_uat: 'waiting_for_client',
    approved: 'approved',
    deployment: 'on_process',
    live: 'completed',
    closed: 'completed',
    blocked: 'rejected',
  };
  return map[stage] || 'todo';
};

// ── GET Development Dashboard Metrics ─────────────────────────────────────────
export const getDevDashboard = async (req, res) => {
  try {
    const baseQuery = getDevTaskQuery();
    const tasks = await Task.find(baseQuery)
      .populate('project', 'name')
      .populate('client', 'name company')
      .populate('assignedTo', 'name email avatar role')
      .populate('development.developer', 'name email avatar')
      .populate('development.sprint', 'name status');

    const totalTasks = tasks.length;

    // Counts per pipeline stage
    const stages = [
      'backlog',
      'analysis',
      'ready_for_dev',
      'in_development',
      'code_review',
      'qa_testing',
      'client_uat',
      'approved',
      'deployment',
      'live',
      'closed',
      'blocked',
    ];

    const stageCounts = {};
    stages.forEach((s) => {
      stageCounts[s] = 0;
    });

    let totalBlocked = 0;
    let totalBugs = 0;
    const bugSeverityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

    // Workload aggregation by developer
    const developerWorkload = {};

    tasks.forEach((t) => {
      const dev = t.development || {};
      const currentStage = dev.stage || 'backlog';
      if (stageCounts[currentStage] !== undefined) {
        stageCounts[currentStage] += 1;
      }

      if (dev.isBlocked || currentStage === 'blocked') {
        totalBlocked += 1;
      }

      if (dev.isBug || t.nonContentCategory === 'bug_fix') {
        totalBugs += 1;
        const sev = dev.bugSeverity || 'medium';
        if (bugSeverityCounts[sev] !== undefined) {
          bugSeverityCounts[sev] += 1;
        }
      }

      // Developer assignment
      const assignedUsers = [];
      if (dev.developer) {
        assignedUsers.push(dev.developer);
      } else if (Array.isArray(t.assignedTo) && t.assignedTo.length > 0) {
        t.assignedTo.forEach((u) => assignedUsers.push(u));
      }

      assignedUsers.forEach((u) => {
        const uId = u._id ? u._id.toString() : u.toString();
        const uName = u.name || 'Developer';
        if (!developerWorkload[uId]) {
          developerWorkload[uId] = {
            id: uId,
            name: uName,
            avatar: u.avatar || '',
            total: 0,
            inProgress: 0,
            completed: 0,
            blocked: 0,
          };
        }
        developerWorkload[uId].total += 1;
        if (['in_development', 'code_review', 'qa_testing'].includes(currentStage)) {
          developerWorkload[uId].inProgress += 1;
        } else if (['live', 'closed'].includes(currentStage) || t.status === 'completed') {
          developerWorkload[uId].completed += 1;
        }
        if (dev.isBlocked || currentStage === 'blocked') {
          developerWorkload[uId].blocked += 1;
        }
      });
    });

    // Active Sprint info
    const activeSprint = await Sprint.findOne({ status: 'active' }).sort({ endDate: 1 });
    let sprintStats = null;
    if (activeSprint) {
      const sprintTasks = tasks.filter(
        (t) => t.development?.sprint && t.development.sprint._id?.toString() === activeSprint._id.toString()
      );
      const sprintTotal = sprintTasks.length;
      const sprintCompleted = sprintTasks.filter((t) =>
        ['live', 'closed'].includes(t.development?.stage) || t.status === 'completed'
      ).length;
      const sprintBlocked = sprintTasks.filter((t) => t.development?.isBlocked).length;

      sprintStats = {
        _id: activeSprint._id,
        name: activeSprint.name,
        goal: activeSprint.goal,
        startDate: activeSprint.startDate,
        endDate: activeSprint.endDate,
        total: sprintTotal,
        completed: sprintCompleted,
        remaining: sprintTotal - sprintCompleted,
        blocked: sprintBlocked,
      };
    }

    res.json({
      success: true,
      data: {
        totalTasks,
        totalBlocked,
        totalBugs,
        bugSeverityCounts,
        stageCounts,
        developerWorkload: Object.values(developerWorkload),
        activeSprint: sprintStats,
      },
    });
  } catch (error) {
    console.error('getDevDashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET Development Tasks (Filtered) ──────────────────────────────────────────
export const getDevTasks = async (req, res) => {
  try {
    const {
      stage,
      sprint,
      release,
      developer,
      project,
      client,
      isBlocked,
      isBug,
      search,
    } = req.query;

    const query = {};

    if (stage) {
      query['development.stage'] = stage;
    }
    if (sprint) {
      query['development.sprint'] = sprint;
    }
    if (release) {
      query['development.release'] = release;
    }
    if (developer) {
      query.$or = [
        { 'development.developer': developer },
        { assignedTo: developer },
      ];
    }
    if (project) {
      query.project = project;
    }
    if (client) {
      query.client = client;
    }
    if (isBlocked !== undefined) {
      query['development.isBlocked'] = isBlocked === 'true';
    }
    if (isBug !== undefined) {
      query.$or = [
        { 'development.isBug': isBug === 'true' },
        { nonContentCategory: 'bug_fix' },
      ];
    }
    if (search) {
      query.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'development.branch': { $regex: search, $options: 'i' } },
            { 'development.pullRequestNumber': { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const finalQuery = getDevTaskQuery(query);

    const tasks = await Task.find(finalQuery)
      .populate('project', 'name client')
      .populate('client', 'name company')
      .populate('assignedTo', 'name email avatar role position department')
      .populate('development.developer', 'name email avatar role position')
      .populate('development.reviewer', 'name email avatar role position')
      .populate('development.tester', 'name email avatar role position')
      .populate('development.blockedBy', 'name email')
      .populate('development.sprint', 'name status startDate endDate')
      .populate('development.release', 'version name environment status')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('getDevTasks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE Development Stage (Pipeline Transitions) ──────────────────────────
export const updateDevStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, blockedReason } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.development) {
      task.development = { isDevTask: true, stage: 'backlog' };
    }
    task.development.isDevTask = true;
    task.department = 'Development';

    const previousStage = task.development.stage || 'backlog';

    if (stage === 'blocked') {
      task.development.previousStage = previousStage !== 'blocked' ? previousStage : (task.development.previousStage || 'in_development');
      task.development.stage = 'blocked';
      task.development.isBlocked = true;
      task.development.blockedReason = blockedReason || 'Blocked by team';
      task.development.blockedBy = req.user._id;
      task.development.blockedAt = new Date();
    } else {
      // If moving out of blocked
      if (task.development.isBlocked) {
        task.development.isBlocked = false;
        task.development.blockedReason = '';
      }
      task.development.previousStage = previousStage;
      task.development.stage = stage;
    }

    // Sync global task status safely without breaking core CRM
    task.status = mapDevStageToGlobalStatus(task.development.stage);
    if (['live', 'closed'].includes(task.development.stage)) {
      task.completedAt = new Date();
    }

    await task.save();

    const io = req.app.get('io');
    if (task.project) {
      io?.broadcastToProject?.(task.project.toString(), 'devTaskStageChanged', {
        taskId: task._id,
        stage: task.development.stage,
      });
    }

    // Create activity log
    await createActivityLog({
      actor: req.user,
      action: 'task.dev.stage_changed',
      entityType: 'task',
      entityId: task._id,
      title: `Task moved to ${task.development.stage.replace(/_/g, ' ').toUpperCase()}`,
      description: task.development.isBlocked
        ? `Task blocked: ${task.development.blockedReason}`
        : `Task moved from ${previousStage.replace(/_/g, ' ')} to ${task.development.stage.replace(/_/g, ' ')}`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: {
        fromStage: previousStage,
        toStage: task.development.stage,
        isBlocked: task.development.isBlocked,
        blockedReason: task.development.blockedReason,
      },
    });

    // Notify developer or assignees
    const recipient = task.development.developer || (task.assignedTo && task.assignedTo[0]);
    if (recipient && recipient.toString() !== req.user._id.toString()) {
      await createNotification(
        {
          recipient,
          sender: req.user._id,
          type: task.development.isBlocked ? 'task_blocked' : 'task_stage_changed',
          title: task.development.isBlocked ? 'Task Blocked' : 'Development Stage Updated',
          message: `Task "${task.title}" is now ${task.development.stage.replace(/_/g, ' ')}`,
          link: '/development/board',
          metadata: { taskId: task._id },
        },
        io
      );
    }

    const populated = await Task.findById(task._id)
      .populate('project', 'name client')
      .populate('client', 'name company')
      .populate('assignedTo', 'name email avatar role')
      .populate('development.developer', 'name email avatar')
      .populate('development.reviewer', 'name email avatar')
      .populate('development.tester', 'name email avatar')
      .populate('development.sprint', 'name status')
      .populate('development.release', 'version name');

    res.json({
      success: true,
      message: `Task stage updated to ${task.development.stage}`,
      data: populated,
    });
  } catch (error) {
    console.error('updateDevStage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── SUBMIT Code Review (Reviewers) ───────────────────────────────────────────
export const submitCodeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStatus, reviewComments } = req.body;

    if (!['approved', 'changes_requested'].includes(reviewStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Review status must be either approved or changes_requested',
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.development) {
      task.development = { isDevTask: true, stage: 'code_review' };
    }

    task.development.reviewer = req.user._id;
    task.development.reviewStatus = reviewStatus;
    task.development.reviewComments = reviewComments || '';
    task.development.reviewedAt = new Date();

    const previousStage = task.development.stage;

    // Rule: if changes_requested, route back to in_development.
    // Rule: if approved, route forward to qa_testing.
    if (reviewStatus === 'changes_requested') {
      task.development.stage = 'in_development';
      task.status = 'in_progress';
    } else if (reviewStatus === 'approved') {
      task.development.stage = 'qa_testing';
      task.status = 'review';
    }

    await task.save();

    const io = req.app.get('io');
    const actionTitle = reviewStatus === 'approved' ? 'Code Review Approved' : 'Code Review Changes Requested';
    const actionDesc = `${req.user.name} ${reviewStatus === 'approved' ? 'approved' : 'requested changes on'} task: "${task.title}"`;

    await createActivityLog({
      actor: req.user,
      action: 'task.dev.code_review',
      entityType: 'task',
      entityId: task._id,
      title: actionTitle,
      description: reviewComments ? `${actionDesc} — Note: ${reviewComments}` : actionDesc,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { reviewStatus, reviewComments },
    });

    // Notify developer
    const devId = task.development.developer || (task.assignedTo && task.assignedTo[0]);
    if (devId && devId.toString() !== req.user._id.toString()) {
      await createNotification(
        {
          recipient: devId,
          sender: req.user._id,
          type: reviewStatus === 'approved' ? 'review_approved' : 'changes_requested',
          title: actionTitle,
          message: reviewComments || actionDesc,
          link: '/development/board',
          metadata: { taskId: task._id, reviewStatus },
        },
        io
      );
    }

    const populated = await Task.findById(task._id)
      .populate('project', 'name client')
      .populate('client', 'name company')
      .populate('development.developer', 'name email avatar')
      .populate('development.reviewer', 'name email avatar')
      .populate('development.tester', 'name email avatar');

    res.json({
      success: true,
      message: `Code review recorded: ${reviewStatus}`,
      data: populated,
    });
  } catch (error) {
    console.error('submitCodeReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── SUBMIT QA Test Result (QA Testers) ───────────────────────────────────────
export const submitQAResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { testStatus, testNotes, testAttachments } = req.body;

    if (!['passed', 'failed', 'blocked'].includes(testStatus)) {
      return res.status(400).json({
        success: false,
        message: 'QA test status must be passed, failed, or blocked',
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.development) {
      task.development = { isDevTask: true, stage: 'qa_testing' };
    }

    task.development.tester = req.user._id;
    task.development.testStatus = testStatus;
    task.development.testNotes = testNotes || '';
    task.development.testDate = new Date();
    if (Array.isArray(testAttachments)) {
      task.development.testAttachments = testAttachments;
    }

    // Rule: If failed, move back to in_development
    // Rule: If passed, move forward to client_uat
    // Rule: If blocked, move to blocked
    if (testStatus === 'failed') {
      task.development.stage = 'in_development';
      task.status = 'in_progress';
    } else if (testStatus === 'passed') {
      task.development.stage = 'client_uat';
      task.status = 'waiting_for_client';
    } else if (testStatus === 'blocked') {
      task.development.previousStage = 'qa_testing';
      task.development.stage = 'blocked';
      task.development.isBlocked = true;
      task.development.blockedReason = testNotes || 'Blocked in QA testing';
      task.development.blockedBy = req.user._id;
      task.development.blockedAt = new Date();
    }

    await task.save();

    const io = req.app.get('io');
    const actionTitle = testStatus === 'passed' ? 'QA Testing Passed' : testStatus === 'failed' ? 'QA Testing Failed' : 'QA Testing Blocked';
    const actionDesc = `${req.user.name} logged QA status "${testStatus}" on task "${task.title}"`;

    await createActivityLog({
      actor: req.user,
      action: 'task.dev.qa_result',
      entityType: 'task',
      entityId: task._id,
      title: actionTitle,
      description: testNotes ? `${actionDesc} — Note: ${testNotes}` : actionDesc,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { testStatus, testNotes },
    });

    // Notify developer
    const devId = task.development.developer || (task.assignedTo && task.assignedTo[0]);
    if (devId && devId.toString() !== req.user._id.toString()) {
      await createNotification(
        {
          recipient: devId,
          sender: req.user._id,
          type: testStatus === 'passed' ? 'qa_passed' : 'qa_failed',
          title: actionTitle,
          message: testNotes || actionDesc,
          link: '/development/board',
          metadata: { taskId: task._id, testStatus },
        },
        io
      );
    }

    const populated = await Task.findById(task._id)
      .populate('project', 'name client')
      .populate('client', 'name company')
      .populate('development.developer', 'name email avatar')
      .populate('development.reviewer', 'name email avatar')
      .populate('development.tester', 'name email avatar');

    res.json({
      success: true,
      message: `QA result recorded: ${testStatus}`,
      data: populated,
    });
  } catch (error) {
    console.error('submitQAResult error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── TOGGLE Blocked Status (Block / Unblock) ──────────────────────────────────
export const toggleBlocked = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, blockedReason } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.development) {
      task.development = { isDevTask: true, stage: 'backlog' };
    }

    if (isBlocked) {
      task.development.previousStage = task.development.stage !== 'blocked' ? task.development.stage : (task.development.previousStage || 'in_development');
      task.development.stage = 'blocked';
      task.development.isBlocked = true;
      task.development.blockedReason = blockedReason || 'Task is blocked';
      task.development.blockedBy = req.user._id;
      task.development.blockedAt = new Date();
    } else {
      // Unblock: return to previousStage
      task.development.isBlocked = false;
      task.development.blockedReason = '';
      task.development.stage = task.development.previousStage || 'in_development';
      task.status = mapDevStageToGlobalStatus(task.development.stage);
    }

    await task.save();

    const io = req.app.get('io');
    await createActivityLog({
      actor: req.user,
      action: isBlocked ? 'task.dev.blocked' : 'task.dev.unblocked',
      entityType: 'task',
      entityId: task._id,
      title: isBlocked ? 'Task Blocked' : 'Task Unblocked',
      description: isBlocked ? `Task blocked: ${task.development.blockedReason}` : `Task unblocked, resumed at ${task.development.stage}`,
      relatedClient: task.client,
      relatedProject: task.project,
      relatedTask: task._id,
      metadata: { isBlocked, blockedReason: task.development.blockedReason },
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'name client')
      .populate('client', 'name company')
      .populate('development.developer', 'name email avatar')
      .populate('development.blockedBy', 'name email');

    res.json({
      success: true,
      message: isBlocked ? 'Task marked as Blocked' : 'Task unblocked',
      data: populated,
    });
  } catch (error) {
    console.error('toggleBlocked error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE Development Metadata (Git, PR, Assignees, Sprint, Release) ─────────
export const updateDevMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      developer,
      reviewer,
      tester,
      branch,
      pullRequestUrl,
      pullRequestNumber,
      commitHash,
      sprint,
      release,
      isBug,
      bugSeverity,
      stepsToReproduce,
      expectedResult,
      actualResult,
      environment,
    } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.development) {
      task.development = { isDevTask: true, stage: 'backlog' };
    }
    task.development.isDevTask = true;
    task.department = 'Development';

    if (developer !== undefined) task.development.developer = developer || null;
    if (reviewer !== undefined) task.development.reviewer = reviewer || null;
    if (tester !== undefined) task.development.tester = tester || null;
    if (branch !== undefined) task.development.branch = branch;
    if (pullRequestUrl !== undefined) task.development.pullRequestUrl = pullRequestUrl;
    if (pullRequestNumber !== undefined) task.development.pullRequestNumber = pullRequestNumber;
    if (commitHash !== undefined) task.development.commitHash = commitHash;
    if (sprint !== undefined) task.development.sprint = sprint || null;
    if (release !== undefined) task.development.release = release || null;
    if (isBug !== undefined) task.development.isBug = Boolean(isBug);
    if (bugSeverity !== undefined) task.development.bugSeverity = bugSeverity;
    if (stepsToReproduce !== undefined) task.development.stepsToReproduce = stepsToReproduce;
    if (expectedResult !== undefined) task.development.expectedResult = expectedResult;
    if (actualResult !== undefined) task.development.actualResult = actualResult;
    if (environment !== undefined) task.development.environment = environment;

    // If developer is assigned, also ensure assignedTo has the user
    if (developer && !task.assignedTo.some((u) => u.toString() === developer.toString())) {
      task.assignedTo.push(developer);
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('project', 'name client')
      .populate('client', 'name company')
      .populate('assignedTo', 'name email avatar')
      .populate('development.developer', 'name email avatar')
      .populate('development.reviewer', 'name email avatar')
      .populate('development.tester', 'name email avatar')
      .populate('development.sprint', 'name status')
      .populate('development.release', 'version name');

    res.json({
      success: true,
      message: 'Development details updated',
      data: populated,
    });
  } catch (error) {
    console.error('updateDevMetadata error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── SPRINT MANAGEMENT (CRUD) ──────────────────────────────────────────────────
export const getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find()
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    // Calculate task counts per sprint
    const sprintIds = sprints.map((s) => s._id);
    const sprintTasks = await Task.find({ 'development.sprint': { $in: sprintIds } })
      .select('development.sprint development.stage status');

    const sprintStats = sprints.map((s) => {
      const tasks = sprintTasks.filter(
        (t) => t.development?.sprint?.toString() === s._id.toString()
      );
      const total = tasks.length;
      const completed = tasks.filter(
        (t) => ['live', 'closed'].includes(t.development?.stage) || t.status === 'completed'
      ).length;
      return {
        ...s.toObject(),
        totalTasks: total,
        completedTasks: completed,
        remainingTasks: total - completed,
      };
    });

    res.json({ success: true, data: sprintStats });
  } catch (error) {
    console.error('getSprints error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, goal, status, project } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Name, Start Date, and End Date are required' });
    }

    const sprint = await Sprint.create({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      goal: goal || '',
      status: status || 'planning',
      project: project || null,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: sprint });
  } catch (error) {
    console.error('createSprint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const sprint = await Sprint.findByIdAndUpdate(id, req.body, { new: true });
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }
    res.json({ success: true, data: sprint });
  } catch (error) {
    console.error('updateSprint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const sprint = await Sprint.findByIdAndDelete(id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    // Unlink sprint from tasks
    await Task.updateMany(
      { 'development.sprint': id },
      { $set: { 'development.sprint': null } }
    );

    res.json({ success: true, message: 'Sprint deleted' });
  } catch (error) {
    console.error('deleteSprint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── RELEASE & DEPLOYMENT MANAGEMENT (CRUD) ────────────────────────────────────
export const getReleases = async (req, res) => {
  try {
    const releases = await Release.find()
      .populate('deployedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const releaseIds = releases.map((r) => r._id);
    const releaseTasks = await Task.find({ 'development.release': { $in: releaseIds } })
      .select('title status development.stage development.release')
      .populate('project', 'name');

    const result = releases.map((r) => {
      const tasks = releaseTasks.filter(
        (t) => t.development?.release?.toString() === r._id.toString()
      );
      return {
        ...r.toObject(),
        taskCount: tasks.length,
        tasks,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('getReleases error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRelease = async (req, res) => {
  try {
    const { version, name, description, environment, status, commit } = req.body;

    if (!version || !name) {
      return res.status(400).json({ success: false, message: 'Version and Name are required' });
    }

    const release = await Release.create({
      version,
      name,
      description: description || '',
      environment: environment || 'staging',
      status: status || 'planned',
      commit: commit || '',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: release });
  } catch (error) {
    console.error('createRelease error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRelease = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.status === 'deployed' && !payload.deploymentDate) {
      payload.deploymentDate = new Date();
      payload.deployedBy = req.user._id;
    }

    const release = await Release.findByIdAndUpdate(id, payload, { new: true });
    if (!release) {
      return res.status(404).json({ success: false, message: 'Release not found' });
    }

    // If release was deployed, optionally update associated tasks stage to deployment/live
    if (payload.status === 'deployed') {
      await Task.updateMany(
        { 'development.release': id, 'development.stage': { $in: ['approved', 'deployment'] } },
        { $set: { 'development.stage': 'live', status: 'completed' } }
      );
    }

    res.json({ success: true, data: release });
  } catch (error) {
    console.error('updateRelease error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRelease = async (req, res) => {
  try {
    const { id } = req.params;
    const release = await Release.findByIdAndDelete(id);
    if (!release) {
      return res.status(404).json({ success: false, message: 'Release not found' });
    }

    await Task.updateMany(
      { 'development.release': id },
      { $set: { 'development.release': null } }
    );

    res.json({ success: true, message: 'Release deleted' });
  } catch (error) {
    console.error('deleteRelease error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
