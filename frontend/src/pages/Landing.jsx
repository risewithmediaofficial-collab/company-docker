import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Zap, Layers, Calendar, CreditCard } from 'lucide-react';
import PublicLayout from '../components/public/PublicLayout';
import HeroPattern from '../components/public/HeroPattern';
import ScrollReveal from '../components/public/ScrollReveal';
import SectionShowcase from '../components/public/SectionShowcase';
import StatsBanner from '../components/public/StatsBanner';
import SoftwareComparison from '../components/public/SoftwareComparison';
import {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  YouTubeIcon,
  XIcon,
} from '../components/ui/SocialIcons';

export const Landing = () => {
  return (
    <PublicLayout>
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-14 sm:pt-20 pb-14 sm:pb-20 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Plain Text Section Title (No Rounded Pill Effect) */}
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-3 sm:mb-4">
            All-in-One Workspace for Digital Agencies
          </p>

          {/* Main Headline */}
          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[62px] text-slate-950 tracking-tight leading-[1.15]">
            Manage Your Entire Agency.
            <span className="text-[#12B7D4] block mt-1 sm:mt-2 pb-1">
              All in One Easy Place.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            No more switching between messy spreadsheets, lost WhatsApp messages, and confusing tools.
            Manage new leads, client tasks, social media calendars, and bills — all in one simple screen.
          </p>

          {/* CTA Buttons */}
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
              Login to Account
            </Link>
          </div>

          {/* Trust Micro-copy */}
          <div className="mt-4 flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">✓</span> 14-Day Free Trial
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">✓</span> No Credit Card Required
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">✓</span> Instant Setup in 2 Mins
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. STATS BANNER ── */}
      <StatsBanner />

      {/* ── 3. MODERN SOFTWARE COMPARISON ("WHAT THEY HAVE" VS "WHAT WE DO") ── */}
      <SoftwareComparison />

      {/* ── 4. THREE CORE PILLARS SHOWCASE (CLEAN ODOO-STYLE ALIGNMENT, ZERO DUPLICATION) ── */}
      <div className="space-y-0">

        {/* ── PILLAR 1: Complete Client & Deal Lifecycle (White BG) ── */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Left: Text & Features (Neatly Constrained with Card Bullets) */}
                <div className="lg:col-span-7 space-y-4 text-left">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4]">
                    Getting & Managing Clients
                  </p>

                  <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                    Never Miss a Lead.
                    <span className="text-[#12B7D4] block mt-1">
                      Win Clients Faster.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Never lose client inquiries in messy WhatsApp chats. Track deal amounts, send neat proposals in minutes, and store client logins safely.
                  </p>

                  {/* Clean Feature Mini-Cards (Perfect Text Alignment) */}
                  <div className="space-y-3 pt-2 max-w-xl">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Simple Lead Board</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Track every deal step-by-step: New Lead → Contacted → First Call → Proposal Sent → Deal Won.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">1-Click Client & Project Setup</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">When you win a deal, one click instantly creates the client profile and sets up their project tasks.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Safe Password Vault</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Store client website logins, Instagram passwords, and keys safely so only the right team members can see them.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Visual Showcase */}
                <div className="lg:col-span-5 flex justify-center">
                  <SectionShowcase type="leads" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── PILLAR 2: Creative Execution & Content Calendar (Subtle Slate Tint BG, Borderless) ── */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-50/70">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Left: Visual Showcase (Alternating Side) */}
                <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                  <SectionShowcase type="calendar" />
                </div>

                {/* Right: Text & Features */}
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4]">
                    Content & Social Media
                  </p>

                  <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                    Simple Content Calendar.
                    <span className="text-[#12B7D4] block mt-1">
                      1-Tap Approvals on Mobile.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Keep your writers, graphic designers, and video editors on track without endless meetings. Clients view posts right on their phone and approve in 1 tap.
                  </p>

                  {/* Clean Feature Mini-Cards */}
                  <div className="space-y-3 pt-2 max-w-xl">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">All Social Media in One Grid</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Plan and schedule reels, carousels, and stories across Instagram, LinkedIn, Facebook, and X.</p>
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800">
                            <InstagramIcon size={13} />
                            <span>Instagram</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800">
                            <FacebookIcon size={13} />
                            <span>Facebook</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800">
                            <LinkedInIcon size={13} />
                            <span>LinkedIn</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800">
                            <YouTubeIcon size={13} />
                            <span>YouTube</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800">
                            <XIcon size={13} />
                            <span>𝕏</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Monthly Post & Video Targets</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Track targets for each client (e.g. 15 Posts, 8 Reels, 4 Carousels) so you never miss a monthly promise.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Quick Mobile Approval Links</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Clients check designs and videos on their phone with no login required, approving in seconds.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── PILLAR 3: Billing, Finance & Team Operations (White BG) ── */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Left: Text & Features */}
                <div className="lg:col-span-7 space-y-4 text-left">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4]">
                    Money, Billing & Team
                  </p>

                  <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                    Send Invoices in 30 Seconds.
                    <span className="text-[#12B7D4] block mt-1">
                      See Your Real Profit & Loss.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Stop doing manual math on spreadsheets. Calculate taxes automatically, track payments, run team payroll, and check staff attendance in one place.
                  </p>

                  {/* Clean Feature Mini-Cards */}
                  <div className="space-y-3 pt-2 max-w-xl">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Instant Invoices & PDF Receipts</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Automatic invoice numbers, easy tax calculations, UPI QR codes for fast payments, and 1-click printable PDFs.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Live Income & Expense Tracker</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">See your total earnings, monthly tool bills, and net profit — locked with a secret PIN so only you can see it.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">GPS Office Attendance</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Staff mark attendance on their phone when they reach the office, with a simple switch for work-from-home days.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Visual Showcase */}
                <div className="lg:col-span-5 flex justify-center">
                  <SectionShowcase type="billing" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>

      {/* ── 5. FINAL ACTION BANNER (Clean White Fill, Seamless Borderless) ── */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4] block">
                  Ready to Upgrade Your Agency?
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Stop juggling 6 different tools.
                  <span className="text-[#12B7D4] block mt-1">Run your agency smoothly and without stress.</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-1">
                  Set up your agency workspace in under 2 minutes. No credit card required. Invite your entire team.
                </p>
              </div>
              <Link
                to="/register-company"
                className="px-8 py-4 bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base border border-[#12B7D4] transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
