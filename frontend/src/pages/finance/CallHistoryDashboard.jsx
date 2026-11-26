import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Phone, PhoneCall, Calendar, User, Edit2, Trash2, CheckCircle2, AlertCircle } from '@/components/ui/muiIcons';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { useLeads, useUpdateLead } from '../../hooks/useLeads';
import { useCallHistory, useCreateCallHistory, useUpdateCallHistory, useDeleteCallHistory } from '../../hooks/useFinance';
import { SelectDropdown } from '../../components/ui/SelectDropdown';
import { Button } from '../../components/ui/button';
import { PageHeader, PageToolbar, MetricGrid, MetricCard, EmptyState, SearchField } from '../../components/ui/page';
import { useDateFilter } from '../../context/DateFilterContext';

const CALL_TYPES = ['Incoming', 'Outgoing', 'Missed', 'WhatsApp Call', 'Google Meet', 'Zoom', 'Direct Meeting'];
const CALL_PURPOSES = ['Payment Follow-up', 'Task Discussion', 'Requirement Collection', 'Approval Follow-up', 'Rework Discussion', 'General Update', 'Complaint', 'Other'];
const LEAD_STAGES = ['new', 'contacted', 'qualified', 'meeting_booked', 'proposal_sent', 'negotiation', 'won', 'lost', 'refollow_later'];
const LEAD_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const LEAD_SOURCES = ['website', 'referral', 'social_media', 'cold_call', 'email_campaign', 'walk_in', 'other'];

