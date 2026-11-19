import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Search,
  Users,
  FileText,
  Lock,
  Shield,
  Calendar,
  Clock,
  Layers,
  Code,
  Bell,
  CreditCard,
  TrendingUp,
  Laptop,
  Globe,
  Zap,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';

// ── Master Features Database (22 Verified Platform Capabilities) ─────────────
const ALL_FEATURES = [
  // ── 1. Sales, Clients & Relationship Management (CRM) ─────────────────────
  {
    id: 'crm-leads',
    category: 'crm',
    title: 'Leads & Sales Pipeline Tracker',
    route: '/crm/leads',
    badge: 'CRM Core',
    icon: TrendingUp,
    color: 'emerald',
    summary: 'Never let a prospective client slip away. Follow inquiries from first hello to closed deal.',
    highlights: [
      'Visual sales funnel stages: New Lead → Contacted → Discovery Call → Proposal Sent → Won/Lost',
      'Deal value estimation, industry tags, and closing probability scoring',
      '1-Click conversion: instantly turn any won lead into an active Client & Project',
      'Contact logs and follow-up reminders attached to each lead profile',
    ],
  },
  {
    id: 'crm-proposals',
    category: 'crm',
    title: 'Proposals & Digital Contracts',
    route: '/proposals',
    badge: 'Deal Closer',
    icon: FileText,
    color: 'cyan',
    summary: 'Draft modern, professional agency service quotes and contracts in under 3 minutes.',
    highlights: [
      'Line-item pricing for SEO, Social Media, Meta Ads, Google Ads, and Development',
      'Private shareable links for client review with online acceptance',
      'Branded PDF contract export ready for physical or digital signing',
      'Automatic linkage to client profiles upon proposal approval',
    ],
  },
  {
    id: 'crm-clients',
    category: 'crm',
    title: 'Client 360° Directory',
    route: '/clients',
    badge: 'Client Central',
    icon: Users,
    color: 'blue',
    summary: 'The master headquarters for every client account, contract, and deliverable.',
    highlights: [
      'View contact persons, billing info, active retainer fees, and renewal dates',
      'Direct links to all projects, invoices, and monthly tasks for each client',
      'Status filtering: Active Retainers, Onboarding, Paused, or Past Clients',
      'Assigned account managers and lead point-of-contact details',
    ],
  },
  {
    id: 'crm-vault',
    category: 'crm',
    title: 'Client Vault (Encrypted Locker)',
    route: '/client-vault',
    badge: 'Ultra Secure',
    icon: Lock,
    color: 'amber',
    summary: 'Safe, encrypted storage for client social media logins, website credentials, and API keys.',
    highlights: [
      'Eliminates risky password sharing across unencrypted WhatsApp messages',
      'Role-based viewing permissions so only authorized managers can reveal secrets',
      'Category tags for Social Media, WordPress/Shopify, Web Hosting, and Ad Accounts',
      'One-click copy for usernames and masked passwords with access audit logs',
    ],
  },
  {
    id: 'crm-followups',
    category: 'crm',
    title: 'Client Follow-ups & Churn Prevention',
    route: '/client-followups',
    badge: 'Retention',
    icon: Bell,
    color: 'rose',
    summary: 'Scheduled relationship touchpoints to keep client happiness high and stop churn before it starts.',
    highlights: [
      'Automated alerts when an active client has not been contacted in 14 or 30 days',
      'Schedule monthly reporting calls, quarterly reviews, and check-ins',
      'Meeting history notes and client sentiment records',
      'Team notifications for upcoming scheduled client touchpoints',
    ],
  },

  // ── 2. Operations, Tasks & Daily Workflows ─────────────────────────────────
  {
    id: 'ops-kanban',
    category: 'tasks',
    title: 'Visual Kanban Task Board',
    route: '/tasks',
    badge: 'Agile Ops',
    icon: Layers,
    color: 'cyan',
    summary: 'Modern drag-and-drop task workflow designed for fast-moving creative and marketing teams.',
    highlights: [
      'Columns: To Do → In Progress → Review / Approval → Completed',
      'Priority tags (Urgent, High, Medium, Low), checklists, and due dates',
      'Direct asset file attachments for graphics, video links, and copy documents',
      'Quick toggle between agile Kanban cards and compact tabular List view',
    ],
  },
  {
    id: 'ops-manager',
    category: 'tasks',
    title: 'Manager Task Oversight',
    route: '/manager-tasks',
    badge: 'Leadership',
    icon: Shield,
    color: 'indigo',
    summary: 'A dedicated command view for agency founders and team leads to unblock deliverables.',
    highlights: [
      'Filter tasks across all team members or clients to spot bottlenecks instantly',
      '1-Click manager approvals for completed work waiting for client sign-off',
      'Overdue alerts highlighting tasks slipping past committed delivery dates',
      'Reassign tasks smoothly when team members are on leave',
    ],
  },
  {
    id: 'ops-calendar',
    category: 'tasks',
    title: 'Social Media Content Calendar',
    route: '/calendar',
    badge: 'Content Hub',
    icon: Calendar,
    color: 'emerald',
    summary: 'Visual multi-platform scheduling hub for Instagram, Facebook, LinkedIn, YouTube, and X.',
    highlights: [
      'Schedule posts, reels, and stories with dates, times, and platform badges',
      'Preview captions, hashtags, and attached graphic carousels before publishing',
      'Color-coded status pills: Draft, In Review, Approved, Published',
      'One-click client preview links for rapid mobile review and approval',
    ],
  },
  {
    id: 'ops-smm',
    category: 'tasks',
    title: 'SMM One-Page Tracker',
    route: '/smm',
    badge: 'SMM Cockpit',
    icon: Zap,
    color: 'cyan',
    summary: 'The ultimate high-speed cockpit for Social Media Marketing departments.',
    highlights: [
      'Real-time tracking of monthly deliverables per client (Posts, Reels, Carousels)',
      'Live progress bars comparing contracted quotas against published output',
      'Copywriter staging and graphic designer readiness indicators',
      'Prevents client disputes over unfulfilled monthly contract scopes',
    ],
  },
  {
    id: 'ops-influencers',
    category: 'tasks',
    title: 'Influencer Marketing Manager',
    route: '/influencers',
    badge: 'Creator CRM',
    icon: Users,
    color: 'purple',
    summary: 'Organize creator campaigns from discovery to contract, draft review, and payout.',
    highlights: [
      'Maintain creator profiles, niche tags, follower counts, and engagement rates',
      'Track barter collaborations vs. paid sponsorship agreements',
      'Monitor draft review stages and live post verification links',
      'Creator payout logging and campaign ROI tracking in one central dashboard',
    ],
  },
  {
    id: 'ops-eod',
    category: 'tasks',
    title: 'Daily Tasks & EOD Work Reports',
    route: '/daily-tasks',
    badge: 'Accountability',
    icon: Clock,
    color: 'amber',
    summary: 'Built-in employee accountability and clear daily transparency without micro-management.',
    highlights: [
      'Daily Focus: Employees set their top morning priorities when starting work',
      'EOD Report: 60-second end-of-day summary submitted before clocking out',
      'Documents completed items, pending tasks, and blockers faced',
      'Managers review all team submissions in one consolidated daily feed',
    ],
  },
  {
    id: 'ops-sop',
    category: 'tasks',
    title: 'Standard Operating Procedures (SOPs)',
    route: '/sop',
    badge: 'Agency Playbook',
    icon: FileText,
    color: 'blue',
    summary: 'Centralized company knowledge base and verified step-by-step training playbooks.',
    highlights: [
      'Document agency processes: Ad campaign setup, brand guidelines, QA checklists',
      'New team members self-onboard fast with verified standard guides',
      'Categorized by department: Design, Copywriting, Media Buying, Development',
      'Rich text editor with checklists and external reference links',
    ],
  },

  // ── 3. Agency Finance, Billing & Accounting ────────────────────────────────
  {
    id: 'fin-cashflow',
    category: 'finance',
    title: 'Live Cashflow & Profit/Loss',
    route: '/finance',
    badge: 'PIN Protected',
    icon: TrendingUp,
    color: 'emerald',
    summary: 'Protected by a Secondary Finance PIN Gate for 100% executive financial confidentiality.',
    highlights: [
      'Shows real-time incoming revenue, total expenses, profit margin, and burn rate',
      'Client Profitability (LTV) identifies highest-profit vs. loss-making accounts',
      'Project Financials compare contracted retainer revenue against labor costs',
      'Categorize fixed expenses (rent, tools) and variable expenses (contractors)',
    ],
  },
  {
    id: 'fin-invoices',
    category: 'finance',
    title: 'GST Invoices & Payment Reminders',
    route: '/finance',
    badge: 'GST Ready',
    icon: CreditCard,
    color: 'cyan',
    summary: 'Professional GST-compliant tax invoices and automated payment tracking.',
    highlights: [
      'Automatic invoice numbering, CGST/SGST/IGST tax splits, and PDF downloads',
      'Pre-sale quotations convert to invoices in 1 click upon client approval',
      'Log payments (UPI, NEFT, Stripe, Bank Wire) with partial payment support',
      'Automated overdue reminders with ready-to-send WhatsApp & Email templates',
    ],
  },
  {
    id: 'fin-payroll',
    category: 'finance',
    title: 'Staff Payroll & SaaS Subscriptions',
    route: '/finance',
    badge: 'Cost Control',
    icon: CreditCard,
    color: 'indigo',
    summary: 'Staff compensation, freelance contractor payables, and recurring tool tracking.',
    highlights: [
      'Track monthly employee salaries, bonuses, deductions, and payout history',
      'SaaS tool tracker (Adobe, Figma, ChatGPT, SEMrush) eliminates unused subscriptions',
      'Vendor & freelance contractor ledger tracks outstanding payables',
      'Agency loan & EMI schedule tracker with interest calculations',
    ],
  },

  // ── 4. Software Development Suite ──────────────────────────────────────────
  {
    id: 'dev-suite',
    category: 'dev',
    title: 'Software Development Suite',
    route: '/development',
    badge: 'Agile Sprints',
    icon: Code,
    color: 'blue',
    summary: 'For agencies that build client web applications, mobile apps, or custom tech.',
    highlights: [
      '2-Week Agile sprint boards with story points and backlog management',
      'My Dev Tasks: Focused ticket view assigned strictly to each coder',
      'Code reviews and QA testing passes to catch bugs before shipping',
      'Release Manager for software versions, client changelogs, and deployments',
    ],
  },

  // ── 5. HR, Team Attendance & Operations ────────────────────────────────────
  {
    id: 'hr-attendance',
    category: 'hr',
    title: 'Geofenced GPS Punch Clock',
    route: '/attendance',
    badge: 'GPS Verified',
    icon: Clock,
    color: 'emerald',
    summary: 'Smart mobile check-in that verifies employees are at the office before clocking in.',
    highlights: [
      '1-Tap Clock In and Clock Out with GPS office radius verification',
      'Remote Work-From-Home (WFH) toggle for pre-approved remote staff',
      'Monthly attendance logs calculate total work hours, late check-ins, and leaves',
      'Eliminates buddy punching and manual attendance spreadsheets',
    ],
  },
  {
    id: 'hr-directory',
    category: 'hr',
    title: 'HR Management & Team Directory',
    route: '/hr',
    badge: 'Team Central',
    icon: Users,
    color: 'cyan',
    summary: 'Master employee profiles, department hierarchies, and leave approval workflows.',
    highlights: [
      'Store employee emergency contacts, joined dates, roles, and documents',
      'Department routing: Design, Copy, Performance Marketing, Tech',
      'Leave balance tracker with manager approval workflows',
      'Quick staff directory with phone and email contacts',
    ],
  },
  {
    id: 'hr-domains',
    category: 'hr',
    title: 'Domain & SSL Renewal Watchdog',
    route: '/domain-renewals',
    badge: 'Uptime Guard',
    icon: Globe,
    color: 'rose',
    summary: 'Never let a client website go down due to an expired domain or broken SSL certificate.',
    highlights: [
      'Records client domain registrars, hosting providers, and expiration dates',
      'Automated warning alerts trigger 30, 15, and 7 days before expiration',
      'SSL certificate renewal status tracker to prevent browser security warnings',
      'Protects your agency reputation from embarrassing client downtime',
    ],
  },
  {
    id: 'hr-assets',
    category: 'hr',
    title: 'Physical Asset & Studio Equipment',
    route: '/assets',
    badge: 'Asset Safe',
    icon: Laptop,
    color: 'amber',
    summary: 'Inventory custody tracking for high-value agency laptops, cameras, and gear.',
    highlights: [
      'Track company laptops, studio cameras, microphones, and monitors',
      'Know exactly which team member holds each physical device',
      'Serial numbers, purchase dates, warranty info, and condition tags',
      'Prevents loss and unaccounted hardware across remote and office teams',
    ],
  },

  // ── 6. Client Portal (Self-Service Experience) ─────────────────────────────
  {
    id: 'client-portal',
    category: 'portal',
    title: 'Client VIP Self-Service Portal',
    route: '/portal',
    badge: 'VIP Experience',
    icon: Shield,
    color: 'indigo',
    summary: 'Give clients a dedicated, branded login where they see progress without calling you.',
    highlights: [
      'Live Task Tracker: Clients see what your team is working on right now in real time',
      'Transparent Ad Spend: Clear view of Meta & Google Ads budgets and remaining balance',
      '1-Tap Creative Approvals: Review upcoming Instagram posts and approve in seconds',
      'Billing History: Download past GST tax invoices and check pending retainer dues',
    ],
  },

  // ── 7. Platform Super Admin & Multi-Tenant SaaS ────────────────────────────
  {
    id: 'saas-platform',
    category: 'saas',
    title: 'Multi-Tenant SaaS & Super Admin',
    route: '/platform',
    badge: 'Enterprise SaaS',
    icon: Zap,
    color: 'purple',
    summary: 'Self-service 14-day free trial registration and multi-agency administration.',
    highlights: [
      'Self-Service Trial: New agencies register and launch workspaces in under 2 minutes',
      'Super Admin oversight dashboard to manage agency tenants and set platform limits',
      'Strict database-level tenant isolation ensures 100% agency data privacy',
      'Audit Logs and Recycle Bin with 1-click restore for accidental deletions',
    ],
  },
];

