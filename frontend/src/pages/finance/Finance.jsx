import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2, FileText, Plus, Receipt } from 'lucide-react';
import {
  useDeleteFinanceEntry,
  useDeleteInvoice,
  useFinance,
  useFinanceSummary,
  useInvoices,
  useMarkInvoicePaid,
  usePayments,
} from '../../hooks/useFinance';
import { AddFinanceModal } from '../../components/modals/AddFinanceModal';
import { AddInvoiceModal } from '../../components/modals/AddInvoiceModal';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import {
  MetricCard,
  MetricGrid,
  PageHeader,
  PageToolbar,
  SearchField,
  SectionCard,
  StatusBadge,
} from '../../components/ui/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const entryTypeTone = {
  Income: 'success',
  Expense: 'danger',
};

const financeStatusTone = {
  Completed: 'success',
  Pending: 'warning',
  Cancelled: 'danger',
  Failed: 'danger',
};

const invoiceStatusTone = {
  Paid: 'success',
  Sent: 'info',
  Draft: 'neutral',
  Overdue: 'danger',
};

const Finance = () => {
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useSelector((state) => state.auth);
  const canViewSummary = ['superAdmin', 'manager'].includes(user?.role);
  const canManageBilling = ['superAdmin', 'manager'].includes(user?.role);
  const canDeleteInvoices = user?.role === 'superAdmin';

  const { data: entries = [], isLoading: entriesLoading } = useFinance();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: payments = [] } = usePayments();
  const { data: summary = {} } = useFinanceSummary({ enabled: canViewSummary });
  const deleteEntryMutation = useDeleteFinanceEntry();
  const deleteInvoiceMutation = useDeleteInvoice();
  const markPaidMutation = useMarkInvoicePaid();

  // Ensure data is always an array
  const safeEntries = Array.isArray(entries) ? entries : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // Simple search filter
  const filteredEntries = safeEntries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    return (
      (entry.category?.toLowerCase() || '').includes(term) ||
      (entry.description?.toLowerCase() || '').includes(term) ||
      (entry.paymentMethod?.toLowerCase() || '').includes(term) ||
      (entry.client?.name?.toLowerCase() || '').includes(term) ||
      (entry.client?.company?.toLowerCase() || '').includes(term) ||
      (entry.project?.name?.toLowerCase() || '').includes(term)
    );
  });

  const filteredInvoices = safeInvoices.filter((invoice) => {
    const term = searchTerm.toLowerCase();
    return (
      (invoice.invoiceNumber?.toLowerCase() || '').includes(term) ||
      (invoice.client?.name?.toLowerCase() || '').includes(term) ||
      (invoice.client?.company?.toLowerCase() || '').includes(term) ||
      (invoice.project?.name?.toLowerCase() || '').includes(term)
    );
  });

  const incomeTotal = summary.totalRevenue ?? safeEntries
    .filter((entry) => entry.type === 'Income')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expenseTotal = summary.totalExpenses ?? safeEntries
    .filter((entry) => entry.type !== 'Income')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const pendingInvoices = summary.pendingInvoices ?? safeInvoices.filter((invoice) => ['Draft', 'Sent', 'Overdue'].includes(invoice.status)).length;
  const entryColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <StatusBadge tone={entryTypeTone[row.type] || 'neutral'}>
          {row.type}
        </StatusBadge>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.category || 'General'}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.description || 'No description added'}</div>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client / Project',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-medium text-foreground">{row.client?.company || row.client?.name || 'Not linked'}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.project?.name || 'No project'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-semibold text-foreground">
          {currencyFormatter.format(Number(row.amount || 0))}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => row.date ? new Date(row.date).toLocaleDateString() : 'Not set',
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (row) => row.paymentMethod || 'Not specified',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge tone={financeStatusTone[row.status] || 'neutral'}>
          {row.status || 'Unknown'}
        </StatusBadge>
      ),
    },
  ];

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.invoiceNumber}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Due {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'not scheduled'}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.client?.name || 'Unknown client'}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.client?.company || 'No company linked'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-semibold text-foreground">
          {currencyFormatter.format(Number(row.amount || 0))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge tone={invoiceStatusTone[row.status] || 'neutral'}>
            {row.status || 'Unknown'}
          </StatusBadge>
          {canManageBilling && row.status !== 'Paid' ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                markPaidMutation.mutate({ id: row._id });
              }}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600"
              title="Mark paid"
            >
              <CheckCircle2 size={16} />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  const handleDeleteEntry = async () => {
    if (!deleteEntryId) return;
    await deleteEntryMutation.mutateAsync(deleteEntryId);
    setDeleteEntryId(null);
  };

  const handleDeleteInvoice = async () => {
    if (!deleteInvoiceId) return;
    await deleteInvoiceMutation.mutateAsync(deleteInvoiceId);
    setDeleteInvoiceId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance Workspace"
        title="Track cash flow and billing with less friction."
        description="Keep revenue, expenses, and invoice follow-up in one structured financial workspace that is easier to scan and manage."
        actions={(
          <>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedEntry(null);
                setShowAddEntryModal(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Entry
            </Button>
            {canManageBilling ? (
              <Button
                onClick={() => {
                  setSelectedInvoice(null);
                  setShowAddInvoiceModal(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Create Invoice
              </Button>
            ) : null}
          </>
        )}
      >
        <MetricGrid>
          <MetricCard label="Income" value={currencyFormatter.format(incomeTotal)} helper="Visible payments and booked income" icon={ArrowUpCircle} tone="success" />
          <MetricCard label="Expenses" value={currencyFormatter.format(expenseTotal)} helper="Tracked outgoing operational spend" icon={ArrowDownCircle} tone="danger" />
          <MetricCard label="Pending Invoices" value={pendingInvoices} helper="Draft, sent, or overdue invoices needing action" icon={FileText} tone="warning" />
          <MetricCard label="Payments" value={payments.length} helper="Recorded invoice payments" icon={Receipt} tone="primary" />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search categories, clients, invoice numbers, or payment methods..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="app-pill">{filteredEntries.length} entries</div>
          <div className="app-pill">{filteredInvoices.length} invoices</div>
        </div>
      </PageToolbar>

      {/* Finance Entries Section */}
      {entriesLoading ? (
        <SectionCard title="Finance Entries" description="Loading...">
          <div className="py-12 text-center text-muted-foreground">Loading entries...</div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Finance Entries"
          description="Monitor income and expense activity without losing category or payment context."
          action={(
            <Button
              variant="outline"
              onClick={() => {
                setSelectedEntry(null);
                setShowAddEntryModal(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Entry
            </Button>
          )}
        >
          <DataTable
            data={filteredEntries}
            columns={entryColumns}
            loading={entriesLoading}
            onRowClick={(entry) => {
              setSelectedEntry(entry);
              setShowAddEntryModal(true);
            }}
            onEdit={(entry) => {
              setSelectedEntry(entry);
              setShowAddEntryModal(true);
            }}
            onDelete={(id) => setDeleteEntryId(id)}
            emptyTitle="No finance entries found"
            emptyDescription="Add your first income or expense entry to start building a reliable cash-flow record."
          />
        </SectionCard>
      )}

      {/* Invoices Section */}
      {invoicesLoading ? (
        <SectionCard title="Invoices" description="Loading...">
          <div className="py-12 text-center text-muted-foreground">Loading invoices...</div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Invoices"
          description="Keep billing follow-up, due dates, and client invoice status visible in one place."
          action={canManageBilling ? (
            <Button
              onClick={() => {
                setSelectedInvoice(null);
                setShowAddInvoiceModal(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Create Invoice
            </Button>
          ) : null}
        >
          <DataTable
            data={filteredInvoices}
            columns={invoiceColumns}
            loading={invoicesLoading}
            onRowClick={canManageBilling ? (invoice) => {
              setSelectedInvoice(invoice);
              setShowAddInvoiceModal(true);
            } : null}
            onEdit={canManageBilling ? (invoice) => {
              setSelectedInvoice(invoice);
              setShowAddInvoiceModal(true);
            } : null}
            onDelete={canDeleteInvoices ? (id) => setDeleteInvoiceId(id) : null}
            emptyTitle="No invoices created yet"
            emptyDescription="Create an invoice to start tracking billing, payment collection, and overdue follow-up."
          />
        </SectionCard>
      )}

      <AddFinanceModal
        open={showAddEntryModal}
        onOpenChange={setShowAddEntryModal}
        entry={selectedEntry}
      />

      <AddInvoiceModal
        open={showAddInvoiceModal}
        onOpenChange={setShowAddInvoiceModal}
        invoice={selectedInvoice}
      />

      <AlertDialog open={!!deleteEntryId} onOpenChange={(open) => !open && setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this finance entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Finance;
