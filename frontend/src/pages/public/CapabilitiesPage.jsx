import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Users,
  Shield,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';
import SectionShowcase from '../../components/public/SectionShowcase';
import SoftwareComparison from '../../components/public/SoftwareComparison';

// ── Role Personas Matrix ──────────────────────────────────────────────────────
const ROLES_MATRIX = [
  {
    role: 'Agency Founder / CEO',
    tag: 'Total Governance',
    desc: 'Owns agency profitability, client retention, and company-wide growth.',
    features: [
      { key: 'Profit & Loss Tracker', note: 'Real-time revenue, expenses, and agency profit margins.' },
      { key: 'Manager Task Oversight', note: 'Spot overdue work and unblock bottlenecks fast.' },
      { key: 'Automated Staff Payroll', note: 'Monthly salaries, attendance, and advance deductions.' },
      { key: 'Encrypted Client Vault', note: 'Safe storage for client passwords, socials, and API keys.' },
    ],
  },
  {
    role: 'Project Manager / Lead',
    tag: 'Smooth Delivery',
    desc: 'Keeps team members productive, unblocked, and delivering to client standards.',
    features: [
      { key: 'Agile Kanban Boards', note: 'Drag-and-drop tasks with priority tags and due dates.' },
      { key: 'Social Media Calendar', note: 'Staging, captions, hashtags, and creative review queues.' },
      { key: 'SMM Quota Counter', note: 'Real-time deliverable tracking (reels, carousels, blogs).' },
      { key: 'Team EOD Work Reports', note: 'Review daily employee submissions in one clean feed.' },
    ],
  },
  {
    role: 'Creative / Staff Member',
    tag: 'Daily Focus',
    desc: 'Designers, copywriters, media buyers, and developers executing everyday work.',
    features: [
      { key: 'Clean Daily Task List', note: 'Personal morning focus without noisy group chats.' },
      { key: 'GPS Mobile Clock-in', note: '1-tap office and remote attendance with timestamps.' },
      { key: 'Direct Asset Uploads', note: 'Attach graphics, reels, and copy directly to tasks.' },
      { key: '60-Sec EOD Check-out', note: 'Quick daily accomplishments log before ending the day.' },
    ],
  },
  {
    role: 'Paying Agency Client',
    tag: 'VIP Experience',
    desc: 'Your clients who want transparency without endless email back-and-forth.',
    features: [
      { key: 'Private Branded Portal', note: 'VIP client login on your custom domain with zero clutter.' },
      { key: 'Live Progress Tracker', note: 'See real-time deliverable milestones without calling.' },
      { key: 'Transparent Ad Spends', note: 'Live Meta & Google Ads budget spend monitoring.' },
      { key: '1-Tap Creative Approvals', note: 'Review Instagram posts on phone and approve in 1 tap.' },
    ],
  },
];

