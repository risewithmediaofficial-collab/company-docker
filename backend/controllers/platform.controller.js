// =============================================
// PLATFORM CONTROLLER — Super Admin Only
// Manages all organizations (tenants) in the SaaS
// =============================================

import Organization from '../models/organization.model.js';
import User from '../models/user.model.js';

// ─── Platform Stats Overview ──────────────────────────────────────────────────
// GET /api/platform/stats
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalOrgs,
      pendingOrgs,
      activeOrgs,
      suspendedOrgs,
      expiredOrgs,
      totalUsers,
      planCounts,
      recentOrgs,
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ planStatus: 'pending' }),
      Organization.countDocuments({ planStatus: 'active' }),
      Organization.countDocuments({ planStatus: 'suspended' }),
      Organization.countDocuments({ planStatus: 'expired' }),
      User.countDocuments({ role: { $ne: 'superAdmin' } }),
      Organization.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      Organization.find({ planStatus: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('ownerId', 'name email phone'),
    ]);

    // Build plan breakdown map
    const planBreakdown = { trial: 0, starter: 0, growth: 0, pro: 0 };
    planCounts.forEach(({ _id, count }) => {
      if (_id in planBreakdown) planBreakdown[_id] = count;
    });

    res.json({
      success: true,
      stats: {
        totalOrgs,
        pendingOrgs,
        activeOrgs,
        suspendedOrgs,
        expiredOrgs,
        totalUsers,
        planBreakdown,
      },
      recentPending: recentOrgs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── List All Organizations ───────────────────────────────────────────────────
// GET /api/platform/organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const { status, plan, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.planStatus = status;
    if (plan) filter.plan = plan;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orgs, total] = await Promise.all([
      Organization.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('ownerId', 'name email phone lastLogin'),
      Organization.countDocuments(filter),
    ]);

    // Attach user/client/project counts per org
    const orgIds = orgs.map((o) => o._id);
    const userCounts = await User.aggregate([
      { $match: { organizationId: { $in: orgIds }, role: { $ne: 'superAdmin' } } },
      { $group: { _id: '$organizationId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    userCounts.forEach(({ _id, count }) => { countMap[String(_id)] = count; });

    const result = orgs.map((org) => ({
      ...org.toObject(),
      userCount: countMap[String(org._id)] || 0,
    }));

    res.json({
      success: true,
      organizations: result,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Organization Detail ──────────────────────────────────────────
// GET /api/platform/organizations/:id
export const getOrganizationDetail = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('ownerId', 'name email phone lastLogin createdAt')
      .populate('approvedBy', 'name email');

    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Get user count for this org
    const users = await User.find({ organizationId: org._id })
      .select('name email role lastLogin isActive approvalStatus createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, organization: org, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Approve Organization (activate) ─────────────────────────────────────────
// PUT /api/platform/organizations/:id/approve
export const approveOrganization = async (req, res) => {
  try {
    const { plan = 'trial', maxUsers = 3, maxClients = 5, enabledModules } = req.body;

    const planDefaults = {
      trial:   { maxUsers: 3,  maxClients: 5,  modules: { crm: true, clients: true, projects: true, tasks: true } },
      starter: { maxUsers: 10, maxClients: 25, modules: { crm: true, clients: true, projects: true, tasks: true, finance: true, hr: true, attendance: true, portal: true, proposals: true, reports: true } },
      growth:  { maxUsers: 25, maxClients: 100, modules: { crm: true, clients: true, projects: true, tasks: true, finance: true, hr: true, attendance: true, smm: true, portal: true, sop: true, assets: true, proposals: true, reports: true, automations: true, influencers: true } },
      pro:     { maxUsers: 999, maxClients: 9999, modules: { crm: true, clients: true, projects: true, tasks: true, finance: true, hr: true, attendance: true, smm: true, portal: true, sop: true, assets: true, proposals: true, reports: true, automations: true, influencers: true, ai: true } },
    };

    const defaults = planDefaults[plan] || planDefaults.trial;
    const modules = enabledModules || defaults.modules;

    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      {
        planStatus: 'active',
        plan,
        maxUsers: maxUsers || defaults.maxUsers,
        maxClients: maxClients || defaults.maxClients,
        enabledModules: { ...defaults.modules, ...modules },
        approvedAt: new Date(),
        approvedBy: req.user._id,
      },
      { new: true }
    ).populate('ownerId', 'name email');

    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Also activate the owner's user account
    await User.findByIdAndUpdate(org.ownerId._id || org.ownerId, {
      isActive: true,
      approvalStatus: 'approved',
    });

    // Notify via socket if available
    const io = req.app.get('io');
    if (io) io.emit('orgApproved', { orgId: org._id });

    res.json({ success: true, message: 'Organization approved and activated', organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Plan & Modules ────────────────────────────────────────────────────
// PUT /api/platform/organizations/:id/plan
export const updateOrganizationPlan = async (req, res) => {
  try {
    const { plan, maxUsers, maxClients, enabledModules, adminNotes } = req.body;

    const updateData = {};
    if (plan) updateData.plan = plan;
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (maxClients !== undefined) updateData.maxClients = maxClients;
    if (enabledModules) updateData.enabledModules = enabledModules;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const org = await Organization.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    res.json({ success: true, message: 'Plan updated successfully', organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Suspend Organization ─────────────────────────────────────────────────────
// PUT /api/platform/organizations/:id/suspend
export const suspendOrganization = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { planStatus: 'suspended', suspendedAt: new Date(), suspendReason: reason },
      { new: true }
    );
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Deactivate all users in this org
    await User.updateMany({ organizationId: org._id }, { isActive: false });

    res.json({ success: true, message: 'Organization suspended', organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reactivate Organization ──────────────────────────────────────────────────
// PUT /api/platform/organizations/:id/reactivate
export const reactivateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { planStatus: 'active', suspendReason: '', suspendedAt: null },
      { new: true }
    );
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Reactivate owner user
    await User.findByIdAndUpdate(org.ownerId, { isActive: true });

    res.json({ success: true, message: 'Organization reactivated', organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reject/Delete Organization ───────────────────────────────────────────────
// DELETE /api/platform/organizations/:id
export const rejectOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Only allow rejecting pending orgs
    if (org.planStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only reject pending organizations' });
    }

    // Delete the owner user
    await User.findByIdAndDelete(org.ownerId);
    await Organization.findByIdAndDelete(org._id);

    res.json({ success: true, message: 'Organization registration rejected and removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle Single Module ─────────────────────────────────────────────────────
// PUT /api/platform/organizations/:id/modules/:moduleName
export const toggleModule = async (req, res) => {
  try {
    const { id, moduleName } = req.params;
    const { enabled } = req.body;

    const org = await Organization.findById(id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    org.enabledModules[moduleName] = Boolean(enabled);
    await org.save();

    res.json({
      success: true,
      message: `Module "${moduleName}" ${enabled ? 'enabled' : 'disabled'}`,
      enabledModules: org.enabledModules,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get My Organization (for org owner) ─────────────────────────────────────
// GET /api/platform/my-organization
export const getMyOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    res.json({ success: true, organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
