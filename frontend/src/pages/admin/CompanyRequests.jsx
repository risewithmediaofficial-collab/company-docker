import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Check,
  X,
  Shield,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Users2,
  FolderKanban,
  Calendar,
  Layers,
  Settings2,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Info,
  Download,
  FileDown,
  Radio,
  Copy,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { enterGhostMode } from '../../store/slices/authSlice';
import WorkspacePage from '../../components/ui/WorkspacePage';
import DatabaseView from '../../components/ui/DatabaseView';
import { Button } from '../../components/ui/button';
import {
  exportCompanyDetailsToPDF,
  exportCompanyListToPDF,
} from '../../utils/pdfExport';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';

const planBadge = {
  trial: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700',
  starter: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800',
  growth: 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/40 dark:border-violet-800',
  pro: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800',
};

const statusBadge = {
  pending: 'text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800',
  active: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800',
  suspended: 'text-rose-700 bg-rose-50 border-rose-300 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800',
  expired: 'text-slate-600 bg-slate-100 border-slate-300 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700',
};

const statusIcons = {
  pending: Clock,
  active: CheckCircle2,
  suspended: AlertTriangle,
  expired: XCircle,
};

const ALL_MODULES = [
  { key: 'crm', label: 'CRM & Leads', always: true },
  { key: 'clients', label: 'Clients', always: true },
  { key: 'projects', label: 'Projects', always: true },
  { key: 'tasks', label: 'Tasks', always: true },
  { key: 'finance', label: 'Finance & Invoicing', always: false },
  { key: 'hr', label: 'HR & Hiring', always: false },
  { key: 'attendance', label: 'Attendance & EOD', always: false },
  { key: 'proposals', label: 'Proposals', always: false },
  { key: 'portal', label: 'Client Portal', always: false },
  { key: 'reports', label: 'Reports & Analytics', always: false },
  { key: 'sop', label: 'SOP Library', always: false },
  { key: 'assets', label: 'Asset Library', always: false },
  { key: 'smm', label: 'SMM Module', always: false },
  { key: 'automations', label: 'Automations', always: false },
  { key: 'influencers', label: 'Influencer Hub', always: false },
  { key: 'ai', label: 'AI Features', always: false },
];

const PLAN_PRESETS = {
  trial: { maxUsers: 3, maxClients: 5, modules: ['crm', 'clients', 'projects', 'tasks'] },
  starter: { maxUsers: 10, maxClients: 25, modules: ['crm', 'clients', 'projects', 'tasks', 'finance', 'hr', 'attendance', 'portal', 'proposals', 'reports'] },
  growth: { maxUsers: 25, maxClients: 100, modules: ['crm', 'clients', 'projects', 'tasks', 'finance', 'hr', 'attendance', 'smm', 'portal', 'sop', 'assets', 'proposals', 'reports', 'automations', 'influencers'] },
  pro: { maxUsers: 999, maxClients: 9999, modules: ['crm', 'clients', 'projects', 'tasks', 'finance', 'hr', 'attendance', 'smm', 'portal', 'sop', 'assets', 'proposals', 'reports', 'automations', 'influencers', 'ai'] },
};

