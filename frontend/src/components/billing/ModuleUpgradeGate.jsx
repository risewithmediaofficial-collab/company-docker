import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight, CheckCircle2, Layers } from 'lucide-react';

const ModuleUpgradeGate = ({ moduleInfo, organization }) => {
  const currentPlanLabel =
    organization?.plan === 'pro' ? 'Enterprise Pro' : organization?.plan || 'Free';

  return (
    <div
      data-testid="module-upgrade-gate"
      className="min-h-[65vh] flex items-center justify-center p-4 sm:p-8"
    >
      <div className="w-full max-w-xl rounded-3xl border border-amber-200/80 dark:border-amber-900/50 bg-card p-6 sm:p-10 shadow-xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/12 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
          <Lock size={28} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/12 text-amber-700 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles size={13} />
            Upgrade Required • Unlock on {moduleInfo?.minPlan || 'Higher Plan'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {moduleInfo?.name || 'Module'} is Locked
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {moduleInfo?.description ||
              'This module is not included in your current plan. Upgrade mid-cycle anytime with zero data loss.'}
          </p>
        </div>

        <div className="rounded-2xl bg-background border border-border p-4 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-muted-foreground font-semibold">Current Active Plan</span>
            <span className="font-extrabold capitalize text-foreground">{currentPlanLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Instant unlock right after Razorpay checkout</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers size={14} className="shrink-0 text-[#12B7D4]" />
            <span>Expands cloud storage quota, active client limits &amp; team seats automatically</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            to="/select-plan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-sm font-extrabold shadow-md shadow-[#12B7D4]/20 transition-all"
          >
            <span>Upgrade Plan</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/settings?section=billing"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border bg-background hover:bg-secondary text-xs font-bold text-foreground transition-colors"
          >
            View My Plan &amp; Storage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModuleUpgradeGate;
