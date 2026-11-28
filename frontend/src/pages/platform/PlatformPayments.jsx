import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  IndianRupee,
  Download,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const STATUS_BADGES = {
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-amber-100 text-amber-800 border-amber-200',
  created: 'bg-slate-100 text-slate-700 border-slate-200',
};

const formatDateTime = (val) => {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export default function PlatformPayments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    paidCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    createdCount: 0,
    totalCollectedInr: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/api/platform/payments', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter,
          search: search.trim() || undefined,
          page,
          limit: 30,
        },
      });
      if (res.data?.success) {
        setPayments(res.data.payments || []);
        setSummary(res.data.summary || {});
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load payments ledger');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPayments();
    }, 150);
    return () => clearTimeout(t);
  }, [fetchPayments]);

  const handleExportCsv = () => {
    if (!payments.length) {
      toast.info('No payment records to export');
      return;
    }
    const headers = [
      'Date',
      'Payer Name',
      'Contact Number',
      'Email',
      'Company',
      'Plan',
      'Cycle',
      'Amount (INR)',
      'Status',
      'Gateway',
      'Razorpay Order ID',
      'Razorpay Payment ID',
      'Failure Code',
      'Failure Reason',
    ];
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = payments.map((p) => [
      formatDateTime(p.paidAt || p.failedAt || p.createdAt),
      p.payerName,
      p.contactNumber,
      p.payerEmail,
      p.companyName,
      p.planName || p.planId,
      p.billingCycle,
      p.amountInr,
      p.status,
      p.gateway,
      p.razorpayOrderId,
      p.razorpayPaymentId,
      p.failureCode,
      p.failureReason,
    ]);
    const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agencyupscale-payments-${statusFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      label: 'Total Collected',
      value: `₹${Number(summary.totalCollectedInr || 0).toLocaleString('en-IN')}`,
      sub: `${summary.paidCount || 0} successful checkouts`,
      icon: IndianRupee,
      accent: 'from-emerald-600 to-teal-600',
    },
    {
      label: 'Paid Payments',
      value: summary.paidCount || 0,
      sub: 'Verified via Razorpay / Free setup',
      icon: CheckCircle2,
      accent: 'from-cyan-600 to-sky-600',
    },
    {
      label: 'Failed Payments',
      value: summary.failedCount || 0,
      sub: 'Captured with payer name & phone',
      icon: AlertTriangle,
      accent: 'from-red-600 to-rose-600',
      urgent: (summary.failedCount || 0) > 0,
    },
    {
      label: 'Cancelled / Initiated',
      value: (summary.cancelledCount || 0) + (summary.createdCount || 0),
      sub: `${summary.totalCount || 0} total checkout attempts`,
      icon: Clock,
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 space-y-5 w-full max-w-7xl mx-auto text-slate-900 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard size={22} className="text-[#0586a8]" />
            <span>Payments &amp; Failed Checkouts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track new agency registrations, Razorpay checkouts, failed payment reasons, and customer contact details.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#0586a8]' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl bg-white border ${
              card.urgent ? 'border-red-300 ring-2 ring-red-400/20' : 'border-slate-200/90'
            } p-4 sm:p-5 shadow-xs`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center mb-3 shadow-xs`}>
              <card.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{card.value}</p>
            <p className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">{card.label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${summary.totalCount || 0})` },
            { id: 'paid', label: `Paid (${summary.paidCount || 0})` },
            { id: 'failed', label: `Failed (${summary.failedCount || 0})` },
            { id: 'cancelled', label: `Cancelled (${summary.cancelledCount || 0})` },
            { id: 'created', label: `Initiated (${summary.createdCount || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? tab.id === 'failed'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-[#0586a8] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, contact number, company, order ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Payments Table & Mobile Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-500">Loading payment records...</div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <CreditCard size={28} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No payments found</p>
            <p className="text-xs text-slate-500">
              Razorpay transactions and any failed checkout attempts will automatically appear here with customer name &amp; contact number.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Payer &amp; Contact Number</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Plan &amp; Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Razorpay Order / Payment</th>
                    <th className="py-3 px-4">Failure / Notes</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {payments.map((p) => (
                    <tr key={p._id} className={p.status === 'failed' ? 'bg-red-50/35 hover:bg-red-50/60' : 'hover:bg-slate-50/80'}>
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-slate-900">{p.payerName || 'Unknown Payer'}</p>
                        {p.contactNumber ? (
                          <a
                            href={`tel:${p.contactNumber}`}
                            className="inline-flex items-center gap-1 text-[#0586a8] hover:underline font-semibold mt-0.5"
                          >
                            <Phone size={11} />
                            <span>{p.contactNumber}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 block mt-0.5">No contact number</span>
                        )}
                        {p.payerEmail && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail size={10} />
                            <span className="truncate max-w-[180px]">{p.payerEmail}</span>
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        {p.organizationId?._id || p.organizationId ? (
                          <Link
                            to={`/platform/companies/${p.organizationId?._id || p.organizationId}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-[#0586a8]"
                          >
                            <Building2 size={13} className="text-slate-400 shrink-0" />
                            <span>{p.companyName || 'Workspace'}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-600">{p.companyName || '—'}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-slate-900 capitalize">{p.planName || p.planId}</p>
                        <p className="text-[11px] text-slate-600 font-semibold tabular-nums mt-0.5">
                          ₹{Number(p.amountInr || 0).toLocaleString('en-IN')} / {p.billingCycle || 'monthly'}
                        </p>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">{p.gateway}</span>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                            STATUS_BADGES[p.status] || STATUS_BADGES.created
                          }`}
                        >
                          {p.status === 'failed' && <XCircle size={11} />}
                          {p.status === 'paid' && <CheckCircle2 size={11} />}
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top font-mono text-[11px] text-slate-600 space-y-0.5">
                        {p.razorpayOrderId && <p className="truncate max-w-[170px]" title={p.razorpayOrderId}>Order: {p.razorpayOrderId}</p>}
                        {p.razorpayPaymentId && <p className="truncate max-w-[170px] text-slate-800" title={p.razorpayPaymentId}>Pay: {p.razorpayPaymentId}</p>}
                        {!p.razorpayOrderId && !p.razorpayPaymentId && <span>—</span>}
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-[230px]">
                        {p.status === 'failed' ? (
                          <div className="space-y-0.5 text-red-700">
                            {p.failureCode && (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-[10px] font-mono font-bold">
                                {p.failureCode}
                              </span>
                            )}
                            <p className="text-[11px] font-medium leading-snug">{p.failureReason || 'Failed on Razorpay'}</p>
                          </div>
                        ) : p.status === 'cancelled' ? (
                          <span className="text-[11px] text-amber-700">{p.failureReason || 'Dismissed by user'}</span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">Completed</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDateTime(p.paidAt || p.failedAt || p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p._id} className={`p-4 space-y-2.5 ${p.status === 'failed' ? 'bg-red-50/35' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.payerName || 'Unknown Payer'}</p>
                      <p className="text-xs font-semibold text-[#0586a8] mt-0.5">
                        {p.contactNumber || 'No contact number'}
                      </p>
                      {p.payerEmail && <p className="text-[11px] text-slate-500">{p.payerEmail}</p>}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize shrink-0 ${
                        STATUS_BADGES[p.status] || STATUS_BADGES.created
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                    <span className="font-semibold">{p.companyName || 'Workspace'}</span>
                    <span className="font-bold">
                      {p.planName || p.planId} • ₹{Number(p.amountInr || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {(p.failureReason || p.failureCode) && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {p.failureCode && <strong className="font-mono mr-1.5">[{p.failureCode}]</strong>}
                      <span>{p.failureReason}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="truncate max-w-[190px]">{p.razorpayOrderId || p.razorpayPaymentId || '—'}</span>
                    <span className="font-sans">{formatDateTime(p.paidAt || p.failedAt || p.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
