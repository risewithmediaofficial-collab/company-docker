import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { loginUser, clearError, logout, enterGhostMode } from '../../store/slices/authSlice';
import {
  UserCheck,
  UserPlus,
  Download,
  Mail,
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

// ── Left Navigation Rail / Mobile Header (CardNav) ───────────────────────────
const CardNav = ({ view, onSelect, portalOrg, darkMode, onToggleTheme }) => (
  <nav className="card-nav relative flex flex-row md:flex-col items-center justify-between md:justify-start w-full md:w-24 shrink-0 py-2.5 px-3.5 sm:px-4 md:py-8 md:px-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 z-30 bg-slate-50/70 dark:bg-slate-900/60 rounded-t-3xl md:rounded-t-none md:rounded-l-3xl">
    {/* Left Side (Mobile Branding) / Top Item (Desktop Logo) */}
    <div className="flex items-center gap-2 md:mb-8 shrink-0 z-10">
      <Link to="/" className="group flex items-center gap-2" title="RiseWithMedia Home">
        <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 p-1.5 md:p-2 shadow-2xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
          {portalOrg?.logo ? (
            <img
              src={portalOrg.logo}
              alt={portalOrg.name}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/branding/rise-with-media-logo.png';
              }}
            />
          ) : (
            <img
              src="/branding/rise-with-media-logo.png"
              alt="RISE WITH MEDIA logo"
              className="h-full w-full object-contain"
            />
          )}
        </div>
        <span className="text-xs font-black text-slate-900 dark:text-white tracking-wider hidden sm:inline-block md:hidden uppercase truncate max-w-[140px]">
          {portalOrg?.name || 'RiseWithMedia'}
        </span>
      </Link>
    </div>

    {/* Center: Modern Segmented Switch Button (Mobile: Exactly Centered / Desktop: Vertical Rail) */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:relative md:top-auto md:left-auto md:translate-x-0 md:translate-y-0 flex flex-row md:flex-col items-center gap-1 md:gap-2.5 p-1 md:p-0 bg-slate-200/70 dark:bg-slate-800/80 md:bg-transparent md:dark:bg-transparent rounded-2xl md:rounded-none border border-slate-200/70 dark:border-slate-700/60 md:border-none shadow-xs md:shadow-none z-10 w-auto md:w-full md:px-2.5">
      {/* Sign In Button */}
      <button
        type="button"
        onClick={() => onSelect('signin')}
        className={`signin group relative flex items-center md:flex-col justify-center gap-1.5 md:gap-1 py-1.5 px-3 md:py-3 md:px-2.5 md:w-full rounded-xl md:rounded-2xl border transition-all duration-200 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
          view === 'signin'
            ? 'text-[#12B7D4] bg-white dark:bg-slate-900 border-[#12B7D4]/25 shadow-2xs md:shadow-sm md:shadow-[#12B7D4]/15'
            : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        {view === 'signin' && (
          <span className="hidden md:block active-bar absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#12B7D4] rounded-r-full shadow-xs" />
        )}
        <UserCheck size={15} className={`transition-transform duration-200 shrink-0 ${view === 'signin' ? 'scale-105 text-[#12B7D4]' : ''}`} />
        <span className="leading-none text-[11px] md:text-xs whitespace-nowrap">Sign In</span>
      </button>

      {/* Sign Up Button */}
      <button
        type="button"
        onClick={() => onSelect('signup')}
        className={`signup group relative flex items-center md:flex-col justify-center gap-1.5 md:gap-1 py-1.5 px-3 md:py-3 md:px-2.5 md:w-full rounded-xl md:rounded-2xl border transition-all duration-200 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
          view === 'signup'
            ? 'text-[#12B7D4] bg-white dark:bg-slate-900 border-[#12B7D4]/25 shadow-2xs md:shadow-sm md:shadow-[#12B7D4]/15'
            : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        {view === 'signup' && (
          <span className="hidden md:block active-bar absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#12B7D4] rounded-r-full shadow-xs" />
        )}
        <UserPlus size={15} className={`transition-transform duration-200 shrink-0 ${view === 'signup' ? 'scale-105 text-[#12B7D4]' : ''}`} />
        <span className="leading-none text-[11px] md:text-xs whitespace-nowrap">Sign Up</span>
      </button>
    </div>

    {/* Right Side: Theme Toggle Button (Mobile: Right Edge / Desktop: Bottom of Rail) */}
    <div className="flex items-center shrink-0 z-10 md:mt-auto md:mb-1 md:w-full md:justify-center md:px-2">
      <button
        type="button"
        onClick={onToggleTheme}
        className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-[#12B7D4] dark:hover:text-[#12B7D4] hover:border-[#12B7D4]/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer shrink-0"
        title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun size={15} className="text-amber-400 md:w-4 md:h-4" />
        ) : (
          <Moon size={15} className="text-slate-600 dark:text-slate-300 md:w-4 md:h-4" />
        )}
      </button>
    </div>
  </nav>
);

