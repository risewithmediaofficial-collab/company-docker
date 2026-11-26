import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, MessageSquare } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'What We Do', path: '/what-we-do' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Our Impact', path: '/our-impact' },
];

const PublicLayout = ({
  children,
  hideCta = false,
  ctaTitle = 'Ready to Organize Your Entire Agency?',
  ctaSubtitle = 'Register your account in seconds. Select your plan inside and keep your clients happy, your team on track, and your bills on time.',
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open to prevent background wobble
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    if (path === '/our-story') return location.pathname === '/our-story' || location.pathname === '/about';
    if (path === '/what-we-do') return location.pathname === '/what-we-do' || location.pathname === '/capabilities' || location.pathname === '/features';
    if (path === '/pricing') return location.pathname === '/pricing';
    if (path === '/our-impact') return location.pathname === '/our-impact' || location.pathname === '/metrics' || location.pathname === '/overview';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#07c8f9]/25 selection:text-slate-900 relative overflow-x-hidden antialiased flex flex-col justify-between">
      
      {/* ── AMBIENT LOGO BLUE SIDE GLOWS (Only #07c8f9) ── */}
      <div className="fixed top-1/4 -left-36 w-80 sm:w-96 h-[500px] bg-gradient-to-r from-[#07c8f9]/12 via-[#07c8f9]/6 to-transparent rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-36 w-80 sm:w-96 h-[500px] bg-gradient-to-l from-[#07c8f9]/10 via-[#07c8f9]/5 to-transparent rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ── FIXED TOP NAVIGATION BAR ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all flex items-center shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-8 lg:px-12 w-full flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3.5 group shrink-0">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 sm:p-1.5 overflow-hidden transition-transform group-hover:scale-105 shrink-0">
              <img
                src="/branding/rise-with-media-logo.png"
                alt="AgencyUpscale Logo"
                className="h-full w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-2xl text-slate-950 tracking-tight group-hover:text-[#07c8f9] transition-colors leading-tight">
                AgencyUpscale
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block -mt-0.5">
                Digital Marketing App
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
                      ? 'text-[#07c8f9] font-black'
                      : 'hover:text-slate-950 text-slate-700 font-bold'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all px-4 py-2 rounded-full border border-slate-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#07c8f9] hover:bg-[#06b4e0] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#07c8f9]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Register</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Right Controls: Hamburger Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-800 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} className="stroke-[2.5]" /> : <Menu size={24} className="stroke-[2.5]" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu with Full-Width Backdrop Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-16 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden fixed top-16 inset-x-0 z-50 bg-white border-b border-slate-200 shadow-2xl py-5 px-5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-base font-extrabold px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                        active
                          ? 'text-[#07c8f9] bg-[#07c8f9]/10 font-black'
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && <span className="w-2 h-2 rounded-full bg-[#07c8f9]" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center text-sm font-bold text-white bg-[#07c8f9] hover:bg-[#06b4e0] rounded-xl shadow-md shadow-[#07c8f9]/25 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Register</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ── MAIN CONTENT (Padded below responsive navbar) ── */}
      <main className="relative z-10 flex-grow pt-16 sm:pt-20">
        {children}
      </main>

      {/* ── FLOATING OVERLAPPING CTA BANNER (Centered across the white/dark boundary) ── */}
      {!hideCta && (
        <section className="relative z-20 -mb-28 sm:-mb-24 lg:-mb-24 max-w-6xl mx-auto px-4 sm:px-8 w-full">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07c8f9] via-[#06b4e0] to-[#0284c7] p-6 sm:p-10 lg:p-12 text-white flex flex-col lg:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 border border-white/20 relative overflow-hidden">
            
            {/* Subtle Inner Glow Shapes */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="max-w-2xl text-left space-y-2 relative z-10">
              <h2 className="font-extrabold text-xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                {ctaTitle}
              </h2>
              <p className="text-xs sm:text-base text-cyan-50 font-medium leading-relaxed">
                {ctaSubtitle}
              </p>
            </div>

            {/* Right Buttons (Full width on mobile, inline on desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10 w-full lg:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-950 font-extrabold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 group cursor-pointer text-center"
              >
                <span>Register</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-slate-950/20 hover:bg-slate-950/30 text-white border border-white/30 font-bold text-sm sm:text-base transition-colors flex items-center justify-center text-center"
              >
                Sign In
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* ── DARK RICH FOOTER (Attached directly behind the floating banner) ── */}
      <footer className="relative z-10 bg-slate-950 text-slate-400 border-t border-slate-800 pt-32 sm:pt-36 lg:pt-40 pb-12 mt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start pb-12 border-b border-slate-800/80">
            
            {/* Col 1: Brand & Mission (6 cols) */}
            <div className="sm:col-span-2 lg:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src="/branding/rise-with-media-logo.png"
                    alt="AgencyUpscale Logo"
                    className="h-full w-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <span className="font-extrabold text-white text-lg block leading-tight">
                    AgencyUpscale
                  </span>
                  <span className="text-[11px] font-bold text-[#07c8f9] uppercase tracking-wider">
                    Agency Workspace
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
                A simple, all-in-one workspace made for digital marketing agencies. Follow up on leads, get quick client approvals, and send bills in one easy place.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>100% Private & Safe for Every Agency</span>
              </div>
            </div>

            {/* Col 2: Quick Links (3 cols) */}
            <div className="sm:col-span-1 lg:col-span-3 space-y-3 text-left">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Links
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li><Link to="/" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Home</Link></li>
                <li><Link to="/our-story" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Our Story</Link></li>
                <li><Link to="/what-we-do" className="text-slate-400 hover:text-[#07c8f9] transition-colors">What We Do</Link></li>
                <li><Link to="/pricing" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Pricing</Link></li>
                <li><Link to="/our-impact" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Our Impact</Link></li>
                <li><Link to="/register" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* Col 3: Platform Solutions (3 cols) */}
            <div className="sm:col-span-1 lg:col-span-3 space-y-3 text-left">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Platform Solutions
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li><Link to="/what-we-do" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Leads & Deals</Link></li>
                <li><Link to="/what-we-do" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Social Media Calendar</Link></li>
                <li><Link to="/what-we-do" className="text-slate-400 hover:text-[#07c8f9] transition-colors">1-Tap Client Approvals</Link></li>
                <li><Link to="/what-we-do" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Invoices & Billing</Link></li>
                <li><Link to="/our-impact" className="text-slate-400 hover:text-[#07c8f9] transition-colors">Private Data & Backups</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 text-center sm:text-left">
            <p>© {new Date().getFullYear()} AgencyUpscale. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6">
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <span className="text-slate-700">•</span>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('rwm:open-cookie-settings'))}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Cookies &amp; Cache
              </button>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-400">100% Private Isolated Workspaces</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ── FLOATING WHATSAPP SUPPORT WIDGET (Positioned to not block UI) ── */}
      <a
        href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20AgencyUpscale!%20I%20want%20to%20know%20more%20about%20your%20agency%20CRM."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-white/60"
        title="Chat on WhatsApp"
        aria-label="WhatsApp Support"
      >
        <MessageSquare size={24} className="stroke-[2.2] fill-white/20" />
      </a>

    </div>
  );
};

export default PublicLayout;