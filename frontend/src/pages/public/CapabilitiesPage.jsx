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
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#07c8f9]">{overline}</p>
            <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
              {headline}
              <span className="text-[#07c8f9] block mt-1">{highlight}</span>
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
    <p className="text-xs font-bold uppercase tracking-widest text-[#07c8f9]">{overline}</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 text-[#07c8f9] flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <h3 className="font-extrabold text-lg sm:text-xl text-slate-950 tracking-tight leading-tight">
        {headline}
        {highlight && <span className="text-[#07c8f9]"> {highlight}</span>}
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
      ctaTitle="Ready to Run Your Entire Agency in One Place?"
      ctaSubtitle="Register your agency in 2 minutes. Replace 6 separate apps and give your team complete peace of mind."
    >
      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#07c8f9] uppercase mb-3 sm:mb-4">
            22 Simple Tools for Your Agency
          </p>
          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.15]">
            Everything Built to Help Your
            <span className="text-[#07c8f9] block mt-1 pb-1">Marketing Agency Grow.</span>
          </h1>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            From finding new leads and scheduling social posts to sending invoices and tracking staff attendance — all in one simple system.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#07c8f9] hover:bg-[#06b4e0] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#07c8f9]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Flexible Workspace Plans</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Role-Based Portals</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Instant Activation</span>
          </div>
        </div>
      </section>

      {/* ── 2. ZIG-ZAG PILLARS ── */}
      <div className="space-y-0">

        {/* PILLAR A — CRM & Leads (text left, visual right) */}
        <Pillar
          overline="Finding & Managing Clients"
          headline="Never Lose a Lead."
          highlight="Win Deals Faster."
          body="Never let new inquiries get lost in WhatsApp. Track every prospective client from first hello to signed agreement — then start their project in one click."
          bg="bg-white"
          features={[
            { label: 'Simple Lead Board', text: 'Track leads step-by-step: New Lead → Contacted → First Call → Proposal Sent → Won' },
            { label: '1-Click Client & Project Setup', text: 'When you win a deal, one click creates the client profile and project tasks' },
            { label: 'Proposals & Agreements', text: 'Clear price quotes, easy review links for clients, and neat PDF downloads' },
            { label: 'Safe Password Vault', text: 'Store client website logins, Instagram passwords, and keys safely in one place' },
            { label: 'Client Check-in Reminders', text: 'Get alerted if a client hasn\'t heard from your team in 14 days so they stay happy' },
          ]}
          showcase={<SectionShowcase type="leads" />}
        />

        {/* PILLAR B — Content Calendar (visual left, text right) */}
        <Pillar
          overline="Content & Social Media"
          headline="Easy Content Calendar."
          highlight="1-Tap Client Approvals on Mobile."
          body="Keep your writers, designers, and video editors in sync without messy group chats. Clients preview posts on their phone and approve in one tap."
          bg="bg-slate-50/70"
          flip
          features={[
            {
              label: 'All Social Media in One Calendar',
              text: 'Instagram, Facebook, LinkedIn, YouTube, and X in one simple grid',
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
            { label: 'Monthly Post & Video Targets', text: 'Track monthly targets for each client (Posts, Reels, Carousels, Stories)' },
            { label: 'Clear Status Colors', text: 'Draft → In Review → Approved → Published — see progress at a glance' },
            { label: 'Influencer Campaign Tracker', text: 'Creator profiles, free product or paid deals, post reviews, and payment records' },
            { label: 'Fast Mobile Approvals', text: 'Clients check designs and videos on their phone and approve with a single tap' },
          ]}
          showcase={<SectionShowcase type="calendar" />}
        />

        {/* PILLAR C — Kanban & Team Tasks (text left, visual right) */}
        <Pillar
          overline="Daily Tasks & Team Work"
          headline="Visual Task Boards."
          highlight="Keep Everyone on the Same Page."
          body="From simple drag-and-drop task boards to morning checklists and daily wrap-ups — your entire team knows exactly what to do every day."
          bg="bg-white"
          features={[
            { label: 'Easy Drag-and-Drop Board', text: 'To Do → In Progress → Review → Completed' },
            { label: 'Manager Overview', text: 'Check tasks by team member or client, fix delays, and approve finished work' },
            { label: 'Morning To-Do & Daily Wrap-Up', text: 'Morning priorities and a 1-minute daily summary from each team member' },
            { label: 'Step-by-Step Team Guides', text: 'Easy checklists for running ads, brand guidelines, and quality checks' },
            { label: 'Software Project Boards', text: 'Task lists, backlogs, code reviews, and launch milestones for tech projects' },
          ]}
          showcase={<SectionShowcase type="billing" />}
        />

        {/* PILLAR D — Finance & Billing (visual left, text right) */}
        <Pillar
          overline="Money, Invoicing & Payroll"
          headline="Send Invoices in 30 Seconds."
          highlight="See Your Real Profit & Loss."
          body="Stop doing manual math on spreadsheets. Automatic tax calculations, staff payroll, and GPS attendance — all locked behind your secret PIN."
          bg="bg-slate-50/70"
          flip
          features={[
            { label: 'Fast Invoices & Receipts', text: 'Automatic bill numbers, easy tax calculations, UPI QR codes, and PDF downloads' },
            { label: 'Live Profit & Loss', text: 'See your income, expenses, profit margins, and client spending — locked with your PIN' },
            { label: 'Late Payment Reminders', text: 'Friendly automatic WhatsApp and email reminders when bills are overdue' },
            { label: 'Staff Salaries & App Bills', text: 'Monthly pay, freelance fees, and alerts for unused software you are paying for' },
            { label: 'Loan & EMI Tracker', text: 'Keep track of company loans, monthly EMIs, and upcoming payments' },
          ]}
          showcase={<SectionShowcase type="leads" />}
        />

        {/* PILLAR E — HR, Attendance & Security (text left, visual right) */}
        <Pillar
          overline="Team Attendance & Office Tools"
          headline="GPS Punch Clock."
          highlight="No Fake Check-Ins."
          body="Smart attendance verified by your office location. Easy work-from-home switches, leave requests, website expiry alerts, and equipment tracking."
          bg="bg-white"
          features={[
            { label: 'GPS Office Attendance', text: 'Staff tap to check in only when they are physically at the office — no faking' },
            { label: 'Work-From-Home Switch', text: 'Simple option for staff to request and log approved remote work days' },
            { label: 'Website & Domain Expiry Alerts', text: 'Get automatic warnings 30, 15, and 7 days before client domains expire' },
            { label: 'Company Equipment Tracker', text: 'Know exactly which team member is holding each laptop, camera, or phone' },
            { label: 'Team Directory & Leave Requests', text: 'Contact details, holiday balances, and quick leave approvals' },
          ]}
          showcase={<SectionShowcase type="calendar" />}
        />

        {/* PILLAR F — Client Portal & SaaS (visual left, text right) */}
        <Pillar
          overline="Client Portal & Privacy"
          headline="VIP Client Portal."
          highlight="No Need for Endless Status Calls."
          body="Give your clients a clean private link — they can check work progress, ad budgets, approve designs, and download invoices without texting you for updates."
          bg="bg-slate-50/70"
          flip
          features={[
            { label: 'Live Work Tracker', text: 'Clients see progress on their deliverables without having to ask for updates' },
            { label: 'Clear Ad Spend View', text: 'Simple view of Meta & Google Ads budgets in plain rupees — zero confusing jargon' },
            { label: '1-Tap Mobile Approvals', text: 'Clients review Instagram posts on their phone and approve in seconds' },
            { label: 'Download Invoices Anytime', text: 'Clients can see past bills and download payment receipts whenever they need' },
            { label: '100% Private & Safe Platform', text: '14-day free trial, completely separate space for each agency, and full owner control' },
          ]}
          showcase={<SectionShowcase type="billing" />}
        />

      </div>

      {/* ── 3. ROLE PERSONA STRIP ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#07c8f9] mb-2">Simple Roles for Everyone</p>
              <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.2]">
                Every Person Sees Exactly
                <span className="text-[#07c8f9] block mt-1">What They Need.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-medium mt-3 leading-relaxed max-w-xl mx-auto">
                No clutter. Each team member only sees the tools they need for their job. Agency owners keep complete control over everything.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  tag: 'Agency Founder',
                  Icon: TrendingUp,
                  color: 'text-[#07c8f9]',
                  features: ['Live Profit & Loss', 'Staff Payroll', 'Manager Oversight', 'Password Vault'],
                },
                {
                  tag: 'Project Manager',
                  Icon: Layers,
                  color: 'text-emerald-400',
                  features: ['Task Boards', 'Content Calendar', 'Monthly Targets', 'Daily Wrap-Up'],
                },
                {
                  tag: 'Creative / Staff',
                  Icon: Clock,
                  color: 'text-amber-400',
                  features: ['Today\'s Tasks', 'GPS Attendance', 'Upload Files', '1-Minute Daily Summary'],
                },
                {
                  tag: 'Agency Client',
                  Icon: Shield,
                  color: 'text-purple-400',
                  features: ['VIP Client Portal', 'Live Progress', 'Ad Budgets', 'Download Invoices'],
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
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#07c8f9] block">
                  Unified Agency OS
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Stop juggling 6 different tools.
                  <span className="text-[#07c8f9] block mt-1">Run your agency smoothly and without stress.</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-1">
                  Register your account, choose your workspace plan, and configure your agency settings in minutes.
                </p>
              </div>
              <Link
                to="/register"
                className="px-8 py-4 bg-[#07c8f9] hover:bg-[#06b4e0] text-white font-bold text-sm sm:text-base border border-[#07c8f9] transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Register Now</span>
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
