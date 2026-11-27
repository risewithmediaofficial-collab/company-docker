import React, { useMemo, useState } from 'react';
import {
  Check,
  Users,
  Briefcase,
  Receipt,
  Calendar,
  MessageSquare,
  FileText,
  FileSignature,
  UserCheck,
  Globe,
  Wallet,
  Clock,
  Building2,
  Minus,
  Plus,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';

const REPLACEABLE_TOOLS = [
  {
    id: 'crm',
    label: 'CRM & Leads',
    replaces: 'HubSpot / Salesforce',
    monthlyCost: 2000,
    perUser: true,
    icon: Users,
    iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
    defaultSelected: true,
  },
  {
    id: 'projects',
    label: 'Projects & Tasks',
    replaces: 'Asana',
    monthlyCost: 1100,
    perUser: true,
    icon: Briefcase,
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    defaultSelected: true,
  },
  {
    id: 'finance',
    label: 'Invoicing & GST',
    replaces: 'QuickBooks / Zoho Books',
    monthlyCost: 2500,
    perUser: false,
    icon: Receipt,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    defaultSelected: true,
  },
  {
    id: 'social',
    label: 'Social Calendar',
    replaces: 'Hootsuite / Buffer',
    monthlyCost: 4200,
    perUser: false,
    icon: Calendar,
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    defaultSelected: true,
  },
  {
    id: 'chat',
    label: 'Team & Client Chat',
    replaces: 'Slack',
    monthlyCost: 750,
    perUser: true,
    icon: MessageSquare,
    iconBg: 'bg-violet-50 text-violet-600 border-violet-100',
    defaultSelected: true,
  },
  {
    id: 'sop',
    label: 'SOPs & Docs',
    replaces: 'Notion',
    monthlyCost: 850,
    perUser: true,
    icon: FileText,
    iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
    defaultSelected: true,
  },
  {
    id: 'proposals',
    label: 'Proposals & Sign',
    replaces: 'PandaDoc / DocuSign',
    monthlyCost: 1900,
    perUser: true,
    icon: FileSignature,
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    defaultSelected: true,
  },
  {
    id: 'hr',
    label: 'HR & Attendance',
    replaces: 'BambooHR / Keka',
    monthlyCost: 900,
    perUser: true,
    icon: UserCheck,
    iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
    defaultSelected: false,
  },
  {
    id: 'portal',
    label: 'Client Portal',
    replaces: 'Basecamp / Copilot',
    monthlyCost: 2900,
    perUser: false,
    icon: Globe,
    iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    defaultSelected: false,
  },
  {
    id: 'expenses',
    label: 'Expenses & Payroll',
    replaces: 'Expensify',
    monthlyCost: 450,
    perUser: true,
    icon: Wallet,
    iconBg: 'bg-lime-50 text-lime-700 border-lime-100',
    defaultSelected: false,
  },
  {
    id: 'timesheets',
    label: 'Reports & Time',
    replaces: 'Harvest',
    monthlyCost: 950,
    perUser: true,
    icon: Clock,
    iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
    defaultSelected: false,
  },
  {
    id: 'branches',
    label: 'Multi-Branch Ops',
    replaces: 'Monday.com',
    monthlyCost: 1000,
    perUser: true,
    icon: Building2,
    iconBg: 'bg-pink-50 text-pink-600 border-pink-100',
    defaultSelected: false,
  },
];

const COMPARISON_PLANS = [
  { id: 'starter', label: 'Starter (5 GB)', monthlyPrice: 10 },
  { id: 'growth', label: 'Growth (25 GB)', monthlyPrice: 2999 },
  { id: 'enterprise_pro', label: 'Enterprise Pro (100 GB)', monthlyPrice: 6999 },
];

const DEFAULT_IDS = REPLACEABLE_TOOLS.filter((t) => t.defaultSelected).map((t) => t.id);

const formatINR = (amount) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

const SaasSavingsCalculator = ({ billingCycle = 'monthly', onSelectPlan }) => {
  const [selectedIds, setSelectedIds] = useState(DEFAULT_IDS);
  const [users, setUsers] = useState(10);
  const [selectedPlanId, setSelectedPlanId] = useState('growth');

  const toggleTool = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUsersChange = (next) => {
    const parsed = Number(next);
    if (Number.isNaN(parsed)) return;
    setUsers(Math.max(1, Math.min(500, Math.round(parsed))));
  };

  const selectedTools = useMemo(
    () => REPLACEABLE_TOOLS.filter((tool) => selectedIds.includes(tool.id)),
    [selectedIds]
  );

  const competitorMonthlyTotal = useMemo(
    () =>
      selectedTools.reduce(
        (sum, tool) => sum + (tool.perUser ? tool.monthlyCost * users : tool.monthlyCost),
        0
      ),
    [selectedTools, users]
  );

  const competitorYearlyTotal = competitorMonthlyTotal * 12;

  const activePlan =
    COMPARISON_PLANS.find((p) => p.id === selectedPlanId) || COMPARISON_PLANS[1];

  const agencyUpscaleYearlyTotal =
    billingCycle === 'annual'
      ? activePlan.monthlyPrice * 10
      : activePlan.monthlyPrice * 12;

  const yearlySavings = Math.max(0, competitorYearlyTotal - agencyUpscaleYearlyTotal);

  return (
    <section
      aria-labelledby="savings-calculator-heading"
      className="mt-16 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-4 bg-slate-50/70">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[#0586a8] text-[11px] font-extrabold uppercase tracking-wider mb-3">
            SaaS Cost Calculator
          </span>
          <h2
            id="savings-calculator-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
          >
            Cut Your Agency Tool Spend — Compare &amp; Save
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Select the separate apps your team pays for today and see how much you save by consolidating into one Agency Upscale workspace.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedIds(REPLACEABLE_TOOLS.map((t) => t.id))}
            className="text-xs font-bold text-[#0586a8] hover:text-slate-900 transition"
          >
            Select all
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => {
              setSelectedIds(DEFAULT_IDS);
              setUsers(10);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        {/* Left: App selector + team size */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:border-r border-slate-100 bg-slate-50/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Which apps do you use?
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {selectedTools.length} of {REPLACEABLE_TOOLS.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {REPLACEABLE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedIds.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => toggleTool(tool.id)}
                  aria-pressed={isSelected}
                  className={`relative group text-left rounded-2xl p-3.5 bg-white transition-all border ${
                    isSelected
                      ? 'border-[#0586a8] ring-2 ring-cyan-500/15 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-[#0586a8] border-[#0586a8] text-white scale-100'
                        : 'bg-white border-slate-200 text-transparent scale-90 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>

                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2.5 ${tool.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {tool.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 truncate">
                    {tool.replaces}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Team size selector */}
          <div className="mt-7 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                How many team members?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Other SaaS tools charge per seat — Agency Upscale charges one flat workspace fee.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[5, 10, 20, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setUsers(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    users === preset
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}

              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  type="button"
                  aria-label="Decrease team members"
                  onClick={() => handleUsersChange(users - 1)}
                  className="px-2.5 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={500}
                  aria-label="Team members count"
                  value={users}
                  onChange={(e) => handleUsersChange(e.target.value)}
                  className="w-14 text-center text-xs font-extrabold text-slate-900 focus:outline-none py-1.5"
                />
                <button
                  type="button"
                  aria-label="Increase team members"
                  onClick={() => handleUsersChange(users + 1)}
                  className="px-2.5 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Apps to replace + Savings */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Tools to replace</h3>
                <p className="text-xs text-slate-500">
                  for <strong className="text-slate-700">{users} {users === 1 ? 'user' : 'users'}</strong>
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">/ month</span>
            </div>

            {selectedTools.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Select one or more apps on the left to calculate your annual replacement cost.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="text-slate-700 font-medium">
                      {tool.replaces}{' '}
                      <span className="text-slate-400">({tool.label})</span>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0 ml-3">
                      {formatINR(tool.monthlyCost)}
                      {tool.perUser ? ' / user' : ' / mo'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                TOTAL
              </span>
              <span className="text-xl font-black text-slate-900">
                {formatINR(competitorYearlyTotal)}{' '}
                <span className="text-xs font-semibold text-slate-500">/ year</span>
              </span>
            </div>

            {/* Agency Upscale Comparison */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    All Agency Upscale Apps
                  </h4>
                  <p className="text-xs text-slate-500">
                    Flat workspace fee for {users} {users === 1 ? 'user' : 'users'} (
                    {billingCycle === 'annual' ? 'Annual billing' : 'Monthly billing'})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {COMPARISON_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      selectedPlanId === plan.id
                        ? 'bg-cyan-50 border-[#0586a8] text-[#0586a8]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  TOTAL
                </span>
                <span className="text-xl font-black text-[#0586a8]">
                  {formatINR(agencyUpscaleYearlyTotal)}{' '}
                  <span className="text-xs font-semibold text-slate-500">/ year</span>
                </span>
              </div>
            </div>
          </div>

          {/* Savings Highlight Box */}
          <div className="mt-6 rounded-2xl bg-slate-900 text-white p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#07c8f9]">
              Your estimated savings
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white border-b-4 border-[#07c8f9] pb-0.5">
                {formatINR(yearlySavings)} / year
              </span>
            </div>
            <p className="mt-2.5 text-xs text-slate-300">
              For one fully-integrated CRM, Projects, Social Calendar, GST Invoicing &amp; Client Portal.
            </p>
            {onSelectPlan && (
              <button
                type="button"
                onClick={() => onSelectPlan({ id: activePlan.id })}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-1.5 transition"
              >
                Start with {activePlan.label}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SaasSavingsCalculator;
