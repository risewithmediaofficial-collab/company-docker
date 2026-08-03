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
  trial:   'text-slate-400 bg-slate-400/10',
  starter: 'text-blue-400 bg-blue-400/10',
  growth:  'text-violet-400 bg-violet-400/10',
  pro:     'text-amber-400 bg-amber-400/10',
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
    { label: 'Total Companies', value: stats.totalOrgs, icon: Building2, color: 'from-indigo-600 to-violet-600', sub: 'Registered' },
    { label: 'Active Companies', value: stats.activeOrgs, icon: CheckCircle2, color: 'from-emerald-600 to-teal-600', sub: 'Currently using' },
    { label: 'Pending Approval', value: stats.pendingOrgs, icon: Clock, color: 'from-amber-600 to-orange-600', sub: 'Awaiting review', urgent: stats.pendingOrgs > 0 },
    { label: 'Total Users', value: stats.totalUsers, icon: Users2, color: 'from-blue-600 to-cyan-600', sub: 'Across all companies' },
  ] : [];

  const planItems = stats ? [
    { label: 'Trial', count: stats.planBreakdown.trial, color: 'bg-slate-500' },
    { label: 'Starter', count: stats.planBreakdown.starter, color: 'bg-blue-500' },
    { label: 'Growth', count: stats.planBreakdown.growth, color: 'bg-violet-500' },
    { label: 'Pro', count: stats.planBreakdown.pro, color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all registered companies and their access</p>
        </div>
        <button
          onClick={fetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl bg-white/5 border ${card.urgent ? 'border-amber-500/30' : 'border-white/5'} p-5 overflow-hidden`}
            >
              {card.urgent && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <card.icon size={18} className="text-white" />
              </div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{card.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Plan Distribution
          </h3>
          <div className="space-y-3">
            {planItems.map((p) => {
              const total = stats?.totalOrgs || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{p.label}</span>
                    <span className="text-white font-semibold">{p.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
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
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              Pending Approvals
              {(data?.recentPending?.length || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                  {data.recentPending.length}
                </span>
              )}
            </h3>
            <Link
              to="/platform/companies?status=pending"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!data?.recentPending?.length ? (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentPending.map((org) => (
                <div key={org._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-amber-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold text-sm">
                      {org.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{org.name}</p>
                      <p className="text-slate-500 text-xs">{org.ownerId?.email}</p>
                    </div>
                  </div>
                  <Link
                    to={`/platform/companies/${org._id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
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
      <div className="flex gap-4">
        <Link
          to="/platform/companies"
          className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-indigo-400" />
            <span className="text-white font-semibold text-sm">Manage All Companies</span>
          </div>
          <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/platform/companies?status=pending"
          className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-amber-600/10 border border-amber-500/20 hover:bg-amber-600/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400" />
            <span className="text-white font-semibold text-sm">Review Pending Registrations</span>
          </div>
          <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default PlatformDashboard;
