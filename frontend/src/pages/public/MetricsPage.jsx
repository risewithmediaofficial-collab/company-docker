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
  Layers,
  Check
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
            Measurable Velocity.
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              Enterprise Scale.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            High availability, automated database redundancy, and sub-100ms API processing built to scale your marketing team effortlessly.
          </p>
        </div>
      </section>

      {/* ── KPI HIGHLIGHTS STRIP ── */}
      <section className="bg-white py-10 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left sm:text-center">
          <div className="p-3">
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">99.9%</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Uptime SLA</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">10x</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Faster Approvals</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">0</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Tool Sprawl</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">24/7</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Client Sync</span>
          </div>
        </div>
      </section>

      {/* ── ZIG-ZAG METRICS SECTIONS ── */}
      <div className="py-14 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-20 sm:space-y-28">

        {/* ── ZIG 1: Text Left, Visual Right (Performance & Uptime) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>01</span>
              <span>•</span>
              <span>High Availability</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Enterprise Uptime.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Zero Unscheduled Outages.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Redundant cloud infrastructure with automated database failover, continuous health monitoring, and sub-100ms API response times.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>99.9% Production Uptime SLA Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Sub-100ms Query Ingestion & Response Speed</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-[#12B7D4]/50 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <span className="text-xs font-mono text-slate-400">Live Infrastructure Health</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  All Systems Operational
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">API Gateway Response</span>
                  <span className="text-emerald-400 font-mono font-bold">38ms</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Database Cluster Uptime</span>
                  <span className="text-emerald-400 font-mono font-bold">99.98%</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Snapshot Backups</span>
                  <span className="text-[#12B7D4] font-mono font-bold">Hourly Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ZAG 2: Visual Left, Text Right (Security & Isolation) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-[#12B7D4]/50 transition-all">
              <div className="bg-slate-800/80 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-slate-700/60 mb-5">
                <Lock size={14} className="text-[#12B7D4]" />
                <span className="text-xs font-mono text-slate-300">
                  risewithmedia.com/<span className="text-[#12B7D4] font-bold">your-agency</span>
                </span>
                <span className="ml-auto text-[10px] font-bold text-[#12B7D4] bg-[#12B7D4]/20 px-2 py-0.5 rounded">
                  Isolated
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-white font-bold">Multi-Tenant Database Partitioning</span>
                  <span className="text-[#12B7D4] font-bold">Enforced</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-white font-bold">Client Portal Guest Separation</span>
                  <span className="text-[#12B7D4] font-bold">Encrypted</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-white font-bold">Audit Log Traceability</span>
                  <span className="text-[#12B7D4] font-bold">Immutable</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/20 text-[#12B7D4] text-xs font-bold uppercase tracking-wider">
              <span>02</span>
              <span>•</span>
              <span>Security & Privacy</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-[1.1]">
              Strict Multi-Tenancy.
              <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                Zero Shared Data.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Every agency operates in its own dedicated company space with complete data isolation, role-based access control, and bank-grade encryption.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Isolated Tenant Database & Custom Company URL</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Role Permissions (Super Admin, Manager, Team, Client)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── CALL TO ACTION ── */}
      <div className="pb-16 sm:pb-24 px-4 sm:px-8 max-w-5xl mx-auto">
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
