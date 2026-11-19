import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Search,
  Users,
  FileText,
  Lock,
  Shield,
  Calendar,
  Clock,
  BarChart3,
  Layers,
  Smartphone,
  Code,
  CheckCircle2,
  Bell,
  CreditCard,
  TrendingUp,
  Laptop,
  Globe,
  Building2,
  Briefcase,
  Zap,
  HelpCircle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';
import SectionShowcase from '../../components/public/SectionShowcase';

// ── Master Features Database (Strictly Verified in Codebase) ───────────────────
const ALL_FEATURES = [
  // ── 1. Sales & CRM ──────────────────────────────────────────────────────────
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
      'One-click copy for usernames and masked passwords',
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

  // ── 2. Tasks & Operations ───────────────────────────────────────────────────
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
      'Priority tags (Urgent, High, Medium, Low), due dates, and checklist items',
      'Assign multiple staff members, upload creative briefs, and leave comments',
      'Instant toggle between interactive Kanban cards and compact List view',
    ],
  },
  {
    id: 'ops-manager-oversight',
    category: 'tasks',
    title: 'Manager Task Oversight',
    route: '/manager-tasks',
    badge: 'Leadership',
    icon: Shield,
    color: 'indigo',
    summary: 'Dedicated command center for agency founders and leads to unblock bottlenecks fast.',
    highlights: [
      'Filter tasks across all team members to spot overdue work instantly',
      'One-click approval workflow for items waiting for manager sign-off',
      'Reassign overloaded staff members to balance agency workload',
      'Identify recurring delays before they affect client relationships',
    ],
  },
  {
    id: 'ops-calendar',
    category: 'tasks',
    title: 'Social Media Content Calendar',
    route: '/calendar',
    badge: 'Creative Staging',
    icon: Calendar,
    color: 'violet',
    summary: 'Visual multi-platform publishing schedule for Instagram, Meta, LinkedIn, and YouTube.',
    highlights: [
      'Interactive monthly and weekly calendar view of upcoming scheduled posts',
      'Preview graphic carousels, video reels, captions, and hashtag sets',
      'Color-coded approval badges: Draft, In Review, Client Approved, Published',
      'Multi-brand switcher to manage 10+ client schedules without mix-ups',
    ],
  },
  {
    id: 'ops-smm-tracker',
    category: 'tasks',
    title: 'SMM One-Page Deliverables Tracker',
    route: '/smm',
    badge: 'Marketing Cockpit',
    icon: BarChart3,
    color: 'emerald',
    summary: 'Real-time deliverable quota counter ensuring every client gets their contracted monthly posts.',
    highlights: [
      'Monthly deliverable targets (e.g., 12 Static Posts, 8 Reels, 4 Stories, 2 Blogs)',
      'Live completed vs. pending counters for instant month-end reporting',
      'Keeps copywriters, graphic designers, and media buyers 100% aligned',
      'Eliminates client disputes over whether monthly deliverables were fulfilled',
    ],
  },
  {
    id: 'ops-influencers',
    category: 'tasks',
    title: 'Influencer Marketing Manager',
    route: '/influencers',
    badge: 'Creator Hub',
    icon: Sparkles,
    color: 'fuchsia',
    summary: 'Organize influencer outreach, barter collaborations, and sponsored campaigns in one place.',
    highlights: [
      'Creator database with follower counts, niche categories, and engagement rates',
      'Campaign pipeline tracking: Outreach → Terms Agreed → Product Sent → Live Post',
      'Record commercial rates, barter agreements, and deliverable links',
      'Centralized contact details for talent managers and content creators',
    ],
  },
  {
    id: 'ops-eod-reports',
    category: 'tasks',
    title: 'Daily Tasks & EOD Work Reports',
    route: '/daily-tasks',
    badge: 'Accountability',
    icon: Clock,
    color: 'blue',
    summary: 'Daily morning checklists and End-of-Day (EOD) work logs for effortless team accountability.',
    highlights: [
      'Morning focus: staff pick their 3-5 key priority tasks for the day',
      'Evening EOD submission: log completed tasks, blockers, and tomorrow’s plan',
      'Managers receive an aggregated daily digest without micro-managing in WhatsApp',
      'Historical performance logs for monthly reviews and appraisals',
    ],
  },
  {
    id: 'ops-sops',
    category: 'tasks',
    title: 'Standard Operating Procedures (SOPs)',
    route: '/sop',
    badge: 'Playbook',
    icon: Briefcase,
    color: 'amber',
    summary: 'Internal agency knowledge base that lets new hires self-onboard and work to your standard.',
    highlights: [
      'Step-by-step guides for Meta Ad launches, SEO audits, client kickoff calls, and design specs',
      'Searchable library categorized by Design, Marketing, Development, and Operations',
      'Preserves agency know-how so business runs smoothly even when key staff take leave',
      'Version tracking and manager review timestamps',
    ],
  },

  // ── 3. Development Suite ───────────────────────────────────────────────────
  {
    id: 'dev-suite',
    category: 'dev',
    title: 'Software Development & Agile Suite',
    route: '/development',
    badge: 'DevOps / Agile',
    icon: Code,
    color: 'sky',
    summary: 'Full agile project management for agencies building custom web apps, mobile apps, and client portals.',
    highlights: [
      'Two-week sprint management with backlog grooming and story point estimates',
      'Dedicated developer task view (/development/my-tasks) for focused code work',
      'Bug tracker, QA test passes, and code review queue (/development/qa, /development/reviews)',
      'Release management (/development/releases) to document software versions and changelogs',
    ],
  },

  // ── 4. Agency Finance & Billing ─────────────────────────────────────────────
  {
    id: 'fin-suite',
    category: 'finance',
    title: 'Agency Finance, Billing & Accounting',
    route: '/finance',
    badge: 'PIN Protected',
    icon: CreditCard,
    color: 'emerald',
    summary: 'Complete financial operating system with a secondary security PIN to keep agency numbers strictly confidential.',
    highlights: [
      'GST Tax Invoicing: automated 18% CGST/SGST tax math, client GSTIN/PAN, and 1-click PDF export',
      'Pre-sale Quotations & Estimates that convert to tax invoices in 1 click',
      'Payment tracking: log NEFT, UPI, bank wire, or online receipts with pending balance alerts',
      'Automated overdue invoice payment reminders via WhatsApp and email templates',
      'Staff Payroll & Salaries: calculate monthly payouts, bonuses, and generate salary records',
      'Recurring SaaS Tool Tracker: monitor monthly Adobe, Figma, ChatGPT, and server subscriptions',
      'Agency Loans & EMIs: track borrowed capital, interest rates, and monthly payoff schedules',
      'Client Profitability & LTV: discover your highest-margin clients and eliminate money-losers',
      'Secondary PIN Gate: financial screens automatically lock to protect privacy during screen sharing',
    ],
  },

  // ── 5. HR & Team Operations ─────────────────────────────────────────────────
  {
    id: 'hr-attendance',
    category: 'hr',
    title: 'Geofenced GPS Office Attendance',
    route: '/attendance',
    badge: 'GPS Verified',
    icon: Clock,
    color: 'cyan',
    summary: 'Smart punch clock that verifies staff are physically inside the registered office radius when clocking in.',
    highlights: [
      '1-Click Clock In / Clock Out with real-time GPS location coordinates verification',
      'Work-From-Home (WFH) mode for pre-approved remote team members',
      'Monthly attendance history tracking late arrivals, overtime, and leave days',
      'Directly feeds into monthly payroll calculations for accurate salary disbursement',
    ],
  },
  {
    id: 'hr-team-directory',
    category: 'hr',
    title: 'HR & Employee Directory',
    route: '/hr',
    badge: 'Team Central',
    icon: Users,
    color: 'indigo',
    summary: 'Centralized employee records, job roles, emergency contacts, and joining documents.',
    highlights: [
      'Department structures (Creative, Performance Marketing, Development, Client Servicing)',
      'Employee emergency phone numbers, blood group, joined date, and designations',
      'Official document storage (Aadhaar, PAN, contract agreements, offer letters)',
      'Role assignment controls (Company Admin, Project Manager, Staff, Client)',
    ],
  },
  {
    id: 'hr-domain-renewals',
    category: 'hr',
    title: 'Domain & SSL Expiry Watchdog',
    route: '/domain-renewals',
    badge: 'Zero Downtime',
    icon: Globe,
    color: 'rose',
    summary: 'Automated monitoring to ensure client website domains and SSL certificates never expire by accident.',
    highlights: [
      'Tracks registrar (GoDaddy, Namecheap, Cloudflare), DNS hosts, and expiration dates',
      'Automated alerts trigger 30, 15, and 7 days before renewal is due',
      'Assigns responsible team member to follow up with client for renewal payment',
      'Avoids catastrophic website outages and broken SSL security warnings',
    ],
  },
  {
    id: 'hr-call-history',
    category: 'hr',
    title: 'Client Call History & Meeting Logs',
    route: '/call-history',
    badge: 'Communication',
    icon: Smartphone,
    color: 'blue',
    summary: 'Detailed records of phone calls, Zoom reviews, and strategy sessions with clients.',
    highlights: [
      'Log meeting agendas, attendees, key decisions made, and follow-up deadlines',
      'Keeps whole team informed so anyone can step in during client discussions',
      'Search call history by client name or account manager',
      'Directly links calls to open tasks and active projects',
    ],
  },
  {
    id: 'hr-company-assets',
    category: 'hr',
    title: 'Hardware & Asset Management',
    route: '/assets',
    badge: 'Inventory',
    icon: Laptop,
    color: 'amber',
    summary: 'Track high-value agency hardware, laptops, cameras, microphones, and studio gear.',
    highlights: [
      'Record serial numbers, purchase prices, warranty expiry, and vendor details',
      'Assign equipment to specific employees with handover timestamps',
      'Eliminates lost cameras, missing studio lights, and untracked company laptops',
      'Depreciation and maintenance logs for company accounting',
    ],
  },

  // ── 6. Client Portal ────────────────────────────────────────────────────────
  {
    id: 'client-portal-suite',
    category: 'portal',
    title: 'Branded Client Portal (VIP Self-Service)',
    route: '/portal/tasks',
    badge: 'Client VIP',
    icon: ExternalPortalIcon,
    color: 'cyan',
    summary: 'Give clients their own branded login where they can check project progress and download invoices without calling you.',
    highlights: [
      'Live Task Tracker (/portal/tasks, /portal/tracker): clients see what is being worked on in real time',
      'Ad Budget & Spend Tracker (/portal/ad-budget): transparent reporting on Meta and Google ad spends',
      'Invoice & Billing History (/portal/invoices): clients view paid receipts and pending balances in 1 click',
      'Creative Staging Approvals: clients preview Instagram posts and 1-tap approve before publishing',
      'Custom URL structure: accessible via your agency domain (e.g., yourdomain.com/login/client-slug)',
    ],
  },

  // ── 7. Multi-Tenant SaaS Platform ───────────────────────────────────────────
  {
    id: 'platform-engine',
    category: 'security',
    title: 'Multi-Tenant SaaS Engine & 14-Day Free Trials',
    route: '/platform',
    badge: 'Super Admin',
    icon: Building2,
    color: 'indigo',
    summary: 'Built-in SaaS multi-tenancy allowing platform owners to manage multiple agency organizations from one master panel.',
    highlights: [
      'Self-service company registration (/register-company) with custom agency slug in under 2 minutes',
      'Platform requests & approval workflow (/platform/requests) for new company signups',
      'Tenant quota management: configure user seats, client limits, and module access per agency',
      'Platform analytics (/platform/analytics) monitoring active agencies and ecosystem growth',
      'Strict database-level tenant isolation: no agency can ever see another company’s records',
    ],
  },
  {
    id: 'security-governance',
    category: 'security',
    title: 'Audit Logs & 1-Click Recycle Bin Recovery',
    route: '/audit-logs',
    badge: 'Enterprise Safe',
    icon: Shield,
    color: 'emerald',
    summary: 'Complete compliance history and accidental deletion protection so vital agency records are never lost.',
    highlights: [
      'Audit Logs (/audit-logs): full timestamped record of who created, edited, or deleted any item',
      'Recycle Bin (/recycle-bin): soft-delete protection with 1-click restore for deleted clients, tasks, or leads',
      'PWA Mobile Install: installable directly to Android and iPhone home screens like a native mobile app',
      'Dual-theme engine: smooth Day / Dark mode toggle for comfortable working day or night',
    ],
  },
];

