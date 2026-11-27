import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, LayoutDashboard, BarChart3, Clock,
  ChevronLeft, Shield, Menu, X
} from 'lucide-react';
import axios from 'axios';
import { RiseWithMediaAttribution } from '../../components/common/RiseWithMediaAttribution';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/platform', id: 'overview' },
  { label: 'Companies', icon: Building2, path: '/platform/companies', id: 'companies' },
  { label: 'Company Requests', icon: Clock, path: '/platform/companies?tab=requests', id: 'requests' },
  { label: 'Analytics', icon: BarChart3, path: '/platform/analytics', id: 'analytics' },
];

const PlatformLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guard: Only superAdmin can access
  useEffect(() => {
    if (user && user.role !== 'superAdmin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Fetch pending registration requests count for notification badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await axios.get('/api/platform/organizations?status=pending&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingCount(res.data.total || 0);
      } catch (err) {
        // quiet fallback
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [location.pathname, location.search]);

  if (!user || user.role !== 'superAdmin') return null;

  const renderNavLinks = (isMobile = false) => (
    <nav className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-3 sm:p-4 space-y-1">
      {navItems.map((item) => {
        const isRequests = item.id === 'requests';
        const isCompanies = item.id === 'companies';

        let active = false;
        if (isRequests) {
          active =
            location.pathname === '/platform/requests' ||
            location.pathname === '/platform/company-requests' ||
            (location.pathname === '/platform/companies' &&
              (location.search.includes('tab=requests') || location.search.includes('status=pending')));
        } else if (isCompanies) {
          active =
            location.pathname.startsWith('/platform/companies') &&
            !location.search.includes('tab=requests') &&
            !location.search.includes('status=pending');
        } else {
          active = location.pathname === item.path;
        }

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => {
              if (isMobile) setMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={isRequests && pendingCount > 0 && !active ? 'text-amber-600' : ''} />
              <span>{item.label}</span>
            </div>

            {isRequests && pendingCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                  active
                    ? 'bg-white text-indigo-700'
                    : 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs animate-pulse'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderUserProfileAndBack = (isMobile = false) => (
    <div className="p-3 sm:p-4 border-t border-slate-100 space-y-2">
      <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100">
        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
          {user?.name?.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-slate-900 text-xs font-semibold truncate">{user?.name}</p>
          <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
        </div>
      </div>
      <Link
        to="/"
        onClick={() => {
          if (isMobile) setMobileMenuOpen(false);
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
      >
        <ChevronLeft size={16} />
        <span>Back to App</span>
      </Link>
      <p className="px-3 pt-1 text-[10px] text-slate-400">
        <RiseWithMediaAttribution linkClassName="text-slate-600 hover:text-[#07c8f9]" />
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* ── Mobile Top Sticky Header (Screens < lg) ────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open Platform Navigation Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Shield size={14} />
            </div>
            <div className="leading-tight">
              <p className="text-slate-900 text-xs font-bold leading-none">Platform Admin</p>
              <p className="text-indigo-600 text-[9px] font-semibold uppercase tracking-wider mt-0.5">Super Admin</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Link
              to="/platform/companies?tab=requests"
              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
            >
              {pendingCount} Pending
            </Link>
          )}
          <Link
            to="/"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">Back to</span>
            <span>App</span>
          </Link>
        </div>
      </header>

      {/* ── Mobile Slide-Over Drawer Navigation ────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
            />

            {/* Slide drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed inset-y-0 left-0 h-[100dvh] max-h-[100dvh] z-50 w-72 max-w-[85vw] bg-white flex flex-col shadow-2xl lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 shrink-0">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold leading-tight">Platform Admin</p>
                    <p className="text-indigo-600 text-[10px] font-semibold uppercase tracking-wider">Super Admin Console</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {renderNavLinks(true)}
              {renderUserProfileAndBack(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Persistent Sidebar (Screens >= lg) ────────────────────── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200/80 flex-col shadow-xs sticky top-0 h-screen">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-slate-900 text-sm font-bold leading-tight">Platform Admin</p>
            <p className="text-indigo-600 text-[10px] font-semibold uppercase tracking-wider">Super Admin Console</p>
          </div>
        </div>

        {/* Desktop Nav */}
        {renderNavLinks(false)}

        {/* Desktop Bottom Profile & Back */}
        {renderUserProfileAndBack(false)}
      </aside>

      {/* ── Main Content Area (Fluid & Responsive) ─────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="px-6 py-4 border-t border-slate-200/80 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} AgencyUpscale</span>
          <RiseWithMediaAttribution linkClassName="text-slate-700 hover:text-[#07c8f9]" />
        </footer>
      </main>
    </div>
  );
};

export default PlatformLayout;
