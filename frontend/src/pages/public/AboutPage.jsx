import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Heart,
  Shield,
  Clock,
  Users,
  Sparkles,
  Zap,
  MessageSquare,
  Calendar,
  CreditCard,
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
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Plain Text Section Title (No Rounded Pill Effect) */}
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-3 sm:mb-4">
            The Agency Founder's Story
          </p>

          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.16]">
            Built by Agency Owners,
            <span className="text-[#12B7D4] block mt-1 sm:mt-2 pb-1">
              For Agency Owners.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            After running digital marketing campaigns, creative studios, and client retainers for over 6 years,
            we got tired of the chaos. We built the exact operating system we wished we had on Day 1.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/what-we-do"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
            >
              Explore 22 Capabilities
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. THE 3 PAIN POINTS THAT SPARKED RISEWITHMEDIA OS ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
            Why We Exist
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-1">
            The Three Agency Traps We Solved
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Every digital marketing founder hits the same wall when scaling past 5 clients. Here is what we eliminated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-rose-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-lg font-black text-slate-950">The WhatsApp Group Black Hole</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              When clients send briefs at 11 PM in group chats, tasks get lost, files expire, and nobody knows who is responsible for revisions.
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>✓ Solved with 1-Tap Client Review Links</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-lg font-black text-slate-950">The 6-App Subscription Tax</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Paying $300+/month across HubSpot, Trello, Clockify, and QuickBooks just to copy the exact same client phone number into 5 tools.
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>✓ Solved with One Shared Agency Cockpit</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-lg font-black text-slate-950">The Sunday Invoice Panic</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Spending weekends manually creating Word invoices, calculating 18% GST splits, and chasing client payments over WhatsApp.
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>✓ Solved with Automated Tax Receipts in 30s</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. THE 4-STEP AGENCY OPERATING RHYTHM (UNIQUE VISUAL WORKFLOW CANVAS) ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              
              {/* Left Column: Custom Agency Flow Visual Canvas (NO PHONE MOCKUP DUPLICATION) */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 space-y-4">
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
                          <p className="text-xs font-bold text-slate-900 leading-tight">Lead Inbound & WhatsApp</p>
                          <p className="text-[10px] text-slate-500 font-medium">Automatic stage tracking</p>
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
                          <p className="text-xs font-bold text-slate-900 leading-tight">Kanban & Content Staging</p>
                          <p className="text-[10px] text-slate-500 font-medium">15 Posts, 8 Reels quota</p>
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
                          <p className="text-[10px] text-slate-500 font-medium">Instant phone preview</p>
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
                          <p className="text-xs font-bold text-slate-900 leading-tight">18% GST Invoice & Payment</p>
                          <p className="text-[10px] text-slate-500 font-medium">Auto-generated PDF with QR</p>
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
                      Zero Bottlenecks Flow
                    </span>
                    <span className="text-slate-400">4 Stages Connected</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Vertically Aligned Step Cards */}
              <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
                  The Agency Rhythm
                </p>

                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                  How We Designed
                  <span className="text-[#12B7D4] block mt-1">
                    The Modern Agency Flow.
                  </span>
                </h2>

                <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                  Most generic tools treat marketing like software engineering. We designed RiseWithMedia OS strictly around how creative retainers actually operate.
                </p>

                <div className="space-y-2.5 pt-2 max-w-xl">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 1 — Capture Inbound Deal</span>
                    <h4 className="font-bold text-slate-900 text-sm">WhatsApp & Form Leads Synced</h4>
                    <p className="text-xs text-slate-500 font-medium">Log budget, phone number, and service requirements in one click.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 2 — Stage Creative Work</span>
                    <h4 className="font-bold text-slate-900 text-sm">Visual Calendar & SMM Quotas</h4>
                    <p className="text-xs text-slate-500 font-medium">Writers, video editors, and designers collaborate without noisy meetings.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 3 — 1-Tap Client Review</span>
                    <h4 className="font-bold text-slate-900 text-sm">Phone Previews with Verified Sign-off</h4>
                    <p className="text-xs text-slate-500 font-medium">Clients review Instagram posts and sign off in seconds with zero login friction.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-[#12B7D4] tracking-wider">Step 4 — Automated Billing</span>
                    <h4 className="font-bold text-slate-900 text-sm">18% GST Tax Receipt PDF Generated</h4>
                    <p className="text-xs text-slate-500 font-medium">Automatic sequential invoice numbering with agency UPI QR details.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. OUR THREE NON-NEGOTIABLE CORE VALUES ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
            Our Guiding Principles
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-1">
            Built for Real Humans, Not Bureaucrats
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#12B7D4] flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="font-black text-slate-950 text-base sm:text-lg">Retainer-First Mindset</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Agencies don't build one-off software tickets; they deliver monthly creative retainers. Everything in RiseWithMedia OS reflects recurring deliverables.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h3 className="font-black text-slate-950 text-base sm:text-lg">Radical Financial Privacy</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Your staff need to see their daily design tasks, but they don't need to see agency profits or founder salaries. Our Secondary PIN Gate guarantees full privacy.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="font-black text-slate-950 text-base sm:text-lg">Client Clarity Without Noise</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Clients don't want 400 notification emails. They want one clean portal where they can see live ad spend, approve graphics, and download invoices in 1 tap.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. FINAL ACTION BANNER ── */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden shadow-2xl text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#12B7D4] block">
                Experience the Difference
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Give your marketing team the operating system they deserve.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pt-1">
                Zero setup headaches. 14-day free trial. Unlimited team members included.
              </p>
            </div>
            <Link
              to="/register-company"
              className="px-8 py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;
