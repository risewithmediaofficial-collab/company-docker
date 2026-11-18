import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import PublicLayout from '../components/public/PublicLayout';
import HeroPattern from '../components/public/HeroPattern';
import ScrollReveal from '../components/public/ScrollReveal';
import SectionShowcase from '../components/public/SectionShowcase';
import StatsBanner from '../components/public/StatsBanner';

const Landing = () => {
  return (
    <PublicLayout>
      {/* ── HERO SECTION (Pattern strictly cut off right below action buttons) ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        {/* Pattern strictly bounded inside Hero Section using ONLY Logo Blue #12B7D4 */}
        <HeroPattern />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Plain Text Section Title (NO ROUNDED PILL, Human-Made Clean Typography) */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase mb-4">
            Simple Software for Marketing Agencies
          </p>

          {/* Big Clean Title (Black & Blue with Shimmer Animation) */}
          <h1 className="font-extrabold text-4xl sm:text-6xl lg:text-[68px] text-slate-950 tracking-tight leading-[1.08]">
            Manage Your Agency.
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1 sm:mt-2">
              All in One Place.
            </span>
          </h1>

          {/* Simple Human Subtitle */}
          <p className="mt-5 text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            Clients. Social Media. Fast Approvals. GST Bills.
          </p>

          <p className="mt-3 text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Stop switching between scattered spreadsheets and endless chats. Everything your marketing agency needs in one clear, simple flow.
          </p>

          {/* Registration & Login Buttons */}
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
        </div>
      </section>

      {/* ── IMPACT STATS BANNER (MATCHING REFERENCE DESIGN) ── */}
      <StatsBanner />

      {/* ── CLEAN ZIG-ZAG SECTIONS (ALIGNED WITH SMARTPHONE SHOWCASE & STICKERS) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* ── ZIG-ZAG 01: Client & Deal Tracker ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-20 border-b border-slate-100">
            {/* Left Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                01 — Client & Deal Tracker
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Never Lose a Lead.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Never Miss a Follow-up.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Keep all client phone numbers, requirements, and deal details organized so nobody forgets a follow-up.
              </p>

              {/* 4 Checkmark Bullet Points (Matching User Reference Image Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Direct Client Notes</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Save phone numbers, GSTIN, and service requirements in one view.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Clear Deal Stages</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Know inquiries, quoted proposals, or signed retainer status.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Zero WhatsApp Chaos</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Stop digging through endless unorganized group chats.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Instant Follow-up Rate</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Your team contacts inquiries today with zero delay.</p>
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

        {/* ── ZIG-ZAG 02: Social Media Calendar (Alternating: Showcase on Left, Text on Right) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-20 border-b border-slate-100">
            {/* Left Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <SectionShowcase type="calendar" />
            </div>

            {/* Right Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                02 — Social Media Planner
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Plan a Month of Content.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Ready in 10 Minutes.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Visual agency calendar for your designers and writers. Everyone knows what needs to be created, approved, and posted.
              </p>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Visual Monthly Grid</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">See upcoming posts, reels, and stories arranged by date.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Team Synchronization</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Writers, graphic designers, and video editors stay in sync.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Caption & Asset Storage</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Attach captions, hashtags, and approved graphics directly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Zero Missed Deadlines</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Deliver posts on time without panicked last-minute calls.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 03: 1-Tap Client Approvals ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-20 border-b border-slate-100">
            {/* Left Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                03 — 1-Tap Client Approvals
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Clients Approve on Phone.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Zero Endless Calls.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Give each client a private link to review creative designs. They tap to approve in seconds or request changes without endless calls.
              </p>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Mobile Screen Previews</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Clients preview Instagram posts and reels on their smartphones.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Instant 1-Tap Sign-off</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">One simple tap to approve with recorded timestamp.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Zero Passwords Needed</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Private review token links so clients never remember passwords.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Direct Change Requests</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Client edit notes stay attached directly to the creative file.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 flex justify-center">
              <SectionShowcase type="approvals" />
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 04: Fast GST Billing (Alternating: Showcase on Left, Text on Right) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-20 border-b border-slate-100">
            {/* Left Column: Visual Smartphone Showcase with Floating Stickers */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <SectionShowcase type="billing" />
            </div>

            {/* Right Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                04 — Fast GST Billing
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Generate Clean Tax Invoices.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Ready in 30 Seconds.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Create clean tax invoices in seconds with automatic GST calculation. Download PDF receipts immediately.
              </p>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Auto 18% GST Split</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Calculates CGST (9%) and SGST (9%) automatically with tax breakdown.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">1-Click PDF Downloads</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Generate printable, branded PDF tax receipts instantly for clients.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Payment Status Tracking</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Clear status tags for paid, partial, and pending invoices.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Bank & QR Details</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Your agency GSTIN, PAN, bank account, and UPI QR on every bill.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 05: Staff Attendance & Workspace ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Heading, Summary & 4 Checkmarked Points */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                05 — Staff Attendance & Workspace
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Safe, Private Workspace.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Built for Your Entire Team.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Simple selfie check-in for team attendance, role permissions so staff only see what they need, and your client data stays 100% private.
              </p>

              {/* 4 Checkmark Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Selfie Mobile Check-in</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Staff mark daily attendance with a quick selfie snapshot & timestamp.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Strict Role Permissions</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Designers and writers only see their assigned client tasks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Isolated Company Space</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Your client records, rates, and projects stay 100% private.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Automated Daily Backups</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Agency data and deliverable files are safely backed up automatically.</p>
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

      {/* ── BOTTOM CTA SECTION (Distinct Register & Login Buttons) ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-left sm:text-center relative z-10 space-y-6">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase">
            Start Running Your Agency Smarter
          </p>
          <h2 className="font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Ready to Organize Your{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#38bdf8] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer">
              Entire Agency?
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Register your company in 2 minutes. Keep your clients happy, your team on track, and your bills on time.
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

export default Landing;