// Helper icon component
function ExternalPortalIcon(props) {
  return <Globe {...props} />;
}

// ── Categories List ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All Features', count: ALL_FEATURES.length },
  { id: 'crm', label: 'CRM & Clients', count: ALL_FEATURES.filter(f => f.category === 'crm').length },
  { id: 'tasks', label: 'Tasks & Ops', count: ALL_FEATURES.filter(f => f.category === 'tasks').length },
  { id: 'finance', label: 'Finance & Billing', count: ALL_FEATURES.filter(f => f.category === 'finance').length },
  { id: 'dev', label: 'Software Dev', count: ALL_FEATURES.filter(f => f.category === 'dev').length },
  { id: 'hr', label: 'HR & Attendance', count: ALL_FEATURES.filter(f => f.category === 'hr').length },
  { id: 'portal', label: 'Client Portal', count: ALL_FEATURES.filter(f => f.category === 'portal').length },
  { id: 'security', label: 'SaaS & Security', count: ALL_FEATURES.filter(f => f.category === 'security').length },
];

// ── Role Personas Matrix ──────────────────────────────────────────────────────
const ROLES_MATRIX = [
  {
    role: 'Agency Founder / CEO',
    tag: 'Total Clarity',
    desc: 'Owns agency profitability, client retention, and company-wide growth.',
    features: [
      'Real-time Profit & Loss and revenue cashflow dashboards',
      'High-level manager task oversight and bottleneck alerts',
      'Monthly staff payroll calculation and team attendance logs',
      'Encrypted client credentials vault and company asset inventory',
    ],
  },
  {
    role: 'Project Manager / Lead',
    tag: 'Smooth Delivery',
    desc: 'Keeps team members productive, unblocked, and delivering to client standards.',
    features: [
      'Drag-and-drop Kanban task boards with due date priority filters',
      'Social media content calendar staging and creative review queues',
      'SMM monthly deliverable quota counter (posts, reels, blogs)',
      'Daily team task check-ins and End-of-Day (EOD) work reports',
    ],
  },
  {
    role: 'Creative / Staff Member',
    tag: 'Daily Focus',
    desc: 'Designers, copywriters, media buyers, and developers executing everyday work.',
    features: [
      'Clean personal daily task focus checklist without noisy notifications',
      '1-Click GPS office attendance check-in / check-out on mobile',
      'Quick creative file uploads and hashtag set staging for review',
      'Submit daily EOD reports in 60 seconds before clocking out',
    ],
  },
  {
    role: 'Paying Agency Client',
    tag: 'VIP Experience',
    desc: 'Your clients who want transparency without endless email back-and-forth.',
    features: [
      'Private branded portal login under your agency’s custom domain',
      'Real-time task progress tracker and deliverable milestones',
      'Transparent Meta Ads & Google Ads budget spend monitoring',
      '1-Tap creative sign-offs and instant GST invoice PDF downloads',
    ],
  },
];

