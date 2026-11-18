import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users2,
  Kanban,
  Globe,
  CreditCard,
  MapPin,
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  Check,
  FileText,
  Lock,
  Camera
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';

const CapabilitiesPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-10 sm:pt-16 pb-12 sm:pb-14 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 mb-5 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              Platform Capabilities
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-950 tracking-tight leading-tight">
            Engineered Specifically
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              For Digital Agencies.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Native tools designed to streamline client acquisition, creative production, and revenue management with zero external software subscriptions.
          </p>
        </div>
      </section>

      {/* ── ZIG-ZAG CAPABILITY SECTIONS ── */}
      <div className="py-14 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-20 sm:space-y-28">

        {/* ── MODULE 1: ZIG (Text Left, Visual Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>01</span>
              <span>•</span>
              <span>CRM & Pipeline</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Lead Pipeline & Deals.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                From Prospect to Paid.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Track qualified deals through custom sales stages, send branded proposals with client sign-off, and convert prospects directly into live projects.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Custom Deal Stages & Value Forecasting</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Branded Digital Proposals with Client Sign-off</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>1-Click Conversion from Lead to Active Project</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-[#12B7D4]/50 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <span className="text-xs font-mono text-slate-400">Deal Pipeline Overview</span>
                <span className="text-[11px] font-bold text-[#12B7D4] bg-[#12B7D4]/15 px-2.5 py-0.5 rounded-full">
                  $48,500 Active Pipeline
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Acme Corp • Growth Retainer</p>
                    <p className="text-xs text-slate-400">Stage: Proposal Review</p>
                  </div>
                  <span className="text-xs font-bold text-[#12B7D4]">$12,000/mo</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Apex Media • Brand Overhaul</p>
                    <p className="text-xs text-slate-400">Stage: Contract Signed</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">Won ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODULE 2: ZAG (Visual Left, Text Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-200/90 relative overflow-hidden group hover:border-[#12B7D4]/60 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <span className="text-xs font-bold text-slate-700">Multi-Channel Visual Calendar</span>
                <span className="text-xs font-bold text-[#12B7D4] bg-[#12B7D4]/10 px-2 py-0.5 rounded">
                  4 Channels Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <span className="text-xs font-bold text-slate-800 block">Mon</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Reel Video</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded block mt-2">Approved</span>
                </div>
                <div className="border border-[#12B7D4] rounded-xl p-3 bg-[#12B7D4]/5">
                  <span className="text-xs font-bold text-[#12B7D4] block">Wed</span>
                  <span className="text-[11px] text-slate-700 block mt-1">Ad Carousel</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded block mt-2">In Review</span>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <span className="text-xs font-bold text-slate-800 block">Fri</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Story Series</span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded block mt-2">Staged</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>02</span>
              <span>•</span>
              <span>SMM Calendar</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Content Calendar & SMM.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Visual Social Staging.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Designers and copywriters stage social creatives, schedule publishing dates, and collect client approvals right on the visual grid.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Multi-Platform Scheduling (Reels, Carousels, Stories)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Creative Revision Notes directly on post assets</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODULE 3: ZIG (Text Left, Visual Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>03</span>
              <span>•</span>
              <span>Billing & Finance</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Automated GST Invoicing.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Instant PDF Tax Invoices.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Generate GST-compliant tax invoices with automatic tax rate calculation (CGST, SGST, IGST), ledger recording, and downloadable PDFs.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Automated GST Calculation (CGST/SGST/IGST)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Instant PDF Download & Client Tax Receipts</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-[#12B7D4]/50 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#12B7D4]" />
                  <span className="text-xs font-mono text-slate-300">TAX INVOICE #INV-2026-089</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Paid
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Digital Marketing Retainer</span>
                  <span className="text-white font-bold">₹50,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">CGST (9%) + SGST (9%)</span>
                  <span className="text-white font-bold">₹9,000</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-[#12B7D4]">Total Paid</span>
                  <span className="text-emerald-400">₹59,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODULE 4: ZAG (Visual Left, Text Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-200/90 relative overflow-hidden group hover:border-[#12B7D4]/60 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <span className="text-xs font-bold text-slate-800">GPS Geofence Radius Status</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Inside Office Radius
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center">
                    <Camera size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mobile Selfie Verified</p>
                    <p className="text-[11px] text-slate-500">Timestamp: 09:14 AM • GPS Coordinates Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>04</span>
              <span>•</span>
              <span>Operations & HR</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              GPS Geofenced Attendance.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Verified Team Operations.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Mobile selfie check-in with GPS radius verification ensuring genuine, tamper-proof attendance for your office and field teams.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>GPS Location Verification within Office Perimeter</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Automated Attendance Timesheets & Payroll Reports</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── CALL TO ACTION ── */}
      <div className="pb-16 sm:pb-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-slate-950 text-white rounded-2xl p-8 sm:p-12 text-left sm:text-center relative overflow-hidden border border-slate-800">
          <h3 className="font-display font-black text-2xl sm:text-4xl text-white">
            Ready to Try These Capabilities?
          </h3>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
            Experience the complete agency operating system today. Set up your agency in less than 2 minutes.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3">
            <Link
              to="/login"
              className="px-8 py-3 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Workspace</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/register-company"
              className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm transition-all flex items-center justify-center"
            >
              Register Agency
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CapabilitiesPage;
