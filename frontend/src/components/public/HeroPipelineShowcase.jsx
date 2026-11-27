import React from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageSquare,
  Calendar,
  ArrowRight,
  MoreVertical,
  Zap,
} from 'lucide-react';

export const HeroPipelineShowcase = () => {
  return (
    <div className="relative mt-10 sm:mt-14 max-w-5xl mx-auto px-2 sm:px-4">
      {/* ── AMBIENT GLOW BACKDROP ── */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#07c8f9]/15 via-emerald-500/10 to-[#07c8f9]/10 rounded-3xl blur-2xl -z-10 pointer-events-none transform -translate-y-2" />

      {/* ── FLOATING BADGE 1: Won Deal Pulse (Top-Left) ── */}
      <div className="hidden md:flex absolute -top-5 -left-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 shadow-lg shadow-emerald-500/10 text-xs font-bold text-slate-800 animate-bounce duration-1000">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-emerald-600 font-extrabold">✓ Deal Won:</span>
        <span>₹90,000/mo</span>
      </div>

      {/* ── FLOATING BADGE 2: 1-Click Action (Top-Right) ── */}
      <div className="hidden md:flex absolute -top-5 -right-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#07c8f9]/30 shadow-lg shadow-[#07c8f9]/15 text-xs font-bold text-slate-800">
        <Sparkles size={14} className="text-[#07c8f9]" />
        <span className="text-[#07c8f9] font-extrabold">Instant:</span>
        <span>Client & Project Created in 1-Click</span>
      </div>

      {/* ── MAIN BROWSER APPLICATION SHELL ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden text-left">
        
        {/* Top Browser Window Header */}
        <div className="h-10 sm:h-12 bg-slate-50 border-b border-slate-200/80 px-3 sm:px-4 flex items-center justify-between gap-3">
          {/* Three macOS Window Controls */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>

          {/* Center Address Pill */}
          <div className="hidden xs:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-500">
            <span className="text-emerald-500">https://</span>
            <span>agencyupscale.com/crm/leads</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
            <span className="hidden sm:inline-block text-slate-400 text-[11px]">Pipeline:</span>
            <span className="px-2 py-0.5 rounded-md bg-[#07c8f9]/10 text-[#0d99b2] text-[11px] font-black">
              ₹3,85,000
            </span>
          </div>
        </div>

        {/* In-App Toolbar */}
        <div className="px-3 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shrink-0">
              <Plus size={13} />
              <span>New Opportunity</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
              <Filter size={12} />
              <span>All Stages</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-[11px] font-bold text-slate-500 hidden md:block">
              Won this month: <strong className="text-emerald-600 font-extrabold">₹2,40,000</strong>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Pipeline
            </span>
          </div>
        </div>

        {/* ── KANBAN PIPELINE COLUMNS (Odoo CRM Signature Layout) ── */}
        <div className="p-3 sm:p-5 bg-slate-50/60 overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-[580px] md:min-w-0">
            
            {/* ── COLUMN 1: NEW LEADS ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-300">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  New Leads <span className="text-slate-400 font-medium">(2)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">₹1,20k</span>
              </div>

              {/* Deal Card 1 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5 hover:border-[#07c8f9]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">Nexa Retail</span>
                  <span className="text-[10px] font-black text-[#07c8f9]">₹75,000</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 font-semibold">Meta Ads</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">Reels</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={10} />
                    <span>WhatsApp</span>
                  </span>
                  <span className="text-slate-400">10m ago</span>
                </div>
              </div>

              {/* Deal Card 2 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">Zenith Fashion</span>
                  <span className="text-[10px] font-black text-[#07c8f9]">₹45,000</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold inline-block">
                  Brand Identity
                </span>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-slate-400 font-medium">
                  <span>Web Form</span>
                  <span>1h ago</span>
                </div>
              </div>
            </div>

            {/* ── COLUMN 2: CONTACTED ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b-2 border-amber-400">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Contacted <span className="text-slate-400 font-medium">(1)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">₹50k</span>
              </div>

              {/* Deal Card 3 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">FreshBites Cafe</span>
                  <span className="text-[10px] font-black text-[#07c8f9]">₹50,000</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-semibold">SMM Quota</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-amber-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Phone size={10} />
                    <span>Call Scheduled</span>
                  </span>
                  <span className="text-slate-400">3:30 PM</span>
                </div>
              </div>
            </div>

            {/* ── COLUMN 3: PROPOSAL SENT ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#07c8f9]">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Proposal <span className="text-slate-400 font-medium">(1)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">₹1,20k</span>
              </div>

              {/* Deal Card 4 */}
              <div className="p-2.5 rounded-xl bg-white border-2 border-[#07c8f9]/40 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">Horizon Tech</span>
                  <span className="text-[10px] font-black text-[#07c8f9]">₹1,20,000</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold">Custom Web</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold">SEO</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-[#07c8f9] font-bold">
                  <span className="flex items-center gap-1">
                    <Zap size={10} />
                    <span>1-Tap Link Viewed</span>
                  </span>
                  <span className="text-slate-400">Today</span>
                </div>
              </div>
            </div>

            {/* ── COLUMN 4: WON & ACTIVE ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b-2 border-emerald-500">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                  Won Deals <span className="text-emerald-500 font-medium">(2)</span>
                </span>
                <span className="text-[10px] font-black text-emerald-600">₹1,40k</span>
              </div>

              {/* Deal Card 5 */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 truncate">Luxe Interiors</span>
                  <span className="text-[10px] font-black text-emerald-700">₹90,000/mo</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold inline-block">
                  ✓ Active Retainer
                </span>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80 text-[9px] text-emerald-700 font-extrabold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>Project Created</span>
                  </span>
                  <span>Invoice Paid</span>
                </div>
              </div>

              {/* Deal Card 6 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">Apex Dental</span>
                  <span className="text-[10px] font-black text-emerald-600">₹50,000/mo</span>
                </div>
                <div className="text-[9px] text-slate-500 font-medium">
                  Signed contract & vault key saved
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Status Ribbon */}
        <div className="px-4 py-2.5 bg-slate-900 text-white text-[11px] font-semibold flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Automatic Lead Tracking & Live Task Updates Active</span>
          </div>
          <span className="text-slate-400 text-[10px]">
            Drag & drop deals between stages to update your team instantly
          </span>
        </div>

      </div>
    </div>
  );
};

export default HeroPipelineShowcase;
