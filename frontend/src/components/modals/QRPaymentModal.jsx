// =============================================
// QR PAYMENT MODAL
// ─────────────────────────────────────────────
// Temporary QR-based manual payment verification.
//
// RAZORPAY RESTORATION GUIDE:
//   When Razorpay Live Mode is fixed:
//   1. Uncomment Razorpay checkout call below.
//   2. Remove or comment out this entire modal.
//   3. In Settings.jsx / wherever "Buy Plan" lives,
//      replace <QRPaymentModal> with Razorpay handler.
//   No other files need to change.
//
// /* ── ORIGINAL RAZORPAY HANDLER (keep for restoration) ──
//   const handleRazorpayPayment = (plan) => {
//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: plan.amount * 100, // paise
//       currency: 'INR',
//       name: 'Rise With Media',
//       description: `${plan.name} Plan Subscription`,
//       handler: async (response) => {
//         // Call backend to verify payment and activate subscription
//         await api.post('/razorpay/verify', {
//           razorpay_order_id: response.razorpay_order_id,
//           razorpay_payment_id: response.razorpay_payment_id,
//           razorpay_signature: response.razorpay_signature,
//           plan: plan.name,
//         });
//         toast.success('Payment successful! Subscription activated.');
//       },
//       prefill: { name: user.name, email: user.email },
//       theme: { color: '#4F46E5' },
//     };
//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };
// ── END RAZORPAY HANDLER ── */
// =============================================

import { useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  QrCode,
  Upload,
  CheckCircle2,
  CreditCard,
  User,
  Calendar,
  Hash,
  IndianRupee,
  Phone,
  Smartphone,
  AlertCircle,
  ImageIcon,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';
import { useSubmitPaymentRequest } from '../../hooks/usePaymentRequests';

const PLANS = ['Starter', 'Basic', 'Professional', 'Premium', 'Enterprise'];

const PLAN_PRICES = {
  Starter: 999,
  Basic: 2499,
  Professional: 4999,
  Premium: 9999,
  Enterprise: 19999,
};

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'Google Pay', label: 'Google Pay', icon: '🔵' },
  { value: 'PhonePe', label: 'PhonePe', icon: '🟣' },
  { value: 'Paytm', label: 'Paytm', icon: '🔵' },
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'Other', label: 'Other', icon: '💳' },
];

const UPI_ID = 'risewithmedia@upi'; // Replace with actual UPI ID

