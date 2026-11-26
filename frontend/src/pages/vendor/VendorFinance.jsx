import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  Receipt,
} from '@/components/ui/muiIcons';
import { useSelector } from 'react-redux';
import { useVendorMyFinance } from '../../hooks/useFinance';
import { formatINR } from '../../utils/financeFormatters';
import WorkspacePage from '../../components/ui/WorkspacePage';
import { EmptyState, SearchField } from '../../components/ui/page';
import { getAssetUrl } from '../../utils/assetUrl';
import { cn } from '../../utils/cn';

const PAYMENT_STATUS_META = {
  paid: {
    label: 'Paid',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  partially_paid: {
    label: 'Partially Paid',
    badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  },
  unpaid: {
    label: 'Pending / Unpaid',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
};

export default function VendorFinance() {
  const { user } = useSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedBillId, setExpandedBillId] = useState(null);

  const { data, isLoading } = useVendorMyFinance();
  const bills = data?.bills || [];
  const summary = data?.summary || {
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    billCount: 0,
    paidCount: 0,
    unpaidCount: 0,
  };

  const filteredBills = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bills.filter((bill) => {
      if (statusFilter !== 'all' && bill.paymentStatus !== statusFilter) return false;
      if (q) {
        const hay = [bill.title, bill.description, bill.project?.name, bill.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bills, statusFilter, search]);

  return (
    <WorkspacePage
      breadcrumbs={['Vendor Portal', user?.position || 'Vendor', 'My Finance']}
      title="My Finance & Payout Status"
      icon={IndianRupee}
      properties={[
        { label: 'Total Billed', value: formatINR(summary.totalBilled), tone: 'neutral', icon: Receipt },
        { label: 'Total Paid', value: formatINR(summary.totalPaid), tone: 'success', icon: CheckCircle2 },
        { label: 'Pending Balance', value: formatINR(summary.totalPending), tone: summary.totalPending > 0 ? 'warning' : 'neutral', icon: Clock },
        { label: 'Bills Recorded', value: summary.billCount, tone: 'neutral', icon: IndianRupee },
      ]}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${bills.length})` },
              { id: 'unpaid', label: 'Pending / Unpaid' },
              { id: 'partially_paid', label: 'Partially Paid' },
              { id: 'paid', label: 'Paid' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer',
                  statusFilter === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/70 text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills, project, notes..."
            className="w-full sm:w-64"
          />
        </div>

        {isLoading ? (
          <div className="h-52 rounded-2xl bg-card border border-border flex items-center justify-center text-sm text-muted-foreground">
            Loading your finance records...
          </div>
        ) : filteredBills.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No finance bills found"
            description="Only bills and payouts recorded under your vendor account appear here."
          />
        ) : (
          <div className="space-y-3">
            {filteredBills.map((bill) => {
              const meta = PAYMENT_STATUS_META[bill.paymentStatus] || PAYMENT_STATUS_META.unpaid;
              const isExpanded = expandedBillId === bill._id;
              return (
                <div
                  key={bill._id}
                  className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <div
                    onClick={() => setExpandedBillId(isExpanded ? null : bill._id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-secondary/20"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground truncate">{bill.title}</h3>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-bold', meta.badge)}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{bill.date ? format(new Date(bill.date), 'MMM d, yyyy') : ''}</span>
                        {bill.project?.name && <span>• Project: {bill.project.name}</span>}
                        {bill.category && <span>• {bill.category}</span>}
                      </div>
                      {bill.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{bill.description}</p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0 tabular-nums">
                      <div className="text-base font-bold text-foreground">{formatINR(bill.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        Paid <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(bill.paidAmount)}</span>
                        {bill.balanceAmount > 0 && (
                          <>
                            {' · '}
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              Due {formatINR(bill.balanceAmount)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-border/70 bg-secondary/15 space-y-3">
                      {bill.notes && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Notes: </span>
                          {bill.notes}
                        </p>
                      )}

                      {bill.receiptUrl && (
                        <div>
                          <a
                            href={getAssetUrl(bill.receiptUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            View Receipt / Attachment <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Payment History ({bill.payments?.length || 0})
                        </p>
                        {bill.payments && bill.payments.length > 0 ? (
                          <div className="space-y-1.5">
                            {bill.payments.map((pay, idx) => (
                              <div
                                key={pay._id || idx}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background border border-border px-3 py-2 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                    {formatINR(pay.amount)}
                                  </span>
                                  <span className="text-muted-foreground">via {pay.paymentMode || 'Bank'}</span>
                                  {pay.reference && (
                                    <span className="text-muted-foreground">• Ref: {pay.reference}</span>
                                  )}
                                </div>
                                <span className="text-muted-foreground">
                                  {pay.paymentDate ? format(new Date(pay.paymentDate), 'MMM d, yyyy') : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspacePage>
  );
}
