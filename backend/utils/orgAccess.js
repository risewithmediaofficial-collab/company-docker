// Shared role helpers for controlling Company Details & GST visibility across APIs

export const COMPANY_GST_ALLOWED_ROLES = new Set([
  'superAdmin',
  'organizationOwner',
  'manager',
]);

export const canViewCompanyAndGst = (role) => COMPANY_GST_ALLOWED_ROLES.has(String(role || ''));

/**
 * Redacts sensitive Company & GST fields when the caller's role is not
 * superAdmin, organizationOwner, or manager.
 */
export const sanitizeOrganizationForRole = (orgDoc, role) => {
  if (!orgDoc) return null;
  const org = typeof orgDoc.toObject === 'function' ? orgDoc.toObject() : { ...orgDoc };
  if (canViewCompanyAndGst(role)) {
    return org;
  }

  // Strip company & GST details for non-privileged roles while preserving UI shell metadata
  delete org.gstNumber;
  delete org.address;
  delete org.phone;
  delete org.email;
  delete org.website;
  delete org.industry;
  delete org.services;
  delete org.lastOrderId;
  delete org.lastPaymentId;
  return org;
};
