import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit2, MessageSquarePlus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/page';
import { useLead } from '../../hooks/useLeads';
import { AddLeadModal } from '../../components/modals/AddLeadModal';
import { formatINR } from '../../utils/currency';

const Field = ({ label, value }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-2 text-sm font-medium text-foreground whitespace-pre-wrap">{value || '—'}</p>
  </div>
);

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const { data: lead, isLoading, refetch } = useLead(id);

  if (isLoading) {
    return <div className="animate-pulse h-64 rounded-3xl bg-card border border-border" />;
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Lead not found</p>
        <Button className="mt-4" onClick={() => navigate('/crm/leads')}>Back to Leads</Button>
      </div>
    );
  }

  const dealValue = lead.budget ?? lead.value;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/crm/leads" className="rounded-xl p-2 hover:bg-secondary">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <p className="text-sm text-muted-foreground">{lead.company || 'Independent lead'}</p>
          </div>
          <StatusBadge tone="info">{lead.status || lead.stage}</StatusBadge>
        </div>
        <Button onClick={() => setEditing(true)}>
          <Edit2 size={16} className="mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Phone" value={lead.phone} />
        <Field label="Email" value={lead.email} />
        <Field label="Source" value={lead.source} />
        <Field label="Service Interested" value={lead.serviceInterest} />
        <Field label="Decision Maker" value={lead.decisionMaker} />
        <Field label="Deal Value" value={dealValue ? formatINR(dealValue) : null} />
        <Field label="Assigned Person" value={lead.assignedTo?.name} />
        <Field label="Follow-up Date" value={lead.followUpDate || lead.expectedCloseDate ? new Date(lead.followUpDate || lead.expectedCloseDate).toLocaleString() : null} />
        <Field label="Refollow Date" value={lead.refollowDate ? new Date(lead.refollowDate).toLocaleString() : null} />
        <Field label="Created" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString() : null} />
        <Field label="Updated" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : null} />
      </div>

      <Field label="Notes" value={lead.notes} />

      <AddLeadModal
        open={editing}
        onOpenChange={(open) => {
          setEditing(open);
          if (!open) refetch();
        }}
        lead={lead}
      />
    </div>
  );
};

export default LeadDetails;
