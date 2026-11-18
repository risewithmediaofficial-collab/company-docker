import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Zap,
  Server,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';

const MetricsPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-10 sm:pt-16 pb-12 sm:pb-14 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 mb-5 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              Scale & Reliability
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-950 tracking-tight leading-tight">
            Measurable Velocity. Enterprise Scale.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            RiseWithMedia gives your agency the technical infrastructure, high availability, and operational speed required to manage hundreds of campaigns simultaneously.
          </p>
        </div>
      </section>

      {/* ── MAIN BODY CONTENT (Clean White Background) ── */}
      <div className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto">

        {/* ── BIG KPI GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left sm:text-center shadow-xs">
            <span className="font-display font-black text-4xl sm:text-5xl text-slate-950 block">
              99.9%
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5 block">
              Uptime SLA
            </span>
            <p className="text-xs text-slate-500 font-medium mt-2 hidden sm:block">
              Redundant cloud infrastructure with automated database backups.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left sm:text-center shadow-xs">
            <span className="font-display font-black text-4xl sm:text-5xl text-slate-950 block">
              10x
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wider mt-1.5 block">
              Faster Approvals
            </span>
            <p className="text-xs text-slate-500 font-medium mt-2 hidden sm:block">
              Immediate client sign-off inside the portal with zero email delay.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left sm:text-center shadow-xs">
            <span className="font-display font-black text-4xl sm:text-5xl text-slate-950 block">
              0
            </span>
            <span className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-wider mt-1.5 block">
              Tool Sprawl
            </span>
            <p className="text-xs text-slate-500 font-medium mt-2 hidden sm:block">
              Replaces 5 separate subscriptions with 1 cohesive workspace.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left sm:text-center shadow-xs">
            <span className="font-display font-black text-4xl sm:text-5xl text-slate-950 block">
              24/7
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-600 uppercase tracking-wider mt-1.5 block">
              Client Portal Sync
            </span>
            <p className="text-xs text-slate-500 font-medium mt-2 hidden sm:block">
              Real-time deliverables review and invoice downloads anytime.
            </p>
          </div>
        </div>

        {/* ── ARCHITECTURE & SECURITY ── */}
        <div className="mb-16">
          <div className="text-left sm:text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#12B7D4] block">
              Enterprise Foundation
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 mt-1">
              Architecture & Security Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-bold">
                <Lock size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950">
                Multi-Tenant Isolation
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Every agency operates within its own dedicated company slug, with strict tenant isolation at the API and database levels. Team members and external clients only ever see the resources explicitly permitted to them.
              </p>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-bold">
                <Server size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950">
                Sub-100ms Ingestion
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Lead capture endpoints are built with low-latency event processing. When leads arrive through Meta Ads or WhatsApp webhooks, they are parsed, normalized, and staged into your CRM within milliseconds.
              </p>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-bold">
                <Shield size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Granular permission matrix spanning Super Admin, Company Admin, Project Managers, Team Members, and Client Portal Guests. Sensitive billing and payroll data remains completely protected.
              </p>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950">
                Automated Audit Trails & Backups
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Full immutable audit logs for all critical client actions, creative status modifications, and billing updates. Continuous snapshot backups ensure zero accidental data loss.
              </p>
            </div>
          </div>
        </div>

        {/* ── CALL TO ACTION ── */}
        <div className="bg-slate-950 text-white rounded-2xl p-8 sm:p-12 text-left sm:text-center relative overflow-hidden border border-slate-800">
          <h3 className="font-display font-black text-2xl sm:text-4xl text-white">
            Scale Your Agency Operations Today
          </h3>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
            Experience high performance, bank-grade reliability, and instant client sign-offs.
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

export default MetricsPage;
