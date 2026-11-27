import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModuleUpgradeGate = ({ moduleInfo }) => {
  return (
    <div
      data-testid="module-upgrade-gate"
      className="min-h-[65vh] flex items-center justify-center p-4 sm:p-8"
    >
      <div className="w-full max-w-lg rounded-3xl border border-amber-200/80 dark:border-amber-900/50 bg-card p-6 sm:p-10 shadow-xl text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/12 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
          <Lock size={28} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {moduleInfo?.name || 'Module'} is Unavailable
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {moduleInfo?.description ||
              'This module is not enabled on your workspace. Please contact your platform administrator to enable access.'}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-white text-sm font-extrabold shadow-md shadow-[#07c8f9]/20 transition-all"
          >
            <span>Return to Dashboard</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModuleUpgradeGate;
