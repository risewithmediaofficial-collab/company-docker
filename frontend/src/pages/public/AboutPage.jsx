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
      ctaTitle="Join the Agencies Running on RiseWithMedia OS."
      ctaSubtitle="Get your agency workspace set up in 2 minutes. Free 14-day trial, no credit card required."
    >
      {/* ── 1. HERO HEADER ── */}
      <section className="relative overflow-hidden pt-14 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <ScrollReveal delay={0}>
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-3 sm:mb-4 animate-fade-up">
              The Agency Founder's Story
            </p>

            <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.15] animate-fade-up">
              Built by Agency Owners,
              <span className="block mt-1 sm:mt-2 pb-1">
                For <span className="marker-highlight text-[#12B7D4]">Agency Owners</span>.
              </span>
            </h1>

            {/* Reduced, clean Apple-style body text */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto animate-fade-up">
              After 6 years running creative retainers, we built the{' '}
              <span className="marker-highlight text-slate-900 font-bold">operating system</span> we needed on{' '}
              <span className="marker-highlight text-slate-900 font-bold">Day 1</span>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5 animate-fade-up">
              <Link
                to="/register-company"
                className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/25 hover:shadow-[#12B7D4]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/what-we-do"
                className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs hover:-translate-y-0.5"
              >
                Explore 22 Capabilities
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 2. THE 3 PAIN POINTS THAT SPARKED RISEWITHMEDIA OS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
              Why We Exist
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-1.5">
              The Three Agency Traps We <span className="marker-highlight">Eliminated</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 max-w-lg mx-auto">
              What breaks when an agency scales past 5 clients — and how we solved each trap.
            </p>
          </div>
        </ScrollReveal>

        {/* Multi-column grid with user's corner-badge cards (Minimal flat border, zero shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 01 */}
          <ScrollReveal delay={0} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Circular Corner Badge */}
              <div className="w-24 h-24 bg-rose-500 rounded-full absolute -right-5 -top-7 shadow-inner">
                <p className="absolute bottom-6 left-7 text-white font-extrabold text-2xl tracking-tight">01</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">The WhatsApp Black Hole</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Briefs and revisions lost in midnight group chats with zero team accountability.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <span>✓ Solved with 1-Tap Client Review Portals</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 02 */}
          <ScrollReveal delay={120} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Circular Corner Badge */}
              <div className="w-24 h-24 bg-amber-500 rounded-full absolute -right-5 -top-7 shadow-inner">
                <p className="absolute bottom-6 left-7 text-white font-extrabold text-2xl tracking-tight">02</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Layers size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">The 6-App Subscription Tax</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Paying $300+/mo across disjointed tools just to duplicate the same client details.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <span>✓ Solved with One Shared Agency Cockpit</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 03 */}
          <ScrollReveal delay={240} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Circular Corner Badge */}
              <div className="w-24 h-24 bg-[#12B7D4] rounded-full absolute -right-5 -top-7 shadow-inner">
                <p className="absolute bottom-6 left-7 text-white font-extrabold text-2xl tracking-tight">03</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#12B7D4] flex items-center justify-center">
                  <Receipt size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">The Sunday Invoice Panic</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Manual Word templates, GST math, and chasing late wire transfers over weekends.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#0ea5c6]">
                <span>✓ Solved with Automated Tax Receipts in 30s</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3. THE 4-STEP AGENCY OPERATING RHYTHM ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-slate-50/70">
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
                        <div className="w-8 h-8 rounded-xl bg-cyan-100 text-[#12B7D4] flex items-center justify-center font-black text-xs">
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
                          <p className="text-xs font-bold text-slate-900 leading-tight">GST Invoice & Payments</p>
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
                <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
                  The Agency Rhythm
                </p>

                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                  How We Designed
                  <span className="block mt-1">
                    The <span className="marker-highlight">Modern Agency Flow</span>.
                  </span>
                </h2>

                <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                  Built strictly around recurring agency retainers — eliminating back-and-forth noise.
                </p>

                <div className="space-y-2.5 pt-2 max-w-xl">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 1 — Inbound Leads</span>
                    <h4 className="font-bold text-slate-900 text-sm">WhatsApp & Form Leads Synced</h4>
                    <p className="text-xs text-slate-500 font-medium">Log budget, contact details, and client scope in 1 tap.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 2 — Content Staging</span>
                    <h4 className="font-bold text-slate-900 text-sm">Visual Calendar & Retainer Quotas</h4>
                    <p className="text-xs text-slate-500 font-medium">Assign video editors, copywriters, and designers seamlessly.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 3 — Client Approvals</span>
                    <h4 className="font-bold text-slate-900 text-sm">Instant Phone Previews</h4>
                    <p className="text-xs text-slate-500 font-medium">Clients review creatives and sign off with zero login barriers.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5 hover:border-slate-300 transition-all">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 4 — Automated Invoicing</span>
                    <h4 className="font-bold text-slate-900 text-sm">18% GST PDF Receipts</h4>
                    <p className="text-xs text-slate-500 font-medium">Instant compliant tax invoice generation with payment QR.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. OUR THREE NON-NEGOTIABLE CORE VALUES (IMAGE 1 TARGET) ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
              Our Guiding Principles
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-1.5">
              Built for <span className="marker-highlight">Real Humans</span>, Not Bureaucrats
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 max-w-lg mx-auto">
              Three core pillars engineered for agency productivity, privacy, and speed.
            </p>
          </div>
        </ScrollReveal>

        {/* Multi-column grid with user's card code structure (Minimal flat border, zero shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 01: Retainer-First Mindset */}
          <ScrollReveal delay={0} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Circular Corner Badge */}
              <div className="w-24 h-24 bg-[#12B7D4] rounded-full absolute -right-5 -top-7 shadow-inner">
                <p className="absolute bottom-6 left-7 text-white font-extrabold text-2xl tracking-tight">01</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#12B7D4] flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">Retainer-First Mindset</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Engineered strictly around recurring monthly deliverables — not one-off software tickets.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#0ea5c6]">
                <span>✓ Recurring Deliverables Architecture</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 02: Radical Financial Privacy */}
          <ScrollReveal delay={120} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Circular Corner Badge */}
              <div className="w-24 h-24 bg-emerald-500 rounded-full absolute -right-5 -top-7 shadow-inner">
                <p className="absolute bottom-6 left-7 text-white font-extrabold text-2xl tracking-tight">02</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">Radical Financial Privacy</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Staff execute daily tasks while secondary PIN gates keep agency profits completely confidential.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span>✓ Secondary PIN Gate Security</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 03: Client Clarity Without Noise */}
          <ScrollReveal delay={240} className="h-full">
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Circular Corner Badge */}
              <div className="w-24 h-24 bg-violet-500 rounded-full absolute -right-5 -top-7 shadow-inner">
                <p className="absolute bottom-6 left-7 text-white font-extrabold text-2xl tracking-tight">03</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-950 tracking-tight">Client Clarity Without Noise</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  One frictionless portal to review live ad metrics, approve creatives, and download tax invoices.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-violet-600">
                <span>✓ 1-Tap Client Transparency</span>
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
                <span className="text-xs font-black uppercase tracking-widest text-[#12B7D4] block">
                  Experience the Difference
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Give your team the <span className="marker-highlight">operating system</span> they deserve.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-1">
                  Zero setup headaches. 14-day free trial. Unlimited team members included.
                </p>
              </div>
              <Link
                to="/register-company"
                className="px-8 py-4 bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base border border-[#12B7D4] transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Get Started Free</span>
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

