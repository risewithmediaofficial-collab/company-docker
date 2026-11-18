import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { loginUser, clearError, logout, enterGhostMode } from '../../store/slices/authSlice';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, Building2 } from '@/components/ui/muiIcons';
import { Shield, CheckCircle2, ArrowRight, Radio } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const { portalOrg, companySlug } = outletCtx;
  const { loading, error, isAuthenticated, user, organization: currentOrg } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [portalRedirect, setPortalRedirect] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    if (error) {
      dispatch(clearError());
    }
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

  // ── Multi-Tab Active Session Switcher ──────────────────────────────────────
  // If user is already authenticated in this or another tab and opens a company portal URL
  if (isAuthenticated && user && companySlug) {
    const isSuperAdmin = user.role === 'superAdmin';
    const userOrgId = user.organizationId?._id || user.organizationId || currentOrg?._id;
    const userOrgSlug = user.organizationId?.slug || currentOrg?.slug;
    const userOrgName = user.organizationId?.name || currentOrg?.name || 'Your Current Company';

    const targetSlug = String(companySlug || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();
    const isSameCompany = portalOrg?._id && userOrgId && String(userOrgId) === String(portalOrg._id);
    const isSameSlug = userOrgSlug && targetSlug && userOrgSlug.toLowerCase().trim() === targetSlug;

    // Case A: Platform Super Admin
    if (isSuperAdmin) {
      return (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-700">
              <Shield size={18} />
              <span>Platform Super Admin Active</span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              You are signed in as Platform Super Admin (<strong>{user.email}</strong>).
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                const target = portalOrg || { name: companySlug, slug: companySlug };
                dispatch(enterGhostMode(target));
                toast.success(`Stealth Live View Activated for "${target.name}"`);
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Radio size={15} className="animate-pulse text-emerald-200" />
              <span>Live View {portalOrg?.name || companySlug} CRM</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                toast.info(`Switched to ${portalOrg?.name || companySlug} login`);
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            >
              Sign In with Company Account
            </button>

            <button
              type="button"
              onClick={() => navigate('/platform/companies')}
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              Back to Platform Admin Console
            </button>
          </div>
        </div>
      );
    }

    // Case B: Already in this company
    if (isSameCompany || isSameSlug) {
      return (
        <div className="space-y-5 text-center animate-in fade-in">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center justify-center gap-2 font-bold text-sm text-emerald-700">
              <CheckCircle2 size={18} />
              <span>Already Signed In</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              You are currently signed in to <strong>{portalOrg?.name || userOrgName}</strong> as <strong>{user.name}</strong> ({user.email}).
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all cursor-pointer shadow-md"
            >
              <span>Go to CRM Dashboard</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                toast.info('Signed out. Please enter credentials.');
              }}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              Switch Account / Sign Out
            </button>
          </div>
        </div>
      );
    }

    // Case C: Belongs to a different company tenant
    return (
      <div className="space-y-5 animate-in fade-in">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
            <Building2 size={18} />
            <span>Different Company Account Active</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            You are signed in to <strong>{userOrgName}</strong> as <strong>{user.name}</strong> ({user.email}).
          </p>
          <p className="text-xs text-amber-700">
            To enter <strong>{portalOrg?.name || companySlug}</strong>, sign in with your credentials for this company workspace.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              toast.info(`Switched to ${portalOrg?.name || companySlug} portal.`);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          >
            <span>Sign In to {portalOrg?.name || companySlug}</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            Stay in {userOrgName} Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Workspace Redirect Alert (if company user tried logging in on normal dashboard) */}
      {portalRedirect && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2.5 shadow-lg shadow-amber-500/5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-500 text-sm">
            <Building2 size={18} />
            <span>Company Workspace Login Required</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This account belongs to <strong className="text-foreground">{portalRedirect.companyName}</strong>. Company members cannot sign in through the public platform login and must use their company URL.
          </p>
          <Link
            to={portalRedirect.portalUrl || `/login/${portalRedirect.companySlug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20"
          >
            <span>Go to {portalRedirect.companyName} Login</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {portalOrg && portalOrg.status === 'pending' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <AlertCircle size={15} className="shrink-0 text-amber-600" />
          <span>This workspace is pending Super Admin review. You can log in once activated.</span>
        </div>
      )}

      {portalOrg && portalOrg.status === 'suspended' && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <AlertCircle size={15} className="shrink-0 text-rose-600" />
          <span>This company workspace has been suspended. Please contact platform administration.</span>
        </div>
      )}

      {error && !portalRedirect && (
        <div className="p-3.5 rounded-xl bg-destructive/15 text-destructive text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="h-7 w-7 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
            <AlertCircle size={16} />
          </div>
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1" htmlFor="email">
            Email address or Phone
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Mail size={18} />
            </div>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors text-sm text-foreground"
              placeholder="name@company.com or phone number"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline transition-all"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-2.5 rounded-xl bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors text-sm text-foreground"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <span className="flex items-center">
              {portalOrg ? `Sign In to ${portalOrg.name}` : 'Sign In'}
              <span className="ml-2 transition-transform duration-150 group-hover:translate-x-1">
                →
              </span>
            </span>
          )}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to={portalOrg ? `/register?company=${companySlug}` : '/register'}
            className="font-semibold text-primary hover:underline transition-all"
          >
            Create account
          </Link>
        </p>

        {!portalOrg && (
          <>
            <div className="flex items-center gap-2 text-muted-foreground/50 text-xs">
              <div className="flex-1 h-px bg-border" />
              <span>OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Link
              to="/register-company"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 text-sm font-semibold transition-all"
            >
              🏢 Register Your Company
            </Link>
          </>
        )}

        <div className="pt-2">
          <Link
            to="/about"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            ← Back to Home & Platform Overview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
