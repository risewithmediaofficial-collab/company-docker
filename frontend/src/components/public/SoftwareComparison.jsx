import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, Sparkles, AlertCircle, Zap } from 'lucide-react';

const WHAT_THEY_HAVE = [
  {
    keyword: 'Scattered Client Data',
    desc: 'Leads in HubSpot, passwords in WhatsApp, tasks in Trello, invoices in QuickBooks.',
  },
  {
    keyword: 'Endless WhatsApp Chaos',
    desc: 'Important client feedback, post revisions, and approvals get buried in unorganized group chats.',
  },
  {
    keyword: 'High Monthly Costs',
    desc: 'Paying $350+/mo across 6+ separate subscriptions with expensive per-user seat penalties.',
  },
  {
    keyword: 'Manual Double Entry',
    desc: 'Copying phone numbers, project deadlines, and payment records across multiple tools by hand.',
  },
  {
    keyword: 'Constant Client Calls',
    desc: 'Clients call and message every day asking "What is the update on my campaign and invoice?"',
  },
  {
    keyword: 'Zero Role Privacy',
    desc: 'Designers and junior staff can accidentally view sensitive client billing retainers and company finances.',
  },
];

const WHAT_WE_DO = [
  {
    keyword: 'Single Agency Cockpit',
    desc: 'Leads, client directory, encrypted vault, tasks, and GST billing connected in one seamless flow.',
  },
  {
    keyword: '1-Tap Mobile Approvals',
    desc: 'Clients preview Instagram posts and reels on phone and tap "Approve" with zero login friction.',
  },
  {
    keyword: '1 Predictable System',
    desc: 'Eliminate 6+ subscription costs. CRM, SMM tracker, calendar, and billing under one affordable roof.',
  },
  {
    keyword: 'Instant GST Tax Invoices',
    desc: 'Auto 18% CGST/SGST tax math, payment tracking, and 1-click printable PDF receipts.',
  },
  {
    keyword: 'Dedicated Client Portal',
    desc: 'Paying clients log in to track live progress and ad spends without calling your team every morning.',
  },
  {
    keyword: 'Strict Role Governance',
    desc: 'Team members see only their assigned work; company margins, loans, and payroll stay strictly private.',
  },
];

export const SoftwareComparison = () => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-2">
          The Agency Difference
        </p>
        <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.2]">
          Other Softwares vs RiseWithMedia OS
          <span className="text-[#12B7D4] block mt-1">
            What They Have vs What We Do.
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
          Most marketing agencies struggle with 6 to 8 disconnected apps that don’t talk to each other.
          Here is how moving to one unified agency operating system transforms your entire business.
        </p>
      </div>

      {/* Modern Comparison Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        
        {/* ── CARD 1: WHAT THEY HAVE (Other Softwares) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 border border-slate-200 shadow-2xs flex flex-col justify-between transition-all">
          <div>
            {/* Header Plain Text (No Rounded Pill Effect) */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                The Fragmented Stack
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                What They Have
              </span>
            </div>

            {/* Card Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              5 to 8 Disconnected Apps
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Trello + WhatsApp + HubSpot + QuickBooks + Google Drive + Spreadsheets
            </p>

            {/* Price Tag Pill */}
            <div className="mt-4 p-3 rounded-2xl bg-white border border-rose-200/80 flex items-center justify-between text-xs font-bold text-rose-600">
              <span>Estimated Cost:</span>
              <span className="font-black text-rose-700 sm:text-sm">$250 – $500+/mo in multi-app subscriptions</span>
            </div>

            {/* Points List */}
            <div className="space-y-4 pt-6">
              {WHAT_THEY_HAVE.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {item.keyword}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Card Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200/90 text-center">
            <span className="text-xs font-bold text-slate-500">
              Result: Lost client deals, scattered tasks & wasted hours
            </span>
          </div>
        </div>

        {/* ── CARD 2: WHAT WE DO (RiseWithMedia OS) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#12B7D4]/40 shadow-xl shadow-[#12B7D4]/10 flex flex-col justify-between relative overflow-hidden transition-all">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#12B7D4]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header Plain Text (No Rounded Pill Effect) */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#12B7D4]">
                All-in-One Operating System
              </span>
              <span className="text-xs font-black text-[#12B7D4] uppercase tracking-wider">
                What We Do
              </span>
            </div>

            {/* Card Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              RiseWithMedia OS
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
              CRM + Content Calendar + 1-Tap Approvals + GST Invoices + Attendance
            </p>

            {/* Value Tag Pill */}
            <div className="mt-4 p-3 rounded-2xl bg-[#12B7D4]/10 border border-[#12B7D4]/30 flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5 text-[#0d99b2]">
                <Zap size={14} className="fill-[#12B7D4]" />
                <span>14-Day Free Trial:</span>
              </span>
              <span className="font-black text-slate-950 sm:text-sm">Zero Credit Card • Complete Access</span>
            </div>

            {/* Points List (Exact checkmark layout matching reference image) */}
            <div className="space-y-4 pt-6">
              {WHAT_WE_DO.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {item.keyword}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Card Footer with CTA */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>✓ Save 12+ hours every week</span>
            </span>
            <Link
              to="/register-company"
              className="px-5 py-2.5 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs font-bold shadow-md shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SoftwareComparison;
