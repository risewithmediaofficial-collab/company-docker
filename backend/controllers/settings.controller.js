import Settings from '../models/settings.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import Branch from '../models/branch.model.js';
import OfficeLocation from '../models/officeLocation.model.js';
import { canViewCompanyAndGst, sanitizeOrganizationForRole } from '../utils/orgAccess.js';

const editableProfileFields = ['name', 'phone', 'department', 'position', 'avatar'];
const safeUserProjection = '-password -refreshToken -resetPasswordToken -resetPasswordExpire';

const getOrCreateSettings = async (userId) => {
  let settings = await Settings.findOne({ user: userId });
  if (!settings) settings = await Settings.create({ user: userId });
  return settings;
};

export const updateCompanySettings = async (req, res) => {
  try {
    if (!canViewCompanyAndGst(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin, Owner, or Manager can update company and GST details.',
      });
    }

    const settings = await getOrCreateSettings(req.user._id);
    const updates = req.body || {};

    if (updates.name !== undefined && !String(updates.name || '').trim()) {
      return res.status(400).json({ success: false, message: 'Company Name is required' });
    }

    const clampLogoSize = (val) => {
      const n = Number(val);
      if (!Number.isFinite(n) || n <= 0) return 44;
      return Math.min(72, Math.max(24, Math.round(n)));
    };

    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.logoSize !== undefined) {
      sanitizedUpdates.logoSize = clampLogoSize(sanitizedUpdates.logoSize);
    }

    settings.companyProfile = {
      ...(settings.companyProfile?.toObject ? settings.companyProfile.toObject() : settings.companyProfile || {}),
      ...sanitizedUpdates,
    };
    await settings.save();

    let organization = null;
    if (
      req.user?.organizationId &&
      canViewCompanyAndGst(req.user.role)
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
        if (sanitizedUpdates.logoSize !== undefined) org.logoSize = sanitizedUpdates.logoSize;
        if (org.name && org.name.trim()) {
          org.companySetupRequired = false;
        }
        await org.save();
        organization = org;

        // Auto-sync Headquarters Branch & Attendance Geofencing OfficeLocation
        const rawLat = updates.latitude !== undefined && updates.latitude !== '' ? Number(updates.latitude) : null;
        const rawLng = updates.longitude !== undefined && updates.longitude !== '' ? Number(updates.longitude) : null;
        const hasValidCoords = rawLat !== null && rawLng !== null && Number.isFinite(rawLat) && Number.isFinite(rawLng);
        const radiusKmVal =
          updates.radiusKm !== undefined && Number.isFinite(Number(updates.radiusKm)) && Number(updates.radiusKm) > 0
            ? Number(updates.radiusKm)
            : 0.5;
        const hqCity = String(updates.city || '').trim() || 'Head Office';
        const hqAddress = String(updates.address || org.address || '').trim();
        const hqCountry = String(updates.country || 'India').trim() || 'India';
        const hqOperatingHours = String(updates.operatingHours || '9:30 AM - 6:30 PM').trim();
        const hqWorkingDays = String(updates.workingDays || 'Monday - Saturday').trim();

        try {
          let hqBranch = await Branch.findOne({ organization: org._id, isHeadquarters: true });
          if (!hqBranch && (hasValidCoords || updates.city || updates.operatingHours || updates.workingDays)) {
            hqBranch = await Branch.findOne({ organization: org._id });
          }

          if (hqBranch) {
            if (updates.name) hqBranch.name = `${org.name} (HQ)`;
            if (hqAddress) hqBranch.address = hqAddress;
            if (updates.city) hqBranch.city = hqCity;
            if (updates.state !== undefined) hqBranch.state = String(updates.state || '').trim();
            if (hqCountry) hqBranch.country = hqCountry;
            if (updates.postalCode !== undefined) hqBranch.postalCode = String(updates.postalCode || '').trim();
            if (updates.phone !== undefined) hqBranch.phone = String(updates.phone || '').trim();
            if (updates.email !== undefined) hqBranch.email = String(updates.email || '').trim().toLowerCase();
            hqBranch.operatingHours = hqOperatingHours;
            hqBranch.workingDays = hqWorkingDays;
            if (hasValidCoords) {
              hqBranch.latitude = rawLat;
              hqBranch.longitude = rawLng;
              hqBranch.radiusKm = radiusKmVal;
            }
            await hqBranch.save();
          } else if (hasValidCoords || updates.city || hqAddress || updates.operatingHours) {
            await Branch.create({
              organization: org._id,
              name: `${org.name || 'Main'} (HQ)`,
              code: 'HQ',
              isHeadquarters: true,
              phone: org.phone || '',
              email: (org.email || '').toLowerCase(),
              address: hqAddress,
              city: hqCity,
              state: String(updates.state || '').trim(),
              country: hqCountry,
              postalCode: String(updates.postalCode || '').trim(),
              operatingHours: hqOperatingHours,
              workingDays: hqWorkingDays,
              latitude: hasValidCoords ? rawLat : null,
              longitude: hasValidCoords ? rawLng : null,
              radiusKm: radiusKmVal,
              isActive: true,
              createdBy: req.user._id,
            });
          }

          if (hasValidCoords) {
            const locName = `${org.name || 'Main'} (HQ)`;
            const existingLoc = await OfficeLocation.findOne({ organization: org._id });
            if (existingLoc) {
              existingLoc.name = locName;
              existingLoc.latitude = rawLat;
              existingLoc.longitude = rawLng;
              existingLoc.radiusKm = radiusKmVal;
              existingLoc.address = hqAddress;
              existingLoc.city = hqCity;
              existingLoc.country = hqCountry;
              existingLoc.isActive = true;
              await existingLoc.save();
            } else {
              await OfficeLocation.create({
                name: locName,
                latitude: rawLat,
                longitude: rawLng,
                radiusKm: radiusKmVal,
                address: hqAddress,
                city: hqCity,
                country: hqCountry,
                organization: org._id,
                isActive: true,
              });
            }
          }
        } catch (syncErr) {
          console.warn('[Settings HQ/OfficeLocation Sync Warning]:', syncErr.message);
        }
      }
    } else if (req.user?.role === 'superAdmin' && !req.user?.organizationId) {
      // Main software branding profile configured by global Super Admin
      const cp = settings.companyProfile || {};
      organization = {
        _id: null,
        name: cp.name || 'AgencyUpscale',
        slug: cp.slug || '',
        logo: cp.logoUrl || '',
        logoSize: clampLogoSize(cp.logoSize),
        industry: cp.industry || '',
        website: cp.website || '',
        phone: cp.phone || '',
        email: cp.email || '',
        address: cp.address || '',
        gstNumber: cp.gstNumber || '',
        services: cp.services || '',
        planStatus: 'active',
      };
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
        'name slug logo logoSize industry website phone email address gstNumber services plan billingCycle planStatus billingSetupRequired companySetupRequired enabledModules maxUsers maxClients storageLimitMb storageUsedBytes trialEndsAt settings paidAt'
      );
      if (organization) {
        const [hqBranch, officeLoc] = await Promise.all([
          Branch.findOne({ organization: organization._id, isHeadquarters: true }).lean(),
          OfficeLocation.findOne({ organization: organization._id }).lean(),
        ]);

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
          address: currentProfile.address || organization.address || hqBranch?.address || '',
          city: currentProfile.city || hqBranch?.city || officeLoc?.city || '',
          state: currentProfile.state || hqBranch?.state || '',
          country: currentProfile.country || hqBranch?.country || officeLoc?.country || 'India',
          postalCode: currentProfile.postalCode || hqBranch?.postalCode || '',
          gstNumber: currentProfile.gstNumber || organization.gstNumber || '',
          services: currentProfile.services || organization.services || '',
          logoUrl: currentProfile.logoUrl || organization.logo || '',
          logoSize: Math.min(72, Math.max(24, Number(currentProfile.logoSize ?? organization.logoSize) || 44)),
          openingTime: currentProfile.openingTime || '09:30',
          closingTime: currentProfile.closingTime || '18:30',
          operatingHours: currentProfile.operatingHours || hqBranch?.operatingHours || '9:30 AM - 6:30 PM',
          workingDays: currentProfile.workingDays || hqBranch?.workingDays || 'Monday - Saturday',
          lateGraceMinutes: currentProfile.lateGraceMinutes ?? 15,
          latitude:
            hqBranch?.latitude != null
              ? String(hqBranch.latitude)
              : officeLoc?.latitude != null
              ? String(officeLoc.latitude)
              : currentProfile.latitude !== undefined && currentProfile.latitude !== ''
              ? String(currentProfile.latitude)
              : '',
          longitude:
            hqBranch?.longitude != null
              ? String(hqBranch.longitude)
              : officeLoc?.longitude != null
              ? String(officeLoc.longitude)
              : currentProfile.longitude !== undefined && currentProfile.longitude !== ''
              ? String(currentProfile.longitude)
              : '',
          radiusKm: hqBranch?.radiusKm ?? officeLoc?.radiusKm ?? currentProfile.radiusKm ?? 0.5,
        };
      }
    } else if (req.user?.role === 'superAdmin') {
      const [hqBranch, officeLoc] = await Promise.all([
        Branch.findOne({ organization: null, isHeadquarters: true }).lean(),
        OfficeLocation.findOne({ organization: null }).lean(),
      ]);
      const currentProfile = settings.companyProfile?.toObject
        ? settings.companyProfile.toObject()
        : settings.companyProfile || {};
      settings.companyProfile = {
        ...currentProfile,
        logoSize: Math.min(72, Math.max(24, Number(currentProfile.logoSize) || 44)),
        latitude:
          hqBranch?.latitude != null
            ? String(hqBranch.latitude)
            : officeLoc?.latitude != null
            ? String(officeLoc.latitude)
            : currentProfile.latitude || '',
        longitude:
          hqBranch?.longitude != null
            ? String(hqBranch.longitude)
            : officeLoc?.longitude != null
            ? String(officeLoc.longitude)
            : currentProfile.longitude || '',
        radiusKm: hqBranch?.radiusKm ?? officeLoc?.radiusKm ?? currentProfile.radiusKm ?? 0.5,
      };
      if (currentProfile.name || currentProfile.logoUrl || currentProfile.logoSize) {
        organization = {
          _id: null,
          name: currentProfile.name || 'AgencyUpscale',
          slug: currentProfile.slug || '',
          logo: currentProfile.logoUrl || '',
          logoSize: settings.companyProfile.logoSize,
          industry: currentProfile.industry || '',
          website: currentProfile.website || '',
          phone: currentProfile.phone || '',
          email: currentProfile.email || '',
          address: currentProfile.address || '',
          gstNumber: currentProfile.gstNumber || '',
          services: currentProfile.services || '',
          planStatus: 'active',
        };
      }
    }
    const roleAllowedCompanyGst = canViewCompanyAndGst(req.user?.role);
    if (!roleAllowedCompanyGst) {
      const settingsObj = settings.toObject ? settings.toObject() : { ...settings };
      settingsObj.companyProfile = null;
      return res.json({
        success: true,
        settings: settingsObj,
        user,
        organization: sanitizeOrganizationForRole(organization, req.user?.role),
      });
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
