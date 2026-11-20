import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, Zap, Split, Columns2, ArrowRightLeft } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const COMPARISON_ITEMS = [
  {
    category: 'Client Data',
    badTitle: 'Scattered Across 6 Apps',
    badDesc: 'Leads, passwords, and task briefs split across disjointed tools.',
    goodTitle: 'Single Agency Cockpit',
    goodDesc: 'Leads, encrypted vault, and deliverables connected in 1 flow.',
  },
  {
    category: 'Client Approvals',
    badTitle: 'Midnight WhatsApp Chaos',
    badDesc: 'Feedback and revision files buried in unorganized group chats.',
    goodTitle: '1-Tap Mobile Review Links',
    goodDesc: 'Clients preview and approve graphics on phone in seconds.',
  },
  {
    category: 'Software Costs',
    badTitle: '$350+/mo Subscription Tax',
    badDesc: 'Paying 6+ separate SaaS bills with expensive per-seat penalties.',
    goodTitle: '1 Predictable System',
    goodDesc: 'Replaces HubSpot, Trello, Clockify & QuickBooks in one plan.',
  },
  {
    category: 'GST Invoicing',
    badTitle: 'Manual Word & Tax Splits',
    badDesc: 'Weekends spent calculating 18% GST splits and chasing wire transfers.',
    goodTitle: '30-Second GST Tax PDFs',
    goodDesc: 'Auto CGST/SGST math with instant sequential PDF & payment QR.',
  },
  {
    category: 'Role Privacy',
    badTitle: 'Zero Financial Privacy',
    badDesc: 'Staff and designers can view sensitive client retainers and margins.',
    goodTitle: 'PIN-Gated Financial Vault',
    goodDesc: 'Staff see assigned tasks; founder financials stay strictly confidential.',
  },
];

export const SoftwareComparison = () => {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'versus'

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      <ScrollReveal delay={0}>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-2">
            The Agency Difference
          </p>
          <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
            Other Softwares vs <span className="marker-highlight">RiseWithMedia OS</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
            Why managing retainers in 6 disconnected apps costs you deals, time, and sanity.
          </p>

          {/* Creative Interactive Toggle: Side-by-Side vs Head-to-Head */}
          <div className="mt-6 inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns2 size={13} />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('versus')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'versus'
                  ? 'bg-[#12B7D4] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ArrowRightLeft size={13} />
              <span>Direct Contrast</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* ── VIEW 1: COMPACT SIDE-BY-SIDE CARDS (SHORTENED & CLEAN) ── */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch animate-fade-up">
          {/* ── CARD 1: THE FRAGMENTED STACK ── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-50/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between transition-all hover:border-rose-200 scroll-stack-card">
            <div>
              {/* Header Topline */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                  The Fragmented Stack
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  What They Have
                </span>
              </div>

              {/* Title & Micro-Stack */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                5 to 8 Disconnected Apps
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Trello • WhatsApp • HubSpot • QuickBooks • Spreadsheets
              </p>

              {/* Compact Metrics Pill */}
              <div className="mt-3.5 px-3.5 py-2 rounded-2xl bg-white border border-rose-200/70 flex items-center justify-between text-xs font-bold text-rose-600">
                <span>Cost Penalty:</span>
                <span className="font-extrabold text-rose-700">$250 – $500+/mo • 12 hrs lost/wk</span>
              </div>

              {/* 5 Compact, Single-Line Bullets */}
              <div className="space-y-3 pt-5">
                {COMPARISON_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={12} className="stroke-[3]" />
                    </div>
                    <div className="text-left leading-snug">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.badTitle}
                      </span>
                      <span className="text-slate-400 mx-1.5 hidden sm:inline">•</span>
                      <p className="text-xs text-slate-500 font-medium sm:inline">
                        {item.badDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Summary */}
            <div className="pt-4 mt-5 border-t border-slate-200/80 text-center text-xs font-bold text-slate-400">
              Result: Lost client deals, data leaks & endless tool switching
            </div>
          </div>

          {/* ── CARD 2: RISEWITHMEDIA OS ── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#12B7D4]/40 shadow-xl shadow-[#12B7D4]/10 flex flex-col justify-between relative overflow-hidden transition-all scroll-stack-card">
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#12B7D4]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header Topline */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#12B7D4]">
                  All-in-One Operating System
                </span>
                <span className="text-[11px] font-black text-[#12B7D4] uppercase tracking-wider">
                  What We Do
                </span>
              </div>

              {/* Title & Core Modules */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                RiseWithMedia OS
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                CRM • Content Calendar • 1-Tap Approvals • GST • Vault
              </p>

              {/* Value Pill */}
              <div className="mt-3.5 px-3.5 py-2 rounded-2xl bg-[#12B7D4]/10 border border-[#12B7D4]/30 flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5 text-[#0d99b2]">
                  <Zap size={13} className="fill-[#12B7D4]" />
                  <span>14-Day Free Trial:</span>
                </span>
                <span className="font-extrabold text-slate-950">Zero Credit Card • Complete Access</span>
              </div>

              {/* 5 Compact, Single-Line Bullets */}
              <div className="space-y-3 pt-5">
                {COMPARISON_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <div className="text-left leading-snug">
                      <span className="font-bold text-slate-950 text-xs sm:text-sm">
                        {item.goodTitle}
                      </span>
                      <span className="text-slate-300 mx-1.5 hidden sm:inline">•</span>
                      <p className="text-xs text-slate-600 font-medium sm:inline">
                        {item.goodDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer with CTA */}
            <div className="pt-4 mt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>✓ Save 12+ hours every week</span>
              </span>
              <Link
                to="/register-company"
                className="px-5 py-2 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs font-bold shadow-md shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-1.5 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: INTERACTIVE HEAD-TO-HEAD CONTRAST (CREATIVE ROW MATRIX) ── */}
      {viewMode === 'versus' && (
        <div className="space-y-3 max-w-4xl mx-auto animate-fade-up">
          {COMPARISON_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center"
            >
              {/* Category Pill */}
              <div className="md:col-span-2 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {item.category}
                </span>
              </div>

              {/* The Fragmented Way */}
              <div className="md:col-span-5 flex items-start gap-2.5 text-left p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <X size={12} className="stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.badTitle}</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{item.badDesc}</p>
                </div>
              </div>

              {/* The RiseWithMedia Way */}
              <div className="md:col-span-5 flex items-start gap-2.5 text-left p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-100">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 text-xs sm:text-sm">{item.goodTitle}</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">{item.goodDesc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Quick Action Footer in Versus Mode */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-600">
              Ready to replace 6+ subscriptions with one unified cockpit?
            </span>
            <Link
              to="/register-company"
              className="px-6 py-2.5 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs font-bold shadow-md shadow-[#12B7D4]/25 transition-all flex items-center gap-1.5"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default SoftwareComparison;

