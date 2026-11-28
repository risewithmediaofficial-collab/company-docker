import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { loginUser, clearError, logout, enterGhostMode } from '../../store/slices/authSlice';
import {
  UserCheck,
  UserPlus,
  Download,
  Mail,
  Phone,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowRight,
  Shield,
  CheckCircle2,
  Radio,
  Zap,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { CaptchaWidget } from '../../components/auth/CaptchaWidget';
import { TermsModal } from '../../components/auth/TermsModal';
import { RiseWithMediaAttribution } from '../../components/common/RiseWithMediaAttribution';

// ── Top Bar Controls (Mobile Logo + Sign In/Up Pill + Theme Toggle) ──────────
const AuthTopBar = ({ view, onSelect, portalOrg, darkMode, onToggleTheme }) => (
  <header className="w-full flex items-center justify-between gap-2 pb-2 lg:pb-0">
    {/* Mobile/Tablet Logo (hidden on lg+ because left split panel shows logo) */}
    <Link to="/" className="lg:hidden group flex items-center gap-2 shrink-0" title="AgencyUpscale Home">
      {portalOrg?.logo ? (
        <>
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-2xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden">
            <img
              src={portalOrg.logo}
              alt={portalOrg.name}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/agencyupscalelogo.png';
              }}
            />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white tracking-wider uppercase truncate max-w-[120px]">
            {portalOrg.name}
          </span>
        </>
      ) : (
        <div className="h-10 sm:h-11 shrink-0 flex items-center group-hover:scale-105 transition-transform">
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
      )}
    </Link>

    {/* Right-aligned Switcher & Theme Toggle */}
    <div className="flex items-center gap-2 ml-auto shrink-0">
      <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <button
          type="button"
          onClick={() => onSelect('signin')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            view === 'signin'
              ? 'text-[#07c8f9] bg-white dark:bg-slate-800 shadow-2xs border border-[#07c8f9]/25'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
          }`}
        >
          <UserCheck size={13} className={view === 'signin' ? 'text-[#07c8f9]' : ''} />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect('signup')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            view === 'signup'
              ? 'text-[#07c8f9] bg-white dark:bg-slate-800 shadow-2xs border border-[#07c8f9]/25'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
          }`}
        >
          <UserPlus size={13} className={view === 'signup' ? 'text-[#07c8f9]' : ''} />
          <span>Sign Up</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-[#07c8f9] hover:border-[#07c8f9]/40 transition-all shadow-2xs cursor-pointer shrink-0"
        title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600 dark:text-slate-300" />}
      </button>
    </div>
  </header>
);

