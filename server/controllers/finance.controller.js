// =============================================
// FINANCE CONTROLLER - Invoices, Payments & Expenses
// =============================================

import Invoice from '../models/invoice.model.js';
import Expense from '../models/expense.model.js';
import FinanceEntry from '../models/financeEntry.model.js';
import Referral from '../models/referral.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import Payment from '../models/payment.model.js';
import { createNotification } from '../utils/notification.js';
import { sendEmail } from '../utils/email.js';
import { createActivityLog } from '../utils/activity.js';

const invoiceStatusMap = {
  Draft: 'draft',
  Sent: 'sent',
  Pending: 'sent',
  Paid: 'paid',
  Overdue: 'overdue',
  Cancelled: 'cancelled',
};

const invoiceStatusLabels = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

const normalizeStatus = (value = '') => invoiceStatusMap[value] || value.toString().toLowerCase();

const serializeInvoice = (invoice) => {
  const item = invoice?.toObject ? invoice.toObject() : invoice;
  if (!item) return null;

  return {
    ...item,
    amount: item.total,
    description: item.lineItems?.[0]?.description || item.notes || '',
    status: invoiceStatusLabels[item.status] || item.status,
  };
};

const normalizeFinanceEntryPayload = (body = {}) => ({
  ...body,
  amount: Number(body.amount) || 0,
  type: body.type || 'Expense',
  status: body.status || 'Completed',
});

const buildInvoicePayload = (body = {}) => {
  const amount = Number(body.amount || body.total || 0);
  const payload = {
    ...body,
    status: normalizeStatus(body.status || 'draft'),
    taxRate: Number(body.taxRate) || 0,
    discount: Number(body.discount) || 0,
    paidAmount: Number(body.paidAmount) || 0,
  };

  if (!payload.invoiceNumber?.trim()) delete payload.invoiceNumber;

  payload.lineItems = Array.isArray(body.lineItems) && body.lineItems.length
    ? body.lineItems.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    }))
    : [{
      description: body.description || 'Professional services',
      quantity: 1,
      unitPrice: amount,
    }];

  return payload;
};

const getClientForUser = async (userId) => Client.findOne({ userId }).select('_id name company assignedManager');

const applyClientInvoiceScope = async (req, filter = {}) => {
  if (req.user.role !== 'client') return filter;

  const client = await getClientForUser(req.user._id);
  if (!client) return { ...filter, _id: null };

  return { ...filter, client: client._id };
};

const assertInvoiceAccess = async (req, invoice) => {
  if (!invoice) return { allowed: false, status: 404, message: 'Invoice not found' };
  if (req.user.role === 'superAdmin') return { allowed: true };
  if (req.user.role === 'manager') return { allowed: true };

  if (req.user.role === 'client') {
    const client = await getClientForUser(req.user._id);
    if (client && invoice.client?.toString() === client._id.toString()) {
      return { allowed: true };
    }

    return { allowed: false, status: 403, message: 'Access denied' };
  }

  return { allowed: false, status: 403, message: 'Access denied' };
};

const recordPayment = async ({
  invoice,
  amount,
  method,
  reference,
  notes,
  recordedBy,
}) => Payment.create({
  invoice: invoice._id,
  client: invoice.client,
  project: invoice.project,
  amount,
  currency: invoice.currency || 'USD',
  status: 'paid',
  method: method || 'manual',
  reference: reference || '',
  paidAt: invoice.paidDate || new Date(),
  recordedBy,
  notes: notes || '',
});

const maybeCreateReferralEarning = async ({ invoice, io }) => {
  const referral = await Referral.findOne({
    client: invoice.client,
    status: { $in: ['qualified', 'converted', 'approved'] },
  }).populate('referrer', 'name email');

  if (!referral) return null;

  let earnedAmount = 0;

  if (referral.commissionType === 'monthly') {
    earnedAmount = Number(referral.monthlyAmount || 0);
    referral.commissionAmount = Number(referral.commissionAmount || 0) + earnedAmount;
  } else {
    earnedAmount = Number(invoice.paidAmount || invoice.total || 0) * (Number(referral.commissionRate || 0) / 100);
    referral.commissionAmount = Number(referral.commissionAmount || 0) + earnedAmount;
  }

  referral.dealValue = Number(referral.dealValue || 0) + Number(invoice.paidAmount || invoice.total || 0);
  referral.status = 'approved';
  await referral.save();

  if (referral.referrer?._id && earnedAmount > 0) {
    await createNotification({
      recipient: referral.referrer._id,
      type: 'deal_won',
      title: 'Commission Earned',
      message: `${invoice.invoiceNumber} was paid. You earned ₹${earnedAmount.toFixed(2)} in referral commission.`,
      link: '/referral',
      metadata: { referralId: referral._id, invoiceId: invoice._id, earnedAmount },
    }, io);
  }

  return { referral, earnedAmount };
};

