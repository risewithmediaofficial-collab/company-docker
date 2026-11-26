import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Check,
  Loader2,
  ShieldCheck,
  Camera,
  Rocket,
  Briefcase,
  Compass,
  Bell,
  Key,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const TILE_ICON_MAP = {
  camera: Camera,
  rocket: Rocket,
  briefcase: Briefcase,
  compass: Compass,
  bell: Bell,
  key: Key,
};

const TONE_CLASSES = {
  cyan: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300',
  sky: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300',
  amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300',
  violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300',
  rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300',
};

const EXTERNAL_SCRIPT_META = {
  hcaptcha: {
    attr: 'data-rwm-hcaptcha',
    src: 'https://js.hcaptcha.com/1/api.js?render=explicit',
    getApi: () => window.hcaptcha,
  },
  turnstile: {
    attr: 'data-rwm-turnstile',
    src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    getApi: () => window.turnstile,
  },
  recaptcha: {
    attr: 'data-rwm-recaptcha',
    src: 'https://www.google.com/recaptcha/api.js?render=explicit',
    getApi: () => window.grecaptcha,
  },
};

export const CaptchaWidget = ({
  onChange,
  refreshKey = 0,
  inputId = 'signin-robot-check',
  compact = false,
}) => {
  const [mode, setMode] = useState('robot_check'); // 'robot_check' | 'hcaptcha' | 'turnstile' | 'recaptcha'
  const [siteKey, setSiteKey] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'verified'
  const [modalOpen, setModalOpen] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [selectedTileIds, setSelectedTileIds] = useState([]);
  const [challengeError, setChallengeError] = useState('');
  const [submittingChallenge, setSubmittingChallenge] = useState(false);

  const onChangeRef = useRef(onChange);
  const widgetContainerRef = useRef(null);
  const widgetIdRef = useRef(null);

  onChangeRef.current = onChange;

  const resetWidget = useCallback(() => {
    setStatus('idle');
    setModalOpen(false);
    setChallenge(null);
    setSelectedTileIds([]);
    setChallengeError('');
    onChangeRef.current?.({ captchaToken: '', captchaAnswer: '' });

    if (widgetIdRef.current !== null) {
      try {
        if (mode === 'hcaptcha' && window.hcaptcha) {
          window.hcaptcha.reset(widgetIdRef.current);
        } else if (mode === 'turnstile' && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        } else if (mode === 'recaptcha' && window.grecaptcha) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      } catch {
        // Ignore external widget reset errors
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
        if (
          ['hcaptcha', 'turnstile', 'recaptcha'].includes(res.data.mode) &&
          res.data.siteKey
        ) {
          setMode(res.data.mode);
          setSiteKey(res.data.siteKey);
        }
      })
      .catch(() => {
        // Stay in built-in interactive mode until clicked
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load external provider script (hCaptcha / Cloudflare Turnstile / Google reCAPTCHA)
  useEffect(() => {
    if (!['hcaptcha', 'turnstile', 'recaptcha'].includes(mode)) return;
    if (!siteKey || !widgetContainerRef.current) return;

    const meta = EXTERNAL_SCRIPT_META[mode];
    if (!meta) return;

    const renderExternal = () => {
      const api = meta.getApi();
      if (!api || !widgetContainerRef.current) return;
      if (widgetIdRef.current !== null) return;

      const mount = () => {
        if (!widgetContainerRef.current || widgetIdRef.current !== null) return;
        const opts = {
          sitekey: siteKey,
          callback: (token) => {
            setStatus('verified');
            onChangeRef.current?.({ captchaToken: mode, captchaAnswer: token });
          },
          'expired-callback': () => {
            setStatus('idle');
            onChangeRef.current?.({ captchaToken: '', captchaAnswer: '' });
          },
          'error-callback': () => {
            setStatus('idle');
            onChangeRef.current?.({ captchaToken: '', captchaAnswer: '' });
          },
        };
        if (mode === 'turnstile') {
          opts.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        widgetIdRef.current = api.render(widgetContainerRef.current, opts);
      };

      if (mode === 'recaptcha' && typeof api.ready === 'function') {
        api.ready(mount);
      } else {
        mount();
      }
    };

    if (meta.getApi()) {
      renderExternal();
      return;
    }

    const existingScript = document.querySelector(`script[${meta.attr}="true"]`);
    if (existingScript) {
      existingScript.addEventListener('load', renderExternal);
      return () => existingScript.removeEventListener('load', renderExternal);
    }

    const script = document.createElement('script');
    script.src = meta.src;
    script.async = true;
    script.defer = true;
    script.setAttribute(meta.attr, 'true');
    script.addEventListener('load', renderExternal);
    document.head.appendChild(script);
  }, [mode, siteKey]);

  const fetchVisualChallenge = async () => {
    const res = await axios.get('/api/auth/captcha', { params: { t: Date.now() } });
    if (
      ['hcaptcha', 'turnstile', 'recaptcha'].includes(res.data?.mode) &&
      res.data?.siteKey
    ) {
      setMode(res.data.mode);
      setSiteKey(res.data.siteKey);
      setStatus('idle');
      setModalOpen(false);
      return null;
    }
    return res.data;
  };

  const handleRobotVerify = async () => {
    if (status === 'verifying' || status === 'verified') return;
    setStatus('verifying');
    setChallengeError('');

    try {
      const data = await fetchVisualChallenge();
      if (!data) return;

      // Interactive visual tile challenge (hCaptcha-style)
      if (data?.success && Array.isArray(data?.tiles) && data.tiles.length > 0 && data.captchaToken) {
        setChallenge(data);
        setSelectedTileIds([]);
        setStatus('idle');
        setModalOpen(true);
        return;
      }

      // Legacy single-step mock response support
      if (data?.success && data?.captchaToken && data?.challengeProof) {
        setStatus('verified');
        onChangeRef.current?.({
          captchaToken: data.captchaToken,
          captchaAnswer: data.challengeProof,
        });
      } else {
        setStatus('idle');
        toast.error('Verification challenge could not be loaded. Please try again.');
      }
    } catch {
      setStatus('idle');
      toast.error('Human verification service is unavailable. Please ensure the backend is running.');
    }
  };

  const handleRefreshVisualChallenge = async () => {
    setChallengeError('');
    setSelectedTileIds([]);
    try {
      const data = await fetchVisualChallenge();
      if (data?.success && Array.isArray(data?.tiles)) {
        setChallenge(data);
      }
    } catch {
      setChallengeError('Unable to refresh challenge. Please try again.');
    }
  };

  const toggleTile = (tileId) => {
    setChallengeError('');
    setSelectedTileIds((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  const handleSubmitVisualChallenge = async () => {
    if (!challenge?.captchaToken) return;
    if (selectedTileIds.length === 0) {
      setChallengeError(`Please select all ${challenge.targetLabel || 'matching'} images.`);
      return;
    }

    setSubmittingChallenge(true);
    setChallengeError('');

    try {
      const answer = [...selectedTileIds].sort((a, b) => a - b).join(',');
      const res = await axios.post('/api/auth/captcha/verify', {
        captchaToken: challenge.captchaToken,
        captchaAnswer: answer,
      });

      if (res.data?.success && res.data?.captchaToken && res.data?.challengeProof) {
        setStatus('verified');
        setModalOpen(false);
        setChallenge(null);
        setSelectedTileIds([]);
        onChangeRef.current?.({
          captchaToken: res.data.captchaToken,
          captchaAnswer: res.data.challengeProof,
        });
      } else {
        setChallengeError('Verification failed. Loading a new challenge...');
        await handleRefreshVisualChallenge();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect selection. Please try the new challenge.';
      await handleRefreshVisualChallenge();
      setChallengeError(msg);
    } finally {
      setSubmittingChallenge(false);
    }
  };

  if (['hcaptcha', 'turnstile', 'recaptcha'].includes(mode)) {
    return (
      <div className="flex justify-start overflow-x-auto py-0.5">
        <div ref={widgetContainerRef} />
      </div>
    );
  }

  const TargetIcon = TILE_ICON_MAP[challenge?.targetIcon] || ShieldCheck;

  return (
    <>
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
          aria-label="I am human"
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
            {status === 'verifying' ? 'Loading challenge...' : 'I am human'}
          </span>
        </button>

        <div className="flex flex-col items-end shrink-0 leading-none">
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
            <ShieldCheck
              size={14}
              className={status === 'verified' ? 'text-emerald-500' : 'text-[#07c8f9]'}
            />
            <span>{status === 'verified' ? 'Verified' : 'Human Check'}</span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Privacy • Security</span>
        </div>
      </div>

      {/* hCaptcha-style Visual Verification Challenge Modal */}
      {modalOpen &&
        challenge &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Human verification challenge"
          >
            <div className="w-full max-w-[340px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Top Prompt Header */}
              <div className="bg-[#07c8f9] text-white px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Human Verification
                  </p>
                  <p className="text-sm font-black leading-snug mt-0.5">
                    {challenge.challengePrompt || `Select all ${challenge.targetLabel} images`}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <TargetIcon size={22} className="text-white" />
                </div>
              </div>

              {/* 2x3 Visual Tile Grid */}
              <div className="p-3.5">
                {challengeError && (
                  <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px] font-semibold">
                    {challengeError}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {(challenge.tiles || []).map((tile) => {
                    const IconComp = TILE_ICON_MAP[tile.icon] || ShieldCheck;
                    const isSelected = selectedTileIds.includes(tile.id);
                    const toneCls = TONE_CLASSES[tile.bgTone] || TONE_CLASSES.cyan;

                    return (
                      <button
                        key={tile.id}
                        type="button"
                        data-testid={`captcha-tile-${tile.id}`}
                        data-tile-icon={tile.icon}
                        onClick={() => toggleTile(tile.id)}
                        aria-pressed={isSelected}
                        className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none ${toneCls} ${
                          isSelected
                            ? 'border-[#07c8f9] ring-2 ring-[#07c8f9]/30 scale-[0.96]'
                            : 'border-slate-200/80 dark:border-slate-700/80 hover:border-[#07c8f9]/60'
                        }`}
                      >
                        <IconComp
                          size={28}
                          style={{ transform: `rotate(${tile.tilt || 0}deg)` }}
                          className="transition-transform"
                        />
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#07c8f9] text-white flex items-center justify-center shadow-xs">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleRefreshVisualChallenge}
                    disabled={submittingChallenge}
                    title="New challenge"
                    className="p-2 rounded-lg text-slate-500 hover:text-[#07c8f9] hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setStatus('idle');
                    }}
                    title="Cancel"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="captcha-verify-submit"
                  onClick={handleSubmitVisualChallenge}
                  disabled={submittingChallenge}
                  className="px-4 py-1.5 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingChallenge ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Verify</span>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