// ── Split Left Abstract Showcase Panel (Desktop lg+) ──────────────────────────
const SplitShowcasePanel = ({ view, portalOrg, onOpenTerms }) => (
  <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-10 xl:p-14 bg-[#074d61] select-none shrink-0">
    {/* Flowing Swirling Abstract Gradient Background (deeper ocean-teal at top-left so logo pops crisply) */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(circle at 8% 10%, rgba(3, 32, 44, 0.94) 0%, rgba(5, 48, 64, 0.72) 28%, transparent 56%), radial-gradient(circle at 72% 24%, rgba(224, 249, 255, 0.42) 0%, rgba(56, 189, 248, 0.25) 36%, transparent 64%), radial-gradient(circle at 40% 78%, rgba(7, 200, 249, 0.78) 0%, rgba(6, 78, 99, 0.9) 55%, #042b38 100%), linear-gradient(135deg, #042b38 0%, #0b6f8a 48%, #07c8f9 100%)',
      }}
    />

    {/* Soft Swirling Mesh Light Streaks */}
    <div className="pointer-events-none absolute top-10 left-1/3 w-[420px] h-[420px] rounded-full bg-white/20 blur-[95px] mix-blend-screen" />
    <div className="pointer-events-none absolute top-1/3 -right-10 w-[380px] h-[380px] rounded-full bg-[#38bdf8]/40 blur-[100px]" />
    <div className="pointer-events-none absolute -bottom-24 left-1/4 w-[420px] h-[320px] rounded-full bg-[#07c8f9]/45 blur-[90px]" />

    {/* Top-Left Corner Abstract Element (Orbital 360° Rings & Faceted Light Rays) */}
    <svg
      viewBox="0 0 420 420"
      fill="none"
      className="pointer-events-none absolute -top-8 -left-8 w-[360px] h-[360px] xl:w-[420px] xl:h-[420px] opacity-85"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cornerArcGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#67e8f9" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#07c8f9" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cornerOrbGlow" cx="0.25" cy="0.25" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#07c8f9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="96" cy="96" r="148" fill="url(#cornerOrbGlow)" />
      <circle cx="88" cy="88" r="196" stroke="url(#cornerArcGrad)" strokeWidth="1.5" strokeDasharray="8 10" />
      <circle cx="88" cy="88" r="142" stroke="url(#cornerArcGrad)" strokeWidth="2" />
      <circle cx="88" cy="88" r="88" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.2" />
      <path
        d="M -20 190 C 90 120, 170 40, 290 -15"
        stroke="url(#cornerArcGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 10 280 C 125 220, 225 140, 355 55"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="230" cy="88" r="5" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="176" cy="198" r="3.5" fill="#a5f3fc" fillOpacity="0.8" />
    </svg>

    {/* Organic Flowing Wave Swirl Background Ribbon */}
    <svg
      viewBox="0 0 800 900"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 w-full h-full opacity-35 mix-blend-soft-light"
      aria-hidden="true"
    >
      <path
        d="M -80 260 C 120 120, 320 440, 560 220 C 700 90, 790 180, 860 120 L 860 940 L -80 940 Z"
        fill="url(#swirlGrad)"
      />
      <defs>
        <linearGradient id="swirlGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#042f3d" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>

    {/* Smooth Organic S-Wave Divider Seam into Right Form Panel */}
    <svg
      viewBox="0 0 120 1000"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-0 -right-px h-full w-16 xl:w-24 text-white dark:text-slate-950 z-20"
      aria-hidden="true"
    >
      <path
        d="M 86 0 C 124 190, 14 370, 60 540 C 106 710, 18 855, 78 1000 L 120 1000 L 120 0 Z"
        fill="currentColor"
      />
    </svg>

    {/* Top-Left Logo */}
    <div className="relative z-10 flex items-center gap-3 pr-12">
      <Link to="/" className="inline-flex items-center gap-3 group" aria-label="AgencyUpscale Home">
        {portalOrg?.logo ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-2 flex items-center justify-center shadow-lg shadow-black/15 overflow-hidden">
              <img
                src={portalOrg.logo}
                alt={portalOrg.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/agencyupscalelogo-dark.png';
                }}
              />
            </div>
            <span className="text-lg font-black text-white tracking-tight drop-shadow-sm">
              {portalOrg.name}
            </span>
          </>
        ) : (
          <img
            src="/agencyupscalelogo-dark.png"
            alt="AgencyUpscale"
            className="h-16 xl:h-20 w-auto object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.3)] group-hover:scale-[1.02] transition-transform"
          />
        )}
      </Link>
    </div>

    {/* Bottom-Left Headline, Tagline & Feature Highlights */}
    <div className="relative z-10 max-w-lg pr-14 xl:pr-20 space-y-5 my-auto pt-12 pb-2">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold tracking-wide shadow-sm">
        <Zap size={13} className="text-cyan-200 fill-cyan-200" />
        <span>
          {portalOrg?.name ? `${portalOrg.name} Workspace` : '360° Agency Operating System'}
        </span>
      </div>

      <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.08] drop-shadow-sm">
        {view === 'signup' ? (
          <>
            Scale your agency
            <br />
            like a pro.
          </>
        ) : (
          <>
            Run your agency
            <br />
            like a pro.
          </>
        )}
      </h1>

      <p className="text-base xl:text-lg text-cyan-50/95 font-semibold leading-relaxed">
        Sign in or sign up to explore our 360° product.
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 pt-1 text-xs xl:text-sm font-semibold text-white/95">
        <span className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-cyan-200 shrink-0" />
          Clients &amp; projects
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-cyan-200 shrink-0" />
          Invoices &amp; payments
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-cyan-200 shrink-0" />
          Client portal
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-cyan-200 shrink-0" />
          360° CRM &amp; campaigns
        </span>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenTerms}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
        >
          <span>Terms &amp; Conditions</span>
          <Download size={13} />
        </button>
      </div>
    </div>

    {/* Bottom Subtle Tag */}
    <div className="relative z-10 pr-16 text-xs text-cyan-100/75 font-medium">
      All-in-one CRM, Projects, SMM, Finance &amp; Client Portal
    </div>
  </aside>
);

