import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Users2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Lock,
  Kanban,
  Check,
  CreditCard,
  FileText
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';

const AboutPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-10 sm:pt-16 pb-12 sm:pb-14 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 mb-5 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              About the Software
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-950 tracking-tight leading-tight">
            One Connected Hub.
            <span className="bg-gradient-to-r from-[#12B7D4] via-sky-400 to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              Replacing 5 Fragmented Tools.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            RiseWithMedia unites lead capture, creative production, client reviews, and GST billing into one synchronized agency operating system.
          </p>
        </div>
      </section>

      {/* ── ZIG-ZAG FEATURE SECTIONS ── */}
      <div className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-20 sm:space-y-28">

        {/* ── SECTION 1: ZIG (Text Left, Visual Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Content Left */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>01</span>
              <span>•</span>
              <span>Unified Agency Hub</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              One Connected Hub.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Zero Tool Sprawl.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Replace scattered emails, messy spreadsheets, and external billing with one central agency command center.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Lead Pipeline & Deal Stages Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Real-time Deliverable & Milestone Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Single Secure Login for Entire Agency Team</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Right */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-[#12B7D4]/50 transition-all">
              {/* Top macOS Style Dots */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">RiseWithMedia OS</span>
                </div>
                <span className="text-[11px] font-bold text-[#12B7D4] bg-[#12B7D4]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12B7D4] animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* 5-in-1 Modules Feed */}
              <div className="space-y-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center">
                      <Users2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Lead Pipeline & Deals</p>
                      <p className="text-xs text-slate-400">Track prospects through custom sales stages</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Active</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                      <Kanban size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Content Calendar & SMM</p>
                      <p className="text-xs text-slate-400">Posts staged for 4 clients</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-1 rounded">Scheduled</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Automated GST Invoicing</p>
                      <p className="text-xs text-slate-400">Tax invoices with payment status</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">GST Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── SECTION 2: ZAG (Visual Left, Text Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Visual Showcase Left */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-200/90 relative overflow-hidden group hover:border-[#12B7D4]/60 transition-all">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-xs font-semibold text-slate-500 ml-2">portal.risewithmedia.com</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Client Connected
                </span>
              </div>

              {/* Live Deliverable Post Mockup */}
              <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#12B7D4] to-sky-400 flex items-center justify-center text-white font-bold text-xs">
                      RM
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Instagram Reel Campaign</p>
                      <p className="text-[11px] text-slate-500">Staged for Friday, 6:00 PM</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Needs Sign-off
                  </span>
                </div>

                {/* Creative Preview Box */}
                <div className="h-28 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1.5 border border-dashed border-slate-300">
                  <Sparkles size={20} className="text-[#12B7D4]" />
                  <span className="text-xs font-semibold text-slate-600">Client Ad Creative Preview</span>
                </div>

                {/* Instant Action Buttons */}
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

          {/* Content Right */}
          <div className="lg:col-span-6 space-y-4 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold uppercase tracking-wider">
              <span>02</span>
              <span>•</span>
              <span>Zero Email Clutter</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Live Client Portal.
              <span className="bg-gradient-to-r from-[#12B7D4] via-emerald-400 to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                1-Click Approvals.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Clients review creative deliverables, approve social media posts, and download GST invoices in real time with zero email back-and-forth.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Real-Time Creative Approvals with Zero Delay</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Exact Social Mockups Preview Before Publishing</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>24/7 Self-Service GST Invoice & Receipt Access</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── SECTION 3: ZIG (Text Left, Visual Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Content Left */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <span>03</span>
              <span>•</span>
              <span>Enterprise Privacy</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Dedicated Agency Space.
              <span className="bg-gradient-to-r from-[#12B7D4] via-indigo-500 to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Bank-Grade Isolation.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Every agency gets its own isolated company slug URL, dedicated database isolation, and fine-grained role permissions for team and clients.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Unique Company Slug URL: /your-company</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Strict Role Permissions (Super Admin to Client)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Automated Daily Cloud Backups & TLS Encryption</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Right */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
              {/* URL Mockup */}
              <div className="bg-slate-800/80 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-slate-700/60 mb-5">
                <Lock size={14} className="text-emerald-400" />
                <span className="text-xs font-mono text-slate-300">
                  risewithmedia.com/<span className="text-[#12B7D4] font-bold">your-agency</span>
                </span>
                <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  SSL Encrypted
                </span>
              </div>

              {/* Tenant Isolation Matrix */}
              <div className="space-y-3">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-[#12B7D4]" />
                    <span className="text-sm font-bold text-white">Multi-Tenant Database Separation</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400">Isolated</span>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users2 size={18} className="text-sky-400" />
                    <span className="text-sm font-bold text-white">Role-Based Access Matrix</span>
                  </div>
                  <span className="text-xs font-bold text-sky-400">4 Roles</span>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-emerald-400" />
                    <span className="text-sm font-bold text-white">Continuous Disaster Recovery</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">99.9%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── LIFECYCLE FLOW ── */}
      <div className="py-14 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-6 sm:p-10">
          <div className="text-left sm:text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#12B7D4] block">
              The Agency Operating Rhythm
            </span>
            <h3 className="font-display font-black text-2xl sm:text-4xl text-slate-950 mt-1">
              End-to-End.
              <span className="bg-gradient-to-r from-[#12B7D4] via-sky-400 to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                Workflow Rhythm.
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#12B7D4]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 1</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">Lead Pipeline</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Track prospects through customizable deal stages to won clients.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 2</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">Deliverables & Sprints</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Designers and copywriters stage calendar posts and dev milestones.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 3</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">Client Sign-off</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Clients approve or request revisions instantly in their branded portal.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 4</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">GST Invoicing</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Automated tax invoices generated with payment verification and receipts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CALL TO ACTION ── */}
      <div className="pb-16 sm:pb-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-slate-950 text-white rounded-2xl p-8 sm:p-12 text-left sm:text-center relative overflow-hidden border border-slate-800">
          <h3 className="font-display font-black text-2xl sm:text-4xl text-white">
            Experience Modern Agency Management
          </h3>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
            Ready to upgrade your agency workflow? Launch your workspace or register today.
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
              to="/capabilities"
              className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm transition-all flex items-center justify-center"
            >
              View Capabilities →
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
