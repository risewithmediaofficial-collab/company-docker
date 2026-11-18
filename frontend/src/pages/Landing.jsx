import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  Users2,
  Clock,
  Shield,
  Globe,
  FileText,
  Sparkles,
  Layers,
  TrendingUp,
  Kanban,
  MapPin,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Lock,
  Compass,
  Check,
  Menu,
  X,
  Radio,
  BarChart3,
  Sliders,
  DollarSign
} from 'lucide-react';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('crm');

  // Interactive Hero Preview Modules
  const demoModules = {
    crm: {
      badge: 'Lead & Client CRM',
      title: 'Visual Lead Conversion & Client Vault',
      desc: 'Track every inquiry from WhatsApp, Meta Ads, and web referrals into a synchronized deal pipeline.',
      kpis: [
        { label: 'Active Leads', val: '142', change: '+18% this mo' },
        { label: 'Conversion Rate', val: '34.6%', change: 'Top tier' },
        { label: 'Pipeline Value', val: '₹18.4L', change: 'Open deals' },
      ],
      sampleRows: [
        { name: 'Aura Luxe Studios', stage: 'Proposal Sent', owner: 'Dinesh M', value: '₹1,80,000' },
        { name: 'Solublix Technologies', stage: 'Qualified', owner: 'Priya R', value: '₹3,20,000' },
        { name: 'Apex Media Global', stage: 'Contract Signed', owner: 'Rajesh K', value: '₹4,50,000' },
      ],
    },
    tasks: {
      badge: 'Deliverables & Kanban',
      title: 'Agile Tasks, Sprints & Content Calendar',
      desc: 'Keep design, social media, and dev deliverables on schedule with automated deadlines and status tracking.',
      kpis: [
        { label: 'Sprints Active', val: '6', change: 'On schedule' },
        { label: 'Deliverables Done', val: '94.2%', change: '+6% velocity' },
        { label: 'Daily EOD Reports', val: '28/28', change: '100% logged' },
      ],
      sampleRows: [
        { name: 'Brand Identity Overhaul', stage: 'In Review', owner: 'Design Team', value: 'Due Tomorrow' },
        { name: 'Q4 Performance Ads Batch', stage: 'Production', owner: 'Media Team', value: 'In Progress' },
        { name: 'Client Approval Flow', stage: 'Completed', owner: 'Lead Strategist', value: 'Signed Off' },
      ],
    },
    finance: {
      badge: 'Financial Suite',
      title: 'Invoices, Quotations & 12-Month Cashflow',
      desc: 'Automated billing, GST compliant invoicing, recurring retainer management, and live cash forecasting.',
      kpis: [
        { label: 'Collected Revenue', val: '₹24.8L', change: '+22% YoY' },
        { label: 'Pending Invoices', val: '₹3.1L', change: 'Due in 7d' },
        { label: 'Net Profit Margin', val: '41.2%', change: 'Healthy' },
      ],
      sampleRows: [
        { name: 'INV-2026-089 (Solublix)', stage: 'Paid', owner: 'Online Gateway', value: '₹1,50,000' },
        { name: 'INV-2026-090 (Aura Luxe)', stage: 'Pending', owner: 'Net 15 Days', value: '₹85,000' },
        { name: 'Q4 Retainer Collection', stage: 'Scheduled', owner: 'Bank Transfer', value: '₹2,20,000' },
      ],
    },
    attendance: {
      badge: 'Smart Attendance',
      title: 'GPS Geofencing & Multi-Branch Teams',
      desc: 'Verify office attendance via GPS coordinates, monitor check-in times, and coordinate multiple branch offices.',
      kpis: [
        { label: 'Active Branches', val: '4 Locations', change: 'HQ + 3 Hubs' },
        { label: 'On-Time Check-In', val: '98.1%', change: 'Strict geofence' },
        { label: 'Active Staff', val: '48 Members', change: 'Checked in' },
      ],
      sampleRows: [
        { name: 'Hosur HQ Corporate Office', stage: 'Radius: 0.5km', owner: '24 Staff Active', value: 'GPS Locked' },
        { name: 'Bangalore Tech Center', stage: 'Radius: 0.8km', owner: '16 Staff Active', value: 'GPS Locked' },
        { name: 'Chennai Media Branch', stage: 'Radius: 0.5km', owner: '8 Staff Active', value: 'GPS Locked' },
      ],
    },
    portal: {
      badge: 'Transparent Client Portal',
      title: 'Dedicated Client Approvals & Live View',
      desc: 'Empower clients with their own portal to review deliverables, inspect tasks, and view paid invoices in real time.',
      kpis: [
        { label: 'Portal Adoption', val: '96%', change: 'Zero email clutter' },
        { label: 'Avg Approval Time', val: '1.4 hrs', change: '-70% faster' },
        { label: 'Client Satisfaction', val: '4.9/5', change: 'Verified' },
      ],
      sampleRows: [
        { name: 'Campaign Deliverable Approval', stage: 'Approved by Client', owner: 'Brand Lead', value: 'Instant Access' },
        { name: 'Monthly Performance Report', stage: 'Viewed', owner: 'Automated Sync', value: 'Live Metrics' },
        { name: 'GST Invoice Download', stage: 'Available', owner: 'Finance Portal', value: '1-Click PDF' },
      ],
    },
  };

  const currentPreview = demoModules[activeTab];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#12B7D4]/20 selection:text-slate-900 relative overflow-x-hidden">
      
      {/* ── Background Abstract Blue Shapes & Grids ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle geometric dot grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.28]" 
          style={{
            backgroundImage: 'radial-gradient(#12B7D4 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Top Glow Orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[460px] bg-gradient-to-b from-[#12B7D4]/18 via-[#0284c7]/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-96 -left-48 w-[480px] h-[480px] bg-[#12B7D4]/10 rounded-full blur-3xl" />
        <div className="absolute top-[1200px] -right-40 w-[540px] h-[540px] bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-[600px] h-[400px] bg-[#12B7D4]/10 rounded-full blur-3xl" />
      </div>

      {/* ── Sticky Minimal Glass Navigation ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Brand Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/branding/rise-with-media-logo.png"
                alt="RiseWithMedia Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-tight text-slate-900 group-hover:text-[#12B7D4] transition-colors">
                RiseWithMedia
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-0.5">
                Agency & Enterprise OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
          </nav>

          {/* Action Buttons: Login + Register */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Login</span>
              <ArrowRight size={14} className="text-[#12B7D4]" />
            </Link>

            <Link
              to="/register-company"
              className="px-4 py-2 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-sm font-bold shadow-sm shadow-[#12B7D4]/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Register Organization</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-[#12B7D4] text-white text-xs font-bold"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3"
            >
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-1"
              >
                About
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-1"
              >
                Capabilities
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-1"
              >
                Workflow
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-1"
              >
                Architecture
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-800"
                >
                  Sign In to Workspace
                </Link>
                <Link
                  to="/register-company"
                  className="w-full text-center py-2.5 rounded-xl bg-[#12B7D4] text-white font-bold text-sm shadow-sm"
                >
                  Register Organization
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Subtle Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase font-sans">
              Next-Gen Multi-Tenant Agency Operations & CRM
            </span>
          </motion.div>

          {/* Crisp Main Headline (Title Font: Outfit) */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight leading-[1.12]"
          >
            Unified Operations.{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] to-[#0284c7] bg-clip-text text-transparent">
              One Central Platform.
            </span>
          </motion.h1>

          {/* Concise Subtitle (Body Font: Plus Jakarta Sans) */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto"
          >
            RiseWithMedia unifies client pipelines, task sprints, financial forecasting, and GPS geofenced attendance into one seamless workspace built for growing agencies and teams.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Launch Workspace / Login</span>
              <ArrowRight size={16} className="text-[#12B7D4] group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register-company"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 size={16} className="text-slate-500" />
              <span>Register New Company</span>
            </Link>
          </motion.div>

          {/* Quick trust metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 pt-3"
          >
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#12B7D4] stroke-[3]" /> Multi-Tenant Data Isolation
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#12B7D4] stroke-[3]" /> Dedicated Subdomain Portals
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#12B7D4] stroke-[3]" /> Role-Based Access Controls
            </span>
          </motion.div>
        </div>

        {/* ── Interactive Live Feature Showcase ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 sm:mt-16 max-w-5xl mx-auto"
        >
          {/* Card Frame with Blue Glow Accent */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-7 shadow-xl shadow-[#12B7D4]/5 space-y-6">
            
            {/* Tab Selectors */}
            <div className="flex gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
              {[
                { id: 'crm', label: 'CRM & Deals', icon: Users2 },
                { id: 'tasks', label: 'Tasks & Sprints', icon: Kanban },
                { id: 'finance', label: 'Finance & Invoices', icon: DollarSign },
                { id: 'attendance', label: 'GPS Attendance', icon: MapPin },
                { id: 'portal', label: 'Client Portal', icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-[#12B7D4]' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Showcase Body */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#12B7D4] block mb-1">
                    {currentPreview.badge}
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    {currentPreview.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                    {currentPreview.desc}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Explore in App</span>
                  <ChevronRight size={14} className="text-[#12B7D4]" />
                </Link>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentPreview.kpis.map((kpi, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <span className="text-xs font-semibold text-slate-500 block">{kpi.label}</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-display text-2xl font-black text-slate-900">{kpi.val}</span>
                      <span className="text-[11px] font-bold text-emerald-600">{kpi.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table / List Simulation */}
              <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/70 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Record / Deliverable</span>
                  <span>Status / Phase</span>
                  <span className="hidden sm:inline">Owner / Team</span>
                  <span>Value / Schedule</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {currentPreview.sampleRows.map((row, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-2.5 font-bold text-slate-900">
                        <div className="w-2 h-2 rounded-full bg-[#12B7D4]" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{row.name}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                        {row.stage}
                      </span>
                      <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                        {row.owner}
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </section>

      {/* ── SECTION: ABOUT THE SOFTWARE ── */}
      <section id="about" className="relative z-10 py-16 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12B7D4] block">
              About The Software
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-950 tracking-tight">
              Built for High-Velocity Agencies & Multi-Branch Teams
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-sans">
              Traditional CRMs are either too generic or fragmented across half a dozen tools. RiseWithMedia brings the entire operational lifecycle into one coherent system.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#12B7D4]/10 border border-[#12B7D4]/20 flex items-center justify-center text-[#12B7D4]">
                <Layers size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Eliminate Tool Fragmentation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Replace separated spreadsheets, disparate invoice software, messaging channels, and punch-clock apps with a single, synchronized platform.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#12B7D4]/10 border border-[#12B7D4]/20 flex items-center justify-center text-[#12B7D4]">
                <Building2 size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Multi-Tenant Enterprise Security
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Each company operates in its own isolated workspace. Custom slug URLs ensure brand exclusivity with granular role-based permissions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#12B7D4]/10 border border-[#12B7D4]/20 flex items-center justify-center text-[#12B7D4]">
                <Radio size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Transparent Client Experience
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Provide client stakeholders with dedicated portals to review deliverables, verify milestone completion, and download invoices in real time.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION: WHAT IT DOES (CAPABILITIES) ── */}
      <section id="features" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12B7D4] block">
            What It Does
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-950 tracking-tight">
            Comprehensive Capabilities, Zero Clutter
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-sans">
            Every module is tailored to solve daily friction points in agency workflows and company scaling.
          </p>
        </div>

        {/* 6 Crisp Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Lead CRM */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#12B7D4]/40 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <Users2 size={20} />
            </div>
            <h4 className="font-display font-bold text-base text-slate-900">
              Lead & Client CRM
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Capture leads from marketing channels, nurture through visual stages, record call histories, and store critical credentials in the Client Vault.
            </p>
          </div>

          {/* Card 2: Tasks & Sprints */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#12B7D4]/40 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#12B7D4]/10 border border-[#12B7D4]/20 flex items-center justify-center text-[#12B7D4] group-hover:scale-105 transition-transform">
              <Kanban size={20} />
            </div>
            <h4 className="font-display font-bold text-base text-slate-900">
              Task Sprints & Kanban
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Organize projects into sprints and boards. Assign tasks, track progress in real-time, and log daily End-of-Day (EOD) work reports automatically.
            </p>
          </div>

          {/* Card 3: Financial Suite */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#12B7D4]/40 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <CreditCard size={20} />
            </div>
            <h4 className="font-display font-bold text-base text-slate-900">
              Invoices & Cashflow Forecasting
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Draft professional tax quotations and invoices, track operating expenditures, manage company loans, and forecast upcoming collections.
            </p>
          </div>

          {/* Card 4: Client Portal */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#12B7D4]/40 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-105 transition-transform">
              <Globe size={20} />
            </div>
            <h4 className="font-display font-bold text-base text-slate-900">
              Branded Client Portal
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Give clients an exclusive portal with secure login. Allow them to review deliverables, provide approval stamps, and download billing history.
            </p>
          </div>

          {/* Card 5: Geofenced Attendance */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#12B7D4]/40 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <MapPin size={20} />
            </div>
            <h4 className="font-display font-bold text-base text-slate-900">
              GPS Geofenced Attendance
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Define physical branch locations with strict GPS radius boundaries. Staff can punch in/out only when physically on-site with automatic logs.
            </p>
          </div>

          {/* Card 6: Multi-Branch & Super Admin */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#12B7D4]/40 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <Shield size={20} />
            </div>
            <h4 className="font-display font-bold text-base text-slate-900">
              Multi-Branch & Role Permissions
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Super Admin console to approve tenants, manage branches, assign branch managers, and enforce strict RBAC permissions across all operations.
            </p>
          </div>

        </div>

      </section>

      {/* ── SECTION: WORKFLOW IN 3 STEPS ── */}
      <section id="workflow" className="relative z-10 py-16 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12B7D4] block">
              How It Works
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-950 tracking-tight">
              Up and Running in 3 Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-sans">
              No lengthy enterprise rollout required. Get your entire team and client roster onboarded smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="text-3xl font-display font-black text-[#12B7D4]">01</div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Register Your Company
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Choose your organization slug, owner credentials, and company info. Instant isolation and portal URL generated automatically.
              </p>
              <Link
                to="/register-company"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#12B7D4] hover:underline pt-1"
              >
                <span>Register company</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="text-3xl font-display font-black text-[#12B7D4]">02</div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Configure Branches & Invite Team
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Add headquarters and regional branch locations, capture GPS coordinates for attendance, and assign role-based accounts to your staff.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="text-3xl font-display font-black text-[#12B7D4]">03</div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Manage Operations & Clients
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Streamline client deliveries, log EOD daily reports, automate invoices, and provide clients with live transparency.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#12B7D4] hover:underline pt-1"
              >
                <span>Sign in to dashboard</span>
                <ChevronRight size={13} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION: ARCHITECTURE & SECURITY ── */}
      <section id="architecture" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
          
          {/* Subtle Ambient Blueprint Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#12B7D4]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-wider text-[#12B7D4] uppercase">
                Enterprise Infrastructure
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight">
                Designed for Multi-Company Scale & High Availability
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed">
                Built with MongoDB multi-tenancy partitioning, granular RBAC session authentication, real-time WebSockets, and encrypted vault storage.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border border-slate-800 bg-slate-800/40 rounded-2xl p-4">
                  <span className="font-display font-black text-2xl text-[#12B7D4]">100%</span>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Isolated Tenant Data</p>
                </div>
                <div className="border border-slate-800 bg-slate-800/40 rounded-2xl p-4">
                  <span className="font-display font-black text-2xl text-[#12B7D4]">&lt; 100ms</span>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Fast API Latency</p>
                </div>
              </div>
            </div>

            {/* Architecture checklist */}
            <div className="space-y-3.5 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8 pt-6 lg:pt-0">
              {[
                { title: 'Isolated Company Slugs', desc: 'Custom dedicated URLs for each registered organization.' },
                { title: 'Granular Access Levels', desc: 'SuperAdmin, Admin, Manager, Staff, and Client role gates.' },
                { title: 'Audited Activity Logs', desc: 'Immutable timeline tracking all sensitive actions.' },
                { title: 'Stealth Live View Mode', desc: 'Admins can inspect tenant experiences without credential sharing.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#12B7D4]/20 text-[#12B7D4] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-sm text-slate-200">{item.title}</h5>
                    <p className="text-xs text-slate-400 font-sans">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section className="relative z-10 pb-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-8 sm:p-14 text-center border border-slate-800 overflow-hidden shadow-2xl">
          
          {/* Blue abstract background orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#12B7D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12B7D4] block">
              Ready to Modernize Your Operations?
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-white">
              Launch Your Company Workspace in Seconds
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-sans max-w-lg mx-auto">
              Access all agency modules, invite your team, and provide clients with a premium portal experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm shadow-lg shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Account</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/register-company"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 size={16} className="text-[#12B7D4]" />
                <span>Register New Organization</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 bg-white border-t border-slate-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 overflow-hidden">
              <img
                src="/branding/rise-with-media-logo.png"
                alt="RiseWithMedia Logo"
                className="h-full w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-slate-900 block">
                RiseWithMedia Enterprise CRM
              </span>
              <span className="text-xs text-slate-500 font-sans">
                Unified Operations, CRM & Financial Management OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/login" className="hover:text-slate-900 transition-colors">
              Login
            </Link>
            <Link to="/register-company" className="hover:text-slate-900 transition-colors">
              Register Organization
            </Link>
            <Link to="/platform" className="hover:text-slate-900 transition-colors">
              Super Admin
            </Link>
          </div>

          <div className="text-xs text-slate-400 font-sans">
            &copy; {new Date().getFullYear()} RiseWithMedia. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
