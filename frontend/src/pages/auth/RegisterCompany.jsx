import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  Zap,
  Check,
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const steps = [
  { id: 1, label: 'Company Details', icon: Building2, desc: 'Agency name & industry' },
  { id: 2, label: 'Owner Profile', icon: User, desc: 'Contact details' },
  { id: 3, label: 'Security & Trial', icon: Lock, desc: 'Password & activation' },
];

const industries = [
  'Digital Marketing Agency',
  'Creative & Design Studio',
  'PR & Communications',
  'Web & App Development',
  'Social Media Agency',
  'Advertising Agency',
  'Performance Marketing',
  'Branding Agency',
  'IT & Software Consulting',
  'Other / Services',
];

const trialFeatures = [
  '14 Days Unlimited Free Access',
  'Full CRM & Lead Tracking',
  'Project & Task Management',
  'Client Portal & Approvals',
  'No Credit Card Required',
];

const RegisterCompany = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    slug: '',
    logo: '',
    industry: '',
    website: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [customSlugEdited, setCustomSlugEdited] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleCompanyNameChange = (val) => {
    const nextForm = { ...form, companyName: val };
    if (!customSlugEdited) {
      const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      nextForm.slug = autoSlug;
    }
    setForm(nextForm);
    setErrors((e) => ({ ...e, companyName: '', slug: '' }));
  };

  const handleSlugChange = (val) => {
    setCustomSlugEdited(true);
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
    update('slug', clean);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image must be smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update('logo', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.companyName.trim()) errs.companyName = 'Company name is required';
      if (!form.slug?.trim()) errs.slug = 'Domain URL slug is required (e.g. acme-media)';
      else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) errs.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    if (step === 2) {
      if (!form.ownerName.trim()) errs.ownerName = 'Your name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    }
    if (step === 3) {
      if (!form.password) errs.password = 'Password is required';
      else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const cleanSlug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await axios.post('/api/auth/register-company', {
        companyName: form.companyName,
        slug: cleanSlug,
        logo: form.logo,
        industry: form.industry,
        website: form.website,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setCreatedSlug(res.data?.organization?.slug || res.data?.slug || cleanSlug);
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background Light Blue Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg bg-white/90 border border-slate-200/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-900/5 text-center relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="text-emerald-600" size={42} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            Registration Submitted
          </span>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome Aboard!</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Your company <span className="text-blue-600 font-semibold">"{form.companyName}"</span> has been registered successfully.
            Our platform administrator will review your workspace and activate your access shortly.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-4 text-left space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2.5">
              <span>Status</span>
              <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Pending Super Admin Review
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Company Owner</span>
              <span className="text-slate-900 font-semibold">{form.ownerName}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Work Email</span>
              <span className="text-slate-900 font-semibold">{form.email}</span>
            </div>
          </div>

          {/* Dedicated Company Login Portal Card */}
          <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 mb-6 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Globe size={14} className="text-blue-600" />
                Your Dedicated Login Portal
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                Custom URL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-900 font-semibold bg-white px-3 py-2 rounded-xl border border-blue-200/80 flex-1 truncate select-all">
                {`${window.location.origin}/login/${createdSlug || form.slug}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/login/${createdSlug || form.slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Copied your custom login portal URL!');
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Share this dedicated link with your team. Once approved, your team will sign into your workspace via this URL.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate(`/login/${createdSlug || form.slug}`)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              Open Company Portal <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all whitespace-nowrap"
            >
              Main Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/90 via-white to-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Soft Blue Spots */}
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-sky-200/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl relative z-10">

        {/* Top Header & Official Logo */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-3 mb-4 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-xl shadow-blue-500/10 border border-slate-200/80 group-hover:scale-105 transition-transform">
              <img
                src="/branding/rise-with-media-logo.png"
                alt="RISE WITH MEDIA logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-left">
              <span className="text-slate-900 font-extrabold text-xl tracking-wider block leading-none">RISE WITH MEDIA</span>
              <span className="text-blue-600 text-[11px] font-bold uppercase tracking-widest mt-1 block">Agency SaaS Operating System</span>
            </div>
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Start Your 14-Day Free Trial
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Set up your agency workspace in under 2 minutes. No credit card required.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {steps.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div
                key={s.id}
                onClick={() => isDone && setStep(s.id)}
                className={`p-3 rounded-2xl border transition-all duration-300 ${
                  isDone ? 'cursor-pointer' : ''
                } ${
                  isActive
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-md shadow-blue-500/10'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check size={14} /> : s.id}
                  </div>
                  <div className="min-w-0 flex-1 hidden sm:block">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Card (Light Theme) */}
        <form onSubmit={(e) => { e.preventDefault(); if (step === 3) handleSubmit(); else nextStep(); }} className="bg-white/95 border border-slate-200/90 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 relative">

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Company Information ───────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    Company & Agency Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tell us about your business to personalize your CRM dashboard.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Company / Agency Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      placeholder="e.g. Apex Digital Marketing"
                      className={`w-full bg-slate-50/80 border ${
                        errors.companyName ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                      } rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                  </div>
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>

                {/* Domain URL Slug Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Company Domain URL / Portal Slug <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Custom login URL</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-mono text-slate-400 select-none font-medium">
                      /login/
                    </span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="apex-digital"
                      className={`w-full bg-slate-50/80 border ${
                        errors.slug ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                      } rounded-xl py-3 pl-16 pr-4 text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                  </div>
                  {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Branded Login Portal: <code className="font-mono text-blue-600 font-semibold">{window.location.origin}/login/{form.slug || 'company-slug'}</code>
                  </p>
                </div>

                {/* Company Logo Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Company Logo (optional)
                    </label>
                    <span className="text-[11px] text-slate-400">PNG, JPG, SVG or WebP (max 2MB)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* File upload option */}
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <Upload size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                        Click to upload logo image
                      </p>
                      <p className="text-[10px] text-slate-400">or drag and drop file here</p>
                    </div>

                    {/* Image URL input & thumbnail */}
                    <div className="flex flex-col justify-between space-y-1.5">
                      <div className="relative">
                        <ImageIcon size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="url"
                          value={form.logo}
                          onChange={(e) => update('logo', e.target.value)}
                          placeholder="Or paste direct logo URL (https://...)"
                          className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      {form.logo && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200/60 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={form.logo}
                              alt="Logo preview"
                              className="w-7 h-7 rounded-lg object-contain bg-white border border-blue-200 shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span className="text-[11px] font-semibold text-blue-700 truncate">Logo attached</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => update('logo', '')}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white/60 transition-colors"
                            title="Remove logo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Brand Preview Showing Company Name + RWM */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                      {form.logo ? (
                        <img
                          src={form.logo}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Building2 size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                        Dashboard Display Format
                      </p>
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {form.companyName.trim() ? `${form.companyName.trim()} + RWM` : 'Your Company Name + RWM'}
                      </h4>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                    Live Preview
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Industry Sector
                    </label>
                    <div className="relative">
                      <Briefcase size={18} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={form.industry}
                        onChange={(e) => update('industry', e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select industry</option>
                        {industries.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Company Website (optional)
                    </label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={form.website}
                        onChange={(e) => update('website', e.target.value)}
                        placeholder="https://youragency.com"
                        className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Owner Profile ───────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Account Administrator Profile
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    You will be assigned as the primary Organization Owner of <span className="text-slate-900 font-semibold">{form.companyName || 'your company'}</span>.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={form.ownerName}
                      onChange={(e) => update('ownerName', e.target.value)}
                      placeholder="e.g. Vikramaditya Roy"
                      className={`w-full bg-slate-50/80 border ${
                        errors.ownerName ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                      } rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                  </div>
                  {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="owner@youragency.com"
                        className={`w-full bg-slate-50/80 border ${
                          errors.email ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                        } rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Phone Number (optional)
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Security & Plan Summary ───────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Lock size={20} className="text-blue-600" />
                    Security & Plan Activation
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set a secure password for your owner account.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        placeholder="At least 6 characters"
                        className={`w-full bg-slate-50/80 border ${
                          errors.password ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                        } rounded-xl py-3 pl-10 pr-10 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                       Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        placeholder="Repeat your password"
                        className={`w-full bg-slate-50/80 border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                        } rounded-xl py-3 pl-10 pr-10 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Plan Highlights Box */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-blue-600" />
                    <span className="text-blue-900 text-xs font-extrabold uppercase tracking-wider">
                      Included in Your 14-Day Free Trial
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                    {trialFeatures.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600">
                          <Check size={10} />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Form Actions */}
          <div className="flex items-center gap-3 mt-8 pt-5 border-t border-slate-200/80">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 transition-all text-sm font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Continue to Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Creating Workspace...
                  </span>
                ) : (
                  <>
                    <Zap size={18} /> Complete Registration & Start Trial
                  </>
                )}
              </button>
            )}
          </div>

        </form>

        {/* Bottom Login Link */}
        <div className="text-center mt-6">
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 transition-colors">
              Sign into existing workspace
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterCompany;
