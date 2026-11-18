import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Server,
  Lock,
  Check,
  Clock,
  Sparkles,
  Smartphone
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';

const MetricsPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 mb-5 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              Fast & Reliable
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-950 tracking-tight leading-tight">
            Fast Speed.
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              Always Working.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Your agency workspace and client portal are always online, fast to load, and completely private for your team.
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

      {/* ── 4 SIMPLE STATS STRIP ── */}
      <section className="bg-white py-8 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-left sm:text-center">
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">99.9%</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Always Online</span>
          </div>
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">10x</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Faster Approvals</span>
          </div>
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">0</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">App Switching</span>
          </div>
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-950 block">24/7</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Client Access</span>
          </div>
        </div>
      </section>

      {/* ── ZIG-ZAG SECTIONS (NO CARDS, REDUCED TEXT, BLACK & BLUE ANIMATION) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-28 sm:space-y-36">

        {/* ── ZIG-ZAG 1: Data Isolation ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                01 / Complete Privacy
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Your Data Stays
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  100% Yours.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Every agency gets its own isolated company database. Other agencies can never see your clients, leads, or financial revenue.
              </p>
              <div className="pt-2 space-y-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Strict multi-company database separation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Daily automated backups ensure zero lost work</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Security Verification</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Encrypted & Isolated</p>
                  <p className="text-xs text-slate-500">Industry-standard safety protocols</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 2: Fast Mobile Performance ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Load Speed</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800">Page Load Time</span>
                  <span className="text-emerald-600">Under 0.4s</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Instant navigation on 4G, 5G and Wi-Fi</p>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                02 / Fast Everywhere
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Smooth on Any Phone,
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  Laptop or Tablet.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Whether you're in the office on your laptop or on the go with your phone, the app responds instantly.
              </p>
              <div className="pt-2 space-y-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Instant page changes with zero lag</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Responsive on mobile screens for staff on the move</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 text-left sm:text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight leading-tight">
            Reliable Infrastructure For Your Agency.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Focus on creative campaigns while we keep your agency operations smooth and dependable.
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

export default MetricsPage;
