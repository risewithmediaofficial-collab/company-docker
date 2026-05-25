import { useEffect, useState } from 'react';
import { useTask } from '../../hooks/useTasks';
import { ProgressUpdateForm } from './ProgressUpdateForm';
import { ProgressTimeline } from './ProgressTimeline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, Briefcase, Calendar, Clock, FileText, Tag, Users } from 'lucide-react';
import { DetailSkeleton } from './Skeleton';

const formatDisplayDate = (value, options = {}) => {
  if (!value) return 'Not set';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

const formatTaskType = (value) => {
  if (!value) return 'Task';

  return value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const DetailMetricCard = ({ label, value, helper, children }) => (
  <div className="rounded-[24px] border border-border bg-background/90 p-4 shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
    <div className="mt-3">
      {children || <p className="text-lg font-semibold text-foreground">{value}</p>}
      {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  </div>
);

const DetailRow = ({ icon: Icon, label, value, helper }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-background px-4 py-3">
    <div className="mt-0.5 rounded-xl bg-secondary p-2 text-muted-foreground">
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  </div>
);

export const TaskDetailModal = ({ taskId, open, onOpenChange }) => {
  const { data: task, isLoading, error } = useTask(taskId);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('progress');

  useEffect(() => {
    if (open) {
      setActiveTab('progress');
    }
  }, [open, taskId]);

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Task</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>{error.response?.data?.message || 'Failed to load task'}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusColors = {
    'To Do': 'bg-gray-500/10 text-gray-600',
    'In Progress': 'bg-blue-500/10 text-blue-600',
    'In Review': 'bg-amber-500/10 text-amber-600',
    'Approved': 'bg-green-500/10 text-green-600',
    'Done': 'bg-green-500/10 text-green-600',
    'Blocked': 'bg-red-500/10 text-red-600',
  };

  const priorityColors = {
    Low: 'bg-blue-500/10 text-blue-600',
    Medium: 'bg-gray-500/10 text-gray-600',
    High: 'bg-amber-500/10 text-amber-600',
    Urgent: 'bg-red-500/10 text-red-600',
  };

  const tabs = [
    { id: 'progress', label: 'Progress', icon: Activity },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'activity', label: 'Activity', icon: Clock },
  ];

  const assignees = Array.isArray(task?.assignedTo) ? task.assignedTo : [];
  const progressPercent = task?.estimatedHours
    ? Math.min(Math.round(((task.loggedHours || 0) / task.estimatedHours) * 100), 100)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0">
        {isLoading ? (
          <DetailSkeleton />
        ) : task ? (
          <>
            <div className="border-b border-border bg-gradient-to-br from-background via-background to-secondary/60 px-6 py-6 sm:px-8">
              <DialogHeader className="mb-0">
                <div className="flex flex-wrap items-center gap-2 pr-10">
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    {formatTaskType(task.taskType)}
                  </Badge>
                  <Badge className={statusColors[task.status] || 'bg-gray-500/10 text-gray-600'}>
                    {task.status}
                  </Badge>
                  <Badge className={priorityColors[task.priority] || 'bg-gray-500/10 text-gray-600'}>
                    {task.priority}
                  </Badge>
                </div>
                <DialogTitle className="pr-10 text-2xl leading-tight sm:text-[28px]">{task.title}</DialogTitle>
                <DialogDescription className="max-w-2xl text-sm leading-6">
                  {task.project?.name || 'No project linked'}
                  {task.client?.name ? ` | ${task.client.name}` : ''}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <DetailMetricCard
                  label="Due date"
                  value={formatDisplayDate(task.dueDate)}
                  helper={task.completedAt ? `Completed ${formatDisplayDate(task.completedAt)}` : 'Track delivery timing'}
                />
                <DetailMetricCard
                  label="Logged hours"
                  value={`${task.loggedHours || 0}h`}
                  helper={task.estimatedHours ? `${task.estimatedHours}h estimated` : 'No estimate set yet'}
                />
                <DetailMetricCard
                  label="Assigned team"
                  value={`${assignees.length || 0}`}
                  helper={assignees.length ? assignees.map((user) => user.name).join(', ') : 'No assignee selected'}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-card/80 p-1 shadow-sm">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      activeTab === id
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-secondary/20 px-6 py-6 sm:px-8">
              {activeTab === 'progress' && (
                <div className="space-y-4">
                  <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Work Progress</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Log completed work and keep the delivery trail easy to follow.
                        </p>
                      </div>
                      {progressPercent !== null ? (
                        <div className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                          {progressPercent}% of estimate used
                        </div>
                      ) : null}
                    </div>

                    <ProgressUpdateForm
                      taskId={taskId}
                      onSuccess={() => setRefreshKey((key) => key + 1)}
                    />
                  </div>

                  <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
                    <ProgressTimeline task={task} key={refreshKey} />
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailMetricCard label="Status">
                      <Badge className={statusColors[task.status] || 'bg-gray-500/10 text-gray-600'}>
                        {task.status}
                      </Badge>
                    </DetailMetricCard>
                    <DetailMetricCard label="Priority">
                      <Badge className={priorityColors[task.priority] || 'bg-gray-500/10 text-gray-600'}>
                        {task.priority}
                      </Badge>
                    </DetailMetricCard>
                    <DetailMetricCard
                      label="Due date"
                      value={formatDisplayDate(task.dueDate)}
                      helper={task.startDate ? `Planned start ${formatDisplayDate(task.startDate)}` : 'No planned start set'}
                    />
                    <DetailMetricCard
                      label="Logged hours"
                      value={`${task.loggedHours || 0}h`}
                      helper={task.estimatedHours ? `${task.estimatedHours}h estimated` : 'No estimate set yet'}
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <h3 className="text-lg font-bold text-foreground">Description</h3>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {task.description?.trim() || 'No detailed description has been added for this task yet.'}
                      </p>

                      {task.tags?.length > 0 ? (
                        <div className="mt-6">
                          <div className="flex items-center gap-2">
                            <Tag size={15} className="text-muted-foreground" />
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                              Tags
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="rounded-full px-3 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </section>

                    <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        <h3 className="text-lg font-bold text-foreground">Team & Context</h3>
                      </div>

                      <div className="mt-4 space-y-3">
                        <DetailRow
                          icon={Briefcase}
                          label="Project"
                          value={task.project?.name || 'No project linked'}
                          helper={task.client?.name || 'Client not linked'}
                        />
                        <DetailRow
                          icon={Tag}
                          label="Task type"
                          value={formatTaskType(task.taskType)}
                          helper={task.isClientVisible ? 'Visible to client' : 'Internal only'}
                        />
                        <DetailRow
                          icon={Users}
                          label="Assigned team"
                          value={assignees.length ? assignees.map((user) => user.name).join(', ') : 'Unassigned'}
                          helper={assignees.length ? `${assignees.length} teammate(s)` : 'Assign an owner when ready'}
                        />
                      </div>
                    </section>
                  </div>

                  <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <h3 className="text-lg font-bold text-foreground">Timeline & Delivery</h3>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <DetailRow
                        icon={Calendar}
                        label="Planned start"
                        value={formatDisplayDate(task.startDate)}
                      />
                      <DetailRow
                        icon={Clock}
                        label="Actual start"
                        value={formatDisplayDate(task.actualStartDate)}
                      />
                      <DetailRow
                        icon={Calendar}
                        label="Due date"
                        value={formatDisplayDate(task.dueDate)}
                      />
                      <DetailRow
                        icon={Clock}
                        label="Completed"
                        value={formatDisplayDate(task.completedAt)}
                      />
                    </div>

                    <div className="mt-5 rounded-[24px] border border-border bg-secondary/40 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Time usage</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Logged effort versus the original estimate.
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {task.loggedHours || 0}h
                          <span className="ml-1 text-muted-foreground">logged</span>
                        </div>
                      </div>

                      {task.estimatedHours > 0 ? (
                        <>
                          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-border">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.min(((task.loggedHours || 0) / task.estimatedHours) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{task.estimatedHours}h estimated</span>
                            <span>
                              {task.loggedHours > task.estimatedHours
                                ? `${(task.loggedHours - task.estimatedHours).toFixed(1)}h over`
                                : `${(task.estimatedHours - task.loggedHours).toFixed(1)}h remaining`}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="mt-4 text-xs text-muted-foreground">No estimated hours have been set for this task yet.</p>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <div className="rounded-[28px] border border-dashed border-border bg-card px-6 py-12 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                      <Activity size={20} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">Activity feed coming soon</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      Progress updates already appear in the progress tab. A full audit trail for comments, edits, and approvals can be added next.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