// ── Tools Replaced Comparison ─────────────────────────────────────────────────
const TOOLS_REPLACED = [
  { tool: 'HubSpot / Pipedrive', cost: '$50+/mo', replacedBy: 'Leads CRM & Digital Proposals' },
  { tool: 'Trello / Asana / ClickUp', cost: '$30+/mo', replacedBy: 'Kanban Tasks & Manager Oversight' },
  { tool: 'QuickBooks / Zoho Books', cost: '$40+/mo', replacedBy: 'GST Invoices, Payroll & Expenses' },
  { tool: 'Spreadsheets & WhatsApp', cost: 'Chaos & Lost Deals', replacedBy: 'SMM Tracker & Content Calendar' },
  { tool: 'Clockify / Keka Attendance', cost: '$25+/mo', replacedBy: 'GPS Geofenced Mobile Punch Clock' },
  { tool: 'DashThis / AgencyAnalytics', cost: '$70+/mo', replacedBy: 'Self-Service Client Portal' },
];

export const CapabilitiesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter features by category and search term
  const filteredFeatures = useMemo(() => {
    return ALL_FEATURES.filter((feat) => {
      const matchesCategory = selectedCategory === 'all' || feat.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        feat.title.toLowerCase().includes(q) ||
        feat.summary.toLowerCase().includes(q) ||
        feat.route.toLowerCase().includes(q) ||
        feat.highlights.some((h) => h.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
            RiseWithMedia OS — Complete Feature Guide
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

      {/* ── 2. TOOLS REPLACED BANNER (WHY AGENCIES CHOOSE US) ── */}
      <section className="bg-slate-50/70 border-b border-slate-200/80 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              The Agency Advantage
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              Replaces 6–8 Disconnected Subscriptions with 1 Unified Operating System
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TOOLS_REPLACED.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-rose-500 line-through block">
                    {item.tool}
                  </span>
                  <span className="text-xs font-black text-slate-800 mt-1 block leading-snug">
                    {item.replacedBy}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 mt-2 block">
                  ✓ Built-in
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. INTERACTIVE FEATURE BROWSER & SEARCH ── */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Search & Category Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-8 border-b border-slate-200/80">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Explore All Live Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Showing {filteredFeatures.length} of {ALL_FEATURES.length} verified platform capabilities
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features (e.g. invoice, attendance, vault)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12B7D4]/30 focus:border-[#12B7D4] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-4 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#12B7D4] text-white shadow-sm shadow-[#12B7D4]/25'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {filteredFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#12B7D4]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Icon & In-App Route Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={22} className="stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                      {feat.route}
                    </span>
                  </div>

                  {/* Title & Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight leading-snug">
                    {feat.title}
                  </h3>

                  {/* Human-Readable Summary */}
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2 pb-4 border-b border-slate-100">
                    {feat.summary}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="space-y-2 pt-4">
                    {feat.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                        <Check size={14} className="text-emerald-500 stroke-[3] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Live in Web App</span>
                  </span>
                  <Link
                    to="/register-company"
                    className="text-xs font-bold text-[#12B7D4] hover:text-[#0ea5c6] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Try Feature</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="py-16 text-center">
            <HelpCircle size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No features found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for "leads", "invoice", "attendance", or "calendar".</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ── 4. ROLE-BASED WORKSPACE MATRIX ("WHO USES THIS?") ── */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
              Role-Based Experience
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1">
              Customized for Every Person in Your Agency
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
              No clutter. Team members only see the exact tools they need to do their best work, while founders maintain full 360° governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES_MATRIX.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between"
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

                  <ul className="space-y-2.5 pt-4">
                    {item.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                        <Check size={14} className="text-[#12B7D4] stroke-[3] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400">
                    Role-Based Access Control
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. ORIGINAL SMARTPHONE SHOWCASE SECTIONS (PRESERVED & ENHANCED) ── */}
      <div className="py-12 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12 sm:space-y-20">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
            Visual Mobile First
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
            Designed for Real Agency Execution
          </h2>
        </div>

        {/* Showcase 01: Client & Deal Tracker */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center pb-10 sm:pb-14 border-b border-slate-100">
            <div className="lg:col-span-7 space-y-3.5 text-left">
              <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                Manage Every Client and Deal
                <span className="text-[#12B7D4] block mt-1 pb-0.5">
                  Without Spreadsheet Clutter.
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Stage Tracking</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Follow deals from new lead inquiry to signed retainer agreement.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Account Details</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Store client phone numbers, GSTIN, addresses, and contacts.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <SectionShowcase type="leads" />
            </div>
          </div>
        </ScrollReveal>

        {/* Showcase 02: Social Media Calendar */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center pb-10 sm:pb-14 border-b border-slate-100">
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <SectionShowcase type="calendar" />
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-3.5 text-left">
              <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                Visual Agency Schedule for
                <span className="text-[#12B7D4] block mt-1 pb-0.5">
                  Posts, Reels, and Carousels.
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Calendar Overview</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Group scheduled reels, carousel posts, and stories by posting date.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Approval Statuses</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Spot which posts are in review, approved, or pending revisions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Showcase 03: Fast GST Invoicing */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-3.5 text-left">
              <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[38px] text-slate-950 tracking-tight leading-[1.2]">
                Tax Invoices Created in Seconds
                <span className="text-[#12B7D4] block mt-1 pb-0.5">
                  With 1-Click PDF Generation.
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Automated Tax Math</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">CGST (9%) and SGST (9%) are calculated automatically.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Payment Status Tags</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Know which client bills are fully paid, partial, or overdue.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <SectionShowcase type="billing" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </PublicLayout>
  );
};

export default CapabilitiesPage;
