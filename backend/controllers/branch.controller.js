// =============================================
// BRANCH CONTROLLER — Multi-Tenant Company Branches
// =============================================

import Branch from '../models/branch.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import OfficeLocation from '../models/officeLocation.model.js';

/**
 * Resolve effective target organization ID based on user role and headers
 */
const resolveOrganizationId = (req, explicitOrgId = null) => {
  if (explicitOrgId) return explicitOrgId;
  const ghostOrgId = req.headers?.['rwm-ghost-org-id'] || req.headers?.['x-ghost-org-id'];
  if (ghostOrgId && ['superAdmin', 'admin'].includes(req.user.role)) {
    return ghostOrgId;
  }
  if (req.user.role === 'superAdmin' && req.query.organizationId) {
    return req.query.organizationId;
  }
  return req.user.organizationId;
};

/**
 * Sync coordinates to OfficeLocation for attendance geofencing
 */
const syncOfficeLocation = async (branch) => {
  if (branch.latitude != null && branch.longitude != null) {
    try {
      const existing = await OfficeLocation.findOne({
        name: branch.name,
        organization: branch.organization,
      });

      if (existing) {
        existing.latitude = branch.latitude;
        existing.longitude = branch.longitude;
        existing.radiusKm = branch.radiusKm || 0.5;
        existing.address = branch.address || existing.address;
        existing.city = branch.city || existing.city;
        existing.country = branch.country || existing.country;
        existing.isActive = branch.isActive;
        await existing.save();
      } else {
        await OfficeLocation.create({
          name: branch.name,
          latitude: branch.latitude,
          longitude: branch.longitude,
          radiusKm: branch.radiusKm || 0.5,
          address: branch.address || '',
          city: branch.city || '',
          country: branch.country || 'India',
          organization: branch.organization,
          isActive: branch.isActive,
        });
      }
    } catch (err) {
      console.warn('[Branch OfficeLocation Sync Warning]:', err.message);
    }
  }
};

/**
 * Get branches for a company / organization
 * GET /api/branches or GET /api/platform/organizations/:id/branches
 */
