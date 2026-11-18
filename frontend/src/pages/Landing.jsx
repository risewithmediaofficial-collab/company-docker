import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '../components/public/PublicLayout';
import HeroPattern from '../components/public/HeroPattern';
import ScrollReveal from '../components/public/ScrollReveal';

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

      {/* ── HIGHLIGHTS STRIP ── */}
      <section className="bg-white py-8 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-left sm:text-center">
          <div>
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">All-in-One</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">No More Scattered Apps</span>
          </div>
          <div>
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">Fast Approvals</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Zero Confusing Emails</span>
          </div>
          <div>
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">GST Bills</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Ready in 1-Click</span>
          </div>
          <div>
            <span className="font-bold text-2xl sm:text-3xl text-slate-950 block">100% Private</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Safe for Your Team</span>
          </div>
        </div>
      </section>

      {/* ── CLEAN ZIG-ZAG SECTIONS (NO CARDS, PLAIN TEXT LABELS, HUMAN-MADE CSS) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* ── ZIG-ZAG 01: Client & Deal Tracker ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            {/* Left Column: Heading & Summary */}
            <div className="lg:col-span-5 space-y-4 text-left">
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
            </div>

            {/* Right Column: Clean Editorial Points (NO CARDS, NO BOXES) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Direct Client Notes</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Save phone numbers, GSTIN, and service requirements in one central view.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Clear Deal Stages</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Know immediately which deals are new inquiries, quoted, or signed retainers.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Zero WhatsApp Chaos</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Stop digging through endless group chats to find what the client asked for.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Instant Follow-up Rate</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Your team always knows who needs to be contacted today with zero delay.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 02: Social Media Calendar (Alternating: Points on Left, Text on Right) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            {/* Left Column: Clean Editorial Points */}
            <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Visual Monthly Grid</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">See all upcoming posts, reels, and stories arranged by publishing date.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Team Synchronization</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Writers, graphic designers, and video editors stay completely in sync.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Caption & Asset Storage</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Attach captions, hashtags, and approved image graphics to every task.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Zero Missed Deadlines</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Always deliver posts on time without last-minute scrambling or panicked calls.</p>
              </div>
            </div>

            {/* Right Column: Heading & Summary */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
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
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 03: 1-Tap Client Approvals ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            {/* Left Column: Heading & Summary */}
            <div className="lg:col-span-5 space-y-4 text-left">
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
            </div>

            {/* Right Column: Clean Editorial Points (NO CARDS, NO BOXES) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Mobile Screen Previews</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Clients preview upcoming Instagram posts and reels directly on their smartphones.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Instant 1-Tap Sign-off</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">One simple button tap to approve with recorded timestamp and confirmation.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Zero Passwords Needed</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Secure private review token links so clients never have to remember passwords.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Direct Change Requests</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Client edit notes stay attached directly to the specific deliverable file.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 04: Fast GST Billing (Alternating: Points on Left, Text on Right) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            {/* Left Column: Clean Editorial Points */}
            <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Auto 18% GST Split</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Calculates CGST (9%) and SGST (9%) automatically with accurate tax breakdowns.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">1-Click PDF Downloads</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Generate printable, branded PDF tax receipts instantly for clients.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Payment Status Tracking</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Clear status tags for paid, partial, and pending client invoices.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Complete Bank & QR Details</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Your company GSTIN, PAN, bank account, and UPI QR on every bill.</p>
              </div>
            </div>

            {/* Right Column: Heading & Summary */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
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
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 05: Staff Attendance & Workspace ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left Column: Heading & Summary */}
            <div className="lg:col-span-5 space-y-4 text-left">
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
            </div>

            {/* Right Column: Clean Editorial Points (NO CARDS, NO BOXES) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Selfie Mobile Check-in</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Staff tap check-in with a quick photo snapshot and recorded timestamp.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Strict Role Permissions</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Designers and writers only see their assigned tasks; managers see finances.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Isolated Company Space</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Your client records, rates, and projects are 100% private to your agency.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Automated Daily Backups</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">All agency data and deliverable files are safely backed up automatically.</p>
              </div>
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
