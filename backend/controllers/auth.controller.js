// =============================================
// AUTH CONTROLLER
// =============================================

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Client from '../models/client.model.js';
import Organization from '../models/organization.model.js';
import { sendEmail } from '../utils/email.js';
import { createNotification } from '../utils/notification.js';
import { createActivityLog } from '../utils/activity.js';
import { generateCaptchaChallenge, verifyCaptchaChallenge, verifyInteractiveCaptchaStep, isTermsAccepted } from '../utils/captcha.js';
import { loadEnv } from '../config/env.js';
import { sanitizeOrganizationForRole } from '../utils/orgAccess.js';
import Settings from '../models/settings.model.js';

const ORG_AUTH_PROJECTION =
  'name slug logo logoSize industry website phone email address gstNumber services plan billingCycle planStatus billingSetupRequired companySetupRequired enabledModules maxUsers maxClients storageLimitMb storageUsedBytes trialEndsAt settings paidAt';

const resolveEffectiveOrganization = async (user, targetOrgId) => {
  if (targetOrgId && mongoose.Types.ObjectId.isValid(targetOrgId)) {
    return await Organization.findById(targetOrgId).select(ORG_AUTH_PROJECTION);
  }
  // Global platform users (e.g. main software Super Admin / internal staff without tenant orgId)
  // inherit branding from the main software Company Profile configured in Super Admin Settings
  let brandSettings = null;
  if (user?._id && user.role === 'superAdmin') {
    brandSettings = await Settings.findOne({ user: user._id }).select('companyProfile').lean();
  }
  if (!brandSettings?.companyProfile?.name && !brandSettings?.companyProfile?.logoUrl) {
    const adminUser = await User.findOne({ role: 'superAdmin' }).select('_id').sort({ createdAt: 1 }).lean();
    if (adminUser?._id) {
      brandSettings = await Settings.findOne({ user: adminUser._id }).select('companyProfile').lean();
    }
  }
  const cp = brandSettings?.companyProfile;
  if (!cp || (!cp.name && !cp.logoUrl && !cp.logoSize)) return null;

  return {
    _id: null,
    name: cp.name || 'AgencyUpscale',
    slug: cp.slug || '',
    logo: cp.logoUrl || '',
    logoSize: Math.min(72, Math.max(24, Number(cp.logoSize) || 44)),
    industry: cp.industry || '',
    website: cp.website || '',
    phone: cp.phone || '',
    email: cp.email || '',
    address: cp.address || '',
    gstNumber: cp.gstNumber || '',
    services: cp.services || '',
    planStatus: 'active',
  };
};

const createSelfServeWorkspace = async ({ name, email, phone, ownerId }) => {
  const baseName = String(name || email?.split('@')[0] || 'My Agency').trim();
  let cleanSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!cleanSlug) cleanSlug = `workspace-${Date.now().toString(36)}`;

  const exists = await Organization.findOne({ slug: cleanSlug }).select('_id').lean();
  if (exists) {
    cleanSlug = `${cleanSlug}-${crypto.randomBytes(2).toString('hex')}`;
  }

  return Organization.create({
    name: `${baseName}'s Workspace`,
    slug: cleanSlug,
    ownerId,
    email: email || '',
    phone: phone || '',
    plan: 'free',
    billingCycle: 'monthly',
    planStatus: 'pending',
    billingSetupRequired: true,
    companySetupRequired: true,
    maxUsers: 2,
    maxClients: 3,
    storageLimitMb: 100,
    enabledModules: {
      crm: true,
      clients: true,
      projects: true,
      tasks: true,
    },
  });
};

// Generate access token with explicit tokenType
const generateAccessToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key';
  const expire = process.env.JWT_EXPIRE || '15m';
  return jwt.sign({ id, role, tokenType: 'access' }, secret, { expiresIn: expire });
};

