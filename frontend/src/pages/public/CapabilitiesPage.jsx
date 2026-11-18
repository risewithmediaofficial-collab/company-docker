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
  Zap
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import FeatureCard from '../../components/public/FeatureCard';
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
            <span className="bg-gradient-to-r from-[#12B7D4] via-sky-400 to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              For Digital Agencies.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Native tools designed to streamline client acquisition, creative production, and revenue management with zero external software subscriptions.
          </p>
        </div>
      </section>

      {/* ── MAIN BODY CONTENT (Clean White Background) ── */}
      <div className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto">

        {/* ── 6 CORE MODULES (Card design with rotated wave accent) ── */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 mb-7 gap-2">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
                6 Integrated Modules
              </h2>
              <p className="text-sm text-slate-600 font-medium mt-0.5">
                Native tools interconnected without external Zapier or third-party webhooks.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 self-start sm:self-auto">
              Ready Out-of-the-Box
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <FeatureCard
              title="Meta & WhatsApp Inbound"
              subText="Direct webhooks auto-capture leads into qualified stages."
              icon={Users2}
              badge="Instant Sync"
              linkTo="/login"
              waveFill="#12B7D425"
            />
            <FeatureCard
              title="Content Calendar & SMM"
              subText="Multi-platform scheduling, creative staging, and approvals."
              icon={Kanban}
              badge="One-Click Review"
              linkTo="/login"
              waveFill="#0ea5e925"
            />
            <FeatureCard
              title="Live Client Portal"
              subText="Branded client view with zero-friction approval and asset access."
              icon={Globe}
              badge="Zero Email Lag"
              linkTo="/login"
              waveFill="#10b98125"
            />
            <FeatureCard
              title="Automated GST Invoicing"
              subText="Tax invoices with automated ledger and payment tracking."
              icon={CreditCard}
              badge="GST Compliant"
              linkTo="/login"
              waveFill="#f59e0b25"
            />
            <FeatureCard
              title="GPS Geofenced Attendance"
              subText="Mobile selfie check-in with GPS verification for agency staff."
              icon={MapPin}
              badge="Verified Staff"
              linkTo="/login"
              waveFill="#6366f125"
            />
            <FeatureCard
              title="Multi-Tenant Architecture"
              subText="Isolated agency workspace with custom slug URLs and role controls."
              icon={Building2}
              badge="Bank-Grade Isolation"
              linkTo="/login"
              waveFill="#8b5cf625"
            />
          </div>
        </div>

        {/* ── DEEP DIVE HIGHLIGHTS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-bold">
              <Zap size={22} />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-950">
              High-Velocity Client Sign-offs
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              No more digging through buried email threads or lost WhatsApp attachments. Clients receive an encrypted link to their branded portal where creatives are displayed in exact social formats with 1-click approve or comment buttons.
            </p>
            <ul className="space-y-1.5 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#12B7D4]" />
                Preview exact Instagram & Facebook mockups
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#12B7D4]" />
                Revision notes tied directly to specific creatives
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#12B7D4]" />
                Instant client download of final approved high-res files
              </li>
            </ul>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-bold">
              <Sparkles size={22} />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-950">
              Automated Billing & Revenue Ops
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Connect deliverables directly with cashflow. Once milestones or monthly retainers are reached, generate GST tax invoices with client GSTIN, reverse charge indicators, and download professional PDFs with payment QR codes.
            </p>
            <ul className="space-y-1.5 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#12B7D4]" />
                Automated SGST, CGST, and IGST tax calculation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#12B7D4]" />
                Payment status tracking (Pending, Paid, Overdue)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#12B7D4]" />
                Clients can view and download past tax receipts anytime
              </li>
            </ul>
          </div>
        </div>

        {/* ── CALL TO ACTION ── */}
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
