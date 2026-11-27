import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMe } from '../../store/slices/authSlice';

export default function GoogleOAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState('processing'); // 'processing' | 'pending' | 'portal' | 'error'
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [message, setMessage] = useState('Completing Google sign-in...');
  const [portalUrl, setPortalUrl] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const hashRaw = location.hash ? location.hash.replace(/^#/, '') : '';
    const hashParams = new URLSearchParams(hashRaw);
    const queryParams = new URLSearchParams(location.search);

    const accessToken = hashParams.get('accessToken');
    const refreshToken = hashParams.get('refreshToken');
    const isNewAccount = hashParams.get('newAccount') === '1' || queryParams.get('newAccount') === '1';
    const oauthError = queryParams.get('oauthError');
    const signupPending = queryParams.get('signupPending');
    const requiresPortal = queryParams.get('requiresCompanyPortal');
    const targetPortalUrl = queryParams.get('portalUrl');
    const targetCompany = queryParams.get('companyName');
    const msg = queryParams.get('message');

    if (accessToken) {
      if (isNewAccount) {
        setIsCreatingAccount(true);
        setMessage('No existing account found — creating your new Agency Upscale workspace...');
      }
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      window.history.replaceState({}, document.title, '/auth/google/callback');

      let active = true;
      dispatch(fetchMe())
        .unwrap()
        .then((meData) => {
          if (!active) return;
          const org = meData?.organization;
          const destination =
            meData?.user?.role === 'organizationOwner' && org?.billingSetupRequired
              ? '/select-plan'
              : meData?.user?.role === 'organizationOwner' && org?.companySetupRequired
              ? '/settings?section=company'
              : '/';

          if (isNewAccount) {
            toast.success('Account created! Setting up your workspace...');
            setTimeout(() => {
              if (active) navigate(destination, { replace: true });
            }, 850);
          } else {
            toast.success('Signed in with Google!');
            navigate(destination, { replace: true });
          }
        })
        .catch((err) => {
          if (!active) return;
          setStatus('error');
          setMessage(err?.message || 'Failed to load user session');
        });
      return () => {
        active = false;
      };
    }

    if (signupPending) {
      setStatus('pending');
      setMessage(msg || 'Google registration submitted. An administrator must approve your account before signing in.');
      return;
    }

    if (requiresPortal && targetPortalUrl) {
      setStatus('portal');
      setPortalUrl(targetPortalUrl);
      setCompanyName(targetCompany || 'Your Company');
      setMessage(oauthError || 'Please sign in through your company portal URL.');
      return;
    }

    setStatus('error');
    setMessage(oauthError || 'Google authentication was cancelled or failed.');
  }, [location, dispatch, navigate]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader2 className="h-9 w-9 text-[#07c8f9] animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-foreground">
              {isCreatingAccount ? 'Creating your account...' : 'Signing you in with Google...'}
            </h2>
            <p className="text-xs text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Account Created</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-[#07c8f9] text-white text-xs font-bold hover:bg-[#06b4e0]"
            >
              Back to Login
            </Link>
          </>
        )}

        {status === 'portal' && (
          <>
            <Building2 className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Workspace URL Required</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This account belongs to <strong>{companyName}</strong>. {message}
            </p>
            <Link
              to={portalUrl}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-[#07c8f9] text-white text-xs font-bold hover:bg-[#06b4e0]"
            >
              Go to {companyName} Portal →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Google Sign-In Issue</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80"
            >
              Return to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
