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
  Globe
} from 'lucide-react';
import PublicLayout from '../components/public/PublicLayout';
import FeatureCard from '../components/public/FeatureCard';
import HeroPattern from '../components/public/HeroPattern';

const Landing = () => {
  return (
    <PublicLayout>
      {/* ── HERO SECTION (Pattern cut off right below action buttons) ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-10 sm:pt-16 pb-12 sm:pb-14 px-4 sm:px-8 text-left sm:text-center">
        {/* Pattern strictly bounded inside this Hero Section */}
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

          {/* Big Crisp Titles (Black & Blue with shimmer) */}
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl text-slate-950 tracking-tight leading-[1.04]">
            Digital Marketing
          </h1>
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-[#12B7D4] via-sky-400 to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer tracking-tight leading-[1.04] mt-1 sm:mt-2">
            End-to-End.
          </h1>

          {/* Punchy Tagline */}
          <p className="mt-5 text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Campaigns. Clients. Conversions. Cashflow.
          </p>

          {/* Reduced Body Text */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            The agency operating system uniting lead ingestion, creative workflows, client sign-offs, and GST invoicing into one private workspace.
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
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-0.5 block">Zero Email Lag</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">100% Private</span>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-0.5 block">Isolated Database</span>
          </div>
          <div className="p-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">GST Ready</span>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-0.5 block">Instant Invoicing</span>
          </div>
        </div>
      </section>

      {/* ── QUICK OVERVIEW CARDS (Linking to dedicated pages) ── */}
      <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-left sm:text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#12B7D4] block mb-1">
            Platform Overview
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
            Explore Dedicated
            <span className="bg-gradient-to-r from-[#12B7D4] via-sky-400 to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
              Platform Pages.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            Dive into details across our dedicated platform pages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FeatureCard
            title="About Software"
            subText="Why agencies replace 5 fragmented tools with our unified platform."
            icon={Sparkles}
            badge="Overview"
            linkTo="/about"
          />
          <FeatureCard
            title="Core Capabilities"
            subText="Meta inbound, SMM calendar, live client portal, and GST invoicing."
            icon={Layers}
            badge="6 Modules"
            linkTo="/capabilities"
          />
          <FeatureCard
            title="Scale & Metrics"
            subText="99.9% uptime, 10x faster approvals, and enterprise multi-tenancy."
            icon={BarChart3}
            badge="Reliability"
            linkTo="/metrics"
          />
        </div>
      </section>

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
