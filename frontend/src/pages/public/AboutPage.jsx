import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';
import SectionShowcase from '../../components/public/SectionShowcase';

const AboutPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Plain Text Header (NO ROUNDED PILL) */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase mb-4">
            About the Software
          </p>

          <h1 className="font-extrabold text-4xl sm:text-6xl lg:text-[68px] text-slate-950 tracking-tight leading-[1.08]">
            Built to Make Running Your Agency
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1 sm:mt-2">
              Simple and Stress-Free.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            RiseWithMedia brings your client inquiries, social media tasks, client reviews, and GST billing into one easy place. No confusing setup, no complicated words.
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

      {/* ── CLEAN ZIG-ZAG SECTIONS (ALIGNED WITH SMARTPHONE SHOWCASE & STICKERS) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* ── ZIG-ZAG 01: Why We Built This ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-20 border-b border-slate-100">
            {/* Left Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                01 — Why We Built This
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Stop Juggling Five
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Scattered Apps.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Most agencies lose hours each day switching between WhatsApp chats, Excel spreadsheets, email threads, and invoicing software. We put everything under one simple roof.
              </p>

              {/* 4 Checkmark Bullet Points (Matching Reference Image) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">One Unified Login</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Access daily tasks, calendars, and clients from one place.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Zero Learning Curve</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Designed so any team member understands it in 5 minutes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">No More Lost Notes</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Client briefs and deliverable notes stay attached permanently.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Always Accountable</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">See exactly who owns each graphic, reel, or invoice.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 flex justify-center">
              <SectionShowcase type="leads" />
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 02: Built for Agency Rhythm (Alternating) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-20 border-b border-slate-100">
            {/* Left Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <SectionShowcase type="rhythm" />
            </div>

            {/* Right Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                02 — Agency Rhythm
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Designed Around How
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Agencies Actually Work.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                We didn't build software with 500 complicated settings you'll never use. We built the exact 4 things every marketing agency needs every morning.
              </p>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Step 1 — Capture Lead</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Log client phone number, requirements, and budget quote.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Step 2 — Schedule Posts</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Stage graphics, reels, and captions on the monthly calendar.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Step 3 — 1-Tap Sign-off</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Client approves creatives directly with zero password needed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Step 4 — Send GST Bill</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Generate 18% GST invoice PDF with bank details in 30 seconds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 03: 100% Privacy & Safety ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                03 — 100% Privacy & Safety
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Your Clients and Data
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Stay 100% Yours.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Your agency receives its own dedicated company workspace. Your staff, clients, rates, and projects are strictly isolated and protected.
              </p>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Isolated Database</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Dedicated space; other agencies cannot view your records.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Staff Access Control</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Employees only see clients and tasks assigned to them.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Automated Daily Backups</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Continuous backups ensure deliverables are never lost.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Company Subdomain</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Custom agency workspace URL so clients recognize your brand.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 flex justify-center">
              <SectionShowcase type="privacy" />
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
            See How Simple Your{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#38bdf8] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer">
              Agency Can Be.
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Get your agency workspace set up in minutes. Register today and manage your clients with zero stress.
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

export default AboutPage;
