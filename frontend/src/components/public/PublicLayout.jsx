import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, MessageSquare } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Capabilities', path: '/capabilities' },
  { label: 'Metrics', path: '/metrics' },
];

const PublicLayout = ({
  children,
  hideCta = false,
  ctaTitle = 'Ready to Organize Your Entire Agency?',
  ctaSubtitle = 'Register your company in 2 minutes. Keep your clients happy, your team on track, and your bills on time.',
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#12B7D4]/25 selection:text-slate-900 relative overflow-x-hidden antialiased flex flex-col justify-between">
      
      {/* ── AMBIENT LOGO BLUE SIDE GLOWS (Only #12B7D4) ── */}
      <div className="fixed top-1/4 -left-36 w-80 sm:w-96 h-[500px] bg-gradient-to-r from-[#12B7D4]/12 via-[#12B7D4]/6 to-transparent rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-36 w-80 sm:w-96 h-[500px] bg-gradient-to-l from-[#12B7D4]/10 via-[#12B7D4]/5 to-transparent rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ── FIXED TOP NAVIGATION BAR ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all flex items-center shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1.5 overflow-hidden transition-transform group-hover:scale-105 shrink-0">
              <img
                src="/branding/rise-with-media-logo.png"
                alt="RiseWithMedia Logo"
                className="h-full w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl text-slate-950 tracking-tight group-hover:text-[#12B7D4] transition-colors leading-tight">
                RiseWithMedia
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block -mt-0.5">
                Digital Marketing OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-bold text-slate-600">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 transition-all text-sm ${
                    active
                      ? 'text-[#12B7D4] font-black'
                      : 'hover:text-slate-950 text-slate-700 font-bold'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all px-4 py-2 rounded-full border border-slate-200"
            >
              Login
            </Link>
            <Link
              to="/register-company"
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#12B7D4]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Register</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Action & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full"
            >
              Login
            </Link>
            <Link
              to="/register-company"
              className="text-xs font-bold text-white bg-[#12B7D4] px-3 py-1.5 rounded-full"
            >
              Register
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 inset-x-0 bg-white border-b border-slate-200 shadow-xl py-4 px-6 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-bold px-3 py-2 transition-all ${
                    active
                      ? 'text-[#12B7D4] font-black'
                      : 'text-slate-800 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-sm font-bold text-slate-800 bg-slate-100 rounded-lg border border-slate-200"
              >
                Login
              </Link>
              <Link
                to="/register-company"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-sm font-bold text-white bg-[#12B7D4] rounded-lg shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Register</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT (Padded below navbar) ── */}
      <main className="relative z-10 flex-grow pt-20">
        {children}
      </main>

      {/* ── FLOATING OVERLAPPING CTA BANNER (Attached Above Footer, matching reference UI) ── */}
      {!hideCta && (
        <section className="relative z-20 -mb-20 sm:-mb-24 max-w-6xl mx-auto px-4 sm:px-8 w-full">
          <div className="rounded-3xl bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#0284c7] p-8 sm:p-12 lg:p-14 shadow-2xl shadow-[#12B7D4]/30 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border border-white/20 relative overflow-hidden">
            
            {/* Subtle Inner Glow Shapes */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="max-w-2xl text-left space-y-2 relative z-10">
              <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                {ctaTitle}
              </h2>
              <p className="text-sm sm:text-base text-cyan-50 font-medium leading-relaxed">
                {ctaSubtitle}
              </p>
            </div>

            {/* Right Buttons (Matching Reference Image) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
              <Link
                to="/register-company"
                className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Register Company</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-slate-950/20 hover:bg-slate-950/30 text-white border border-white/30 font-bold text-sm sm:text-base transition-all flex items-center justify-center"
              >
                Login to Account
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* ── DARK RICH FOOTER (Attached directly behind the floating banner) ── */}
      <footer className="relative z-10 bg-slate-950 text-slate-400 border-t border-slate-800 pt-28 sm:pt-36 pb-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
            
            {/* Col 1: Brand & Mission */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                  <img
                    src="/branding/rise-with-media-logo.png"
                    alt="RiseWithMedia Logo"
                    className="h-full w-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <span className="font-extrabold text-white text-lg block leading-tight">
                    RiseWithMedia
                  </span>
                  <span className="text-[11px] font-bold text-[#12B7D4] uppercase tracking-wider">
                    Agency Operating System
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
                Unified workspace built exclusively for digital marketing agencies. Automate lead follow-ups, client approvals, and GST invoicing in one place.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="lg:col-span-3 space-y-3 text-left">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Links
              </p>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/capabilities" className="hover:text-white transition-colors">Platform Capabilities</Link></li>
                <li><Link to="/metrics" className="hover:text-white transition-colors">Metrics & Reliability</Link></li>
                <li><Link to="/register-company" className="hover:text-white transition-colors">Register Company</Link></li>
              </ul>
            </div>

            {/* Col 3: Agency Solutions */}
            <div className="lg:col-span-3 space-y-3 text-left">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Platform Solutions
              </p>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                <li><Link to="/capabilities" className="hover:text-white transition-colors">Lead Pipeline & Deals</Link></li>
                <li><Link to="/capabilities" className="hover:text-white transition-colors">Content Calendar & SMM</Link></li>
                <li><Link to="/capabilities" className="hover:text-white transition-colors">1-Tap Client Review Portal</Link></li>
                <li><Link to="/capabilities" className="hover:text-white transition-colors">Automated GST Invoices</Link></li>
                <li><Link to="/metrics" className="hover:text-white transition-colors">Multi-Tenant Database Privacy</Link></li>
              </ul>
            </div>

            {/* Col 4: Platform Mascot / Status (matching reference image) */}
            <div className="lg:col-span-2 flex flex-col items-start lg:items-center justify-center text-left lg:text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-800 p-2.5 flex items-center justify-center shadow-lg">
                <img
                  src="/branding/rise-with-media-logo.png"
                  alt="RiseWithMedia OS"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <p className="text-xs font-bold text-white mt-2">
                RiseWithMedia OS
              </p>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 border border-emerald-500/20">
                ● All Systems Active
              </span>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
            <p>© {new Date().getFullYear()} RiseWithMedia. All rights reserved.</p>
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/login" className="hover:text-white transition-colors">Login to Account</Link>
              <span className="text-slate-700">•</span>
              <Link to="/register-company" className="hover:text-white transition-colors">Register Company</Link>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-400">100% Private Isolated Workspaces</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ── FLOATING WHATSAPP / SUPPORT WIDGET (Matching Reference Image bottom-right) ── */}
      <a
        href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20RiseWithMedia!%20I%20want%20to%20know%20more%20about%20your%20agency%20CRM."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer border-2 border-white/60"
        title="Chat on WhatsApp"
        aria-label="WhatsApp Support"
      >
        <MessageSquare size={26} className="stroke-[2.2] fill-white/20" />
      </a>

    </div>
  );
};

export default PublicLayout;