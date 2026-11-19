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
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Inline Brand & Social Icons
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 fill-current text-slate-800 dark:text-white" viewBox="0 0 170 170">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.66-7.85-11.91-14.43-5.78-9.13-10.28-19.26-13.5-30.39-3.23-11.13-4.84-21.78-4.84-31.94 0-14.24 3.58-26.06 10.74-35.45 7.16-9.39 16.27-14.2 27.32-14.43 4.8 0 10.14 1.3 16.03 3.9 5.89 2.6 9.87 3.95 11.94 4.07 1.73-.24 5.86-1.63 12.39-4.17 6.53-2.54 12.18-3.69 16.95-3.45 12.74.72 22.95 5.48 30.63 14.28-11.09 6.74-16.52 16.09-16.3 28.05.22 9.35 3.75 17.29 10.59 23.82 6.84 6.53 15.11 10.33 24.81 11.41-2.17 6.52-4.89 13.15-8.16 19.89zM119.22 33.15c0-7.28 2.66-14.13 7.98-20.55 5.32-6.41 11.85-10.43 19.59-12.05.22 1.3.33 2.44.33 3.42 0 7.28-2.77 14.13-8.31 20.55-5.54 6.41-12.23 10.33-20.08 11.74-.22-1.09-.33-2.07-.33-3.11z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ── Left Navigation Rail (CardNav) ───────────────────────────────────────────
const CardNav = ({ view, onSelect, portalOrg }) => (
  <ul className="card-nav flex flex-row md:flex-col items-center justify-between md:justify-start w-full md:w-24 shrink-0 py-3.5 md:py-8 px-4 md:px-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 relative z-30 bg-slate-50/70 dark:bg-slate-900/60 rounded-t-3xl md:rounded-t-none md:rounded-l-3xl">
    {/* Logo & Brand Indicator */}
    <li className="flex flex-col items-center mb-0 md:mb-10 shrink-0">
      <Link to="/" className="group flex flex-col items-center">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
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
      </Link>
    </li>

    {/* Navigation Tabs */}
    <div className="flex flex-row md:flex-col items-center gap-1.5 md:gap-3 w-auto md:w-full px-1 md:px-2">
      {/* Sign In Button */}
      <li className="w-auto md:w-full">
        <button
          type="button"
          onClick={() => onSelect('signin')}
          className={`signin group relative flex items-center md:flex-col justify-center gap-1.5 md:gap-1 w-full py-2 px-3 md:py-3.5 md:px-1 rounded-2xl transition-all duration-300 text-xs font-bold cursor-pointer ${
            view === 'signin'
              ? 'text-[#12B7D4] bg-white dark:bg-slate-800 shadow-sm shadow-[#12B7D4]/15'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          {/* Active side bar (desktop) */}
          {view === 'signin' && (
            <span className="hidden md:block active-bar absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#12B7D4] rounded-r-full shadow-xs" />
          )}
          <UserCheck size={18} className={`transition-transform duration-200 ${view === 'signin' ? 'scale-110 text-[#12B7D4]' : ''}`} />
          <span className="leading-none text-[11px] md:text-xs">Sign In</span>
        </button>
      </li>

      {/* Sign Up Button */}
      <li className="w-auto md:w-full">
        <button
          type="button"
          onClick={() => onSelect('signup')}
          className={`signup group relative flex items-center md:flex-col justify-center gap-1.5 md:gap-1 w-full py-2 px-3 md:py-3.5 md:px-1 rounded-2xl transition-all duration-300 text-xs font-bold cursor-pointer ${
            view === 'signup'
              ? 'text-[#12B7D4] bg-white dark:bg-slate-800 shadow-sm shadow-[#12B7D4]/15'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          {/* Active side bar (desktop) */}
          {view === 'signup' && (
            <span className="hidden md:block active-bar absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#12B7D4] rounded-r-full shadow-xs" />
          )}
          <UserPlus size={18} className={`transition-transform duration-200 ${view === 'signup' ? 'scale-110 text-[#12B7D4]' : ''}`} />
          <span className="leading-none text-[11px] md:text-xs">Sign Up</span>
        </button>
      </li>
    </div>
  </ul>
);

// ── Hero Banner Section (CardHero) ───────────────────────────────────────────
const Hero = ({ variant, view, title, subtitle, portalOrg }) => {
  const isActive = view === variant;
  return (
    <div
      className={`card-hero-content ${variant} h-[520px] flex flex-col justify-center items-center text-center px-6 transition-opacity duration-500 ease-in-out ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2.5 flex items-center justify-center mb-5 shadow-lg shadow-black/15">
        {variant === 'signin' ? (
          <Sparkles className="text-white" size={26} />
        ) : (
          <UserPlus className="text-white" size={26} />
        )}
      </div>

      <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{title}</h2>
      <h3 className="text-xs sm:text-sm text-cyan-100/90 font-medium mt-1.5 max-w-[220px] leading-relaxed">
        {subtitle}
      </h3>

      <div className="mt-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white tracking-widest uppercase">
        {portalOrg?.name ? `${portalOrg.name} Portal` : 'RiseWithMedia OS'}
      </div>

      <a
        href="#terms"
        onClick={(e) => {
          e.preventDefault();
          toast.info('RiseWithMedia Security SLA: 99.98% uptime with isolated tenant workspaces.');
        }}
        className="terms inline-flex items-center gap-1.5 mt-8 text-xs text-white/70 hover:text-white transition-opacity duration-300 cursor-pointer"
      >
        <span>Terms &amp; Conditions</span>
        <Download size={13} />
      </a>
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
        <div className="space-y-4 text-left">
          <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-[#12B7D4]/30 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-[#0e7490] dark:text-[#12B7D4]">
              <Shield size={16} />
              <span>Platform Super Admin Active</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#12B7D4] hover:bg-[#0ea5c6] shadow-md shadow-[#12B7D4]/20 transition-all cursor-pointer"
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
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              Sign In with Company Account
            </button>
          </div>
        </div>
      );
    }

    if (isSameCompany || isSameSlug) {
      return (
        <div className="space-y-4 text-center">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <div className="flex items-center justify-center gap-2 font-bold text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={16} />
              <span>Already Signed In</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Signed in to <strong>{portalOrg?.name || userOrgName}</strong> as <strong>{user.name}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#12B7D4] hover:bg-[#0ea5c6] transition-all cursor-pointer shadow-md shadow-[#12B7D4]/20"
          >
            <span>Go to CRM Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="signin space-y-3.5 text-left">
      {/* Mobile-Only Heading */}
      <div className="md:hidden text-center mb-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Please enter your credentials</p>
      </div>

      {/* Social Logins Bar */}
      <div className="flex items-center justify-center gap-2.5 mb-1">
        <button
          type="button"
          onClick={() => toast.info('Google Workspace single sign-on is enabled for enterprise accounts.')}
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer flex-1"
          title="Sign in with Google"
        >
          <GoogleIcon />
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => toast.info('Apple ID single sign-on is enabled for agency accounts.')}
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer flex-1"
          title="Sign in with Apple"
        >
          <AppleIcon />
          <span>Apple</span>
        </button>
        <button
          type="button"
          onClick={() => toast.info('Enterprise SSO is enabled for agency accounts.')}
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer flex-1"
          title="Sign in with SSO"
        >
          <FacebookIcon />
          <span>SSO</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 text-[10px] uppercase font-bold tracking-wider my-2">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span>or credentials</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Redirect / Review Alerts */}
      {portalRedirect && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
            <Building2 size={15} />
            <span>Company Workspace URL Required</span>
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

      {error && !portalRedirect && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Email / Phone Field */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block" htmlFor="signin-email">
          Email address or Phone
        </label>
        <div className="relative group">
          <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signin-email"
            name="email"
            type="text"
            autoComplete="username"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com or phone"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="signin-password">
            Password
          </label>
          <Link to="/forgot-password" className="text-[11px] text-[#12B7D4] hover:underline font-semibold">
            Forgot password?
          </Link>
        </div>
        <div className="relative group">
          <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-extrabold text-xs transition-all shadow-md shadow-[#12B7D4]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={15} />
            <span>Signing in...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span>{portalOrg ? `Sign In to ${portalOrg.name}` : 'Sign In'}</span>
            <ArrowRight size={14} />
          </span>
        )}
      </button>

      {/* Quick Links & Switchers */}
      <div className="pt-2 text-center space-y-2 border-t border-slate-100 dark:border-slate-800/80">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#12B7D4] hover:underline font-bold cursor-pointer"
          >
            Sign Up
          </button>
        </p>

        {!portalOrg && (
          <Link
            to="/register-company"
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-[#12B7D4]/30 bg-[#12B7D4]/5 hover:bg-[#12B7D4]/10 text-[#0e7490] dark:text-[#12B7D4] text-xs font-bold transition-all"
          >
            <Building2 size={14} />
            <span>Register Your Company (14-Day Free Trial)</span>
          </Link>
        )}

        <Link
          to="/"
          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
        >
          ← Back to Platform Overview
        </Link>
      </div>
    </form>
  );
};

// ── Sign Up Form Component ───────────────────────────────────────────────────
const SignUpForm = ({ onSwitch, portalOrg, companySlug, navigate }) => {
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSignupChange = (e) => {
    setError('');
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register', signupData);
      if (res.data.success) {
        toast.success(res.data.message || 'Account created! Please sign in with your credentials.');
        onSwitch();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignupSubmit} className="signup space-y-3.5 text-left">
      {/* Mobile-Only Heading */}
      <div className="md:hidden text-center mb-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Join us today</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Creating an account is quick</p>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block" htmlFor="signup-name">
          Your Full Name
        </label>
        <div className="relative group">
          <User size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            value={signupData.name}
            onChange={handleSignupChange}
            placeholder="e.g. Alex Morgan"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block" htmlFor="signup-email">
          Work Email
        </label>
        <div className="relative group">
          <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            value={signupData.email}
            onChange={handleSignupChange}
            placeholder="name@company.com"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block" htmlFor="signup-password">
          Password
        </label>
        <div className="relative group">
          <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none group-focus-within:text-[#12B7D4] transition-colors" />
          <input
            id="signup-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            required
            minLength={6}
            value={signupData.password}
            onChange={handleSignupChange}
            placeholder="At least 6 characters"
            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Account Type Role */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
          Role in Organization
        </label>
        <select
          name="role"
          value={signupData.role}
          onChange={handleSignupChange}
          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#12B7D4] focus:ring-2 focus:ring-[#12B7D4]/20 transition-all cursor-pointer"
        >
          <option value="employee">Team Member / Staff</option>
          <option value="client">Client / External Partner</option>
          <option value="manager">Project Manager</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-extrabold text-xs transition-all shadow-md shadow-[#12B7D4]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={15} />
            <span>Creating account...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span>Sign Up</span>
            <ChevronRight size={14} />
          </span>
        )}
      </button>

      {/* Switch to Sign In & Register Company */}
      <div className="pt-2 text-center space-y-2 border-t border-slate-100 dark:border-slate-800/80">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#12B7D4] hover:underline font-bold cursor-pointer"
          >
            Sign In
          </button>
        </p>

        <Link
          to="/register-company"
          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all"
        >
          <Zap size={14} />
          <span>Setting up a company? Start Free Trial →</span>
        </Link>
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

  const defaultView = initialView || (location.pathname.endsWith('/register') ? 'signup' : 'signin');
  const [view, setView] = useState(defaultView);
  const [showPassword, setShowPassword] = useState(false);
  const [portalRedirect, setPortalRedirect] = useState(null);
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (portalRedirect) setPortalRedirect(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPortalRedirect(null);
    const payload = {
      ...formData,
      companySlug: companySlug || undefined,
    };
    const result = await dispatch(loginUser(payload));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      const errData = result.payload;
      if (errData?.requiresCompanyPortal) {
        setPortalRedirect(errData);
      }
      const errorMsg = errData?.message || 'Invalid email or password. Please check your credentials and try again.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4">
      {/* 3-Section Card (Nav + Elevated 3D Hero + Forms) */}
      <div
        className={`card ${view} relative w-full max-w-[880px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row items-stretch overflow-hidden md:overflow-visible transition-all duration-300`}
      >
        {/* 1. Left Nav */}
        <CardNav view={view} onSelect={setView} portalOrg={portalOrg} />

        {/* 2. Center 3D Elevated Hero Banner (Desktop) */}
        <div className="card-hero relative hidden md:flex flex-col shrink-0 w-[300px] -my-7 rounded-[22px] overflow-hidden shadow-[0_18px_45px_rgba(18,183,212,0.22)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.65)] z-20">
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
            />
            <Hero
              variant="signup"
              view={view}
              title="Join us today"
              subtitle="Creating an account is quick"
              portalOrg={portalOrg}
            />
          </div>
        </div>

        {/* 3. Form Container Sliding Area */}
        <div className="card-form w-full flex-auto min-w-0 relative overflow-hidden h-[540px] sm:h-[560px]">
          <div
            className={`forms absolute inset-x-0 top-0 h-[200%] transition-transform duration-500 ease-in-out ${
              view === 'signup' ? '-translate-y-1/2' : 'translate-y-0'
            }`}
          >
            {/* Form 1: Sign In */}
            <div className="h-1/2 w-full p-5 sm:p-7 md:p-8 flex flex-col justify-center overflow-y-auto">
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
              />
            </div>

            {/* Form 2: Sign Up */}
            <div className="h-1/2 w-full p-5 sm:p-7 md:p-8 flex flex-col justify-center overflow-y-auto">
              <SignUpForm
                onSwitch={() => setView('signin')}
                portalOrg={portalOrg}
                companySlug={companySlug}
                navigate={navigate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