export const CapabilitiesPage = () => {
  return (
    <PublicLayout
      ctaTitle="Ready to Run Your Agency on a Single System?"
      ctaSubtitle="Register your agency in 2 minutes. Eliminate 6+ subscriptions and give your team pure operational clarity."
    >
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-3">
            RiseWithMedia OS — What We Do
          </p>

          <h1 className="font-black text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.15]">
            Every Tool Your Agency Needs.
            <span className="text-[#12B7D4] block mt-1 pb-1">
              None of the Fluff.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            The all-in-one operating system and CRM built specifically for Digital Marketing Agencies, Creative Studios, and Tech Teams.
            Everything here is <strong>live and built into our web platform</strong>.
          </p>

          {/* Quick CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company (14-Day Free Trial)</span>
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

      {/* ── 2. MODERN COMPARISON SECTION ("WHAT THEY HAVE" VS "WHAT WE DO") ── */}
      <SoftwareComparison />

      {/* ── 3. CLEAN ZIG-ZAG SMARTPHONE SHOWCASE SECTIONS (MATCHING USER REFERENCE UI) ── */}
      <section className="bg-slate-50/60 border-y border-slate-200/80 py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-2">
              Visual Mobile First
            </p>
            <h2 className="font-extrabold text-2xl sm:text-4xl text-slate-950 tracking-tight leading-[1.2]">
              Built for Real Agency Execution
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
              Every deliverable, approval, invoice, and attendance check-in optimized for desktop and mobile.
            </p>
          </div>

          {/* ── ZIG-ZAG 01: Sales & CRM ── */}
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-12 sm:pb-16 border-b border-slate-200/80">
              {/* Left Column: Heading & 4 Checkmarked Points */}
              <div className="lg:col-span-7 space-y-3.5 text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  Sales & CRM
                </div>
                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                  Leads & Sales Pipeline Tracker.
                  <span className="text-[#12B7D4] block mt-1 pb-0.5">
                    Never Let a Paying Deal Slip Away.
                  </span>
                </h2>

                {/* 4 Crisp Checkmark Bullet Points with Bold Keywords */}
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

              {/* Right Column: Visual Smartphone Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <SectionShowcase type="leads" />
              </div>
            </div>
          </ScrollReveal>

          {/* ── ZIG-ZAG 02: Social Media Calendar (Showcase Left, Text Right) ── */}
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-12 sm:pb-16 border-b border-slate-200/80">
              {/* Left Column: Visual Smartphone Showcase */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                <SectionShowcase type="calendar" />
              </div>

              {/* Right Column: Heading & 4 Checkmarked Points */}
              <div className="lg:col-span-7 order-1 lg:order-2 space-y-3.5 text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  Content & Social Media
                </div>
                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                  Agile Kanban & Content Calendar.
                  <span className="text-[#12B7D4] block mt-1 pb-0.5">
                    Built for Creative Marketing Teams.
                  </span>
                </h2>

                {/* 4 Crisp Checkmark Bullet Points with Bold Keywords */}
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

          {/* ── ZIG-ZAG 03: 1-Tap Client Approvals ── */}
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-12 sm:pb-16 border-b border-slate-200/80">
              {/* Left Column: Heading & 4 Checkmarked Points */}
              <div className="lg:col-span-7 space-y-3.5 text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  Client VIP Experience
                </div>
                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                  Branded VIP Client Portal.
                  <span className="text-[#12B7D4] block mt-1 pb-0.5">
                    1-Tap Mobile Approvals & Live Budgets.
                  </span>
                </h2>

                {/* 4 Crisp Checkmark Bullet Points with Bold Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">Dedicated Client Portal</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Clients log into a private branded portal to view live project progress without calling.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">1-Tap Creative Approvals</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Clients preview Instagram posts and reels on their phone and sign off with 1 tap.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">Live Ad Budget Tracker</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Transparent reporting on Meta and Google ad spends and remaining monthly budget.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">Digital Proposals & Quotes</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Shareable web contracts with custom line-item pricing and online acceptance.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Smartphone Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <SectionShowcase type="approvals" />
              </div>
            </div>
          </ScrollReveal>

          {/* ── ZIG-ZAG 04: Fast GST Billing (Showcase Left, Text Right) ── */}
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-12 sm:pb-16 border-b border-slate-200/80">
              {/* Left Column: Visual Smartphone Showcase */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                <SectionShowcase type="billing" />
              </div>

              {/* Right Column: Heading & 4 Checkmarked Points */}
              <div className="lg:col-span-7 order-1 lg:order-2 space-y-3.5 text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  Finance & Billing
                </div>
                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                  Agency Finance & GST Billing.
                  <span className="text-[#12B7D4] block mt-1 pb-0.5">
                    Automated Tax Invoices & Real-Time P&L.
                  </span>
                </h2>

                {/* 4 Crisp Checkmark Bullet Points with Bold Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">GST Tax Invoices</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Auto-calculated CGST (9%) and SGST (9%) with sequential invoice numbers and PDF export.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">Live Profit & Loss</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Shows real-time incoming revenue, total expenses, burn rate, and agency profit margins.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">Staff Payroll & Salaries</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Calculate monthly salaries, attendance hours, advance deductions, and payout records.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">Agency Loans & EMIs</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Track agency business borrowings, monthly EMI due dates, balances, and interest rates.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── ZIG-ZAG 05: Staff Attendance & Workspace ── */}
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & 4 Checkmarked Points */}
              <div className="lg:col-span-7 space-y-3.5 text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  HR & Team Operations
                </div>
                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                  Geofenced GPS Attendance & HR.
                  <span className="text-[#12B7D4] block mt-1 pb-0.5">
                    Safe, Private Agency Operations.
                  </span>
                </h2>

                {/* 4 Crisp Checkmark Bullet Points with Bold Keywords */}
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

              {/* Right Column: Visual Smartphone Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <SectionShowcase type="attendance" />
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ── 4. ROLE-BASED WORKSPACE MATRIX ("WHO USES THIS?") ── */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
            Role-Based Experience
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1">
            Customized for Every Person in Your Agency
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Zero noise. Team members only see the exact tools they need to execute their job, while agency owners maintain 360° governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES_MATRIX.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#12B7D4]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider mb-3">
                  {item.tag}
                </div>
                <h3 className="text-lg font-black text-slate-950 tracking-tight">
                  {item.role}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed pb-4 border-b border-slate-100">
                  {item.desc}
                </p>

                <ul className="space-y-3 pt-4">
                  {item.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                      <Check size={14} className="text-[#12B7D4] stroke-[3] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-bold block">{f.key}</strong>
                        <span className="text-slate-500 text-[11px] font-medium leading-tight">{f.note}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Full Role Access Included</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. FINAL ACTION BANNER ── */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden shadow-2xl text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#12B7D4] block">
                Instant 14-Day Free Access
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Stop juggling 6 different tools.
                <span className="text-[#12B7D4] block">Run your agency like a well-oiled machine.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pt-1">
                Set up your agency workspace in under 2 minutes. No credit card required. Full team access included.
              </p>
            </div>
            <Link
              to="/register-company"
              className="px-8 py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </PublicLayout>
  );
};

export default CapabilitiesPage;
