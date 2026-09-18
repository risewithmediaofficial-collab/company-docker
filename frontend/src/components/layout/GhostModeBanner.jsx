import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { exitGhostMode, fetchMe } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function GhostModeBanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, ghostMode, ghostOrg } = useSelector((state) => state.auth);

  if (!ghostMode || !ghostOrg || (user?.role !== 'superAdmin' && user?.role !== 'admin')) {
    return null;
  }

  const handleExitLiveView = () => {
    const orgName = ghostOrg?.name || 'Company';
    dispatch(exitGhostMode());
    // Invalidate queries so platform or superAdmin data reloads fresh
    if (queryClient) {
      queryClient.clear();
    }
    dispatch(fetchMe());
    toast.success(`Exited Live View for "${orgName} + RWM". Returned to Platform Super Admin.`);
    navigate('/platform/companies');
  };

  const displayName = `${ghostOrg.name} + RWM`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="sticky top-0 z-40 w-full bg-gradient-to-r from-slate-950/95 via-indigo-950/90 to-slate-950/95 backdrop-blur-md border-b border-indigo-500/30 text-white shadow-xl select-none"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Live status + stealth badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live CRM View
            </span>

            <div className="flex items-center gap-2 min-w-0">
              {ghostOrg.logo ? (
                <img
                  src={ghostOrg.logo}
                  alt={displayName}
                  className="w-5 h-5 rounded-md object-contain bg-white/10 p-0.5 border border-white/20"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-5 h-5 rounded-md bg-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center justify-center border border-indigo-500/30">
                  {ghostOrg.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}
              <span className="font-bold text-white text-sm truncate max-w-[200px] sm:max-w-[320px]">
                {displayName}
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-indigo-200/70 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              <ShieldCheck size={12} className="text-emerald-400" />
              Stealth Mode Active • Company Admin is unaware
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/platform/companies/${ghostOrg._id}`)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-all"
              title="View tenant SaaS settings & modules"
            >
              <ExternalLink size={12} />
              <span className="hidden md:inline">Tenant Settings</span>
            </button>

            <button
              onClick={handleExitLiveView}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Exit stealth view and return to Platform Super Admin"
            >
              <XCircle size={13} />
              <span>Exit Live View</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
