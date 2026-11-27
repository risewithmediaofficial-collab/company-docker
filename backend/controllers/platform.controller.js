// =============================================
// PLATFORM CONTROLLER — Super Admin Only
// Manages all organizations (tenants) in the SaaS
// =============================================

import mongoose from 'mongoose';
import Organization from '../models/organization.model.js';
import User from '../models/user.model.js';
import BrandWorkspace from '../models/brandWorkspace.model.js';
import SaasPayment from '../models/saasPayment.model.js';
import { sanitizeOrganizationForRole } from '../utils/orgAccess.js';

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
      failedPaymentsCount,
      paidPaymentsCount,
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
      SaasPayment.countDocuments({ status: 'failed' }),
      SaasPayment.countDocuments({ status: 'paid' }),
    ]);

    // Build plan breakdown map
    const planBreakdown = { trial: 0, free: 0, starter: 0, growth: 0, pro: 0 };
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
        failedPaymentsCount,
        paidPaymentsCount,
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
      const term = search.trim();
      const matchingOwners = await User.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { phone: { $regex: term, $options: 'i' } },
        ],
      }).select('_id');
      const ownerIds = matchingOwners.map((u) => u._id);

      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { industry: { $regex: term, $options: 'i' } },
        { ownerId: { $in: ownerIds } },
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

    const result = orgs.map((org) => {
      const o = org.toObject();
      const slug = o.slug || (o.name ? o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '') || String(o._id);
      return {
        ...o,
        slug,
        userCount: countMap[String(org._id)] || 0,
      };
    });

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
      trial:   { maxUsers: 3,   maxClients: 5,   storageLimitMb: 100,    modules: { crm: true, clients: true, projects: true, tasks: true } },
      free:    { maxUsers: 2,   maxClients: 3,   storageLimitMb: 100,    modules: { crm: true, clients: true, projects: true, tasks: true, reports: true } },
      starter: { maxUsers: 8,   maxClients: 15,  storageLimitMb: 5120,   modules: { crm: true, clients: true, projects: true, tasks: true, finance: true, hr: true, attendance: true, portal: true, proposals: true, reports: true } },
      growth:  { maxUsers: 25,  maxClients: 50,  storageLimitMb: 25600,  modules: { crm: true, clients: true, projects: true, tasks: true, finance: true, hr: true, attendance: true, smm: true, portal: true, sop: true, assets: true, proposals: true, reports: true, automations: true, influencers: true } },
      pro:     { maxUsers: 100, maxClients: 500, storageLimitMb: 102400, modules: { crm: true, clients: true, projects: true, tasks: true, finance: true, hr: true, attendance: true, smm: true, portal: true, sop: true, assets: true, proposals: true, reports: true, automations: true, influencers: true, ai: true } },
    };

    const defaults = planDefaults[plan] || planDefaults.free;
    const modules = enabledModules || defaults.modules;

    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      {
        planStatus: 'active',
        plan,
        maxUsers: maxUsers || defaults.maxUsers,
        maxClients: maxClients || defaults.maxClients,
        storageLimitMb: defaults.storageLimitMb,
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

// ─── Permanently Reject / Delete Organization & All Tenant Data ───────────────
// DELETE /api/platform/organizations/:id
export const rejectOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Collect non-superAdmin users belonging to this organization
    const orgUsers = await User.find({
      $or: [
        { organizationId: org._id },
        ...(org.ownerId ? [{ _id: org.ownerId }] : []),
      ],
      role: { $ne: 'superAdmin' },
    })
      .select('_id')
      .lean();
    const orgUserIds = orgUsers.map((u) => u._id);

    // Cascade delete across all registered Mongoose models referencing this org or its users
    const deletePromises = [];
    for (const model of Object.values(mongoose.models)) {
      const name = model.modelName;
      if (name === 'Organization' || name === 'User') continue;

      const schema = model.schema;
      const orClauses = [];
      if (schema.path('organizationId')) orClauses.push({ organizationId: org._id });
      if (schema.path('organization')) orClauses.push({ organization: org._id });
      if (orgUserIds.length > 0 && schema.path('user')) {
        orClauses.push({ user: { $in: orgUserIds } });
      }
      if (orgUserIds.length > 0 && schema.path('recipient')) {
        orClauses.push({ recipient: { $in: orgUserIds } });
      }
      if (orClauses.length > 0) {
        deletePromises.push(
          model.deleteMany(orClauses.length === 1 ? orClauses[0] : { $or: orClauses }).catch(() => null)
        );
      }
    }

    await Promise.all(deletePromises);

    if (orgUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: orgUserIds }, role: { $ne: 'superAdmin' } });
    }
    await Organization.findByIdAndDelete(org._id);

    res.json({
      success: true,
      message: `Organization "${org.name}" and all associated data permanently deleted`,
    });
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
    res.json({ success: true, organization: sanitizeOrganizationForRole(org, req.user?.role) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SaaS Payments & Failed Checkout Ledger (Super Admin Only) ────────────────
// GET /api/platform/payments
export const getPlatformPayments = async (req, res) => {
  try {
    const { status = 'all', search = '', page = 1, limit = 30 } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = String(status).trim().toLowerCase();
    }
    if (search && String(search).trim()) {
      const term = String(search).trim();
      filter.$or = [
        { payerName: { $regex: term, $options: 'i' } },
        { contactNumber: { $regex: term, $options: 'i' } },
        { payerEmail: { $regex: term, $options: 'i' } },
        { companyName: { $regex: term, $options: 'i' } },
        { planName: { $regex: term, $options: 'i' } },
        { razorpayOrderId: { $regex: term, $options: 'i' } },
        { razorpayPaymentId: { $regex: term, $options: 'i' } },
        { failureReason: { $regex: term, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [docs, total, aggRows] = await Promise.all([
      SaasPayment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('organizationId', 'name slug phone email')
        .populate('userId', 'name email phone')
        .lean(),
      SaasPayment.countDocuments(filter),
      SaasPayment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            amountInr: { $sum: '$amountInr' },
          },
        },
      ]),
    ]);

    const summary = {
      totalCount: 0,
      paidCount: 0,
      failedCount: 0,
      cancelledCount: 0,
      createdCount: 0,
      totalCollectedInr: 0,
    };

    aggRows.forEach((row) => {
      const count = Number(row.count || 0);
      summary.totalCount += count;
      if (row._id === 'paid') {
        summary.paidCount += count;
        summary.totalCollectedInr += Number(row.amountInr || 0);
      } else if (row._id === 'failed') {
        summary.failedCount += count;
      } else if (row._id === 'cancelled') {
        summary.cancelledCount += count;
      } else if (row._id === 'created') {
        summary.createdCount += count;
      }
    });

    const payments = docs.map((p) => ({
      ...p,
      payerName: p.payerName || p.userId?.name || p.organizationId?.name || 'Unknown User',
      payerEmail: p.payerEmail || p.userId?.email || p.organizationId?.email || '',
      contactNumber: p.contactNumber || p.userId?.phone || p.organizationId?.phone || '',
      companyName: p.companyName || p.organizationId?.name || '',
      companySlug: p.companySlug || p.organizationId?.slug || '',
    }));

    res.json({
      success: true,
      payments,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Live Ghost Context (Super Admin stealth view) ────────────────────────
// GET /api/platform/organizations/:id/ghost-context
export const getGhostContext = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('ownerId', 'name email phone');
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    const defaultWorkspace = await BrandWorkspace.findOne({ organizationId: org._id });

    res.json({
      success: true,
      organization: org,
      defaultWorkspace: defaultWorkspace ? defaultWorkspace._id : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

