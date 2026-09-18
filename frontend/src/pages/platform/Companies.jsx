import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  XCircle, Eye, RefreshCw, ChevronLeft, ChevronRight, Users2, Radio
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { enterGhostMode } from '../../store/slices/authSlice';

const planBadge = {
  trial:   'text-slate-400 bg-slate-400/10 border-slate-500/20',
  starter: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
  growth:  'text-violet-400 bg-violet-400/10 border-violet-500/20',
  pro:     'text-amber-400 bg-amber-400/10 border-amber-500/20',
};

const statusBadge = {
  pending:   'text-amber-400 bg-amber-400/10 border-amber-500/20',
  active:    'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
  suspended: 'text-red-400 bg-red-400/10 border-red-500/20',
  expired:   'text-slate-400 bg-slate-400/10 border-slate-500/20',
};

const statusIcons = { pending: Clock, active: CheckCircle2, suspended: AlertTriangle, expired: XCircle };

const Companies = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orgs, setOrgs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || '';
  const plan = searchParams.get('plan') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (plan) params.set('plan', plan);
      if (search) params.set('search', search);
      params.set('page', page);

      const res = await axios.get(`/api/platform/organizations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrgs(res.data.organizations);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [status, plan, search, page]);

  const handleLiveViewCRM = (org) => {
    dispatch(enterGhostMode(org));
    if (queryClient) {
      queryClient.clear();
    }
    toast.success(`Stealth Live View Activated for "${org.name} + RWM". Tenant is unaware.`);
    navigate('/');
  };

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total registered companies</p>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search company name..."
            defaultValue={search}
            onKeyDown={(e) => e.key === 'Enter' && setFilter('search', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => setFilter('status', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
        >
          <option value="" className="bg-[#090a0f]">All Status</option>
          <option value="pending" className="bg-[#090a0f]">Pending</option>
          <option value="active" className="bg-[#090a0f]">Active</option>
          <option value="suspended" className="bg-[#090a0f]">Suspended</option>
          <option value="expired" className="bg-[#090a0f]">Expired</option>
        </select>

        {/* Plan filter */}
        <select
          value={plan}
          onChange={(e) => setFilter('plan', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
        >
          <option value="" className="bg-[#090a0f]">All Plans</option>
          <option value="trial" className="bg-[#090a0f]">Trial</option>
          <option value="starter" className="bg-[#090a0f]">Starter</option>
          <option value="growth" className="bg-[#090a0f]">Growth</option>
          <option value="pro" className="bg-[#090a0f]">Pro</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Owner</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Plan</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Users</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Registered</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 rounded bg-white/5 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orgs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-500">
                  <Building2 size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No companies found</p>
                </td>
              </tr>
            ) : (
              orgs.map((org, i) => {
                const StatusIcon = statusIcons[org.planStatus] || Clock;
                return (
                  <motion.tr
                    key={org._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0 overflow-hidden border border-white/10">
                          {org.logo ? (
                            <img src={org.logo} alt={org.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            org.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{org.name} + RWM</p>
                          {org.industry && <p className="text-slate-500 text-xs">{org.industry}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-slate-300 text-sm">{org.ownerId?.name}</p>
                      <p className="text-slate-500 text-xs">{org.ownerId?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge[org.planStatus]}`}>
                        <StatusIcon size={10} />
                        {org.planStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${planBadge[org.plan]}`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <Users2 size={14} className="text-slate-500" />
                        {org.userCount || 0}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <p className="text-slate-400 text-xs">
                        {new Date(org.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLiveViewCRM(org)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition-all border border-emerald-500/20 shadow-xs"
                          title="Live View Company CRM (Stealth Ghost Mode)"
                        >
                          <Radio size={12} className="animate-pulse text-emerald-400" />
                          <span>Live View</span>
                        </button>
                        <Link
                          to={`/platform/companies/${org._id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition-all"
                        >
                          <Eye size={12} /> Manage
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">{total} companies total</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setFilter('page', page - 1)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-slate-400 text-sm px-3">Page {page} of {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setFilter('page', page + 1)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
