// =============================================
// SMM CALL LOG CONTROLLER
// =============================================
import SmmCallLog from '../../models/smm/smmCallLog.model.js';
import Client from '../../models/client.model.js';
import SmmClient from '../../models/smm/smmClient.model.js';
import Project from '../../models/project.model.js';
import SmmProject from '../../models/smm/smmProject.model.js';

// Helper: resolve client name from ID
const resolveClientName = async (clientId) => {
  if (!clientId) return '';
  try {
    const [crmClient, smmClient] = await Promise.all([
      Client.findById(clientId).select('company name'),
      SmmClient.findById(clientId).select('companyName'),
    ]);
    if (crmClient) return crmClient.company || crmClient.name || '';
    if (smmClient) return smmClient.companyName || '';
  } catch {
    // Ignore invalid ObjectId
  }
  return '';
};

// Helper: resolve project name from ID
const resolveProjectName = async (projectId) => {
  if (!projectId) return '';
  try {
    const [crmProj, smmProj] = await Promise.all([
      Project.findById(projectId).select('name'),
      SmmProject.findById(projectId).select('name'),
    ]);
    if (crmProj) return crmProj.name || '';
    if (smmProj) return smmProj.name || '';
  } catch {
    // Ignore invalid ObjectId
  }
  return '';
};

/**
 * Get SMM call logs with filtering & pagination
 */
export const getSmmCallLogs = async (req, res) => {
  try {
    const {
      clientId,
      projectId,
      status,
      callType,
      callPurpose,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Organization scope if present
    if (req.user.organizationId) {
      query.$or = [
        { organizationId: req.user.organizationId },
        { organizationId: { $exists: false } },
        { organizationId: null },
      ];
    }

    if (clientId) query.clientId = clientId;
    if (projectId) query.projectId = projectId;
    if (status && status !== 'all') query.status = status;
    if (callType && callType !== 'all') query.callType = callType;
    if (callPurpose && callPurpose !== 'all') query.callPurpose = callPurpose;

    if (startDate || endDate) {
      query.callDate = {};
      if (startDate) query.callDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.callDate.$lte = end;
      }
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      const searchConditions = [
        { notes: searchRegex },
        { spokenWith: searchRegex },
        { contactNumber: searchRegex },
        { clientName: searchRegex },
        { projectName: searchRegex },
        { nextAction: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      SmmCallLog.find(query)
        .populate('loggedBy', 'name email avatar role')
        .sort({ callDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(take),
      SmmCallLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / take) || 1,
        limit: take,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get SMM Call Log KPI summary statistics
 */
export const getSmmCallLogStats = async (req, res) => {
  try {
    const { clientId, projectId } = req.query;
    const match = {};

    if (req.user.organizationId) {
      match.$or = [
        { organizationId: req.user.organizationId },
        { organizationId: { $exists: false } },
        { organizationId: null },
      ];
    }
    if (clientId) match.clientId = clientId;
    if (projectId) match.projectId = projectId;

    const [total, connected, followUp, scheduled, noAnswer, completed] = await Promise.all([
      SmmCallLog.countDocuments(match),
      SmmCallLog.countDocuments({ ...match, status: 'Connected' }),
      SmmCallLog.countDocuments({ ...match, status: 'Follow-up Needed' }),
      SmmCallLog.countDocuments({ ...match, status: 'Scheduled' }),
      SmmCallLog.countDocuments({ ...match, status: 'No Answer / Busy' }),
      SmmCallLog.countDocuments({ ...match, status: 'Completed' }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        connected,
        followUpNeeded: followUp,
        scheduled,
        noAnswer,
        completed,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Create a new SMM call log
 */
export const createSmmCallLog = async (req, res) => {
  try {
    const {
      clientId,
      clientName,
      projectId,
      projectName,
      callDate,
      callTime,
      callType,
      callPurpose,
      status,
      spokenWith,
      contactNumber,
      duration,
      notes,
      nextAction,
      nextFollowUpDate,
      priority,
    } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: 'Call notes are required' });
    }

    const resolvedClientName = clientName || (await resolveClientName(clientId));
    const resolvedProjectName = projectName || (await resolveProjectName(projectId));

    const newLog = await SmmCallLog.create({
      organizationId: req.user.organizationId || null,
      clientId: clientId || null,
      clientName: resolvedClientName,
      projectId: projectId || null,
      projectName: resolvedProjectName,
      callDate: callDate ? new Date(callDate) : new Date(),
      callTime: callTime || '',
      callType: callType || 'Outgoing',
      callPurpose: callPurpose || 'General Update',
      status: status || 'Connected',
      spokenWith: spokenWith || '',
      contactNumber: contactNumber || '',
      duration: duration || '',
      notes: notes.trim(),
      nextAction: nextAction || '',
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      priority: priority || 'Medium',
      loggedBy: req.user._id,
    });

    const populated = await SmmCallLog.findById(newLog._id).populate(
      'loggedBy',
      'name email avatar role'
    );

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Update an existing SMM call log
 */
export const updateSmmCallLog = async (req, res) => {
  try {
    const log = await SmmCallLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Call log not found' });
    }

    const updates = { ...req.body };

    // Resolve names if IDs changed or names not passed
    if (updates.clientId && updates.clientId !== String(log.clientId) && !updates.clientName) {
      updates.clientName = await resolveClientName(updates.clientId);
    }
    if (updates.projectId && updates.projectId !== String(log.projectId) && !updates.projectName) {
      updates.projectName = await resolveProjectName(updates.projectId);
    }
    if (updates.callDate) updates.callDate = new Date(updates.callDate);
    if (updates.nextFollowUpDate) updates.nextFollowUpDate = new Date(updates.nextFollowUpDate);

    const updated = await SmmCallLog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('loggedBy', 'name email avatar role');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Quick status update
 */
export const updateSmmCallLogStatus = async (req, res) => {
  try {
    const { status, nextFollowUpDate, nextAction } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updates = { status };
    if (nextFollowUpDate !== undefined) {
      updates.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
    }
    if (nextAction !== undefined) updates.nextAction = nextAction;

    const updated = await SmmCallLog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate('loggedBy', 'name email avatar role');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Call log not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Delete a call log
 */
export const deleteSmmCallLog = async (req, res) => {
  try {
    const log = await SmmCallLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Call log not found' });
    }

    const isAdmin = ['superAdmin', 'admin'].includes(req.user.role);
    const isCreator = String(log.loggedBy) === String(req.user._id);

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or the creator can delete this call log',
      });
    }

    await SmmCallLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Call log deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
