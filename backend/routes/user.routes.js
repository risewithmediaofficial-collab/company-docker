import express from 'express';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { createActivityLog } from '../utils/activity.js';

const router = express.Router();
router.use(protect);

const safeUserProjection = '-password -refreshToken -resetPasswordToken -resetPasswordExpire';
const mapEmploymentStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  return {
    active: 'active',
    inactive: 'inactive',
    'on leave': 'on_leave',
    on_leave: 'on_leave',
    terminated: 'terminated',
  }[normalized] || undefined;
};

router.get('/', authorize('superAdmin', 'organizationOwner', 'admin', 'manager'), async (req, res) => {
  try {
    const filter = {};
    const ghostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'] || (req.isGhostMode ? req.user.organizationId : null);
    const targetOrgId = ghostOrgId || (req.user.role !== 'superAdmin' ? req.user.organizationId : null);
    if (targetOrgId) {
      filter.organizationId = targetOrgId;
      // Never show platform superAdmins in a tenant company's user list
      filter.role = { $ne: 'superAdmin' };
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter)
      .select(safeUserProjection)
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authorize('superAdmin', 'admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(safeUserProjection);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authorize('superAdmin', 'organizationOwner', 'admin'), async (req, res) => {
  try {
    const isPlatformAdmin = req.user.role === 'superAdmin' && !req.isGhostMode;
    let targetOrgId = req.user.organizationId;

    if (isPlatformAdmin) {
      targetOrgId = req.body.organizationId || null;
    } else {
      if (!targetOrgId) {
        return res.status(400).json({ success: false, message: 'You must belong to a company to create users' });
      }

      // Check maxUsers plan limit for this company
      const org = await Organization.findById(targetOrgId);
      if (org) {
        const currentUserCount = await User.countDocuments({ organizationId: targetOrgId });
        if (currentUserCount >= (org.maxUsers || 3)) {
          return res.status(403).json({
            success: false,
            message: `User limit reached for your plan (${org.maxUsers || 3} users). Upgrade your plan to add more team members.`,
          });
        }
      }

      // Tenant admins/owners cannot create a platform superAdmin or organizationOwner
      const requestedRole = req.body.role || 'employee';
      if (['superAdmin', 'organizationOwner'].includes(requestedRole)) {
        return res.status(403).json({
          success: false,
          message: 'Cannot create superAdmin or organizationOwner roles within a company workspace',
        });
      }
    }

    const employmentStatus = mapEmploymentStatus(req.body.employmentStatus || req.body.status) || 'active';
    const user = await User.create({
      ...req.body,
      organizationId: targetOrgId,
      employmentStatus,
      approvalStatus: req.body.approvalStatus || 'approved',
      isActive: req.body.isActive ?? employmentStatus === 'active',
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    await createActivityLog({
      actor: req.user,
      action: 'user.created',
      entityType: 'user',
      entityId: user._id,
      title: 'User created',
      description: `${user.name} was created as ${user.role}.`,
      relatedUser: user._id,
    });

    const sanitized = await User.findById(user._id).select(safeUserProjection);
    res.status(201).json({ success: true, user: sanitized });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', authorize('superAdmin', 'organizationOwner', 'admin'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const isPlatformAdmin = req.user.role === 'superAdmin' && !req.isGhostMode;
    if (!isPlatformAdmin) {
      if (!req.user.organizationId || !targetUser.organizationId || targetUser.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: user belongs to another organization' });
      }

      if (req.user.role !== 'organizationOwner' && targetUser.role === 'organizationOwner') {
        return res.status(403).json({ success: false, message: 'Cannot modify the Organization Owner account' });
      }

      if (req.body.role && ['superAdmin', 'organizationOwner'].includes(req.body.role)) {
        return res.status(403).json({ success: false, message: 'Cannot assign superAdmin or organizationOwner roles' });
      }
    }

    const allowedFields = [
      'name',
      'email',
      'role',
      'phone',
      'department',
      'position',
      'salary',
      'joinDate',
      'notes',
      'manager',
      'isActive',
      'permissions',
      'assignedBrands',
      'approvalStatus',
      'employmentStatus',
    ];

    const updates = allowedFields.reduce((payload, field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) payload[field] = req.body[field];
      return payload;
    }, {});

    const derivedEmploymentStatus = mapEmploymentStatus(req.body.status || req.body.employmentStatus);
    if (derivedEmploymentStatus) {
      updates.employmentStatus = derivedEmploymentStatus;
      updates.isActive = derivedEmploymentStatus === 'active';
    }

    const unset = {};

    if (updates.approvalStatus === 'approved') {
      updates.isActive = true;
      updates.approvedBy = req.user._id;
      updates.approvedAt = new Date();
      unset.rejectedAt = '';
    }

    if (updates.approvalStatus === 'rejected') {
      updates.isActive = false;
      updates.rejectedAt = new Date();
    }

    if (updates.approvalStatus === 'pending') {
      updates.isActive = false;
      unset.approvedBy = '';
      unset.approvedAt = '';
      unset.rejectedAt = '';
    }

    const updateDoc = Object.keys(unset).length ? { $set: updates, $unset: unset } : { $set: updates };
    const user = await User.findByIdAndUpdate(req.params.id, updateDoc, { new: true, runValidators: true }).select(safeUserProjection);

    // Invalidate session & force logout target user alone if permissions, role, or account deactivation occurred
    const shouldInvalidateSession =
      updates.permissions !== undefined ||
      updates.role !== undefined ||
      updates.isActive === false ||
      updates.approvalStatus === 'rejected' ||
      updates.employmentStatus === 'terminated';

    if (shouldInvalidateSession && user) {
      await User.findByIdAndUpdate(req.params.id, {
        passwordChangedAt: new Date(),
        refreshToken: null,
      });

      const io = req.app?.get('io') || global.io;
      if (io) {
        const isSelf = String(req.user._id) === String(user._id);
        const reason = updates.isActive === false || updates.approvalStatus === 'rejected' || updates.employmentStatus === 'terminated'
          ? 'account_deactivated'
          : 'permissions_updated';
        const msg = reason === 'account_deactivated'
          ? 'Your account has been deactivated. Please contact an administrator.'
          : (isSelf
              ? 'Your permissions or role were updated. Please log in again.'
              : 'Your permissions or role were updated by an administrator. Please log in again.');

        if (typeof io.sendToUser === 'function') {
          io.sendToUser(user._id.toString(), 'forceLogout', { reason, message: msg });
        } else if (io.to) {
          io.to(`user:${user._id.toString()}`).emit('forceLogout', { reason, message: msg });
        }
      }
    }

    await createActivityLog({
      actor: req.user,
      action: 'user.updated',
      entityType: 'user',
      entityId: user._id,
      title: 'User updated',
      description: `${user.name} was updated.`,
      relatedUser: user._id,
      metadata: { fields: Object.keys(updates) },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id/password', authorize('superAdmin', 'organizationOwner', 'admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const targetUser = await User.findById(req.params.id).select('+password +refreshToken');
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const isPlatformAdmin = req.user.role === 'superAdmin' && !req.isGhostMode;
    if (!isPlatformAdmin) {
      if (!req.user.organizationId || !targetUser.organizationId || targetUser.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: user belongs to another organization' });
      }
      if (req.user.role !== 'organizationOwner' && targetUser.role === 'organizationOwner') {
        return res.status(403).json({ success: false, message: 'Cannot reset password of the Organization Owner' });
      }
    }

    targetUser.password = newPassword;
    targetUser.passwordChangedAt = new Date();
    targetUser.refreshToken = null;
    await targetUser.save();

    const io = req.app?.get('io') || global.io;
    if (io) {
      const isSelf = String(req.user._id) === String(targetUser._id);
      const msg = isSelf
        ? 'Your password was changed. Please log in again with your new password.'
        : 'Your password was changed by an administrator. Please log in with your new password.';

      if (typeof io.sendToUser === 'function') {
        io.sendToUser(targetUser._id.toString(), 'forceLogout', { reason: 'password_changed', message: msg });
      } else if (io.to) {
        io.to(`user:${targetUser._id.toString()}`).emit('forceLogout', { reason: 'password_changed', message: msg });
      }
    }

    await createActivityLog({
      actor: req.user,
      action: 'user.password.updated',
      entityType: 'user',
      entityId: targetUser._id,
      title: 'User password changed',
      description: `${targetUser.name}'s password was changed by an admin.`,
      relatedUser: targetUser._id,
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/approval', authorize('superAdmin', 'organizationOwner', 'admin'), async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const isPlatformAdmin = req.user.role === 'superAdmin' && !req.isGhostMode;
    if (!isPlatformAdmin) {
      if (!req.user.organizationId || !targetUser.organizationId || targetUser.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: user belongs to another organization' });
      }
      if (targetUser.role === 'organizationOwner') {
        return res.status(403).json({ success: false, message: 'Cannot modify Organization Owner approval status' });
      }
    }

    const set = { approvalStatus };
    const unset = {};
    if (approvalStatus === 'approved') {
      set.isActive = true;
      set.approvedBy = req.user._id;
      set.approvedAt = new Date();
      unset.rejectedAt = '';
    }
    if (approvalStatus === 'rejected') {
      set.isActive = false;
      set.rejectedAt = new Date();
    }
    if (approvalStatus === 'pending') {
      set.isActive = false;
      unset.approvedBy = '';
      unset.approvedAt = '';
      unset.rejectedAt = '';
    }

    const updateDoc = Object.keys(unset).length ? { $set: set, $unset: unset } : { $set: set };
    const user = await User.findByIdAndUpdate(req.params.id, updateDoc, { new: true, runValidators: true }).select(safeUserProjection);

    if (approvalStatus === 'rejected' || approvalStatus === 'pending') {
      await User.findByIdAndUpdate(req.params.id, {
        passwordChangedAt: new Date(),
        refreshToken: null,
      });

      const io = req.app?.get('io') || global.io;
      if (io) {
        const msg = 'Your account status was updated. Please contact an administrator.';
        if (typeof io.sendToUser === 'function') {
          io.sendToUser(user._id.toString(), 'forceLogout', { reason: 'approval_changed', message: msg });
        } else if (io.to) {
          io.to(`user:${user._id.toString()}`).emit('forceLogout', { reason: 'approval_changed', message: msg });
        }
      }
    }

    await createActivityLog({
      actor: req.user,
      action: 'user.approval.updated',
      entityType: 'user',
      entityId: user._id,
      title: 'User approval updated',
      description: `${user.name} approval status changed to ${approvalStatus}.`,
      relatedUser: user._id,
      metadata: { approvalStatus },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authorize('superAdmin', 'organizationOwner', 'admin'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (String(req.user._id) === String(targetUser._id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const isPlatformAdmin = req.user.role === 'superAdmin' && !req.isGhostMode;
    if (!isPlatformAdmin) {
      if (!req.user.organizationId || !targetUser.organizationId || targetUser.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: user belongs to another organization' });
      }
      if (targetUser.role === 'organizationOwner') {
        return res.status(403).json({ success: false, message: 'Cannot delete the Organization Owner' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    await createActivityLog({
      actor: req.user,
      action: 'user.deleted',
      entityType: 'user',
      entityId: targetUser._id,
      title: 'User deleted',
      description: `${targetUser.name} was deleted.`,
      relatedUser: targetUser._id,
    });

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
