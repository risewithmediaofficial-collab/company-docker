import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Loader2, LogOut, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';
import { logout, updateOrganization } from '../../store/slices/authSlice';

const FALLBACK_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For lean creative teams launching their agency workspace',
    monthlyPriceInr: 1999,
    annualPriceInr: 19190,
    badge: 'Essential',
    features: [
      'Up to 5 team members & 15 active clients',
      'CRM Leads, Projects & Task Pipeline',
      'Client Portal & 1-Tap Approvals',
      'SOP Library & Basic Reports',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Full operations for scaling digital marketing agencies',
    monthlyPriceInr: 4999,
    annualPriceInr: 47990,
    badge: 'Most Popular',
    features: [
      'Up to 25 team members & 75 active clients',
      'Full Finance Hub, GST Invoices & Razorpay Receipts',
      'SMM Monthly Tracker & Content Calendar',
      'HR, Attendance, Vendors & Proposals',
    ],
  },
  {
    id: 'pro',
    name: 'Enterprise Pro',
    tagline: 'Unlimited power for multi-branch agencies & partners',
    monthlyPriceInr: 9999,
    annualPriceInr: 95990,
    badge: 'All Features',
    features: [
      'Up to 100 team members & 500 clients',
      'Everything in Growth + Automations & Multi-Branch',
      'Client Password Vault & Dedicated SLA',
      'Priority WhatsApp & Account Support',
    ],
  },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[data-rwm-razorpay="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.rwmRazorpay = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

const SelectPlan = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);

  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [payingPlanId, setPayingPlanId] = useState('');
  const [sandboxCheckout, setSandboxCheckout] = useState(null);
  const [verifyingSandbox, setVerifyingSandbox] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get('/billing/plans')
      .then((res) => {
        if (!mounted || !res.data?.success) return;
        if (Array.isArray(res.data.plans) && res.data.plans.length > 0) {
          setPlans(res.data.plans);
        }
        if (res.data.organization) {
          dispatch(updateOrganization(res.data.organization));
        }
      })
      .catch(() => {
        // Keep fallback plans visible so user sees clear UI
      })
      .finally(() => {
        if (mounted) setLoadingPlans(false);
      });
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const completePaymentSuccess = (data) => {
    if (data?.organization) {
      dispatch(updateOrganization(data.organization));
    }
    toast.success(data?.message || 'Plan activated! Complete your company details in Settings.');
    const target = data?.nextRoute || (data?.organization?.companySetupRequired ? '/settings?section=company' : '/');
    navigate(target, { replace: true });
  };

  const handleSelectPlan = async (plan) => {
    setPayingPlanId(plan.id);
    try {
      const orderRes = await api.post('/billing/razorpay/order', {
        planId: plan.id,
        billingCycle,
      });

      const order = orderRes.data;
      if (!order?.success) {
        toast.error(order?.message || 'Unable to start Razorpay checkout');
        setPayingPlanId('');
        return;
      }

      if (order.mode === 'razorpay' && order.keyId) {
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded || !window.Razorpay) {
          toast.error('Failed to load Razorpay Checkout SDK. Please check your network.');
          setPayingPlanId('');
          return;
        }

        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'RiseWithMedia Agency OS',
          description: `${plan.name} Plan (${billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
          order_id: order.orderId,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#12B7D4',
          },
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/billing/razorpay/verify', {
                planId: plan.id,
                billingCycle,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              completePaymentSuccess(verifyRes.data);
            } catch (verifyErr) {
              toast.error(verifyErr?.response?.data?.message || 'Payment verification failed');
            } finally {
              setPayingPlanId('');
            }
          },
          modal: {
            ondismiss: () => {
              setPayingPlanId('');
              toast.info('Payment cancelled. Choose a plan when ready.');
            },
          },
        });
        rzp.open();
        return;
      }

      // Test / Sandbox Checkout modal when Razorpay live keys are not yet set in server env
      setSandboxCheckout({
        plan,
        billingCycle,
        orderId: order.orderId,
        sandboxToken: order.sandboxToken,
        amountInr: Math.round((order.amount || 0) / 100),
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to initiate payment');
      setPayingPlanId('');
    }
  };

  const handleConfirmSandboxPayment = async () => {
    if (!sandboxCheckout) return;
    setVerifyingSandbox(true);
    try {
      const verifyRes = await api.post('/billing/razorpay/verify', {
        planId: sandboxCheckout.plan.id,
        billingCycle: sandboxCheckout.billingCycle,
        sandboxToken: sandboxCheckout.sandboxToken,
        razorpay_order_id: sandboxCheckout.orderId,
        razorpay_payment_id: `pay_test_${Date.now().toString(36)}`,
      });
      setSandboxCheckout(null);
      completePaymentSuccess(verifyRes.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingSandbox(false);
      setPayingPlanId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 flex items-center justify-center shadow-2xs">
              <img src="/branding/rise-with-media-logo.png" alt="RiseWithMedia" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white">RiseWithMedia Agency OS</p>
              <p className="text-[11px] font-semibold text-[#12B7D4]">
                Signed in as {user?.name || user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Heading & Billing Cycle Switch */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12B7D4]/12 text-[#0e7490] dark:text-[#12B7D4] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Step 1 of 2 • Choose Your Workspace Plan</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Select a Plan to Activate Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Pay securely via Razorpay to unlock your workspace, then complete your company registration details inside Settings.
          </p>

          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mt-2">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((k) => (
              <div key={k} className="h-96 rounded-3xl bg-white dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isPopular = plan.id === 'growth';
              const priceInr = billingCycle === 'annual' ? plan.annualPriceInr : plan.monthlyPriceInr;
              const isPaying = payingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all bg-white dark:bg-slate-900 border ${
                    isPopular
                      ? 'border-[#12B7D4] ring-2 ring-[#12B7D4]/20 shadow-xl shadow-[#12B7D4]/10'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">{plan.name}</h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isPopular
                            ? 'bg-[#12B7D4] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
                      {plan.tagline}
                    </p>

                    <div className="pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-950 dark:text-white tabular-nums">
                          ₹{Number(priceInr || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          /{billingCycle === 'annual' ? 'year' : 'month'}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {(plan.features || []).map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(payingPlanId)}
                    onClick={() => handleSelectPlan(plan)}
                    className={`mt-6 w-full py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 ${
                      isPopular
                        ? 'bg-[#12B7D4] hover:bg-[#0ea5c6] text-white shadow-md shadow-[#12B7D4]/25'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                    }`}
                  >
                    {isPaying ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Opening Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} />
                        <span>Pay with Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck size={15} className="text-emerald-500" />
          <span>256-bit encrypted Razorpay checkout • Current workspace: {organization?.name || 'Pending Setup'}</span>
        </div>
      </div>

      {/* Razorpay Sandbox Checkout Modal (used when live Razorpay API keys aren't set yet) */}
      {sandboxCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Razorpay Checkout Confirmation"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="bg-[#072654] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Zap size={18} className="text-[#38bdf8]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-cyan-200 uppercase tracking-wider">Razorpay Checkout</p>
                  <h3 className="text-base font-extrabold">{sandboxCheckout.plan.name} Plan</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black tabular-nums">
                  ₹{Number(sandboxCheckout.amountInr).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-cyan-200">Test Mode</p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{sandboxCheckout.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Cycle</span>
                  <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{sandboxCheckout.billingCycle}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Set <code className="font-mono">RAZORPAY_KEY_ID</code> &amp; <code className="font-mono">RAZORPAY_KEY_SECRET</code> in backend <code className="font-mono">.env</code> to launch live Razorpay cards/UPI. In test mode, confirm below to activate the plan.
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={verifyingSandbox}
                  onClick={() => {
                    setSandboxCheckout(null);
                    setPayingPlanId('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={verifyingSandbox}
                  onClick={handleConfirmSandboxPayment}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {verifyingSandbox ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Confirm Payment &amp; Continue</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectPlan;
