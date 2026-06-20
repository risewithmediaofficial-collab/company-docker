import Client from '../models/client.model.js';
import DomainRenewal from '../models/domainRenewal.model.js';
import Project from '../models/project.model.js';

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const toDateValue = (value, { end = false } = {}) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return end ? endOfDay(date) : startOfDay(date);
};

const serializeDomainRenewal = (item) => {
  const entry = item?.toObject ? item.toObject() : item;
  if (!entry) return null;

  const today = startOfDay();
  const expiry = entry.expiryDate ? startOfDay(entry.expiryDate) : null;
  const daysUntilExpiry = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return {
    ...entry,
    daysUntilExpiry,
    isExpired: daysUntilExpiry !== null && daysUntilExpiry < 0,
    isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7,
  };
};

const buildFilter = async (req, query = {}) => {
  const filter = { organizationId: req.user.organizationId };

  if (query.clientId && query.clientId !== 'all') filter.clientId = query.clientId;
  if (query.projectId && query.projectId !== 'all') filter.projectId = query.projectId;
  if (query.itemType && query.itemType !== 'all') filter.itemType = query.itemType;
  if (query.status && query.status !== 'all') filter.status = query.status;

  if (query.search) {
    filter.$or = [
      { itemName: { $regex: query.search, $options: 'i' } },
      { domainName: { $regex: query.search, $options: 'i' } },
      { provider: { $regex: query.search, $options: 'i' } },
      { notes: { $regex: query.search, $options: 'i' } },
    ];
  }

  const expiryStart = toDateValue(query.expiryStart);
  const expiryEnd = toDateValue(query.expiryEnd, { end: true });
  if (expiryStart || expiryEnd) {
    filter.expiryDate = {};
    if (expiryStart) filter.expiryDate.$gte = expiryStart;
    if (expiryEnd) filter.expiryDate.$lte = expiryEnd;
  }

  if (req.user.role === 'manager') {
    const [projects, clients] = await Promise.all([
      Project.find({ manager: req.user._id }).select('_id'),
      Client.find({ assignedManager: req.user._id }).select('_id'),
    ]);
    const projectIds = projects.map((project) => project._id);
    const clientIds = clients.map((client) => client._id);
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { projectId: { $in: projectIds.length ? projectIds : [null] } },
          { clientId: { $in: clientIds.length ? clientIds : [null] } },
          { createdBy: req.user._id },
        ],
      },
    ];
  }

  return filter;
};

export const getDomainRenewals = async (req, res) => {
  try {
    const filter = await buildFilter(req, req.query);
    const records = await DomainRenewal.find(filter)
      .populate('clientId', 'name company')
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('progressNotes.createdBy', 'name')
      .sort({ expiryDate: 1, createdAt: -1 });

    const data = records.map(serializeDomainRenewal);
    const metrics = data.reduce((accumulator, item) => {
      accumulator.total += 1;
      if (item.isExpired) accumulator.expired += 1;
      if (item.isExpiringSoon) accumulator.expiringSoon += 1;
      if (item.status === 'renewed') accumulator.renewed += 1;
      return accumulator;
    }, { total: 0, expired: 0, expiringSoon: 0, renewed: 0 });

    res.json({ success: true, records: data, metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDomainRenewal = async (req, res) => {
  try {
    const { itemName, expiryDate, progressNote, ...rest } = req.body;
    if (!itemName?.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const parsedExpiryDate = toDateValue(expiryDate, { end: true });
    if (!parsedExpiryDate) {
      return res.status(400).json({ success: false, message: 'A valid expiry date is required' });
    }

    const record = await DomainRenewal.create({
      ...rest,
      itemName: itemName.trim(),
      expiryDate: parsedExpiryDate,
      purchaseDate: rest.purchaseDate ? toDateValue(rest.purchaseDate) : null,
      organizationId: req.user.organizationId,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      progressNotes: progressNote?.trim()
        ? [{ note: progressNote.trim(), status: rest.status || 'active', createdBy: req.user._id }]
        : [],
    });

    const populated = await DomainRenewal.findById(record._id)
      .populate('clientId', 'name company')
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('progressNotes.createdBy', 'name');

    res.status(201).json({ success: true, record: serializeDomainRenewal(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateDomainRenewal = async (req, res) => {
  try {
    const record = await DomainRenewal.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Renewal record not found' });
    }

    const fields = ['itemName', 'itemType', 'domainName', 'provider', 'renewalCost', 'status', 'notes', 'clientId', 'projectId'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    if (req.body.purchaseDate !== undefined) {
      record.purchaseDate = req.body.purchaseDate ? toDateValue(req.body.purchaseDate) : null;
    }
    if (req.body.expiryDate !== undefined) {
      const parsedExpiryDate = req.body.expiryDate ? toDateValue(req.body.expiryDate, { end: true }) : null;
      if (!parsedExpiryDate) {
        return res.status(400).json({ success: false, message: 'A valid expiry date is required' });
      }
      record.expiryDate = parsedExpiryDate;
    }

    record.updatedBy = req.user._id;
    await record.save();

    const populated = await DomainRenewal.findById(record._id)
      .populate('clientId', 'name company')
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('progressNotes.createdBy', 'name');

    res.json({ success: true, record: serializeDomainRenewal(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addDomainRenewalProgress = async (req, res) => {
  try {
    const record = await DomainRenewal.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Renewal record not found' });
    }

    if (!req.body.note?.trim()) {
      return res.status(400).json({ success: false, message: 'Progress note is required' });
    }

    record.progressNotes.push({
      note: req.body.note.trim(),
      status: req.body.status || record.status || 'active',
      createdBy: req.user._id,
    });

    if (req.body.status) {
      record.status = req.body.status;
    }

    record.updatedBy = req.user._id;
    await record.save();

    const populated = await DomainRenewal.findById(record._id)
      .populate('clientId', 'name company')
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('progressNotes.createdBy', 'name');

    res.json({ success: true, record: serializeDomainRenewal(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteDomainRenewal = async (req, res) => {
  try {
    const record = await DomainRenewal.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Renewal record not found' });
    }

    res.json({ success: true, message: 'Renewal record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
