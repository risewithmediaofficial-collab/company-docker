// =============================================
// REFERRAL CONTROLLER
// =============================================

import Referral from '../models/referral.model.js';
import Lead from '../models/lead.model.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import { createNotification } from '../utils/notification.js';
import { createActivityLog } from '../utils/activity.js';

const normalizeLeadPayload = (body = {}) => ({
  name: body.name?.trim(),
  email: body.email?.trim()?.toLowerCase(),
  phone: body.phone?.trim(),
  company: body.company?.trim(),
  notes: body.notes || '',
  source: 'referral',
  referredBy: body.referredBy,
  assignedTo: body.assignedTo || undefined,
  value: Number(body.dealValue || body.value || 0) || 0,
  priority: body.priority || 'medium',
});

const getClientForUser = async (userId) => Client.findOne({ userId }).select('_id name company');

export const getReferrals = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'referral') {
      filter.referrer = req.user._id;
      filter.referrerModel = 'User';
    } else if (req.user.role === 'client') {
      const client = await getClientForUser(req.user._id);
      filter.client = client?._id || null;
    }

    const referrals = await Referral.find(filter)
      .populate('referrer', 'name email referralCode')
      .populate('lead', 'name email company stage')
      .populate('client', 'name email company status')
      .sort({ createdAt: -1 });

    const totalEarnings = referrals.reduce((sum, referral) => sum + Number(referral.commissionAmount || 0), 0);
    const totalPaidOut = referrals.reduce((sum, referral) => sum + Number(referral.totalPaid || 0), 0);
    const pendingEarnings = referrals.reduce(
      (sum, referral) => sum + Math.max(Number(referral.commissionAmount || 0) - Number(referral.totalPaid || 0), 0),
      0,
    );
    const converted = referrals.filter((referral) => ['converted', 'approved', 'paid'].includes(referral.status)).length;
    const conversionRate = referrals.length ? Number(((converted / referrals.length) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      referrals,
      totalEarnings,
      pendingEarnings,
      totalPaidOut,
      conversionRate,
      stats: {
        totalEarnings,
        pendingEarnings,
        totalPaidOut,
        conversionRate,
        totalReferrals: referrals.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitReferralLead = async (req, res) => {
  try {
    const leadPayload = normalizeLeadPayload({ ...req.body, referredBy: req.user._id });
    if (!leadPayload.name || !leadPayload.email) {
      return res.status(400).json({ success: false, message: 'Lead name and email are required' });
    }

    const lead = await Lead.create(leadPayload);
    lead.activities.push({
      type: 'note',
      description: `Lead submitted by referral partner ${req.user.name}`,
      performedBy: req.user._id,
    });
    await lead.save();

    const referral = await Referral.create({
      referrer: req.user._id,
      referrerModel: 'User',
      lead: lead._id,
      referralCode: req.user.referralCode || `REF-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      commissionType: req.body.commissionType || 'percentage',
      commissionRate: Number(req.body.commissionRate || 10) || 10,
      monthlyAmount: Number(req.body.monthlyAmount || 0) || 0,
      dealValue: Number(req.body.dealValue || lead.value || 0) || 0,
      notes: req.body.notes || '',
    });

    const managers = await User.find({ role: { $in: ['superAdmin', 'manager'] }, isActive: true })
      .select('_id')
      .limit(10);
    const io = req.app.get('io');

    await Promise.all(managers.map((manager) => createNotification({
      recipient: manager._id,
      sender: req.user._id,
      type: 'lead_assigned',
      title: 'New referral lead submitted',
      message: `${req.user.name} submitted ${lead.name} as a referral lead.`,
      link: '/crm/leads',
      metadata: { leadId: lead._id, referralId: referral._id },
    }, io)));

    await createActivityLog({
      actor: req.user,
      action: 'referral.submitted',
      entityType: 'referral',
      entityId: referral._id,
      title: 'Referral submitted',
      description: `${lead.name} was submitted as a referral lead.`,
      metadata: { leadId: lead._id, commissionType: referral.commissionType },
    });

    const populated = await Referral.findById(referral._id)
      .populate('referrer', 'name email referralCode')
      .populate('lead', 'name email company stage');

    res.status(201).json({ success: true, referral: populated, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const requestPayout = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, message: 'Referral not found' });
    if (referral.referrer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payableAmount = Math.max(Number(referral.commissionAmount || 0) - Number(referral.totalPaid || 0), 0);
    if (payableAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No available payout balance for this referral' });
    }

    referral.payoutRequest = {
      requestedAt: new Date(),
      method: req.body.method,
      accountDetails: req.body.accountDetails,
      status: 'pending',
    };
    await referral.save();

    const managers = await User.find({ role: { $in: ['superAdmin', 'manager'] }, isActive: true })
      .select('_id')
      .limit(10);

    await Promise.all(managers.map((manager) => createNotification({
      recipient: manager._id,
      sender: req.user._id,
      type: 'general',
      title: 'Referral payout requested',
      message: `${req.user.name} requested a payout of ₹${payableAmount.toFixed(2)}.`,
      link: '/referral',
      metadata: { referralId: referral._id, payableAmount },
    }, req.app.get('io'))));

    await createActivityLog({
      actor: req.user,
      action: 'referral.payout.requested',
      entityType: 'referral',
      entityId: referral._id,
      title: 'Payout requested',
      description: `A referral payout request was submitted.`,
      metadata: { payableAmount, method: req.body.method },
    });

    res.json({ success: true, referral, payableAmount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processPayout = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id).populate('referrer', 'name');
    if (!referral) return res.status(404).json({ success: false, message: 'Referral not found' });

    const outstanding = Math.max(Number(referral.commissionAmount || 0) - Number(referral.totalPaid || 0), 0);
    const amountPaid = Number(req.body.amount) || outstanding;
    if (amountPaid <= 0 || amountPaid > outstanding) {
      return res.status(400).json({ success: false, message: 'Invalid payout amount' });
    }

    referral.totalPaid = Number(referral.totalPaid || 0) + amountPaid;
    referral.isPaid = referral.totalPaid >= Number(referral.commissionAmount || 0);
    referral.paidAt = new Date();
    referral.status = referral.isPaid ? 'paid' : 'approved';
    referral.payoutRequest = {
      ...(referral.payoutRequest || {}),
      status: 'paid',
    };
    await referral.save();

    if (referral.referrer?._id) {
      await createNotification({
        recipient: referral.referrer._id,
        sender: req.user._id,
        type: 'general',
        title: 'Referral payout processed',
        message: `A payout of ₹${amountPaid.toFixed(2)} has been processed for your referral.`,
        link: '/referral',
        metadata: { referralId: referral._id, amountPaid },
      }, req.app.get('io'));
    }

    await createActivityLog({
      actor: req.user,
      action: 'referral.payout.processed',
      entityType: 'referral',
      entityId: referral._id,
      title: 'Payout processed',
      description: `A referral payout was processed.`,
      metadata: { amountPaid, totalPaid: referral.totalPaid },
    });

    res.json({ success: true, referral, amountPaid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
