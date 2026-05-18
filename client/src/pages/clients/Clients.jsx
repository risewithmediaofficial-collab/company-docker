import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Building2, CircleDollarSign, Plus, Users } from 'lucide-react';
import { useClients, useDeleteClient } from '../../hooks/useClients';
import { AddClientModal } from '../../components/modals/AddClientModal';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { MetricCard, MetricGrid, PageHeader, PageToolbar, SearchField, StatusBadge } from '../../components/ui/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const clientStatusTone = {
  Active: 'success',
  Prospect: 'warning',
  Churned: 'danger',
  Inactive: 'neutral',
};

const Clients = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteClientId, setDeleteClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clients = [], isLoading } = useClients({ search: searchTerm });
  const deleteClientMutation = useDeleteClient();

  const activeClients = clients.filter((client) => client.status === 'Active').length;
  const prospectClients = clients.filter((client) => client.status === 'Prospect').length;
  const totalRevenue = clients.reduce((sum, client) => sum + Number(client.totalRevenue || 0), 0);

  const columns = [
    {
      key: 'name',
      label: 'Contact',
      render: (row) => (
        <div className="min-w-0">
          <Link to={`/clients/${row._id}`} className="font-semibold transition-colors hover:text-primary">
            {row.name}
          </Link>
          <div className="mt-1 text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (row) => (
        <span className="font-medium text-foreground">{row.company || 'Independent client'}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => row.phone || 'Not added',
    },
    {
      key: 'industry',
      label: 'Industry',
      render: (row) => row.industry || 'Not specified',
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      render: (row) => (
        <span className="font-semibold text-foreground">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(row.totalRevenue || 0))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge tone={clientStatusTone[row.status] || 'neutral'}>
          {row.status}
        </StatusBadge>
      ),
    },
  ];

  const handleDeleteClient = async () => {
    if (deleteClientId) {
      await deleteClientMutation.mutateAsync(deleteClientId);
      setDeleteClientId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Operations"
        title="Keep every client relationship organized."
        description="Track contacts, commercial value, and lifecycle status in one cleaner operational view."
        actions={(
          <Button
            onClick={() => {
              setSelectedClient(null);
              setShowAddModal(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Client
          </Button>
        )}
      >
        <MetricGrid>
          <MetricCard label="Client Records" value={clients.length} helper="Visible in the current search scope" icon={Users} tone="info" />
          <MetricCard label="Active Accounts" value={activeClients} helper="Clients currently in service" icon={Building2} tone="success" />
          <MetricCard label="Prospects" value={prospectClients} helper="Warm opportunities still being nurtured" icon={Briefcase} tone="warning" />
          <MetricCard
            label="Tracked Revenue"
            value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue)}
            helper="Combined revenue attached to visible clients"
            icon={CircleDollarSign}
            tone="primary"
          />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search clients, companies, or email addresses..."
        />
        <div className="app-pill">{clients.length} clients</div>
      </PageToolbar>

      <DataTable
        data={clients}
        columns={columns}
        loading={isLoading}
        onRowClick={(client) => navigate(`/clients/${client._id}`)}
        onEdit={(client) => {
          setSelectedClient(client);
          setShowAddModal(true);
        }}
        onDelete={(id) => setDeleteClientId(id)}
        emptyTitle="No clients found"
        emptyDescription="Try a broader search or create a new client to start building the relationship database."
      />

      <AddClientModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        client={selectedClient}
      />

      <AlertDialog open={!!deleteClientId} onOpenChange={(open) => !open && setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
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

export default Clients;
