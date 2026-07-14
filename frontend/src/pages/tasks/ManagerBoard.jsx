import { useState } from 'react';
import {
  ClipboardList, UserCheck, XCircle, Clock,
  CheckCircle2, ChevronDown, X, Check,
  ArrowRight, StickyNote,
} from 'lucide-react';
import { useAllNotes, useAssignNote, useDismissNote } from '../../hooks/useTaskNotes';
import { useUsers } from '../../hooks/useUsers';
import { PageHeader, MetricGrid, MetricCard, EmptyState, StatusBadge } from '../../components/ui/page';
import { Button } from '../../components/ui/button';

const priorityTone  = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' };
const priorityColor = {
  urgent: 'bg-red-500',
  high:   'bg-amber-500',
  medium: 'bg-blue-500',
  low:    'bg-slate-300',
};

// ── Assign panel (drawer inside card) ────────────────────────────────────────
const AssignPanel = ({ note, employees, onAssign, onDismiss, onClose, loading }) => {
  const [assignedTo,  setAssignedTo]  = useState('');
  const [managerNote, setManagerNote] = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [action,      setAction]      = useState('assign'); // 'assign' | 'dismiss'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (action === 'assign') {
      if (!assignedTo) return;
      onAssign({ assignedTo, managerNote, dueDate: dueDate || undefined });
    } else {
      onDismiss({ managerNote });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-2xl border border-border bg-secondary/30 p-4">
      {/* Action toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAction('assign')}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
            action === 'assign'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-muted-foreground hover:bg-secondary'
          }`}
        >
          <UserCheck size={13} className="mr-1 inline" /> Assign to Employee
        </button>
        <button
          type="button"
          onClick={() => setAction('dismiss')}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
            action === 'dismiss'
              ? 'bg-red-500 text-white'
              : 'border border-border bg-background text-muted-foreground hover:bg-secondary'
          }`}
        >
          <XCircle size={13} className="mr-1 inline" /> Dismiss
        </button>
      </div>

      {action === 'assign' && (
        <>
          <div className="relative">
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
              className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-8 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">Select employee</option>
              {employees.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </>
      )}

      <textarea
        value={managerNote}
        onChange={(e) => setManagerNote(e.target.value)}
        rows={2}
        placeholder={action === 'assign' ? 'Instructions for employee (optional)...' : 'Reason for dismissal (optional)...'}
        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
        >
          <X size={12} className="mr-1 inline" /> Cancel
        </button>
        <Button
          type="submit"
          size="sm"
          disabled={loading || (action === 'assign' && !assignedTo)}
          className={action === 'dismiss' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
        >
          <Check size={12} className="mr-1" />
          {action === 'assign' ? 'Assign' : 'Dismiss'}
        </Button>
      </div>
    </form>
  );
};

// ── Single note card ──────────────────────────────────────────────────────────
const NoteCard = ({ note, employees, assignMutation, dismissMutation }) => {
  const [open, setOpen] = useState(false);

  const handleAssign = (data) => {
    assignMutation.mutate({ id: note._id, data }, { onSuccess: () => setOpen(false) });
  };
  const handleDismiss = ({ managerNote }) => {
    dismissMutation.mutate({ id: note._id, managerNote }, { onSuccess: () => setOpen(false) });
  };

  const isLoading = assignMutation.isPending || dismissMutation.isPending;

  return (
    <div className={`relative overflow-hidden rounded-[22px] border bg-card p-5 shadow-sm transition-all duration-200 ${
      open ? 'border-primary/40 shadow-md' : 'border-border hover:border-primary/20 hover:shadow-md'
    }`}>
      {/* Priority stripe */}
      <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-[22px] ${priorityColor[note.priority] || 'bg-slate-300'}`} />

      <div className="pl-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground leading-snug">{note.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              From <span className="font-medium text-foreground">{note.submittedBy?.name}</span>
              {' · '}{note.submittedBy?.role}
              {' · '}{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <StatusBadge tone={priorityTone[note.priority]}>
            {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
          </StatusBadge>
        </div>

        {/* Description */}
        {note.description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {note.description}
          </p>
        )}

        {/* CTA */}
        {note.status === 'pending' && !open && (
          <button
            onClick={() => setOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10"
          >
            <ArrowRight size={14} /> Review & Assign
          </button>
        )}

        {/* Inline assign panel */}
        {note.status === 'pending' && open && (
          <AssignPanel
            note={note}
            employees={employees}
            onAssign={handleAssign}
            onDismiss={handleDismiss}
            onClose={() => setOpen(false)}
            loading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

// ── Assigned / Dismissed card (read-only) ────────────────────────────────────
const DoneCard = ({ note }) => (
  <div className="relative overflow-hidden rounded-[22px] border border-border bg-card p-5 shadow-sm opacity-80">
    <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-[22px] ${
      note.status === 'assigned' ? 'bg-emerald-500' : 'bg-red-400'
    }`} />
    <div className="pl-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground leading-snug">{note.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            From <span className="font-medium">{note.submittedBy?.name}</span>
          </p>
        </div>
        <StatusBadge tone={note.status === 'assigned' ? 'success' : 'danger'}>
          {note.status === 'assigned' ? <CheckCircle2 size={11} className="mr-1 inline" /> : <XCircle size={11} className="mr-1 inline" />}
          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
        </StatusBadge>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {note.assignedTo && (
          <StatusBadge tone="success">→ {note.assignedTo.name}</StatusBadge>
        )}
        {note.dueDate && (
          <StatusBadge tone="info">
            Due: {new Date(note.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </StatusBadge>
        )}
      </div>

      {note.managerNote && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          <span className="font-semibold text-foreground">Note: </span>{note.managerNote}
        </p>
      )}
    </div>
  </div>
);

// ── Main Manager Board ────────────────────────────────────────────────────────
const ManagerBoard = () => {
  const [tab, setTab] = useState('pending');

  const { data: notes = [], isLoading } = useAllNotes();
  const { data: users = [] } = useUsers({ enabled: true });
  const assignMutation  = useAssignNote();
  const dismissMutation = useDismissNote();

  const employees = users.filter((u) => ['employee', 'manager', 'superAdmin'].includes(u.role));

  const pending   = notes.filter((n) => n.status === 'pending');
  const assigned  = notes.filter((n) => n.status === 'assigned');
  const dismissed = notes.filter((n) => n.status === 'dismissed');

  const tabs = [
    { key: 'pending',   label: 'Pending',   count: pending.length,   icon: Clock,        tone: 'warning' },
    { key: 'assigned',  label: 'Assigned',  count: assigned.length,  icon: CheckCircle2, tone: 'success' },
    { key: 'dismissed', label: 'Dismissed', count: dismissed.length, icon: XCircle,      tone: 'danger'  },
  ];

  const visibleNotes = tab === 'pending' ? pending : tab === 'assigned' ? assigned : dismissed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Manager Board"
        title="Employee Task Notes"
      >
        <MetricGrid>
          <MetricCard label="Total Notes"  value={notes.length}     icon={ClipboardList} tone="info" />
          <MetricCard label="Pending"      value={pending.length}   icon={Clock}         tone="warning" />
          <MetricCard label="Assigned"     value={assigned.length}  icon={UserCheck}     tone="success" />
          <MetricCard label="Dismissed"    value={dismissed.length} icon={XCircle}       tone="danger" />
        </MetricGrid>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              tab === t.key
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <t.icon size={13} />
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              tab === t.key ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading notes…
        </div>
      ) : visibleNotes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={`No ${tab} notes`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleNotes.map((note) =>
            tab === 'pending' ? (
              <NoteCard
                key={note._id}
                note={note}
                employees={employees}
                assignMutation={assignMutation}
                dismissMutation={dismissMutation}
              />
            ) : (
              <DoneCard key={note._id} note={note} />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerBoard;
