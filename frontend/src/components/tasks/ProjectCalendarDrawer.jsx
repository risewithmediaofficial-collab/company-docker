import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  FolderOpen,
  Plus,
  Users,
  Video,
  X,
} from '@/components/ui/muiIcons';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { StatusBadge } from '../ui/page';
import { cn } from '../../utils/cn';
import { TASK_STATUS_COLORS } from '../../pages/tasks/ContentCalendar';
import { formatTaskTypeLabel, normalizeTaskStatusLabel } from '../../utils/taskFields';

export const ProjectCalendarDrawer = ({
  open,
  onOpenChange,
  project = null,
  tasks = [],
  meetings = [],
  canManage = false,
  canScheduleMeeting = false,
  onSelectTask,
  onSelectMeeting,
  onAddTaskForProject,
  onScheduleMeetingForProject,
}) => {
  const [taskFilter, setTaskFilter] = useState('all');

  const projectTasks = useMemo(() => {
    if (!project?._id) return [];
    return tasks.filter((t) => {
      const pid = t.project?._id || t.project;
      return String(pid) === String(project._id);
    });
  }, [project, tasks]);

  const projectMeetings = useMemo(() => {
    if (!project?._id) return [];
    return meetings.filter((m) => {
      const pid = m.project?._id || m.project;
      return String(pid) === String(project._id);
    });
  }, [project, meetings]);

  const visibleTasks = useMemo(() => {
    if (taskFilter === 'all') return projectTasks;
    if (taskFilter === 'open') {
      return projectTasks.filter((t) => {
        const label = normalizeTaskStatusLabel(t.status);
        return label !== 'Completed' && label !== 'Approved';
      });
    }
    if (taskFilter === 'done') {
      return projectTasks.filter((t) => {
        const label = normalizeTaskStatusLabel(t.status);
        return label === 'Completed' || label === 'Approved';
      });
    }
    return projectTasks;
  }, [projectTasks, taskFilter]);

  if (!project) return null;

  const doneCount = projectTasks.filter((t) => {
    const label = normalizeTaskStatusLabel(t.status);
    return label === 'Completed' || label === 'Approved';
  }).length;
  const computedProgress =
    projectTasks.length > 0
      ? Math.round((doneCount / projectTasks.length) * 100)
      : Number(project.progress || 0);

  const clientName = project.client?.name || project.client?.company || (project.isInternal ? 'Internal Product' : 'Client Project');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="side"
        noPadding
        hideCloseButton
        className="flex flex-col min-h-0 p-0 overflow-hidden bg-background"
      >
        <DialogHeader className="px-6 py-4 bg-background border-b border-border shrink-0 flex flex-row items-center justify-between gap-3 m-0 space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FolderOpen size={20} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                {project.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Building2 size={12} /> {clientName}
                </span>
                <span>•</span>
                <span>{project.status || 'Active'}</span>
              </DialogDescription>
            </div>
          </div>

          <DialogClose className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <X size={17} />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          {/* Project Meta + Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Start TBD'}
                {' → '}
                {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : 'Ongoing'}
              </span>
              <span className="font-semibold text-foreground">{computedProgress}% Complete</span>
            </div>

            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, computedProgress))}%` }}
              />
            </div>

            {Array.isArray(project.team) && project.team.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] font-medium text-muted-foreground inline-flex items-center gap-1">
                  <Users size={12} /> Team:
                </span>
                {project.team.map((member) => (
                  <span
                    key={member._id || member}
                    className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {member.name || 'Member'}
                  </span>
                ))}
              </div>
            )}

            {(canManage || canScheduleMeeting) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/70">
                {canManage && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onAddTaskForProject?.(project);
                    }}
                  >
                    <Plus size={14} className="mr-1.5" /> Add Task to Project
                  </Button>
                )}
                {canScheduleMeeting && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      onScheduleMeetingForProject?.(project);
                    }}
                  >
                    <Video size={14} className="mr-1.5 text-violet-600" /> Schedule Meeting
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Meetings inside this Project */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Video size={13} className="text-violet-500" />
                Project Meetings ({projectMeetings.length})
              </h4>
            </div>
            {projectMeetings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-4 text-center text-xs text-muted-foreground">
                No meetings scheduled for this project yet.
              </div>
            ) : (
              <div className="space-y-2">
                {projectMeetings.map((mtg) => (
                  <button
                    key={mtg._id}
                    type="button"
                    onClick={() => onSelectMeeting?.(mtg)}
                    className="w-full text-left rounded-xl border border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 p-3 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                        <span className="text-sm font-semibold text-foreground truncate">
                          {mtg.title}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {mtg.meetingDate ? format(new Date(mtg.meetingDate), 'MMM d, yyyy') : ''}
                          {mtg.startTime ? ` • ${mtg.startTime}` : ''}
                        </span>
                        <span>• {mtg.platform || 'Google Meet'}</span>
                      </div>
                    </div>
                    <StatusBadge value={mtg.status || 'scheduled'} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Visible Tasks inside this Project */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase size={13} className="text-sky-500" />
                Visible Tasks Inside Project ({projectTasks.length})
              </h4>
              <div className="inline-flex rounded-lg bg-secondary p-0.5 text-[11px] font-semibold">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'open', label: 'Active' },
                  { id: 'done', label: 'Done' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTaskFilter(tab.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-colors',
                      taskFilter === tab.id
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                No tasks match the current calendar filters inside this project.
              </div>
            ) : (
              <div className="space-y-2">
                {visibleTasks.map((task) => {
                  const statusLabel = normalizeTaskStatusLabel(task.status);
                  const style = TASK_STATUS_COLORS[statusLabel] || TASK_STATUS_COLORS['To Do'];
                  const assignees =
                    task.assignedTo?.map((u) => u.name).filter(Boolean).join(', ') ||
                    task.editorAssigned?.name ||
                    task.videographerAssigned?.name ||
                    task.designerAssigned?.name ||
                    task.publisherAssigned?.name ||
                    task.assignedPersonName ||
                    'Unassigned';

                  return (
                    <button
                      key={task._id}
                      type="button"
                      onClick={() => onSelectTask?.(task)}
                      className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-secondary/30 p-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {task.taskTitle || task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            <span>{formatTaskTypeLabel(task.taskType)}</span>
                            <span>• {assignees}</span>
                            {task.dueDate && (
                              <span>• Due {format(new Date(task.dueDate), 'MMM d')}</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0',
                            style.badge
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                          {statusLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
