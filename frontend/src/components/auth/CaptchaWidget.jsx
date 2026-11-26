import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const CaptchaWidget = ({
  onChange,
  refreshKey = 0,
  inputId = 'signin-robot-check',
  compact = false,
}) => {
  const [mode, setMode] = useState('robot_check'); // 'robot_check' | 'recaptcha'
  const [siteKey, setSiteKey] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'verified'
  const onChangeRef = useRef(onChange);
  const recaptchaContainerRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);

  onChangeRef.current = onChange;

  const resetWidget = useCallback(() => {
    setStatus('idle');
    onChangeRef.current?.({ captchaToken: '', captchaAnswer: '' });
    if (mode === 'recaptcha' && window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
      try {
        window.grecaptcha.reset(recaptchaWidgetIdRef.current);
      } catch {
        // Ignore reset error
      }
    }
  }, [mode]);

  useEffect(() => {
    resetWidget();
  }, [refreshKey, resetWidget]);

  useEffect(() => {
    let mounted = true;
    axios
      .get('/api/auth/captcha')
      .then((res) => {
        if (!mounted || !res.data?.success) return;
        if (res.data.mode === 'recaptcha' && res.data.siteKey) {
          setMode('recaptcha');
          setSiteKey(res.data.siteKey);
        }
      })
      .catch(() => {
        // Stay in robot_check mode; backend health will be checked cleanly on click
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load Google reCAPTCHA v2 script only when RECAPTCHA_SITE_KEY is configured
  useEffect(() => {
    if (mode !== 'recaptcha' || !siteKey || !recaptchaContainerRef.current) return;

    const renderWidget = () => {
      if (!window.grecaptcha || !recaptchaContainerRef.current) return;
      if (recaptchaWidgetIdRef.current !== null) return;
      window.grecaptcha.ready(() => {
        if (!recaptchaContainerRef.current || recaptchaWidgetIdRef.current !== null) return;
        recaptchaWidgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            setStatus('verified');
            onChangeRef.current?.({ captchaToken: 'recaptcha', captchaAnswer: token });
          },
          'expired-callback': () => {
            setStatus('idle');
            onChangeRef.current?.({ captchaToken: '', captchaAnswer: '' });
          },
        });
      });
    };

    if (window.grecaptcha) {
      renderWidget();
      return;
    }

    const existingScript = document.querySelector('script[data-rwm-recaptcha="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', renderWidget);
      return () => existingScript.removeEventListener('load', renderWidget);
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.rwmRecaptcha = 'true';
    script.addEventListener('load', renderWidget);
    document.head.appendChild(script);
  }, [mode, siteKey]);

  const handleRobotVerify = async () => {
    if (status === 'verifying' || status === 'verified') return;
    setStatus('verifying');

    try {
      const [res] = await Promise.all([
        axios.get('/api/auth/captcha', { params: { t: Date.now() } }),
        new Promise((resolve) => setTimeout(resolve, 260)),
      ]);

      if (res.data?.mode === 'recaptcha' && res.data?.siteKey) {
        setMode('recaptcha');
        setSiteKey(res.data.siteKey);
        setStatus('idle');
        return;
      }

      if (res.data?.success && res.data?.captchaToken && res.data?.challengeProof) {
        setStatus('verified');
        onChangeRef.current?.({
          captchaToken: res.data.captchaToken,
          captchaAnswer: res.data.challengeProof,
        });
      } else {
        setStatus('idle');
        toast.error('Verification challenge could not be completed. Please try again.');
      }
    } catch {
      setStatus('idle');
      toast.error('Robot verification service is unavailable. Please ensure the backend server is running.');
    }
  };

  if (mode === 'recaptcha') {
    return (
      <div className="flex justify-start overflow-x-auto py-0.5">
        <div ref={recaptchaContainerRef} />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border transition-all select-none ${
        compact ? 'px-3 py-2' : 'px-3.5 py-2.5'
      } ${
        status === 'verified'
          ? 'border-emerald-300 dark:border-emerald-700/70 bg-emerald-50/70 dark:bg-emerald-950/30'
          : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <button
        id={inputId}
        type="button"
        role="checkbox"
        aria-checked={status === 'verified'}
        aria-label="I'm not a robot"
        onClick={handleRobotVerify}
        className="flex items-center gap-2.5 flex-1 text-left cursor-pointer focus:outline-none"
      >
        <span
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
            status === 'verified'
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
              : status === 'verifying'
              ? 'border-[#07c8f9] bg-white dark:bg-slate-900'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-[#07c8f9]'
          }`}
        >
          {status === 'verifying' ? (
            <Loader2 size={13} className="animate-spin text-[#07c8f9]" />
          ) : status === 'verified' ? (
            <Check size={13} strokeWidth={3} />
          ) : null}
        </span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
          {status === 'verifying'
            ? 'Verifying...'
            : status === 'verified'
            ? "I'm not a robot"
            : "I'm not a robot"}
        </span>
      </button>

      <div className="flex flex-col items-end shrink-0 leading-none">
        <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
          <ShieldCheck
            size={14}
            className={status === 'verified' ? 'text-emerald-500' : 'text-[#07c8f9]'}
          />
          <span>{status === 'verified' ? 'Verified' : 'Security'}</span>
        </div>
        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Human Check</span>
      </div>
    </div>
  );
};
