import { useEffect, useState } from 'react';
import { Cookie, SlidersHorizontal, X, Check } from 'lucide-react';
import { purgeQueryCache } from '../../queryClient';

const CONSENT_STORAGE_KEY = 'rwm_cookie_consent_v1';
const CONSENT_COOKIE_NAME = 'rwm_cookie_consent';

const readStoredConsent = () => {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.version === 1) {
      return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
};

const persistConsent = (prefs) => {
  const payload = {
    version: 1,
    essential: true,
    preferencesCache: Boolean(prefs.preferencesCache),
    analytics: Boolean(prefs.analytics),
    acceptedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    const encoded = encodeURIComponent(JSON.stringify({
      v: 1,
      essential: true,
      cache: payload.preferencesCache,
      analytics: payload.analytics,
    }));
    document.cookie = `${CONSENT_COOKIE_NAME}=${encoded}; Max-Age=15552000; Path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie/storage write errors
  }

  if (!payload.preferencesCache) {
    try {
      purgeQueryCache();
      sessionStorage.clear();
    } catch {
      // Ignore cache clear failures
    }
  }

  return payload;
};

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [preferencesCache, setPreferencesCache] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const existing = readStoredConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setPreferencesCache(Boolean(existing.preferencesCache));
      setAnalytics(Boolean(existing.analytics));
    }

    const handleOpen = () => {
      const current = readStoredConsent();
      if (current) {
        setPreferencesCache(Boolean(current.preferencesCache));
        setAnalytics(Boolean(current.analytics));
      }
      setCustomizing(true);
      setVisible(true);
    };

    window.addEventListener('rwm:open-cookie-settings', handleOpen);
    return () => window.removeEventListener('rwm:open-cookie-settings', handleOpen);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    persistConsent({ preferencesCache: true, analytics: true });
    setPreferencesCache(true);
    setAnalytics(true);
    setCustomizing(false);
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    persistConsent({ preferencesCache: false, analytics: false });
    setPreferencesCache(false);
    setAnalytics(false);
    setCustomizing(false);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    persistConsent({ preferencesCache, analytics });
    setCustomizing(false);
    setVisible(false);
  };

  return (
    <aside
      role="dialog"
      aria-label="Cookie and Cache Preferences"
      className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-full sm:max-w-[480px] z-[70] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-2xl p-4 text-left animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#07c8f9]/12 text-[#07c8f9] flex items-center justify-center shrink-0 mt-0.5">
            <Cookie size={16} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
              Cookies &amp; Cache Preferences
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
              We use essential cookies for secure login and browser cache to speed up dashboards and remember your workspace layout.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleEssentialOnly}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
          aria-label="Use essential cookies only"
          title="Close with essential cookies only"
        >
          <X size={14} />
        </button>
      </div>

      {customizing && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">Strictly Necessary</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Auth tokens, CSRF &amp; CAPTCHA security</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
              Always On
            </span>
          </div>

          <label className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">Browser Cache &amp; Preferences</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Fast page caching &amp; UI preferences</p>
            </div>
            <input
              type="checkbox"
              checked={preferencesCache}
              onChange={(e) => setPreferencesCache(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#07c8f9] focus:ring-[#07c8f9] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">Performance &amp; Diagnostics</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Helps keep CRM workflows responsive</p>
            </div>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#07c8f9] focus:ring-[#07c8f9] cursor-pointer"
            />
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleAcceptAll}
          className="flex-1 min-w-[110px] py-2 px-3 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-white text-[11px] font-extrabold shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          <Check size={13} />
          <span>Accept All</span>
        </button>

        <button
          type="button"
          onClick={handleEssentialOnly}
          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer transition-colors"
        >
          Essential Only
        </button>

        {customizing ? (
          <button
            type="button"
            onClick={handleSaveCustom}
            className="py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold cursor-pointer transition-colors"
          >
            Save
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCustomizing(true)}
            className="py-2 px-2.5 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <SlidersHorizontal size={12} />
            <span>Customize</span>
          </button>
        )}
      </div>
    </aside>
  );
};
