import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Organization from '../models/organization.model.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import Asset from '../models/asset.model.js';
import SaasPayment from '../models/saasPayment.model.js';

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
    tagline: 'Complete AgencyUpscale suite with Finance, SMM Tracker & HR',
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
  'name slug logo logoSize industry website phone email address gstNumber services plan billingCycle planStatus billingSetupRequired companySetupRequired enabledModules maxUsers maxClients storageLimitMb storageUsedBytes trialEndsAt settings paidAt';

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

const extractPayerContext = (req, org, body = {}) => ({
  payerName: String(body.payerName || body.name || req.user?.name || '').trim(),
  payerEmail: String(body.payerEmail || body.email || req.user?.email || '').trim().toLowerCase(),
  contactNumber: String(body.contactNumber || body.phone || req.user?.phone || org?.phone || '').trim(),
  companyName: String(org?.name || body.companyName || '').trim(),
  companySlug: String(org?.slug || '').trim(),
});

const saveSaasPaymentRecord = async ({ orderId, updateFields, defaults }) => {
  try {
    if (orderId) {
      const updated = await SaasPayment.findOneAndUpdate(
        { razorpayOrderId: String(orderId).trim() },
        { $set: updateFields },
        { new: true }
      );
      if (updated) return updated;
    }
    return await SaasPayment.create({
      ...defaults,
      ...updateFields,
      razorpayOrderId: String(orderId || defaults?.razorpayOrderId || '').trim(),
    });
  } catch (err) {
    console.warn('[SaasPayment Log Warning]:', err.message);
    return null;
  }
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

// @desc    Get available SaaS plans (only for newly registering companies / superAdmin)
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

    const canSelectPlans = Boolean(organization?.billingSetupRequired) || req.user?.role === 'superAdmin';

    res.json({
      success: true,
      plans: canSelectPlans ? SAAS_PLANS : [],
      canSelectPlans,
      razorpayEnabled: canSelectPlans ? Boolean(keyId && keySecret) : false,
      razorpayKeyId: canSelectPlans ? keyId || null : null,
      organization,
      usage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate Free plan or create a Razorpay order for newly registering company
// @route   POST /api/billing/razorpay/order
// @access  Private (organizationOwner during onboarding, superAdmin, admin during onboarding)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { planId, billingCycle = 'monthly' } = req.body || {};
    const plan = getPlanById(planId);
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
    }

    const existingOrg = req.user?.organizationId
      ? await Organization.findById(req.user.organizationId).select(ORG_BILLING_PROJECTION)
      : null;

    if (req.user?.role !== 'superAdmin' && existingOrg && !existingOrg.billingSetupRequired) {
      return res.status(403).json({
        success: false,
        message: 'Plans are only available for new companies during initial registration.',
      });
    }

    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
    const amount = computePlanAmountPaise(plan, cycle);
    const amountInr = Math.round(amount / 100);
    const payer = extractPayerContext(req, existingOrg, req.body);

    // Zero-amount plans (Free tier) activate directly without payment gateway
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

      await saveSaasPaymentRecord({
        defaults: {
          organizationId: organization?._id,
          userId: req.user._id,
          ...payer,
          planId: plan.id,
          planName: plan.name,
          billingCycle: 'monthly',
          amountPaise: 0,
          amountInr: 0,
          currency: 'INR',
          gateway: 'free',
        },
        updateFields: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

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
            payerName: payer.payerName,
            contactNumber: payer.contactNumber,
            planId: plan.id,
            billingCycle: cycle,
          },
        }),
      });
      const rzpOrder = await rzpRes.json();
      if (!rzpRes.ok || !rzpOrder?.id) {
        const errMsg = rzpOrder?.error?.description || 'Failed to initiate Razorpay order';
        await saveSaasPaymentRecord({
          defaults: {
            organizationId: req.user.organizationId,
            userId: req.user._id,
            ...payer,
            planId: plan.id,
            planName: plan.name,
            billingCycle: cycle,
            amountPaise: amount,
            amountInr,
            currency: 'INR',
            gateway: 'razorpay',
          },
          updateFields: {
            status: 'failed',
            failureCode: String(rzpOrder?.error?.code || 'ORDER_CREATE_FAILED'),
            failureReason: errMsg,
            failureSource: 'razorpay_order_api',
            failedAt: new Date(),
            failureMetadata: rzpOrder?.error || null,
          },
        });
        return res.status(502).json({
          success: false,
          message: errMsg,
        });
      }

      await saveSaasPaymentRecord({
        orderId: rzpOrder.id,
        defaults: {
          organizationId: req.user.organizationId,
          userId: req.user._id,
          ...payer,
          planId: plan.id,
          planName: plan.name,
          billingCycle: cycle,
          amountPaise: amount,
          amountInr,
          currency: rzpOrder.currency || 'INR',
          gateway: 'razorpay',
        },
        updateFields: {
          ...payer,
          status: 'created',
        },
      });

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
    await saveSaasPaymentRecord({
      orderId,
      defaults: {
        organizationId: req.user.organizationId,
        userId: req.user._id,
        ...payer,
        planId: plan.id,
        planName: plan.name,
        billingCycle: cycle,
        amountPaise: amount,
        amountInr,
        currency: 'INR',
        gateway: 'sandbox',
      },
      updateFields: {
        ...payer,
        status: 'created',
      },
    });

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
// @access  Private (organizationOwner during onboarding, superAdmin, admin)
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
    const amountPaise = computePlanAmountPaise(plan, cycle);
    const amountInr = Math.round(amountPaise / 100);

    const existingOrg = req.user?.organizationId
      ? await Organization.findById(req.user.organizationId).select(ORG_BILLING_PROJECTION)
      : null;

    if (req.user?.role !== 'superAdmin' && existingOrg && !existingOrg.billingSetupRequired) {
      return res.status(403).json({
        success: false,
        message: 'Plans are only available for new companies during initial registration.',
      });
    }

    const payer = extractPayerContext(req, existingOrg, req.body);
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
        await saveSaasPaymentRecord({
          orderId: verifiedOrderId,
          defaults: {
            organizationId: req.user.organizationId,
            userId: req.user._id,
            ...payer,
            planId: plan.id,
            planName: plan.name,
            billingCycle: cycle,
            amountPaise,
            amountInr,
            currency: 'INR',
            gateway: 'razorpay',
          },
          updateFields: {
            ...payer,
            razorpayPaymentId: verifiedPaymentId,
            status: 'failed',
            failureCode: 'SIGNATURE_MISMATCH',
            failureReason: 'Razorpay payment signature verification failed',
            failureSource: 'server_verify',
            failedAt: new Date(),
          },
        });
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
        await saveSaasPaymentRecord({
          orderId: verifiedOrderId,
          defaults: {
            organizationId: req.user.organizationId,
            userId: req.user._id,
            ...payer,
            planId: plan.id,
            planName: plan.name,
            billingCycle: cycle,
            amountPaise,
            amountInr,
            currency: 'INR',
            gateway: 'sandbox',
          },
          updateFields: {
            ...payer,
            status: 'failed',
            failureCode: 'SESSION_EXPIRED',
            failureReason: 'Payment session expired. Please try again.',
            failureSource: 'server_verify',
            failedAt: new Date(),
          },
        });
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

    await saveSaasPaymentRecord({
      orderId: verifiedOrderId,
      defaults: {
        organizationId: organization?._id || req.user.organizationId,
        userId: req.user._id,
        ...payer,
        planId: plan.id,
        planName: plan.name,
        billingCycle: cycle,
        amountPaise,
        amountInr,
        currency: 'INR',
        gateway: keyId && keySecret && !sandboxToken ? 'razorpay' : 'sandbox',
      },
      updateFields: {
        ...payer,
        companyName: organization?.name || payer.companyName,
        companySlug: organization?.slug || payer.companySlug,
        razorpayPaymentId: verifiedPaymentId,
        razorpaySignature: String(rzpSignature || '').trim(),
        status: 'paid',
        failureCode: '',
        failureReason: '',
        paidAt: new Date(),
      },
    });

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