export default function CompanyRequests() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Stealth Live View switch
  const handleLiveViewCRM = (org) => {
    dispatch(enterGhostMode(org));
    if (queryClient) {
      queryClient.clear();
    }
    toast.success(`Stealth Live View Activated for "${org.name} + RWM". Tenant is unaware.`);
    navigate('/');
  };

  // Edit / Details form state inside modal
  const [editPlan, setEditPlan] = useState('trial');
  const [editMaxUsers, setEditMaxUsers] = useState(3);
  const [editMaxClients, setEditMaxClients] = useState(5);
  const [editModules, setEditModules] = useState({});
  const [editAdminNotes, setEditAdminNotes] = useState('');

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/platform/organizations?limit=100', {
        headers: getHeaders(),
      });
      setOrgs(res.data.organizations || []);
    } catch {
      toast.error('Failed to load company registration requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Quick Approve
  const handleApprove = async (orgId, planToApply = 'trial') => {
    setActionLoading(true);
    try {
      const preset = PLAN_PRESETS[planToApply] || PLAN_PRESETS.trial;
      const modulesObj = {};
      ALL_MODULES.forEach((m) => {
        modulesObj[m.key] = preset.modules.includes(m.key);
      });

      await axios.put(
        `/api/platform/organizations/${orgId}/approve`,
        {
          plan: planToApply,
          maxUsers: preset.maxUsers,
          maxClients: preset.maxClients,
          enabledModules: modulesObj,
        },
        { headers: getHeaders() }
      );
      toast.success('Company and owner account approved & activated successfully!');
      fetchOrganizations();
      if (selectedOrg?._id === orgId) {
        setSelectedOrg(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve company registration');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Reject
  const handleReject = async (orgId, companyName) => {
    if (!window.confirm(`Are you sure you want to reject the registration for "${companyName}"? This will remove the company and owner account.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await axios.delete(`/api/platform/organizations/${orgId}`, {
        headers: getHeaders(),
      });
      toast.success(`Registration for "${companyName}" has been rejected`);
      fetchOrganizations();
      if (selectedOrg?._id === orgId) {
        setSelectedOrg(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject registration');
    } finally {
      setActionLoading(false);
    }
  };

  // Suspend
  const handleSuspend = async (orgId) => {
    const reason = window.prompt('Enter reason for suspension:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await axios.put(
        `/api/platform/organizations/${orgId}/suspend`,
        { reason },
        { headers: getHeaders() }
      );
      toast.success('Company suspended');
      fetchOrganizations();
      if (selectedOrg?._id === orgId) {
        setSelectedOrg(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend company');
    } finally {
      setActionLoading(false);
    }
  };

  // Reactivate
  const handleReactivate = async (orgId) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/platform/organizations/${orgId}/reactivate`, {}, { headers: getHeaders() });
      toast.success('Company reactivated successfully');
      fetchOrganizations();
      if (selectedOrg?._id === orgId) {
        setSelectedOrg(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate company');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Plan & Modules from detail modal
  const handleSavePlanChanges = async () => {
    if (!selectedOrg) return;
    setActionLoading(true);
    try {
      await axios.put(
        `/api/platform/organizations/${selectedOrg._id}/plan`,
        {
          plan: editPlan,
          maxUsers: editMaxUsers,
          maxClients: editMaxClients,
          enabledModules: editModules,
          adminNotes: editAdminNotes,
        },
        { headers: getHeaders() }
      );
      toast.success('Company plan, limits & modules updated successfully');
      fetchOrganizations();
      setSelectedOrg(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan settings');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailsModal = (org) => {
    setSelectedOrg(org);
    setEditPlan(org.plan || 'trial');
    setEditMaxUsers(org.maxUsers || 3);
    setEditMaxClients(org.maxClients || 5);
    setEditModules({ ...org.enabledModules });
    setEditAdminNotes(org.adminNotes || '');
  };

  const applyPlanPreset = (planKey) => {
    setEditPlan(planKey);
    const preset = PLAN_PRESETS[planKey];
    if (preset) {
      setEditMaxUsers(preset.maxUsers);
      setEditMaxClients(preset.maxClients);
      const mods = {};
      ALL_MODULES.forEach((m) => {
        mods[m.key] = preset.modules.includes(m.key);
      });
      setEditModules(mods);
    }
  };

  const toggleModuleState = (key) => {
    const mod = ALL_MODULES.find((m) => m.key === key);
    if (mod?.always) return;
    setEditModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Metrics
  const totalCount = orgs.length;
  const pendingCount = orgs.filter((o) => o.planStatus === 'pending').length;
  const activeCount = orgs.filter((o) => o.planStatus === 'active').length;
  const suspendedCount = orgs.filter((o) => o.planStatus === 'suspended').length;

  // Filtered list
  const filteredOrgs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orgs.filter((o) => {
      const name = (o.name || '').toLowerCase();
      const ownerName = (o.ownerId?.name || '').toLowerCase();
      const ownerEmail = (o.ownerId?.email || '').toLowerCase();
      const industry = (o.industry || '').toLowerCase();

      const matchesSearch =
        !term ||
        name.includes(term) ||
        ownerName.includes(term) ||
        ownerEmail.includes(term) ||
        industry.includes(term);

      const matchesStatus = statusFilter === 'all' || o.planStatus === statusFilter;
      const matchesPlan = planFilter === 'all' || o.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [orgs, searchTerm, statusFilter, planFilter]);

  // Table Columns
  const tableColumns = [
    {
      key: 'company',
      label: 'Company',
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-border/60">
            {o.logo ? (
              <img src={o.logo} alt={o.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              o.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-sm text-foreground truncate">{o.name}</p>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                + RWM
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{o.industry || 'General Business'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Account Owner',
      render: (o) => (
        <div>
          <p className="font-semibold text-xs text-foreground">{o.ownerId?.name || 'Unknown'}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Mail size={11} />
            <span>{o.ownerId?.email}</span>
          </p>
          {o.ownerId?.phone && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Phone size={11} />
              <span>{o.ownerId.phone}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan & Status',
      render: (o) => {
        const StatusIcon = statusIcons[o.planStatus] || Clock;
        return (
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                statusBadge[o.planStatus] || statusBadge.pending
              }`}
            >
              <StatusIcon size={11} />
              {o.planStatus}
            </span>
            <div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                  planBadge[o.plan] || planBadge.trial
                }`}
              >
                {o.plan}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'portalUrl',
      label: 'Login Portal URL',
      render: (o) => {
        const slug = o.slug || (o.name ? o.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '');
        const portalPath = `/login/${slug}`;
        const fullUrl = `${window.location.origin}${portalPath}`;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/50 truncate max-w-[140px]"
              title={fullUrl}
            >
              {portalPath}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(fullUrl);
                toast.success(`Copied portal URL: ${fullUrl}`);
              }}
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Copy branded portal link"
            >
              <Copy size={13} />
            </button>
            <a
              href={portalPath}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-blue-600 transition-colors"
              title="Open portal in new tab"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        );
      },
    },
    {
      key: 'limits',
      label: 'Limits',
      render: (o) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="flex items-center gap-1">
            <Users2 size={12} />
            <span>Max Users: <strong className="text-foreground">{o.maxUsers || 3}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <FolderKanban size={12} />
            <span>Max Clients: <strong className="text-foreground">{o.maxClients || 5}</strong></span>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registered Date',
      render: (o) => (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {new Date(o.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-[11px]">
            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          {o.planStatus === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(o._id, o.plan)}
                disabled={actionLoading}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                title="Approve Company & Owner"
              >
                <Check size={12} />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleReject(o._id, o.name)}
                disabled={actionLoading}
                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-1 border border-rose-500/20 transition-all"
                title="Reject Registration"
              >
                <X size={12} />
                <span>Reject</span>
              </button>
            </>
          )}
          {o.planStatus === 'active' && (
            <button
              onClick={() => handleSuspend(o._id)}
              disabled={actionLoading}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-rose-600 text-xs font-semibold transition-all"
              title="Suspend Company"
            >
              Suspend
            </button>
          )}
          {o.planStatus === 'suspended' && (
            <button
              onClick={() => handleReactivate(o._id)}
              disabled={actionLoading}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 text-xs font-bold transition-all"
              title="Reactivate Company"
            >
              Reactivate
            </button>
          )}
          <button
            onClick={() => handleLiveViewCRM(o)}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white text-xs font-bold flex items-center gap-1 border border-indigo-500/20 transition-all shadow-xs"
            title="Live View Company CRM (Stealth Ghost Mode)"
          >
            <Radio size={12} className="animate-pulse text-emerald-500" />
            <span>Live CRM</span>
          </button>
          <button
            onClick={() => exportCompanyDetailsToPDF(o)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-indigo-600 transition-all"
            title="Export Company Dossier as PDF"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => openDetailsModal(o)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="View All Details & Configure"
          >
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ];

  // Cards Render
  const renderCard = (o) => {
    const StatusIcon = statusIcons[o.planStatus] || Clock;
    return (
      <div className="space-y-3.5 flex flex-col justify-between h-full">
        {/* Top Badges */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                planBadge[o.plan] || planBadge.trial
              }`}
            >
              {o.plan} Plan
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                statusBadge[o.planStatus] || statusBadge.pending
              }`}
            >
              <StatusIcon size={11} />
              {o.planStatus}
            </span>
          </div>

          {/* Company Title */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300 flex items-center justify-center font-black text-base shrink-0 shadow-sm overflow-hidden border border-border/60">
              {o.logo ? (
                <img src={o.logo} alt={o.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                o.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-base text-foreground leading-snug truncate">{o.name}</h4>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                  + RWM
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{o.industry || 'General Industry'}</p>
              {o.website && (
                <a
                  href={o.website.startsWith('http') ? o.website : `https://${o.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
                >
                  <Globe size={11} />
                  <span className="truncate">{o.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={9} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Owner & Account Details Card */}
        <div className="p-3 rounded-2xl bg-secondary/40 border border-border/60 space-y-1.5 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-border/30">
            <span className="text-muted-foreground font-medium">Account Owner:</span>
            <span className="font-bold text-foreground">{o.ownerId?.name || 'Pending Owner'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium text-foreground truncate max-w-[180px]">{o.ownerId?.email}</span>
          </div>
          {o.ownerId?.phone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{o.ownerId.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Registered:</span>
            <span className="font-medium text-foreground">
              {new Date(o.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/30">
            <span className="text-muted-foreground">Limits:</span>
            <span className="font-semibold text-foreground">
              {o.maxUsers || 3} Users • {o.maxClients || 5} Clients
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
            <span className="text-muted-foreground">Portal URL:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/40 truncate max-w-[130px]">
                {`/login/${o.slug || (o.name ? o.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '')}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  const slug = o.slug || (o.name ? o.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '');
                  const url = `${window.location.origin}/login/${slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success(`Copied portal URL: ${url}`);
                }}
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Copy portal link"
              >
                <Copy size={11} />
              </button>
              <a
                href={`/login/${o.slug || (o.name ? o.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-blue-600 transition-colors"
                title="Open portal"
              >
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>

        {/* Pending Action Bar */}
        {o.planStatus === 'pending' && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Clock size={13} />
              <span>Awaiting Approval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApprove(o._id, o.plan)}
                disabled={actionLoading}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                title="Approve Company & Owner"
              >
                <Check size={13} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => handleReject(o._id, o.name)}
                disabled={actionLoading}
                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-1 border border-rose-500/20 transition-all"
                title="Reject Registration"
              >
                <X size={13} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
          <span className="text-[11px] text-muted-foreground">
            Role: <code className="font-mono text-primary font-bold">organizationOwner</code>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleLiveViewCRM(o)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white font-bold text-xs flex items-center gap-1 border border-indigo-500/20 transition-all shadow-xs"
              title="Live View Company CRM (Stealth Ghost Mode)"
            >
              <Radio size={12} className="animate-pulse text-emerald-500" />
              <span>Live CRM</span>
            </button>
            <button
              onClick={() => exportCompanyDetailsToPDF(o)}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs flex items-center gap-1 transition-all"
              title="Export Company Dossier as PDF"
            >
              <Download size={12} />
              <span>PDF</span>
            </button>
            <button
              onClick={() => openDetailsModal(o)}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs flex items-center gap-1 transition-all"
            >
              <Eye size={12} />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <WorkspacePage
      breadcrumbs={['RiseWithMedia', 'Administration', 'Company Registration Requests']}
      title="Company Registration Requests"
      subtitle="Review, approve, and configure new SaaS company accounts and tenant onboarding requests."
      icon={Building2}
      properties={[
        { label: 'Total Requests', value: totalCount, icon: Building2 },
        {
          label: 'Pending Review',
          value: pendingCount,
          tone: pendingCount > 0 ? 'warning' : 'neutral',
          icon: Clock,
        },
        { label: 'Active Companies', value: activeCount, tone: 'success', icon: CheckCircle2 },
        { label: 'Suspended', value: suspendedCount, tone: suspendedCount > 0 ? 'danger' : 'neutral', icon: AlertTriangle },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => exportCompanyListToPDF(filteredOrgs, statusFilter)}
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
            title="Export filtered list of company registrations as a PDF report"
          >
            <Download size={13} />
            <span>Export PDF Report</span>
          </Button>
          <Button
            size="sm"
            onClick={fetchOrganizations}
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      }
    >
      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'active', label: 'Active' },
            { key: 'suspended', label: 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plan Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-8 px-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Plans</option>
            <option value="trial">Trial</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </div>

      {/* Database View (Cards and Table) */}
      <DatabaseView
        viewKey="rwm_company_requests_view_v1"
        views={['cards', 'table']}
        items={filteredOrgs}
        totalCount={filteredOrgs.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by company name, owner, email, or industry..."
        columns={tableColumns}
        tableColumns={tableColumns}
        renderCard={renderCard}
        isLoading={loading}
        emptyMessage="No company registration requests found matching your filters."
      />

      {/* Full Detail & Plan Configuration Modal */}
      <Dialog open={Boolean(selectedOrg)} onOpenChange={(open) => !open && setSelectedOrg(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8 pb-3 border-b border-border/40">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300 flex items-center justify-center font-black text-xl overflow-hidden border border-border/60 shrink-0 shadow-sm">
                  {selectedOrg?.logo ? (
                    <img src={selectedOrg.logo} alt={selectedOrg.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    selectedOrg?.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                      {selectedOrg?.name}
                    </DialogTitle>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                      + RWM
                    </span>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Company Registration &amp; SaaS Tenant Configuration
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleLiveViewCRM(selectedOrg)}
                  className="whitespace-nowrap shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                  title="Live View Company CRM (Stealth Ghost Mode)"
                >
                  <Radio size={13} className="animate-pulse text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap">Live View CRM</span>
                </button>
                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${
                    statusBadge[selectedOrg?.planStatus] || statusBadge.pending
                  }`}
                >
                  {(() => {
                    const SIcon = statusIcons[selectedOrg?.planStatus] || Clock;
                    return <SIcon size={12} className="shrink-0" />;
                  })()}
                  <span>{selectedOrg?.planStatus}</span>
                </span>
              </div>
            </div>
          </DialogHeader>

          {selectedOrg && (
            <div className="space-y-6 pt-2">
              {/* Section 1: Company & Owner Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Details */}
                <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-card/40 border border-border/60 space-y-3 text-xs">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pb-2 border-b border-border/40">
                    <Building2 size={14} className="shrink-0" />
                    <span>Company Profile</span>
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Company Name:</span>
                      <span className="font-bold text-foreground text-right truncate">{selectedOrg.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Industry:</span>
                      <span className="font-semibold text-foreground text-right truncate">{selectedOrg.industry || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Website:</span>
                      {selectedOrg.website ? (
                        <a
                          href={selectedOrg.website.startsWith('http') ? selectedOrg.website : `https://${selectedOrg.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 text-right truncate max-w-[200px]"
                        >
                          <span className="truncate">{selectedOrg.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Registered Date:</span>
                      <span className="font-semibold text-foreground text-right whitespace-nowrap">
                        {new Date(selectedOrg.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Owner Details */}
                <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-card/40 border border-border/60 space-y-3 text-xs">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pb-2 border-b border-border/40">
                    <Shield size={14} className="shrink-0" />
                    <span>Account Owner (Admin)</span>
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Owner Name:</span>
                      <span className="font-bold text-foreground text-right truncate">{selectedOrg.ownerId?.name || 'Pending Owner'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Email:</span>
                      <a href={`mailto:${selectedOrg.ownerId?.email}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-right truncate max-w-[200px]">
                        {selectedOrg.ownerId?.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Phone:</span>
                      <span className="font-semibold text-foreground text-right">{selectedOrg.ownerId?.phone || selectedOrg.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-medium shrink-0">Account Role:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                        {selectedOrg.ownerId?.role === 'organizationOwner' ? 'Organization Owner' : selectedOrg.ownerId?.role || 'Organization Owner'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Plan & Privilege Configuration */}
              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sliders size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>SaaS Subscription &amp; Module Privileges</span>
                  </h5>
                  <div className="flex items-center gap-1.5">
                    {['trial', 'starter', 'growth', 'pro'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => applyPlanPreset(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                          editPlan === p
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1 text-xs">Max Users Limit</label>
                    <input
                      type="number"
                      min={1}
                      value={editMaxUsers}
                      onChange={(e) => setEditMaxUsers(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1 text-xs">Max Clients Limit</label>
                    <input
                      type="number"
                      min={1}
                      value={editMaxClients}
                      onChange={(e) => setEditMaxClients(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Module Toggles — Clean 3-column layout without truncated names */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2.5">Enabled Application Modules:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {ALL_MODULES.map((mod) => {
                      const enabled = Boolean(editModules[mod.key]);
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          onClick={() => toggleModuleState(mod.key)}
                          disabled={mod.always}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between gap-2 ${
                            enabled
                              ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300'
                              : 'bg-secondary/40 border-border/60 text-muted-foreground opacity-60 hover:opacity-100'
                          } ${mod.always ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                        >
                          <span className="font-medium text-xs leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            {mod.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                              enabled
                                ? 'bg-indigo-600 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {enabled ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Internal Admin Notes:</label>
                  <textarea
                    rows={2}
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this company account or approval verification..."
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-2">
                  {selectedOrg.planStatus === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedOrg._id, editPlan)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Check size={14} />
                        <span>Approve & Activate Company</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(selectedOrg._id, selectedOrg.name)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs flex items-center gap-1.5 border border-rose-500/20 transition-all"
                      >
                        <X size={14} />
                        <span>Reject Registration</span>
                      </button>
                    </>
                  ) : selectedOrg.planStatus === 'active' ? (
                    <button
                      type="button"
                      onClick={() => handleSuspend(selectedOrg._id)}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs flex items-center gap-1.5 border border-rose-500/20 transition-all"
                    >
                      <span>Suspend Company</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReactivate(selectedOrg._id)}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/20 transition-all"
                    >
                      <span>Reactivate Company</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportCompanyDetailsToPDF(selectedOrg)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 border border-indigo-500/20 transition-all"
                    title="Export full registration dossier as PDF"
                  >
                    <Download size={13} />
                    <span>Export PDF Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrg(null)}
                    className="px-3.5 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePlanChanges}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Save Plan Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
