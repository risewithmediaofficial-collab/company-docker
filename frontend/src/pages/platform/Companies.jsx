import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  XCircle, Eye, RefreshCw, ChevronLeft, ChevronRight, Users2, Radio,
  Check, X, Sliders, Globe, Phone, Mail, MapPin, Copy, ExternalLink,
  Shield, ShieldAlert, Sparkles, FileText, ChevronDown, CheckSquare,
  Square, ArrowUpRight, Lock, Zap
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { enterGhostMode } from '../../store/slices/authSlice';

// ── Badge Styles ─────────────────────────────────────────────────────────────
const planBadge = {
  trial:   'text-slate-300 bg-slate-800/80 border-slate-700/60',
  starter: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  growth:  'text-violet-400 bg-violet-500/10 border-violet-500/30',
  pro:     'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

const statusBadge = {
  pending:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  active:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  suspended: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  expired:   'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const statusIcons = {
  pending: Clock,
  active: CheckCircle2,
  suspended: AlertTriangle,
  expired: XCircle,
};

// ── Modules Configuration ───────────────────────────────────────────────────
const ALL_MODULES = [
  { key: 'crm',         label: 'CRM & Leads',       always: true },
  { key: 'clients',     label: 'Clients',            always: true },
  { key: 'projects',    label: 'Projects',           always: true },
  { key: 'tasks',       label: 'Tasks',              always: true },
  { key: 'finance',     label: 'Finance & Invoices', always: false },
  { key: 'hr',          label: 'HR & Hiring',        always: false },
  { key: 'attendance',  label: 'Attendance & EOD',   always: false },
  { key: 'proposals',   label: 'Proposals',          always: false },
  { key: 'portal',      label: 'Client Portal',      always: false },
  { key: 'reports',     label: 'Reports & Analytics',always: false },
  { key: 'sop',         label: 'SOPs',               always: false },
  { key: 'assets',      label: 'Asset Library',      always: false },
  { key: 'smm',         label: 'SMM Module',         always: false },
  { key: 'automations', label: 'Automations',        always: false },
  { key: 'influencers', label: 'Influencer Hub',     always: false },
  { key: 'ai',          label: 'AI Features',        always: false },
];

const PLAN_PRESETS = {
  trial:   { maxUsers: 3,   maxClients: 5,    modules: ['crm','clients','projects','tasks'] },
  starter: { maxUsers: 10,  maxClients: 25,   modules: ['crm','clients','projects','tasks','finance','hr','attendance','portal','proposals','reports'] },
  growth:  { maxUsers: 25,  maxClients: 100,  modules: ['crm','clients','projects','tasks','finance','hr','attendance','smm','portal','sop','assets','proposals','reports','automations','influencers'] },
  pro:     { maxUsers: 999, maxClients: 9999, modules: ['crm','clients','projects','tasks','finance','hr','attendance','smm','portal','sop','assets','proposals','reports','automations','influencers','ai'] },
};

const Companies = ({ defaultTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'all' | 'requests'
  const urlTab = searchParams.get('tab');
  const urlStatus = searchParams.get('status');
  const initialTab = defaultTab === 'requests' || urlTab === 'requests' || urlStatus === 'pending' ? 'requests' : 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  // State
  const [orgs, setOrgs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters
  const status = searchParams.get('status') || '';
  const plan = searchParams.get('plan') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || 1);

  // Modal State for All Details & Quick Approve
  const [detailsOrg, setDetailsOrg] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState('overview'); // overview | plan | modules | notes

  // Quick Approve Modal
  const [approveOrgTarget, setApproveOrgTarget] = useState(null);
  const [selectedPlanForApproval, setSelectedPlanForApproval] = useState('trial');

  // Edit fields in Details Modal
  const [modalPlan, setModalPlan] = useState('trial');
  const [modalMaxUsers, setModalMaxUsers] = useState(3);
  const [modalMaxClients, setModalMaxClients] = useState(5);
  const [modalModules, setModalModules] = useState({});
  const [modalAdminNotes, setModalAdminNotes] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  // ── Fetch Orgs & Pending Requests ──────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const params = new URLSearchParams();
      if (status && activeTab === 'all') params.set('status', status);
      if (plan) params.set('plan', plan);
      if (search) params.set('search', search);
      params.set('page', page);
      params.set('limit', '25');

      const [resAll, resPending] = await Promise.all([
        axios.get(`/api/platform/organizations?${params}`, { headers }),
        axios.get(`/api/platform/organizations?status=pending&limit=100`, { headers }),
      ]);

      setOrgs(resAll.data.organizations || []);
      setTotal(resAll.data.total || 0);
      setPages(resAll.data.pages || 1);
      setPendingRequests(resPending.data.organizations || []);
    } catch (err) {
      toast.error('Failed to load companies data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status, plan, search, page, activeTab]);

  // Sync tab with URL if user arrived via query param
  useEffect(() => {
    if (urlTab === 'requests' || urlStatus === 'pending') {
      setActiveTab('requests');
    }
  }, [urlTab, urlStatus]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const p = new URLSearchParams(searchParams);
    if (newTab === 'requests') {
      p.set('tab', 'requests');
      p.delete('status');
    } else {
      p.delete('tab');
      if (urlStatus === 'pending') p.delete('status');
    }
    p.delete('page');
    setSearchParams(p);
  };

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val);
    else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  // ── Stealth Live View CRM ─────────────────────────────────────────────────
  const handleLiveViewCRM = (org) => {
    dispatch(enterGhostMode(org));
    if (queryClient) {
      queryClient.clear();
    }
    toast.success(`Stealth Live View Activated for "${org.name} + RWM". Tenant is unaware.`);
    navigate('/');
  };

  // ── Open All Details Modal ────────────────────────────────────────────────
  const handleOpenDetails = (org) => {
    setDetailsOrg(org);
    setModalPlan(org.plan || 'trial');
    setModalMaxUsers(org.maxUsers ?? 3);
    setModalMaxClients(org.maxClients ?? 5);

    // Initial modules state
    const currentModules = {};
    ALL_MODULES.forEach((m) => {
      currentModules[m.key] = org.enabledModules ? Boolean(org.enabledModules[m.key]) : true;
    });
    setModalModules(currentModules);
    setModalAdminNotes(org.adminNotes || '');
    setDetailsTab('overview');
    setDetailsModalOpen(true);
  };

  // ── Handle Preset Change in Modal ─────────────────────────────────────────
  const handlePresetSelect = (presetKey) => {
    setModalPlan(presetKey);
    const preset = PLAN_PRESETS[presetKey];
    if (preset) {
      setModalMaxUsers(preset.maxUsers);
      setModalMaxClients(preset.maxClients);
      const updated = {};
      ALL_MODULES.forEach((m) => {
        updated[m.key] = m.always ? true : preset.modules.includes(m.key);
      });
      setModalModules(updated);
    }
  };

  // ── Toggle Module in Modal ────────────────────────────────────────────────
  const handleToggleModalModule = (moduleKey) => {
    setModalModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  // ── Accept / Approve Action ───────────────────────────────────────────────
  const handleApprove = async (orgId, planToApply = 'trial', customLimits = null) => {
    setActionLoadingId(orgId);
    try {
      const preset = PLAN_PRESETS[planToApply] || PLAN_PRESETS.trial;
      const modulesObj = {};
      ALL_MODULES.forEach((m) => {
        modulesObj[m.key] = m.always ? true : preset.modules.includes(m.key);
      });

      const payload = {
        plan: planToApply,
        maxUsers: customLimits?.maxUsers ?? preset.maxUsers,
        maxClients: customLimits?.maxClients ?? preset.maxClients,
        enabledModules: customLimits?.modules ?? modulesObj,
      };

      await axios.put(`/api/platform/organizations/${orgId}/approve`, payload, {
        headers: getHeaders(),
      });

      toast.success('Company and owner account approved & activated successfully!');
      setApproveOrgTarget(null);
      setDetailsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve company registration');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Reject Action ─────────────────────────────────────────────────────────
  const handleReject = async (orgId, companyName) => {
    if (!window.confirm(`Are you sure you want to reject registration for "${companyName}"? This will remove the request and owner account.`)) {
      return;
    }
    setActionLoadingId(orgId);
    try {
      await axios.delete(`/api/platform/organizations/${orgId}`, {
        headers: getHeaders(),
      });
      toast.success(`Registration request for "${companyName}" rejected and removed`);
      setDetailsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject registration');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Save Plan & Modules Changes (for active orgs) ──────────────────────────
  const handleSavePlanChanges = async () => {
    if (!detailsOrg) return;
    setIsSavingDetails(true);
    try {
      await axios.put(
        `/api/platform/organizations/${detailsOrg._id}/plan`,
        {
          plan: modalPlan,
          maxUsers: modalMaxUsers,
          maxClients: modalMaxClients,
          enabledModules: modalModules,
          adminNotes: modalAdminNotes,
        },
        { headers: getHeaders() }
      );
      toast.success('Company plan, limits and modules updated successfully!');
      setDetailsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setIsSavingDetails(false);
    }
  };

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  const handleSuspend = async (orgId) => {
    const reason = window.prompt('Enter reason for suspension:');
    if (!reason) return;
    setActionLoadingId(orgId);
    try {
      await axios.put(`/api/platform/organizations/${orgId}/suspend`, { reason }, { headers: getHeaders() });
      toast.success('Company suspended');
      setDetailsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend company');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReactivate = async (orgId) => {
    setActionLoadingId(orgId);
    try {
      await axios.put(`/api/platform/organizations/${orgId}/reactivate`, {}, { headers: getHeaders() });
      toast.success('Company reactivated successfully');
      setDetailsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate company');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper to copy text to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Pending count
  const pendingCount = pendingRequests.length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Companies & Requests</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {pendingCount} Pending Request{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Manage registered tenant organizations, approve or reject incoming requests, and inspect company details.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Pending Alert Banner (if requests waiting) ───────────────────────── */}
      {pendingCount > 0 && activeTab === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {pendingCount} Company Registration Request{pendingCount > 1 ? 's' : ''} Awaiting Review
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                New businesses have requested a workspace. Review their details and choose to Accept or Reject.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleTabChange('requests')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 flex-shrink-0"
          >
            Review Requests Now
            <ArrowUpRight size={14} />
          </button>
        </motion.div>
      )}

      {/* ── Main Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px">
        <button
          onClick={() => handleTabChange('all')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-t-xl text-sm font-medium transition-all relative ${
            activeTab === 'all'
              ? 'text-white bg-white/5 border-t-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Building2 size={16} className={activeTab === 'all' ? 'text-indigo-400' : ''} />
          <span>All Companies</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
            {total}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('requests')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-t-xl text-sm font-medium transition-all relative ${
            activeTab === 'requests'
              ? 'text-white bg-white/5 border-t-2 border-amber-500'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Clock size={16} className={activeTab === 'requests' ? 'text-amber-400' : ''} />
          <span>Company Requests</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
              pendingCount > 0
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'bg-white/10 text-slate-400'
            }`}
          >
            {pendingCount}
          </span>
        </button>
      </div>

      {/* ── TAB 1: COMPANY REQUESTS (PENDING APPROVALS) ──────────────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-400">
            <div>
              <p className="font-semibold text-white">Pending Tenant Registration Requests</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Each company registers with a domain URL. When accepted, their owner account is activated.
              </p>
            </div>
            <div className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300">
              Showing {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw size={24} className="animate-spin text-indigo-400" />
              <p className="text-sm">Loading pending company requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-white font-semibold text-base">All Caught Up!</p>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  There are no pending company registration requests at this time. New registrations from the public portal will appear here automatically.
                </p>
              </div>
              <button
                onClick={() => handleTabChange('all')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
              >
                <Building2 size={14} />
                View All Companies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((org) => {
                const owner = org.ownerId || {};
                const isLoadingThis = actionLoadingId === org._id;
                const portalLoginUrl = `${window.location.origin}/${org.slug}`;

                return (
                  <motion.div
                    key={org._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-b from-[#111422] to-[#0c0e18] border border-amber-500/20 hover:border-amber-500/40 transition-all shadow-xl shadow-black/40 space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Company Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-lg flex-shrink-0">
                          {org.name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-white font-bold text-base tracking-tight truncate">
                              {org.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              /{org.slug}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Pending Approval
                            </span>
                          </div>

                          <p className="text-slate-400 text-xs flex flex-wrap items-center gap-3">
                            {org.industry && <span>Industry: <strong className="text-slate-300">{org.industry}</strong></span>}
                            {org.website && (
                              <a
                                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <Globe size={11} />
                                {org.website}
                              </a>
                            )}
                            <span className="text-slate-500">
                              Requested {new Date(org.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: Accept, Reject, All Details */}
                      <div className="flex items-center flex-wrap gap-2.5 lg:self-center">
                        {/* 1. All Details Button */}
                        <button
                          onClick={() => handleOpenDetails(org)}
                          disabled={isLoadingThis}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all hover:border-white/20"
                          title="View all details, contact info, configure plan and modules"
                        >
                          <Sliders size={14} className="text-indigo-400" />
                          All Details
                        </button>

                        {/* 2. Reject Button */}
                        <button
                          onClick={() => handleReject(org._id, org.name)}
                          disabled={isLoadingThis}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all shadow-sm"
                          title="Reject and delete this registration request"
                        >
                          <X size={14} />
                          Reject
                        </button>

                        {/* 3. Accept Button */}
                        <button
                          onClick={() => {
                            setApproveOrgTarget(org);
                            setSelectedPlanForApproval('trial');
                          }}
                          disabled={isLoadingThis}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 border border-emerald-400/30"
                          title="Accept and activate company workspace"
                        >
                          {isLoadingThis ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} className="stroke-[3]" />
                          )}
                          Accept
                        </button>
                      </div>
                    </div>

                    {/* Requester & Workspace Preview Subpanel */}
                    <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Owner info */}
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                          {owner.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{owner.name || 'No owner name'}</p>
                          <p className="text-slate-400 truncate">{owner.email || 'No email'}</p>
                        </div>
                      </div>

                      {/* Phone / Contact */}
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                          <Phone size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-400 text-[10px] uppercase font-semibold">Phone Contact</p>
                          <p className="text-slate-200 truncate">{owner.phone || org.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      {/* Login URL */}
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-slate-400 text-[10px] uppercase font-semibold">Dedicated Login URL</p>
                          <p className="text-indigo-400 font-mono truncate">/{org.slug}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(portalLoginUrl, 'Login URL')}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex-shrink-0"
                          title="Copy Company Portal URL"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ALL COMPANIES (TABLE VIEW) ─────────────────────────────────── */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search company or owner..."
                value={search}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={status}
                onChange={(e) => setFilter('status', e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition-all flex-1 md:flex-none"
              >
                <option value="" className="bg-[#111422] text-white">All Status</option>
                <option value="pending" className="bg-[#111422] text-white">Pending Approval</option>
                <option value="active" className="bg-[#111422] text-white">Active</option>
                <option value="suspended" className="bg-[#111422] text-white">Suspended</option>
                <option value="expired" className="bg-[#111422] text-white">Expired</option>
              </select>

              <select
                value={plan}
                onChange={(e) => setFilter('plan', e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition-all flex-1 md:flex-none"
              >
                <option value="" className="bg-[#111422] text-white">All Plans</option>
                <option value="trial" className="bg-[#111422] text-white">Trial</option>
                <option value="starter" className="bg-[#111422] text-white">Starter</option>
                <option value="growth" className="bg-[#111422] text-white">Growth</option>
                <option value="pro" className="bg-[#111422] text-white">Pro</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Owner</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Plan</th>
                    <th className="px-6 py-3.5">Users</th>
                    <th className="px-6 py-3.5">Registered</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-500">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-400" />
                        Loading companies...
                      </td>
                    </tr>
                  ) : orgs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-500">
                        <Building2 size={32} className="mx-auto mb-2 opacity-40" />
                        No companies found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    orgs.map((org) => {
                      const StatusIcon = statusIcons[org.planStatus] || Clock;
                      const owner = org.ownerId || {};
                      const isPending = org.planStatus === 'pending';
                      const isActive = org.planStatus === 'active';
                      const isSuspended = org.planStatus === 'suspended';
                      const isLoadingThis = actionLoadingId === org._id;

                      return (
                        <tr
                          key={org._id}
                          className="hover:bg-white/[0.03] transition-colors group"
                        >
                          {/* Company Name & Slug */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0">
                                {org.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold truncate flex items-center gap-1.5">
                                  {org.name}
                                  {org.slug && (
                                    <span className="text-[10px] font-mono text-indigo-400 font-normal">
                                      /{org.slug}
                                    </span>
                                  )}
                                </p>
                                <p className="text-slate-400 text-xs truncate">
                                  {org.industry || 'Business Workspace'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Owner */}
                          <td className="px-6 py-4">
                            <p className="text-slate-200 text-xs font-medium truncate">{owner.name || '—'}</p>
                            <p className="text-slate-500 text-[11px] truncate">{owner.email || '—'}</p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                statusBadge[org.planStatus] || statusBadge.pending
                              }`}
                            >
                              <StatusIcon size={12} />
                              {org.planStatus}
                            </span>
                          </td>

                          {/* Plan */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                                planBadge[org.plan] || planBadge.trial
                              }`}
                            >
                              {org.plan}
                            </span>
                          </td>

                          {/* Users */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <Users2 size={13} />
                              <span>{org.userCount ?? 1}</span>
                              <span className="text-slate-600">/ {org.maxUsers ?? 3}</span>
                            </div>
                          </td>

                          {/* Registered */}
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {new Date(org.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If Pending: ACCEPT + REJECT + ALL DETAILS */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleOpenDetails(org)}
                                    disabled={isLoadingThis}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-all"
                                    title="View all details"
                                  >
                                    All Details
                                  </button>
                                  <button
                                    onClick={() => handleReject(org._id, org.name)}
                                    disabled={isLoadingThis}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
                                    title="Reject request"
                                  >
                                    <X size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setApproveOrgTarget(org);
                                      setSelectedPlanForApproval('trial');
                                    }}
                                    disabled={isLoadingThis}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                                    title="Accept and activate"
                                  >
                                    <Check size={13} />
                                    Accept
                                  </button>
                                </>
                              )}

                              {/* If Active: LIVE VIEW + ALL DETAILS / MANAGE + SUSPEND */}
                              {isActive && (
                                <>
                                  <button
                                    onClick={() => handleLiveViewCRM(org)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all hover:border-emerald-500/40"
                                    title="Stealth Live View into Tenant's CRM"
                                  >
                                    <Radio size={13} className="text-emerald-400 animate-pulse" />
                                    Live View
                                  </button>
                                  <button
                                    onClick={() => handleOpenDetails(org)}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-all"
                                    title="View details & configure quotas"
                                  >
                                    All Details
                                  </button>
                                  <button
                                    onClick={() => handleSuspend(org._id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all"
                                    title="Suspend company"
                                  >
                                    Suspend
                                  </button>
                                </>
                              )}

                              {/* If Suspended: REACTIVATE + ALL DETAILS + LIVE VIEW */}
                              {isSuspended && (
                                <>
                                  <button
                                    onClick={() => handleReactivate(org._id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                                  >
                                    Reactivate
                                  </button>
                                  <button
                                    onClick={() => handleOpenDetails(org)}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs"
                                  >
                                    All Details
                                  </button>
                                  <button
                                    onClick={() => handleLiveViewCRM(org)}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs"
                                  >
                                    <Radio size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 text-xs text-slate-400">
                <span>Page {page} of {pages}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilter('page', page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setFilter('page', page + 1)}
                    disabled={page >= pages}
                    className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 1: QUICK APPROVE MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {approveOrgTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#111422] border border-white/10 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Approve Company Request</h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Activating workspace for <strong className="text-white">{approveOrgTarget.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setApproveOrgTarget(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Select Initial Plan Tier */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Initial SaaS Plan
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'trial', label: 'Trial (14 Days)', desc: '3 Users, 5 Clients, Core CRM' },
                    { key: 'starter', label: 'Starter Tier', desc: '10 Users, 25 Clients, Finance & HR' },
                    { key: 'growth', label: 'Growth Tier', desc: '25 Users, 100 Clients, Full Features' },
                    { key: 'pro', label: 'Pro / Enterprise', desc: 'Unlimited Users, AI Suite' },
                  ].map((p) => {
                    const active = selectedPlanForApproval === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setSelectedPlanForApproval(p.key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        <p className={`text-xs font-bold ${active ? 'text-indigo-400' : 'text-slate-300'}`}>
                          {p.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-tight">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Info Summary */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tenant Domain Slug:</span>
                  <span className="text-indigo-400 font-mono font-bold">/{approveOrgTarget.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner Email:</span>
                  <span className="text-slate-200 font-medium">{approveOrgTarget.ownerId?.email || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner Account:</span>
                  <span className="text-emerald-400 font-semibold">Will be Activated Immediately</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setApproveOrgTarget(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(approveOrgTarget._id, selectedPlanForApproval)}
                  disabled={actionLoadingId === approveOrgTarget._id}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25"
                >
                  {actionLoadingId === approveOrgTarget._id ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} className="stroke-[3]" />
                  )}
                  Confirm & Activate Company
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: ALL DETAILS COMPREHENSIVE MODAL ──────────────────────────── */}
      <AnimatePresence>
        {detailsModalOpen && detailsOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-2xl bg-[#0e111d] border border-white/10 p-6 shadow-2xl space-y-6 my-8"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                    {detailsOrg.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">{detailsOrg.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusBadge[detailsOrg.planStatus] || statusBadge.pending}`}>
                        {detailsOrg.planStatus}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Registered on {new Date(detailsOrg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/platform/companies/${detailsOrg._id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
                  >
                    Full Page
                    <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => setDetailsModalOpen(false)}
                    className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Sub-tabs in Details Modal */}
              <div className="flex items-center gap-1 border-b border-white/10 pb-2 text-xs font-medium">
                {[
                  { key: 'overview', label: 'Company & Owner Profile' },
                  { key: 'plan', label: 'Plan & Resource Quotas' },
                  { key: 'modules', label: 'Enabled Modules' },
                  { key: 'notes', label: 'Internal Notes' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setDetailsTab(t.key)}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      detailsTab === t.key
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Details Content: OVERVIEW */}
              {detailsTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company details card */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                      <p className="text-white font-semibold text-sm flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-400" />
                        Company Details
                      </p>
                      <div className="space-y-2 text-slate-300">
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Company Name:</span>
                          <span className="font-medium text-white">{detailsOrg.name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Domain URL Slug:</span>
                          <span className="font-mono text-indigo-400">/{detailsOrg.slug}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Industry:</span>
                          <span>{detailsOrg.industry || 'General Business'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Website:</span>
                          <span>{detailsOrg.website || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Company Phone:</span>
                          <span>{detailsOrg.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Address:</span>
                          <span className="text-right truncate max-w-[200px]">{detailsOrg.address || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Owner credentials & Contact card */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                      <p className="text-white font-semibold text-sm flex items-center gap-2">
                        <Shield size={16} className="text-emerald-400" />
                        Primary Owner & Admin
                      </p>
                      <div className="space-y-2 text-slate-300">
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Owner Name:</span>
                          <span className="font-medium text-white">{detailsOrg.ownerId?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Owner Email:</span>
                          <span className="text-slate-200 font-mono">{detailsOrg.ownerId?.email || '—'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Owner Phone:</span>
                          <span>{detailsOrg.ownerId?.phone || detailsOrg.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500">Role Assigned:</span>
                          <span className="text-indigo-300 font-semibold">organizationOwner</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Account Status:</span>
                          <span className={detailsOrg.planStatus === 'active' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                            {detailsOrg.planStatus === 'active' ? 'Active & Logged In' : 'Pending Activation'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Login Link preview */}
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold text-xs">Dedicated Company Login Portal</p>
                      <p className="text-slate-400 text-[11px]">
                        Users in this tenant can sign in at: <strong className="text-indigo-300 font-mono">{window.location.origin}/{detailsOrg.slug}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${window.location.origin}/${detailsOrg.slug}`, 'Company Login URL')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                    >
                      <Copy size={13} />
                      Copy URL
                    </button>
                  </div>
                </div>
              )}

              {/* Details Content: PLAN & QUOTAS */}
              {detailsTab === 'plan' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">SaaS Plan Tier</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['trial', 'starter', 'growth', 'pro'].map((p) => {
                        const active = modalPlan === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePresetSelect(p)}
                            className={`p-3 rounded-xl border text-center transition-all uppercase font-bold text-xs ${
                              active
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                                : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <label className="text-slate-300 font-semibold block">Max Users Allowed</label>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={modalMaxUsers}
                        onChange={(e) => setModalMaxUsers(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-slate-500 text-[11px]">Maximum employees/managers allowed in this tenant</p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <label className="text-slate-300 font-semibold block">Max Clients Allowed</label>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={modalMaxClients}
                        onChange={(e) => setModalMaxClients(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-slate-500 text-[11px]">Maximum client accounts or brands they can create</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Details Content: MODULES CHECKLIST */}
              {detailsTab === 'modules' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-400">
                    Enable or disable specific features for this company. Core modules (CRM, Clients, Projects, Tasks) are always active.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {ALL_MODULES.map((m) => {
                      const enabled = m.always ? true : Boolean(modalModules[m.key]);
                      return (
                        <div
                          key={m.key}
                          onClick={() => {
                            if (!m.always) handleToggleModalModule(m.key);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 select-none transition-all ${
                            m.always
                              ? 'bg-indigo-600/10 border-indigo-500/20 text-slate-300 cursor-not-allowed'
                              : enabled
                              ? 'bg-emerald-600/10 border-emerald-500/30 text-white cursor-pointer hover:bg-emerald-600/20'
                              : 'bg-black/30 border-white/5 text-slate-500 cursor-pointer hover:bg-white/5'
                          }`}
                        >
                          <span className="font-medium truncate">{m.label}</span>
                          {m.always ? (
                            <Lock size={12} className="text-indigo-400 flex-shrink-0" />
                          ) : enabled ? (
                            <CheckSquare size={14} className="text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Square size={14} className="text-slate-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Details Content: INTERNAL NOTES */}
              {detailsTab === 'notes' && (
                <div className="space-y-2 text-xs">
                  <label className="text-slate-300 font-semibold block">
                    Super Admin Internal Notes (Private to Platform Admin)
                  </label>
                  <textarea
                    rows={4}
                    value={modalAdminNotes}
                    onChange={(e) => setModalAdminNotes(e.target.value)}
                    placeholder="Add billing notes, special agreements, contact history..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {detailsOrg.planStatus === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleLiveViewCRM(detailsOrg)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all"
                    >
                      <Radio size={14} className="animate-pulse" />
                      Stealth Live View
                    </button>
                  )}
                  {detailsOrg.planStatus === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleSuspend(detailsOrg._id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-all"
                    >
                      Suspend Company
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDetailsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
                  >
                    Close
                  </button>

                  {/* If Pending: ACCEPT or REJECT */}
                  {detailsOrg.planStatus === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(detailsOrg._id, detailsOrg.name)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
                      >
                        <X size={14} />
                        Reject Request
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleApprove(detailsOrg._id, modalPlan, {
                            maxUsers: modalMaxUsers,
                            maxClients: modalMaxClients,
                            modules: modalModules,
                          })
                        }
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25"
                      >
                        <Check size={14} className="stroke-[3]" />
                        Accept & Activate
                      </button>
                    </>
                  ) : (
                    /* If Active or Suspended: SAVE PLAN & MODULES */
                    <button
                      type="button"
                      onClick={handleSavePlanChanges}
                      disabled={isSavingDetails}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25"
                    >
                      {isSavingDetails ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Companies;
