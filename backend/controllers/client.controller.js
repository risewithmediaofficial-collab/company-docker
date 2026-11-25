// =============================================
// CLIENT CONTROLLER
// =============================================

import mongoose from 'mongoose';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import ActivityLog from '../models/activityLog.model.js';
import SmmClient from '../models/smm/smmClient.model.js';
import Organization from '../models/organization.model.js';
import { sendEmail } from '../utils/email.js';
import { createActivityLog } from '../utils/activity.js';
import { moveToRecycleBin } from '../utils/recycleBin.js';
import { emitLiveEvent } from '../utils/socketEmitter.js';
import { parsePagination } from '../utils/pagination.js';

const statusMap = {
  Active: 'active',
  Inactive: 'inactive',
  Prospect: 'onboarding',
  Churned: 'churned',
  Renew: 'renew',
};

const statusQueryMap = {
  Active: ['active', 'Active', 'ACTIVE', 'ongoing', 'Ongoing', 'live', 'Live', 'running', 'Running', 'enabled', 'Enabled'],
  Inactive: ['inactive', 'Inactive', 'INACTIVE', 'paused', 'Paused', 'PAUSED'],
  Prospect: ['onboarding', 'Onboarding', 'prospect', 'Prospect', 'lead', 'Lead'],
  Churned: ['churned', 'Churned', 'cancelled', 'Cancelled', 'lost', 'Lost'],
  Renew: ['renew', 'Renew', 'renewal', 'Renewal'],
};

const ACTIVE_STATUS_TOKENS = new Set(['active', 'ongoing', 'live', 'running', 'enabled', 'approved']);

const mapSmmStatusToClient = (raw) => {
  const s = (raw || 'Active').toString().trim().toLowerCase();
  if (s === 'inactive' || s === 'paused') return 'inactive';
  if (s === 'churned' || s === 'cancelled' || s === 'lost') return 'churned';
  if (s === 'prospect' || s === 'onboarding' || s === 'lead') return 'onboarding';
  if (s === 'renew' || s === 'renewal') return 'renew';
  return 'active';
};

const serializeClient = (client) => {
  const item = client.toObject ? client.toObject() : client;
  const rawStatus = (item.status || 'active').toString().toLowerCase().trim();
  const label = ACTIVE_STATUS_TOKENS.has(rawStatus)
    ? 'Active'
    : {
        inactive: 'Inactive',
        onboarding: 'Prospect',
        prospect: 'Prospect',
        lead: 'Prospect',
        churned: 'Churned',
        cancelled: 'Churned',
        lost: 'Churned',
        renew: 'Renew',
        renewal: 'Renew',
        paused: 'Inactive',
      }[rawStatus] || (item.status ? item.status.toString().trim().charAt(0).toUpperCase() + item.status.toString().trim().slice(1) : 'Active');

  return { ...item, status: label };
};

const normalizeClientPayload = (body) => {
  const payload = {
    ...body,
    status: body.status ? (statusMap[body.status] || body.status) : body.status,
  };

  if (Object.prototype.hasOwnProperty.call(body, 'referredBy')) {
    payload.referredBy = body.referredBy || null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'referredByManual')) {
    payload.referredByManual = body.referredByManual?.toString?.().trim?.() || '';
  }

  if (payload.referredBy) {
    payload.referredByManual = '';
  }

  if (payload.contractEndDate === '' || payload.contractEndDate === undefined) {
    payload.contractEndDate = null;
  }
  if (payload.contractStartDate === '' || payload.contractStartDate === undefined) {
    payload.contractStartDate = null;
  }

  return payload;
};

const clientPopulate = [
  { path: 'assignedManager', select: 'name avatar email' },
  { path: 'assignedTeam', select: 'name avatar email' },
  { path: 'userId', select: 'email lastLogin isActive' },
  { path: 'referredBy', select: 'name email role referralCode' },
];