export default function CallHistoryDashboard() {
  const { user } = useSelector((state) => state.auth);
  const canManage = ['superAdmin', 'admin', 'manager', 'employee'].includes(user?.role);

  // Queries
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const { data: leads = [] } = useLeads();
  const [filterType, setFilterType] = useState('all'); // all, client, lead
  const [searchQuery, setSearchQuery] = useState('');

  const callHistoryQuery = useCallHistory();
  const createCallHistory = useCreateCallHistory();
  const updateCallHistory = useUpdateCallHistory();
  const deleteCallHistory = useDeleteCallHistory();
  const updateLead = useUpdateLead();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formType, setFormType] = useState('client'); // client, lead, unregistered
  const [form, setForm] = useState({
    clientId: '',
    leadId: '',
    projectId: '',
    callType: 'Outgoing',
    callPurpose: 'General Update',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '',
    spokenWith: '',
    contactNumber: '',
    callSummary: '',
    clientResponse: '',
    nextAction: '',
    nextFollowUpDate: '',
    visibleToClient: false,
    // Extra lead details to update lead directly
    leadStage: 'contacted',
    leadValue: 0,
    leadPriority: 'medium',
    leadSource: 'other',
    unregisteredClientName: '',
    unregisteredClientPhone: '',
    unregisteredClientAddress: '',
  });

  // Load editing values
  const startEdit = (call) => {
    setIsEditing(true);
    setEditingId(call._id);
    const isLeadCall = !!call.leadId;
    const isUnregistered = !call.clientId && !call.leadId && !!call.unregisteredClientName;
    setFormType(isUnregistered ? 'unregistered' : (isLeadCall ? 'lead' : 'client'));
    setForm({
      clientId: call.clientId?._id || '',
      leadId: call.leadId?._id || '',
      projectId: call.projectId?._id || '',
      callType: call.callType || 'Outgoing',
      callPurpose: call.callPurpose || 'General Update',
      callDate: call.callDate ? new Date(call.callDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      callTime: call.callTime || '',
      spokenWith: call.spokenWith || '',
      contactNumber: call.contactNumber || '',
      callSummary: call.callSummary || '',
      clientResponse: call.clientResponse || '',
      nextAction: call.nextAction || '',
      nextFollowUpDate: call.nextFollowUpDate ? new Date(call.nextFollowUpDate).toISOString().split('T')[0] : '',
      visibleToClient: !!call.visibleToClient,
      leadStage: call.leadId?.stage || 'contacted',
      leadValue: call.leadId?.value || 0,
      leadPriority: call.leadId?.priority || 'medium',
      leadSource: call.leadId?.source || 'other',
      unregisteredClientName: call.unregisteredClientName || '',
      unregisteredClientPhone: call.unregisteredClientPhone || '',
      unregisteredClientAddress: call.unregisteredClientAddress || '',
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      clientId: '',
      leadId: '',
      projectId: '',
      callType: 'Outgoing',
      callPurpose: 'General Update',
      callDate: new Date().toISOString().split('T')[0],
      callTime: '',
      spokenWith: '',
      contactNumber: '',
      callSummary: '',
      clientResponse: '',
      nextAction: '',
      nextFollowUpDate: '',
      visibleToClient: false,
      leadStage: 'contacted',
      leadValue: 0,
      leadPriority: 'medium',
      leadSource: 'other',
      unregisteredClientName: '',
      unregisteredClientPhone: '',
      unregisteredClientAddress: '',
    });
  };

  // Pre-populate lead details if lead changes
  useEffect(() => {
    if (formType === 'lead' && form.leadId) {
      const selectedLead = leads.find((l) => l._id === form.leadId);
      if (selectedLead) {
        setForm((prev) => ({
          ...prev,
          spokenWith: selectedLead.name || prev.spokenWith,
          contactNumber: selectedLead.phone || prev.contactNumber,
          leadStage: selectedLead.stage || prev.leadStage,
          leadValue: selectedLead.value || prev.leadValue,
          leadPriority: selectedLead.priority || prev.leadPriority,
          leadSource: selectedLead.source || prev.leadSource,
        }));
      }
    }
  }, [form.leadId, formType, leads]);

  // Project dropdown filtering
  const filteredProjects = useMemo(() => {
    if (!form.clientId) return [];
    return projects.filter((p) => (p.client?._id || p.client) === form.clientId);
  }, [projects, form.clientId]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isLead = formType === 'lead';
    const isUnregistered = formType === 'unregistered';

    const payload = {
      clientId: isLead || isUnregistered ? undefined : form.clientId || undefined,
      leadId: isLead ? form.leadId || undefined : undefined,
      projectId: isLead || isUnregistered ? undefined : form.projectId || undefined,
      callType: form.callType,
      callPurpose: form.callPurpose === 'Other' && form.customCallPurpose?.trim() ? form.customCallPurpose.trim() : form.callPurpose,
      callDate: form.callDate,
      callTime: form.callTime,
      spokenWith: form.spokenWith,
      contactNumber: isUnregistered ? form.unregisteredClientPhone : form.contactNumber,
      callSummary: form.callSummary,
      clientResponse: form.clientResponse,
      nextAction: form.nextAction,
      nextFollowUpDate: form.nextFollowUpDate || undefined,
      visibleToClient: form.visibleToClient,
      unregisteredClientName: isUnregistered ? form.unregisteredClientName : undefined,
      unregisteredClientPhone: isUnregistered ? form.unregisteredClientPhone : undefined,
      unregisteredClientAddress: isUnregistered ? form.unregisteredClientAddress : undefined,
    };

    try {
      if (isEditing) {
        await updateCallHistory.mutateAsync({ id: editingId, data: payload });
        setIsEditing(false);
        setEditingId(null);
      } else {
        await createCallHistory.mutateAsync(payload);
      }

      // If logging for lead and changing details, update lead model
      if (isLead && form.leadId) {
        await updateLead.mutateAsync({
          id: form.leadId,
          data: {
            stage: form.leadStage,
            value: Number(form.leadValue) || 0,
            priority: form.leadPriority,
            source: form.leadSource,
            followUpDate: form.nextFollowUpDate || undefined,
          },
        });
      }

      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this call log?')) {
      await deleteCallHistory.mutateAsync(id);
    }
  };

  const { isDateInRange } = useDateFilter();

  const dateFilteredCalls = useMemo(() => {
    const calls = callHistoryQuery.data || [];
    return calls.filter((call) => isDateInRange(call.calledAt || call.callDate || call.createdAt));
  }, [callHistoryQuery.data, isDateInRange]);

  const stats = useMemo(() => {
    let clientCount = 0;
    let leadCount = 0;
    let unregisteredCount = 0;
    let followUpsCount = 0;

    dateFilteredCalls.forEach((call) => {
      if (call.clientId) clientCount += 1;
      else if (call.leadId) leadCount += 1;
      else if (call.unregisteredClientName) unregisteredCount += 1;
      if (call.nextFollowUpDate) followUpsCount += 1;
    });

    return {
      total: dateFilteredCalls.length,
      client: clientCount,
      lead: leadCount,
      unregistered: unregisteredCount,
      followUps: followUpsCount,
    };
  }, [dateFilteredCalls]);

  // Filter Call Logs
  const filteredCalls = useMemo(() => {
    return dateFilteredCalls
      .filter((call) => {
        // Type filter
        if (filterType === 'client' && !call.clientId) return false;
        if (filterType === 'lead' && !call.leadId) return false;
        if (filterType === 'unregistered' && !call.unregisteredClientName) return false;

        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const clientName = call.clientId?.name || call.clientId?.company || '';
          const leadName = call.leadId?.name || call.leadId?.company || '';
          const unregisteredName = call.unregisteredClientName || '';
          const summary = call.callSummary || '';
          const spoken = call.spokenWith || '';
          const purpose = call.callPurpose || '';

          return (
            clientName.toLowerCase().includes(query) ||
            leadName.toLowerCase().includes(query) ||
            unregisteredName.toLowerCase().includes(query) ||
            summary.toLowerCase().includes(query) ||
            spoken.toLowerCase().includes(query) ||
            purpose.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => new Date(b.calledAt || b.callDate || b.createdAt || 0) - new Date(a.calledAt || a.callDate || a.createdAt || 0));
  }, [dateFilteredCalls, filterType, searchQuery]);

  const fieldClass =
    'w-full h-10 rounded-xl bg-background border border-border/70 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-colors';
  const textareaClass =
    'w-full rounded-xl bg-background border border-border/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-colors resize-none';
  const selectButtonClass = 'h-10 rounded-xl bg-background border border-border/70 px-3.5 text-sm';

  return (
    <div className="space-y-6">
      <PageHeader title="Call History & Client Touchpoints" />

      <MetricGrid className="grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Calls" value={stats.total} icon={PhoneCall} />
        <MetricCard label="Client Calls" value={stats.client} icon={User} />
        <MetricCard label="Lead Calls" value={stats.lead} icon={CheckCircle2} />
        <MetricCard label="Follow-ups Set" value={stats.followUps} icon={Calendar} />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Call History Timeline List */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <PageToolbar className="border border-border/60 shadow-xs">
            <div className="flex w-full sm:w-auto flex-wrap items-center gap-1.5 rounded-xl bg-secondary/50 p-1">
              {[
                { key: 'all', label: 'All Calls', count: stats.total },
                { key: 'client', label: 'Client Calls', count: stats.client },
                { key: 'lead', label: 'Lead Calls', count: stats.lead },
                { key: 'unregistered', label: 'New / Unregistered', count: stats.unregistered },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterType(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    filterType === tab.key
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      filterType === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client, lead, summary, or purpose..."
              className="w-full sm:flex-1 min-w-0"
              inputClassName="h-10 py-2 border border-border/60 bg-background/80"
            />
          </PageToolbar>

          <div className="space-y-4 lg:max-h-[calc(100dvh-140px)] lg:overflow-y-auto custom-scrollbar lg:pr-1">
            {callHistoryQuery.isLoading ? (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-border/60 bg-card">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              </div>
            ) : filteredCalls.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card py-10">
                <EmptyState
                  icon={Phone}
                  title={searchQuery.trim() || filterType !== 'all' ? 'No matching call logs found' : 'No call logs recorded yet'}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCalls.map((call) => {
                  const isLead = !!call.leadId;
                  const isUnregistered = !call.clientId && !call.leadId && !!call.unregisteredClientName;
                  const contactName = isUnregistered
                    ? call.unregisteredClientName
                    : (isLead ? call.leadId?.name : (call.clientId?.company || call.clientId?.name));
                  return (
                    <div key={call._id} className="group relative rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:border-border">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isUnregistered ? 'bg-primary text-primary-foreground' : (isLead ? 'bg-secondary text-foreground' : 'bg-primary/10 text-primary')
                          }`}>
                            <Phone size={17} className="shrink-0" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-foreground text-base truncate">{contactName}</h3>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                                isUnregistered ? 'bg-primary/15 text-primary' : (isLead ? 'bg-secondary text-foreground' : 'bg-muted text-muted-foreground')
                              }`}>
                                {isUnregistered ? 'New / Unregistered' : (isLead ? 'Lead' : 'Client')}
                              </span>
                              {call.projectId?.name && (
                                <span className="text-xs text-muted-foreground">
                                  • Project: <span className="font-semibold text-foreground">{call.projectId?.name}</span>
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={12} className="shrink-0" />
                                {new Date(call.callDate).toLocaleDateString()} {call.callTime ? `at ${call.callTime}` : ''}
                              </span>
                              <span>• Type: <span className="font-semibold text-foreground">{call.callType}</span></span>
                              {call.spokenWith && (
                                <span>• Spoken with: <span className="font-semibold text-foreground">{call.spokenWith}</span></span>
                              )}
                              {call.contactNumber && (
                                <span>• <span className="font-semibold text-foreground">{call.contactNumber}</span></span>
                              )}
                            </p>
                            {isUnregistered && (
                              <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                                {call.unregisteredClientPhone && (
                                  <p>Phone: <span className="font-semibold text-foreground tabular-nums">{call.unregisteredClientPhone}</span></p>
                                )}
                                {call.unregisteredClientAddress && (
                                  <p>Address: <span className="font-semibold text-foreground">{call.unregisteredClientAddress}</span></p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEdit(call)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                              title="Edit Call Note"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(call._id)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Call Note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/40 bg-secondary/30 p-3.5">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Discussion Summary</h4>
                          <p className="mt-1.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">{call.callSummary || 'No details provided.'}</p>
                        </div>
                        <div className="rounded-xl border border-border/40 bg-secondary/30 p-3.5">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Response & Next Steps</h4>
                          <p className="mt-1.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">{call.clientResponse || 'No responses provided.'}</p>
                          {call.nextFollowUpDate && (
                            <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-foreground bg-background border border-border/60 px-2.5 py-1 rounded-lg font-medium tabular-nums">
                              <AlertCircle size={12} className="shrink-0 text-primary" />
                              Follow-up: {new Date(call.nextFollowUpDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>Purpose: <span className="font-semibold text-foreground">{call.callPurpose}</span></span>
                        <span>Logged by: <span className="font-semibold text-foreground">{call.addedBy?.name || 'Unknown'}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Call Log Form Card (Inline Scrollable + Responsive) */}
        <div className="lg:col-span-5 min-w-0">
          {canManage ? (
            <section className="rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col overflow-hidden max-h-[78dvh] lg:max-h-[calc(100dvh-140px)] lg:sticky lg:top-6">
              {/* Pinned Card Header */}
              <div className="shrink-0 px-4 sm:px-5 py-4 border-b border-border/50 flex items-center justify-between gap-3 bg-card">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  {isEditing ? 'Edit Call Note' : 'Log Call Note'}
                </h2>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Inline Scrollable Form Fields */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-4 sm:p-5 space-y-4">
                  {/* Form Type Selector */}
                  {!isEditing && (
                    <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-secondary/50 p-1">
                      <button
                        type="button"
                        onClick={() => { setFormType('client'); resetForm(); }}
                        className={`rounded-lg py-2 px-1.5 text-xs font-semibold transition-all cursor-pointer truncate ${
                          formType === 'client' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Client Call
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFormType('lead'); resetForm(); }}
                        className={`rounded-lg py-2 px-1.5 text-xs font-semibold transition-all cursor-pointer truncate ${
                          formType === 'lead' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Lead Call
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFormType('unregistered'); resetForm(); }}
                        className={`rounded-lg py-2 px-1.5 text-xs font-semibold transition-all cursor-pointer truncate ${
                          formType === 'unregistered' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        New Client
                      </button>
                    </div>
                  )}

                  {/* Contact Selection */}
                  {formType === 'client' && (
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Select Client *</label>
                      <SelectDropdown
                        value={form.clientId}
                        onChange={(val) => setForm((prev) => ({ ...prev, clientId: val, projectId: '' }))}
                        options={clients.map((c) => ({ value: c._id, label: c.company || c.name }))}
                        placeholder="Choose client"
                        buttonClassName={selectButtonClass}
                      />
                    </div>
                  )}
                  {formType === 'lead' && (
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Select Lead *</label>
                      <SelectDropdown
                        value={form.leadId}
                        onChange={(val) => setForm((prev) => ({ ...prev, leadId: val }))}
                        options={leads.map((l) => ({ value: l._id, label: `${l.name} (${l.company || 'Independent'})` }))}
                        placeholder="Choose lead"
                        buttonClassName={selectButtonClass}
                      />
                    </div>
                  )}
                  {formType === 'unregistered' && (
                    <div className="space-y-3 rounded-xl border border-border/50 bg-secondary/20 p-3.5 animate-fadeIn">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Client Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <label className="block text-xs font-semibold text-foreground">Client Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe / ABC Inc."
                            value={form.unregisteredClientName}
                            onChange={(e) => setForm((prev) => ({ ...prev, unregisteredClientName: e.target.value }))}
                            className={fieldClass}
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <label className="block text-xs font-semibold text-foreground">Phone Number</label>
                          <input
                            type="text"
                            placeholder="Phone number"
                            value={form.unregisteredClientPhone}
                            onChange={(e) => setForm((prev) => ({ ...prev, unregisteredClientPhone: e.target.value }))}
                            className={fieldClass}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <label className="block text-xs font-semibold text-foreground">Business Address</label>
                        <textarea
                          placeholder="Enter business address..."
                          rows={2}
                          value={form.unregisteredClientAddress}
                          onChange={(e) => setForm((prev) => ({ ...prev, unregisteredClientAddress: e.target.value }))}
                          className={`${textareaClass} min-h-[72px]`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Project Selection (Client only) */}
                  {formType === 'client' && form.clientId && (
                    <div className="space-y-1.5 min-w-0 animate-fadeIn">
                      <label className="block text-xs font-semibold text-foreground">Select Project (Optional)</label>
                      <SelectDropdown
                        value={form.projectId}
                        onChange={(val) => setForm((prev) => ({ ...prev, projectId: val }))}
                        options={filteredProjects.map((p) => ({ value: p._id, label: p.name }))}
                        placeholder="General / Select project"
                        buttonClassName={selectButtonClass}
                      />
                    </div>
                  )}

                  {/* Lead CRM Fields (Lead only) */}
                  {formType === 'lead' && form.leadId && (
                    <div className="space-y-3 rounded-xl border border-border/50 bg-secondary/20 p-3.5 animate-fadeIn">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Update Lead Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <label className="block text-xs font-semibold text-foreground">Lead Stage</label>
                          <SelectDropdown
                            value={form.leadStage}
                            onChange={(val) => setForm((prev) => ({ ...prev, leadStage: val }))}
                            options={LEAD_STAGES.map((s) => ({ value: s, label: s.replace('_', ' ').toUpperCase() }))}
                            buttonClassName={selectButtonClass}
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <label className="block text-xs font-semibold text-foreground">Lead Value (INR)</label>
                          <input
                            type="number"
                            value={form.leadValue}
                            onChange={(e) => setForm((prev) => ({ ...prev, leadValue: e.target.value }))}
                            className={`${fieldClass} tabular-nums`}
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <label className="block text-xs font-semibold text-foreground">Priority</label>
                          <SelectDropdown
                            value={form.leadPriority}
                            onChange={(val) => setForm((prev) => ({ ...prev, leadPriority: val }))}
                            options={LEAD_PRIORITIES.map((p) => ({ value: p, label: p.toUpperCase() }))}
                            buttonClassName={selectButtonClass}
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <label className="block text-xs font-semibold text-foreground">Source</label>
                          <SelectDropdown
                            value={form.leadSource}
                            onChange={(val) => setForm((prev) => ({ ...prev, leadSource: val }))}
                            options={LEAD_SOURCES.map((s) => ({ value: s, label: s.replace('_', ' ').toUpperCase() }))}
                            buttonClassName={selectButtonClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Call Properties */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Call Type</label>
                      <SelectDropdown
                        value={form.callType}
                        onChange={(val) => setForm((prev) => ({ ...prev, callType: val }))}
                        options={CALL_TYPES}
                        buttonClassName={selectButtonClass}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Purpose</label>
                      <SelectDropdown
                        value={form.callPurpose}
                        onChange={(val) => setForm((prev) => ({ ...prev, callPurpose: val }))}
                        options={CALL_PURPOSES}
                        buttonClassName={selectButtonClass}
                      />
                      {form.callPurpose === 'Other' && (
                        <input
                          type="text"
                          placeholder="Specify call purpose..."
                          value={form.customCallPurpose || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, customCallPurpose: e.target.value }))}
                          className={`${fieldClass} mt-1.5`}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Call Date</label>
                      <input
                        type="date"
                        value={form.callDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, callDate: e.target.value }))}
                        onClick={(e) => { try { e.target.showPicker(); } catch (_) {} }}
                        className={`${fieldClass} tabular-nums cursor-pointer`}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Call Time</label>
                      <input
                        type="time"
                        value={form.callTime}
                        onChange={(e) => setForm((prev) => ({ ...prev, callTime: e.target.value }))}
                        onClick={(e) => { try { e.target.showPicker(); } catch (_) {} }}
                        className={`${fieldClass} tabular-nums cursor-pointer`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Spoken With</label>
                      <input
                        type="text"
                        placeholder="e.g. CEO, Manager"
                        value={form.spokenWith}
                        onChange={(e) => setForm((prev) => ({ ...prev, spokenWith: e.target.value }))}
                        className={fieldClass}
                      />
                    </div>
                    {formType !== 'unregistered' && (
                      <div className="space-y-1.5 min-w-0">
                        <label className="block text-xs font-semibold text-foreground">Contact Number</label>
                        <input
                          type="text"
                          placeholder="Phone number"
                          value={form.contactNumber}
                          onChange={(e) => setForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
                          className={fieldClass}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <label className="block text-xs font-semibold text-foreground">Call Summary</label>
                    <textarea
                      placeholder="Key points of discussion..."
                      rows={3}
                      value={form.callSummary}
                      onChange={(e) => setForm((prev) => ({ ...prev, callSummary: e.target.value }))}
                      className={`${textareaClass} min-h-[84px]`}
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <label className="block text-xs font-semibold text-foreground">Client Response / Outcome</label>
                    <textarea
                      placeholder="Promises, objections, outcomes..."
                      rows={2}
                      value={form.clientResponse}
                      onChange={(e) => setForm((prev) => ({ ...prev, clientResponse: e.target.value }))}
                      className={`${textareaClass} min-h-[72px]`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <label className="block text-xs font-semibold text-foreground">Next Follow-up Date</label>
                      <input
                        type="date"
                        value={form.nextFollowUpDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, nextFollowUpDate: e.target.value }))}
                        onClick={(e) => { try { e.target.showPicker(); } catch (_) {} }}
                        className={`${fieldClass} tabular-nums cursor-pointer`}
                      />
                    </div>
                    {formType === 'client' && (
                      <div className="flex items-end min-w-0">
                        <label className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl bg-background border border-border/70 px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/30">
                          <input
                            type="checkbox"
                            checked={form.visibleToClient}
                            onChange={(e) => setForm((prev) => ({ ...prev, visibleToClient: e.target.checked }))}
                            className="rounded text-primary focus:ring-primary/20 shrink-0"
                          />
                          <span className="truncate">Client Visible</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pinned Submit Footer */}
                <div className="shrink-0 px-4 sm:px-5 py-3.5 border-t border-border/50 bg-card flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        type="submit"
                        className="flex-1 h-10 rounded-xl text-sm font-bold"
                        disabled={updateCallHistory.isPending}
                      >
                        {updateCallHistory.isPending ? 'Updating...' : 'Update Note'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-5 rounded-xl text-sm font-semibold"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full h-10 rounded-xl text-sm font-bold"
                      disabled={createCallHistory.isPending}
                    >
                      {createCallHistory.isPending ? 'Saving...' : 'Add Call Note'}
                    </Button>
                  )}
                </div>
              </form>
            </section>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
              You do not have permissions to log new calls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
