import { Outlet, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Sun, Moon, Building2 } from '@/components/ui/muiIcons';
import { toggleDarkMode } from '../store/slices/uiSlice';
import MobileAppInstallButton from '../components/ui/MobileAppInstallButton';
import { RiseWithMediaAttribution } from '../components/common/RiseWithMediaAttribution';

const RESERVED_SLUGS = new Set([
  'login', 'register', 'register-company', 'forgot-password', 'reset-password',
  'about', 'home', 'features', 'landing', 'capabilities', 'metrics',
  'platform', 'crm', 'sop', 'proposals', 'projects', 'clients', 'client-vault',
  'client-followups', 'tasks', 'manager-tasks', 'calendar', 'influencers',
  'daily-tasks', 'daily_tasks', 'finance', 'call-history', 'hr', 'reports',
  'assets', 'domain-renewals', 'attendance', 'my-eod-reports', 'referral',
  'admin', 'audit-logs', 'recycle-bin', 'settings', 'smm', 'development', 'portal', 'api', 'my-finance', 'branches', 'auth'
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
    <div
      className={
        isSubAuth
          ? 'min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background relative overflow-x-hidden px-2 pt-2 pb-20 sm:p-6 sm:py-12 transition-colors duration-300'
          : 'min-h-[100dvh] w-full bg-white dark:bg-slate-950 relative overflow-x-hidden transition-colors duration-300'
      }
    >
      {/* Floating Theme Toggle (Only for SubAuth standalone pages like forgot-password, styled with border & shadow) */}
      {isSubAuth && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <button
            type="button"
            onClick={() => dispatch(toggleDarkMode())}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-card border border-border/80 shadow-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-zinc-700 dark:text-zinc-300" />}
            <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      )}

      {/* Auth Main Area */}
      {isSubAuth ? (
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-card relative z-10 transition-colors shadow-2xl border border-border/80">
          <div className="flex flex-col items-center mb-8">
            {portalOrg ? (
              <>
                <div className="mb-4 flex items-center justify-center">
                  {portalOrg.logo ? (
                    <img
                      src={portalOrg.logo}
                      alt={portalOrg.name}
                      style={{ height: `${Math.min(72, Math.max(32, Number(portalOrg.logoSize) || 52))}px` }}
                      className="w-auto max-w-[200px] object-contain rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = '/agencyupscalelogo.png';
                      }}
                    />
                  ) : (
                    <Building2 size={36} className="text-primary" />
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/20">
                  Company Portal
                </span>
                <h1 className="text-center text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {portalOrg.name}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 text-center">
                  Account Recovery
                </p>
              </>
            ) : (
              <>
                <div className="mb-3 h-20 flex items-center justify-center">
                  <img
                    src="/agencyupscalelogo.png"
                    alt="AgencyUpscale"
                    className="h-full w-auto object-contain dark:hidden"
                  />
                  <img
                    src="/agencyupscalelogo-dark.png"
                    alt="AgencyUpscale"
                    className="h-full w-auto object-contain hidden dark:block"
                  />
                </div>
                <p className="text-center text-muted-foreground text-xs sm:text-sm mt-1">Account Recovery</p>
              </>
            )}
          </div>

          <Outlet context={{ portalOrg, companySlug, portalLoading, darkMode }} />
        </div>
      ) : (
        <Outlet context={{ portalOrg, companySlug, portalLoading, darkMode }} />
      )}

      {isSubAuth && (
        <footer className="mt-6 text-center text-xs text-muted-foreground relative z-10">
          © {new Date().getFullYear()} AgencyUpscale ·{' '}
          <RiseWithMediaAttribution linkClassName="text-foreground/80 hover:text-[#07c8f9]" />
        </footer>
      )}

      {/* Floating PWA Download / Install App Button (Mobile Only) */}
      <MobileAppInstallButton />
    </div>
  );
};

export default AuthLayout;
