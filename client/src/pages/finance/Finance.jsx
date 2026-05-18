import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, FileText, Plus, Receipt } from 'lucide-react';
import { useDeleteFinanceEntry, useDeleteInvoice, useFinance, useInvoices } from '../../hooks/useFinance';
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

  const { data: entries = [], isLoading: entriesLoading } = useFinance({ search: searchTerm });
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices({ search: searchTerm });
  const deleteEntryMutation = useDeleteFinanceEntry();
  const deleteInvoiceMutation = useDeleteInvoice();

  const incomeTotal = entries
    .filter((entry) => entry.type === 'Income')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expenseTotal = entries
    .filter((entry) => entry.type !== 'Income')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const pendingInvoices = invoices.filter((invoice) => ['Draft', 'Sent', 'Overdue'].includes(invoice.status)).length;
  const collectedRevenue = invoices
    .filter((invoice) => invoice.status === 'Paid')
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

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
        <StatusBadge tone={invoiceStatusTone[row.status] || 'neutral'}>
          {row.status || 'Unknown'}
        </StatusBadge>
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
            <Button
              onClick={() => {
                setSelectedInvoice(null);
                setShowAddInvoiceModal(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Create Invoice
            </Button>
          </>
        )}
      >
        <MetricGrid>
          <MetricCard label="Income" value={currencyFormatter.format(incomeTotal)} helper="Visible payments and booked income" icon={ArrowUpCircle} tone="success" />
          <MetricCard label="Expenses" value={currencyFormatter.format(expenseTotal)} helper="Tracked outgoing operational spend" icon={ArrowDownCircle} tone="danger" />
          <MetricCard label="Pending Invoices" value={pendingInvoices} helper="Draft, sent, or overdue invoices needing action" icon={FileText} tone="warning" />
          <MetricCard label="Collected Revenue" value={currencyFormatter.format(collectedRevenue)} helper="Invoices already marked as paid" icon={Receipt} tone="primary" />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search categories, clients, invoice numbers, or payment methods..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="app-pill">{entries.length} entries</div>
          <div className="app-pill">{invoices.length} invoices</div>
        </div>
      </PageToolbar>

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
          data={entries}
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

      <SectionCard
        title="Invoices"
        description="Keep billing follow-up, due dates, and client invoice status visible in one place."
        action={(
          <Button
            onClick={() => {
              setSelectedInvoice(null);
              setShowAddInvoiceModal(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Create Invoice
          </Button>
        )}
      >
        <DataTable
          data={invoices}
          columns={invoiceColumns}
          loading={invoicesLoading}
          onRowClick={(invoice) => {
            setSelectedInvoice(invoice);
            setShowAddInvoiceModal(true);
          }}
          onEdit={(invoice) => {
            setSelectedInvoice(invoice);
            setShowAddInvoiceModal(true);
          }}
          onDelete={(id) => setDeleteInvoiceId(id)}
          emptyTitle="No invoices created yet"
          emptyDescription="Create an invoice to start tracking billing, payment collection, and overdue follow-up."
        />
      </SectionCard>

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
