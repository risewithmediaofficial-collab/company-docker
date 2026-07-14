// =============================================
// PAYMENT REQUEST CONTROLLER
// ─────────────────────────────────────────────
// QR-based manual payment verification system.
//
// RAZORPAY RESTORATION GUIDE:
//   When Razorpay Live Mode is fixed:
//   1. Create razorpay.controller.js with the
//      Razorpay checkout + webhook handlers.
//   2. Register its routes in index.js.
//   3. Replace the QR modal with Razorpay checkout
//      in QRPaymentModal.jsx (or delete it).
//   4. The approval logic here (activateSubscription)
//      can be reused for Razorpay webhook success too.
// =============================================

import PaymentRequest from '../models/paymentRequest.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import { createNotification } from '../utils/notification.js';
import { sendEmail } from '../utils/email.js';

// ─── Plan → Organization Plan Mapping ────────────────────────────────────────
// Maps granular plan names to the Organization.subscriptionPlan enum values.
// Update this map when you add more plan tiers to the Organization model.
const PLAN_TO_ORG_MAP = {
  Starter: 'free',
  Basic: 'free',
  Professional: 'pro',
  Premium: 'pro',
  Enterprise: 'enterprise',
};

// ─── Shared: Activate Subscription ──────────────────────────────────────────
/**
 * Core subscription activation logic.
 * Called by approvePaymentRequest (QR flow).
 * This same function can be called from a future Razorpay webhook handler.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.approvedPlan - Plan name from PLANS enum
 * @param {Date}   params.expiryDate
 * @param {number} params.subscriptionDuration - months
 */
export const activateSubscription = async ({ userId, approvedPlan, expiryDate, subscriptionDuration }) => {
  const orgPlanValue = PLAN_TO_ORG_MAP[approvedPlan] || 'free';

  // Update or create organization record for this user
  let org = await Organization.findOne({ ownerId: userId });
  if (org) {
    org.subscriptionPlan = orgPlanValue;
    org.isActive = true;
    await org.save();
  } else {
    // Create a basic organization if none exists
    const user = await User.findById(userId).select('name');
    await Organization.create({
      name: user?.name || 'My Organization',
      ownerId: userId,
      subscriptionPlan: orgPlanValue,
      isActive: true,
    });
  }
};

