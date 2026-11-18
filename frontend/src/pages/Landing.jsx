import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users2,
  Globe,
  Kanban,
  MapPin,
  CreditCard,
  Shield,
  ChevronRight,
  Building2,
  Sparkles,
  Layers
} from 'lucide-react';

// Reusable Wave Accent Card conforming strictly to user's specified design
const FeatureCard = ({ title, subText, icon: Icon, badge, linkTo = "/login", waveFill = "#12B7D430" }) => {
  return (
    <Link
      to={linkTo}
      className="group relative overflow-hidden bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3.5 transition-all duration-200 hover:border-[#12B7D4] hover:shadow-md cursor-pointer"
      style={{
        boxShadow: 'rgba(149, 157, 165, 0.08) 0px 4px 16px',
      }}
    >
      {/* Abstract Wave SVG (Rotated on the left edge as specified) */}
      <svg
        className="wave pointer-events-none absolute"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: 'rotate(90deg)',
          left: '-32px',
          top: '32px',
          width: '88px',
          fill: waveFill,
        }}
      >
        <path
          d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
          fillOpacity={1}
        />
      </svg>

      {/* Circular Icon Container */}
      <div className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#12B7D4]/12 flex items-center justify-center text-[#12B7D4] shrink-0 group-hover:scale-105 transition-transform">
        <Icon size={20} />
      </div>

      {/* Message Text Container */}
      <div className="relative z-10 flex flex-col justify-center items-start flex-grow min-w-0">
        <p className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#12B7D4] transition-colors truncate w-full">
          {title}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 font-medium truncate w-full mt-0.5">
          {subText}
        </p>
      </div>

      {/* Right Badge / Arrow */}
      <div className="relative z-10 flex items-center gap-1.5 shrink-0">
        {badge && (
          <span className="text-xs font-bold text-[#12B7D4] bg-[#12B7D4]/10 border border-[#12B7D4]/20 px-2.5 py-1 rounded-md hidden sm:inline-block">
            {badge}
          </span>
        )}
        <ChevronRight size={18} className="text-slate-400 group-hover:text-[#12B7D4] group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#12B7D4]/25 selection:text-slate-900 relative overflow-x-hidden antialiased">
      
      {/* ── TOP PATTERN (Dual Gradient & Vertical Grid Mask) ── */}
      <div className="absolute inset-x-0 top-0 h-[720px] sm:h-[860px] pointer-events-none overflow-hidden z-0">
        <div
          className="w-full h-full relative"
          style={{
            background:
              'linear-gradient(to bottom, #fff 0%, #fff 40%, rgba(255, 255, 255, 0) 100%), linear-gradient(to right, #0ed2da, #5f29c7)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(90deg, #ccc 1px, transparent 1px)',
              backgroundSize: '50px 100%',
              maskImage:
                'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 70%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 70%)',
            }}
          />
        </div>
      </div>

      {/* ── AMBIENT BLUE GRADIENT SIDE PATCHES (Minimalist framing glows) ── */}
      <div className="fixed top-1/4 -left-40 w-80 sm:w-96 h-[600px] bg-gradient-to-r from-[#12B7D4]/20 via-[#0ed2da]/10 to-transparent rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-80 sm:w-96 h-[600px] bg-gradient-to-l from-[#5f29c7]/18 via-[#12B7D4]/12 to-transparent rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed top-2/3 -left-32 w-72 h-[450px] bg-gradient-to-r from-[#0284c7]/14 via-[#12B7D4]/8 to-transparent rounded-full blur-[90px] pointer-events-none z-0" />
      <div className="fixed top-3/4 -right-32 w-72 h-[450px] bg-gradient-to-l from-[#12B7D4]/15 via-sky-400/8 to-transparent rounded-full blur-[90px] pointer-events-none z-0" />

      {/* ── FIXED NAVIGATION BAR (Spacious & Minimal) ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 sm:h-22 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all flex items-center shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1.5 overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/branding/rise-with-media-logo.png"
                alt="RiseWithMedia Logo"
                className="h-full w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg sm:text-2xl text-slate-950 tracking-tight group-hover:text-[#12B7D4] transition-colors leading-tight">
                RiseWithMedia
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block -mt-0.5">
                Digital Marketing OS
              </span>
            </div>
          </Link>

          {/* Minimal Navigation Links (All anchor directly on this single page) */}
          <nav className="hidden md:flex items-center gap-9 text-sm font-bold text-slate-600">
            <a href="#about" className="hover:text-slate-950 transition-colors">About</a>
            <a href="#capabilities" className="hover:text-slate-950 transition-colors">Capabilities</a>
            <a href="#metrics" className="hover:text-slate-950 transition-colors">Metrics</a>
          </nav>

          {/* Action Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all px-4 py-2 rounded-full"
            >
              Sign In
            </Link>
            <Link
              to="/register-company"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs sm:text-sm font-black shadow-md shadow-[#12B7D4]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </header>

      {/* ── HERO SECTION (Mobile: Left-Aligned, Desktop: Center-Aligned) ── */}
      <section className="relative z-10 pt-36 sm:pt-44 pb-14 sm:pb-20 px-5 sm:px-8 max-w-5xl mx-auto text-left sm:text-center">
        
        {/* Apple Style Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 mb-6 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
            Agency & Enterprise Operating System
          </span>
        </div>

        {/* Big Crisp Title (Enlarged for High Readability) */}
        <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl text-slate-950 tracking-tight leading-[1.04]">
          Digital Marketing
        </h1>
        <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl text-[#12B7D4] tracking-tight leading-[1.04] mt-1 sm:mt-2">
          End-to-End.
        </h1>

        {/* Tagline - Enlarged, Crisp & Direct */}
        <p className="mt-5 text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
          Campaigns. Clients. Conversions. Cashflow.
        </p>

        {/* Action Buttons (Mobile: Left/Full width, Desktop: Center) */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
          <Link
            to="/login"
            className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/register-company"
            className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center"
          >
            Register Agency
          </Link>
        </div>

      </section>

      {/* ── HIGHLIGHT ABOUT SOFTWARE (Mobile: Left-Aligned, Desktop: Center-Aligned) ── */}
      <section id="about" className="relative z-10 py-10 sm:py-16 max-w-5xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="text-left sm:text-center max-w-2xl mx-auto space-y-2 mb-9">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#12B7D4] block">
            What is RiseWithMedia?
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-tight">
            One Hub Replacing 5 Fragmented Tools.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Everything your agency needs in one clear, understandable flow.
          </p>
        </div>

        {/* 3 Crisp Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          
          <div className="bg-white/95 border border-slate-200/90 rounded-xl p-5 space-y-2.5 shadow-xs hover:border-[#12B7D4]/50 transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-black text-sm">
              01
            </div>
            <h4 className="font-display font-bold text-base sm:text-lg text-slate-950">
              No More Tool Sprawl
            </h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Replace messy WhatsApp chats, scattered Excel files, and external billing with one central agency dashboard.
            </p>
            <span className="inline-block text-xs font-bold text-[#12B7D4] bg-[#12B7D4]/10 px-2.5 py-1 rounded">
              5-in-1 Platform
            </span>
          </div>

          <div className="bg-white/95 border border-slate-200/90 rounded-xl p-5 space-y-2.5 shadow-xs hover:border-[#12B7D4]/50 transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-black text-sm">
              02
            </div>
            <h4 className="font-display font-bold text-base sm:text-lg text-slate-950">
              Live Client Portal
            </h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Clients review creative deliverables, approve posts, and download GST invoices in real time with zero email lag.
            </p>
            <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
              Zero Email Clutter
            </span>
          </div>

          <div className="bg-white/95 border border-slate-200/90 rounded-xl p-5 space-y-2.5 shadow-xs hover:border-[#12B7D4]/50 transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center font-black text-sm">
              03
            </div>
            <h4 className="font-display font-bold text-base sm:text-lg text-slate-950">
              100% Private Workspace
            </h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Every agency gets its own isolated database space, custom company slug URL, and strict role permissions.
            </p>
            <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
              Enterprise Secure
            </span>
          </div>

        </div>

        {/* 1-Line Lifecycle Strip */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-wrap items-center justify-around gap-2 text-xs sm:text-sm font-extrabold text-slate-800 text-center">
          <span className="flex items-center gap-1.5 text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-[#12B7D4]" />
            Inbound Leads
          </span>
          <span className="text-slate-400">→</span>
          <span className="flex items-center gap-1.5 text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            Deliverables & Sprints
          </span>
          <span className="text-slate-400">→</span>
          <span className="flex items-center gap-1.5 text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Client Sign-off
          </span>
          <span className="text-slate-400">→</span>
          <span className="flex items-center gap-1.5 text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            GST Invoicing
          </span>
        </div>

      </section>

      {/* ── CORE CAPABILITIES (Cards styled strictly with user's design) ── */}
      <section id="capabilities" className="relative z-10 py-10 sm:py-14 max-w-5xl mx-auto px-5 sm:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 mb-7 gap-2">
          <div className="text-left">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
              Core Modules
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              Click any module to launch workspace
            </p>
          </div>
          <Link to="/login" className="self-start sm:self-auto text-sm font-bold text-[#12B7D4] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* The 6 Feature Cards using the User's Wave Card Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <FeatureCard
            title="Meta & WhatsApp Inbound"
            subText="Zero lead dropoff. Automated routing."
            icon={Users2}
            badge="Leads"
            waveFill="#12B7D425"
          />

          <FeatureCard
            title="Content Calendar & SMM"
            subText="One-page deliverable & influencer tracker."
            icon={Kanban}
            badge="Creative"
            waveFill="#0ea5c625"
          />

          <FeatureCard
            title="Live Client Portal"
            subText="Real-time approvals & ghost stealth view."
            icon={Globe}
            badge="Client"
            waveFill="#38bdf825"
          />

          <FeatureCard
            title="Automated GST & Invoices"
            subText="GST-compliant billing & 12-month cash forecast."
            icon={CreditCard}
            badge="Finance"
            waveFill="#0284c725"
          />

          <FeatureCard
            title="GPS Geofenced Attendance"
            subText="Multi-branch check-in with 0.5km precision lock."
            icon={MapPin}
            badge="Operations"
            waveFill="#12B7D425"
          />

          <FeatureCard
            title="Multi-Tenant Architecture"
            subText="Dedicated company URLs & granular RBAC."
            icon={Shield}
            badge="Enterprise"
            waveFill="#06b6d425"
          />
        </div>

      </section>

      {/* ── METRICS STRIP ── */}
      <section id="metrics" className="relative z-10 py-10 sm:py-16 max-w-5xl mx-auto px-5 sm:px-8">
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left sm:text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            <div className="py-2 sm:px-4">
              <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 block">100%</span>
              <p className="text-xs sm:text-sm font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5">Tenant Isolation</p>
            </div>

            <div className="py-2 sm:px-4">
              <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 block">4.8x</span>
              <p className="text-xs sm:text-sm font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5">Pipeline Velocity</p>
            </div>

            <div className="py-2 sm:px-4">
              <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 block">5-in-1</span>
              <p className="text-xs sm:text-sm font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5">Consolidated Suite</p>
            </div>

            <div className="py-2 sm:px-4">
              <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-950 block">24/7</span>
              <p className="text-xs sm:text-sm font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5">Live Client Sync</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA SECTION ── */}
      <section className="relative z-10 pb-16 sm:pb-24 max-w-5xl mx-auto px-5 sm:px-8 text-left sm:text-center">
        <div className="bg-slate-950 text-white rounded-2xl p-7 sm:p-12 relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[220px] bg-[#12B7D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5 max-w-2xl mx-auto">
            <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Ready to Scale Your Agency?
            </h3>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Get started in seconds with your dedicated company portal and isolated workspace.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
              <Link
                to="/login"
                className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Login to Workspace</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/register-company"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm sm:text-base transition-all flex items-center justify-center"
              >
                Register Company
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINIMAL APPLE FOOTER ── */}
      <footer className="relative z-10 bg-white border-t border-slate-200/70 py-7">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-slate-900 text-sm sm:text-base">RiseWithMedia</span>
            <span>• Digital Marketing OS</span>
          </div>

          <div className="flex items-center gap-5 font-semibold text-slate-600">
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/register-company" className="hover:text-slate-900 transition-colors">Register</Link>
            <Link to="/platform" className="hover:text-slate-900 transition-colors">Platform Admin</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} RiseWithMedia
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
