import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';
import SectionShowcase from '../../components/public/SectionShowcase';

const AboutPage = () => {
  return (
    <PublicLayout
      ctaTitle="See How Simple Your Agency Can Be."
      ctaSubtitle="Get your agency workspace set up in minutes. Register today and manage your clients with zero stress."
    >
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Plain Text Header (NO ROUNDED PILL) */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase mb-4">
            About the Software
          </p>

          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[62px] text-slate-950 tracking-tight leading-[1.16]">
            Built to Make Running Your Agency
            <span className="text-[#12B7D4] block mt-1 sm:mt-2 pb-1">
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
      <div className="py-8 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10 sm:space-y-16">

        {/* ── ZIG-ZAG 01: Why We Built This ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center pb-10 sm:pb-14 border-b border-slate-100">
            {/* Left Column: Heading & 4 Checkmarked Points */}
            <div className="lg:col-span-7 space-y-3.5 text-left">
              <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                Leads & Sales Pipeline Tracker.
                <span className="text-[#12B7D4] block mt-1 pb-0.5">
                  Never Let a Paying Deal Slip Away.
                </span>
              </h2>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Visual Sales Funnel</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Move leads from New Lead → Contacted → Discovery Call → Proposal Sent → Won.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">One-Click Conversion</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Instantly convert any won deal into an active Client Profile with a linked project.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Encrypted Client Vault</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Safely store client website logins, social credentials, hosting, and API keys.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Churn Prevention Alerts</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Automated alerts notify managers when an active client has no contact in 14 or 30 days.</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center pb-10 sm:pb-14 border-b border-slate-100">
            {/* Left Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <SectionShowcase type="calendar" />
            </div>

            {/* Right Column: Heading & 4 Checkmarked Points */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-3.5 text-left">
              <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                Agile Kanban & Content Calendar.
                <span className="text-[#12B7D4] block mt-1 pb-0.5">
                  Built for Creative Marketing Teams.
                </span>
              </h2>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Visual Kanban Boards</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Drag-and-drop tasks across To Do → In Progress → Review / Approval → Completed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Multi-Platform Calendar</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Schedule posts, reels, and stories across Instagram, Facebook, LinkedIn, YouTube, and X.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">SMM Monthly Quotas</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Track deliverables per client (15 Posts, 8 Reels, 4 Carousels) with live quota counts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Daily Focus & EOD Reports</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Morning checklists and 60-second end-of-day accomplishment summaries for managers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 03: 100% Privacy & Safety ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Left Column: Heading & 4 Checkmarked Points */}
            <div className="lg:col-span-7 space-y-3.5 text-left">
              <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                Geofenced GPS Attendance & HR.
                <span className="text-[#12B7D4] block mt-1 pb-0.5">
                  Safe, Private Agency Operations.
                </span>
              </h2>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">GPS Punch Clock</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">1-click mobile clock-in verifying staff are within office radius, with remote WFH toggle.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Strict Role Governance</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Designers and writers only see assigned client tasks; company margins stay 100% private.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Domain & SSL Watchdog</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Automated warning alerts trigger 30, 15, and 7 days before client websites expire.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Hardware Asset Library</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Inventory tracking for company laptops, studio cameras, mics, and equipment assignments.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 flex justify-center">
              <SectionShowcase type="attendance" />
            </div>
          </div>
        </ScrollReveal>

      </div>
    </PublicLayout>
  );
};

export default AboutPage;
