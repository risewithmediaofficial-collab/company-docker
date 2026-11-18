import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building2, CheckCircle2, XCircle, AlertTriangle, Clock,
  Users2, Save, ToggleLeft, ToggleRight, Shield, Package, StickyNote,
  RefreshCw, Globe, Phone, Mail, Calendar, Radio, Copy, Check, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { enterGhostMode } from '../../store/slices/authSlice';
import BranchManager from '../../components/branches/BranchManager';

// ── Module list for toggle grid
const ALL_MODULES = [
  { key: 'crm',         label: 'CRM & Leads',      always: true },
  { key: 'clients',     label: 'Clients',           always: true },
  { key: 'projects',    label: 'Projects',          always: true },
  { key: 'tasks',       label: 'Tasks',             always: true },
  { key: 'finance',     label: 'Finance',           always: false },
  { key: 'hr',          label: 'HR & Hiring',       always: false },
  { key: 'attendance',  label: 'Attendance',        always: false },
  { key: 'proposals',   label: 'Proposals',         always: false },
  { key: 'portal',      label: 'Client Portal',     always: false },
  { key: 'reports',     label: 'Reports',           always: false },
  { key: 'sop',         label: 'SOPs',              always: false },
  { key: 'assets',      label: 'Asset Library',     always: false },
  { key: 'smm',         label: 'SMM Module',        always: false },
  { key: 'automations', label: 'Automations',       always: false },
  { key: 'influencers', label: 'Influencer Hub',    always: false },
  { key: 'ai',          label: 'AI Features',       always: false },
];

const PLAN_PRESETS = {
  trial:   { maxUsers: 3,   maxClients: 5,   modules: ['crm','clients','projects','tasks'] },
  starter: { maxUsers: 10,  maxClients: 25,  modules: ['crm','clients','projects','tasks','finance','hr','attendance','portal','proposals','reports'] },
  growth:  { maxUsers: 25,  maxClients: 100, modules: ['crm','clients','projects','tasks','finance','hr','attendance','smm','portal','sop','assets','proposals','reports','automations','influencers'] },
  pro:     { maxUsers: 999, maxClients: 9999,modules: ['crm','clients','projects','tasks','finance','hr','attendance','smm','portal','sop','assets','proposals','reports','automations','influencers','ai'] },
};

const tabs = ['Overview', 'Plan & Modules', 'Branches', 'Users', 'Notes'];

const CompanyDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [org, setOrg] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Company Portal URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLiveViewCRM = () => {
    if (!org) return;
    dispatch(enterGhostMode(org));
    if (queryClient) {
      queryClient.clear();
    }
    toast.success(`Stealth Live View Activated for "${org.name} + RWM". Tenant is unaware.`);
    navigate('/');
  };

  // Editable plan state
  const [plan, setPlan] = useState('trial');
  const [maxUsers, setMaxUsers] = useState(3);
  const [maxClients, setMaxClients] = useState(5);
  const [modules, setModules] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const token = () => localStorage.getItem('accessToken');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/platform/organizations/${id}`, { headers: headers() });
      const { organization, users: u } = res.data;
      setOrg(organization);
      setUsers(u);
      setPlan(organization.plan);
      setMaxUsers(organization.maxUsers);
      setMaxClients(organization.maxClients);
      setModules({ ...organization.enabledModules });
      setAdminNotes(organization.adminNotes || '');
    } catch {
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const applyPreset = (selectedPlan) => {
    setPlan(selectedPlan);
    const preset = PLAN_PRESETS[selectedPlan];
    setMaxUsers(preset.maxUsers);
    setMaxClients(preset.maxClients);
    const newMods = {};
    ALL_MODULES.forEach((m) => { newMods[m.key] = preset.modules.includes(m.key); });
    setModules(newMods);
  };

  const toggleModule = (key) => {
    const mod = ALL_MODULES.find((m) => m.key === key);
    if (mod?.always) return; // can't turn off core modules
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/platform/organizations/${id}/approve`, {
        plan, maxUsers, maxClients, enabledModules: modules,
      }, { headers: headers() });
      toast.success('Company approved & activated!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/platform/organizations/${id}/plan`, {
        plan, maxUsers, maxClients, enabledModules: modules, adminNotes,
      }, { headers: headers() });
      toast.success('Plan & modules updated!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return toast.error('Please enter a reason');
    setSaving(true);
    try {
      await axios.put(`/api/platform/organizations/${id}/suspend`, { reason: suspendReason }, { headers: headers() });
      toast.success('Organization suspended');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/platform/organizations/${id}/reactivate`, {}, { headers: headers() });
      toast.success('Organization reactivated!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject and delete this registration? This cannot be undone.')) return;
    setSaving(true);
    try {
      await axios.delete(`/api/platform/organizations/${id}`, { headers: headers() });
      toast.success('Registration rejected and removed');
      window.history.back();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        <div className="h-8 w-48 rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!org) return null;

  const isPending = org.planStatus === 'pending';
  const isSuspended = org.planStatus === 'suspended';
  const orgSlugSafe = org.slug || (org.name ? org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '') || String(org._id);
  const portalUrlSafe = `${window.location.origin}/login/${orgSlugSafe}`;

  const statusColor = {
    pending:   'text-amber-800 bg-amber-50 border-amber-200',
    active:    'text-emerald-700 bg-emerald-50 border-emerald-200',
    suspended: 'text-rose-700 bg-rose-50 border-rose-200',
    expired:   'text-slate-600 bg-slate-100 border-slate-200',
  }[org.planStatus] || 'text-slate-700 bg-slate-100 border-slate-200';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-900">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/platform/companies" className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xl overflow-hidden border border-indigo-100 shadow-xs">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              org.name?.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{org.name} + RWM</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
              {org.planStatus}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLiveViewCRM}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Live View Company CRM (Stealth Ghost Mode)"
          >
            <Radio size={13} className="animate-pulse text-emerald-600" />
            <span>Live View CRM</span>
          </button>
          <button onClick={fetch} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs transition-all cursor-pointer">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Pending Banner */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-700 flex-shrink-0" />
            <div>
              <p className="text-slate-900 font-bold text-sm">Awaiting Your Approval</p>
              <p className="text-slate-600 text-xs">Configure the plan & modules below, then approve or reject.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-sm font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <XCircle size={14} className="inline mr-1" /> Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={14} className="inline mr-1" /> Approve & Activate
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/80">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === t ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Overview Tab ───────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dedicated Portal URL with Copied Feedback */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <p className="text-indigo-950 font-bold text-sm flex items-center gap-2">
                  <Globe size={16} className="text-indigo-600" />
                  Dedicated Company Login Portal
                </p>
                <p className="text-indigo-800 text-xs mt-0.5 font-medium">
                  Workspace members access CRM at: <strong className="text-indigo-950 font-mono font-bold">{portalUrlSafe}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(portalUrlSafe)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={13} className="stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <a
                  href={portalUrlSafe}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-all font-medium"
                  title="Open Portal in New Tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-slate-900 font-bold flex items-center gap-2">
                <Building2 size={16} className="text-indigo-600" /> Company Info
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Company', value: org.name },
                  { label: 'Industry', value: org.industry || '—' },
                  { label: 'Website', value: org.website || '—' },
                  { label: 'Phone', value: org.phone || '—' },
                  { label: 'Registered', value: new Date(org.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
                  org.approvedAt && { label: 'Approved', value: new Date(org.approvedAt).toLocaleDateString('en-IN') },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-900 font-semibold text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-slate-900 font-bold flex items-center gap-2">
                <Users2 size={16} className="text-indigo-600" /> Owner Details
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Name', value: org.ownerId?.name },
                  { label: 'Email', value: org.ownerId?.email },
                  { label: 'Phone', value: org.ownerId?.phone || '—' },
                  { label: 'Last Login', value: org.ownerId?.lastLogin ? new Date(org.ownerId.lastLogin).toLocaleString('en-IN') : 'Never' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-900 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Plan Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <h3 className="text-slate-900 font-bold flex items-center gap-2">
                <Package size={16} className="text-indigo-600" /> Current Plan
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-900 capitalize">{org.plan}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}>{org.planStatus}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{org.maxUsers}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Max Users</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{org.maxClients}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Max Clients</p>
                </div>
              </div>
            </div>

            {/* Suspend / Reactivate */}
            {!isPending && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <h3 className="text-slate-900 font-bold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" /> Account Actions
                </h3>
                {isSuspended ? (
                  <div className="space-y-3">
                    <p className="text-slate-600 text-sm">Reason: <span className="text-rose-700 font-semibold">{org.suspendReason || '—'}</span></p>
                    <button
                      onClick={handleReactivate}
                      disabled={saving}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      Reactivate Organization
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Reason for suspension..."
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <button
                      onClick={handleSuspend}
                      disabled={saving}
                      className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-sm font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      Suspend Organization
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Plan & Modules Tab ──────────────────────────────────── */}
        {activeTab === 'Plan & Modules' && (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Plan Preset Picker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-slate-900 font-bold">Select Plan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(PLAN_PRESETS).map((p) => (
                  <button
                    key={p}
                    onClick={() => applyPreset(p)}
                    className={`p-3 rounded-xl border text-sm font-bold capitalize transition-all cursor-pointer ${
                      plan === p
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Max Users</label>
                  <input
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Max Clients</label>
                  <input
                    type="number"
                    value={maxClients}
                    onChange={(e) => setMaxClients(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Module Toggles */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-slate-900 font-bold">Module Access</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_MODULES.map((mod) => {
                  const isOn = modules[mod.key] ?? false;
                  return (
                    <div
                      key={mod.key}
                      onClick={() => toggleModule(mod.key)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isOn
                          ? 'bg-indigo-50/70 border-indigo-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      } ${mod.always ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${isOn ? 'text-indigo-950 font-bold' : 'text-slate-600'}`}>{mod.label}</p>
                        {mod.always && <p className="text-[10px] text-slate-400 font-medium">Core module (always on)</p>}
                      </div>
                      {isOn
                        ? <ToggleRight size={22} className="text-indigo-600 flex-shrink-0" />
                        : <ToggleLeft size={22} className="text-slate-400 flex-shrink-0" />
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save */}
            <button
              onClick={isPending ? handleApprove : handleSavePlan}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              {saving ? 'Saving...' : isPending ? 'Approve & Activate with These Settings' : 'Save Plan & Module Changes'}
            </button>
          </motion.div>
        )}

        {/* ── Branches Tab ───────────────────────────────────────────────── */}
        {activeTab === 'Branches' && (
          <motion.div key="branches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <BranchManager companyId={id} companyName={org.name} isSuperAdmin={true} />
          </motion.div>
        )}

        {/* ── Users Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'Users' && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-5 py-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                    <th className="px-5 py-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                            {u.name?.charAt(0)}
                          </div>
                          <span className="text-slate-900 text-sm font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-slate-600 text-sm">{u.email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-indigo-700 font-medium text-xs bg-indigo-50 px-2 py-0.5 rounded capitalize">{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-slate-400 text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Notes Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'Notes' && (
          <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-slate-900 font-bold flex items-center gap-2">
                <StickyNote size={16} className="text-indigo-600" /> Admin Notes
                <span className="text-xs text-slate-400 font-normal">(Private — only visible to you)</span>
              </h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={8}
                placeholder="Add internal notes about this company, payment records, special arrangements, etc..."
                className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default CompanyDetail;