// ---- FINANCE ENTRIES ----

export const getFinanceEntries = async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (req.user.role === 'employee') filter.createdBy = req.user._id;
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await FinanceEntry.countDocuments(filter);
    const entries = await FinanceEntry.find(filter)
      .populate('createdBy', 'name email')
      .populate('client', 'name company')
      .populate('project', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFinanceEntry = async (req, res) => {
  try {
    const payload = normalizeFinanceEntryPayload(req.body);
    if (!payload.category?.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const entry = await FinanceEntry.create({ ...payload, createdBy: req.user._id });

    await createActivityLog({
      actor: req.user,
      action: 'finance.entry.created',
      entityType: 'finance_entry',
      entityId: entry._id,
      title: 'Finance entry created',
      description: `${entry.type} entry for ${entry.category} was created.`,
      relatedClient: entry.client,
      relatedProject: entry.project,
      metadata: { amount: entry.amount, status: entry.status },
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateFinanceEntry = async (req, res) => {
  try {
    const entry = await FinanceEntry.findByIdAndUpdate(
      req.params.id,
      normalizeFinanceEntryPayload(req.body),
      { new: true, runValidators: true },
    );

    if (!entry) return res.status(404).json({ success: false, message: 'Finance entry not found' });

    await createActivityLog({
      actor: req.user,
      action: 'finance.entry.updated',
      entityType: 'finance_entry',
      entityId: entry._id,
      title: 'Finance entry updated',
      description: `${entry.type} entry for ${entry.category} was updated.`,
      relatedClient: entry.client,
      relatedProject: entry.project,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    res.json({ success: true, entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteFinanceEntry = async (req, res) => {
  try {
    const entry = await FinanceEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Finance entry not found' });

    await createActivityLog({
      actor: req.user,
      action: 'finance.entry.deleted',
      entityType: 'finance_entry',
      entityId: entry._id,
      title: 'Finance entry deleted',
      description: `${entry.type} entry for ${entry.category} was deleted.`,
      relatedClient: entry.client,
      relatedProject: entry.project,
      metadata: { amount: entry.amount },
    });

    res.json({ success: true, message: 'Finance entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- INVOICES ----

export const getInvoices = async (req, res) => {
  try {
    const { status, client, search, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (status) filter.status = normalizeStatus(status);
    if (client) filter.client = client;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    filter = await applyClientInvoiceScope(req, filter);

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate('client', 'name email company')
      .populate('project', 'name')
      .populate('issuedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, invoices: invoices.map(serializeInvoice) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email company address phone')
      .populate('project', 'name')
      .populate('issuedBy', 'name email');

    const access = await assertInvoiceAccess(req, invoice);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const payments = await Payment.find({ invoice: invoice._id })
      .populate('recordedBy', 'name')
      .sort({ paidAt: -1 });

    res.json({ success: true, invoice: serializeInvoice(invoice), payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const payload = buildInvoicePayload(req.body);
    if (!payload.client) {
      return res.status(400).json({ success: false, message: 'Client is required' });
    }

    const [client, project] = await Promise.all([
      Client.findById(payload.client).select('name email company userId'),
      payload.project ? Project.findById(payload.project).select('name client') : null,
    ]);

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    if (payload.project && !project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project?.client?.toString() !== payload.client.toString()) {
      return res.status(400).json({ success: false, message: 'Selected project does not belong to the selected client' });
    }

    const invoice = await Invoice.create({
      ...payload,
      issuedBy: req.user._id,
      client: client._id,
      project: project?._id,
    });

    if (invoice.status === 'paid') {
      invoice.paidDate = invoice.issueDate || new Date();
      invoice.paidAmount = invoice.total;
      await invoice.save();
      await recordPayment({
        invoice,
        amount: invoice.total,
        method: 'manual',
        reference: 'created-as-paid',
        notes: 'Invoice created directly in paid state',
        recordedBy: req.user._id,
      });
      await Client.findByIdAndUpdate(client._id, { $inc: { totalRevenue: invoice.total } });
    }

    if (client.userId) {
      await createNotification({
        recipient: client.userId,
        sender: req.user._id,
        type: 'invoice_sent',
        title: 'New Invoice Created',
        message: `Invoice ${invoice.invoiceNumber} has been prepared for your account.`,
        link: '/finance',
      }, req.app.get('io'));
    }

    await createActivityLog({
      actor: req.user,
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: invoice._id,
      title: 'Invoice created',
      description: `Invoice ${invoice.invoiceNumber} was created.`,
      relatedClient: invoice.client,
      relatedProject: invoice.project,
      metadata: { total: invoice.total, status: invoice.status },
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('client', 'name email company')
      .populate('project', 'name')
      .populate('issuedBy', 'name');

    res.status(201).json({ success: true, invoice: serializeInvoice(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot edit a paid invoice' });
    }

    const payload = buildInvoicePayload(req.body);
    if (payload.project) {
      const project = await Project.findById(payload.project).select('client');
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      if ((payload.client || invoice.client).toString() !== project.client.toString()) {
        return res.status(400).json({ success: false, message: 'Selected project does not belong to the selected client' });
      }
    }

    Object.assign(invoice, payload);
    await invoice.save();

    await createActivityLog({
      actor: req.user,
      action: 'invoice.updated',
      entityType: 'invoice',
      entityId: invoice._id,
      title: 'Invoice updated',
      description: `Invoice ${invoice.invoiceNumber} was updated.`,
      relatedClient: invoice.client,
      relatedProject: invoice.project,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('client', 'name email company')
      .populate('project', 'name')
      .populate('issuedBy', 'name');

    res.json({ success: true, invoice: serializeInvoice(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client', 'name email userId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    invoice.status = invoice.status === 'paid' ? 'paid' : 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    let deliveryMessage = 'Invoice marked as sent';
    const canEmail = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && invoice.client?.email);

    if (canEmail) {
      try {
        await sendEmail({
          to: invoice.client.email,
          subject: `Invoice ${invoice.invoiceNumber} - RISE WITH MEDIA`,
html: `<p>Dear ${invoice.client.name},</p><p>Your invoice <strong>${invoice.invoiceNumber}</strong> for <strong>₹${invoice.total.toFixed(2)}</strong> is now available.</p>`
        });
        deliveryMessage = 'Invoice sent to client';
      } catch (_) {
        deliveryMessage = 'Invoice marked as sent, but email delivery is unavailable';
      }
    } else {
      deliveryMessage = 'Invoice marked as sent. SMTP is not configured, so no email was sent';
    }

    if (invoice.client?.userId) {
      await createNotification({
        recipient: invoice.client.userId,
        sender: req.user._id,
        type: 'invoice_sent',
        title: 'Invoice Sent',
        message: `Invoice ${invoice.invoiceNumber} has been sent.`,
        link: '/finance',
      }, req.app.get('io'));
    }

    await createActivityLog({
      actor: req.user,
      action: 'invoice.sent',
      entityType: 'invoice',
      entityId: invoice._id,
      title: 'Invoice sent',
      description: `Invoice ${invoice.invoiceNumber} was marked as sent.`,
      relatedClient: invoice.client?._id || invoice.client,
      relatedProject: invoice.project,
    });

    res.json({ success: true, message: deliveryMessage, invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markInvoicePaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client', 'name email phone userId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already marked as paid' });
    }

    const paidAmount = Number(req.body.paidAmount || invoice.total || 0);
    invoice.status = 'paid';
    invoice.paidDate = new Date();
    invoice.paidAmount = paidAmount;
    invoice.paymentMethod = req.body.paymentMethod || invoice.paymentMethod || 'manual';
    invoice.paymentReference = req.body.paymentReference || invoice.paymentReference || '';
    await invoice.save();

    await Promise.all([
      recordPayment({
        invoice,
        amount: paidAmount,
        method: invoice.paymentMethod,
        reference: invoice.paymentReference,
        notes: req.body.notes,
        recordedBy: req.user._id,
      }),
      Client.findByIdAndUpdate(invoice.client?._id || invoice.client, { $inc: { totalRevenue: paidAmount } }),
      maybeCreateReferralEarning({ invoice, io: req.app.get('io') }),
    ]);

    if (invoice.client?.userId) {
      await createNotification({
        recipient: invoice.client.userId,
        sender: req.user._id,
        type: 'invoice_paid',
        title: 'Payment Received',
        message: `Payment for invoice ${invoice.invoiceNumber} has been recorded.`,
        link: '/finance',
      }, req.app.get('io'));
    }

    await createActivityLog({
      actor: req.user,
      action: 'invoice.paid',
      entityType: 'invoice',
      entityId: invoice._id,
      title: 'Invoice paid',
      description: `Invoice ${invoice.invoiceNumber} was marked as paid.`,
      relatedClient: invoice.client?._id || invoice.client,
      relatedProject: invoice.project,
      metadata: {
        paidAmount,
        paymentMethod: invoice.paymentMethod,
        paymentReference: invoice.paymentReference,
      },
    });

    res.json({ success: true, message: 'Invoice marked as paid', invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    await Payment.deleteMany({ invoice: invoice._id });

    await createActivityLog({
      actor: req.user,
      action: 'invoice.deleted',
      entityType: 'invoice',
      entityId: invoice._id,
      title: 'Invoice deleted',
      description: `Invoice ${invoice.invoiceNumber} was deleted.`,
      relatedClient: invoice.client,
      relatedProject: invoice.project,
      metadata: { total: invoice.total },
    });

    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { client, search, page = 1, limit = 25 } = req.query;
    const filter = {};

    if (client) filter.client = client;
    if (req.user.role === 'client') {
      const clientRecord = await getClientForUser(req.user._id);
      filter.client = clientRecord?._id || null;
    }
    if (search) {
      filter.$or = [
        { method: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('invoice', 'invoiceNumber status total dueDate')
      .populate('client', 'name company')
      .populate('project', 'name')
      .populate('recordedBy', 'name')
      .sort({ paidAt: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- EXPENSES ----

export const getExpenses = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (req.user.role === 'employee') filter.submittedBy = req.user._id;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .populate('submittedBy', 'name avatar')
      .populate('approvedBy', 'name')
      .populate('project', 'name')
      .populate('client', 'name company')
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    if (!req.body.title?.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is required' });
    }

    const expense = await Expense.create({
      ...req.body,
      amount: Number(req.body.amount) || 0,
      submittedBy: req.user._id,
    });

    await createActivityLog({
      actor: req.user,
      action: 'expense.created',
      entityType: 'expense',
      entityId: expense._id,
      title: 'Expense created',
      description: `${expense.title} was submitted.`,
      relatedClient: expense.client,
      relatedProject: expense.project,
      metadata: { amount: expense.amount, status: expense.status },
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveExpense = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    const expense = await Expense.findById(req.params.id).populate('submittedBy', 'name');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    expense.status = action === 'approve' ? 'approved' : 'rejected';
    expense.approvedBy = req.user._id;
    await expense.save();

    if (expense.submittedBy?._id) {
      await createNotification({
        recipient: expense.submittedBy._id,
        sender: req.user._id,
        type: 'general',
        title: `Expense ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `${expense.title} was ${action === 'approve' ? 'approved' : 'rejected'}.`,
        link: '/finance',
      }, req.app.get('io'));
    }

    await createActivityLog({
      actor: req.user,
      action: 'expense.approval.updated',
      entityType: 'expense',
      entityId: expense._id,
      title: 'Expense status updated',
      description: `${expense.title} was ${action === 'approve' ? 'approved' : 'rejected'}.`,
      relatedClient: expense.client,
      relatedProject: expense.project,
      metadata: { status: expense.status },
    });

    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinanceSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRevenue, monthRevenue, totalExpenses, overdueInvoices, pendingInvoices] = await Promise.all([
      Invoice.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
      Invoice.aggregate([{ $match: { status: 'paid', paidDate: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
      Expense.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Invoice.countDocuments({ status: 'overdue' }),
      Invoice.countDocuments({ status: { $in: ['draft', 'sent'] } }),
    ]);

    const revenueValue = totalRevenue[0]?.total || 0;
    const expenseValue = totalExpenses[0]?.total || 0;

    res.json({
      success: true,
      summary: {
        totalRevenue: revenueValue,
        monthRevenue: monthRevenue[0]?.total || 0,
        totalExpenses: expenseValue,
        profit: revenueValue - expenseValue,
        overdueInvoices,
        pendingInvoices,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