// @desc    Record Razorpay failed / cancelled checkout event with payer name & contact number
// @route   POST /api/billing/razorpay/failure
// @access  Private (organizationOwner, superAdmin, admin)
export const recordRazorpayFailure = async (req, res) => {
  try {
    const {
      planId,
      billingCycle = 'monthly',
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: rzpPaymentId,
      code,
      description,
      source,
      step,
      reason,
      status = 'failed',
      metadata,
    } = req.body || {};

    const plan = getPlanById(planId);
    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
    const amountPaise = plan ? computePlanAmountPaise(plan, cycle) : 0;
    const amountInr = Math.round(amountPaise / 100);

    const org = req.user?.organizationId
      ? await Organization.findById(req.user.organizationId).select('name slug phone').lean()
      : null;

    const payer = extractPayerContext(req, org, req.body);
    const nextStatus = status === 'cancelled' ? 'cancelled' : 'failed';
    const resolvedReason = String(
      description || reason || (nextStatus === 'cancelled' ? 'Checkout dismissed by user' : 'Payment failed on Razorpay')
    ).trim();

    const record = await saveSaasPaymentRecord({
      orderId: String(rzpOrderId || '').trim(),
      defaults: {
        organizationId: req.user?.organizationId || null,
        userId: req.user?._id || null,
        ...payer,
        planId: plan?.id || String(planId || 'unknown').toLowerCase(),
        planName: plan?.name || String(planId || 'Unknown Plan'),
        billingCycle: cycle,
        amountPaise,
        amountInr,
        currency: 'INR',
        gateway: 'razorpay',
      },
      updateFields: {
        ...payer,
        razorpayPaymentId: String(rzpPaymentId || '').trim(),
        status: nextStatus,
        failureCode: String(code || '').trim(),
        failureReason: resolvedReason,
        failureSource: String(source || 'razorpay_checkout').trim(),
        failureStep: String(step || '').trim(),
        failureMetadata: metadata || null,
        failedAt: new Date(),
      },
    });

    res.json({ success: true, payment: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay server-side webhook handler (captures payment.failed & payment.captured)
// @route   POST /api/billing/razorpay/webhook
// @access  Public (verified by RAZORPAY_WEBHOOK_SECRET when configured)
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = String(process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
    const signature = String(req.headers['x-razorpay-signature'] || '').trim();

    if (webhookSecret) {
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Missing Razorpay webhook signature' });
      }
      const payloadStr = JSON.stringify(req.body || {});
      const expected = crypto.createHmac('sha256', webhookSecret).update(payloadStr).digest('hex');
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(signature, 'utf8');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const entity = req.body?.payload?.payment?.entity;
    if (!entity || !['payment.failed', 'payment.captured'].includes(event)) {
      return res.json({ success: true, ignored: true });
    }

    const orderId = String(entity.order_id || '').trim();
    const paymentId = String(entity.id || '').trim();
    const notes = entity.notes || {};
    const orgId = notes.organizationId || null;
    const userId = notes.userId || null;

    const [orgDoc, userDoc] = await Promise.all([
      orgId ? Organization.findById(orgId).select('name slug phone').lean().catch(() => null) : null,
      userId ? User.findById(userId).select('name email phone').lean().catch(() => null) : null,
    ]);

    const plan = getPlanById(notes.planId);
    const amountPaise = Number(entity.amount || (plan ? computePlanAmountPaise(plan, notes.billingCycle || 'monthly') : 0));
    const amountInr = Math.round(amountPaise / 100);

    const payerFields = {
      payerName: String(notes.payerName || userDoc?.name || '').trim(),
      payerEmail: String(entity.email || userDoc?.email || '').trim().toLowerCase(),
      contactNumber: String(entity.contact || notes.contactNumber || userDoc?.phone || orgDoc?.phone || '').trim(),
      companyName: String(orgDoc?.name || '').trim(),
      companySlug: String(orgDoc?.slug || '').trim(),
    };

    if (event === 'payment.failed') {
      await saveSaasPaymentRecord({
        orderId,
        defaults: {
          organizationId: orgDoc?._id || orgId || undefined,
          userId: userDoc?._id || userId || undefined,
          ...payerFields,
          planId: plan?.id || String(notes.planId || 'unknown').toLowerCase(),
          planName: plan?.name || String(notes.planId || 'Plan'),
          billingCycle: notes.billingCycle === 'annual' ? 'annual' : 'monthly',
          amountPaise,
          amountInr,
          currency: entity.currency || 'INR',
          gateway: 'razorpay',
        },
        updateFields: {
          ...payerFields,
          razorpayPaymentId: paymentId,
          status: 'failed',
          failureCode: String(entity.error_code || '').trim(),
          failureReason: String(entity.error_description || entity.error_reason || 'Payment failed on Razorpay').trim(),
          failureSource: String(entity.error_source || 'razorpay_webhook').trim(),
          failureStep: String(entity.error_step || '').trim(),
          failedAt: new Date(),
        },
      });
    } else if (event === 'payment.captured') {
      await saveSaasPaymentRecord({
        orderId,
        defaults: {
          organizationId: orgDoc?._id || orgId || undefined,
          userId: userDoc?._id || userId || undefined,
          ...payerFields,
          planId: plan?.id || String(notes.planId || 'unknown').toLowerCase(),
          planName: plan?.name || String(notes.planId || 'Plan'),
          billingCycle: notes.billingCycle === 'annual' ? 'annual' : 'monthly',
          amountPaise,
          amountInr,
          currency: entity.currency || 'INR',
          gateway: 'razorpay',
        },
        updateFields: {
          ...payerFields,
          razorpayPaymentId: paymentId,
          status: 'paid',
          paidAt: new Date(),
        },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