export const getBranches = async (req, res) => {
  try {
    const targetOrgId = resolveOrganizationId(req, req.params.organizationId || req.params.id);

    const filter = {};
    if (targetOrgId) {
      filter.organization = targetOrgId;
    } else if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Organization required' });
    }

    if (req.query.isActive !== undefined && req.query.isActive !== 'all') {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const term = req.query.search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } },
        { code: { $regex: term, $options: 'i' } },
        { managerName: { $regex: term, $options: 'i' } },
      ];
    }

    const branches = await Branch.find(filter)
      .sort({ isHeadquarters: -1, createdAt: -1 })
      .populate('organization', 'name slug logo')
      .populate('createdBy', 'name email');

    // Aggregate employee count per branch
    const branchIds = branches.map((b) => b._id);
    const userCounts = await User.aggregate([
      { $match: { branchId: { $in: branchIds } } },
      { $group: { _id: '$branchId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    userCounts.forEach(({ _id, count }) => {
      countMap[String(_id)] = count;
    });

    const enriched = branches.map((b) => ({
      ...b.toObject(),
      employeeCount: countMap[String(b._id)] || 0,
    }));

    res.json({
      success: true,
      count: enriched.length,
      branches: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single branch by ID
 * GET /api/branches/:id
 */
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('organization', 'name slug logo phone email address')
      .populate('createdBy', 'name email');

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    // Tenant authorization check
    if (
      req.user.role !== 'superAdmin' &&
      String(branch.organization._id || branch.organization) !== String(req.user.organizationId)
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this branch' });
    }

    // Get assigned employees
    const employees = await User.find({ branchId: branch._id })
      .select('name email phone role position department avatar isActive')
      .sort({ name: 1 });

    res.json({
      success: true,
      branch: {
        ...branch.toObject(),
        employees,
        employeeCount: employees.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new branch
 * POST /api/branches or POST /api/platform/organizations/:id/branches
 */
export const createBranch = async (req, res) => {
  try {
    const targetOrgId = resolveOrganizationId(req, req.params.organizationId || req.params.id || req.body.organizationId);

    if (!targetOrgId) {
      return res.status(400).json({ success: false, message: 'Company organization is required to create a branch' });
    }

    // Permission check
    const isPlatformAdmin = req.user.role === 'superAdmin';
    const isCompanyAdmin =
      ['organizationOwner', 'admin'].includes(req.user.role) &&
      String(targetOrgId) === String(req.user.organizationId);

    if (!isPlatformAdmin && !isCompanyAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to create branches for this company' });
    }

    const {
      name,
      code,
      isHeadquarters,
      managerName,
      managerEmail,
      managerPhone,
      phone,
      email,
      address,
      city,
      state,
      country,
      postalCode,
      operatingHours,
      workingDays,
      latitude,
      longitude,
      radiusKm,
      isActive,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Branch name is required' });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    // If marked as HQ, demote other branches in this company
    if (isHeadquarters) {
      await Branch.updateMany(
        { organization: targetOrgId, isHeadquarters: true },
        { isHeadquarters: false }
      );
    }

    const branch = await Branch.create({
      organization: targetOrgId,
      name: name.trim(),
      code: (code || '').trim().toUpperCase(),
      isHeadquarters: !!isHeadquarters,
      managerName: (managerName || '').trim(),
      managerEmail: (managerEmail || '').trim(),
      managerPhone: (managerPhone || '').trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      address: (address || '').trim(),
      city: city.trim(),
      state: (state || '').trim(),
      country: (country || 'India').trim(),
      postalCode: (postalCode || '').trim(),
      operatingHours: (operatingHours || '9:30 AM - 6:30 PM').trim(),
      workingDays: (workingDays || 'Monday - Saturday').trim(),
      latitude: latitude !== undefined && latitude !== '' && !isNaN(Number(latitude)) ? Number(latitude) : null,
      longitude: longitude !== undefined && longitude !== '' && !isNaN(Number(longitude)) ? Number(longitude) : null,
      radiusKm: radiusKm && !isNaN(Number(radiusKm)) ? Number(radiusKm) : 0.5,
      isActive: isActive !== undefined ? !!isActive : true,
      notes: (notes || '').trim(),
      createdBy: req.user._id,
    });

    // Auto-sync coordinates to OfficeLocation if set
    await syncOfficeLocation(branch);

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      branch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing branch
 * PUT /api/branches/:id or PUT /api/platform/organizations/:id/branches/:branchId
 */
export const updateBranch = async (req, res) => {
  try {
    const branchId = req.params.branchId || req.params.id;
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    // Permission check
    const isPlatformAdmin = req.user.role === 'superAdmin';
    const isCompanyAdmin =
      ['organizationOwner', 'admin'].includes(req.user.role) &&
      String(branch.organization) === String(req.user.organizationId);

    if (!isPlatformAdmin && !isCompanyAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this branch' });
    }

    const {
      name,
      code,
      isHeadquarters,
      managerName,
      managerEmail,
      managerPhone,
      phone,
      email,
      address,
      city,
      state,
      country,
      postalCode,
      operatingHours,
      workingDays,
      latitude,
      longitude,
      radiusKm,
      isActive,
      notes,
    } = req.body;

    if (name !== undefined) branch.name = name.trim();
    if (code !== undefined) branch.code = code.trim().toUpperCase();
    if (managerName !== undefined) branch.managerName = managerName.trim();
    if (managerEmail !== undefined) branch.managerEmail = managerEmail.trim();
    if (managerPhone !== undefined) branch.managerPhone = managerPhone.trim();
    if (phone !== undefined) branch.phone = phone.trim();
    if (email !== undefined) branch.email = email.trim();
    if (address !== undefined) branch.address = address.trim();
    if (city !== undefined) branch.city = city.trim();
    if (state !== undefined) branch.state = state.trim();
    if (country !== undefined) branch.country = country.trim();
    if (postalCode !== undefined) branch.postalCode = postalCode.trim();
    if (operatingHours !== undefined) branch.operatingHours = operatingHours.trim();
    if (workingDays !== undefined) branch.workingDays = workingDays.trim();
    if (notes !== undefined) branch.notes = notes.trim();
    if (isActive !== undefined) branch.isActive = !!isActive;

    if (latitude !== undefined) {
      branch.latitude = latitude !== '' && !isNaN(Number(latitude)) ? Number(latitude) : null;
    }
    if (longitude !== undefined) {
      branch.longitude = longitude !== '' && !isNaN(Number(longitude)) ? Number(longitude) : null;
    }
    if (radiusKm !== undefined && !isNaN(Number(radiusKm))) {
      branch.radiusKm = Number(radiusKm);
    }

    if (isHeadquarters !== undefined) {
      const willBeHQ = !!isHeadquarters;
      if (willBeHQ && !branch.isHeadquarters) {
        // Demote previous HQ in this company
        await Branch.updateMany(
          { organization: branch.organization, _id: { $ne: branch._id }, isHeadquarters: true },
          { isHeadquarters: false }
        );
      }
      branch.isHeadquarters = willBeHQ;
    }

    await branch.save();

    // Auto-sync coordinates to OfficeLocation if set
    await syncOfficeLocation(branch);

    res.json({
      success: true,
      message: 'Branch updated successfully',
      branch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a branch
 * DELETE /api/branches/:id or DELETE /api/platform/organizations/:id/branches/:branchId
 */
export const deleteBranch = async (req, res) => {
  try {
    const branchId = req.params.branchId || req.params.id;
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    // Permission check
    const isPlatformAdmin = req.user.role === 'superAdmin';
    const isCompanyAdmin =
      ['organizationOwner', 'admin'].includes(req.user.role) &&
      String(branch.organization) === String(req.user.organizationId);

    if (!isPlatformAdmin && !isCompanyAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this branch' });
    }

    // Unassign users from this branch
    await User.updateMany({ branchId: branch._id }, { $set: { branchId: null, branch: '' } });

    await Branch.findByIdAndDelete(branch._id);

    res.json({
      success: true,
      message: 'Branch deleted successfully and unassigned from employees',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
