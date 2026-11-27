// =============================================
// PLAN WRITE GATE MIDDLEWARE
// Allows users to browse, preview, and fill forms in all modules.
// Only blocks SAVE/WRITE operations (POST, PUT, PATCH) when the module
// is not included in the organization's current plan, returning
// code: 'PLAN_UPGRADE_REQUIRED' so the UI prompts an upgrade.
// =============================================

import Organization from '../models/organization.model.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH']);

const MODULE_ROUTE_RULES = [
  { prefix: '/api/finance', key: 'finance', name: 'Finance & Invoicing', requiredPlan: 'Growth (₹2,999/mo)' },
  { prefix: '/api/domain-renewals', key: 'finance', name: 'Domain Renewals', requiredPlan: 'Growth (₹2,999/mo)' },
  { prefix: '/api/hr', key: 'hr', name: 'HR, Hiring & Payroll', requiredPlan: 'Growth (₹2,999/mo)' },
  { prefix: '/api/attendance', key: 'attendance', name: 'Attendance & EOD', requiredPlan: 'Starter (₹10/mo)' },
  { prefix: '/api/wfh-requests', key: 'attendance', name: 'WFH Requests', requiredPlan: 'Starter (₹10/mo)' },
  { prefix: '/api/office-locations', key: 'attendance', name: 'Office Locations', requiredPlan: 'Starter (₹10/mo)' },
  { prefix: '/api/smm', key: 'smm', name: 'Social Media & Content Calendar', requiredPlan: 'Growth (₹2,999/mo)' },
  { prefix: '/api/proposals', key: 'proposals', name: 'Proposals & Estimates', requiredPlan: 'Starter (₹10/mo)' },
  { prefix: '/api/sop', key: 'sop', name: 'SOP Library', requiredPlan: 'Starter (₹10/mo)' },
  { prefix: '/api/influencers', key: 'influencers', name: 'Influencer Hub', requiredPlan: 'Growth (₹2,999/mo)' },
  { prefix: '/api/automations', key: 'automations', name: 'Automations', requiredPlan: 'Enterprise Pro (₹6,999/mo)' },
];

const orgPlanCache = new Map();
const ORG_PLAN_CACHE_TTL_MS = 10 * 1000;

export const clearOrgPlanCache = (orgId) => {
  if (orgId) orgPlanCache.delete(String(orgId));
  else orgPlanCache.clear();
};

const getOrgPlanInfo = async (orgId) => {
  const key = String(orgId);
  const cached = orgPlanCache.get(key);
  if (cached && Date.now() - cached.timestamp < ORG_PLAN_CACHE_TTL_MS) {
    return cached.org;
  }
  const org = await Organization.findById(orgId).select('plan enabledModules maxBranches').lean();
  if (org) {
    orgPlanCache.set(key, { org, timestamp: Date.now() });
    if (orgPlanCache.size > 500) {
      const oldest = orgPlanCache.keys().next().value;
      orgPlanCache.delete(oldest);
    }
  }
  return org;
};

export const checkPlanWriteAccess = async (req, res) => {
  try {
    if (!WRITE_METHODS.has(req.method)) return true;
    if (!req.user || req.user.role === 'superAdmin' || !req.user.organizationId) return true;

    const url = String(req.originalUrl || req.url || '').split('?')[0].toLowerCase();
    const rule = MODULE_ROUTE_RULES.find((r) => url === r.prefix || url.startsWith(`${r.prefix}/`));
    if (!rule) return true;

    const org = await getOrgPlanInfo(req.user.organizationId);
    if (!org || !org.enabledModules) return true;

    if (org.enabledModules[rule.key] === false) {
      res.status(403).json({
        success: false,
        code: 'PLAN_UPGRADE_REQUIRED',
        module: rule.key,
        moduleName: rule.name,
        requiredPlan: rule.requiredPlan,
        currentPlan: org.plan || 'free',
        message: `Upgrade to ${rule.requiredPlan} to save changes in ${rule.name}.`,
      });
      return false;
    }
    return true;
  } catch (err) {
    // Fail open on transient lookup error so core flows are never disrupted
    console.warn('[PlanWriteGate Warning]:', err.message);
    return true;
  }
};
