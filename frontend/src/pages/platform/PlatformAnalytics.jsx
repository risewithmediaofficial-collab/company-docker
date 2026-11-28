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
  trial: { label: 'Trial', bar: 'bg-slate-500', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  starter: { label: 'Starter', bar: 'bg-blue-600', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  growth: { label: 'Growth', bar: 'bg-sky-600', text: 'text-sky-700', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  pro: { label: 'Pro', bar: 'bg-amber-600', text: 'text-amber-800', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
};

const moduleCatalog = [
  { key: 'crm', label: 'CRM & Client Pipeline', icon: Users2, color: 'text-blue-600' },
  { key: 'leads', label: 'Lead Management', icon: TrendingUp, color: 'text-emerald-600' },
  { key: 'projects', label: 'Projects & Tasks', icon: Layers, color: 'text-[#0586a8]' },
  { key: 'finance', label: 'Finance & Invoicing', icon: BarChart3, color: 'text-cyan-600' },
  { key: 'hr', label: 'HR & Employee Management', icon: Shield, color: 'text-rose-600' },
  { key: 'attendance', label: 'Attendance & Geofencing', icon: MapPin, color: 'text-amber-600' },
  { key: 'smm', label: 'SMM & Marketing Suite', icon: Activity, color: 'text-sky-600' },
  { key: 'sop', label: 'SOP & Standard Procedures', icon: Building2, color: 'text-teal-600' },
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
    <div className="p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto text-slate-900 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#0586a8] text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 size={15} />
            <span>Platform Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">SaaS Platform Analytics</h1>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-center flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all text-xs font-bold shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#0586a8]' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top Level Metric KPIs */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 shadow-xs animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 relative overflow-hidden shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 text-[#0586a8] flex items-center justify-center mb-3">
              <Building2 size={18} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalOrgs}</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">Total Companies</div>
            <div className="text-xs text-slate-400 mt-1">Tenant Workspaces</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 relative overflow-hidden shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={18} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{activeOrgs}</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">Active Organizations</div>
            <div className="text-xs text-emerald-700 font-semibold mt-1">{activeRate}% operational rate</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 relative overflow-hidden shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Users2 size={18} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">Active Platform Staff</div>
            <div className="text-xs text-slate-400 mt-1">Across all client companies</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 relative overflow-hidden shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <MapPin size={18} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">{branchesCount}</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">Multi-Branch Locations</div>
            <div className="text-xs text-slate-400 mt-1">Geofenced company branches</div>
          </motion.div>
        </div>
      )}

      {/* Main Grid: Plan Distribution + Status Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Plan Tiers & Subscriptions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <PieChart size={16} className="text-[#0586a8]" />
              <span>Subscription Tier Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Active Tenants</span>
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            {Object.entries(planColors).map(([key, cfg]) => {
              const count = stats?.planBreakdown?.[key] || 0;
              const pct = totalOrgs > 0 ? Math.round((count / totalOrgs) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cfg.label}</span>
                    <span className="text-slate-500 font-mono font-medium">
                      {count} <span className="text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
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

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px] font-medium">Free/Trial</span>
              <strong className="text-slate-900 text-sm font-bold">{stats?.planBreakdown?.trial || 0}</strong>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-100">
              <span className="text-[#0586a8] block text-[11px] font-bold">Paid Tiers</span>
              <strong className="text-cyan-950 text-sm font-bold">
                {(stats?.planBreakdown?.starter || 0) + (stats?.planBreakdown?.growth || 0) + (stats?.planBreakdown?.pro || 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* Status & Compliance Health */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <Shield size={16} className="text-emerald-600" />
              <span>Workspace Status Health</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Platform Status</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <CheckCircle2 size={18} className="text-emerald-600 mx-auto mb-1.5" />
              <div className="text-xl sm:text-2xl font-bold text-emerald-700">{stats?.activeOrgs || 0}</div>
              <div className="text-[11px] sm:text-xs font-bold text-emerald-800 mt-0.5">Active</div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <Clock size={18} className="text-amber-600 mx-auto mb-1.5" />
              <div className="text-xl sm:text-2xl font-bold text-amber-700">{stats?.pendingOrgs || 0}</div>
              <div className="text-[11px] sm:text-xs font-bold text-amber-800 mt-0.5">Pending Review</div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <AlertTriangle size={18} className="text-rose-600 mx-auto mb-1.5" />
              <div className="text-xl sm:text-2xl font-bold text-rose-700">{stats?.suspendedOrgs || 0}</div>
              <div className="text-[11px] sm:text-xs font-bold text-rose-800 mt-0.5">Suspended</div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <Activity size={18} className="text-slate-500 mx-auto mb-1.5" />
              <div className="text-xl sm:text-2xl font-bold text-slate-700">{stats?.expiredOrgs || 0}</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">Expired</div>
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span>Tenants Awaiting Action:</span>
            <Link
              to="/platform/companies?tab=requests"
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
            >
              <span>{stats?.pendingOrgs || 0} Requests</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Top Industries */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              <span>Industry Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Top Sectors</span>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {industryBreakdown.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">No industry data available yet</p>
            ) : (
              industryBreakdown.map((item) => (
                <div key={item.industry} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs gap-2">
                  <span className="text-slate-800 font-semibold truncate min-w-0">{item.industry}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono font-bold shadow-2xs shrink-0">
                    {item.count} orgs
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feature & Module Adoption across Organizations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <Layers size={16} className="text-[#0586a8]" />
              <span>Core Module Adoption Across Tenants</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Percentage of companies with each module enabled in their enterprise plan
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{organizations.length} Companies Analyzed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {moduleAdoption.map((mod) => (
            <div
              key={mod.key}
              className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0586a8] shadow-2xs">
                  <mod.icon size={16} />
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono">{mod.pct}%</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{mod.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{mod.enabledCount} of {totalOrgs} companies active</p>
              </div>
              <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
                <div className="h-full rounded-full bg-[#0586a8]" style={{ width: `${mod.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Navigation Footer */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Shield size={16} className="text-[#0586a8] shrink-0" />
          <span>Manage detailed company profiles, subscription plans, and enterprise modules from the Companies directory.</span>
        </div>
        <Link
          to="/platform/companies"
          className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-[#0586a8] hover:bg-[#04718f] text-white font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Open Companies Management</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
