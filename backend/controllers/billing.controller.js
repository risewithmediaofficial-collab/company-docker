import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Organization from '../models/organization.model.js';

export const SAAS_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For lean creative teams launching their agency workspace',
    monthlyPriceInr: 1999,
    annualPriceInr: 19190,
    maxUsers: 5,
    maxClients: 15,
    badge: 'Essential',
    features: [
      'Up to 5 team members & 15 active clients',
      'CRM Leads, Projects & Task Pipeline',
      'Client Portal & 1-Tap Approvals',
      'SOP Library & Basic Reports',
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
      proposals: false,
      reports: true,
      automations: false,
      influencers: false,
      ai: false,
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Full operations for scaling digital marketing agencies',
    monthlyPriceInr: 4999,
    annualPriceInr: 47990,
    maxUsers: 25,
    maxClients: 75,
    badge: 'Most Popular',
    features: [
      'Up to 25 team members & 75 active clients',
      'Full Finance Hub, GST Invoices & Razorpay Receipts',
      'SMM Monthly Tracker & Content Calendar',
      'HR, Attendance, Vendors & Proposals',
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
    tagline: 'Unlimited power for multi-branch agencies & partners',
    monthlyPriceInr: 9999,
    annualPriceInr: 95990,
    maxUsers: 100,
    maxClients: 500,
    badge: 'All Features',
    features: [
      'Up to 100 team members & 500 clients',
      'Everything in Growth + Automations & Multi-Branch',
      'Client Password Vault & Dedicated SLA',
      'Priority WhatsApp & Account Support',
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

export const getPlanById = (planId) =>
  SAAS_PLANS.find((p) => p.id === String(planId || '').toLowerCase().trim()) || null;

export const computePlanAmountPaise = (plan, billingCycle = 'monthly') => {
  const priceInr = billingCycle === 'annual' ? plan.annualPriceInr : plan.monthlyPriceInr;
  return Math.round(priceInr * 100);
};

const getRazorpayKeys = () => ({
  keyId: String(process.env.RAZORPAY_KEY_ID || '').trim(),
  keySecret: String(process.env.RAZORPAY_KEY_SECRET || '').trim(),
});

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

// @desc    Get available SaaS plans & Razorpay status
// @route   GET /api/billing/plans
// @access  Private
export const getBillingPlans = async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayKeys();
    let organization = null;
    if (req.user?.organizationId) {
      organization = await Organization.findById(req.user.organizationId).select(
        'name slug plan billingCycle planStatus billingSetupRequired companySetupRequired maxUsers maxClients paidAt'
      );
    }

    res.json({
      success: true,
      plans: SAAS_PLANS,
      razorpayEnabled: Boolean(keyId && keySecret),
      razorpayKeyId: keyId || null,
      organization,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a Razorpay order for workspace plan activation
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

// @desc    Verify Razorpay payment & activate workspace subscription
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
          enabledModules: plan.enabledModules,
          lastOrderId: verifiedOrderId,
          lastPaymentId: verifiedPaymentId,
          paidAt: new Date(),
          isActive: true,
        },
      },
      { new: true }
    ).select(
      'name slug logo industry website phone email address gstNumber services plan billingCycle planStatus billingSetupRequired companySetupRequired enabledModules maxUsers maxClients trialEndsAt settings paidAt'
    );

    return res.json({
      success: true,
      message: `${plan.name} plan activated successfully via Razorpay!`,
      organization,
      nextRoute: organization?.companySetupRequired ? '/settings?section=company' : '/',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
