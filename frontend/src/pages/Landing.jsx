import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Layers,
  Sparkles,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Users2,
  Kanban,
  Globe,
  Check,
  Lock,
  CreditCard
} from 'lucide-react';
import PublicLayout from '../components/public/PublicLayout';
import HeroPattern from '../components/public/HeroPattern';

const Landing = () => {
  return (
    <PublicLayout>
      {/* ── HERO SECTION (Pattern cut off right below action buttons) ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-10 sm:pt-16 pb-12 sm:pb-14 px-4 sm:px-8 text-left sm:text-center">
        {/* Pattern strictly bounded inside this Hero Section using ONLY Logo Blue #12B7D4 */}
        <HeroPattern />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Apple Style Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 mb-6 self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              Agency & Enterprise Operating System
            </span>
          </div>

          {/* Big Crisp Titles (Black & Blue with Shimmer Animation) */}
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl text-slate-950 tracking-tight leading-[1.04]">
            Digital Marketing
          </h1>
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer tracking-tight leading-[1.04] mt-1 sm:mt-2">
            End-to-End.
          </h1>

          {/* Punchy Tagline */}
          <p className="mt-5 text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Campaigns. Clients. Conversions. Cashflow.
          </p>

          {/* Reduced Body Text */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            The agency operating system uniting lead pipelines, content calendar, client sign-offs, and GST invoicing into one private workspace.
          </p>

          {/* Action Buttons (Cut-off point) */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/login"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Workspace</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/register-company"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
            >
              Register Agency
            </Link>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS STRIP (Clean White Background Below Hero) ── */}
      <section className="bg-white py-10 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left sm:text-center">
          <div className="p-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">5-in-1</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Replaces Tool Sprawl</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">Live Portal</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Zero Email Lag</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">100% Private</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Isolated Database</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">GST Ready</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Instant Invoicing</span>
          </div>
        </div>
      </section>

      {/* ── ZIG-ZAG SHOWCASE SECTIONS (No Row of Cards) ── */}
      <div className="py-14 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-20 sm:space-y-28">

        {/* ── ZIG 1: Text Left, Visual Right (About Section) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>About Software</span>
              <span>•</span>
              <span>Central Operating Hub</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Replace Tool Sprawl.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                One Unified Agency Hub.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Consolidate client management, content calendars, deliverable approvals, and GST billing into one synchronized agency workspace.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>End-to-End Deal & Client Lifecycle</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Real-Time Deliverable Status Tracking</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-black text-[#12B7D4] hover:text-[#0ea5c6] transition-colors"
              >
                <span>Read About Software</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-[#12B7D4]/50 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">RiseWithMedia OS</span>
                </div>
                <span className="text-[11px] font-bold text-[#12B7D4] bg-[#12B7D4]/15 px-2.5 py-0.5 rounded-full">
                  All Systems Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center">
                      <Users2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Lead Pipeline & Deals</p>
                      <p className="text-xs text-slate-400">Track qualified deals through stages</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#12B7D4]">Qualified</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center">
                      <Kanban size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Content Calendar & SMM</p>
                      <p className="text-xs text-slate-400">Posts staged for 4 clients</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">Scheduled</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Automated GST Invoicing</p>
                      <p className="text-xs text-slate-400">Tax invoices with payment status</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">GST Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ZAG 2: Visual Left, Text Right (Capabilities Section) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-200/90 relative overflow-hidden group hover:border-[#12B7D4]/60 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-xs font-semibold text-slate-500 ml-2">portal.risewithmedia.com</span>
                </div>
                <span className="text-[11px] font-bold text-[#12B7D4] bg-[#12B7D4]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12B7D4] animate-pulse" />
                  Client Connected
                </span>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#12B7D4] flex items-center justify-center text-white font-bold text-xs">
                      RM
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Q4 Launch Campaign Creative</p>
                      <p className="text-[11px] text-slate-500">Staged for Friday, 6:00 PM</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Needs Sign-off
                  </span>
                </div>

                <div className="h-28 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-500 gap-1.5 border border-dashed border-slate-300">
                  <Sparkles size={20} className="text-[#12B7D4]" />
                  <span className="text-xs font-semibold text-slate-700">Client Ad Creative Preview</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button className="py-2 rounded-lg bg-[#12B7D4] text-white font-bold text-xs shadow-xs hover:bg-[#0ea5c6] transition-colors flex items-center justify-center gap-1.5">
                    <Check size={14} strokeWidth={3} />
                    <span>Approve Post</span>
                  </button>
                  <button className="py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors">
                    Request Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>Platform Capabilities</span>
              <span>•</span>
              <span>Client Collaboration</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Live Client Portal.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Zero Email Back-and-Forth.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Clients review creative deliverables, approve social media posts, and download GST tax receipts instantly in their branded portal.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>1-Click Creative Sign-offs & Revision Notes</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Self-Service GST Tax Invoices & Reports</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/capabilities"
                className="inline-flex items-center gap-2 text-sm font-black text-[#12B7D4] hover:text-[#0ea5c6] transition-colors"
              >
                <span>Explore All Capabilities</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── ZIG 3: Text Left, Visual Right (Metrics Section) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>Scale & Reliability</span>
              <span>•</span>
              <span>Enterprise Privacy</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Dedicated Agency Space.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Bank-Grade Isolation.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Every agency gets its own isolated company slug URL, dedicated database isolation, and fine-grained role permissions.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Dedicated Slug: risewithmedia.com/your-agency</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>99.9% Uptime SLA & Automated Daily Backups</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/metrics"
                className="inline-flex items-center gap-2 text-sm font-black text-[#12B7D4] hover:text-[#0ea5c6] transition-colors"
              >
                <span>View Performance Metrics</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-[#12B7D4]/50 transition-all">
              <div className="bg-slate-800/80 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-slate-700/60 mb-5">
                <Lock size={14} className="text-[#12B7D4]" />
                <span className="text-xs font-mono text-slate-300">
                  risewithmedia.com/<span className="text-[#12B7D4] font-bold">your-agency</span>
                </span>
                <span className="ml-auto text-[10px] font-bold text-[#12B7D4] bg-[#12B7D4]/20 px-2 py-0.5 rounded">
                  SSL Encrypted
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Database Tenant Isolation</span>
                  <span className="text-xs font-bold text-[#12B7D4]">Isolated</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Role-Based Access Control</span>
                  <span className="text-xs font-bold text-[#12B7D4]">4 Roles</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Continuous Cloud Backups</span>
                  <span className="text-xs font-bold text-[#12B7D4]">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM CTA SECTION ── */}
      <section className="pb-16 sm:pb-24 max-w-5xl mx-auto px-4 sm:px-8 text-left sm:text-center">
        <div className="bg-slate-950 text-white rounded-2xl p-8 sm:p-14 relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[220px] bg-[#12B7D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Ready to Scale Your Agency?
            </h3>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Get started in seconds with your dedicated company portal and isolated workspace.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
              <Link
                to="/login"
                className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Workspace</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/register-company"
                className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm sm:text-base transition-all flex items-center justify-center"
              >
                Register Agency
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
