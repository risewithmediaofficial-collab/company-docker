import Settings from '../models/settings.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';

const editableProfileFields = ['name', 'phone', 'department', 'position', 'avatar'];
const safeUserProjection = '-password -refreshToken -resetPasswordToken -resetPasswordExpire';

const getOrCreateSettings = async (userId) => {
  let settings = await Settings.findOne({ user: userId });
  if (!settings) settings = await Settings.create({ user: userId });
  return settings;
};

export const updateCompanySettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings(req.user._id);
    const updates = req.body || {};

    if (updates.name !== undefined && !String(updates.name || '').trim()) {
      return res.status(400).json({ success: false, message: 'Company Name is required' });
    }

    settings.companyProfile = {
      ...(settings.companyProfile?.toObject ? settings.companyProfile.toObject() : settings.companyProfile || {}),
      ...updates,
    };
    await settings.save();

    let organization = null;
    if (
      req.user?.organizationId &&
      ['organizationOwner', 'superAdmin', 'admin'].includes(req.user.role)
    ) {
      const org = await Organization.findById(req.user.organizationId);
      if (org) {
        if (updates.name) org.name = String(updates.name).trim();
        if (updates.slug) {
          const cleanSlug = String(updates.slug)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          if (cleanSlug) {
            const clash = await Organization.findOne({ slug: cleanSlug, _id: { $ne: org._id } }).select('_id').lean();
            org.slug = clash ? `${cleanSlug}-${org._id.toString().slice(-4)}` : cleanSlug;
          }
        } else if (updates.name && org.companySetupRequired) {
          const derivedSlug = String(updates.name)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          if (derivedSlug) {
            const clash = await Organization.findOne({ slug: derivedSlug, _id: { $ne: org._id } }).select('_id').lean();
            org.slug = clash ? `${derivedSlug}-${org._id.toString().slice(-4)}` : derivedSlug;
          }
        }
        if (updates.industry !== undefined) org.industry = String(updates.industry || '').trim();
        if (updates.website !== undefined) org.website = String(updates.website || '').trim();
        if (updates.email !== undefined) org.email = String(updates.email || '').trim();
        if (updates.phone !== undefined) org.phone = String(updates.phone || '').trim();
        if (updates.address !== undefined) org.address = String(updates.address || '').trim();
        if (updates.gstNumber !== undefined) org.gstNumber = String(updates.gstNumber || '').trim();
        if (updates.services !== undefined) org.services = String(updates.services || '').trim();
        if (updates.logoUrl !== undefined) org.logo = String(updates.logoUrl || '').trim();
        if (org.name && org.name.trim()) {
          org.companySetupRequired = false;
        }
        await org.save();
        organization = org;
      }
    }

    res.json({ success: true, settings, organization });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings(req.user._id);
    const user = await User.findById(req.user._id).select(safeUserProjection);
    let organization = null;
    if (req.user?.organizationId) {
      organization = await Organization.findById(req.user.organizationId).select(
        'name slug logo industry website phone email address gstNumber services plan billingCycle planStatus billingSetupRequired companySetupRequired enabledModules maxUsers maxClients trialEndsAt settings paidAt'
      );
      if (organization) {
        const currentProfile = settings.companyProfile?.toObject
          ? settings.companyProfile.toObject()
          : settings.companyProfile || {};
        settings.companyProfile = {
          ...currentProfile,
          name: currentProfile.name || (organization.companySetupRequired ? '' : organization.name) || '',
          slug: currentProfile.slug || organization.slug || '',
          industry: currentProfile.industry || organization.industry || '',
          website: currentProfile.website || organization.website || '',
          email: currentProfile.email || organization.email || user?.email || '',
          phone: currentProfile.phone || organization.phone || '',
          address: currentProfile.address || organization.address || '',
          gstNumber: currentProfile.gstNumber || organization.gstNumber || '',
          services: currentProfile.services || organization.services || '',
          logoUrl: currentProfile.logoUrl || organization.logo || '',
        };
      }
    }
    res.json({ success: true, settings, user, organization });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfileSettings = async (req, res) => {
  try {
    const updates = {};
    editableProfileFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const sanitizedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .select(safeUserProjection);

    res.json({ success: true, user: sanitizedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { notifications, appearance, regional } = req.body;
    const settings = await getOrCreateSettings(req.user._id);

    if (notifications) settings.notifications = { ...settings.notifications.toObject(), ...notifications };
    if (appearance) settings.appearance = { ...settings.appearance.toObject(), ...appearance };
    if (regional) settings.regional = { ...settings.regional.toObject(), ...regional };

    await settings.save();

    await User.findByIdAndUpdate(req.user._id, {
      notifyEmail: settings.notifications.email,
      notifyInApp: settings.notifications.inApp,
    });

    res.json({ success: true, settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