// Generate refresh token with explicit tokenType
const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'dev-super-secret-refresh-key';
  const expire = process.env.JWT_REFRESH_EXPIRE || '7d';
  return jwt.sign({ id, tokenType: 'refresh' }, secret, { expiresIn: expire });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, companySlug, captchaToken, captchaAnswer, acceptTerms } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, mobile number and password' });
    }

    const cleanPhone = String(phone).trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({ success: false, message: 'Please provide a valid mobile number (at least 10 digits)' });
    }

    if (!isTermsAccepted(acceptTerms)) {
      return res.status(400).json({
        success: false,
        code: 'TERMS_REQUIRED',
        message: 'You must accept the Terms & Conditions to create an account',
      });
    }

    const captchaResult = await verifyCaptchaChallenge({ captchaToken, captchaAnswer });
    if (!captchaResult.valid) {
      return res.status(400).json({
        success: false,
        code: 'CAPTCHA_INVALID',
        message: captchaResult.message,
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const cleanCompanySlug = String(companySlug || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();

    // Joining an existing company portal -> preserves staff approval flow
    if (cleanCompanySlug) {
      const orgDoc = await Organization.findOne({ slug: cleanCompanySlug }).select('_id name slug').lean();
      if (!orgDoc) {
        return res.status(404).json({ success: false, message: 'Company workspace not found' });
      }
      const safeRole = ['employee', 'client', 'manager'].includes(role) ? role : 'employee';
      const tenantUser = await User.create({
        name: String(name).trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password,
        role: safeRole,
        organizationId: orgDoc._id,
        isActive: false,
        approvalStatus: 'pending',
      });

      if (safeRole === 'client') {
        const client = await Client.create({
          name: tenantUser.name,
          email: cleanEmail,
          phone: cleanPhone,
          company: tenantUser.name,
          status: 'onboarding',
          userId: tenantUser._id,
          organizationId: orgDoc._id,
          portalEnabled: true,
        });
        tenantUser.clientId = client._id;
        await tenantUser.save();
      }

      const io = req.app.get('io');
      if (io) io.emit('userCreated', { role: safeRole });

      return res.status(201).json({
        success: true,
        message: `Registration submitted to ${orgDoc.name}. Please wait for admin approval before signing in.`,
      });
    }

    // Public self-service registration -> owner signs in, selects Razorpay plan, then enters company details in Settings
    const newUser = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: 'organizationOwner',
      isActive: true,
      approvalStatus: 'approved',
    });

    const org = await createSelfServeWorkspace({
      name: newUser.name,
      email: cleanEmail,
      phone: cleanPhone,
      ownerId: newUser._id,
    });
    newUser.organizationId = org._id;
    await newUser.save({ validateBeforeSave: false });

    const io = req.app.get('io');
    if (io) io.emit('userCreated', { role: 'organizationOwner' });

    res.status(201).json({
      success: true,
      requiresPlanSelection: true,
      companySlug: org.slug,
      message: 'Account created! Sign in with your email and password to select a plan and complete your setup.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, companySlug, captchaToken, captchaAnswer, acceptTerms } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (!isTermsAccepted(acceptTerms)) {
      return res.status(400).json({
        success: false,
        code: 'TERMS_REQUIRED',
        message: 'You must accept the Terms & Conditions to sign in',
      });
    }

    const captchaResult = await verifyCaptchaChallenge({ captchaToken, captchaAnswer });
    if (!captchaResult.valid) {
      return res.status(400).json({
        success: false,
        code: 'CAPTCHA_INVALID',
        message: captchaResult.message,
      });
    }

    const cleanIdentifier = String(email).trim().toLowerCase();
    const rawIdentifier = String(email).trim();
    const cleanPassword = String(password).trim();

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: rawIdentifier },
        { phone: cleanIdentifier },
      ],
    }).select('+password +refreshToken');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Try standard bcrypt match first
    let isMatch = await user.matchPassword(cleanPassword);

    // Fallback for client accounts: verify against phone number
    if (!isMatch && (user.role === 'client' || user.clientId)) {
      const enteredDigits = cleanPassword.replace(/\D/g, '');
      const userPhoneDigits = (user.phone || '').replace(/\D/g, '');
      let clientPhoneDigits = '';

      if (user.clientId) {
        const clientObj = await Client.findById(user.clientId).select('phone');
        if (clientObj?.phone) {
          clientPhoneDigits = clientObj.phone.replace(/\D/g, '');
        }
      }

      if (
        (cleanPassword === user.phone) ||
        (enteredDigits.length >= 6 && enteredDigits === userPhoneDigits) ||
        (enteredDigits.length >= 6 && enteredDigits === clientPhoneDigits)
      ) {
        isMatch = true;
        // Re-hash and persist clean password
        user.password = cleanPassword;
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.approvalStatus === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is waiting for super admin approval' });
    }

    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({ success: false, message: 'Your account request was rejected' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    // ── Tenant Portal URL Scoping Enforcement ────────────────────────────────
    let organization = await resolveEffectiveOrganization(user, user.organizationId);
    if (user.organizationId && organization && !organization.slug) {
      organization.slug = organization.name
        ? organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : String(organization._id);
      await organization.save();
    }

    const isSelfServeOnboarding = Boolean(
      user.role === 'organizationOwner' &&
      (organization?.billingSetupRequired || organization?.companySetupRequired)
    );

    // If the user belongs to a company (tenant user) and is not platform superAdmin:
    if (user.role !== 'superAdmin' && user.organizationId) {
      const orgSlug = organization?.slug || (organization?.name ? organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '') || String(organization?._id || '');
      const cleanCompanySlug = String(companySlug || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();

      // Rule 1: Cannot log in from general platform login (/login) without company URL (except owners finishing plan/company setup)
      if (!cleanCompanySlug && !isSelfServeOnboarding) {
        return res.status(403).json({
          success: false,
          requiresCompanyPortal: true,
          companySlug: orgSlug,
          companyName: organization?.name || 'Your Company',
          portalUrl: `/login/${orgSlug}`,
          message: `Company members must log in through their company URL: /login/${orgSlug}. You cannot log in from the main platform dashboard.`,
        });
      }

      if (cleanCompanySlug) {
        // Rule 2: Cannot log in to a different company's URL
        const matchesSlug = orgSlug && cleanCompanySlug === orgSlug.toLowerCase().trim();
        const matchesOrgId = organization && String(organization._id) === cleanCompanySlug;
        const matchesOrgName = organization?.name && cleanCompanySlug === organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        if (!matchesSlug && !matchesOrgId && !matchesOrgName) {
          return res.status(403).json({
            success: false,
            requiresCompanyPortal: true,
            companySlug: orgSlug,
            companyName: organization?.name || 'Your Company',
            portalUrl: `/login/${orgSlug}`,
            message: `This account does not belong to this portal. Please log in at your own company URL: /login/${orgSlug}`,
          });
        }
      }

      // Rule 3: Check tenant status (allow owners with billingSetupRequired to reach plan selection/Razorpay checkout)
      if (organization?.planStatus === 'pending' && !organization?.billingSetupRequired) {
        return res.status(403).json({
          success: false,
          message: `"${organization.name}" registration is pending approval by Platform Super Admin.`,
        });
      }

      if (organization?.planStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          message: `"${organization.name}" workspace has been suspended. Please contact Platform Administration.`,
        });
      }
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const isFirstLogin = !user.lastLogin && !user.hasSeenOnboarding;
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Record login in Audit Logs
    await createActivityLog({
      actor: user,
      action: 'auth.login',
      entityType: 'auth',
      entityId: user._id,
      title: 'User logged in',
      description: `${user.name} (${user.role}) signed in successfully.`,
      metadata: {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'] || '',
        email: user.email,
        role: user.role,
      },
    });

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        department: user.department,
        position: user.position,
        vendorCompany: user.vendorCompany || '',
        referralCode: user.referralCode,
        permissions: user.permissions,
        clientId: user.clientId,
        organizationId: user.organizationId,
        hasSeenOnboarding: Boolean(user.hasSeenOnboarding),
        isFirstLogin: Boolean(isFirstLogin),
        createdAt: user.createdAt,
      },
      organization: sanitizeOrganizationForRole(organization, user.role),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    if (decoded.tokenType && decoded.tokenType !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid token type for refresh' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid user session' });
    }

    const user = await User.findById(userId).populate('clientId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const rawGhostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'] || (req.isGhostMode ? req.user.organizationId : null);
    const ghostOrgId = (rawGhostOrgId && rawGhostOrgId !== 'undefined' && rawGhostOrgId !== 'null' && rawGhostOrgId !== 'global')
      ? String(rawGhostOrgId).trim()
      : null;
    const targetOrgId = ((user.role === 'superAdmin' || user.role === 'admin') && ghostOrgId)
      ? ghostOrgId
      : user.organizationId;

    const organization = await resolveEffectiveOrganization(user, targetOrgId);
    res.json({
      success: true,
      user,
      organization: sanitizeOrganizationForRole(organization, user.role),
      isGhostMode: Boolean(ghostOrgId),
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email' });
    }

    // Get active superAdmin users
    const admins = await User.find({ role: 'superAdmin', isActive: true });
    const io = req.app.get('io');

    await Promise.all(
      admins.map((admin) =>
        createNotification(
          {
            recipient: admin._id,
            sender: user._id,
            type: 'system',
            title: 'Password Change Request',
            message: `${user.name} (${user.email}) has requested a password change.`,
            link: '/admin/users',
          },
          io
        )
      )
    );

    res.json({ success: true, message: 'Password reset request has been sent to the administrator' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.passwordChangedAt = new Date();
    user.refreshToken = null;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, position, avatar, hasSeenOnboarding } = req.body;
    const updateData = { name, phone, department, position, avatar };
    if (hasSeenOnboarding !== undefined) {
      updateData.hasSeenOnboarding = Boolean(hasSeenOnboarding);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark user onboarding modal as viewed / completed
// @route   POST /api/auth/complete-onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { hasSeenOnboarding: true },
      { new: true }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    res.json({ success: true, message: 'Onboarding completed', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password' });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.refreshToken = null;
    await user.save();

    const io = req.app?.get('io') || global.io;
    if (io) {
      const msg = 'Your password has been changed. Please log in again.';
      if (typeof io.sendToUser === 'function') {
        io.sendToUser(user._id.toString(), 'forceLogout', { reason: 'password_changed', message: msg });
      } else if (io.to) {
        io.to(`user:${user._id.toString()}`).emit('forceLogout', { reason: 'password_changed', message: msg });
      }
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new company (SaaS tenant registration)
// @route   POST /api/auth/register-company
// @access  Public
export const registerCompany = async (req, res) => {
  try {
    const { companyName, ownerName, email, password, phone, industry, website, logo, slug, domainUrl, captchaToken, captchaAnswer, acceptTerms } = req.body;

    if (!companyName || !ownerName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Company name, your name, email and password are required',
      });
    }

    if (!isTermsAccepted(acceptTerms)) {
      return res.status(400).json({
        success: false,
        code: 'TERMS_REQUIRED',
        message: 'You must accept the Terms & Conditions to register your company',
      });
    }

    const captchaResult = await verifyCaptchaChallenge({ captchaToken, captchaAnswer });
    if (!captchaResult.valid) {
      return res.status(400).json({
        success: false,
        code: 'CAPTCHA_INVALID',
        message: captchaResult.message,
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already registered' });
    }

    // Clean and validate domain url slug
    let cleanSlug = (slug || domainUrl || companyName || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      cleanSlug = `company-${Date.now().toString(36)}`;
    }

    // Check if slug is taken
    const existingOrgSlug = await Organization.findOne({ slug: cleanSlug });
    if (existingOrgSlug) {
      cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Create the owner user first (inactive until approved)
    const owner = await User.create({
      name: ownerName,
      email,
      password,
      phone: phone || '',
      role: 'organizationOwner',
      isActive: false,
      approvalStatus: 'pending',
    });

    // Create the organization (pending approval)
    const org = await Organization.create({
      name: companyName,
      slug: cleanSlug,
      ownerId: owner._id,
      industry: industry || '',
      website: website || '',
      phone: phone || '',
      logo: logo || '',
      planStatus: 'pending',
      plan: 'trial',
    });

    // Link user to org
    owner.organizationId = org._id;
    await owner.save({ validateBeforeSave: false });

    // Notify platform super admins
    const superAdmins = await User.find({ role: 'superAdmin', isActive: true });
    const io = req.app.get('io');
    await Promise.all(
      superAdmins.map((admin) =>
        createNotification(
          {
            recipient: admin._id,
            type: 'system',
            title: '🆕 New Company Registration',
            message: `"${companyName}" (${cleanSlug}) registered by ${ownerName} (${email}). Awaiting your approval.`,
            link: '/admin/company-requests',
          },
          io
        )
      )
    );

    if (io) io.emit('newOrgRegistered', { orgId: org._id, companyName, slug: cleanSlug });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your company account is under review. You will be notified once approved.',
      portalUrl: `/login/${cleanSlug}`,
      slug: cleanSlug,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public company portal info for branded login
// @route   GET /api/auth/company-portal/:slug
// @access  Public
export const getCompanyPortal = async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = String(slug || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();

    if (!cleanSlug) {
      return res.status(400).json({ success: false, message: 'Invalid company portal slug' });
    }

    // Escape regex characters safely so syntax errors don't crash
    const escaped = cleanSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[ -]');

    // Find by slug, name regex or ObjectId
    let org = await Organization.findOne({
      $or: [
        { slug: cleanSlug },
        { name: { $regex: new RegExp(`^${escaped}$`, 'i') } },
        ...(mongoose.Types.ObjectId.isValid(cleanSlug) ? [{ _id: cleanSlug }] : []),
      ],
    });

    if (org && !org.slug) {
      org.slug = cleanSlug || (org.name ? org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '') || String(org._id);
      await org.save();
    }

    if (!org) {
      return res.status(404).json({ success: false, message: 'Company portal not found' });
    }

    res.json({
      success: true,
      company: {
        _id: org._id,
        name: org.name,
        slug: org.slug || cleanSlug,
        logo: org.logo || '',
        logoSize: Math.min(72, Math.max(24, Number(org.logoSize) || 44)),
        industry: org.industry || '',
        planStatus: org.planStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// CAPTCHA CHALLENGE
// =============================================

// @desc    Generate CAPTCHA challenge (hCaptcha / Turnstile / reCAPTCHA / Visual Human Check)
// @route   GET /api/auth/captcha
// @access  Public
export const getCaptchaChallenge = (req, res) => {
  const challenge = generateCaptchaChallenge();
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.json({
    success: true,
    ...challenge,
  });
};

// @desc    Verify interactive visual CAPTCHA selection and issue single-use pass proof
// @route   POST /api/auth/captcha/verify
// @access  Public
export const verifyCaptchaStep = async (req, res) => {
  const { captchaToken, captchaAnswer } = req.body || {};
  const result = await verifyInteractiveCaptchaStep({ captchaToken, captchaAnswer });
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      code: 'CAPTCHA_INVALID',
      message: result.message || 'Verification failed. Please try again.',
    });
  }
  return res.json({
    success: true,
    captchaToken: result.captchaToken,
    challengeProof: result.challengeProof,
    expiresInSeconds: result.expiresInSeconds,
  });
};

// =============================================
// GOOGLE OAUTH 2.0 LOGIN & SIGNUP
// =============================================

const getGoogleOAuthRuntime = (req) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    loadEnv();
  }
  const rawId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  const rawSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const clientId = /^your_google_/i.test(rawId) ? '' : rawId;
  const clientSecret = /^your_google_/i.test(rawSecret) ? '' : rawSecret;
  const rawRedirect = String(process.env.GOOGLE_REDIRECT_URI || '').trim();
  const configuredRedirect = /your-frontend-domain|your-domain/i.test(rawRedirect) ? '' : rawRedirect;

  const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0].trim();
  const proto = forwardedProto || req?.protocol || 'http';
  const forwardedHost = String(req?.headers?.['x-forwarded-host'] || '').split(',')[0].trim();
  const host = forwardedHost || (typeof req?.get === 'function' ? req.get('host') : '') || 'localhost:5001';
  const dynamicRedirect = `${proto}://${host}/api/auth/google/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri: configuredRedirect || dynamicRedirect,
    requestOrigin: `${proto}://${host}`,
  };
};

const resolveSafeReturnOrigin = (requestedOrigin, fallbackOrigin) => {
  const clientDefault = process.env.CLIENT_URL || fallbackOrigin || 'http://localhost:5173';
  if (!requestedOrigin) return clientDefault.replace(/\/+$/, '');
  try {
    const parsed = new URL(requestedOrigin);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return parsed.origin;
    }
  } catch (_) {}
  return clientDefault.replace(/\/+$/, '');
};

export const resolveGoogleUserAndTokens = async ({
  profile,
  mode = 'signin',
  role = 'employee',
  companySlug = '',
  req,
}) => {
  if (!profile?.email || profile.email_verified === false || profile.email_verified === 'false') {
    return { ok: false, status: 400, message: 'Verified Google email address is required' };
  }

  const cleanEmail = String(profile.email).trim().toLowerCase();
  const googleSub = profile.sub ? String(profile.sub).trim() : '';

  const orQuery = [{ email: cleanEmail }];
  if (googleSub) orQuery.unshift({ googleId: googleSub });

  let user = await User.findOne({ $or: orQuery }).select('+refreshToken');

  // Existing account -> Sign In (even if initiated from Sign Up button)
  if (user) {
    if (user.approvalStatus === 'pending') {
      return { ok: false, status: 403, message: 'Your account is waiting for super admin approval' };
    }
    if (user.approvalStatus === 'rejected') {
      return { ok: false, status: 403, message: 'Your account request was rejected' };
    }
    if (!user.isActive) {
      return { ok: false, status: 403, message: 'Your account has been deactivated' };
    }

    let organization = null;
    if (user.organizationId) {
      organization = await Organization.findById(user.organizationId).select(ORG_AUTH_PROJECTION);
      if (organization && !organization.slug) {
        organization.slug = organization.name
          ? organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
          : String(organization._id);
        await organization.save();
      }
    }

    const isSelfServeOnboarding = Boolean(
      user.role === 'organizationOwner' &&
      (organization?.billingSetupRequired || organization?.companySetupRequired)
    );

    if (user.role !== 'superAdmin' && user.organizationId) {
      const orgSlug =
        organization?.slug ||
        (organization?.name
          ? organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
          : '') ||
        String(organization?._id || '');
      const cleanCompanySlug = String(companySlug || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();

      if (!cleanCompanySlug && !isSelfServeOnboarding) {
        return {
          ok: false,
          status: 403,
          requiresCompanyPortal: true,
          companySlug: orgSlug,
          companyName: organization?.name || 'Your Company',
          portalUrl: `/login/${orgSlug}`,
          message: `Company members must log in through their company URL: /login/${orgSlug}.`,
        };
      }

      if (cleanCompanySlug) {
        const matchesSlug = orgSlug && cleanCompanySlug === orgSlug.toLowerCase().trim();
        const matchesOrgId = organization && String(organization._id) === cleanCompanySlug;
        const matchesOrgName =
          organization?.name &&
          cleanCompanySlug === organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        if (!matchesSlug && !matchesOrgId && !matchesOrgName) {
          return {
            ok: false,
            status: 403,
            requiresCompanyPortal: true,
            companySlug: orgSlug,
            companyName: organization?.name || 'Your Company',
            portalUrl: `/login/${orgSlug}`,
            message: `This account does not belong to this portal. Please log in at your own company URL: /login/${orgSlug}`,
          };
        }
      }

      if (organization?.planStatus === 'pending' && !organization?.billingSetupRequired) {
        return {
          ok: false,
          status: 403,
          message: `"${organization.name}" registration is pending approval by Platform Super Admin.`,
        };
      }

      if (organization?.planStatus === 'suspended') {
        return {
          ok: false,
          status: 403,
          message: `"${organization.name}" workspace has been suspended.`,
        };
      }
    }

    if (googleSub && !user.googleId) user.googleId = googleSub;
    if (profile.picture && !user.avatar) user.avatar = profile.picture;
    user.authProvider = user.authProvider === 'local' ? 'both' : 'google';

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    const isFirstLogin = !user.lastLogin && !user.hasSeenOnboarding;
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await createActivityLog({
      actor: user,
      action: 'auth.google_login',
      entityType: 'auth',
      entityId: user._id,
      title: 'User logged in with Google',
      description: `${user.name} (${user.role}) signed in via Google OAuth.`,
      metadata: { email: user.email, role: user.role },
    }).catch(() => {});

    return {
      ok: true,
      status: 200,
      accessToken,
      refreshToken,
      organization: sanitizeOrganizationForRole(organization, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        department: user.department,
        position: user.position,
        vendorCompany: user.vendorCompany || '',
        referralCode: user.referralCode,
        permissions: user.permissions,
        clientId: user.clientId,
        organizationId: user.organizationId,
        hasSeenOnboarding: Boolean(user.hasSeenOnboarding),
        isFirstLogin: Boolean(isFirstLogin),
        createdAt: user.createdAt,
      },
    };
  }

  // No existing user
  if (mode !== 'signup') {
    return {
      ok: false,
      status: 404,
      message: `No CRM account found for ${cleanEmail}. Please sign up first.`,
    };
  }

  const cleanCompanySlug = String(companySlug || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  const randomPassword = crypto.randomBytes(24).toString('hex');

  // Joining an existing company portal -> preserves staff approval flow
  if (cleanCompanySlug) {
    const orgDoc = await Organization.findOne({ slug: cleanCompanySlug }).select('_id name').lean();
    if (!orgDoc) {
      return { ok: false, status: 404, message: 'Company workspace not found' };
    }
    const safeRole = ['employee', 'client', 'manager'].includes(role) ? role : 'employee';
    const tenantUser = await User.create({
      name: String(profile.name || cleanEmail.split('@')[0]).trim().slice(0, 100),
      email: cleanEmail,
      password: randomPassword,
      googleId: googleSub || undefined,
      authProvider: 'google',
      avatar: profile.picture || '',
      role: safeRole,
      organizationId: orgDoc._id,
      isActive: false,
      approvalStatus: 'pending',
    });

    if (safeRole === 'client') {
      const client = await Client.create({
        name: tenantUser.name,
        email: cleanEmail,
        company: tenantUser.name,
        status: 'onboarding',
        userId: tenantUser._id,
        organizationId: orgDoc._id,
        portalEnabled: true,
      });
      tenantUser.clientId = client._id;
      await tenantUser.save({ validateBeforeSave: false });
    }

    const io = req?.app?.get?.('io');
    if (io) io.emit('userCreated', { role: safeRole });

    return {
      ok: true,
      status: 201,
      pendingApproval: true,
      message: `Google registration submitted to ${orgDoc.name}. An administrator must approve your account before you can sign in.`,
    };
  }

  // Public Google Sign-Up -> activate owner account & redirect immediately to Razorpay plan selection
  const newUser = await User.create({
    name: String(profile.name || cleanEmail.split('@')[0]).trim().slice(0, 100),
    email: cleanEmail,
    password: randomPassword,
    googleId: googleSub || undefined,
    authProvider: 'google',
    avatar: profile.picture || '',
    role: 'organizationOwner',
    isActive: true,
    approvalStatus: 'approved',
  });

  const organization = await createSelfServeWorkspace({
    name: newUser.name,
    email: cleanEmail,
    ownerId: newUser._id,
  });
  newUser.organizationId = organization._id;
  const accessToken = generateAccessToken(newUser._id, newUser.role);
  const refreshToken = generateRefreshToken(newUser._id);
  newUser.refreshToken = refreshToken;
  newUser.lastLogin = new Date();
  await newUser.save({ validateBeforeSave: false });

  const io = req?.app?.get?.('io');
  if (io) io.emit('userCreated', { role: 'organizationOwner' });

  return {
    ok: true,
    status: 201,
    accessToken,
    refreshToken,
    organization,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      organizationId: newUser.organizationId,
      hasSeenOnboarding: false,
      isFirstLogin: true,
      createdAt: newUser.createdAt,
    },
  };
};

// @desc    Check if Google OAuth is configured
// @route   GET /api/auth/google/config
// @access  Public
export const getGoogleOAuthConfig = async (req, res) => {
  const { clientId, clientSecret } = getGoogleOAuthRuntime(req);
  res.json({
    success: true,
    enabled: Boolean(clientId && clientSecret),
    clientId: clientId || null,
  });
};

// @desc    Initiate Google OAuth 2.0 Authorization Code Redirect
// @route   GET /api/auth/google
// @access  Public
export const initiateGoogleOAuth = async (req, res) => {
  const { clientId, clientSecret, redirectUri, requestOrigin } = getGoogleOAuthRuntime(req);
  if (!clientId || !clientSecret) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on the server',
    });
  }

  const returnOrigin = resolveSafeReturnOrigin(req.query.origin, requestOrigin);
  const mode = req.query.mode === 'signup' ? 'signup' : 'signin';
  const role = ['employee', 'client', 'manager'].includes(String(req.query.role || ''))
    ? String(req.query.role)
    : 'employee';
  const companySlug = String(req.query.companySlug || '').trim();

  const stateSecret = process.env.JWT_SECRET || 'dev-only-change-me-access-secret';
  const stateToken = jwt.sign(
    {
      mode,
      role,
      companySlug,
      returnOrigin,
      nonce: crypto.randomBytes(8).toString('hex'),
    },
    stateSecret,
    { expiresIn: '10m' }
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: stateToken,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

// @desc    Google OAuth 2.0 Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleOAuthCallback = async (req, res) => {
  const { clientId, clientSecret, redirectUri, requestOrigin } = getGoogleOAuthRuntime(req);
  const stateSecret = process.env.JWT_SECRET || 'dev-only-change-me-access-secret';

  let decodedState = {};
  try {
    if (req.query.state) {
      decodedState = jwt.verify(String(req.query.state), stateSecret);
    }
  } catch (_) {
    const fallbackOrigin = resolveSafeReturnOrigin(null, requestOrigin);
    return res.redirect(
      `${fallbackOrigin}/auth/google/callback?oauthError=${encodeURIComponent('Google sign-in session expired. Please try again.')}`
    );
  }

  const returnOrigin = resolveSafeReturnOrigin(decodedState.returnOrigin, requestOrigin);
  const redirectWithParams = (query = {}, hash = '') => {
    const sp = new URLSearchParams(query);
    const qs = sp.toString();
    const target = `${returnOrigin}/auth/google/callback${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`;
    return res.redirect(target);
  };

  if (req.query.error) {
    return redirectWithParams({ oauthError: String(req.query.error_description || req.query.error) });
  }

  const code = String(req.query.code || '').trim();
  if (!code) {
    return redirectWithParams({ oauthError: 'Missing Google authorization code' });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return redirectWithParams({
        oauthError: tokenData.error_description || tokenData.error || 'Failed to exchange Google code',
      });
    }

    const userinfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userinfoRes.json();
    if (!userinfoRes.ok || !profile?.email) {
      return redirectWithParams({ oauthError: 'Failed to retrieve Google user profile' });
    }

    const result = await resolveGoogleUserAndTokens({
      profile,
      mode: decodedState.mode || 'signin',
      role: decodedState.role || 'employee',
      companySlug: decodedState.companySlug || '',
      req,
    });

    if (!result.ok) {
      if (result.requiresCompanyPortal) {
        return redirectWithParams({
          requiresCompanyPortal: '1',
          portalUrl: result.portalUrl || '',
          companyName: result.companyName || '',
          companySlug: result.companySlug || '',
          oauthError: result.message,
        });
      }
      return redirectWithParams({ oauthError: result.message || 'Google login failed' });
    }

    if (result.pendingApproval) {
      return redirectWithParams({
        signupPending: '1',
        message: result.message,
      });
    }

    const hashParams = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken || '',
    }).toString();

    return redirectWithParams({}, hashParams);
  } catch (error) {
    return redirectWithParams({ oauthError: error.message || 'Google authentication failed' });
  }
};

// @desc    Direct Google ID Token or Code Sign-In / Sign-Up (JSON API)
// @route   POST /api/auth/google
// @access  Public
export const googleTokenAuth = async (req, res) => {
  try {
    const { idToken, credential, mode = 'signin', role = 'employee', companySlug = '' } = req.body || {};
    const { clientId } = getGoogleOAuthRuntime(req);
    const token = String(idToken || credential || '').trim();

    if (!token) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );
    const profile = await infoRes.json();
    if (!infoRes.ok || !profile?.email) {
      return res.status(401).json({ success: false, message: 'Invalid Google ID token' });
    }

    if (clientId && profile.aud && String(profile.aud) !== clientId) {
      return res.status(401).json({ success: false, message: 'Google token audience mismatch' });
    }

    const result = await resolveGoogleUserAndTokens({
      profile,
      mode,
      role,
      companySlug,
      req,
    });

    if (!result.ok) {
      return res.status(result.status || 400).json({
        success: false,
        requiresCompanyPortal: result.requiresCompanyPortal,
        companySlug: result.companySlug,
        companyName: result.companyName,
        portalUrl: result.portalUrl,
        message: result.message,
      });
    }

    if (result.pendingApproval) {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message: result.message,
      });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      organization: result.organization,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
