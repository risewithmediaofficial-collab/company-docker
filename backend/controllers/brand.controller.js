import BrandWorkspace from '../models/brandWorkspace.model.js';

export const getAssignedBrands = async (req, res) => {
  try {
    const brands = await BrandWorkspace.find({ _id: { $in: req.user.assignedBrands || [] } })
      .select('name industry logo status');
    res.json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    const ghostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'] || (req.isGhostMode ? req.user.organizationId : null);
    const query = ghostOrgId
      ? { organizationId: ghostOrgId }
      : req.user.role === 'superAdmin'
      ? {}
      : { organizationId: req.user.organizationId };
      
    const brands = await BrandWorkspace.find(query).select('name industry logo status');
    res.json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