const QRPaymentModal = ({ isOpen, onClose, defaultPlan = '' }) => {
  const { user } = useSelector((state) => state.auth);
  const submitPayment = useSubmitPaymentRequest();

  const [step, setStep] = useState('qr'); // 'qr' | 'form' | 'success'
  const [copied, setCopied] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    selectedPlan: defaultPlan || '',
    amountPaid: defaultPlan ? String(PLAN_PRICES[defaultPlan] || '') : '',
    transactionId: '',
    paymentMethod: 'UPI',
    paymentDate: new Date().toISOString().split('T')[0],
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState({});

  const handleClose = () => {
    if (submitPayment.isPending || uploading) return;
    setStep('qr');
    setForm({
      selectedPlan: defaultPlan || '',
      amountPaid: defaultPlan ? String(PLAN_PRICES[defaultPlan] || '') : '',
      transactionId: '',
      paymentMethod: 'UPI',
      paymentDate: new Date().toISOString().split('T')[0],
      phone: user?.phone || '',
    });
    setErrors({});
    setScreenshotFile(null);
    setScreenshotPreview('');
    onClose();
  };

  const copyUPI = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('UPI ID copied!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'selectedPlan' && value ? { amountPaid: String(PLAN_PRICES[value] || '') } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be less than 5MB');
      return;
    }
    setScreenshotFile(file);
    const url = URL.createObjectURL(file);
    setScreenshotPreview(url);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const validate = () => {
    const newErrors = {};
    if (!form.selectedPlan) newErrors.selectedPlan = 'Please select a plan';
    if (!form.amountPaid || Number(form.amountPaid) <= 0) newErrors.amountPaid = 'Enter a valid amount';
    if (!form.transactionId.trim()) newErrors.transactionId = 'Transaction ID / UTR is required';
    if (!form.paymentMethod) newErrors.paymentMethod = 'Select a payment method';
    if (!form.paymentDate) newErrors.paymentDate = 'Select payment date';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim().replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    let screenshotUrl = '';
    if (screenshotFile) {
      try {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', screenshotFile);
        const uploadRes = await api.post('/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        screenshotUrl = uploadRes.data.url || '';
      } catch (_) {
        toast.error('Screenshot upload failed, proceeding without it');
      } finally {
        setUploading(false);
      }
    }

    await submitPayment.mutateAsync({
      ...form,
      amountPaid: Number(form.amountPaid),
      screenshot: screenshotUrl,
    });

    setStep('success');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl"
          >
            {/* ── Close Button ── */}
            <button
              onClick={handleClose}
              disabled={submitPayment.isPending || uploading}
              className="absolute right-4 top-4 z-10 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X size={18} />
            </button>

            {/* ── Step: QR Code ── */}
            {step === 'qr' && (
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3">
                    <QrCode size={24} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Scan & Pay</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete your payment using any UPI app
                  </p>
                </div>

                {/* QR Image */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative p-4 rounded-3xl bg-white shadow-xl border-4 border-primary/20 mb-4">
                    <img
                      src="/qr-code.png"
                      alt="UPI QR Code — Scan to Pay"
                      className="w-56 h-56 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text y="50" x="50" text-anchor="middle" font-size="12" fill="%23666">QR Code</text></svg>';
                      }}
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Rise With Media
                    </div>
                  </div>

                  {/* UPI ID */}
                  <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-secondary rounded-2xl border border-border">
                    <span className="text-xs text-muted-foreground">UPI ID:</span>
                    <span className="text-sm font-semibold text-foreground font-mono">{UPI_ID}</span>
                    <button
                      onClick={copyUPI}
                      className="p-1 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-4 mb-6 space-y-2">
                  <p className="text-sm font-semibold text-foreground text-center mb-3">Payment Instructions</p>
                  {[
                    'Open any UPI app (Google Pay, PhonePe, Paytm, etc.)',
                    'Scan the QR code or manually enter the UPI ID above',
                    'Enter the amount for your chosen plan',
                    'Complete the payment and save your transaction ID / UTR',
                    'Come back here and fill out the payment verification form',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Plan Pricing Reference */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {PLANS.map((plan) => (
                    <div key={plan} className="text-center p-2 rounded-xl bg-secondary/50 border border-border">
                      <p className="text-[10px] font-semibold text-foreground">{plan}</p>
                      <p className="text-xs text-primary font-bold">₹{PLAN_PRICES[plan].toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep('form')}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  I've Paid — Fill Verification Form →
                </button>
              </div>
            )}

            {/* ── Step: Verification Form ── */}
            {step === 'form' && (
              <div className="p-8">
                {/* Header */}
                <div className="mb-6">
                  <button
                    onClick={() => setStep('qr')}
                    className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 transition-colors"
                  >
                    ← Back to QR Code
                  </button>
                  <h2 className="text-2xl font-bold text-foreground">Payment Verification</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in your payment details for verification
                  </p>
                </div>

                <div className="space-y-5">
                  {/* ── User Details ── */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <User size={12} /> User Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Name (auto-filled, readonly) */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                        <input
                          readOnly
                          value={user?.name || ''}
                          className="app-input bg-secondary/50 cursor-not-allowed opacity-70"
                        />
                      </div>
                      {/* Email (auto-filled, readonly) */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                        <input
                          readOnly
                          value={user?.email || ''}
                          className="app-input bg-secondary/50 cursor-not-allowed opacity-70"
                        />
                      </div>
                      {/* Phone */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Phone Number <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            className={`app-input pl-10 ${errors.phone ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                          />
                        </div>
                        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* ── Payment Details ── */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <CreditCard size={12} /> Payment Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Selected Plan */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Selected Plan <span className="text-destructive">*</span>
                        </label>
                        <select
                          name="selectedPlan"
                          value={form.selectedPlan}
                          onChange={handleChange}
                          className={`app-select ${errors.selectedPlan ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                        >
                          <option value="">Choose a plan…</option>
                          {PLANS.map((p) => (
                            <option key={p} value={p}>{p} — ₹{PLAN_PRICES[p].toLocaleString()}</option>
                          ))}
                        </select>
                        {errors.selectedPlan && <p className="mt-1 text-xs text-destructive">{errors.selectedPlan}</p>}
                      </div>

                      {/* Amount Paid */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Amount Paid (₹) <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            type="number"
                            name="amountPaid"
                            value={form.amountPaid}
                            onChange={handleChange}
                            placeholder="Enter amount"
                            min="1"
                            className={`app-input pl-10 ${errors.amountPaid ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                          />
                        </div>
                        {errors.amountPaid && <p className="mt-1 text-xs text-destructive">{errors.amountPaid}</p>}
                      </div>

                      {/* Payment Date */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Payment Date <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            type="date"
                            name="paymentDate"
                            value={form.paymentDate}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className={`app-input pl-10 ${errors.paymentDate ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                          />
                        </div>
                        {errors.paymentDate && <p className="mt-1 text-xs text-destructive">{errors.paymentDate}</p>}
                      </div>

                      {/* Transaction ID */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Transaction ID / UTR No. <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            name="transactionId"
                            value={form.transactionId}
                            onChange={handleChange}
                            placeholder="12-digit UTR or transaction ID"
                            className={`app-input pl-10 ${errors.transactionId ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                          />
                        </div>
                        {errors.transactionId && <p className="mt-1 text-xs text-destructive">{errors.transactionId}</p>}
                      </div>

                      {/* Payment Method */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Payment Method <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {PAYMENT_METHODS.map((method) => (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({ ...prev, paymentMethod: method.value }));
                                if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: '' }));
                              }}
                              className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                                form.paymentMethod === method.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-secondary'
                              }`}
                            >
                              <span className="text-lg leading-none">{method.icon}</span>
                              <span>{method.label}</span>
                            </button>
                          ))}
                        </div>
                        {errors.paymentMethod && <p className="mt-1 text-xs text-destructive">{errors.paymentMethod}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* ── Screenshot Upload ── */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ImageIcon size={12} /> Payment Screenshot
                      <span className="text-muted-foreground/50 font-normal">(Optional — helps speed up approval)</span>
                    </label>

                    {screenshotPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-border group">
                        <img
                          src={screenshotPreview}
                          alt="Payment screenshot"
                          className="w-full max-h-48 object-contain bg-secondary/30"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => { setScreenshotFile(null); setScreenshotPreview(''); }}
                            className="p-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium"
                          >
                            Remove Screenshot
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                          isDragging
                            ? 'border-primary bg-primary/5 scale-[0.99]'
                            : 'border-border hover:border-primary/40 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <Upload size={18} className="text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">
                            {isDragging ? 'Drop here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitPayment.isPending || uploading}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitPayment.isPending || uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {uploading ? 'Uploading screenshot…' : 'Submitting…'}
                      </>
                    ) : (
                      <>
                        <Smartphone size={16} />
                        Submit Payment Verification
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    <AlertCircle size={11} className="inline mr-1" />
                    Your request will be reviewed by an admin within 24 hours. You'll receive a notification once approved.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step: Success ── */}
            {step === 'success' && (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6"
                >
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
                  Your payment verification request has been submitted. Our team will review it within 24 hours and activate your subscription.
                </p>
                <div className="bg-secondary/50 rounded-2xl p-4 text-left mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan Requested</span>
                    <span className="font-semibold text-foreground">{form.selectedPlan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold text-foreground">₹{Number(form.amountPaid).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-semibold text-foreground font-mono text-xs">{form.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold">
                      ⏳ Pending Review
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRPaymentModal;
