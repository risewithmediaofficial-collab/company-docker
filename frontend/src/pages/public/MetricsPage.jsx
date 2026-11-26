import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Database,
  Clock,
  TrendingUp,
  Server,
  Activity,
  CheckCircle2,
  Cpu,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';
import StatsBanner from '../../components/public/StatsBanner';

export const MetricsPage = () => {
  return (
    <PublicLayout
      ctaTitle="A Reliable System You Can Count On Every Day."
      ctaSubtitle="Focus on growing your clients while we keep your team organized, fast, and stress-free."
    >
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Plain Text Section Title */}
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-3 sm:mb-4">
            Real Agency Results
          </p>

          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.16]">
            Real Time Saved.
            <span className="text-[#12B7D4] block mt-1 sm:mt-2 pb-1">
              Dependable Everyday System.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            See how much time agencies save every week, how much faster they get paid, and how smoothly our system runs every day.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/what-we-do"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
            >
              View All 22 Features
            </Link>
          </div>
        </div>
      </section>

      {/* 2. IMPACT STATS BANNER */}
      <StatsBanner
        title="Real Results from Real Agencies"
        subtitle="Actual numbers verified across active marketing agencies and creative studios."
      />

      {/* 3. FOUR MEASURABLE OUTCOMES */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4] mb-2">
            Real Impact
          </p>
          <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
            What Happens When Chaos Disappears
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-2.5 leading-relaxed max-w-xl mx-auto">
            Replacing messy WhatsApp groups and separate apps leads to immediate, clear improvements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 hover:border-[#12B7D4]/40 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-[#12B7D4] block">12+ Hrs</span>
            <h3 className="font-bold text-slate-900 text-sm">Saved Every Week</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Automatic client reminders, instant bills, and 1-minute daily updates replace hours of calling and checking.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 hover:border-emerald-400 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">99.8%</span>
            <h3 className="font-bold text-slate-900 text-sm">On-Time Work</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Visual calendars and monthly post counters make sure reels and graphics go live without missing deadlines.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 hover:border-indigo-400 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 block">3.2x</span>
            <h3 className="font-bold text-slate-900 text-sm">Faster Client Approvals</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Simple review links let busy clients approve Instagram graphics right on their phone in under 10 seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 hover:border-purple-400 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-purple-600 block">0%</span>
            <h3 className="font-bold text-slate-900 text-sm">Zero Lost Passwords</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Safe Password Vault stops dangerous password sharing in WhatsApp groups or messy paper notes.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE DATA ISOLATION & SPEED SHOWCASE */}
      <div className="space-y-0">
        {/* Showcase 01: Multi-Tenant Database Security */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-50/70">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Left: Text & Features */}
                <div className="lg:col-span-7 space-y-4 text-left">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4]">
                    Data Privacy
                  </p>

                  <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                    Your Agency Data
                    <span className="text-[#12B7D4] block mt-1">
                      Stays 100% Private.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Every agency gets their own completely separate private space. No other company or agency can ever see your clients, bills, or team details.
                  </p>

                  <div className="space-y-3 pt-2 max-w-xl">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Separate & Private Agency Spaces</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Your client agreements, tasks, and proposals are completely locked to your team only.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Bank-Grade Safe Connections</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Strong encryption keeps all client approvals, passwords, and billing information secure.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Automatic Daily Cloud Backups</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Automatic daily backups make sure your files, invoices, and client records are never lost.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Security Visual Card */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span className="text-xs font-black text-slate-900">Privacy Shield</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Fully Encrypted
                      </span>
                    </div>

                    {/* Isolated Tenant Blocks */}
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Database size={15} className="text-[#12B7D4]" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Agency A (Private Space)</p>
                            <p className="text-[10px] text-slate-500 font-mono">Locked to Agency Owner</p>
                          </div>
                        </div>
                        <Lock size={13} className="text-emerald-600" />
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Database size={15} className="text-[#12B7D4]" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Agency B (Private Space)</p>
                            <p className="text-[10px] text-slate-500 font-mono">Locked to Agency Owner</p>
                          </div>
                        </div>
                        <Lock size={13} className="text-emerald-600" />
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Database size={15} className="text-[#12B7D4]" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Agency C (Private Space)</p>
                            <p className="text-[10px] text-slate-500 font-mono">Locked to Agency Owner</p>
                          </div>
                        </div>
                        <Lock size={13} className="text-emerald-600" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={13} />
                        100% Private & Isolated
                      </span>
                      <span className="text-slate-400">Enterprise Safe</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Showcase 02: Performance & Speed */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Left: Speed Visual Card */}
                <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                  <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#12B7D4]" />
                        <span className="text-xs font-black text-slate-900">System Speed & Health</span>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        99.98% Uptime
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-left">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Response Time</span>
                        <p className="text-xl font-black text-slate-950">&lt; 85ms</p>
                        <p className="text-[10px] text-emerald-600 font-bold">● Fast Cloud Speed</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-left">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Live Updates</span>
                        <p className="text-xl font-black text-slate-950">Instant</p>
                        <p className="text-[10px] text-emerald-600 font-bold">● Zero Lag</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-left">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Mobile App Shortcut</span>
                        <span className="text-emerald-600">Active</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#12B7D4] h-full w-full" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Add to your iPhone or Android home screen with 1 tap</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={13} />
                        Always Protected
                      </span>
                      <span className="text-slate-400">Live System Monitor</span>
                    </div>
                  </div>
                </div>

                {/* Right: Text & Features */}
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4]">
                    Speed & Reliability
                  </p>

                  <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                    Opens in Less Than a Second.
                    <span className="text-[#12B7D4] block mt-1">
                      Smooth on Any Smartphone.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Built on high-speed cloud infrastructure. Whether your team is in the office or clients are checking proposals on 4G mobile, the portal responds in milliseconds.
                  </p>

                  <div className="space-y-3 pt-2 max-w-xl">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Works Like a Mobile App</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Add directly to your iPhone or Android home screen without needing app store downloads.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Instant Live Updates</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">When someone finishes a task, marks attendance, or pays a bill, it updates everywhere immediately.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">No Annoying Maintenance Breaks</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">System improvements happen quietly in the background without disturbing your daily work.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>

      {/* 5. FINAL ACTION BANNER */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4] block">
                  Simple Agency Platform
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Scale your agency with a system built to make daily life easy.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-1">
                  Simple registration. Choose your plan inside and invite as many team members as you want.
                </p>
              </div>
              <Link
                to="/register"
                className="px-8 py-4 bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base border border-[#12B7D4] transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
};

export default MetricsPage;
