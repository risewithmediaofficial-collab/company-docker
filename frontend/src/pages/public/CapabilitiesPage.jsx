import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Users2,
  Calendar,
  FileText,
  Smile,
  ShieldCheck,
  Sparkles,
  Clock,
  ThumbsUp,
  Receipt
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';

const CapabilitiesPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 mb-5 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              Agency Capabilities
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-950 tracking-tight leading-tight">
            Simple Features Made For
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              Your Daily Agency Work.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Every feature is straightforward and easy to use. No complicated setup, no long training required.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3">
            <Link
              to="/register-company"
              className="px-8 py-3.5 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm transition-all flex items-center justify-center shadow-2xs"
            >
              Login to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ── ZIG-ZAG CAPABILITY SECTIONS (NO CARDS, REDUCED TEXT, BLACK & BLUE ANIMATION) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-28 sm:space-y-36">

        {/* ── 01: Client & Deal Tracker ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                01 / Client & Deal Tracker
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Manage Every Client and Deal
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  Without Spreadsheet Mess.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Save client phone numbers, requirement notes, project budgets, and follow-up dates in one clean interface.
              </p>
              <div className="pt-2 space-y-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Clear stages: New inquiry, Proposal sent, Signed retainer</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Store client contacts, GSTIN numbers, and billing addresses</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Client Pipeline</span>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold shadow-2xs">
                <span>Greenline Organic Supermarket</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active Client</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold shadow-2xs">
                <span>Prestige Dental Care</span>
                <span className="text-[#12B7D4] bg-[#12B7D4]/10 px-2 py-0.5 rounded">Quote Ready</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 02: Social Media Calendar ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Scheduled Deliverables</span>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">12 Instagram Reels</span>
                  <span className="text-emerald-600">8 Completed</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#12B7D4] h-full w-2/3 rounded-full" />
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">16 Carousel Graphics</span>
                  <span className="text-[#12B7D4]">12 In Review</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#12B7D4] h-full w-3/4 rounded-full" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                02 / Social Media Calendar
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Visual Agency Schedule for
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  Posts and Reels.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Coordinate your graphic designers, copywriters, and video editors on a unified monthly calendar.
              </p>
              <div className="pt-2 space-y-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>View upcoming posts grouped by client and posting date</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Attach caption copy, hashtags, and image files in one place</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 03: Client Approvals ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                03 / 1-Tap Client Approvals
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Clients Review on Their Phone
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  With One Tap.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                No app installation required for your clients. They receive a clean mobile link to review creatives and approve them in seconds.
              </p>
              <div className="pt-2 space-y-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Clients see real visual previews on mobile screens</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Instant approval or edit notes recorded automatically</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Approval Speed</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Diwali Launch Ad Creative</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Approved</span>
                </div>
                <p className="text-xs text-slate-500">Approved by client on smartphone in 3 minutes</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 04: Fast GST Invoicing ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Tax Invoice</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Retainer Invoice #102</span>
                  <span className="text-emerald-600 font-bold">18% GST Added</span>
                </div>
                <p className="text-xs text-slate-500">Complete GSTIN, address, and bank payment QR</p>
                <div className="pt-2 border-t border-slate-100 text-xs font-bold text-[#12B7D4]">
                  One-click PDF download ready
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                04 / Fast GST Invoicing
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Tax Invoices Created in Seconds
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  With 1-Click PDF.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Generate professional agency tax invoices with accurate GST rates, line items, and bank details.
              </p>
              <div className="pt-2 space-y-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Calculates 9% CGST and 9% SGST automatically</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Clients can view and download their bills anytime</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 05: Staff Attendance & Workspace ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                05 / Staff Attendance & Workspace
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Selfie Attendance and
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  100% Private Workspaces.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Staff check in from mobile with a quick selfie. Every company has an isolated workspace with custom branding.
              </p>
              <div className="pt-2 space-y-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Quick selfie check-in on mobile with timestamp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Strict role-based permissions for managers and staff</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Workspace Isolation</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Role Permissions</span>
                  <span className="text-[#12B7D4] font-bold">Protected</span>
                </div>
                <p className="text-xs text-slate-500">Designers only see tasks; Managers handle billing</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 text-left sm:text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Ready to Try These Tools For{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#38bdf8] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer">
              Your Agency?
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Takes less than 2 minutes to register. Start with zero clutter and pure efficiency.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-sm sm:text-base transition-all flex items-center justify-center"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default CapabilitiesPage;
