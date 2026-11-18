import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users2,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Layers,
  MapPin,
  RefreshCw,
  Activity,
  PieChart,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const planColors = {
  trial: { label: 'Trial', bar: 'bg-slate-500', text: 'text-slate-400', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
  starter: { label: 'Starter', bar: 'bg-blue-500', text: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  growth: { label: 'Growth', bar: 'bg-violet-500', text: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20' },
  pro: { label: 'Pro', bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
};

const moduleCatalog = [
  { key: 'crm', label: 'CRM & Client Pipeline', icon: Users2, color: 'text-blue-400' },
  { key: 'leads', label: 'Lead Management', icon: TrendingUp, color: 'text-emerald-400' },
  { key: 'projects', label: 'Projects & Tasks', icon: Layers, color: 'text-indigo-400' },
  { key: 'finance', label: 'Finance & Invoicing', icon: BarChart3, color: 'text-cyan-400' },
  { key: 'hr', label: 'HR & Employee Management', icon: Shield, color: 'text-rose-400' },
  { key: 'attendance', label: 'Attendance & Geofencing', icon: MapPin, color: 'text-amber-400' },
  { key: 'smm', label: 'SMM & Marketing Suite', icon: Activity, color: 'text-violet-400' },
  { key: 'sop', label: 'SOP & Standard Procedures', icon: Building2, color: 'text-teal-400' },
];

export default function PlatformAnalytics() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [branchesCount, setBranchesCount] = useState(0);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch overview stats
      const statsRes = await axios.get('/api/platform/stats', { headers });
      setStatsData(statsRes.data?.stats || null);

      // 2. Fetch all organizations for module & adoption analytics
      const orgsRes = await axios.get('/api/platform/organizations?limit=100', { headers });
      const orgs = orgsRes.data?.organizations || [];
      setOrganizations(orgs);

      // Aggregate total branch count if available
      const totalB = orgs.reduce((acc, o) => acc + (o.branchCount || 0), 0);
      setBranchesCount(totalB);
    } catch (err) {
      toast.error('Failed to load platform analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Compute Module Adoption Stats across organizations
  const moduleAdoption = useMemo(() => {
    if (!organizations.length) return [];
    const total = organizations.length;
    return moduleCatalog.map((mod) => {
      const enabledCount = organizations.filter((org) => {
        if (!org.enabledModules) return true; // default all enabled
        return org.enabledModules[mod.key] !== false;
      }).length;
      const pct = Math.round((enabledCount / total) * 100);
      return { ...mod, enabledCount, pct };
    });
  }, [organizations]);

  // Compute Industry Breakdown
  const industryBreakdown = useMemo(() => {
    if (!organizations.length) return [];
    const map = {};
    organizations.forEach((o) => {
      const ind = (o.industry || 'General / Other').trim();
      map[ind] = (map[ind] || 0) + 1;
    });
    return Object.entries(map)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [organizations]);

  const stats = statsData;
  const totalOrgs = stats?.totalOrgs || organizations.length || 0;
  const activeOrgs = stats?.activeOrgs || 0;
  const activeRate = totalOrgs > 0 ? Math.round((activeOrgs / totalOrgs) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 size={15} />
            <span>Platform Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SaaS Platform Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time multi-tenant health, feature adoption, and ecosystem performance
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top Level Metric KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/5 border border-white/5 p-5 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Building2 size={18} />
            </div>
            <div className="text-3xl font-bold text-white">{totalOrgs}</div>
            <div className="text-sm font-semibold text-slate-300 mt-0.5">Total Companies</div>
            <div className="text-xs text-slate-500 mt-1">Tenant Workspaces</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-white/5 border border-white/5 p-5 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 size={18} />
            </div>
            <div className="text-3xl font-bold text-emerald-400">{activeOrgs}</div>
            <div className="text-sm font-semibold text-slate-300 mt-0.5">Active Organizations</div>
            <div className="text-xs text-emerald-500/80 font-medium mt-1">{activeRate}% operational rate</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/5 border border-white/5 p-5 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Users2 size={18} />
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats?.totalUsers || 0}</div>
            <div className="text-sm font-semibold text-slate-300 mt-0.5">Active Platform Staff</div>
            <div className="text-xs text-slate-500 mt-1">Across all client companies</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white/5 border border-white/5 p-5 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <MapPin size={18} />
            </div>
            <div className="text-3xl font-bold text-amber-300">{branchesCount}</div>
            <div className="text-sm font-semibold text-slate-300 mt-0.5">Multi-Branch Locations</div>
            <div className="text-xs text-slate-500 mt-1">Geofenced company branches</div>
          </motion.div>
        </div>
      )}

      {/* Main Grid: Plan Distribution + Status Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Tiers & Subscriptions */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <PieChart size={16} className="text-indigo-400" />
              <span>Subscription Tier Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500">Active Tenants</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(planColors).map(([key, cfg]) => {
              const count = stats?.planBreakdown?.[key] || 0;
              const pct = totalOrgs > 0 ? Math.round((count / totalOrgs) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cfg.label}</span>
                    <span className="text-slate-400 font-mono">
                      {count} <span className="text-slate-600">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${cfg.bar}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-500 block text-[11px]">Free/Trial</span>
              <strong className="text-white text-sm">{stats?.planBreakdown?.trial || 0}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-indigo-400 block text-[11px]">Paid Tiers</span>
              <strong className="text-white text-sm">
                {(stats?.planBreakdown?.starter || 0) + (stats?.planBreakdown?.growth || 0) + (stats?.planBreakdown?.pro || 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* Status & Compliance Health */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" />
              <span>Workspace Status Health</span>
            </h3>
            <span className="text-xs text-slate-500">Platform Status</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <CheckCircle2 size={18} className="text-emerald-400 mx-auto mb-1.5" />
              <div className="text-2xl font-bold text-emerald-400">{stats?.activeOrgs || 0}</div>
              <div className="text-xs font-semibold text-emerald-300 mt-0.5">Active</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <Clock size={18} className="text-amber-400 mx-auto mb-1.5" />
              <div className="text-2xl font-bold text-amber-400">{stats?.pendingOrgs || 0}</div>
              <div className="text-xs font-semibold text-amber-300 mt-0.5">Pending Review</div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <AlertTriangle size={18} className="text-rose-400 mx-auto mb-1.5" />
              <div className="text-2xl font-bold text-rose-400">{stats?.suspendedOrgs || 0}</div>
              <div className="text-xs font-semibold text-rose-300 mt-0.5">Suspended</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-center">
              <Activity size={18} className="text-slate-400 mx-auto mb-1.5" />
              <div className="text-2xl font-bold text-slate-300">{stats?.expiredOrgs || 0}</div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5">Expired</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 flex items-center justify-between">
            <span>Tenants Awaiting Super Admin Action:</span>
            <Link
              to="/platform/companies?tab=requests"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>{stats?.pendingOrgs || 0} Requests</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Top Industries */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" />
              <span>Industry Distribution</span>
            </h3>
            <span className="text-xs text-slate-500">Top Sectors</span>
          </div>

          <div className="space-y-3">
            {industryBreakdown.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No industry data available yet</p>
            ) : (
              industryBreakdown.map((item) => (
                <div key={item.industry} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[170px]">{item.industry}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 font-mono font-semibold">
                    {item.count} orgs
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feature & Module Adoption across Organizations */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Layers size={16} className="text-indigo-400" />
              <span>Core Module Adoption Across Tenants</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Percentage of companies with each module enabled in their enterprise plan
            </p>
          </div>
          <span className="text-xs text-slate-500">{organizations.length} Companies Analyzed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleAdoption.map((mod) => (
            <div
              key={mod.key}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-white/5 ${mod.color}`}>
                  <mod.icon size={16} />
                </div>
                <span className="text-xs font-bold text-white font-mono">{mod.pct}%</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">{mod.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{mod.enabledCount} of {totalOrgs} companies active</p>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${mod.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Navigation Footer */}
      <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-300">
          <Shield size={16} />
          <span>Manage detailed company profiles, subscription plans, and enterprise modules from the Companies directory.</span>
        </div>
        <Link
          to="/platform/companies"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
        >
          <span>Open Companies Management</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