// ── Category Filter Options ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All Features', count: 22 },
  { id: 'crm', label: 'CRM & Clients', count: 5 },
  { id: 'tasks', label: 'Tasks & Ops', count: 7 },
  { id: 'finance', label: 'Finance & Billing', count: 3 },
  { id: 'dev', label: 'Software Dev', count: 1 },
  { id: 'hr', label: 'HR & Attendance', count: 4 },
  { id: 'portal', label: 'Client Portal', count: 1 },
  { id: 'saas', label: 'SaaS & Security', count: 1 },
];

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter features based on active tab and search query
  const filteredFeatures = useMemo(() => {
    return ALL_FEATURES.filter((feature) => {
      const matchesCategory =
        activeCategory === 'all' || feature.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.highlights.some((h) =>
          h.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <PublicLayout
      ctaTitle="Ready to Run Your Agency on a Single System?"
      ctaSubtitle="Register your agency in 2 minutes. Eliminate 6+ subscriptions and give your team pure operational clarity."
    >
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/25 text-[#0d99b2] text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles size={13} className="text-[#12B7D4]" />
            <span>22 Verified Agency Capabilities</span>
          </div>

          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.15]">
            Every Feature Built For
            <span className="text-[#12B7D4] block mt-1 pb-1">
              Marketing Agency Growth.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Explore all 22 live capabilities built into RiseWithMedia OS. From inbound lead management and social media staging to GST invoicing and geofenced attendance.
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

      {/* ── 2. INTERACTIVE FEATURE EXPLORER (SEARCH + FILTER TABS) ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header & Search Bar Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Explore All Live Features
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Showing {filteredFeatures.length} of {ALL_FEATURES.length} verified platform capabilities
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search features (e.g. invoice, attendance...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12B7D4]/30 focus:border-[#12B7D4] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#12B7D4] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── 22 Features Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredFeatures.map((feat) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#12B7D4]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header: Icon & Route Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 text-[#12B7D4] flex items-center justify-center">
                        <IconComponent size={18} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {feat.route}
                      </span>
                    </div>

                    {/* Category Tag */}
                    <div className="inline-block px-2 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider mb-2">
                      {feat.badge}
                    </div>

                    {/* Feature Title */}
                    <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                      {feat.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {feat.summary}
                    </p>

                    {/* Highlights List */}
                    <ul className="space-y-2 pt-4 mt-4 border-t border-slate-100">
                      {feat.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                          <Check size={13} className="text-emerald-500 stroke-[3] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Footer Link */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Live & Verified</span>
                    </span>
                    <Link
                      to="/register-company"
                      className="text-xs font-bold text-[#12B7D4] hover:text-[#0ea5c6] flex items-center gap-1 group"
                    >
                      <span>Try Free</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
              <Search size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-800 text-sm">No capabilities match your search.</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "leads", "invoice", or "calendar".</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 px-4 py-1.5 rounded-full bg-[#12B7D4] text-white font-bold text-xs"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. ROLE-BASED WORKSPACE MATRIX ("WHO USES THIS?") ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
              Role-Based Governance
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1">
              Customized for Every Person in Your Agency
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
              Zero clutter. Each team member only sees the exact tools they need to perform their daily role, while agency founders maintain complete 360° governance.
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
                    <span>Included in Workspace</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FINAL ACTION BANNER ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
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
