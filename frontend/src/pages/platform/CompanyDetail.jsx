import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building2, CheckCircle2, XCircle, AlertTriangle, Clock,
  Users2, Save, ToggleLeft, ToggleRight, Shield, Package, StickyNote,
  RefreshCw, Globe, Phone, Mail, Calendar, Radio
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { enterGhostMode } from '../../store/slices/authSlice';

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

const tabs = ['Overview', 'Plan & Modules', 'Users', 'Notes'];

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
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!org) return null;

  const isPending = org.planStatus === 'pending';
  const isSuspended = org.planStatus === 'suspended';

  const statusColor = {
    pending:   'text-amber-400 bg-amber-400/10 border-amber-500/20',
    active:    'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    suspended: 'text-red-400 bg-red-400/10 border-red-500/20',
    expired:   'text-slate-400 bg-slate-400/10 border-slate-500/20',
  }[org.planStatus];

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/platform/companies" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-bold text-xl overflow-hidden border border-white/10">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              org.name?.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{org.name} + RWM</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
              {org.planStatus}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLiveViewCRM}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            title="Live View Company CRM (Stealth Ghost Mode)"
          >
            <Radio size={13} className="animate-pulse text-emerald-400" />
            <span>Live View CRM</span>
          </button>
          <button onClick={fetch} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Pending Banner */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">Awaiting Your Approval</p>
              <p className="text-amber-400/70 text-xs">Configure the plan & modules below, then approve or reject.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              <XCircle size={14} className="inline mr-1" /> Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={14} className="inline mr-1" /> Approve & Activate
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
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
            {/* Company Info */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Building2 size={16} className="text-indigo-400" /> Company Info
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
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-white font-medium text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users2 size={16} className="text-indigo-400" /> Owner Details
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Name', value: org.ownerId?.name },
                  { label: 'Email', value: org.ownerId?.email },
                  { label: 'Phone', value: org.ownerId?.phone || '—' },
                  { label: 'Last Login', value: org.ownerId?.lastLogin ? new Date(org.ownerId.lastLogin).toLocaleString('en-IN') : 'Never' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Plan Summary */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Package size={16} className="text-indigo-400" /> Current Plan
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white capitalize">{org.plan}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}>{org.planStatus}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{org.maxUsers}</p>
                  <p className="text-slate-500 text-xs">Max Users</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{org.maxClients}</p>
                  <p className="text-slate-500 text-xs">Max Clients</p>
                </div>
              </div>
            </div>

            {/* Suspend / Reactivate */}
            {!isPending && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" /> Account Actions
                </h3>
                {isSuspended ? (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-sm">Reason: <span className="text-red-300">{org.suspendReason || '—'}</span></p>
                    <button
                      onClick={handleReactivate}
                      disabled={saving}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={handleSuspend}
                      disabled={saving}
                      className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      Suspend Organization
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Plan & Modules Tab ──────────────────────────────────────────── */}
        {activeTab === 'Plan & Modules' && (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Plan Preset Picker */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-semibold">Select Plan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(PLAN_PRESETS).map((p) => (
                  <button
                    key={p}
                    onClick={() => applyPreset(p)}
                    className={`p-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                      plan === p
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/50 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Max Users</label>
                  <input
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Max Clients</label>
                  <input
                    type="number"
                    value={maxClients}
                    onChange={(e) => setMaxClients(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Module Toggles */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-semibold">Module Access</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_MODULES.map((mod) => {
                  const isOn = modules[mod.key] ?? false;
                  return (
                    <div
                      key={mod.key}
                      onClick={() => toggleModule(mod.key)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isOn
                          ? 'bg-indigo-600/10 border-indigo-500/30'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      } ${mod.always ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${isOn ? 'text-white' : 'text-slate-400'}`}>{mod.label}</p>
                        {mod.always && <p className="text-[10px] text-slate-600">Core module (always on)</p>}
                      </div>
                      {isOn
                        ? <ToggleRight size={22} className="text-indigo-400 flex-shrink-0" />
                        : <ToggleLeft size={22} className="text-slate-600 flex-shrink-0" />
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Saving...' : isPending ? 'Approve & Activate with These Settings' : 'Save Plan & Module Changes'}
            </button>
          </motion.div>
        )}

        {/* ── Users Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'Users' && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-xs text-slate-400 font-semibold uppercase">Name</th>
                    <th className="text-left px-5 py-3.5 text-xs text-slate-400 font-semibold uppercase hidden md:table-cell">Email</th>
                    <th className="text-left px-5 py-3.5 text-xs text-slate-400 font-semibold uppercase">Role</th>
                    <th className="text-left px-5 py-3.5 text-xs text-slate-400 font-semibold uppercase hidden lg:table-cell">Last Login</th>
                    <th className="text-left px-5 py-3.5 text-xs text-slate-400 font-semibold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-300 text-sm font-bold">
                            {u.name?.charAt(0)}
                          </div>
                          <span className="text-white text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-slate-400 text-sm">{u.email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-slate-300 text-sm capitalize">{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-slate-500 text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
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
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <StickyNote size={16} className="text-indigo-400" /> Admin Notes
                <span className="text-xs text-slate-500 font-normal">(Private — only visible to you)</span>
              </h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={8}
                placeholder="Add internal notes about this company, payment records, special arrangements, etc..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
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
