import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * Global modal triggered when a user tries to SAVE in a module or branch limit
 * that is not included in their current subscription plan.
 */
const PlanUpgradeModal = () => {
  const navigate = useNavigate();
  const [upgradeInfo, setUpgradeInfo] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      if (event?.detail) {
        setUpgradeInfo(event.detail);
      }
    };
    window.addEventListener('rwm-plan-upgrade-required', handler);
    return () => window.removeEventListener('rwm-plan-upgrade-required', handler);
  }, []);

  if (!upgradeInfo) return null;

  const title = upgradeInfo.limitType === 'branches'
    ? 'Branch Limit Reached'
    : `Upgrade to Save in ${upgradeInfo.moduleName || 'This Module'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={() => setUpgradeInfo(null)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Plan Upgrade Required</p>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground mb-5">
          {upgradeInfo.message ||
            'You can freely preview and fill out forms in this module. Upgrade your plan to save your changes and unlock full workspace capacity.'}
        </p>

        {upgradeInfo.requiredPlan && (
          <div className="mb-5 rounded-xl bg-secondary/70 border border-border/60 px-3.5 py-2.5 text-xs flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Recommended Plan</span>
            <span className="font-bold text-foreground">{upgradeInfo.requiredPlan}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setUpgradeInfo(null)}
            className="w-full sm:w-auto rounded-xl text-xs font-semibold cursor-pointer"
          >
            Continue Previewing
          </Button>
          <Button
            type="button"
            onClick={() => {
              setUpgradeInfo(null);
              navigate('/select-plan');
            }}
            className="w-full sm:w-auto rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
          >
            <span>Upgrade Plan</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeModal;
