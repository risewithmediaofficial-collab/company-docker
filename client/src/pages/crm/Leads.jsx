import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Target,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLeadsKanban, useLeads, useUpdateLeadStage, useDeleteLead } from '../../hooks/useLeads';
import { AddLeadModal } from '../../components/modals/AddLeadModal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PIPELINE_STAGES = ['new', 'qualified', 'meeting_booked', 'proposal_sent', 'negotiation', 'won', 'lost'];

const STAGE_META = {
  new: {
    label: 'New',
    description: 'Fresh leads waiting for first touch.',
    badge: 'bg-sky-500/10 text-sky-700',
    surface: 'border-sky-200/70 bg-sky-500/[0.03]',
  },
  qualified: {
    label: 'Qualified',
    description: 'Great-fit leads ready for deeper discovery.',
    badge: 'bg-emerald-500/10 text-emerald-700',
    surface: 'border-emerald-200/70 bg-emerald-500/[0.03]',
  },
  meeting_booked: {
    label: 'Meeting Booked',
    description: 'Calls and demos already on the calendar.',
    badge: 'bg-violet-500/10 text-violet-700',
    surface: 'border-violet-200/70 bg-violet-500/[0.03]',
  },
  proposal_sent: {
    label: 'Proposal Sent',
    description: 'Decision makers reviewing your offer.',
    badge: 'bg-amber-500/10 text-amber-700',
    surface: 'border-amber-200/70 bg-amber-500/[0.03]',
  },
  negotiation: {
    label: 'Negotiation',
    description: 'Active conversations near the finish line.',
    badge: 'bg-rose-500/10 text-rose-700',
    surface: 'border-rose-200/70 bg-rose-500/[0.03]',
  },
  won: {
    label: 'Won',
    description: 'Closed business ready for handoff.',
    badge: 'bg-teal-500/10 text-teal-700',
    surface: 'border-teal-200/70 bg-teal-500/[0.03]',
  },
  lost: {
    label: 'Lost',
    description: 'Archived opportunities and learnings.',
    badge: 'bg-slate-500/10 text-slate-700',
    surface: 'border-slate-200/70 bg-slate-500/[0.03]',
  },
};

const PRIORITY_META = {
  low: 'bg-slate-500/10 text-slate-600',
  medium: 'bg-blue-500/10 text-blue-700',
  high: 'bg-amber-500/10 text-amber-700',
  urgent: 'bg-destructive/10 text-destructive',
};

