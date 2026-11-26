import React from 'react';
import { Check, HardDrive, Users, Sparkles, ArrowRight, Loader2, Layers } from 'lucide-react';

export const DEFAULT_STORAGE_PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Start your workspace cleanly with core CRM & client tracking',
    badge: 'Free Forever',
    storageLabel: '100 MB Storage',
    storageLimitMb: 100,
    monthlyPriceInr: 0,
    annualPriceInr: 0,
    maxUsers: 2,
    maxClients: 3,
    popular: false,
    features: [
      '100 MB Cloud File Storage',
      'Up to 3 Active Clients',
      'Up to 2 Team Members',
      'CRM Leads, Projects, Tasks & Client Portal',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For growing creative studios — 5 GB storage at just ₹10/mo',
    badge: '₹10 / mo',
    storageLabel: '5 GB Storage',
    storageLimitMb: 5120,
    monthlyPriceInr: 10,
    annualPriceInr: 96,
    maxUsers: 8,
    maxClients: 15,
    popular: false,
    features: [
      '5 GB Cloud File Storage',
      'Up to 15 Active Clients',
      'Up to 8 Team Members',
      'Client Portal, Attendance, SOP & Basic Reports',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Complete AgencyUpscale suite with Finance, SMM Tracker & HR',
    badge: 'Most Popular',
    storageLabel: '25 GB Storage',
    storageLimitMb: 25600,
    monthlyPriceInr: 2999,
    annualPriceInr: 28790,
    maxUsers: 25,
    maxClients: 50,
    popular: true,
    features: [
      '25 GB Cloud File Storage',
      'Up to 50 Active Clients',
      'Up to 25 Team Members',
      'Finance Hub, GST Invoices, SMM Tracker, HR & Vendors',
    ],
  },
  {
    id: 'pro',
    name: 'Enterprise Pro',
    tagline: 'High-storage multi-branch operations for scaling agencies',
    badge: 'Max Storage',
    storageLabel: '100 GB Storage',
    storageLimitMb: 102400,
    monthlyPriceInr: 6999,
    annualPriceInr: 67190,
    maxUsers: 100,
    maxClients: 500,
    popular: false,
    features: [
      '100 GB Cloud File Storage',
      'Up to 500 Active Clients',
      'Up to 100 Team Members',
      'All Modules, Multi-Branch, Automations & Priority Support',
    ],
  },
];

export const formatStorageQuota = (mb) => {
  const numeric = Number(mb || 0);
  if (numeric >= 1024) {
    const gb = numeric / 1024;
    return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
  }
  return `${numeric} MB`;
};

const PricingPlansGrid = ({
  plans = DEFAULT_STORAGE_PLANS,
  billingCycle = 'monthly',
  onBillingCycleChange,
  currentPlanId = null,
  currentBillingCycle = 'monthly',
  isCurrentActive = false,
  mode = 'public',
  processingPlanId = null,
  onSelectPlan,
}) => {
  const effectivePlans = Array.isArray(plans) && plans.length > 0 ? plans : DEFAULT_STORAGE_PLANS;

  return (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      {typeof onBillingCycleChange === 'function' && (
        <div className="flex justify-center">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => onBillingCycleChange('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => onBillingCycleChange('annual')}
              className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 4-Tier Storage Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {effectivePlans.map((plan) => {
          const monthlyPrice = Number(plan.monthlyPriceInr ?? plan.monthlyPrice ?? 0);
          const annualPrice = Number(plan.annualPriceInr ?? plan.annualPrice ?? 0);
          const isFree = monthlyPrice === 0;
          const displayPrice =
            billingCycle === 'annual' && !isFree
              ? Math.round(annualPrice / 12)
              : monthlyPrice;
          const isCurrent =
            Boolean(isCurrentActive) &&
            currentPlanId === plan.id &&
            (isFree || currentBillingCycle === billingCycle);
          const isPopular = Boolean(plan.popular || plan.id === 'growth');
          const isBusy = processingPlanId === plan.id;

          let ctaText = isFree ? 'Start Free (100 MB)' : `Choose ${plan.name}`;
          if (mode === 'billing') {
            if (isCurrent) {
              ctaText = 'Current Active Plan';
            } else if (isCurrentActive) {
              ctaText = isFree ? 'Switch to Free' : `Upgrade to ${plan.name}`;
            } else {
              ctaText = isFree ? 'Activate Free Plan' : `Pay & Activate`;
            }
          }

          return (
            <div
              key={plan.id}
              data-testid={`pricing-card-${plan.id}`}
              className={`relative rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between bg-white ${
                isPopular
                  ? 'border-[#07c8f9] ring-2 ring-[#07c8f9]/25 shadow-xl shadow-cyan-500/10'
                  : isCurrent
                  ? 'border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg'
                  : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isPopular
                        ? 'bg-[#07c8f9]/15 text-[#0586a8]'
                        : isFree
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPopular && <Sparkles className="w-3 h-3" />}
                    {plan.badge || plan.storageLabel}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                      Active Plan
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[34px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Monthly Price */}
                <div className="mt-4 pb-4 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 min-h-[16px]">
                    {isFree
                      ? 'Free forever • No card needed'
                      : billingCycle === 'annual'
                      ? `Billed ₹${annualPrice.toLocaleString('en-IN')}/year`
                      : 'Monthly billing • Upgrade anytime'}
                  </p>
                </div>

                {/* Storage & Client Quota Pills */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-cyan-50/80 border border-cyan-100 px-3 py-2 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#0586a8] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">Storage</p>
                      <p className="font-extrabold text-slate-900 truncate">
                        {formatStorageQuota(plan.storageLimitMb)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clients</p>
                      <p className="font-extrabold text-slate-900 truncate">
                        Up to {plan.maxClients}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  {(plan.features || []).map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-slate-500">
                    <Layers className="w-4 h-4 text-[#07c8f9] shrink-0 mt-0.5" />
                    <span>Up to {plan.maxUsers} team seats included</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled={Boolean(processingPlanId) || isCurrent}
                onClick={() => onSelectPlan?.(plan)}
                className={`mt-6 w-full py-3 px-4 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : isPopular
                    ? 'bg-gradient-to-r from-[#07c8f9] to-[#0586a8] text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 disabled:opacity-60'
                    : isFree
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-60'
                    : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60'
                }`}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {ctaText}
                    {!isCurrent && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingPlansGrid;
