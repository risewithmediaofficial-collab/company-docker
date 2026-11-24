import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  TrendingUp,
  FileText,
  Lock,
  Bell,
  Layers,
  Calendar,
  Zap,
  Users,
  Clock,
  Code,
  Globe,
  Laptop,
  Shield,
  CreditCard,
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';
import SectionShowcase from '../../components/public/SectionShowcase';
import {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  YouTubeIcon,
  XIcon,
} from '../../components/ui/SocialIcons';

// ── Reusable zig-zag feature keyword row ────────────────────────────────────
const KwRow = ({ label, text, icons }) => (
  <div className="flex items-start gap-3">
    <div className="h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
      <Check size={13} className="stroke-[3]" />
    </div>
    <div className="text-sm text-slate-700 leading-snug font-medium">
      <span className="font-black text-slate-900">{label}</span>
      {text ? ` — ${text}` : ''}
      {icons && <div className="flex items-center gap-1.5 flex-wrap pt-1.5">{icons}</div>}
    </div>
  </div>
);

// ── Zig-zag pillar section ───────────────────────────────────────────────────
const Pillar = ({ overline, headline, highlight, body, features, showcase, flip, bg }) => (
  <section className={`py-14 sm:py-20 px-4 sm:px-8 ${bg || 'bg-white'}`}>
    <div className="max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Text side */}
          <div className={`lg:col-span-7 space-y-4 text-left ${flip ? 'order-1 lg:order-2' : ''}`}>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4]">{overline}</p>
            <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
              {headline}
              <span className="text-[#12B7D4] block mt-1">{highlight}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">{body}</p>
            <div className="space-y-3 pt-2 max-w-xl">
              {features.map((f, i) => (
                <KwRow key={i} label={f.label} text={f.text} icons={f.icons} />
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div className={`lg:col-span-5 flex justify-center ${flip ? 'order-2 lg:order-1' : ''}`}>
            {showcase}
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

// ── Compact icon keyword block (for sections with no visual) ────────────────
const IconBlock = ({ icon: Icon, overline, headline, highlight, features }) => (
  <div className="space-y-4">
    <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">{overline}</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 text-[#12B7D4] flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <h3 className="font-extrabold text-lg sm:text-xl text-slate-950 tracking-tight leading-tight">
        {headline}
        {highlight && <span className="text-[#12B7D4]"> {highlight}</span>}
      </h3>
    </div>
    <div className="space-y-2.5 pt-1">
      {features.map((f, i) => (
        <KwRow key={i} label={f.label} text={f.text} />
      ))}
    </div>
  </div>
);

export const CapabilitiesPage = () => {
  return (
    <PublicLayout
      ctaTitle="Ready to Run Your Agency on a Single System?"
      ctaSubtitle="Register your agency in 2 minutes. Eliminate 6+ subscriptions and give your team pure operational clarity."
    >
      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-3 sm:mb-4">
            22 Verified Agency Capabilities
          </p>
          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.15]">
            Every Feature Built For
            <span className="text-[#12B7D4] block mt-1 pb-1">Marketing Agency Growth.</span>
          </h1>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            From inbound leads and social media staging to automated invoicing and GPS attendance — one unified OS for your entire agency.
          </p>
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
          <div className="mt-4 flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> 14-Day Free Trial</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> No Credit Card Required</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Instant Setup in 2 Mins</span>
          </div>
        </div>
      </section>

      {/* ── 2. ZIG-ZAG PILLARS ── */}
      <div className="space-y-0">

        {/* PILLAR A — CRM & Leads (text left, visual right) */}
        <Pillar
          overline="CRM & Client Acquisition"
          headline="Never Lose a Lead."
          highlight="Close Deals Without Friction."
          body="Stop letting hot inquiries die in WhatsApp. Track every prospect from first hello to signed contract — then convert them in one click."
          bg="bg-white"
          features={[
            { label: 'Visual Sales Pipeline', text: 'New Lead → Contacted → Discovery Call → Proposal Sent → Won/Lost' },
            { label: '1-Click Client & Project Setup', text: 'Win a deal → instant client profile + linked project created automatically' },
            { label: 'Proposals & Digital Contracts', text: 'Line-item quotes, shareable review links, and branded PDF export' },
            { label: 'Encrypted Client Vault', text: 'Store social logins, WordPress admin, hosting & API keys with role-based access' },
            { label: 'Churn Prevention Alerts', text: 'Auto-notify account managers when a client hasn\'t been contacted in 14+ days' },
          ]}
          showcase={<SectionShowcase type="leads" />}
        />

        {/* PILLAR B — Content Calendar (visual left, text right) */}
        <Pillar
          overline="Creative & Social Media"
          headline="Agile Content Calendar."
          highlight="1-Tap Client Approvals on Phone."
          body="Coordinate writers, designers, and video editors without chaotic group chats. Clients preview and approve creatives directly on their phone."
          bg="bg-slate-50/70"
          flip
          features={[
            {
              label: 'Multi-Platform Visual Grid',
              text: 'Instagram, Facebook, LinkedIn, YouTube & X in one unified calendar view',
              icons: (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800">
                    <InstagramIcon size={13} />
                    <span>Instagram</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800">
                    <FacebookIcon size={13} />
                    <span>Facebook</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800">
                    <LinkedInIcon size={13} />
                    <span>LinkedIn</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800">
                    <YouTubeIcon size={13} />
                    <span>YouTube</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800">
                    <XIcon size={13} />
                    <span>𝕏</span>
                  </span>
                </>
              ),
            },
            { label: 'SMM Deliverable Quotas', text: 'Real-time per-client quota counters (Posts, Reels, Carousels, Stories)' },
            { label: 'Color-Coded Status Pills', text: 'Draft → In Review → Approved → Published — instant progress at a glance' },
            { label: 'Influencer Campaign CRM', text: 'Creator profiles, barter vs. paid deals, draft review stages, payout logs' },
            { label: '1-Click Mobile Review Links', text: 'Clients approve creatives on phone with verified timestamp sign-off' },
          ]}
          showcase={<SectionShowcase type="calendar" />}
        />

        {/* PILLAR C — Kanban & Team Tasks (text left, visual right) */}
        <Pillar
          overline="Operations & Task Workflow"
          headline="Agile Kanban Boards."
          highlight="Daily Accountability Built In."
          body="From drag-and-drop task management to morning checklists and EOD reports — your entire team operates with zero ambiguity every single day."
          bg="bg-white"
          features={[
            { label: 'Visual Kanban Board', text: 'To Do → In Progress → Review/Approval → Completed with drag-and-drop' },
            { label: 'Manager Task Oversight', text: 'Filter by member or client, spot bottlenecks, approve completed work instantly' },
            { label: 'Daily Focus & EOD Reports', text: 'Morning priority lists + 60-sec end-of-day accountability submissions' },
            { label: 'Standard Operating Procedures', text: 'Company playbook: Ad setup, brand guidelines, QA checklists by department' },
            { label: 'Software Dev Agile Sprints', text: '2-week sprint boards, story points, backlog, code reviews & release manager' },
          ]}
          showcase={<SectionShowcase type="billing" />}
        />

        {/* PILLAR D — Finance & Billing (visual left, text right) */}
        <Pillar
          overline="Finance, Billing & Payroll"
          headline="Client Invoices in 30 Seconds."
          highlight="Live Agency Profit & Loss."
          body="Eliminate spreadsheet accounting. Automated billing, tax splits, staff payroll, GPS attendance — all under one secure PIN-protected finance roof."
          bg="bg-slate-50/70"
          flip
          features={[
            { label: 'Automated Tax Invoices', text: 'Sequential numbering, automated tax splits, UPI QR codes, PDF download' },
            { label: 'Real-Time Agency P&L', text: 'Revenue, expenses, net margins & client LTV — PIN-gated for founder privacy' },
            { label: 'Overdue Payment Reminders', text: 'WhatsApp & email templates auto-triggered when invoices are past due' },
            { label: 'Staff Payroll & SaaS Tracker', text: 'Monthly salaries, bonuses, freelance payables & unused subscription audit' },
            { label: 'Loans & EMI Scheduler', text: 'Agency loan records with interest calculations and repayment tracking' },
          ]}
          showcase={<SectionShowcase type="leads" />}
        />

        {/* PILLAR E — HR, Attendance & Security (text left, visual right) */}
        <Pillar
          overline="HR, Attendance & Security"
          headline="GPS Punch Clock."
          highlight="Zero Buddy Punching."
          body="Smart mobile attendance verified by GPS office radius. Work-from-home toggles, leave approvals, domain watchdogs, and physical asset tracking."
          bg="bg-white"
          features={[
            { label: 'Geofenced GPS Clock In/Out', text: '1-tap office attendance verified by physical GPS radius — no faking' },
            { label: 'Remote WFH Toggle', text: 'Pre-approved remote work status with manager confirmation workflow' },
            { label: 'Domain & SSL Renewal Watchdog', text: 'Auto-alerts 30, 15 & 7 days before client domain or SSL certificate expires' },
            { label: 'Physical Asset Custody', text: 'Track laptops, cameras, microphones — know exactly who holds what device' },
            { label: 'Team Directory & Leave Manager', text: 'Emergency contacts, joined dates, leave balances & department routing' },
          ]}
          showcase={<SectionShowcase type="calendar" />}
        />

        {/* PILLAR F — Client Portal & SaaS (visual left, text right) */}
        <Pillar
          overline="Client Portal & Multi-Tenant SaaS"
          headline="Client VIP Portal."
          highlight="Zero Support Calls Needed."
          body="Give clients a branded private login — they see live project progress, ad budgets, creative approvals, and invoices without pinging you on WhatsApp."
          bg="bg-slate-50/70"
          flip
          features={[
            { label: 'Live Task Tracker', text: 'Clients see real-time deliverable milestones without asking for updates' },
            { label: 'Transparent Ad Spend', text: 'Live Meta & Google Ads budget view — no confusing agency jargon' },
            { label: '1-Tap Creative Approvals', text: 'Review Instagram posts on phone and stamp approval in seconds' },
            { label: 'Invoice Downloads', text: 'Clients access billing history and download past tax invoices anytime' },
            { label: 'Multi-Tenant SaaS Platform', text: 'Self-service 14-day trial, agency tenant isolation & super admin dashboard' },
          ]}
          showcase={<SectionShowcase type="billing" />}
        />

      </div>

      {/* ── 3. ROLE PERSONA STRIP ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4] mb-2">Role-Based Governance</p>
              <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.2]">
                Every Person Sees Exactly
                <span className="text-[#12B7D4] block mt-1">What They Need.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-medium mt-3 leading-relaxed max-w-xl mx-auto">
                Zero clutter. Each team member only sees the tools relevant to their role. Founders retain 360° governance over everything.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  tag: 'Agency Founder',
                  Icon: TrendingUp,
                  color: 'text-[#12B7D4]',
                  features: ['P&L Dashboard', 'Staff Payroll', 'Manager Oversight', 'Client Vault'],
                },
                {
                  tag: 'Project Manager',
                  Icon: Layers,
                  color: 'text-emerald-400',
                  features: ['Kanban Boards', 'Content Calendar', 'SMM Quotas', 'EOD Reports'],
                },
                {
                  tag: 'Creative / Staff',
                  Icon: Clock,
                  color: 'text-amber-400',
                  features: ['Daily Task List', 'GPS Clock-In', 'Asset Uploads', '60-Sec EOD'],
                },
                {
                  tag: 'Agency Client',
                  Icon: Shield,
                  color: 'text-purple-400',
                  features: ['VIP Client Portal', 'Live Progress', 'Ad Budget View', 'Invoice Downloads'],
                },
              ].map(({ tag, Icon, color, features }) => (
                <div key={tag} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center ${color}`}>
                      <Icon size={18} />
                    </div>
                    <p className="font-black text-white text-sm tracking-tight">{tag}</p>
                  </div>
                  <ul className="space-y-2.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                        <Check size={12} className={`${color} stroke-[3] shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. FINAL CTA (Clean White Fill, Seamless Borderless) ── */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#12B7D4] block">
                  Instant 14-Day Free Access
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Stop juggling 6 different tools.
                  <span className="text-[#12B7D4] block mt-1">Run your agency like a well-oiled machine.</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-1">
                  Set up your agency workspace in under 2 minutes. No credit card required. Full team access included.
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

export default CapabilitiesPage;