// ── Sign In Form Component ───────────────────────────────────────────────────
const SignInForm = ({
  formData,
  handleChange,
  handleSubmit,
  loading,
  error,
  showPassword,
  setShowPassword,
  portalRedirect,
  portalOrg,
  companySlug,
  onSwitch,
  isAuthenticated,
  user,
  currentOrg,
  navigate,
  dispatch,
  captcha,
  setCaptcha,
  captchaRefreshKey,
  termsAccepted,
  setTermsAccepted,
  localError,
  setLocalError,
  onOpenTerms,
}) => {
  // ── Multi-Tab Active Session Switcher ──────────────────────────────────────
  if (isAuthenticated && user && companySlug) {
    const isSuperAdmin = user.role === 'superAdmin';
    const userOrgId = user.organizationId?._id || user.organizationId || currentOrg?._id;
    const userOrgSlug = user.organizationId?.slug || currentOrg?.slug;
    const userOrgName = user.organizationId?.name || currentOrg?.name || 'Your Current Company';

    const targetSlug = String(companySlug || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();
    const isSameCompany = portalOrg?._id && userOrgId && String(userOrgId) === String(portalOrg._id);
    const isSameSlug = userOrgSlug && targetSlug && userOrgSlug.toLowerCase().trim() === targetSlug;

    if (isSuperAdmin) {
      return (
        <div className="space-y-3.5 text-left w-full max-w-sm mx-auto">
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-[#07c8f9]/30 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0e7490] dark:text-[#07c8f9]">
              <Shield size={15} />
              <span>Platform Super Admin Active</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
              Signed in as Super Admin (<strong>{user.email}</strong>).
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                const target = portalOrg || { name: companySlug, slug: companySlug };
                dispatch(enterGhostMode(target));
                toast.success(`Stealth Live View Activated for "${target.name}"`);
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#07c8f9] hover:bg-[#06b4e0] shadow-sm shadow-[#07c8f9]/20 transition-all cursor-pointer"
            >
              <Radio size={14} className="animate-pulse" />
              <span>Live View {portalOrg?.name || companySlug} CRM</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                toast.info(`Switched to ${portalOrg?.name || companySlug} login`);
              }}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              Sign In with Company Account
            </button>
          </div>
        </div>
      );
    }

    if (isSameCompany || isSameSlug) {
      return (
        <div className="space-y-3.5 text-center w-full max-w-sm mx-auto">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              <span>Already Signed In</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Signed in to <strong>{portalOrg?.name || userOrgName}</strong> as <strong>{user.name}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#07c8f9] hover:bg-[#06b4e0] transition-all cursor-pointer shadow-sm shadow-[#07c8f9]/20"
          >
            <span>Go to CRM Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="signin space-y-3 text-left w-full max-w-sm mx-auto">
      {/* Form Heading (All Screens) */}
      <div className="text-center lg:text-left mb-1.5">
        <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-[11px] lg:text-xs text-slate-500 dark:text-slate-400">
          {portalOrg ? `Sign in to ${portalOrg.name} workspace` : 'Please enter your credentials'}
        </p>
      </div>

      {/* Redirect / Review Alerts */}
      {portalRedirect && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
            <Building2 size={14} />
            <span>Workspace URL Required</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Belongs to <strong>{portalRedirect.companyName}</strong>. Please use your workspace login link.
          </p>
          <Link
            to={portalRedirect.portalUrl || `/login/${portalRedirect.companySlug}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Go to Company Portal →
          </Link>
        </div>
      )}

      {(error || localError) && !portalRedirect && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span className="leading-tight">{localError || error}</span>
        </div>
      )}

      {/* Email / Phone Field */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block" htmlFor="signin-email">
          Email address or Phone
        </label>
        <div className="relative group">
          <Mail size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#07c8f9] transition-colors" />
          <input
            id="signin-email"
            name="email"
            type="text"
            autoComplete="username"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com or phone"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#07c8f9] focus:ring-2 focus:ring-[#07c8f9]/20 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300" htmlFor="signin-password">
            Password
          </label>
          <Link to="/forgot-password" className="text-[11px] text-[#0284c7] dark:text-[#38bdf8] underline underline-offset-2 font-semibold">
            Forgot password?
          </Link>
        </div>
        <div className="relative group">
          <Lock size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#07c8f9] transition-colors" />
          <input
            id="signin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-9 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#07c8f9] focus:ring-2 focus:ring-[#07c8f9]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* CAPTCHA Verification */}
      <CaptchaWidget
        compact
        inputId="signin-captcha"
        captchaToken={captcha.captchaToken}
        captchaAnswer={captcha.captchaAnswer}
        onChange={(next) => {
          setLocalError('');
          setCaptcha(next);
        }}
        refreshKey={captchaRefreshKey}
      />

      {/* Mandatory Terms & Conditions Checkbox */}
      <div
        className={`rounded-xl px-2.5 py-2 border transition-colors ${
          !termsAccepted && localError
            ? 'border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/25'
            : 'border-slate-200/80 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40'
        }`}
      >
        <label className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          <input
            id="signin-terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (e.target.checked) setLocalError('');
            }}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#07c8f9] focus:ring-[#07c8f9] cursor-pointer shrink-0"
          />
          <span className="leading-snug">
            I accept the{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-[#0284c7] dark:text-[#38bdf8] underline underline-offset-2 font-bold cursor-pointer"
            >
              Terms &amp; Conditions
            </button>{' '}
            &amp; Privacy Policy <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2.5 px-4 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-white font-extrabold text-xs transition-all shadow-sm shadow-[#07c8f9]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
          !termsAccepted ? 'opacity-80' : ''
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={14} />
            <span>Signing in...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span>{portalOrg ? `Sign In to ${portalOrg.name}` : 'Sign In'}</span>
            <ArrowRight size={14} />
          </span>
        )}
      </button>

      <GoogleAuthButton
        mode="signin"
        companySlug={companySlug}
        label={portalOrg ? `Continue with Google (${portalOrg.name})` : 'Continue with Google'}
      />

      {/* Quick Links & Switchers */}
      <div className="pt-1.5 text-center space-y-1.5 border-t border-slate-100 dark:border-slate-800/80">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#0284c7] dark:text-[#38bdf8] underline underline-offset-2 font-bold cursor-pointer"
          >
            Sign Up
          </button>
        </p>

        <Link
          to="/"
          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
        >
          ← Back to Platform Overview
        </Link>
      </div>
    </form>
  );
};

// ── Sign Up Form Component ───────────────────────────────────────────────────
const SignUpForm = ({
  onSwitch,
  portalOrg,
  companySlug,
  navigate,
  onOpenTerms,
  termsAccepted,
  setTermsAccepted,
}) => {
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captcha, setCaptcha] = useState({ captchaToken: '', captchaAnswer: '' });
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const handleSignupChange = (e) => {
    setError('');
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const phoneDigits = String(signupData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!termsAccepted) {
      const msg = 'You must accept the Terms & Conditions to create an account.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!captcha.captchaToken || !captcha.captchaAnswer.trim()) {
      const msg = 'Please complete the "I\'m not a robot" verification.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        ...signupData,
        phone: signupData.phone.trim(),
        companySlug: companySlug || undefined,
        captchaToken: captcha.captchaToken,
        captchaAnswer: captcha.captchaAnswer.trim(),
        acceptTerms: true,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Account created! Please sign in to choose your plan.');
        onSwitch();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
      setCaptchaRefreshKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignupSubmit} className="signup space-y-2.5 sm:space-y-3 text-left w-full max-w-sm mx-auto">
      {/* Form Heading (All Screens) */}
      <div className="text-center lg:text-left mb-1.5">
        <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Join us today</h2>
        <p className="text-[11px] lg:text-xs text-slate-500 dark:text-slate-400">Creating an account is quick</p>
      </div>

      {error && (
        <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block" htmlFor="signup-name">
          Your Full Name
        </label>
        <div className="relative group">
          <User size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#07c8f9] transition-colors" />
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            value={signupData.name}
            onChange={handleSignupChange}
            placeholder="e.g. Alex Morgan"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#07c8f9] focus:ring-2 focus:ring-[#07c8f9]/20 transition-all"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block" htmlFor="signup-email">
          Gmail / Email Address
        </label>
        <div className="relative group">
          <Mail size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#07c8f9] transition-colors" />
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            value={signupData.email}
            onChange={handleSignupChange}
            placeholder="name@gmail.com"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#07c8f9] focus:ring-2 focus:ring-[#07c8f9]/20 transition-all"
          />
        </div>
      </div>

      {/* Mobile Number Field */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block" htmlFor="signup-phone">
          Mobile Number
        </label>
        <div className="relative group">
          <Phone size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#07c8f9] transition-colors" />
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            required
            value={signupData.phone}
            onChange={handleSignupChange}
            placeholder="e.g. +91 98765 43210"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#07c8f9] focus:ring-2 focus:ring-[#07c8f9]/20 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block" htmlFor="signup-password">
          Password
        </label>
        <div className="relative group">
          <Lock size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#07c8f9] transition-colors" />
          <input
            id="signup-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            required
            minLength={6}
            value={signupData.password}
            onChange={handleSignupChange}
            placeholder="At least 6 characters"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-9 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#07c8f9] focus:ring-2 focus:ring-[#07c8f9]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* CAPTCHA Verification */}
      <CaptchaWidget
        compact
        inputId="signup-captcha"
        captchaToken={captcha.captchaToken}
        captchaAnswer={captcha.captchaAnswer}
        onChange={(next) => {
          setError('');
          setCaptcha(next);
        }}
        refreshKey={captchaRefreshKey}
      />

      {/* Mandatory Terms & Conditions Checkbox */}
      <label className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer select-none px-1">
        <input
          id="signup-terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => {
            setTermsAccepted(e.target.checked);
            if (e.target.checked) setError('');
          }}
          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#07c8f9] focus:ring-[#07c8f9] cursor-pointer shrink-0"
        />
        <span className="leading-snug">
          I agree to the{' '}
          <button
            type="button"
            onClick={onOpenTerms}
            className="text-[#0284c7] dark:text-[#38bdf8] underline underline-offset-2 font-bold cursor-pointer"
          >
            Terms &amp; Conditions
          </button>{' '}
          <span className="text-red-500">*</span>
        </span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-white font-extrabold text-xs transition-all shadow-sm shadow-[#07c8f9]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={14} />
            <span>Creating account...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span>Sign Up</span>
            <ChevronRight size={14} />
          </span>
        )}
      </button>

      <GoogleAuthButton
        mode="signup"
        companySlug={companySlug}
        label="Sign up with Google"
      />

      {/* Switch to Sign In */}
      <div className="pt-1 text-center space-y-1.5 border-t border-slate-100 dark:border-slate-800/80">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#0284c7] dark:text-[#38bdf8] underline underline-offset-2 font-bold cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};

// ── Main Login Export ────────────────────────────────────────────────────────
export const Login = ({ initialView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const outletCtx = useOutletContext() || {};
  const { portalOrg, companySlug } = outletCtx;
  const { loading, error, isAuthenticated, user, organization: currentOrg } = useSelector((state) => state.auth);
  const darkMode = useSelector((state) => state.ui?.darkMode);

  const defaultView = initialView || (location.pathname.endsWith('/register') ? 'signup' : 'signin');
  const [view, setView] = useState(defaultView);
  const [showPassword, setShowPassword] = useState(false);
  const [portalRedirect, setPortalRedirect] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const [captcha, setCaptcha] = useState({ captchaToken: '', captchaAnswer: '' });
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (initialView) setView(initialView);
    else if (location.pathname.endsWith('/register')) setView('signup');
  }, [initialView, location.pathname]);

  const handleChange = (e) => {
    if (error) dispatch(clearError());
    if (localError) setLocalError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (portalRedirect) setPortalRedirect(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPortalRedirect(null);
    setLocalError('');

    if (!termsAccepted) {
      const msg = 'You must accept the Terms & Conditions to sign in.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (!captcha.captchaToken || !captcha.captchaAnswer.trim()) {
      const msg = 'Please check "I\'m not a robot" before signing in.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    const payload = {
      ...formData,
      companySlug: companySlug || undefined,
      captchaToken: captcha.captchaToken,
      captchaAnswer: captcha.captchaAnswer.trim(),
      acceptTerms: true,
    };
    const result = await dispatch(loginUser(payload));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      const loggedUser = result.payload?.user;
      const loggedOrg = result.payload?.organization;
      if (loggedUser?.role === 'organizationOwner' && loggedOrg?.billingSetupRequired) {
        navigate('/select-plan');
      } else if (loggedUser?.role === 'organizationOwner' && loggedOrg?.companySetupRequired) {
        navigate('/settings?section=company');
      } else if (['superAdmin', 'admin', 'organizationOwner'].includes(loggedUser?.role)) {
        navigate('/select-branch');
      } else {
        navigate('/');
      }
    } else {
      const errData = result.payload;
      if (errData?.requiresCompanyPortal) {
        setPortalRedirect(errData);
      }
      const errorMsg = errData?.message || 'Invalid email or password. Please check your credentials and try again.';
      toast.error(errorMsg);
      setCaptchaRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950">
      {/* Left Split Panel: Abstract Swirling Mesh, Left-Corner Abstract Art & 360° Tagline */}
      <SplitShowcasePanel
        view={view}
        portalOrg={portalOrg}
        onOpenTerms={() => setTermsModalOpen(true)}
      />

      {/* Right Split Panel: Unmodified Sign In / Sign Up Forms */}
      <div className="w-full lg:w-1/2 min-h-[100dvh] flex flex-col justify-between px-4 sm:px-8 lg:px-12 xl:px-16 py-3 sm:py-5 bg-white dark:bg-slate-950 relative">
        <AuthTopBar
          view={view}
          onSelect={setView}
          portalOrg={portalOrg}
          darkMode={darkMode}
          onToggleTheme={() => dispatch(toggleDarkMode())}
        />

        {/* Mobile/Tablet Compact 360° Product Tagline Banner (Desktop sees left panel) */}
        <div className="lg:hidden mt-2 mb-1 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-[#07c8f9]/30 text-[11px] font-semibold text-[#0b5161] dark:text-cyan-200">
            <Zap size={12} className="text-[#07c8f9] shrink-0" />
            <span>Sign in or sign up to explore our 360° product</span>
          </span>
        </div>

        {/* Centered Form Area (Original Form Design Preserved Intact) */}
        <div className="my-auto w-full max-w-sm mx-auto py-3">
          {view === 'signin' ? (
            <SignInForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              error={error}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              portalRedirect={portalRedirect}
              portalOrg={portalOrg}
              companySlug={companySlug}
              onSwitch={() => setView('signup')}
              isAuthenticated={isAuthenticated}
              user={user}
              currentOrg={currentOrg}
              navigate={navigate}
              dispatch={dispatch}
              captcha={captcha}
              setCaptcha={setCaptcha}
              captchaRefreshKey={captchaRefreshKey}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              localError={localError}
              setLocalError={setLocalError}
              onOpenTerms={() => setTermsModalOpen(true)}
            />
          ) : (
            <SignUpForm
              onSwitch={() => setView('signin')}
              portalOrg={portalOrg}
              companySlug={companySlug}
              navigate={navigate}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              onOpenTerms={() => setTermsModalOpen(true)}
            />
          )}
        </div>

        {/* Auth Footer */}
        <footer className="pt-2 pb-16 sm:pb-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} AgencyUpscale ·{' '}
          <RiseWithMediaAttribution linkClassName="text-slate-600 dark:text-slate-300 hover:text-[#07c8f9]" />
        </footer>
      </div>

      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => {
          setTermsAccepted(true);
          setLocalError('');
        }}
      />
    </div>
  );
};

export default Login;
