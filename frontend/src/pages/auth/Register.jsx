import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, User, Loader2, AlertCircle, Eye, EyeOff } from '@/components/ui/muiIcons';
import axios from 'axios';
import { toast } from 'sonner';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { CaptchaWidget } from '../../components/auth/CaptchaWidget';
import { TermsModal } from '../../components/auth/TermsModal';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [captcha, setCaptcha] = useState({ captchaToken: '', captchaAnswer: '' });
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!termsAccepted) {
      const msg = 'You must accept the Terms & Conditions to create an account.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!captcha.captchaToken || !captcha.captchaAnswer.trim()) {
      const msg = 'Please complete the CAPTCHA verification code.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        ...formData,
        captchaToken: captcha.captchaToken,
        captchaAnswer: captcha.captchaAnswer.trim(),
        acceptTerms: true,
      });
      if (response.data.success) {
        toast.success(response.data.message || 'Registration submitted for approval.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
      setCaptchaRefreshKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1" htmlFor="name">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <User size={18} />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors text-sm"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1" htmlFor="email">
            Gmail / Email address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Mail size={18} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors text-sm"
              placeholder="name@gmail.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1" htmlFor="phone">
            Mobile Number
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Phone size={18} />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors text-sm"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1" htmlFor="password">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-2.5 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <CaptchaWidget
          inputId="register-captcha"
          captchaToken={captcha.captchaToken}
          captchaAnswer={captcha.captchaAnswer}
          onChange={setCaptcha}
          refreshKey={captchaRefreshKey}
        />

        <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            id="register-terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              setError('');
            }}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
          <span>
            I agree to the{' '}
            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              Terms &amp; Conditions
            </button>{' '}
            and Privacy Policy.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center min-h-[44px] py-3 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create New Account'}
        </button>

        <GoogleAuthButton
          mode="signup"
          termsAccepted={termsAccepted}
          onRequireTerms={() => {
            const msg = 'Please accept the Terms & Conditions before continuing with Google.';
            setError(msg);
            toast.error(msg);
          }}
        />
      </form>

      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => setTermsAccepted(true)}
      />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
