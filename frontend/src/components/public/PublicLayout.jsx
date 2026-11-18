import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Capabilities', path: '/capabilities' },
  { label: 'Metrics', path: '/metrics' },
];

const PublicLayout = ({ children }) => {
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
              <span className="font-display font-extrabold text-xl sm:text-2xl text-slate-950 tracking-tight group-hover:text-[#12B7D4] transition-colors leading-tight">
                RiseWithMedia
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block -mt-0.5">
                Digital Marketing OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Separate Dedicated Pages) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-bold text-slate-600">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    active
                      ? 'text-[#12B7D4] bg-[#12B7D4]/10 font-black'
                      : 'hover:text-slate-950 hover:bg-slate-100/80 text-slate-700'
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
              className="text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all px-4 py-2 rounded-full"
            >
              Sign In
            </Link>
            <Link
              to="/register-company"
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs sm:text-sm font-black shadow-md shadow-[#12B7D4]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full sm:hidden"
            >
              Sign In
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                  className={`text-base font-bold px-3 py-2 rounded-lg transition-all ${
                    active
                      ? 'text-[#12B7D4] bg-[#12B7D4]/10'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-slate-800 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register-company"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-black text-white bg-[#12B7D4] rounded-lg shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Get Started</span>
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

      {/* ── SHARED APPLE-STYLE MINIMAL FOOTER ── */}
      <footer className="relative z-10 bg-white border-t border-slate-200/80 py-10 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-[#12B7D4]/10 p-0.5 flex items-center justify-center">
                <img
                  src="/branding/rise-with-media-logo.png"
                  alt="RiseWithMedia Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span className="font-display font-extrabold text-slate-950 text-base">
                RiseWithMedia
              </span>
              <span className="text-xs font-semibold text-slate-400">
                • Digital Marketing OS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Unified agency workspace for campaigns, client portals, deliverables, and billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-slate-950 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-slate-950 transition-colors">About</Link>
            <Link to="/capabilities" className="hover:text-slate-950 transition-colors">Capabilities</Link>
            <Link to="/metrics" className="hover:text-slate-950 transition-colors">Metrics</Link>
            <span className="text-slate-300">|</span>
            <Link to="/login" className="hover:text-slate-950 transition-colors">Sign In</Link>
            <Link to="/register-company" className="hover:text-slate-950 transition-colors">Register Agency</Link>
            <Link to="/platform" className="hover:text-slate-950 transition-colors">Platform</Link>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default PublicLayout;
