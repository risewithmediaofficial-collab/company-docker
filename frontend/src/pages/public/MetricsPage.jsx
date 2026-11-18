import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
          {/* Plain Text Title (NO ROUNDED PILL) */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase mb-4">
            Fast & Reliable Infrastructure
          </p>

          <h1 className="font-extrabold text-4xl sm:text-6xl lg:text-[68px] text-slate-950 tracking-tight leading-[1.08]">
            Fast Speed.
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1 sm:mt-2">
              Always Working.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Your agency workspace and client portal are always online, fast to load, and completely private for your team.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
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
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">99.9%</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Always Online</span>
          </div>
          <div>
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">10x</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Faster Approvals</span>
          </div>
          <div>
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">0</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">App Switching</span>
          </div>
          <div>
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">24/7</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1 block">Client Access</span>
          </div>
        </div>
      </section>

      {/* ── CLEAN ZIG-ZAG SECTIONS (NO CARDS, PLAIN TEXT LABELS, HUMAN-MADE CSS) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* ── ZIG-ZAG 01: Complete Privacy ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            <div className="lg:col-span-5 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                01 — Complete Privacy
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Your Data Stays
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  100% Yours.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Every agency gets its own isolated company database. Other agencies can never see your clients, leads, or financial revenue.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Multi-Tenant Separation</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Dedicated company database partition ensures complete confidentiality for every agency.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Automatic Backups</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Daily encrypted backups prevent data loss or project file corruption.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">SSL Encrypted Traffic</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">End-to-end HTTPS encryption protects client proposal details and invoicing files.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Strict Team Access</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Internal staff only view data matching their designated user permission role.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 02: Fast Everywhere (Alternating) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Under 0.4s Page Loads</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Lightweight frontend bundles load instantly on laptops, tablets, and 4G phones.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Mobile-Optimized Portal</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Clean responsive views allow clients to approve creative work anywhere on the move.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Real-Time Sync</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">When a designer updates a deliverable, the client portal reflects it immediately.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Zero App Lag</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Fast navigation designed for daily high-volume agency operations without slowdowns.</p>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                02 — Fast Everywhere
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Smooth on Any Phone,
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Laptop or Tablet.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Whether you're in the office on your laptop or on the go with your phone, the app responds instantly.
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 text-left sm:text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase">
            Start Running Your Agency Smarter
          </p>
          <h2 className="font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Reliable Infrastructure For{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#38bdf8] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer">
              Your Agency.
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Focus on creative campaigns while we keep your agency operations smooth and dependable.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
