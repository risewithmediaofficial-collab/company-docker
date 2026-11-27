import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HardDrive, ShieldCheck, ArrowUpRight, Layers } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import PricingPlansGrid, { DEFAULT_STORAGE_PLANS } from '../../components/billing/PricingPlansGrid';
import api from '../../api';

const PricingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, organization } = useSelector((state) => state.auth);
  const [plans, setPlans] = useState(DEFAULT_STORAGE_PLANS);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    let active = true;
    api
      .get('/billing/public-plans')
      .then((res) => {
        if (active && Array.isArray(res.data?.plans) && res.data.plans.length > 0) {
          setPlans(res.data.plans);
        }
      })
      .catch(() => {
        // Keep clean static fallback plans if API is unreachable
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelectPlan = (plan) => {
    try {
      sessionStorage.setItem('rwm_selected_plan', plan.id);
      sessionStorage.setItem('rwm_selected_cycle', billingCycle);
    } catch {
      // ignore storage errors
    }
    if (isAuthenticated) {
      if (organization?.billingSetupRequired || user?.role === 'superAdmin') {
        navigate(`/select-plan?plan=${encodeURIComponent(plan.id)}&cycle=${encodeURIComponent(billingCycle)}`);
      } else {
        navigate('/');
      }
      return;
    }
    navigate(`/register?plan=${encodeURIComponent(plan.id)}&cycle=${encodeURIComponent(billingCycle)}`);
  };

  return (
    <PublicLayout
      ctaTitle="Start Free with 100 MB or Starter 5 GB at ₹10/mo"
      ctaSubtitle="Create your agency account, pick your plan inside (Starter 5 GB opens Razorpay directly at ₹10/mo), and configure your company profile and live workspace URL in Settings."
    >
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-[#0586a8] text-xs font-extrabold tracking-wide uppercase mb-4">
              <HardDrive className="w-3.5 h-3.5" />
              Storage-Based Monthly Pricing
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Simple Storage Plans That Scale With Your Clients
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Start free with <strong className="text-slate-900">100 MB storage</strong> &amp;{' '}
              <strong className="text-slate-900">up to 3 clients</strong>, or pick <strong className="text-slate-900">5 GB Starter at ₹10/mo</strong> via Razorpay — then enter your company details &amp; live workspace URL inside the dashboard. Upgrade anytime mid-cycle.
            </p>
          </div>

          {/* 4 Monthly Plans Grid */}
          <PricingPlansGrid
            plans={plans}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            mode="public"
            onSelectPlan={handleSelectPlan}
          />

          {/* Bottom Guarantee / Upgrade Strip */}
          <div className="mt-14 rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-[#07c8f9] text-xs font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Upgrade Anytime Inside Your Dashboard
              </div>
              <h2 className="text-xl font-extrabold">
                Your chosen plan, storage quota &amp; live agency URL stay right inside Settings
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Start on the Free plan today and jump to Starter (5 GB), Growth (25 GB), or Enterprise Pro (100 GB) via Razorpay whenever your client roster grows — zero data loss.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="px-5 py-3 rounded-xl bg-[#07c8f9] hover:bg-[#06b4e0] text-slate-950 font-extrabold text-xs inline-flex items-center gap-2 transition"
              >
                <Layers className="w-4 h-4" />
                Create Workspace
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/15"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PricingPage;
