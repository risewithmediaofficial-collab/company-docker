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
  Sparkles
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import FeatureCard from '../../components/public/FeatureCard';
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
            One Hub Replacing 5 Fragmented Tools.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            RiseWithMedia is an end-to-end agency operating system. We eliminate scattered WhatsApp chats, lost Dropbox links, and disconnected billing by uniting your entire agency workflow into one private, high-speed workspace.
          </p>
        </div>
      </section>

      {/* ── MAIN BODY CONTENT (Clean White Background) ── */}
      <div className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto">

        {/* ── 3 CORE PILLARS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-3 shadow-xs hover:border-[#12B7D4]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-950">
                No More Tool Sprawl
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Replace messy WhatsApp chats, scattered Excel spreadsheets, and external accounting tools with one central dashboard for all team members.
              </p>
            </div>
            <span className="inline-block text-xs font-bold text-[#12B7D4] bg-[#12B7D4]/10 px-3 py-1 rounded-md self-start">
              5-in-1 Platform
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-3 shadow-xs hover:border-[#12B7D4]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-950">
                Live Client Portal
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Clients review creative deliverables, approve social media posts, and download GST invoices in real time with zero email back-and-forth.
              </p>
            </div>
            <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md self-start">
              Zero Email Clutter
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-3 shadow-xs hover:border-[#12B7D4]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-950">
                100% Private Workspace
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Every agency gets its own isolated company slug URL, dedicated database isolation, and fine-grained role permissions for team and clients.
              </p>
            </div>
            <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md self-start">
              Enterprise Secure
            </span>
          </div>
        </div>

        {/* ── LIFECYCLE FLOW ── */}
        <div className="mb-16 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 sm:p-8">
          <div className="text-left sm:text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-black uppercase tracking-wider text-[#12B7D4] block">
              The Agency Operating Rhythm
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-950 mt-1">
              End-to-End Workflow Execution
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-[#12B7D4]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 1</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">Inbound Leads</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Meta Ads and WhatsApp webhooks capture leads straight into CRM stages.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 2</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">Deliverables & Sprints</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Designers and copywriters stage calendar posts and dev milestones.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 3</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">Client Sign-off</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Clients approve or request revisions instantly in their branded portal.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step 4</span>
              </div>
              <h4 className="font-bold text-slate-950 text-base">GST Invoicing</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Automated tax invoices generated with payment verification and receipts.
              </p>
            </div>
          </div>
        </div>

        {/* ── COMPARISON TABLE ── */}
        <div className="mb-16">
          <div className="text-left sm:text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#12B7D4] block">
              Direct Comparison
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-950 mt-1">
              Why Agencies Switch To RiseWithMedia
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 p-4 text-sm font-black text-slate-900">
              <div className="text-rose-600 flex items-center gap-2">
                <XCircle size={18} />
                <span>The Traditional Fragmented Way</span>
              </div>
              <div className="text-[#12B7D4] flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>The RiseWithMedia Platform</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="grid grid-cols-2 p-4 gap-4">
                <span className="text-slate-600">5+ separate software subscriptions and logins</span>
                <span className="text-slate-900 font-semibold">1 unified agency workspace under your company slug</span>
              </div>
              <div className="grid grid-cols-2 p-4 gap-4">
                <span className="text-slate-600">Lost feedback in WhatsApp messages and email threads</span>
                <span className="text-slate-900 font-semibold">Live client portal with 1-click approvals & revision notes</span>
              </div>
              <div className="grid grid-cols-2 p-4 gap-4">
                <span className="text-slate-600">Manual Excel billing, missing GST numbers, delayed payments</span>
                <span className="text-slate-900 font-semibold">Automated GST tax invoicing with instant downloadable PDFs</span>
              </div>
              <div className="grid grid-cols-2 p-4 gap-4">
                <span className="text-slate-600">No verifiable staff attendance tracking</span>
                <span className="text-slate-900 font-semibold">GPS geofenced mobile selfie check-ins for office & field staff</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CALL TO ACTION ── */}
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
