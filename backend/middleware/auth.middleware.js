// =============================================
// AUTH MIDDLEWARE - JWT Verification + RBAC
// =============================================

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { checkPlanWriteAccess } from './planGate.middleware.js';

const BLOCKED_QUERY_ID = new mongoose.Types.ObjectId('000000000000000000000000');

// Short-lived in-memory cache for authenticated user lookups (TTL: 20s, max 500 entries)
// Eliminates repetitive User.findById queries across parallel API calls on the same view
const userAuthCache = new Map();
const AUTH_CACHE_TTL_MS = 20 * 1000;

export const clearAuthUserCache = (userId) => {
  if (userId) {
    userAuthCache.delete(String(userId));
  } else {
    userAuthCache.clear();
  }
};

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-super-secret-jwt-key');
    if (decoded.tokenType && decoded.tokenType !== 'access') {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token type' });
    }

    const cacheKey = String(decoded.id);
    const cached = userAuthCache.get(cacheKey);
    let user = null;

    if (cached && (Date.now() - cached.timestamp < AUTH_CACHE_TTL_MS)) {
      user = cached.user;
    } else {
      user = await User.findById(decoded.id)
        .select('+passwordChangedAt -password -refreshToken')
        .lean();
      if (user) {
        userAuthCache.set(cacheKey, { user, timestamp: Date.now() });
        if (userAuthCache.size > 500) {
          const oldestKey = userAuthCache.keys().next().value;
          userAuthCache.delete(oldestKey);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.passwordChangedAt && decoded.iat) {
      const changedTime = new Date(user.passwordChangedAt).getTime();
      if (!isNaN(changedTime)) {
        const changedTimestamp = Math.floor(changedTime / 1000);
        if (decoded.iat < changedTimestamp) {
          return res.status(401).json({
            success: false,
            message: 'Password or security settings were recently changed. Please log in again.',
          });
        }
      }
    }

    if (user.approvalStatus && user.approvalStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Account is not approved' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Clone user object before attaching request-scoped overrides so Ghost Mode never mutates userAuthCache
    req.user = { ...user };

    // Stealth Ghost Mode: When superAdmin or admin views a tenant company CRM
    const rawGhostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'];
    const ghostOrgId = (rawGhostOrgId && rawGhostOrgId !== 'undefined' && rawGhostOrgId !== 'null' && rawGhostOrgId !== 'global')
      ? String(rawGhostOrgId).trim()
      : null;
    if (ghostOrgId && (req.user.role === 'superAdmin' || req.user.role === 'admin') && mongoose.Types.ObjectId.isValid(ghostOrgId)) {
      req.isGhostMode = true;
      req.ghostOrgId = ghostOrgId;
      req.user.organizationId = ghostOrgId;
    }

    const canWrite = await checkPlanWriteAccess(req, res);
    if (!canWrite) return;

    next();
  } catch (error) {
    console.error('Auth protect error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * Role-based access control
 * Usage: authorize('superAdmin', 'manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Admin, superAdmin, and organizationOwner have universal access across the entire platform
    if (req.user && (req.user.role === 'superAdmin' || req.user.role === 'admin' || req.user.role === 'organizationOwner')) {
      return next();
    }
    let allowedRoles = [...roles];
    if (allowedRoles.includes('superAdmin') && !allowedRoles.includes('admin')) {
      allowedRoles.push('admin');
    }
    // Organization owners have full managerial/administrative access within their tenant workspace
    if ((allowedRoles.includes('manager') || allowedRoles.includes('admin') || allowedRoles.includes('superAdmin')) && !allowedRoles.includes('organizationOwner')) {
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
    // SuperAdmins, Admins & OrganizationOwners bypass permission checks
    if (req.user?.role === 'superAdmin' || req.user?.role === 'admin' || req.user?.role === 'organizationOwner') return next();
    
    if (!req.user.permissions?.[permissionKey]) {
      return res.status(403).json({
        success: false,
        message: `Missing required permission: ${permissionKey}`,
      });
    }
    next();
  };
};

export const getStrictTenantOrgId = (req) => {
  const user = req?.user;
  if (!user) return BLOCKED_QUERY_ID;
  const ghostOrgId =
    req.headers?.['x-impersonate-org-id'] ||
    req.headers?.['x-ghost-org-id'] ||
    (req.isGhostMode ? user.organizationId : null);
  if (ghostOrgId && (user.role === 'superAdmin' || user.role === 'admin')) {
    return ghostOrgId;
  }
  if (user.role === 'superAdmin' || (user.role === 'admin' && !user.organizationId)) {
    return null;
  }
  return user.organizationId || BLOCKED_QUERY_ID;
};

/**
 * Filter query builder based on workspace
 * Hardened to fail closed and validate membership against x-workspace-id headers
 * Usage: const query = withWorkspaceScope(req, baseQuery)
 *
 * STRICT TENANT ISOLATION:
 * - Platform superAdmin (no org, no ghost mode) → sees ALL data globally
 * - superAdmin in ghost mode → sees only that tenant's org data (+ legacy null-org docs)
 * - Any user with organizationId → sees ONLY their exact organizationId (strict, no null fallback)
 * - User with no organizationId and not superAdmin → blocked (returns unmatchable filter)
 */
export const withWorkspaceScope = (req, baseQuery = {}) => {
  const user = req?.user;
  // Fail closed safely if user is missing
  if (!user) {
    return { ...baseQuery, _id: BLOCKED_QUERY_ID };
  }

  const ghostOrgId =
    req.headers?.['x-impersonate-org-id'] ||
    req.headers?.['x-ghost-org-id'] ||
    (req.isGhostMode ? user.organizationId : null);

  let query = { ...baseQuery };

  // Ghost Mode (superAdmin or admin viewing a specific tenant CRM stealthily)
  if (ghostOrgId && (user.role === 'superAdmin' || user.role === 'admin')) {
    query.organizationId = ghostOrgId;
  } else if (user.role === 'superAdmin' || (user.role === 'admin' && !user.organizationId)) {
    // Platform superAdmin (or system admin without organizationId) — global access across all tenants & legacy data
  } else if (user.organizationId) {
    // STRICT tenant isolation: match ONLY this user's exact organizationId (never unscoped/null docs)
    query.organizationId = user.organizationId;
  } else if (['client', 'clientAdmin', 'clientMember', 'vendor'].includes(user.role)) {
    // Client-side / vendor user without orgId: downstream query enforces strict clientId / user-id scoping
  } else {
    // Safety net: user with no organization assigned - fail closed safely without CastError
    return { ...baseQuery, _id: BLOCKED_QUERY_ID };
  }

  const requestedWorkspace = req.headers?.['x-workspace-id'];

  // 1. SuperAdmin, Admin & OrganizationOwner: Universal visibility within their org, with optional workspace filter
  if (user.role === 'superAdmin' || user.role === 'admin' || user.role === 'organizationOwner') {
    if (requestedWorkspace && requestedWorkspace !== 'global') {
      query.brandId = requestedWorkspace;
    }
    return query;
  }

  // 2. Client-side users: Strictly restricted to their own brand/client.
  // Must NOT allow arbitrary x-workspace-id to access other brands.
  if (['client', 'clientAdmin', 'clientMember'].includes(user.role)) {
    if (user.brandId) {
      if (requestedWorkspace && requestedWorkspace !== 'global' && String(requestedWorkspace) !== String(user.brandId)) {
        return { ...query, brandId: null, _id: BLOCKED_QUERY_ID };
      }
      query.brandId = user.brandId;
    } else if (user.clientId) {
      query.client = user.clientId;
    } else {
      // Client has neither brandId nor clientId: fail closed safely
      return { ...query, _id: BLOCKED_QUERY_ID };
    }
    return query;
  }

  // 3. Agency specialists (editor, designer, adsManager):
  // Must be restricted to assignedBrands. Empty assignedBrands MUST FAIL CLOSED ({ $in: [] }).
  if (['editor', 'designer', 'adsManager'].includes(user.role)) {
    const assigned = Array.isArray(user.assignedBrands) ? user.assignedBrands : [];
    if (assigned.length === 0) {
      return { ...query, brandId: { $in: [] }, _id: BLOCKED_QUERY_ID };
    }

    if (requestedWorkspace && requestedWorkspace !== 'global') {
      const isAuthorized = assigned.map(String).includes(String(requestedWorkspace));
      if (!isAuthorized) {
        return { ...query, brandId: null, _id: BLOCKED_QUERY_ID };
      }
      query.brandId = requestedWorkspace;
      return query;
    }

    query.brandId = { $in: assigned };
    return query;
  }

  // 4. Employees & Managers:
  // If assignedBrands is defined and non-empty, scope to it.
  if (Array.isArray(user.assignedBrands) && user.assignedBrands.length > 0) {
    if (requestedWorkspace && requestedWorkspace !== 'global') {
      const isAuthorized = user.assignedBrands.map(String).includes(String(requestedWorkspace));
      if (!isAuthorized) {
        return { ...query, brandId: null, _id: BLOCKED_QUERY_ID };
      }
      query.brandId = requestedWorkspace;
    } else {
      query.brandId = { $in: user.assignedBrands };
    }
    return query;
  }


  // General employee with no specific brand restriction:
  if (requestedWorkspace && requestedWorkspace !== 'global') {
    query.brandId = requestedWorkspace;
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
