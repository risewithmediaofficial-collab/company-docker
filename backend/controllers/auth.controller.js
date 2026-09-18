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

// Generate access token (set to long lifetime: 365 days so users stay logged in)
const generateAccessToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key';
  const expire = process.env.JWT_EXPIRE || '365d';
  return jwt.sign({ id, role }, secret, { expiresIn: expire });
};

// Generate refresh token (set to long lifetime: 3650 days)
const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'dev-super-secret-refresh-key';
  const expire = process.env.JWT_REFRESH_EXPIRE || '3650d';
  return jwt.sign({ id }, secret, { expiresIn: expire });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Only superAdmin can create superAdmin accounts
    const safeRole = ['employee', 'client', 'referral', 'manager'].includes(role) ? role : 'employee';

    const newUser = await User.create({
      name,
      email,
      password,
      role: safeRole,
      isActive: false,
      approvalStatus: 'pending',
    });

    // If it's a client, also create a Client profile
    if (safeRole === 'client') {
      const client = await Client.create({
        name,
        email,
        company: name, // Default company name to user's name
        status: 'onboarding',
        userId: newUser._id,
        portalEnabled: true,
      });

      // Update user with clientId
      newUser.clientId = client._id;
      await newUser.save();
    }

    // Emit event for real-time dashboard updates
    const io = req.app.get('io');
    if (io) {
      io.emit('userCreated', { role: safeRole });
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted. A super admin must approve your account before you can sign in.',
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.matchPassword(password))) {
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

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    let organization = null;
    if (user.organizationId) {
      organization = await Organization.findById(user.organizationId).select(
        'name slug logo industry website phone plan planStatus enabledModules maxUsers maxClients trialEndsAt settings'
      );
    }

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
        referralCode: user.referralCode,
        permissions: user.permissions,
        clientId: user.clientId,
        organizationId: user.organizationId,
      },
      organization,
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

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
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
    const user = await User.findById(req.user._id).populate('clientId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    let organization = null;
    const ghostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'] || (req.isGhostMode ? req.user.organizationId : null);
    const targetOrgId = ((user.role === 'superAdmin' || user.role === 'admin') && ghostOrgId)
      ? ghostOrgId
      : user.organizationId;

    if (targetOrgId) {
      organization = await Organization.findById(targetOrgId).select(
        'name slug logo industry website phone plan planStatus enabledModules maxUsers maxClients trialEndsAt settings'
      );
    }
    res.json({ success: true, user, organization, isGhostMode: Boolean(ghostOrgId) });
  } catch (error) {
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
    const { name, phone, department, position, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, position, avatar },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    res.json({ success: true, user });
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
    const { companyName, ownerName, email, password, phone, industry, website, logo, slug, domainUrl } = req.body;

    if (!companyName || !ownerName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Company name, your name, email and password are required',
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
    const cleanSlug = String(slug || '').toLowerCase().trim();

    // Find by slug, or backfill if existing organization matches name
    let org = await Organization.findOne({ slug: cleanSlug });
    if (!org) {
      // Try regex match on name or id
      org = await Organization.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${cleanSlug.replace(/-/g, '[ -]')}$`, 'i') } },
          ...(mongoose.Types.ObjectId.isValid(cleanSlug) ? [{ _id: cleanSlug }] : []),
        ],
      });
      if (org && !org.slug) {
        org.slug = cleanSlug;
        await org.save();
      }
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
        industry: org.industry || '',
        planStatus: org.planStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
