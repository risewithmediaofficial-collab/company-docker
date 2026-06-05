import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader, StatusBadge } from '../../components/ui/page';
import { useProposals } from '../../hooks/useProposals';
import { formatINR } from '../../utils/currency';

const ClientProposals = () => {
  const navigate = useNavigate();
  const { data: proposals = [], isLoading } = useProposals();

  const columns = [
    { key: 'title', label: 'Proposal', render: (row) => row.title },
    { key: 'amount', label: 'Amount', render: (row) => formatINR(row.amount) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge tone={row.status === 'accepted' ? 'success' : 'info'}>{row.status}</StatusBadge>,
    },
    {
      key: 'acceptedAt',
      label: 'Accepted',
      render: (row) => row.acceptedAt ? new Date(row.acceptedAt).toLocaleString() : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Portal"
        title="Your Proposals"
        description="Review proposals sent to you and accept the one you want to proceed with."
      />
      <DataTable
        data={proposals}
        columns={columns}
        loading={isLoading}
        onRowClick={(row) => navigate(`/proposals/${row._id}`)}
        emptyTitle="No proposals yet"
        emptyDescription="Proposals from your agency will appear here."
      />
    </div>
  );
};

export default ClientProposals;
