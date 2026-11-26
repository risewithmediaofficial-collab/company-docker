import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Organization from '../models/organization.model.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import Asset from '../models/asset.model.js';

export const SAAS_PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Start your workspace cleanly with core CRM & client tracking',
    monthlyPriceInr: 0,
    annualPriceInr: 0,
    storageLimitMb: 100,
    storageLabel: '100 MB Storage',
    maxUsers: 2,
    maxClients: 3,
    badge: 'Free Forever',
    features: [
      '100 MB Cloud File Storage',
      'Up to 3 Active Clients',
      'Up to 2 Team Members',
      'CRM Leads, Projects, Tasks & Client Portal',
    ],
    enabledModules: {
      crm: true,
      clients: true,
      projects: true,
      tasks: true,
      portal: true,
      sop: false,
      finance: false,
      hr: false,
      attendance: false,
      smm: false,
      assets: true,
      proposals: false,
      reports: false,
      automations: false,
      influencers: false,
      ai: false,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For growing creative studios — 5 GB storage at just ₹10/mo',
    monthlyPriceInr: 10,
    annualPriceInr: 96,
    storageLimitMb: 5120,
    storageLabel: '5 GB Storage',
    maxUsers: 8,
    maxClients: 15,
    badge: '₹10 / mo',
    features: [
      '5 GB Cloud File Storage',
      'Up to 15 Active Clients',
      'Up to 8 Team Members',
      'Client Portal, Attendance, SOP & Basic Reports',
    ],
    enabledModules: {
      crm: true,
      clients: true,
      projects: true,
      tasks: true,
      portal: true,
      sop: true,
      finance: false,
      hr: false,
      attendance: true,
      smm: false,
      assets: true,
      proposals: true,
      reports: true,
      automations: false,
      influencers: false,
      ai: false,
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Complete agency OS with Finance, SMM Tracker & HR',
    monthlyPriceInr: 2999,
    annualPriceInr: 28790,
    storageLimitMb: 25600,
    storageLabel: '25 GB Storage',
    maxUsers: 25,
    maxClients: 50,
    badge: 'Most Popular',
    features: [
      '25 GB Cloud File Storage',
      'Up to 50 Active Clients',
      'Up to 25 Team Members',
      'Finance Hub, GST Invoices, SMM Tracker, HR & Vendors',
    ],
    enabledModules: {
      crm: true,
      clients: true,
      projects: true,
      tasks: true,
      portal: true,
      sop: true,
      finance: true,
      hr: true,
      attendance: true,
      smm: true,
      assets: true,
      proposals: true,
      reports: true,
      automations: false,
      influencers: true,
      ai: false,
    },
  },
  {
    id: 'pro',
    name: 'Enterprise Pro',
    tagline: 'High-storage multi-branch operations for scaling agencies',
    monthlyPriceInr: 6999,
    annualPriceInr: 67190,
    storageLimitMb: 102400,
    storageLabel: '100 GB Storage',
    maxUsers: 100,
    maxClients: 500,
    badge: 'Max Storage',
    features: [
      '100 GB Cloud File Storage',
      'Up to 500 Active Clients',
      'Up to 100 Team Members',
      'All Modules, Multi-Branch, Automations & Priority Support',
    ],
    enabledModules: {
      crm: true,
      clients: true,
      projects: true,
      tasks: true,
      portal: true,
      sop: true,
      finance: true,
      hr: true,
      attendance: true,
      smm: true,
      assets: true,
      proposals: true,
      reports: true,
      automations: true,
      influencers: true,
      ai: true,
    },
  },
];

const ORG_BILLING_PROJECTION =
  'name slug logo industry website phone email address gstNumber services plan billingCycle planStatus billingSetupRequired companySetupRequired enabledModules maxUsers maxClients storageLimitMb storageUsedBytes trialEndsAt settings paidAt';

export const getPlanById = (planId) =>
  SAAS_PLANS.find((p) => p.id === String(planId || '').toLowerCase().trim()) || null;

export const computePlanAmountPaise = (plan, billingCycle = 'monthly') => {
  const priceInr = billingCycle === 'annual' ? plan.annualPriceInr : plan.monthlyPriceInr;
  return Math.round(priceInr * 100);
};

const isPlaceholderRazorpayValue = (val) => {
  const s = String(val || '').trim();
  if (!s) return true;
  const lower = s.toLowerCase();
  return lower.includes('your_key_id') || lower.includes('your_razorpay_key_secret') || lower === 'changeme';
};

