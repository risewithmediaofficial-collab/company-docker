// =============================================
// AUTH MIDDLEWARE - JWT Verification + RBAC
// =============================================

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Protect routes - verifies JWT access token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+passwordChangedAt -password -refreshToken');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.passwordChangedAt && decoded.iat) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message: 'Password or security settings were recently changed. Please log in again.',
        });
      }
    }

    if (user.approvalStatus && user.approvalStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Account is not approved' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    req.user = user;

    // Stealth Ghost Mode: When superAdmin or admin views a tenant company CRM
    const ghostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'];
    if (ghostOrgId && (user.role === 'superAdmin' || user.role === 'admin')) {
      req.isGhostMode = true;
      req.ghostOrgId = ghostOrgId;
      req.user.organizationId = ghostOrgId;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * Role-based access control
 * Usage: authorize('superAdmin', 'manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Admin and superAdmin have universal access across the entire platform
    if (req.user && (req.user.role === 'superAdmin' || req.user.role === 'admin')) {
      return next();
    }
    let allowedRoles = [...roles];
    if (allowedRoles.includes('superAdmin') && !allowedRoles.includes('admin')) {
      allowedRoles.push('admin');
    }
    // Organization owners have full managerial access within their tenant workspace
    if ((allowedRoles.includes('manager') || allowedRoles.includes('admin')) && !allowedRoles.includes('organizationOwner')) {
      allowedRoles.push('organizationOwner');
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
/**
 * Granular permission check
 * Usage: requirePermission('canViewReports')
 */
export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    // SuperAdmins & Admins bypass permission checks
    if (req.user.role === 'superAdmin' || req.user.role === 'admin') return next();
    
    if (!req.user.permissions?.[permissionKey]) {
      return res.status(403).json({
        success: false,
        message: `Missing required permission: ${permissionKey}`,
      });
    }
    next();
  };
};

/**
 * Filter query builder based on workspace
 * Usage: const query = withWorkspaceScope(req, baseQuery)
 *
 * STRICT TENANT ISOLATION:
 * - Platform superAdmin (no org, no ghost mode) → sees ALL data globally
 * - superAdmin in ghost mode → sees only that tenant's org data (+ legacy null-org docs)
 * - Any user with organizationId → sees ONLY their exact organizationId (strict, no null fallback)
 * - User with no organizationId and not superAdmin → blocked (returns unmatchable filter)
 */
export const withWorkspaceScope = (req, baseQuery = {}) => {
  const user = req.user;
  if (!user) return baseQuery;

  const ghostOrgId =
    req.headers['x-impersonate-org-id'] ||
    req.headers['x-ghost-org-id'] ||
    (req.isGhostMode ? user.organizationId : null);

  // Ghost Mode (superAdmin viewing a specific tenant CRM stealthily)
  if (ghostOrgId && (user.role === 'superAdmin' || user.role === 'admin')) {
    const query = { ...baseQuery, organizationId: ghostOrgId };
    if (req.headers['x-workspace-id'] && req.headers['x-workspace-id'] !== 'global') {
      query.brandId = req.headers['x-workspace-id'];
    }
    return query;
  }

  // Platform superAdmin — global access (no org scoping)
  if (user.role === 'superAdmin' && !ghostOrgId && !user.organizationId) {
    if (req.headers['x-workspace-id'] && req.headers['x-workspace-id'] !== 'global') {
      return { ...baseQuery, brandId: req.headers['x-workspace-id'] };
    }
    return baseQuery;
  }

  // ───── STRICT TENANT ISOLATION ─────
  // All tenant users (organizationOwner, admin, manager, employee, client, etc.)
  // are STRICTLY limited to their own organizationId. No null/missing fallback.
  const targetOrgId = user.organizationId;
  if (!targetOrgId) {
    // Safety net: user has no org but isn't superAdmin — block all data
    return { ...baseQuery, organizationId: '__BLOCKED_NO_ORG__' };
  }

  const query = { ...baseQuery, organizationId: targetOrgId };

  // Workspace/brand scoping within tenant
  if (req.headers['x-workspace-id'] && req.headers['x-workspace-id'] !== 'global') {
    query.brandId = req.headers['x-workspace-id'];
    return query;
  }

  // Client-portal users: further restrict to their brand
  if (user.role === 'clientAdmin' || user.role === 'clientMember') {
    query.brandId = user.brandId;
  } else if (['editor', 'designer', 'adsManager'].includes(user.role)) {
    if (user.assignedBrands?.length > 0) {
      query.brandId = { $in: user.assignedBrands };
    }
  }

  return query;
};
/**
 * Optional auth - attaches user if token present, doesn't block if not
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    }
  } catch (_) {
    // silently ignore
  }
  next();
};
