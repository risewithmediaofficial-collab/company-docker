import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { StatusBadge } from '../../components/ui/page';
import { useClients } from '../../hooks/useClients';
import {
  useProposal,
  useCreateProposal,
  useUpdateProposal,
  useAcceptProposal,
  useRejectProposal,
} from '../../hooks/useProposals';
import { formatINR } from '../../utils/currency';
import LinksEditor, { LinksList } from '../../components/ui/LinksEditor';

const SERVICE_CATEGORIES = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'website', label: 'Website' },
  { value: 'branding', label: 'Branding' },
  { value: 'seo', label: 'SEO' },
  { value: 'ads', label: 'Ads' },
  { value: 'video_editing', label: 'Video Editing' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'custom', label: 'Custom' },
];

const ProposalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isNew = id === 'new';
  const isClient = user?.role === 'client';
  const canManage = ['superAdmin', 'manager'].includes(user?.role);

  const { data: proposal, isLoading } = useProposal(isNew ? null : id);
  const { data: clients = [] } = useClients();
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const acceptProposal = useAcceptProposal();
  const rejectProposal = useRejectProposal();

  const [editing, setEditing] = useState(isNew);
  const [form, setForm] = useState({
    title: '',
    client: '',
    serviceCategory: 'custom',
    proposalType: '',
    description: '',
    scopeOfWork: '',
    deliverables: '',
    timeline: '',
    startDate: '',
    endDate: '',
    amount: '',
    paymentTerms: '',
    revisionLimit: 3,
    termsAndConditions: '',
    notes: '',
    links: [],
    status: 'draft',
  });

  useEffect(() => {
    if (proposal && !isNew) {
      setForm({
        title: proposal.title || '',
        client: proposal.client?._id || proposal.client || '',
        serviceCategory: proposal.serviceCategory || 'custom',
        proposalType: proposal.proposalType || '',
        description: proposal.description || '',
        scopeOfWork: proposal.scopeOfWork || '',
        deliverables: proposal.deliverables || '',
        timeline: proposal.timeline || '',
        startDate: proposal.startDate ? proposal.startDate.split('T')[0] : '',
        endDate: proposal.endDate ? proposal.endDate.split('T')[0] : '',
        amount: proposal.amount || '',
        paymentTerms: proposal.paymentTerms || '',
        revisionLimit: proposal.revisionLimit || 3,
        termsAndConditions: proposal.termsAndConditions || '',
        notes: proposal.notes || '',
        links: proposal.links || [],
        status: proposal.status || 'draft',
      });
    }
  }, [proposal, isNew]);

  const handleSave = async () => {
    const payload = {
      ...form,
      amount: Number(form.amount) || 0,
      revisionLimit: Number(form.revisionLimit) || 3,
    };
    if (isNew) {
      const created = await createProposal.mutateAsync(payload);
      navigate(`/proposals/${created._id}`);
      setEditing(false);
    } else {
      await updateProposal.mutateAsync({ id, data: payload });
      setEditing(false);
    }
  };

  if (!isNew && isLoading) {
    return <div className="animate-pulse h-64 rounded-3xl bg-card border border-border" />;
  }

  const ViewField = ({ label, value }) => (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm whitespace-pre-wrap">{value || '—'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={isClient ? '/client/proposals' : '/proposals'} className="rounded-xl p-2 hover:bg-secondary">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'Create Proposal' : proposal?.title}</h1>
            {proposal?.proposalNumber && (
              <p className="text-sm text-muted-foreground">{proposal.proposalNumber}</p>
            )}
          </div>
          {proposal?.status && <StatusBadge tone={proposal.status === 'accepted' ? 'success' : 'info'}>{proposal.status}</StatusBadge>}
        </div>
        <div className="flex gap-2">
          {isClient && proposal?.status === 'sent' && (
            <>
              <Button onClick={() => acceptProposal.mutate(id)} disabled={acceptProposal.isPending}>
                <CheckCircle2 size={16} className="mr-2" /> Accept
              </Button>
              <Button variant="outline" onClick={() => rejectProposal.mutate(id)}>
                <XCircle size={16} className="mr-2" /> Reject
              </Button>
            </>
          )}
          {canManage && !editing && !isNew && (
            <Button onClick={() => setEditing(true)}>Edit</Button>
          )}
          {canManage && editing && (
            <>
              <Button variant="outline" onClick={() => { setEditing(false); if (isNew) navigate('/proposals'); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={createProposal.isPending || updateProposal.isPending}>Save</Button>
            </>
          )}
          {canManage && isNew && (
            <Button onClick={handleSave} disabled={createProposal.isPending}>Create Proposal</Button>
          )}
        </div>
      </div>

      {editing && canManage ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Proposal Title *" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          <select className="app-input" value={form.client} onChange={(e) => setForm((c) => ({ ...c, client: e.target.value }))}>
            <option value="">Select client *</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.company || c.name}</option>)}
          </select>
          <select className="app-input" value={form.serviceCategory} onChange={(e) => setForm((c) => ({ ...c, serviceCategory: e.target.value }))}>
            {SERVICE_CATEGORIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Input placeholder="Proposal Type" value={form.proposalType} onChange={(e) => setForm((c) => ({ ...c, proposalType: e.target.value }))} />
          <Input type="number" placeholder="Total Amount (INR)" value={form.amount} onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))} />
          <select className="app-input" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}>
            {['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Input type="date" value={form.startDate} onChange={(e) => setForm((c) => ({ ...c, startDate: e.target.value }))} />
          <Input type="date" value={form.endDate} onChange={(e) => setForm((c) => ({ ...c, endDate: e.target.value }))} />
          <Textarea className="md:col-span-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
          <Textarea className="md:col-span-2" rows={3} placeholder="Scope of Work" value={form.scopeOfWork} onChange={(e) => setForm((c) => ({ ...c, scopeOfWork: e.target.value }))} />
          <Textarea className="md:col-span-2" rows={3} placeholder="Deliverables" value={form.deliverables} onChange={(e) => setForm((c) => ({ ...c, deliverables: e.target.value }))} />
          <Input placeholder="Timeline / Duration" value={form.timeline} onChange={(e) => setForm((c) => ({ ...c, timeline: e.target.value }))} />
          <Input placeholder="Payment Terms" value={form.paymentTerms} onChange={(e) => setForm((c) => ({ ...c, paymentTerms: e.target.value }))} />
          <Textarea className="md:col-span-2" rows={3} placeholder="Terms and Conditions" value={form.termsAndConditions} onChange={(e) => setForm((c) => ({ ...c, termsAndConditions: e.target.value }))} />
          <Textarea className="md:col-span-2" rows={2} placeholder="Notes" value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
          <div className="md:col-span-2">
            <LinksEditor links={form.links} onChange={(links) => setForm((c) => ({ ...c, links }))} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ViewField label="Client" value={proposal?.client?.company || proposal?.client?.name} />
          <ViewField label="Service Category" value={proposal?.serviceCategory} />
          <ViewField label="Amount" value={formatINR(proposal?.amount)} />
          <ViewField label="Timeline" value={proposal?.timeline} />
          <ViewField label="Payment Terms" value={proposal?.paymentTerms} />
          <ViewField label="Accepted At" value={proposal?.acceptedAt ? new Date(proposal.acceptedAt).toLocaleString() : null} />
          <ViewField label="Description" value={proposal?.description} />
          <ViewField label="Scope of Work" value={proposal?.scopeOfWork} />
          <ViewField label="Deliverables" value={proposal?.deliverables} />
          <ViewField label="Terms" value={proposal?.termsAndConditions} />
          <ViewField label="Notes" value={proposal?.notes} />
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attachments & Links</p>
            <LinksList links={proposal?.links} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalDetails;