const assertClientAccess = (req, client) => {
  if (!client) return { allowed: false, status: 404, message: 'Client not found' };
  if (['superAdmin', 'admin', 'organizationOwner', 'manager', 'accountManager', 'editor', 'designer', 'adsManager', 'financeManager', 'employee', 'intern'].includes(req.user.role)) return { allowed: true };
  if (['client', 'clientAdmin', 'clientMember'].includes(req.user.role)) {
    const userClientId = req.user.clientId?._id || req.user.clientId;
    const isOwner =
      (client.userId && client.userId.toString() === req.user._id.toString()) ||
      (userClientId && client._id.toString() === userClientId.toString()) ||
      (client.email && req.user.email && client.email.toLowerCase() === req.user.email.toLowerCase());
    if (isOwner) return { allowed: true };
    return { allowed: false, status: 403, message: 'Access denied. You can only view your own details.' };
  }
  return { allowed: false, status: 403, message: 'Access denied.' };
};

export const getClients = async (req, res) => {
  try {
    const { status, search, service, createdFrom, createdTo } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 500, maxLimit: 1000 });
    const filter = {};

    if (status) {
      const mappedQueries = statusQueryMap[status];
      if (mappedQueries) {
        filter.status = {
          $regex: new RegExp(`^\\s*(${mappedQueries.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*$`, 'i'),
        };
      } else {
        filter.status = { $in: [status, statusMap[status] || status, status.toLowerCase()] };
      }
    }
    if (service) {
      filter.services = { $elemMatch: { $regex: service, $options: 'i' } };
    }
    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
      if (createdTo) filter.createdAt.$lte = new Date(`${createdTo}T23:59:59.999Z`);
    }
    if (search) {
      filter.$or = [
        { clientId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (['client', 'clientAdmin', 'clientMember'].includes(req.user.role)) {
      const userClientId = req.user.clientId?._id || req.user.clientId;
      const clientConditions = [{ userId: req.user._id }];
      if (userClientId) clientConditions.push({ _id: userClientId });
      if (req.user.email) clientConditions.push({ email: req.user.email.toLowerCase().trim() });
      filter.$and = [{ $or: clientConditions }];
    } else if (['employee', 'intern', 'editor', 'designer', 'adsManager'].includes(req.user.role)) {
      // Team members see clients in their organization or where they are assigned to team/manager/project/task
      const employeeProjects = await Project.find({ team: req.user._id }).select('client').lean();
      const projectClientIds = employeeProjects.map((p) => p.client).filter(Boolean);
      const employeeTasks = await Task.find({
        $or: [
          { assignedTo: req.user._id },
          { scriptWriterAssigned: req.user._id },
          { voiceArtistAssigned: req.user._id },
        ],
      }).select('client').lean();
      const taskClientIds = employeeTasks.map((t) => t.client).filter(Boolean);
      const relevantClientIds = [...new Set([...projectClientIds, ...taskClientIds])];

      const employeeScopeOr = [
        { assignedTeam: req.user._id },
        { assignedManager: req.user._id },
        { _id: { $in: relevantClientIds } },
        { assignedTeam: { $size: 0 } },
        { assignedTeam: { $exists: false } },
        { assignedTeam: null },
      ];
      // Team member with organization assigned sees all clients within their organization
      if (req.user.organizationId) {
        employeeScopeOr.push({ organizationId: req.user.organizationId });
      }

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: employeeScopeOr }];
        delete filter.$or;
      } else {
        filter.$or = employeeScopeOr;
      }
    }

    // ── STRICT TENANT ISOLATION (read-only query scoping) ──
    const ghostOrgId = req.headers['x-impersonate-org-id'] || req.headers['x-ghost-org-id'] || (req.isGhostMode ? req.user.organizationId : null);
    const targetOrgId = ghostOrgId || (req.user.role !== 'superAdmin' ? req.user.organizationId : null);
    let otherOrgIds = [];
    if (targetOrgId) {
      const otherOrgs = await Organization.find({ _id: { $ne: targetOrgId } }).select('_id').lean();
      otherOrgIds = otherOrgs.map((o) => o._id);

      // Multi-tenant isolation: exclude records explicitly owned by another valid organization
      if (otherOrgIds.length > 0) {
        const orgFilter = { $nin: otherOrgIds };
        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { organizationId: orgFilter }];
          delete filter.$or;
        } else if (filter.$and) {
          filter.$and.push({ organizationId: orgFilter });
        } else {
          filter.organizationId = orgFilter;
        }
      }
    }

    const isPortalClientUser = ['client', 'clientAdmin', 'clientMember'].includes(req.user.role);
    const smmScope = targetOrgId && otherOrgIds.length > 0 ? { organizationId: { $nin: otherOrgIds } } : {};

    let [total, clients, allSmm, allCrmRefs] = await Promise.all([
      Client.countDocuments(filter),
      Client.find(filter)
        .populate(clientPopulate)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      !isPortalClientUser && page === 1 ? SmmClient.find(smmScope).lean() : Promise.resolve([]),
      !isPortalClientUser && page === 1
        ? Client.find(targetOrgId && otherOrgIds.length > 0 ? { organizationId: { $nin: otherOrgIds } } : {})
            .select('_id clientId email company')
            .lean()
        : Promise.resolve([]),
    ]);

    // Merge standalone SMM clients in memory (read-only) so all active SMM + CRM clients appear
    if (!isPortalClientUser && page === 1 && allSmm.length > 0) {
      const crmIdSet = new Set(allCrmRefs.map((c) => String(c._id)));
      const crmClientIdSet = new Set(allCrmRefs.map((c) => c.clientId).filter(Boolean));
      const crmEmailSet = new Set(allCrmRefs.map((c) => c.email?.toLowerCase().trim()).filter(Boolean));
      const crmCompanySet = new Set(allCrmRefs.map((c) => c.company?.toLowerCase().trim()).filter(Boolean));

      const searchLower = search ? String(search).toLowerCase().trim() : '';
      const serviceLower = service ? String(service).toLowerCase().trim() : '';
      const targetStatusSet = status
        ? new Set((statusQueryMap[status] || [status]).map((s) => s.toLowerCase().trim()))
        : null;
      const fromDate = createdFrom ? new Date(createdFrom) : null;
      const toDate = createdTo ? new Date(`${createdTo}T23:59:59.999Z`) : null;

      for (const smm of allSmm) {
        const cName = (smm.companyName || smm.clientName || smm.primaryContact || smm.contactPerson || '').trim();
        if (!cName) continue;
        const emailNorm = smm.email ? smm.email.toLowerCase().trim() : '';
        const companyNorm = cName.toLowerCase();

        if (
          crmIdSet.has(String(smm._id)) ||
          (smm.clientId && crmClientIdSet.has(smm.clientId)) ||
          (emailNorm && crmEmailSet.has(emailNorm)) ||
          crmCompanySet.has(companyNorm)
        ) {
          continue;
        }

        const mappedStatus = mapSmmStatusToClient(smm.status);
        const virtualClient = {
          _id: smm._id,
          clientId: smm.clientId || undefined,
          name: smm.primaryContact || smm.contactPerson || cName,
          company: cName,
          email: smm.email || '',
          phone: smm.phone || '',
          website: smm.website || '',
          logo: smm.brandLogo || '',
          status: mappedStatus,
          organizationId: smm.organizationId || targetOrgId || undefined,
          services: ['Social Media Marketing'],
          createdAt: smm.createdAt || null,
        };

        if (targetStatusSet && !targetStatusSet.has(mappedStatus)) continue;
        if (serviceLower && !virtualClient.services.some((sv) => sv.toLowerCase().includes(serviceLower))) continue;
        if ((fromDate || toDate) && virtualClient.createdAt) {
          const dt = new Date(virtualClient.createdAt);
          if (fromDate && dt < fromDate) continue;
          if (toDate && dt > toDate) continue;
        }
        if (
          searchLower &&
          ![virtualClient.clientId, virtualClient.name, virtualClient.company, virtualClient.email, virtualClient.phone]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(searchLower))
        ) {
          continue;
        }

        clients.push(virtualClient);
        total += 1;
      }
    }

    const clientIds = clients.map((c) => c._id);
    const projectSummaryMap = {};
    const taskSummaryMap = {};

    if (clientIds.length > 0) {
      // Collect alternate SMM client IDs so projects and tasks attributed to SMM IDs are fully grouped
      const smmAlternateMap = {};
      const allLookupIds = [...clientIds];
      const smmMatches = await SmmClient.find({
        $or: [
          { _id: { $in: clientIds } },
          { clientId: { $in: clients.map((c) => c.clientId).filter(Boolean) } },
          { email: { $in: clients.map((c) => c.email?.toLowerCase()?.trim()).filter(Boolean) } },
        ],
      }).select('_id clientId email companyName').lean();

      smmMatches.forEach((s) => {
        allLookupIds.push(s._id);
        const parentCrm = clients.find(
          (c) =>
            String(c._id) === String(s._id) ||
            (c.clientId && c.clientId === s.clientId) ||
            (c.email && s.email && c.email.toLowerCase().trim() === s.email.toLowerCase().trim()) ||
            (c.company && s.companyName && c.company.toLowerCase().trim() === s.companyName.toLowerCase().trim())
        );
        if (parentCrm) {
          smmAlternateMap[String(s._id)] = String(parentCrm._id);
        }
      });

      const clientProjects = await Project.find({ client: { $in: allLookupIds } })
        .select('client name category startDate dueDate status createdAt')
        .lean();

      const projectToClientMap = {};
      const projectIds = [];

      clientProjects.forEach((proj) => {
        const rawCid = String(proj.client);
        const cid = smmAlternateMap[rawCid] || rawCid;
        projectToClientMap[String(proj._id)] = cid;
        projectIds.push(proj._id);

        if (!projectSummaryMap[cid]) {
          projectSummaryMap[cid] = {
            projectCount: 0,
            startDate: null,
            endDate: null,
            categories: new Set(),
          };
        }

        const bucket = projectSummaryMap[cid];
        bucket.projectCount += 1;
        if (proj.category && proj.category !== 'other') {
          bucket.categories.add(proj.category);
        } else if (proj.category) {
          bucket.categories.add(proj.category);
        }

        if (proj.startDate) {
          const sTime = new Date(proj.startDate).getTime();
          if (!Number.isNaN(sTime) && (!bucket.startDate || sTime < new Date(bucket.startDate).getTime())) {
            bucket.startDate = proj.startDate;
          }
        }
        if (proj.dueDate) {
          const eTime = new Date(proj.dueDate).getTime();
          if (!Number.isNaN(eTime) && (!bucket.endDate || eTime > new Date(bucket.endDate).getTime())) {
            bucket.endDate = proj.dueDate;
          }
        }
      });

      const taskQueryOr = [{ client: { $in: allLookupIds } }];
      if (projectIds.length > 0) {
        taskQueryOr.push({ project: { $in: projectIds } });
      }

      const clientTasks = await Task.find({ $or: taskQueryOr })
        .select('client project status')
        .lean();

      const completedSet = new Set(['done', 'approved', 'completed', 'Completed', 'Done', 'Approved']);
      const ongoingSet = new Set([
        'in_progress',
        'on_process',
        'review',
        'client_approval',
        'smm_team',
        'drive_uploaded',
        'rework',
        'rework_completed',
        'review_required',
        'waiting_for_client',
        'In Progress',
        'On Process',
        'In Review',
        'Rework',
        'Rework Completed',
        'Review Required',
        'Waiting for Client',
      ]);

      clientTasks.forEach((t) => {
        const rawCid = String(t.client || (t.project ? projectToClientMap[String(t.project)] : '') || '');
        const cid = smmAlternateMap[rawCid] || rawCid;
        if (!cid) return;
        if (!taskSummaryMap[cid]) {
          taskSummaryMap[cid] = { totalTasks: 0, ongoingTasks: 0, pendingTasks: 0, completedTasks: 0 };
        }
        const stats = taskSummaryMap[cid];
        stats.totalTasks += 1;
        if (completedSet.has(t.status)) {
          stats.completedTasks += 1;
        } else if (ongoingSet.has(t.status)) {
          stats.ongoingTasks += 1;
        } else {
          stats.pendingTasks += 1;
        }
      });
    }

    const enrichedClients = clients.map((client) => {
      const cid = String(client._id);
      const pSum = projectSummaryMap[cid];
      const tSum = taskSummaryMap[cid] || { totalTasks: 0, ongoingTasks: 0, pendingTasks: 0, completedTasks: 0 };

      return {
        ...serializeClient(client),
        projectCount: pSum?.projectCount || 0,
        projectStartDate: pSum?.startDate || client.contractStartDate || null,
        projectEndDate: pSum?.endDate || client.contractEndDate || null,
        projectTypes: pSum ? Array.from(pSum.categories) : [],
        totalTasks: tSum.totalTasks,
        ongoingTasks: tSum.ongoingTasks,
        pendingTasks: tSum.pendingTasks,
        completedTasks: tSum.completedTasks,
      };
    });

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      clients: enrichedClients,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getClient = async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!rawId || rawId === 'undefined' || rawId === 'null') {
      return res.status(400).json({ success: false, message: 'Invalid client ID' });
    }

    let client = null;
    const isValidId = mongoose.Types.ObjectId.isValid(rawId);

    if (isValidId) {
      client = await Client.findById(rawId)
        .populate(clientPopulate)
        .populate('convertedFromLead', 'name source value');
    }

    // Fallback 1: Check SmmClient if not found in Client collection
    if (!client && isValidId) {
      const smmClient = await SmmClient.findById(rawId).lean();
      if (smmClient) {
        const matchingClient = smmClient.email
          ? await Client.findOne({ email: smmClient.email.toLowerCase().trim() }).populate(clientPopulate)
          : (smmClient.companyName ? await Client.findOne({ company: { $regex: new RegExp(`^${smmClient.companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }).populate(clientPopulate) : null);

        if (matchingClient) {
          client = matchingClient;
        } else {
          try {
            client = await Client.create({
              _id: smmClient._id,
              name: smmClient.primaryContact || smmClient.companyName,
              company: smmClient.companyName,
              email: smmClient.email || `${smmClient._id}@client.internal`,
              phone: smmClient.phone || '',
              status: mapSmmStatusToClient(smmClient.status),
              services: ['Social Media Marketing'],
              website: smmClient.website || '',
            });
            client = await Client.findById(client._id).populate(clientPopulate);
          } catch (_) {
            client = await Client.findById(smmClient._id).populate(clientPopulate);
          }
        }
      }
    }

    // Fallback 2: Check by exact company name, email, or contact name if identifier is not an ObjectId (or wasn't found by ID)
    if (!client) {
      const decodedId = decodeURIComponent(rawId).trim();
      const escaped = decodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      client = await Client.findOne({
        $or: [
          { clientId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { company: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { email: decodedId.toLowerCase() },
          { name: { $regex: new RegExp(`^${escaped}$`, 'i') } },
        ],
      }).populate(clientPopulate);

      // Fallback 2b: Also check SmmClient by name or clientId
      if (!client) {
        const smmClient = await SmmClient.findOne({
          $or: [
            { clientId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { companyName: { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { email: decodedId.toLowerCase() },
            { primaryContact: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          ],
        }).lean();
        if (smmClient) {
          try {
            client = await Client.create({
              _id: smmClient._id,
              clientId: smmClient.clientId,
              name: smmClient.primaryContact || smmClient.companyName,
              company: smmClient.companyName,
              email: smmClient.email || `${smmClient._id}@client.internal`,
              phone: smmClient.phone || '',
              status: mapSmmStatusToClient(smmClient.status),
              services: ['Social Media Marketing'],
              website: smmClient.website || '',
            });
            client = await Client.findById(client._id).populate(clientPopulate);
          } catch (_) {
            client = await Client.findById(smmClient._id).populate(clientPopulate);
          }
        }
      }
    }

    const access = assertClientAccess(req, client);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const relatedClientIds = [client._id];
    try {
      const smmClientMatch = await SmmClient.findOne({
        $or: [
          { _id: client._id },
          ...(client.clientId ? [{ clientId: client.clientId }] : []),
          ...(client.email ? [{ email: client.email.toLowerCase().trim() }] : []),
          ...(client.company ? [{ companyName: client.company.trim() }] : []),
        ],
      }).select('_id').lean();
      if (smmClientMatch && String(smmClientMatch._id) !== String(client._id)) {
        relatedClientIds.push(smmClientMatch._id);
      }
    } catch (_) {}

    const projects = await Project.find({ client: { $in: relatedClientIds } })
      .select('name status progress startDate dueDate category priority budget team manager')
      .populate('manager', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    const projectIds = projects.map((p) => p._id);

    const [tasks, recentActivity] = await Promise.all([
      Task.find({
        $or: [
          { client: { $in: relatedClientIds } },
          ...(projectIds.length > 0 ? [{ project: { $in: projectIds } }] : []),
        ],
      })
        .select('title status priority dueDate taskType taskCategory assignedTo project deliverable createdAt updatedAt')
        .populate('assignedTo', 'name email avatar')
        .populate('project', 'name')
        .sort({ dueDate: 1, createdAt: -1 })
        .limit(200)
        .lean(),
      ActivityLog.find({ relatedClient: { $in: relatedClientIds } })
        .populate('actor', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
    ]);

    res.json({
      success: true,
      client: serializeClient(client),
      projects,
      tasks,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClientOverview = async (req, res) => {
  try {
    const rawSearch = (req.query.search || req.query.q || req.query.clientId || req.params.id || '').trim();
    if (!rawSearch) {
      return res.status(400).json({ success: false, message: 'Please provide a client name, client ID, or search term.' });
    }

    const decoded = decodeURIComponent(rawSearch).trim();
    const escaped = decoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let client = null;
    if (mongoose.Types.ObjectId.isValid(decoded)) {
      client = await Client.findById(decoded).populate(clientPopulate);
    }

    if (!client) {
      client = await Client.findOne({
        $or: [
          { clientId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { company: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { name: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { email: decoded.toLowerCase() },
          { clientId: { $regex: escaped, $options: 'i' } },
          { company: { $regex: escaped, $options: 'i' } },
          { name: { $regex: escaped, $options: 'i' } },
        ],
      }).populate(clientPopulate);
    }

    if (!client) {
      const smmClient = await SmmClient.findOne({
        $or: [
          { clientId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { companyName: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { primaryContact: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { email: decoded.toLowerCase() },
        ],
      }).lean();

      if (smmClient) {
        client = await Client.findById(smmClient._id).populate(clientPopulate);
      }
    }

    if (!client) {
      const suggestions = await Client.find({
        $or: [
          { clientId: { $regex: escaped, $options: 'i' } },
          { company: { $regex: escaped, $options: 'i' } },
          { name: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } },
        ],
      })
        .select('name company email phone status clientId tier monthlyPlanFee services')
        .limit(10)
        .lean();

      return res.status(404).json({
        success: false,
        message: `No exact client found matching "${rawSearch}".`,
        suggestions: suggestions.map(serializeClient),
      });
    }

    const access = assertClientAccess(req, client);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const projects = await Project.find({ client: client._id })
      .select('name status progress startDate dueDate category priority budget team manager')
      .populate('manager', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({
      $or: [
        { client: client._id },
        ...(projectIds.length > 0 ? [{ project: { $in: projectIds } }] : []),
      ],
    })
      .select('title status priority dueDate taskType taskCategory assignedTo project deliverable createdAt updatedAt')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name')
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    const recentActivity = await ActivityLog.find({ relatedClient: client._id })
      .populate('actor', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const completedTaskStatuses = new Set(['done', 'completed', 'approved', 'Completed', 'Done', 'Approved']);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => completedTaskStatuses.has(t.status)).length;
    const pendingTasks = totalTasks - completedTasks;
    const now = new Date();
    const overdueTasks = tasks.filter((t) => !completedTaskStatuses.has(t.status) && t.dueDate && new Date(t.dueDate) < now).length;

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => ['in_progress', 'planning', 'active', 'In Progress', 'Active'].includes(p.status)).length;
    const completedProjects = projects.filter((p) => ['completed', 'delivered', 'Completed'].includes(p.status)).length;

    res.json({
      success: true,
      client: serializeClient(client),
      projects,
      tasks,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ensure or synchronize user credentials for client portal
export const ensureClientUserAccount = async (client, reqUserOrOrg) => {
  if (!client || !client.email) return null;
  const cleanEmail = client.email.toLowerCase().trim();
  const rawPhone = (client.phone || '').toString().trim();
  const rawPassword = rawPhone.length >= 6 ? rawPhone : (rawPhone ? rawPhone.padEnd(6, '0') : 'Client@123');
  const orgId = client.organizationId || reqUserOrOrg?.organizationId || (typeof reqUserOrOrg === 'string' ? reqUserOrOrg : undefined);

  let user = await User.findOne({ email: cleanEmail }).select('+password');
  if (!user) {
    user = await User.create({
      name: client.name || client.company || 'Client',
      email: cleanEmail,
      password: rawPassword,
      role: 'client',
      phone: rawPhone,
      clientId: client._id,
      organizationId: orgId,
      isActive: true,
      approvalStatus: 'approved',
    });
  } else {
    let shouldSave = false;
    if (user.role !== 'client') {
      user.role = 'client';
      shouldSave = true;
    }
    if (String(user.clientId || '') !== String(client._id)) {
      user.clientId = client._id;
      shouldSave = true;
    }
    if (rawPhone && user.phone !== rawPhone) {
      user.phone = rawPhone;
      shouldSave = true;
    }
    if (!user.isActive) {
      user.isActive = true;
      shouldSave = true;
    }
    if (user.approvalStatus !== 'approved') {
      user.approvalStatus = 'approved';
      shouldSave = true;
    }
    if (rawPassword) {
      user.password = rawPassword;
      shouldSave = true;
    }
    if (shouldSave) {
      await user.save();
    }
  }

  // Ensure client links back to user and portal is enabled
  if (String(client.userId || '') !== String(user._id) || !client.portalEnabled) {
    client.userId = user._id;
    client.portalEnabled = true;
    await Client.findByIdAndUpdate(client._id, { userId: user._id, portalEnabled: true });
  }

  return user;
};

// Global synchronization for all existing clients to have valid user portal accounts
export const syncAllClientUsers = async () => {
  try {
    const clients = await Client.find({});
    let count = 0;
    for (const client of clients) {
      if (client.email) {
        await ensureClientUserAccount(client);
        count++;
      }
    }
    console.log(`[Sync] Successfully synchronized ${count} client portal user accounts.`);
    return count;
  } catch (err) {
    console.error('[Sync] Error synchronizing client portal accounts:', err.message);
    return 0;
  }
};

export const createClient = async (req, res) => {
  try {
    const payload = normalizeClientPayload(req.body);
    if (req.user?.organizationId) {
      payload.organizationId = req.user.organizationId;
    }

    const client = await Client.create(payload);

    // Auto-create & link client portal user account with email as username and phone as password
    let portalUser = null;
    if (client.email) {
      try {
        portalUser = await ensureClientUserAccount(client, req.user);
      } catch (userErr) {
        console.error('⚠️ Portal user auto-creation error:', userErr.message);
      }
    }

    await createActivityLog({
      actor: req.user,
      action: 'client.created',
      entityType: 'client',
      entityId: client._id,
      title: 'Client created',
      description: `${client.company || client.name} was added.`,
      relatedClient: client._id,
    });

    emitLiveEvent('clientCreated', client);

    const populatedClient = await Client.findById(client._id).populate(clientPopulate);
    const rawPhone = (client.phone || '').toString().trim();
    const portalPassword = rawPhone.length >= 6 ? rawPhone : (rawPhone ? rawPhone.padEnd(6, '0') : 'Client@123');

    res.status(201).json({
      success: true,
      client: serializeClient(populatedClient),
      portalCredentials: portalUser
        ? { email: portalUser.email, password: portalPassword }
        : null,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, normalizeClientPayload(req.body), { new: true, runValidators: true })
      .populate(clientPopulate);

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    // Sync portal user account if email or phone exists
    if (client.email) {
      try {
        await ensureClientUserAccount(client, req.user);
      } catch (err) {
        console.error('⚠️ Portal user sync during update skipped:', err.message);
      }
    }

    await createActivityLog({
      actor: req.user,
      action: 'client.updated',
      entityType: 'client',
      entityId: client._id,
      title: 'Client updated',
      description: `${client.company || client.name} was updated.`,
      relatedClient: client._id,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    const serialized = serializeClient(client);
    emitLiveEvent('clientUpdated', serialized);

    res.json({ success: true, client: serialized });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    await moveToRecycleBin({
      entityType: 'client',
      originalId: client._id,
      title: client.company || client.name,
      subtitle: client.email || client.phone || '',
      originalLocation: 'Clients 360',
      modelName: 'Client',
      documentData: client,
      user: req.user,
    });

    await Client.findByIdAndDelete(req.params.id);

    // Also remove client portal user if linked
    if (client.userId) {
      await User.findByIdAndDelete(client.userId).catch(() => {});
    }

    await createActivityLog({
      actor: req.user,
      action: 'client.deleted',
      entityType: 'client',
      entityId: client._id,
      title: 'Client deleted',
      description: `${client.company || client.name} was deleted.`,
      relatedClient: client._id,
    });

    emitLiveEvent('clientDeleted', req.params.id);

    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOnboardingStep = async (req, res) => {
  try {
    const { step, value } = req.body;
    const allowed = ['welcomeEmailSent', 'projectCreated', 'teamAssigned', 'kickoffCallScheduled', 'portalActivated'];
    if (!allowed.includes(step)) return res.status(400).json({ success: false, message: 'Invalid onboarding step' });

    const update = { [`onboardingSteps.${step}`]: Boolean(value) };
    const client = await Client.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const steps = client.onboardingSteps;
    const allDone = Object.values(steps.toObject ? steps.toObject() : steps).every(Boolean);
    client.onboardingCompleted = allDone;
    await client.save();

    await createActivityLog({
      actor: req.user,
      action: 'client.onboarding.updated',
      entityType: 'client',
      entityId: client._id,
      title: 'Client onboarding updated',
      description: `${step} was marked ${value ? 'complete' : 'incomplete'}.`,
      relatedClient: client._id,
      metadata: { step, value: Boolean(value) },
    });

    res.json({ success: true, client: serializeClient(client) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const activatePortal = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const portalUser = await ensureClientUserAccount(client, req.user);
    if (!portalUser) {
      return res.status(400).json({ success: false, message: 'Client must have a valid email to activate portal' });
    }

    client.onboardingSteps.portalActivated = true;
    client.onboardingCompleted = Object.values(client.onboardingSteps.toObject ? client.onboardingSteps.toObject() : client.onboardingSteps).every(Boolean);
    await client.save();

    const rawPhone = (client.phone || '').toString().trim();
    const portalPassword = rawPhone.length >= 6 ? rawPhone : (rawPhone ? rawPhone.padEnd(6, '0') : 'Client@123');

    try {
      await sendEmail({
        to: client.email,
        subject: 'Your Client Portal is Ready - RISE WITH MEDIA',
        html: `<h2>Welcome ${client.name}!</h2><p>Your portal is now active.</p><p>Username / Email: <strong>${client.email}</strong></p><p>Password (Phone number): <strong>${portalPassword}</strong></p><p>Login at: ${process.env.CLIENT_URL || 'http://localhost:5175'}/login</p>`,
      });
    } catch (emailErr) {
      console.warn('⚠️ Could not send portal activation email:', emailErr.message);
    }

    await createActivityLog({
      actor: req.user,
      action: 'client.portal.activated',
      entityType: 'client',
      entityId: client._id,
      title: 'Client portal activated',
      description: `${client.company || client.name} portal was activated.`,
      relatedClient: client._id,
      relatedUser: portalUser._id,
    });

    res.json({
      success: true,
      message: 'Client portal activated and credentials configured',
      client: serializeClient(client),
      credentials: { email: portalUser.email, password: portalPassword },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncPortalUsersHandler = async (req, res) => {
  try {
    const count = await syncAllClientUsers();
    res.json({ success: true, message: `Successfully synchronized ${count} client portal accounts.`, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

