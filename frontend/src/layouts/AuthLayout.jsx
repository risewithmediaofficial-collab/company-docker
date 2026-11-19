import { Outlet, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Sun, Moon, Building2 } from '@/components/ui/muiIcons';
import { toggleDarkMode } from '../store/slices/uiSlice';
import MobileAppInstallButton from '../components/ui/MobileAppInstallButton';

const RESERVED_SLUGS = new Set([
  'login', 'register', 'register-company', 'forgot-password', 'reset-password',
  'about', 'home', 'features', 'landing', 'capabilities', 'metrics',
  'platform', 'crm', 'sop', 'proposals', 'projects', 'clients', 'client-vault',
  'client-followups', 'tasks', 'manager-tasks', 'calendar', 'influencers',
  'daily-tasks', 'daily_tasks', 'finance', 'call-history', 'hr', 'reports',
  'assets', 'domain-renewals', 'attendance', 'my-eod-reports', 'referral',
  'admin', 'audit-logs', 'recycle-bin', 'settings', 'smm', 'development', 'portal', 'api'
]);

const AuthLayout = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.ui?.darkMode);
  const location = useLocation();
  const { companySlug } = useParams();
  const cleanSlug = companySlug ? companySlug.replace(/^\/+|\/+$/g, '').toLowerCase().trim() : '';
  const isActualCompanySlug = cleanSlug && !RESERVED_SLUGS.has(cleanSlug);
  const isSubAuth = location.pathname.includes('/forgot-password') || location.pathname.includes('/reset-password');

  const [portalOrg, setPortalOrg] = useState(null);
  const [portalLoading, setPortalLoading] = useState(Boolean(isActualCompanySlug));

  useEffect(() => {
    if (!isActualCompanySlug) {
      setPortalOrg(null);
      setPortalLoading(false);
      return;
    }

    let isMounted = true;
    setPortalLoading(true);
    axios
      .get(`/api/auth/company-portal/${cleanSlug}`)
      .then((res) => {
        if (isMounted && res.data?.company) {
          setPortalOrg(res.data.company);
        }
      })
      .catch(() => {
        if (isMounted) setPortalOrg(null);
      })
      .finally(() => {
        if (isMounted) setPortalLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cleanSlug, isActualCompanySlug]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background relative overflow-x-hidden p-3 sm:p-6 py-10 sm:py-12 transition-colors duration-300">
      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <button
          type="button"
          onClick={() => dispatch(toggleDarkMode())}
          className="min-h-[40px] px-3 py-2 rounded-xl bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} className="text-zinc-200" /> : <Moon size={16} className="text-zinc-700" />}
          <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Auth Main Area */}
      {isSubAuth ? (
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-card relative z-10 transition-colors shadow-2xl border border-border/80">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/25 shadow-[0_8px_24px_-8px_hsl(var(--brand)/0.45)] p-2.5 transition-colors overflow-hidden">
              {portalOrg?.logo ? (
                <img
                  src={portalOrg.logo}
                  alt={portalOrg.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/branding/rise-with-media-logo.png';
                  }}
                />
              ) : portalOrg ? (
                <Building2 size={36} className="text-primary" />
              ) : (
                <img
                  src="/branding/rise-with-media-logo.png"
                  alt="RISE WITH MEDIA logo"
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            {portalOrg ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/20">
                  Company Portal
                </span>
                <h1 className="text-center text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {portalOrg.name} + RWM
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 text-center">
                  Account Recovery
                </p>
              </>
            ) : (
              <>
                <h1 className="text-center text-xl sm:text-2xl font-black tracking-tight text-foreground">RISE WITH MEDIA</h1>
                <p className="text-center text-muted-foreground text-xs sm:text-sm mt-1">Account Recovery</p>
              </>
            )}
          </div>

          <Outlet context={{ portalOrg, companySlug, portalLoading, darkMode }} />
        </div>
      ) : (
        <Outlet context={{ portalOrg, companySlug, portalLoading, darkMode }} />
      )}

      {/* Floating PWA Download / Install App Button (Mobile Only) */}
      <MobileAppInstallButton />
    </div>
  );
};

export default AuthLayout;