// ── Hero Banner Section (CardHero) ───────────────────────────────────────────
const Hero = ({ variant, view, title, subtitle, portalOrg, onOpenTerms }) => {
  const isActive = view === variant;
  return (
    <div
      className={`card-hero-content ${variant} h-[480px] md:h-[630px] flex flex-col justify-center items-center text-center px-6 transition-opacity duration-500 ease-in-out ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Brand Logo Emblem */}
      <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-2.5 flex items-center justify-center mb-4 shadow-lg shadow-black/15 overflow-hidden">
        {portalOrg?.logo ? (
          <img
            src={portalOrg.logo}
            alt={portalOrg.name}
            className="h-full w-full object-contain filter drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.src = '/branding/rise-with-media-logo.png';
            }}
          />
        ) : (
          <img
            src="/branding/rise-with-media-logo.png"
            alt="RiseWithMedia logo"
            className="h-full w-full object-contain filter drop-shadow-sm"
          />
        )}
      </div>

      <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{title}</h2>
      <h3 className="text-xs sm:text-sm text-cyan-100/90 font-medium mt-1 max-w-[210px] leading-relaxed">
        {subtitle}
      </h3>

      <div className="mt-3.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white tracking-widest uppercase">
        {portalOrg?.name ? `${portalOrg.name} Portal` : 'RiseWithMedia OS'}
      </div>

      <button
        type="button"
        onClick={onOpenTerms}
        className="terms inline-flex items-center gap-1.5 mt-6 text-xs text-white/75 hover:text-white transition-opacity duration-300 cursor-pointer"
      >
        <span>Terms &amp; Conditions</span>
        <Download size={13} />
      </button>
    </div>
  );
};

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
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-[#12B7D4]/30 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0e7490] dark:text-[#12B7D4]">
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#12B7D4] hover:bg-[#0ea5c6] shadow-sm shadow-[#12B7D4]/20 transition-all cursor-pointer"
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#12B7D4] hover:bg-[#0ea5c6] transition-all cursor-pointer shadow-sm shadow-[#12B7D4]/20"
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
      {/* Mobile-Only Heading */}
      <div className="md:hidden text-center mb-1">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Please enter your credentials</p>
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
          <Mail size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signin-email"
            name="email"
            type="text"
            autoComplete="username"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com or phone"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
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
          <Lock size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-9 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
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
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#12B7D4] focus:ring-[#12B7D4] cursor-pointer shrink-0"
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
        className={`w-full py-2.5 px-4 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-extrabold text-xs transition-all shadow-sm shadow-[#12B7D4]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
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
        termsAccepted={termsAccepted}
        onRequireTerms={() => {
          const msg = 'You must accept the Terms & Conditions before continuing with Google.';
          setLocalError(msg);
          toast.error(msg);
        }}
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
const SignUpForm = ({ onSwitch, portalOrg, companySlug, navigate, onOpenTerms }) => {
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captcha, setCaptcha] = useState({ captchaToken: '', captchaAnswer: '' });
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const handleSignupChange = (e) => {
    setError('');
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      {/* Mobile-Only Heading */}
      <div className="md:hidden text-center mb-1">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Join us today</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Creating an account is quick</p>
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
          <User size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            value={signupData.name}
            onChange={handleSignupChange}
            placeholder="e.g. Alex Morgan"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block" htmlFor="signup-email">
          Gmail / Email Address
        </label>
        <div className="relative group">
          <Mail size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            value={signupData.email}
            onChange={handleSignupChange}
            placeholder="name@gmail.com"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block" htmlFor="signup-password">
          Password
        </label>
        <div className="relative group">
          <Lock size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signup-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            required
            minLength={6}
            value={signupData.password}
            onChange={handleSignupChange}
            placeholder="At least 6 characters"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2 pl-9 pr-9 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
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
          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#12B7D4] focus:ring-[#12B7D4] cursor-pointer shrink-0"
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
        className="w-full py-2.5 px-4 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-extrabold text-xs transition-all shadow-sm shadow-[#12B7D4]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
        termsAccepted={termsAccepted}
        onRequireTerms={() => {
          const msg = 'You must accept the Terms & Conditions before continuing with Google.';
          setError(msg);
          toast.error(msg);
        }}
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
    <div className="w-full flex items-center justify-center p-1 sm:p-4">
      {/* 3-Section Card (Nav + Elevated 3D Hero + Forms) */}
      <div
        className={`card ${view} relative w-full max-w-[860px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-stretch overflow-hidden md:overflow-visible transition-all duration-300`}
      >
        {/* 1. Left Nav / Mobile Top Header */}
        <CardNav
          view={view}
          onSelect={setView}
          portalOrg={portalOrg}
          darkMode={darkMode}
          onToggleTheme={() => dispatch(toggleDarkMode())}
        />

        {/* 2. Center 3D Elevated Hero Banner (Desktop Only) */}
        <div className="card-hero relative hidden md:flex flex-col shrink-0 w-[280px] lg:w-[300px] -my-6 rounded-[22px] overflow-hidden shadow-[0_18px_45px_rgba(18,183,212,0.22)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.65)] z-20">
          {/* Animated Hero Background */}
          <div
            className={`card-hero-bg absolute -inset-y-6 inset-x-0 transition-transform duration-500 ease-in-out ${
              view === 'signup' ? '-translate-y-6' : 'translate-y-0'
            } bg-gradient-to-br from-[#06242c] via-[#0b5161] to-[#12B7D4]`}
          >
            {/* Tech Mesh Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] [background-size:18px_18px]" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#12B7D4]/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/25 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Animated Hero Content Sliding Column */}
          <div
            className={`card-hero-inner absolute inset-x-0 transition-all duration-500 ease-in-out ${
              view === 'signup' ? '-top-full' : 'top-0'
            } z-10`}
          >
            <Hero
              variant="signin"
              view={view}
              title="Welcome back"
              subtitle={portalOrg ? `Sign in to ${portalOrg.name} CRM workspace` : 'Please enter your credentials'}
              portalOrg={portalOrg}
              onOpenTerms={() => setTermsModalOpen(true)}
            />
            <Hero
              variant="signup"
              view={view}
              title="Join us today"
              subtitle="Creating an account is quick"
              portalOrg={portalOrg}
              onOpenTerms={() => setTermsModalOpen(true)}
            />
          </div>
        </div>

        {/* 3. Form Container Sliding Area */}
        <div className="card-form w-full flex-auto min-w-0 relative overflow-hidden h-[610px] sm:h-[620px] md:h-[630px]">
          <div
            className={`forms absolute inset-x-0 top-0 h-[200%] transition-transform duration-500 ease-in-out ${
              view === 'signup' ? '-translate-y-1/2' : 'translate-y-0'
            }`}
          >
            {/* Form 1: Sign In */}
            <div className="h-1/2 w-full px-4 py-2.5 sm:px-6 sm:py-4 md:px-8 md:py-5 flex flex-col justify-start md:justify-center overflow-y-auto">
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
            </div>

            {/* Form 2: Sign Up */}
            <div className="h-1/2 w-full px-4 py-2.5 sm:px-6 sm:py-4 md:px-8 md:py-5 flex flex-col justify-start md:justify-center overflow-y-auto">
              <SignUpForm
                onSwitch={() => setView('signin')}
                portalOrg={portalOrg}
                companySlug={companySlug}
                navigate={navigate}
                onOpenTerms={() => setTermsModalOpen(true)}
              />
            </div>
          </div>
        </div>
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
