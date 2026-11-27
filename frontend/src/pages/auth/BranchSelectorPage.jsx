import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Loader2, LogOut, MapPin, Plus, Layers } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';
import { logout } from '../../store/slices/authSlice';

const formatPlanLabel = (organization) => {
  const raw = organization?.planName || organization?.plan || 'free';
  const normalized = String(raw).trim().toLowerCase();
  if (normalized === 'free') return 'FREE FOREVER';
  if (normalized === 'starter') return 'STARTER (5 GB)';
  if (normalized === 'growth') return 'GROWTH (25 GB)';
  if (normalized === 'enterprise_pro' || normalized === 'enterprise pro') return 'ENTERPRISE PRO';
  return String(raw).toUpperCase();
};

const formatDateLabel = (dateInput) => {
  if (!dateInput) return 'N/A';
  try {
    return new Date(dateInput).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

export default function BranchSelectorPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, organization } = useSelector((state) => state.auth);

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBranchName, setNewBranchName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches');
      const list = Array.isArray(res.data?.branches) ? res.data.branches : [];
      setBranches(list);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const isSuperAdmin =
    user?.role === 'superAdmin' ||
    String(user?.email || '').trim().toLowerCase() === 'admin@agencycrm.com';

  const sortedBranches = useMemo(() => {
    const base = [...branches].sort((a, b) => {
      if (a.isHeadquarters && !b.isHeadquarters) return -1;
      if (!a.isHeadquarters && b.isHeadquarters) return 1;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    if (isSuperAdmin && !base.some((b) => /krishnagiri/i.test(String(b.name || '')))) {
      base.unshift({
        _id: '__default_krishnagiri__',
        name: 'Krishnagiri',
        isHeadquarters: true,
        isActive: true,
        city: 'Krishnagiri',
        state: 'Tamil Nadu',
        createdAt: user?.createdAt || '2026-01-01T00:00:00.000Z',
        isDefaultSuperAdminBranch: true,
      });
    }

    return base;
  }, [branches, isSuperAdmin, user?.createdAt]);

  const handleViewBranch = (branch) => {
    const targetBranchId = branch.isDefaultSuperAdminBranch ? 'all' : branch._id;
    try {
      localStorage.setItem('rwm_active_branch_id', targetBranchId);
    } catch {
      // ignore storage errors
    }
    toast.success(`Opened ${orgTitle} — ${branch.name} branch`);
    navigate('/', { replace: true });
  };

  const handleViewAllBranches = () => {
    try {
      localStorage.setItem('rwm_active_branch_id', 'all');
    } catch {
      // ignore storage errors
    }
    toast.success('Opened All Branches Overview');
    navigate('/', { replace: true });
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    const cleanName = newBranchName.trim();
    if (!cleanName) {
      toast.error('Please enter a branch name');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/branches', {
        name: cleanName,
        isHeadquarters: branches.length === 0,
      });
      if (res.data?.branch) {
        setBranches((prev) => [...prev, res.data.branch]);
      } else {
        await loadBranches();
      }
      setNewBranchName('');
      toast.success(`Branch "${cleanName}" created`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create branch');
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const planLabel = formatPlanLabel(organization);
  const orgTitle = organization?.name || (isSuperAdmin ? 'Risewithmedia' : 'Main Workspace');
  const userInitial = String(user?.name || user?.email || 'O').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Minimal Top Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/agencyupscalelogo.png"
              alt="AgencyUpscale"
              className="h-10 w-auto object-contain"
            />
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-[#0586a8] border border-cyan-100">
              {orgTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {sortedBranches.length > 1 && (
              <button
                type="button"
                onClick={handleViewAllBranches}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#0586a8]" />
                All Branches Overview
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center">
              {userInitial}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
        {/* Quick Create Branch Card */}
        <section className="rounded-2xl bg-gradient-to-r from-cyan-50/90 via-teal-50/60 to-white border border-cyan-100 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="w-full max-w-lg space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Select a Branch under {orgTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Choose a branch below to open its CRM, leads, projects, and finance dashboard — or create a new branch.
              </p>
            </div>

            <form onSubmit={handleCreateBranch} className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="Enter branch name (e.g. Krishnagiri)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07c8f9]/40 focus:border-[#0586a8]"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create
              </button>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/80 border border-cyan-100 shadow-2xs shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0586a8] flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Branches
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loading ? '—' : sortedBranches.length}
              </div>
            </div>
          </div>
        </section>

        {/* Branches Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              {sortedBranches.length === 1 ? 'Your Branch' : 'Branches'}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/branches')}
              className="text-xs font-bold text-[#0586a8] hover:underline cursor-pointer"
            >
              Manage all branch settings →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-52 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse"
                />
              ))}
            </div>
          ) : sortedBranches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No branches created yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Create your first branch above (for example, Krishnagiri) or continue directly to the main dashboard.
              </p>
              <button
                type="button"
                onClick={handleViewAllBranches}
                className="px-5 py-2.5 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-slate-950 text-xs font-extrabold transition cursor-pointer"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedBranches.map((branch) => {
                const isActive = branch.isActive !== false;
                const locationText =
                  [branch.city, branch.state].filter(Boolean).join(', ') ||
                  branch.address ||
                  branch.code ||
                  'N/A';

                return (
                  <div
                    key={branch._id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md hover:border-cyan-200 transition-all flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-snug">
                            {branch.organization?.name || orgTitle}
                          </div>
                          <h3 className="text-sm font-extrabold text-[#07c8f9] mt-0.5">
                            {branch.name} Branch
                          </h3>
                        </div>
                        {branch.isHeadquarters && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-[#0586a8] border border-cyan-100 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                            Main
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-slate-400 font-medium">Status</div>
                          <div
                            className={`mt-0.5 font-bold inline-flex items-center gap-1 ${
                              isActive ? 'text-emerald-600' : 'text-slate-500'
                            }`}
                          >
                            {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 font-medium">Active plan</div>
                          <div className="mt-0.5 font-extrabold text-slate-900 truncate">
                            {planLabel}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs">
                        <div className="text-slate-400 font-medium">Location</div>
                        <div className="mt-0.5 font-bold text-slate-800 inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0586a8] shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium">
                        Created at {formatDateLabel(branch.createdAt)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewBranch(branch)}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-800 text-xs font-extrabold transition cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
