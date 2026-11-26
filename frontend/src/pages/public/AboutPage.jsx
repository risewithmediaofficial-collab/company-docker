import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Layers,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';

export const AboutPage = () => {
  return (
    <PublicLayout
      ctaTitle="Join the Agencies Running on AgencyUpscale."
      ctaSubtitle="Get your agency workspace set up in 2 minutes. Free 14-day trial, no credit card required."
    >
      {/* ── 1. HERO HEADER ── */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <ScrollReveal delay={0}>
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#07c8f9] uppercase mb-3 sm:mb-4 animate-fade-up">
              Our Story
            </p>

            <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.15] animate-fade-up">
              Built by Agency Owners,
              <span className="block mt-1 sm:mt-2 pb-1">
                For <span className="marker-highlight text-[#07c8f9]">Agency Owners</span>.
              </span>
            </h1>

            {/* Reduced, clean Apple-style body text */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto animate-fade-up">
              After 6 years of running a digital marketing agency, we built the{' '}
              <span className="marker-highlight text-slate-900 font-bold">simple system</span> we wished we had on{' '}
              <span className="marker-highlight text-slate-900 font-bold">Day 1</span>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5 animate-fade-up">
              <Link
                to="/register"
                className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#07c8f9] hover:bg-[#06b4e0] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#07c8f9]/25 hover:shadow-[#07c8f9]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/what-we-do"
                className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs hover:-translate-y-0.5"
              >
                Explore All 22 Features
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 2. THE 3 PAIN POINTS THAT SPARKED AGENCYUPSCALE ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#07c8f9] mb-2">
              Why We Built This
            </p>
            <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
              The Three Common Agency Headaches We <span className="marker-highlight">Fixed</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-2.5 leading-relaxed max-w-xl mx-auto">
              What breaks when an agency grows past 5 clients — and how we make everyday work simple.
            </p>
          </div>
        </ScrollReveal>

        {/* Multi-column grid with user's corner-badge cards (Minimal flat border, zero shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 01 */}
          <ScrollReveal delay={0} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">The WhatsApp Chaos</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Client requests and corrections get lost in late-night WhatsApp groups with no clear ownership.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <span>✓ Solved with Simple 1-Tap Client Review Links</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 02 */}
          <ScrollReveal delay={120} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Layers size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">Paying for 6 Different Apps</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Spending ₹25,000+ every month on separate apps just to type the same client details again and again.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <span>✓ Solved with One Simple Shared Workspace</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 03 */}
          <ScrollReveal delay={240} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#07c8f9] flex items-center justify-center">
                  <Receipt size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">The Weekend Invoicing Stress</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Typing manual bills in Word, doing tax math by hand, and chasing late bank transfers on weekends.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#06b4e0]">
                <span>✓ Solved with Instant Invoices & Receipts in 30 Seconds</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3. THE 4-STEP AGENCY OPERATING RHYTHM ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-50/70">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              
              {/* Left Column: Visual Canvas */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 overflow-hidden p-6 space-y-4">
                  {/* Card Header with Mac Dots */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">Agency Operating Flow</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Flow Stages */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                          01
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Inbound Lead & WhatsApp</p>
                          <p className="text-[10px] text-slate-500 font-medium">Automatic pipeline capture</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Synced
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-100 text-[#07c8f9] flex items-center justify-center font-black text-xs">
                          02
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Content Staging & Quotas</p>
                          <p className="text-[10px] text-slate-500 font-medium">Monthly post & reel tracking</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        On Track
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                          03
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">1-Tap Client Review Link</p>
                          <p className="text-[10px] text-slate-500 font-medium">Frictionless phone approvals</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        Approved
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs">
                          04
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Invoicing & Payments</p>
                          <p className="text-[10px] text-slate-500 font-medium">Auto PDF receipt with QR</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Paid
                      </span>
                    </div>
                  </div>

                  {/* Flow Footer Status */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 size={13} />
                      Zero Bottlenecks
                    </span>
                    <span className="text-slate-400">4 Stages Connected</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Minimalist Steps */}
              <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#07c8f9]">
                  The Daily Agency Flow
                </p>

                <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                  How Work Moves Forward
                  <span className="block mt-1">
                    Naturally <span className="marker-highlight">Every Day</span>.
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                  Built specifically for marketing agencies with monthly clients — removing all the confusing back-and-forth.
                </p>

                <div className="space-y-2.5 pt-2 max-w-xl">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#07c8f9] tracking-wider">Step 1 — New Leads</span>
                    <h4 className="font-bold text-slate-900 text-sm">WhatsApp & Website Leads Saved</h4>
                    <p className="text-xs text-slate-500 font-medium">Record budget, phone numbers, and client goals in 1 tap.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#07c8f9] tracking-wider">Step 2 — Monthly Planning</span>
                    <h4 className="font-bold text-slate-900 text-sm">Easy Calendar & Monthly Targets</h4>
                    <p className="text-xs text-slate-500 font-medium">Assign video editors, copywriters, and designers in seconds.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#07c8f9] tracking-wider">Step 3 — Client Approvals</span>
                    <h4 className="font-bold text-slate-900 text-sm">Quick Phone Previews</h4>
                    <p className="text-xs text-slate-500 font-medium">Clients review graphics and videos on their phone and approve without logging in.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#07c8f9] tracking-wider">Step 4 — Getting Paid</span>
                    <h4 className="font-bold text-slate-900 text-sm">Instant PDF Invoices</h4>
                    <p className="text-xs text-slate-500 font-medium">Create clean PDF invoices with UPI payment QR codes in 30 seconds.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. OUR THREE NON-NEGOTIABLE CORE VALUES (IMAGE 1 TARGET) ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#07c8f9] mb-2">
              Our Guiding Principles
            </p>
            <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
              Built for <span className="marker-highlight">Real Humans</span>, Plain and Simple
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-2.5 leading-relaxed max-w-xl mx-auto">
              Three simple rules we follow to keep your agency fast, organized, and private.
            </p>
          </div>
        </ScrollReveal>

        {/* Multi-column grid with user's card code structure (Minimal flat border, zero shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 01: Retainer-First Mindset */}
          <ScrollReveal delay={0} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#07c8f9] flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">Made for Monthly Clients</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Designed specifically for monthly retainers (like 15 posts and 8 reels) — not confusing tech tickets.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#06b4e0]">
                <span>✓ Monthly Target Tracking</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 02: Radical Financial Privacy */}
          <ScrollReveal delay={120} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">Total Money Privacy</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Your team works on daily tasks, but your profits, salaries, and bank numbers are locked with a secret PIN.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span>✓ Secret PIN Protection</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 03: Client Clarity Without Noise */}
          <ScrollReveal delay={240} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">Clear & Simple for Clients</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  One simple link for clients to see ad results, approve posts, and download past bills.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-violet-600">
                <span>✓ 1-Tap Client Approvals</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5. FINAL ACTION BANNER (Clean White Fill, Seamless Borderless) ── */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#07c8f9] block">
                  Experience the Difference
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Give your team the <span className="marker-highlight">simple workspace</span> they deserve.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-1">
                  Quick registration. Choose your plan after signing in and invite your entire team.
                </p>
              </div>
              <Link
                to="/register"
                className="px-8 py-4 bg-[#07c8f9] hover:bg-[#06b4e0] text-white font-bold text-sm sm:text-base border border-[#07c8f9] transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Register</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;

