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
  CheckCircle2,
  Building2,
  Radio,
  Sparkles
} from 'lucide-react';

// Reusable Wave Accent Card conforming strictly to user's specified design
const FeatureCard = ({ title, subText, icon: Icon, badge, linkTo = "/login", waveFill = "#12B7D430" }) => {
  return (
    <Link
      to={linkTo}
      className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all duration-200 hover:border-[#12B7D4]/60 hover:shadow-md cursor-pointer"
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
          width: '84px',
          fill: waveFill,
        }}
      >
        <path
          d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
          fillOpacity={1}
        />
      </svg>

      {/* Circular Icon Container */}
      <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#12B7D4]/12 flex items-center justify-center text-[#12B7D4] shrink-0 group-hover:scale-105 transition-transform">
        <Icon size={18} />
      </div>

      {/* Message Text Container */}
      <div className="relative z-10 flex flex-col justify-center items-start flex-grow min-w-0">
        <p className="font-display text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#12B7D4] transition-colors truncate w-full">
          {title}
        </p>
        <p className="text-xs text-slate-500 font-medium truncate w-full mt-0.5">
          {subText}
        </p>
      </div>

      {/* Right Badge / Arrow */}
      <div className="relative z-10 flex items-center gap-1 shrink-0">
        {badge && (
          <span className="text-[10px] font-bold text-[#12B7D4] bg-[#12B7D4]/10 border border-[#12B7D4]/20 px-2 py-0.5 rounded-md hidden sm:inline-block">
            {badge}
          </span>
        )}
        <ChevronRight size={16} className="text-slate-400 group-hover:text-[#12B7D4] group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#12B7D4]/25 selection:text-slate-900 relative overflow-x-hidden antialiased">
      
      {/* ── BACKGROUND PATTERN (Gradient & Vertical Grid with Mask) ── */}
      <div className="absolute inset-x-0 top-0 h-[700px] sm:h-[840px] pointer-events-none overflow-hidden z-0">
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

      {/* ── FIXED NAVIGATION BAR (Enlarged, Spacious & Premium) ── */}
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

          {/* Minimal Navigation Links */}
          <nav className="hidden md:flex items-center gap-9 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-slate-950 transition-colors">Overview</a>
            <a href="#capabilities" className="hover:text-slate-950 transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-slate-950 transition-colors">Architecture</a>
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

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 pt-36 sm:pt-44 pb-14 sm:pb-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        
        {/* Apple Style Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12B7D4] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase font-sans">
            Agency & Enterprise Operating System
          </span>
        </div>

        {/* Big Crisp Title (Digital Marketing End to End) */}
        <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-950 tracking-tight leading-[1.08]">
          Digital Marketing
        </h1>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#12B7D4] tracking-tight leading-[1.08] mt-1">
          End-to-End.
        </h1>

        {/* Tagline - Crisp & Direct */}
        <p className="mt-4 text-base sm:text-xl font-bold text-slate-700 tracking-tight">
          Campaigns. Clients. Conversions. Cashflow.
        </p>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#12B7D4]/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/register-company"
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm transition-all"
          >
            Register Agency
          </Link>
        </div>

      </section>

      {/* ── CAPABILITIES (Cards styled strictly with user's design) ── */}
      <section id="capabilities" className="relative z-10 py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-6">
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-950 tracking-tight">
              Core Modules
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Click any module to launch workspace
            </p>
          </div>
          <Link to="/login" className="text-xs font-bold text-[#12B7D4] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* The 6 Feature Cards using the User's Wave Card Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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
      <section id="architecture" className="relative z-10 py-10 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            <div className="py-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">100%</span>
              <p className="text-[11px] font-bold text-[#12B7D4] uppercase tracking-wider mt-1">Tenant Isolation</p>
            </div>

            <div className="py-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">4.8x</span>
              <p className="text-[11px] font-bold text-[#12B7D4] uppercase tracking-wider mt-1">Pipeline Velocity</p>
            </div>

            <div className="py-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">5-in-1</span>
              <p className="text-[11px] font-bold text-[#12B7D4] uppercase tracking-wider mt-1">Consolidated Suite</p>
            </div>

            <div className="py-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">24/7</span>
              <p className="text-[11px] font-bold text-[#12B7D4] uppercase tracking-wider mt-1">Live Client Sync</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA SECTION ── */}
      <section className="relative z-10 pb-16 sm:pb-24 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-10 relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-[#12B7D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Ready to Scale Your Agency?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto">
              Get started in seconds with your dedicated company portal and isolated workspace.
            </p>

            <div className="pt-3 flex flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Login to Workspace</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/register-company"
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all"
              >
                Register Company
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINIMAL APPLE FOOTER ── */}
      <footer className="relative z-10 bg-white border-t border-slate-200/70 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900">RiseWithMedia</span>
            <span>• Digital Marketing OS</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-slate-600">
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