const getRazorpayKeys = () => {
  const rawId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const rawSecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (isPlaceholderRazorpayValue(rawId) || isPlaceholderRazorpayValue(rawSecret)) {
    return { keyId: '', keySecret: '' };
  }
  return { keyId: rawId, keySecret: rawSecret };
};

const getSandboxSecret = () =>
  process.env.JWT_SECRET || 'dev-only-change-me-access-secret';

export const verifyRazorpaySignature = ({ orderId, paymentId, signature, keySecret }) => {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const a = Buffer.from(String(expected), 'utf8');
  const b = Buffer.from(String(signature).trim(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const computeOrganizationUsage = async (orgId, orgDoc) => {
  if (!orgId) {
    return {
      clientCount: 0,
      userCount: 0,
      storageUsedBytes: 0,
      storageUsedMb: 0,
      storageLimitMb: orgDoc?.storageLimitMb || 100,
      maxClients: orgDoc?.maxClients || 3,
      maxUsers: orgDoc?.maxUsers || 2,
    };
  }

  const [clientCount, userCount, assetAgg] = await Promise.all([
    Client.countDocuments({ organizationId: orgId }),
    User.countDocuments({ organizationId: orgId }),
    Asset.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: null, totalBytes: { $sum: '$size' } } },
    ]).catch(() => []),
  ]);

  const assetBytes = assetAgg?.[0]?.totalBytes || 0;
  const storageUsedBytes = Math.max(assetBytes, orgDoc?.storageUsedBytes || 0);
  const storageUsedMb = Number((storageUsedBytes / (1024 * 1024)).toFixed(2));
  const planMeta = getPlanById(orgDoc?.plan);

  return {
    clientCount,
    userCount,
    storageUsedBytes,
    storageUsedMb,
    storageLimitMb: orgDoc?.storageLimitMb || planMeta?.storageLimitMb || 100,
    maxClients: orgDoc?.maxClients || planMeta?.maxClients || 3,
    maxUsers: orgDoc?.maxUsers || planMeta?.maxUsers || 2,
  };
};

// @desc    Public SaaS plans list for website Pricing page
// @route   GET /api/billing/public-plans
// @access  Public
export const getPublicBillingPlans = (_req, res) => {
  res.json({
    success: true,
    plans: SAAS_PLANS,
  });
};

