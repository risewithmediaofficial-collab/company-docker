import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, HardDrive, Loader2, LogOut, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';
import { logout, updateOrganization } from '../../store/slices/authSlice';
import PricingPlansGrid, {
  DEFAULT_STORAGE_PLANS,
  formatStorageQuota,
} from '../../components/billing/PricingPlansGrid';

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
  const [searchParams] = useSearchParams();
  const { user, organization } = useSelector((state) => state.auth);

  const initialCycle =
    searchParams.get('cycle') === 'annual' ||
    (typeof window !== 'undefined' && sessionStorage.getItem('rwm_selected_cycle') === 'annual')
      ? 'annual'
      : 'monthly';
  const [plans, setPlans] = useState(DEFAULT_STORAGE_PLANS);
  const [usage, setUsage] = useState(null);
  const [billingCycle, setBillingCycle] = useState(initialCycle);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [payingPlanId, setPayingPlanId] = useState('');
  const [sandboxCheckout, setSandboxCheckout] = useState(null);
  const [verifyingSandbox, setVerifyingSandbox] = useState(false);

  const isUpgradeMode = Boolean(organization && organization.billingSetupRequired === false);

  // Preload Razorpay Checkout script immediately so clicking a paid plan opens Razorpay directly
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    let mounted = true;
    api
      .get('/billing/plans')
      .then((res) => {
        if (!mounted || !res.data?.success) return;
        if (Array.isArray(res.data.plans) && res.data.plans.length > 0) {
          setPlans(res.data.plans);
        }
        if (res.data.usage) {
          setUsage(res.data.usage);
        }
        if (res.data.organization) {
          dispatch(updateOrganization(res.data.organization));
          if (res.data.organization.billingCycle && !searchParams.get('cycle')) {
            setBillingCycle(res.data.organization.billingCycle);
          }
        }
      })
      .catch(() => {
        // Keep default 4 storage plans visible as fallback
      })
      .finally(() => {
        if (mounted) setLoadingPlans(false);
      });
    return () => {
      mounted = false;
    };
  }, [dispatch, searchParams]);

  const completePaymentSuccess = (data) => {
    try {
      sessionStorage.removeItem('rwm_selected_plan');
      sessionStorage.removeItem('rwm_selected_cycle');
    } catch {
      // ignore storage errors
    }
    if (data?.organization) {
      dispatch(updateOrganization(data.organization));
    }
    toast.success(
      data?.message ||
        (data?.organization?.companySetupRequired
          ? 'Payment confirmed! Please complete your company details.'
          : 'Plan updated successfully!')
    );
    const target =
      data?.nextRoute || (data?.organization?.companySetupRequired ? '/settings?section=company' : '/');
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
        toast.error(order?.message || 'Unable to activate plan');
        setPayingPlanId('');
        return;
      }

      // Free 100 MB tier activates immediately without checkout
      if (order.mode === 'free') {
        setPayingPlanId('');
        completePaymentSuccess(order);
        return;
      }

      if (order.mode === 'razorpay' && order.keyId) {
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded || !window.Razorpay) {
          toast.error('Failed to load Razorpay Checkout SDK. Please check your network.');
          setPayingPlanId('');
          return;
        }

        const prefill = {};
        if (user?.name) prefill.name = user.name;
        if (user?.email) prefill.email = user.email;
        if (user?.phone) prefill.contact = user.phone;

        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'AgencyUpscale',
          description: `${plan.name} Plan (${billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
          order_id: order.orderId,
          prefill,
          theme: {
            color: '#07c8f9',
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
        rzp.on('payment.failed', (resp) => {
          setPayingPlanId('');
          toast.error(resp?.error?.description || 'Payment failed. Please try again.');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-8 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isUpgradeMode && (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Dashboard</span>
              </button>
            )}
            <div className="h-12 w-24 sm:h-14 sm:w-28 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs shrink-0">
              <img src="/agencyupscalelogo.jpeg" alt="AgencyUpscale" className="h-full w-full object-cover object-center" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0586a8]">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#07c8f9]/12 text-[#0e7490] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>
              {isUpgradeMode
                ? 'Manage or Upgrade Storage Plan'
                : 'Choose Your Plan'}
            </span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
            {isUpgradeMode
              ? 'Upgrade Your Storage & Client Capacity Anytime'
              : 'Pick a Storage Plan to Activate Your Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            {isUpgradeMode
              ? 'Switch plans mid-cycle cleanly via Razorpay. Your existing projects, clients, and team stay untouched.'
              : 'Activate 100 MB Free in 1 click or choose Starter (₹10/mo for 5 GB) / paid tiers to open Razorpay checkout directly.'}
          </p>
        </div>

        {/* Active Plan Usage Summary Banner (when already active / mid-cycle upgrade) */}
        {isUpgradeMode && organization && (
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Current Active Plan
              </p>
              <p className="text-base font-black text-slate-900 capitalize mt-0.5">
                {organization.plan === 'pro' ? 'Enterprise Pro' : organization.plan || 'Free'}{' '}
                <span className="text-xs font-semibold text-slate-500">
                  ({organization.billingCycle || 'monthly'})
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-100">
                <HardDrive size={15} className="text-[#0586a8]" />
                <span className="font-bold text-slate-800">
                  Storage: {usage?.storageUsedMb ?? 0} MB /{' '}
                  {formatStorageQuota(usage?.storageLimitMb ?? organization.storageLimitMb ?? 100)}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <Users size={15} className="text-slate-700" />
                <span className="font-bold text-slate-800">
                  Clients: {usage?.clientCount ?? 0} / {usage?.maxClients ?? organization.maxClients ?? 3}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="h-[460px] rounded-3xl bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <PricingPlansGrid
            plans={plans}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            currentPlanId={organization?.plan}
            currentBillingCycle={organization?.billingCycle || 'monthly'}
            isCurrentActive={isUpgradeMode}
            mode="billing"
            processingPlanId={payingPlanId}
            onSelectPlan={handleSelectPlan}
          />
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={15} className="text-emerald-500" />
          <span>
            256-bit encrypted Razorpay checkout • Current workspace: {organization?.name || 'Pending Setup'}
          </span>
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
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
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
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">Order Reference</span>
                <span className="font-mono font-bold text-slate-800">{sandboxCheckout.orderId}</span>
              </div>

              <p className="text-[11px] text-slate-500">
                Test mode is active because <code className="font-mono">RAZORPAY_KEY_ID</code> and <code className="font-mono">RAZORPAY_KEY_SECRET</code> are not configured on the server yet. Click below to confirm test payment.
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={verifyingSandbox}
                  onClick={() => {
                    setSandboxCheckout(null);
                    setPayingPlanId('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={verifyingSandbox}
                  onClick={handleConfirmSandboxPayment}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer"
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
