// =============================================
// TENANT MIDDLEWARE — Multi-Tenant SaaS
// =============================================
// Attaches req.orgId for data isolation.
// Checks org planStatus so suspended/expired orgs cannot use APIs.
// =============================================

import Organization from '../models/organization.model.js';

/**
 * Attach req.orgId from the logged-in user's organizationId.
 * superAdmin (platform owner) bypasses org scope check.
 */
export const tenantScope = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    // Platform super admin → no org restriction
    if (user.role === 'superAdmin') {
      req.orgId = user.organizationId || null;
      return next();
    }

    if (!user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not linked to any organization. Contact support.',
      });
    }

    const org = await Organization.findById(user.organizationId);
    if (!org || !org.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Organization not found or deactivated.',
      });
    }

    if (org.planStatus === 'pending') {
      return res.status(403).json({
        success: false,
        code: 'ORG_PENDING',
        message: 'Your organization is awaiting approval by the platform admin.',
      });
    }

    if (org.planStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        code: 'ORG_SUSPENDED',
        message: `Your organization has been suspended. Reason: ${org.suspendReason || 'Contact support.'}`,
      });
    }

    if (org.planStatus === 'expired') {
      return res.status(403).json({
        success: false,
        code: 'ORG_EXPIRED',
        message: 'Your trial or plan has expired. Please contact the platform admin to renew.',
      });
    }

    req.orgId = user.organizationId;
    req.organization = org;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check if a specific module is enabled for this organization.
 * Usage: requireModule('finance')
 */
export const requireModule = (moduleName) => {
  return (req, res, next) => {
    // Platform superAdmin always has access
    if (req.user?.role === 'superAdmin') return next();

    const org = req.organization;
    if (!org) {
      return res.status(403).json({ success: false, message: 'Organization context not found.' });
    }

    if (!org.enabledModules?.[moduleName]) {
      return res.status(403).json({
        success: false,
        code: 'MODULE_DISABLED',
        module: moduleName,
        message: `The "${moduleName}" module is not enabled for your plan. Contact the platform admin to enable it.`,
      });
    }
    next();
  };
};
