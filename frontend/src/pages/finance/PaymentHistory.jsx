// =============================================
// PAYMENT HISTORY — User Dashboard Page
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Calendar,
  Hash,
  Smartphone,
  Receipt,
  AlertCircle,
  Loader2,
  QrCode,
  ChevronDown,
  ChevronUp,
  FileImage,
} from 'lucide-react';
import { useUserPaymentRequests } from '../../hooks/usePaymentRequests';
import QRPaymentModal from '../../components/modals/QRPaymentModal';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    cls: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    description: 'Your payment is being reviewed by our team. You\'ll receive a notification once it\'s processed.',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    cls: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    description: 'Your payment has been verified and your subscription is now active.',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    cls: 'bg-red-500/10 text-red-600 border border-red-500/20',
    description: 'Your payment request was not approved. Please see the reason below.',
  },
};

// ─── Payment Request Card ─────────────────────────────────────────────────────
const PaymentCard = ({ request }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Main Row */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Plan Badge */}
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Receipt size={20} className="text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-foreground">{request.selectedPlan} Plan</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${status.cls}`}>
                <StatusIcon size={11} />
                {status.label}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IndianRupee size={11} />
                <span className="font-medium text-foreground">₹{request.amountPaid?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Smartphone size={11} />
                <span>{request.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar size={11} />
                <span>Paid {new Date(request.paymentDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Approved Plan info */}
            {request.status === 'approved' && request.approvedPlan && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2 text-xs">
                  <p className="text-muted-foreground">Activated Plan</p>
                  <p className="font-semibold text-emerald-700">{request.approvedPlan}</p>
                </div>
                {request.approvedAt && (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2 text-xs">
                    <p className="text-muted-foreground">Activation Date</p>
                    <p className="font-semibold text-foreground">{new Date(request.approvedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
                {request.expiryDate && (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2 text-xs">
                    <p className="text-muted-foreground">Expires On</p>
                    <p className={`font-semibold ${new Date(request.expiryDate) < new Date() ? 'text-red-600' : 'text-foreground'}`}>
                      {new Date(request.expiryDate).toLocaleDateString('en-IN')}
                      {new Date(request.expiryDate) < new Date() && ' (Expired)'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rejection reason */}
            {request.status === 'rejected' && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/5 border border-red-500/15">
                <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  {request.rejectionReason && (
                    <p className="text-red-700 font-medium">{request.rejectionReason}</p>
                  )}
                  {request.adminNotes && (
                    <p className="text-red-600/70 mt-1">{request.adminNotes}</p>
                  )}
                  {!request.rejectionReason && <p className="text-red-700">Contact support for details.</p>}
                </div>
              </div>
            )}

            {/* Admin Notes (approved) */}
            {request.status === 'approved' && request.adminNotes && (
              <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground"><strong>Note:</strong> {request.adminNotes}</p>
              </div>
            )}
          </div>

          {/* Expand */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-secondary/20">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Transaction ID</p>
                <p className="text-xs font-mono font-medium text-foreground break-all">{request.transactionId}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Phone</p>
                <p className="text-xs font-medium text-foreground">{request.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Request ID</p>
                <p className="text-xs font-mono text-muted-foreground">{request._id?.slice(-8)}</p>
              </div>
              {request.screenshot && (
                <div className="col-span-full">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Payment Screenshot</p>
                  <a href={request.screenshot} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-primary hover:underline">
                    <FileImage size={13} />
                    View Screenshot
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PaymentHistory = () => {
  const { data: requests = [], isLoading } = useUserPaymentRequests();
  const [modalOpen, setModalOpen] = useState(false);

  const stats = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your payment requests and subscription status
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <QrCode size={16} />
          New Payment Request
        </button>
      </div>

      {/* Stats */}
      {requests.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Requests', value: stats.total, cls: 'text-foreground bg-secondary/50' },
            { label: 'Pending', value: stats.pending, cls: 'text-amber-600 bg-amber-500/10', icon: Clock },
            { label: 'Approved', value: stats.approved, cls: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
            { label: 'Rejected', value: stats.rejected, cls: 'text-red-600 bg-red-500/10', icon: XCircle },
          ].map(({ label, value, cls, icon: Icon }) => (
            <div key={label} className={`rounded-2xl border border-border p-4 text-center ${cls}`}>
              {Icon && <Icon size={16} className="mx-auto mb-1" />}
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs opacity-70 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center app-card p-8">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
            <QrCode size={36} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Payment Requests Yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Submit a payment request by scanning our UPI QR code and filling in your payment details.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all"
          >
            <QrCode size={16} />
            Make Your First Payment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((request) => (
              <PaymentCard key={request._id} request={request} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* QR Payment Modal */}
      <QRPaymentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default PaymentHistory;
