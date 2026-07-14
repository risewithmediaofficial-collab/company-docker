// =============================================
// ADMIN — PAYMENT REQUESTS PAGE
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  IndianRupee,
  Hash,
  Calendar,
  User,
  Phone,
  Smartphone,
  FileImage,
  X,
  Loader2,
  Receipt,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAllPaymentRequests,
  useApprovePaymentRequest,
  useRejectPaymentRequest,
} from '../../hooks/usePaymentRequests';

const PLANS = ['Starter', 'Basic', 'Professional', 'Premium', 'Enterprise'];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    cls: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    cls: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    cls: 'bg-red-500/10 text-red-600 border border-red-500/20',
  },
};

const PAYMENT_METHODS = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer', 'Other'];

// ─── Approve Modal ────────────────────────────────────────────────────────────
const ApproveModal = ({ request, onClose, onConfirm, loading }) => {
  const [form, setForm] = useState({
    approvedPlan: request?.selectedPlan || PLANS[0],
    subscriptionDuration: 1,
    expiryDate: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    })(),
    adminNotes: '',
  });

  const handleDurationChange = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + Number(months));
    setForm((prev) => ({
      ...prev,
      subscriptionDuration: Number(months),
      expiryDate: d.toISOString().split('T')[0],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-foreground">Approve Payment</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Choose the plan to activate for this user</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        <div className="bg-secondary/50 rounded-2xl p-3 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {request?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{request?.name}</p>
            <p className="text-xs text-muted-foreground">{request?.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Requested</p>
            <p className="text-sm font-semibold text-foreground">{request?.selectedPlan}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Approved Plan */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Activate Plan <span className="text-destructive">*</span>
            </label>
            <select
              value={form.approvedPlan}
              onChange={(e) => setForm((prev) => ({ ...prev, approvedPlan: e.target.value }))}
              className="app-select"
            >
              {PLANS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Subscription Duration
            </label>
            <select
              value={form.subscriptionDuration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="app-select"
            >
              {[1, 2, 3, 6, 12].map((m) => (
                <option key={m} value={m}>{m} {m === 1 ? 'month' : 'months'}</option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Expiry Date
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="app-input"
            />
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Admin Notes <span className="text-muted-foreground/50 font-normal">(Optional)</span>
            </label>
            <textarea
              value={form.adminNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, adminNotes: e.target.value }))}
              placeholder="Optional notes visible to the user…"
              rows={2}
              className="app-input resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(form)}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {loading ? 'Activating…' : 'Approve & Activate'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ request, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-foreground">Reject Payment</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Provide a reason so the user can resubmit</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3 mb-5">
          <p className="text-sm font-medium text-foreground">{request?.name}</p>
          <p className="text-xs text-muted-foreground">{request?.selectedPlan} Plan — ₹{request?.amountPaid?.toLocaleString()}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Transaction ID not found, Amount mismatch, Invalid screenshot…"
              rows={3}
              className="app-input resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Internal Notes <span className="text-muted-foreground/50 font-normal">(Optional)</span>
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes for your reference…"
              rows={2}
              className="app-input resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) { toast.error('Please provide a rejection reason'); return; }
              onConfirm({ rejectionReason: reason, adminNotes });
            }}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            {loading ? 'Rejecting…' : 'Reject Request'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── View Details Modal ───────────────────────────────────────────────────────
const DetailModal = ({ request, onClose }) => {
  if (!request) return null;
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground">Payment Request Details</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.cls}`}>
            <StatusIcon size={12} />
            {status.label}
          </div>

          {/* User */}
          <div className="bg-secondary/50 rounded-2xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground mb-0.5">Name</p><p className="font-medium">{request.name}</p></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">Email</p><p className="font-medium break-all">{request.email}</p></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">Phone</p><p className="font-medium">{request.phone}</p></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">Submitted</p><p className="font-medium">{new Date(request.createdAt).toLocaleDateString('en-IN')}</p></div>
          </div>

          {/* Payment */}
          <div className="bg-secondary/50 rounded-2xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground mb-0.5">Requested Plan</p><p className="font-semibold text-primary">{request.selectedPlan}</p></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">Amount Paid</p><p className="font-semibold">₹{request.amountPaid?.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">Transaction ID</p><p className="font-mono text-xs font-medium break-all">{request.transactionId}</p></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">Payment Method</p><p className="font-medium">{request.paymentMethod}</p></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">Payment Date</p><p className="font-medium">{new Date(request.paymentDate).toLocaleDateString('en-IN')}</p></div>
          </div>

          {/* Screenshot */}
          {request.screenshot && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Payment Screenshot</p>
              <a href={request.screenshot} target="_blank" rel="noreferrer">
                <img
                  src={request.screenshot}
                  alt="Payment screenshot"
                  className="w-full max-h-48 object-contain rounded-2xl border border-border bg-secondary/30 hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            </div>
          )}

          {/* Approval Info */}
          {request.status === 'approved' && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-sm space-y-2">
              <p className="font-semibold text-emerald-600">Approval Details</p>
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-xs text-muted-foreground">Approved Plan</p><p className="font-medium">{request.approvedPlan}</p></div>
                <div><p className="text-xs text-muted-foreground">Approved On</p><p className="font-medium">{request.approvedAt ? new Date(request.approvedAt).toLocaleDateString('en-IN') : '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Expires On</p><p className="font-medium">{request.expiryDate ? new Date(request.expiryDate).toLocaleDateString('en-IN') : '—'}</p></div>
                {request.adminNotes && <div className="col-span-2"><p className="text-xs text-muted-foreground">Admin Notes</p><p className="font-medium">{request.adminNotes}</p></div>}
              </div>
            </div>
          )}

          {/* Rejection Info */}
          {request.status === 'rejected' && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-sm">
              <p className="font-semibold text-red-600 mb-2">Rejection Details</p>
              {request.rejectionReason && <p className="text-muted-foreground">{request.rejectionReason}</p>}
              {request.adminNotes && <p className="text-muted-foreground/70 mt-1 text-xs">{request.adminNotes}</p>}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Payment Request Card ─────────────────────────────────────────────────────
const RequestCard = ({ request, onApprove, onReject, onView }) => {
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {request.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{request.name}</p>
            <p className="text-xs text-muted-foreground">{request.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${status.cls}`}>
          <StatusIcon size={11} />
          {status.label}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IndianRupee size={11} />
          <span>₹{request.amountPaid?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Smartphone size={11} />
          <span>{request.paymentMethod}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <Hash size={11} className="flex-shrink-0" />
          <span className="font-mono truncate">{request.transactionId}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar size={11} />
          <span>{new Date(request.paymentDate).toLocaleDateString('en-IN')}</span>
        </div>
        {request.phone && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone size={11} />
            <span>{request.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Receipt size={11} />
          <span>{request.selectedPlan} Plan</span>
        </div>
      </div>

      {/* Screenshot thumbnail */}
      {request.screenshot && (
        <div className="mb-4">
          <a href={request.screenshot} target="_blank" rel="noreferrer">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <FileImage size={13} />
              <span>View Payment Screenshot</span>
            </div>
          </a>
        </div>
      )}

      {/* Approval info */}
      {request.status === 'approved' && request.approvedPlan && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700">
          <strong>Activated:</strong> {request.approvedPlan} · Expires {request.expiryDate ? new Date(request.expiryDate).toLocaleDateString('en-IN') : '—'}
        </div>
      )}

      {/* Rejection reason */}
      {request.status === 'rejected' && request.rejectionReason && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-700">
          <strong>Reason:</strong> {request.rejectionReason}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(request)}
          className="flex-1 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye size={13} /> Details
        </button>
        {request.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(request)}
              className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={13} /> Approve
            </button>
            <button
              onClick={() => onReject(request)}
              className="flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-700 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle size={13} /> Reject
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PaymentRequests = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const { data, isLoading, isFetching, refetch } = useAllPaymentRequests(
    statusFilter ? { status: statusFilter } : {}
  );
  const approve = useApprovePaymentRequest();
  const reject = useRejectPaymentRequest();

  const requests = data?.paymentRequests || [];

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.transactionId?.toLowerCase().includes(q) ||
      r.selectedPlan?.toLowerCase().includes(q)
    );
  });

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, { pending: 0, approved: 0, rejected: 0 });

  const handleApprove = async (form) => {
    await approve.mutateAsync({ id: approveTarget._id, ...form });
    setApproveTarget(null);
  };

  const handleReject = async (form) => {
    await reject.mutateAsync({ id: rejectTarget._id, ...form });
    setRejectTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve user payment verification requests
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="app-button-secondary gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: counts.pending, cls: 'text-amber-600 bg-amber-500/10', icon: Clock },
          { label: 'Approved', count: counts.approved, cls: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Rejected', count: counts.rejected, cls: 'text-red-600 bg-red-500/10', icon: XCircle },
        ].map(({ label, count, cls, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${cls} mb-2`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, transaction ID…"
            className="app-input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="app-select sm:w-48"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Receipt size={28} className="text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">No payment requests</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || statusFilter ? 'No requests match your filters' : 'Payment requests will appear here when users submit them'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onApprove={setApproveTarget}
                onReject={setRejectTarget}
                onView={setViewTarget}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {approveTarget && (
          <ApproveModal
            request={approveTarget}
            onClose={() => setApproveTarget(null)}
            onConfirm={handleApprove}
            loading={approve.isPending}
          />
        )}
        {rejectTarget && (
          <RejectModal
            request={rejectTarget}
            onClose={() => setRejectTarget(null)}
            onConfirm={handleReject}
            loading={reject.isPending}
          />
        )}
        {viewTarget && (
          <DetailModal
            request={viewTarget}
            onClose={() => setViewTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentRequests;