// ─── Submit Payment Request ──────────────────────────────────────────────────
// @route  POST /api/payment-requests
// @access Private
export const submitPaymentRequest = async (req, res) => {
  try {
    const { selectedPlan, amountPaid, transactionId, paymentMethod, paymentDate, phone, screenshot } = req.body;

    if (!selectedPlan || !amountPaid || !transactionId || !paymentMethod || !paymentDate || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    const paymentRequest = await PaymentRequest.create({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone,
      selectedPlan,
      amountPaid: Number(amountPaid),
      transactionId: transactionId.trim(),
      paymentMethod,
      paymentDate: new Date(paymentDate),
      screenshot: screenshot || '',
      status: 'pending',
    });

    // Notify all superAdmins
    const io = req.app.get('io');
    const admins = await User.find({ role: 'superAdmin', isActive: true }).select('_id');
    await Promise.all(
      admins.map((admin) =>
        createNotification(
          {
            recipient: admin._id,
            sender: req.user._id,
            type: 'system',
            title: 'New Payment Request',
            message: `${req.user.name} submitted a payment request for ${selectedPlan} plan (₹${amountPaid}).`,
            link: '/admin/payment-requests',
          },
          io
        )
      )
    );

    // Email admins (silent fail if SMTP not configured)
    try {
      const adminUsers = await User.find({ role: 'superAdmin', isActive: true }).select('email');
      await Promise.all(
        adminUsers.map((admin) =>
          sendEmail({
            to: admin.email,
            subject: `New Payment Request — ${req.user.name} (${selectedPlan})`,
            html: `
              <h2>New Payment Request Submitted</h2>
              <p><strong>User:</strong> ${req.user.name} (${req.user.email})</p>
              <p><strong>Plan:</strong> ${selectedPlan}</p>
              <p><strong>Amount Paid:</strong> ₹${amountPaid}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Payment Date:</strong> ${new Date(paymentDate).toLocaleDateString('en-IN')}</p>
              <p>Please review and approve or reject this request in the admin panel.</p>
            `,
          })
        )
      );
    } catch (_emailErr) {
      // Silent fail — SMTP may not be configured
    }

    res.status(201).json({ success: true, message: 'Payment request submitted successfully', paymentRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get User's Payment Requests ─────────────────────────────────────────────
// @route  GET /api/payment-requests/user
// @access Private
export const getUserPaymentRequests = async (req, res) => {
  try {
    const requests = await PaymentRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, paymentRequests: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Payment Requests (Admin) ────────────────────────────────────────
// @route  GET /api/payment-requests/admin
// @access Private — superAdmin
export const getAllPaymentRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const requests = await PaymentRequest.find(filter)
      .populate('userId', 'name email role avatar')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await PaymentRequest.countDocuments(filter);

    res.json({ success: true, paymentRequests: requests, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Approve Payment Request (Admin) ─────────────────────────────────────────
// @route  PUT /api/payment-requests/:id/approve
// @access Private — superAdmin
export const approvePaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedPlan, subscriptionDuration = 1, expiryDate, adminNotes } = req.body;

    if (!approvedPlan) {
      return res.status(400).json({ success: false, message: 'Approved plan is required' });
    }

    const paymentRequest = await PaymentRequest.findById(id);
    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${paymentRequest.status}` });
    }

    // Calculate expiry date if not provided
    const approvedAt = new Date();
    const computedExpiry = expiryDate
      ? new Date(expiryDate)
      : new Date(approvedAt.getTime() + subscriptionDuration * 30 * 24 * 60 * 60 * 1000);

    // Update payment request
    paymentRequest.status = 'approved';
    paymentRequest.approvedPlan = approvedPlan;
    paymentRequest.approvedAt = approvedAt;
    paymentRequest.expiryDate = computedExpiry;
    paymentRequest.subscriptionDuration = Number(subscriptionDuration);
    paymentRequest.adminNotes = adminNotes || '';
    paymentRequest.approvedBy = req.user._id;
    await paymentRequest.save();

    // ─── ACTIVATE SUBSCRIPTION ───────────────────────────────────────────
    // This is the core activation logic — reuse this same call in the
    // future Razorpay webhook handler (razorpay.controller.js) when restoring.
    await activateSubscription({
      userId: paymentRequest.userId,
      approvedPlan,
      expiryDate: computedExpiry,
      subscriptionDuration: Number(subscriptionDuration),
    });
    // ─────────────────────────────────────────────────────────────────────

    // Notify the user
    const io = req.app.get('io');
    await createNotification(
      {
        recipient: paymentRequest.userId,
        sender: req.user._id,
        type: 'approval_done',
        title: 'Payment Approved! 🎉',
        message: `Your payment for ${approvedPlan} plan has been approved. Your subscription is now active until ${computedExpiry.toLocaleDateString('en-IN')}.`,
        link: '/payment-history',
      },
      io
    );

    // Email the user (silent fail)
    try {
      const user = await User.findById(paymentRequest.userId).select('email name');
      if (user) {
        await sendEmail({
          to: user.email,
          subject: `Payment Approved — ${approvedPlan} Plan Activated`,
          html: `
            <h2>Your Payment Has Been Approved! 🎉</h2>
            <p>Hi ${user.name},</p>
            <p>Your payment request has been reviewed and approved.</p>
            <p><strong>Approved Plan:</strong> ${approvedPlan}</p>
            <p><strong>Subscription Active Until:</strong> ${computedExpiry.toLocaleDateString('en-IN')}</p>
            ${adminNotes ? `<p><strong>Note from Admin:</strong> ${adminNotes}</p>` : ''}
            <p>Thank you for choosing Rise With Media!</p>
          `,
        });
      }
    } catch (_emailErr) {
      // Silent fail
    }

    const populated = await PaymentRequest.findById(id).populate('userId', 'name email').populate('approvedBy', 'name');
    res.json({ success: true, message: 'Payment request approved and subscription activated', paymentRequest: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reject Payment Request (Admin) ──────────────────────────────────────────
// @route  PUT /api/payment-requests/:id/reject
// @access Private — superAdmin
export const rejectPaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    const paymentRequest = await PaymentRequest.findById(id);
    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${paymentRequest.status}` });
    }

    paymentRequest.status = 'rejected';
    paymentRequest.rejectionReason = rejectionReason || '';
    paymentRequest.adminNotes = adminNotes || '';
    paymentRequest.approvedBy = req.user._id; // admin who acted
    await paymentRequest.save();

    // Notify the user
    const io = req.app.get('io');
    await createNotification(
      {
        recipient: paymentRequest.userId,
        sender: req.user._id,
        type: 'system',
        title: 'Payment Request Rejected',
        message: `Your payment request for ${paymentRequest.selectedPlan} plan was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please contact support for details.'}`,
        link: '/payment-history',
      },
      io
    );

    // Email the user (silent fail)
    try {
      const user = await User.findById(paymentRequest.userId).select('email name');
      if (user) {
        await sendEmail({
          to: user.email,
          subject: `Payment Request Update — Action Required`,
          html: `
            <h2>Payment Request Not Approved</h2>
            <p>Hi ${user.name},</p>
            <p>Unfortunately, your payment request for the <strong>${paymentRequest.selectedPlan}</strong> plan could not be approved at this time.</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
            ${adminNotes ? `<p><strong>Note:</strong> ${adminNotes}</p>` : ''}
            <p>Please contact our support team if you have any questions.</p>
          `,
        });
      }
    } catch (_emailErr) {
      // Silent fail
    }

    res.json({ success: true, message: 'Payment request rejected', paymentRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