const formatDate = (value) => {
  if (!value) return 'No follow-up date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No follow-up date';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getLeadValue = (lead) => {
  const amount = lead?.budget ?? lead?.value;
  if (!amount) return null;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: lead?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${lead?.currency || 'USD'} ${amount}`;
  }
};

const Leads = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState('kanban');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteLeadId, setDeleteLeadId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    if (searchParams.get('search')) setView('list');
  }, [searchParams]);

  // Queries
  const kanbanQuery = useLeadsKanban();
  const listQuery = useLeads({ search: searchTerm });
  const updateStageMutation = useUpdateLeadStage();
  const deleteLeadMutation = useDeleteLead();

  const isLoading = view === 'kanban' ? kanbanQuery.isLoading : listQuery.isLoading;
  const leads = listQuery.data || [];
  const kanbanData = kanbanQuery.data || {};
  const totalLeads = PIPELINE_STAGES.reduce((sum, stage) => sum + (kanbanData[stage]?.length || 0), 0);
  const activeLeads = totalLeads - (kanbanData.won?.length || 0) - (kanbanData.lost?.length || 0);
  const proposalLeads = (kanbanData.proposal_sent?.length || 0) + (kanbanData.negotiation?.length || 0);
  const hasSearch = searchTerm.trim().length > 0;

  const pipelineHighlights = [
    {
      label: 'Total leads',
      value: totalLeads,
      helper: 'Every opportunity in your funnel',
      icon: Target,
      tone: 'from-sky-500/10 to-sky-500/5 text-sky-700',
    },
    {
      label: 'Active pipeline',
      value: activeLeads,
      helper: 'Still in motion',
      icon: TrendingUp,
      tone: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700',
    },
    {
      label: 'Meetings booked',
      value: kanbanData.meeting_booked?.length || 0,
      helper: 'Upcoming conversations',
      icon: Calendar,
      tone: 'from-violet-500/10 to-violet-500/5 text-violet-700',
    },
    {
      label: 'Closing stages',
      value: proposalLeads,
      helper: 'Proposal or negotiation',
      icon: CheckCircle2,
      tone: 'from-amber-500/10 to-amber-500/5 text-amber-700',
    },
  ];

  const handleDeleteLead = async () => {
    if (deleteLeadId) {
      await deleteLeadMutation.mutateAsync(deleteLeadId);
      setDeleteLeadId(null);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      setView('list');
    }
  };

  const handleModalChange = (open) => {
    setShowAddModal(open);
    if (!open) setSelectedLead(null);
  };

  const handleDrop = async (e, stage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      await updateStageMutation.mutateAsync({ id: leadId, stage });
    }
  };

  const renderKanban = () => {
    return (
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Pipeline Board</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag leads between stages to keep the funnel current.
            </p>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
            {activeLeads} active leads across {PIPELINE_STAGES.length} stages
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <div className="grid w-max min-w-full auto-cols-[minmax(280px,320px)] grid-flow-col gap-5 pr-1">
            {PIPELINE_STAGES.map((stage) => {
              const stageInfo = STAGE_META[stage];
              const stageLeads = kanbanData[stage] || [];

              return (
                <section
                  key={stage}
                  className={`flex min-h-[520px] flex-col rounded-[28px] border bg-card/90 shadow-sm backdrop-blur-sm ${stageInfo.surface}`}
                >
                  <div className="border-b border-border/70 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">{stageInfo.label}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stageInfo.badge}`}>
                            {stageLeads.length}
                          </span>
                        </div>
                        <p className="mt-2 max-w-[20rem] text-xs leading-5 text-muted-foreground">
                          {stageInfo.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex min-h-0 flex-1 flex-col gap-3 p-4"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, stage)}
                  >
                    {stageLeads.length > 0 ? (
                      stageLeads.map((lead) => {
                        const leadValue = getLeadValue(lead);

                        return (
                          <motion.article
                            layoutId={lead._id}
                            key={lead._id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('leadId', lead._id)}
                            className="group cursor-grab rounded-2xl border border-border/80 bg-background/95 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${PRIORITY_META[lead.priority] || PRIORITY_META.medium}`}>
                                  {lead.priority || 'medium'}
                                </span>
                                {lead.source && (
                                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                    {lead.source}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                <button
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setShowAddModal(true);
                                  }}
                                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                  aria-label={`Edit ${lead.name}`}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteLeadId(lead._id)}
                                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                  aria-label={`Delete ${lead.name}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="text-sm font-bold text-foreground">{lead.name}</h4>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Building2 size={12} />
                                {lead.company || 'Independent lead'}
                              </p>
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                              {lead.email && (
                                <div className="flex items-center gap-2">
                                  <Mail size={12} />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone size={12} />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-3 py-2.5">
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                  {lead.assignedTo?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-foreground">
                                    {lead.assignedTo?.name || 'Unassigned'}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">Owner</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] font-semibold text-foreground">
                                  {leadValue || 'No value set'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {formatDate(lead.expectedCloseDate || lead.followUpDate || lead.createdAt)}
                                </p>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })
                    ) : (
                      <div className="flex flex-1 items-center justify-center rounded-[24px] border border-dashed border-border bg-background/80 p-6 text-center">
                        <div>
                          <p className="text-sm font-semibold text-foreground">No leads in {stageInfo.label.toLowerCase()}</p>
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            Drag a card here or add a new lead to keep the board moving.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-w-0 space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-background via-background to-secondary/70 shadow-sm">
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">CRM Pipeline</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Track every lead without losing the next step.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Keep new outreach, booked meetings, proposals, and negotiations in one focused workflow for the whole team.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <div className="inline-flex items-center rounded-2xl border border-border bg-card p-1 shadow-sm">
                <button
                  onClick={() => setView('kanban')}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    view === 'kanban'
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <LayoutGrid size={16} />
                  Board
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    view === 'list'
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <List size={16} />
                  List
                </button>
              </div>

              <Button
                onClick={() => {
                  setSelectedLead(null);
                  setShowAddModal(true);
                }}
                className="w-full justify-center sm:w-auto"
              >
                <Plus size={18} className="mr-2" />
                Add Lead
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {pipelineHighlights.map((item) => (
              <div
                key={item.label}
                className={`rounded-[24px] border border-border/80 bg-gradient-to-br px-4 py-4 shadow-sm ${item.tone}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{item.value}</p>
                  </div>
                  <div className="rounded-2xl bg-background/80 p-3">
                    <item.icon size={18} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{item.helper}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[26px] border border-border/80 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search leads, companies, phone numbers..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm shadow-inner outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                  {view === 'kanban' ? 'Board view active' : 'List view active'}
                </div>
                <div className="rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                  {hasSearch ? `${leads.length} matching leads` : `${totalLeads} total leads`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <TableSkeleton columns={5} rows={6} dark={false} />
      ) : (
        view === 'kanban' ? renderKanban() : (
          <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="rounded-full bg-secondary p-4 text-muted-foreground">
                  <Search size={22} />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">
                  {hasSearch ? 'No matching leads found' : 'No leads yet'}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {hasSearch
                    ? 'Try a different company name, contact, or phone number to widen the results.'
                    : 'Create your first lead to start filling the pipeline and tracking each stage.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border bg-secondary/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-4 font-semibold sm:px-6">Lead Name</th>
                      <th className="px-4 py-4 font-semibold sm:px-6">Company</th>
                      <th className="px-4 py-4 font-semibold sm:px-6">Email</th>
                      <th className="px-4 py-4 font-semibold sm:px-6">Stage</th>
                      <th className="px-4 py-4 font-semibold sm:px-6">Owner</th>
                      <th className="px-4 py-4 font-semibold sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leads.map((lead) => {
                      const stageInfo = STAGE_META[lead.stage] || STAGE_META.new;

                      return (
                        <tr key={lead._id} className="group transition-colors hover:bg-secondary/20">
                          <td className="px-4 py-4 sm:px-6">
                            <div className="font-semibold text-foreground">{lead.name}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{lead.phone || 'No phone added'}</div>
                          </td>
                          <td className="px-4 py-4 sm:px-6">{lead.company || 'Independent lead'}</td>
                          <td className="px-4 py-4 sm:px-6">{lead.email || 'No email added'}</td>
                          <td className="px-4 py-4 sm:px-6">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stageInfo.badge}`}>
                              {lead.status || stageInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                {lead.assignedTo?.name?.charAt(0) || 'U'}
                              </div>
                              <span className="text-xs text-foreground">{lead.assignedTo?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right sm:px-6">
                            <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                              <button
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowAddModal(true);
                                }}
                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                aria-label={`Edit ${lead.name}`}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteLeadId(lead._id)}
                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Delete ${lead.name}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      <AddLeadModal
        open={showAddModal}
        onOpenChange={handleModalChange}
        lead={selectedLead}
      />

      <AlertDialog open={!!deleteLeadId} onOpenChange={(open) => !open && setDeleteLeadId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLead}
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

export default Leads;