// @desc    Get available SaaS plans, current plan & storage usage
// @route   GET /api/billing/plans
// @access  Private
export const getBillingPlans = async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayKeys();
    let organization = null;
    let usage = null;
    if (req.user?.organizationId) {
      organization = await Organization.findById(req.user.organizationId).select(ORG_BILLING_PROJECTION);
      usage = await computeOrganizationUsage(req.user.organizationId, organization);
    }

    res.json({
      success: true,
      plans: SAAS_PLANS,
      razorpayEnabled: Boolean(keyId && keySecret),
      razorpayKeyId: keyId || null,
      organization,
      usage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate Free plan or create a Razorpay order for paid plan / mid-cycle upgrade
// @route   POST /api/billing/razorpay/order
// @access  Private (organizationOwner, admin, superAdmin)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { planId, billingCycle = 'monthly' } = req.body || {};
    const plan = getPlanById(planId);
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
    }

    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
    const amount = computePlanAmountPaise(plan, cycle);

    // Zero-amount plans (if any promotional ₹0 tier) activate directly without payment gateway
    if (amount <= 0) {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, message: 'No workspace found for this account' });
      }
      const organization = await Organization.findByIdAndUpdate(
        req.user.organizationId,
        {
          $set: {
            plan: 'free',
            billingCycle: 'monthly',
            planStatus: 'active',
            billingSetupRequired: false,
            maxUsers: plan.maxUsers,
            maxClients: plan.maxClients,
            storageLimitMb: plan.storageLimitMb,
            enabledModules: plan.enabledModules,
            paidAt: new Date(),
            isActive: true,
          },
        },
        { new: true }
      ).select(ORG_BILLING_PROJECTION);

      return res.json({
        success: true,
        mode: 'free',
        planId: plan.id,
        planName: plan.name,
        billingCycle: 'monthly',
        amount: 0,
        currency: 'INR',
        message: 'Free Plan (100 MB Storage • Up to 3 Clients) activated!',
        organization,
        nextRoute: organization?.companySetupRequired ? '/settings?section=company' : '/',
      });
    }

    const receipt = `rwm_${String(req.user?.organizationId || req.user?._id).slice(-8)}_${Date.now().toString(36)}`;
    const { keyId, keySecret } = getRazorpayKeys();

    if (keyId && keySecret) {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt,
          notes: {
            userId: String(req.user._id),
            organizationId: String(req.user.organizationId || ''),
            planId: plan.id,
            billingCycle: cycle,
          },
        }),
      });
      const rzpOrder = await rzpRes.json();
      if (!rzpRes.ok || !rzpOrder?.id) {
        return res.status(502).json({
          success: false,
          message: rzpOrder?.error?.description || 'Failed to initiate Razorpay order',
        });
      }

      return res.json({
        success: true,
        mode: 'razorpay',
        keyId,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        planId: plan.id,
        planName: plan.name,
        billingCycle: cycle,
      });
    }

    // Signed test-mode order when Razorpay credentials are not yet configured in environment
    const orderId = `order_rwm_${crypto.randomBytes(6).toString('hex')}`;
    const sandboxToken = jwt.sign(
      {
        tokenType: 'razorpay_sandbox_order',
        orderId,
        userId: String(req.user._id),
        organizationId: String(req.user.organizationId || ''),
        planId: plan.id,
        billingCycle: cycle,
        amount,
      },
      getSandboxSecret(),
      { expiresIn: '30m' }
    );

    return res.json({
      success: true,
      mode: 'sandbox',
      keyId: null,
      orderId,
      sandboxToken,
      amount,
      currency: 'INR',
      planId: plan.id,
      planName: plan.name,
      billingCycle: cycle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment & activate/upgrade workspace subscription
// @route   POST /api/billing/razorpay/verify
// @access  Private (organizationOwner, admin, superAdmin)
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      planId,
      billingCycle = 'monthly',
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: rzpPaymentId,
      razorpay_signature: rzpSignature,
      sandboxToken,
    } = req.body || {};

    const plan = getPlanById(planId);
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
    }
    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';

    const { keyId, keySecret } = getRazorpayKeys();
    let verifiedOrderId = String(rzpOrderId || '').trim();
    let verifiedPaymentId = String(rzpPaymentId || '').trim();

    if (keyId && keySecret && !sandboxToken) {
      const ok = verifyRazorpaySignature({
        orderId: verifiedOrderId,
        paymentId: verifiedPaymentId,
        signature: rzpSignature,
        keySecret,
      });
      if (!ok) {
        return res.status(400).json({ success: false, message: 'Razorpay payment signature verification failed' });
      }
    } else {
      if (!sandboxToken) {
        return res.status(400).json({ success: false, message: 'Missing payment verification details' });
      }
      let decoded;
      try {
        decoded = jwt.verify(String(sandboxToken), getSandboxSecret());
      } catch {
        return res.status(400).json({ success: false, message: 'Payment session expired. Please try again.' });
      }
      if (
        decoded?.tokenType !== 'razorpay_sandbox_order' ||
        decoded.userId !== String(req.user._id) ||
        decoded.planId !== plan.id
      ) {
        return res.status(400).json({ success: false, message: 'Invalid Razorpay test order verification' });
      }
      verifiedOrderId = decoded.orderId;
      verifiedPaymentId = verifiedPaymentId || `pay_rwm_${crypto.randomBytes(6).toString('hex')}`;
    }

    if (!req.user?.organizationId) {
      return res.status(400).json({ success: false, message: 'No workspace found for this account' });
    }

    const organization = await Organization.findByIdAndUpdate(
      req.user.organizationId,
      {
        $set: {
          plan: plan.id,
          billingCycle: cycle,
          planStatus: 'active',
          billingSetupRequired: false,
          maxUsers: plan.maxUsers,
          maxClients: plan.maxClients,
          storageLimitMb: plan.storageLimitMb,
          enabledModules: plan.enabledModules,
          lastOrderId: verifiedOrderId,
          lastPaymentId: verifiedPaymentId,
          paidAt: new Date(),
          isActive: true,
        },
      },
      { new: true }
    ).select(ORG_BILLING_PROJECTION);

    return res.json({
      success: true,
      message: `${plan.name} plan (${plan.storageLabel}) activated successfully!`,
      organization,
      nextRoute: organization?.companySetupRequired ? '/settings?section=company' : '/',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
