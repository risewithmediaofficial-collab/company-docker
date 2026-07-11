import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader, PageToolbar, SearchField, StatusBadge } from '../../components/ui/page';
import { AddProposalModal } from '../../components/modals/AddProposalModal';
import { useProposals } from '../../hooks/useProposals';
import { formatINR } from '../../utils/currency';

const statusTone = {
  draft: 'neutral',
  sent: 'info',
  viewed: 'info',
  accepted: 'success',
  rejected: 'danger',
  expired: 'warning',
};

const Proposals = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const canManage = ['superAdmin', 'manager'].includes(user?.role);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const { data: proposals = [], isLoading } = useProposals(statusFilter ? { status: statusFilter } : {});

  const filtered = proposals.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      p.title?.toLowerCase().includes(q)
      || p.client?.name?.toLowerCase().includes(q)
      || p.proposalNumber?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'title',
      label: 'Proposal',
      render: (row) => (
        <div>
          <div className="font-semibold">{row.title}</div>
          <div className="text-xs text-muted-foreground">{row.proposalNumber}</div>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (row) => row.client?.company || row.client?.name || '—',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => formatINR(row.amount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge tone={statusTone[row.status] || 'neutral'}>{row.status}</StatusBadge>
      ),
    },
    {
      key: 'acceptedAt',
      label: 'Accepted',
      render: (row) => row.acceptedAt ? new Date(row.acceptedAt).toLocaleString() : '—',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals Dashboard"
        description="Create and manage client proposals. Accepted proposals can be linked when creating projects."
        actions={canManage ? (
          <Button onClick={() => { setSelectedProposal(null); setShowCreateModal(true); }}>
            <Plus size={16} className="mr-2" />
            Create Proposal
          </Button>
        ) : null}
      />

      <PageToolbar>
        <SearchField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search proposals..." />
        <select className="app-input w-full sm:w-auto sm:min-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="" onClick={() => setStatusFilter('')}>All statuses</option>
          {['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'].map((s) => (
            <option key={s} value={s} onClick={() => { if (statusFilter === s) setStatusFilter(''); }}>{s}</option>
          ))}
        </select>
        <div className="app-pill">{filtered.length} proposals</div>
      </PageToolbar>

      <DataTable
        data={filtered}
        columns={columns}
        loading={isLoading}
        onRowClick={(row) => navigate(`/proposals/${row._id}`)}
        onEdit={canManage ? (row) => { setSelectedProposal(row); setShowCreateModal(true); } : null}
        emptyTitle="No proposals yet"
        emptyDescription="Create a proposal to send to your client."
        emptyAction={canManage ? (
          <Button onClick={() => { setSelectedProposal(null); setShowCreateModal(true); }}>
            <Plus size={16} className="mr-2" />
            Create Proposal
          </Button>
        ) : null}
      />

      <AddProposalModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) setSelectedProposal(null);
        }}
        proposal={selectedProposal}
      />
    </div>
  );
};

export default Proposals;
