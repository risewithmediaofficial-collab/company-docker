import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Users2, CheckCircle2, Clock, AlertTriangle,
  XCircle, TrendingUp, ArrowRight, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const planColors = {
  trial:   'text-slate-500 bg-slate-500/10',
  starter: 'text-sky-600 bg-sky-500/10',
  growth:  'text-[#0586a8] bg-[#07c8f9]/15',
  pro:     'text-amber-600 bg-amber-500/10',
};

const statusColors = {
  pending:   'text-amber-400 bg-amber-400/10',
  active:    'text-emerald-400 bg-emerald-400/10',
  suspended: 'text-red-400 bg-red-400/10',
  expired:   'text-slate-400 bg-slate-400/10',
};

const PlatformDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/api/platform/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch {
      toast.error('Failed to load platform stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const stats = data?.stats;

  const statCards = stats ? [
    { label: 'Total Companies', value: stats.totalOrgs, icon: Building2, color: 'from-[#07c8f9] to-[#0284c7]', sub: 'Registered' },
    { label: 'Active Companies', value: stats.activeOrgs, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600', sub: 'Currently using' },
    { label: 'Pending Approval', value: stats.pendingOrgs, icon: Clock, color: 'from-amber-500 to-orange-600', sub: 'Awaiting review', urgent: stats.pendingOrgs > 0 },
    { label: 'Total Users', value: stats.totalUsers, icon: Users2, color: 'from-sky-500 to-cyan-600', sub: 'Across all companies' },
  ] : [];

  const planItems = stats ? [
    { label: 'Free / Trial', count: stats.planBreakdown.trial, color: 'bg-slate-400' },
    { label: 'Starter', count: stats.planBreakdown.starter, color: 'bg-sky-500' },
    { label: 'Growth', count: stats.planBreakdown.growth, color: 'bg-[#07c8f9]' },
    { label: 'Enterprise Pro', count: stats.planBreakdown.pro, color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto text-slate-900 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">Platform Overview</h1>
        </div>
        <button
          onClick={fetch}
          disabled={loading}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs sm:text-sm font-semibold shadow-xs cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#0586a8]' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 sm:h-32 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-xs" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl bg-white border ${card.urgent ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200/90'} p-4 sm:p-5 overflow-hidden shadow-xs`}
            >
              {card.urgent && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-xs`}>
                <card.icon size={18} className="text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Plan Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#0586a8]" />
            Plan Distribution
          </h3>
          <div className="space-y-3">
            {planItems.map((p) => {
              const total = stats?.totalOrgs || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">{p.label}</span>
                    <span className="text-slate-900 font-bold">{p.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className={`h-full rounded-full ${p.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Companies */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              Pending Approvals
              {(data?.recentPending?.length || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold">
                  {data.recentPending.length}
                </span>
              )}
            </h3>
            <Link
              to="/platform/companies?tab=requests"
              className="text-xs text-[#0586a8] hover:text-[#04718f] font-semibold flex items-center gap-1 shrink-0"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!data?.recentPending?.length ? (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentPending.map((org) => (
                <div key={org._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                      {org.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 text-sm font-bold truncate">{org.name}</p>
                      <p className="text-slate-500 text-xs truncate">{org.ownerId?.email}</p>
                    </div>
                  </div>
                  <Link
                    to={`/platform/companies/${org._id}`}
                    className="w-full sm:w-auto text-center px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#0586a8] hover:bg-[#04718f] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          to="/platform/companies"
          className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0586a8] shrink-0">
              <Building2 size={20} />
            </div>
            <span className="text-slate-900 font-bold text-sm">Manage All Companies</span>
          </div>
          <ArrowRight size={16} className="text-[#0586a8] group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
        <Link
          to="/platform/companies?tab=requests"
          className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={20} />
            </div>
            <span className="text-slate-900 font-bold text-sm">Review Pending Registrations</span>
          </div>
          <ArrowRight size={16} className="text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      </div>
    </div>
  );
};

export default PlatformDashboard;
