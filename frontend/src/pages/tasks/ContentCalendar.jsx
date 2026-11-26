import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutGrid,
  List,
  Menu,
  PanelTop,
  Plus,
  Rows3,
  TimerReset,
  Users,
  Video,
  X,
} from '@/components/ui/muiIcons';
import { ClientTaskResponsePanel } from '../../components/tasks/ClientTaskResponsePanel';
import { DailyCalendarTaskDialog } from '../../components/tasks/DailyCalendarTaskDialog';
import { DailyTaskUpdateDialog } from '../../components/tasks/DailyTaskUpdateDialog';
import { KanbanCreateTaskModal } from '../../components/tasks/KanbanCreateTaskModal';
import { ProjectCalendarDrawer } from '../../components/tasks/ProjectCalendarDrawer';
import { ScheduleMeetingModal } from '../../components/tasks/ScheduleMeetingModal';
import { SelectDropdown } from '../../components/ui/SelectDropdown';
import { TaskDetailModal } from '../../components/ui/TaskDetailModal';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../components/ui/dialog';
import { EmptyState, SearchField, StatusBadge } from '../../components/ui/page';
import { useClients } from '../../hooks/useClients';
import { useMeetings } from '../../hooks/useMeetings';
import { useProjects } from '../../hooks/useProjects';
import { useTaskCalendar, useTasks, useWeeklyTaskReport } from '../../hooks/useTasks';
import { useUsers } from '../../hooks/useUsers';
import { getAssetUrl } from '../../utils/assetUrl';
import { cn } from '../../utils/cn';
import {
  formatTaskTypeLabel,
  getClientTaskStatusMeta,
  normalizeTaskStatusLabel,
} from '../../utils/taskFields';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MINI_DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HOURS = Array.from({ length: 13 }, (_, idx) => idx + 8); // 08:00 -> 20:00

const VIEW_OPTIONS = [
  { value: 'month', label: 'Month', icon: LayoutGrid },
  { value: 'week', label: 'Week', icon: Rows3 },
  { value: 'day', label: 'Day', icon: PanelTop },
  { value: 'agenda', label: 'Projects & List', icon: List },
];

export const TASK_STATUS_COLORS = {
  'To Do': {
    label: 'To Do',
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/12 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/25',
    badge: 'bg-amber-500/18 text-amber-800 dark:text-amber-300',
  },
  'On Process': {
    label: 'In Process',
    dot: 'bg-sky-500',
    pill: 'bg-sky-500/12 hover:bg-sky-500/20 text-sky-900 dark:text-sky-200 border border-sky-500/25',
    badge: 'bg-sky-500/18 text-sky-800 dark:text-sky-300',
  },
  'Waiting for Client': {
    label: 'Pending',
    dot: 'bg-orange-500',
    pill: 'bg-orange-500/12 hover:bg-orange-500/20 text-orange-900 dark:text-orange-200 border border-orange-500/25',
    badge: 'bg-orange-500/18 text-orange-800 dark:text-orange-300',
  },
  'Review Required': {
    label: 'Review',
    dot: 'bg-indigo-500',
    pill: 'bg-indigo-500/12 hover:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 border border-indigo-500/25',
    badge: 'bg-indigo-500/18 text-indigo-800 dark:text-indigo-300',
  },
  Completed: {
    label: 'Done',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/25',
    badge: 'bg-emerald-500/18 text-emerald-800 dark:text-emerald-300',
  },
  Rework: {
    label: 'Rework',
    dot: 'bg-rose-500',
    pill: 'bg-rose-500/12 hover:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-500/25',
    badge: 'bg-rose-500/18 text-rose-800 dark:text-rose-300',
  },
  Approved: {
    label: 'Approved',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/25',
    badge: 'bg-emerald-500/18 text-emerald-800 dark:text-emerald-300',
  },
};

export const TASK_PRIORITY_COLORS = {
  Urgent: {
    label: 'Urgent',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold',
  },
  High: {
    label: 'High',
    dot: 'bg-orange-500',
    badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 font-semibold',
  },
  Medium: {
    label: 'Medium',
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold',
  },
  Low: {
    label: 'Low',
    dot: 'bg-slate-400',
    badge: 'bg-secondary text-muted-foreground font-medium',
  },
};

const EMPLOYEE_ROLES = ['employee', 'intern', 'editor', 'designer', 'adsManager'];

const getRangeForView = (date, view) => {
  if (view === 'week') {
    return {
      start: startOfWeek(date, { weekStartsOn: 0 }),
      end: endOfWeek(date, { weekStartsOn: 0 }),
    };
  }
  if (view === 'day') {
    return {
      start: startOfDay(date),
      end: endOfDay(date),
    };
  }
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  return {
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  };
};

const shiftDateByView = (date, view, direction) => {
  if (view === 'week') return direction > 0 ? addWeeks(date, 1) : subWeeks(date, 1);
  if (view === 'day') return direction > 0 ? addDays(date, 1) : subDays(date, 1);
  return direction > 0 ? addMonths(date, 1) : subMonths(date, 1);
};

const parseHourFromTime = (timeStr) => {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  let hour = Number(match[1]);
  const lower = String(timeStr).toLowerCase();
  if (lower.includes('pm') && hour < 12) hour += 12;
  if (lower.includes('am') && hour === 12) hour = 0;
  return Number.isNaN(hour) ? null : hour;
};

const formatHourLabel = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
};

const extractTaskAssigneeNames = (task) => {
  const names = [];
  if (Array.isArray(task.assignedTo)) {
    task.assignedTo.forEach((u) => u?.name && names.push(u.name));
  }
  if (task.editorAssigned?.name) names.push(task.editorAssigned.name);
  if (task.videographerAssigned?.name) names.push(task.videographerAssigned.name);
  if (task.designerAssigned?.name) names.push(task.designerAssigned.name);
  if (task.publisherAssigned?.name) names.push(task.publisherAssigned.name);
  if (task.scriptWriterAssigned?.name) names.push(task.scriptWriterAssigned.name);
  if (names.length === 0 && task.assignedPersonName) names.push(task.assignedPersonName);
  return [...new Set(names)];
};

const doesTaskMatchUser = (task, userId) => {
  if (!userId) return true;
  const target = String(userId);
  const direct = (Array.isArray(task.assignedTo) ? task.assignedTo : []).some(
    (u) => String(u?._id || u) === target
  );
  if (direct) return true;
  const stageFields = [
    task.editorAssigned,
    task.videographerAssigned,
    task.designerAssigned,
    task.publisherAssigned,
    task.scriptWriterAssigned,
    task.voiceArtistAssigned,
  ];
  if (stageFields.some((f) => String(f?._id || f || '') === target)) return true;
  if (Array.isArray(task.extraShootPersons)) {
    return task.extraShootPersons.some((p) => String(p?._id || p) === target);
  }
  return false;
};

const downloadWeeklyReportPdf = async ({ report, range, employeeName }) => {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (height = 8) => {
    if (y + height <= pageHeight - margin) return;
    doc.addPage();
    y = margin;
  };

  const addWrappedText = (text, indent = 0) => {
    const lines = doc.splitTextToSize(text || '-', contentWidth - indent);
    lines.forEach((line) => {
      ensureSpace(6);
      doc.text(line, margin + indent, y);
      y += 5;
    });
  };

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('Weekly Task Report', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${employeeName} • ${format(range.start, 'MMM d, yyyy')} to ${format(range.end, 'MMM d, yyyy')}`,
    margin,
    y
  );
  y += 10;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(`Updates: ${report.summary?.totalUpdates || 0}`, margin + 4, y + 8);
  doc.text(`Hours: ${Number(report.summary?.totalHours || 0).toFixed(2)}`, margin + 4, y + 15);
  doc.text(`Tasks: ${report.summary?.uniqueTasks || 0}`, margin + contentWidth / 2, y + 8);
  doc.text(`Employees: ${report.summary?.uniqueEmployees || 0}`, margin + contentWidth / 2, y + 15);
  y += 32;

  (report.rows || []).forEach((row, index) => {
    ensureSpace(28);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. ${row.taskTitle}`, margin + 4, y + 7);
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${format(new Date(row.workDate), 'EEE, MMM d')} • ${row.employeeName} • ${Number(row.hours || 0).toFixed(2)}h`,
      margin + 4,
      y + 13
    );
    doc.text(`${row.clientName || 'No client'} • ${row.projectName || 'No project'}`, margin + 4, y + 18);
    y += 24;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    addWrappedText(row.description);
    if (row.workNotes) {
      doc.setTextColor(100, 116, 139);
      addWrappedText(`Notes: ${row.workNotes}`, 2);
    }
    y += 3;
  });

  const filename = `weekly-task-report-${format(range.start, 'yyyy-MM-dd')}-to-${format(range.end, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
};

const FileLinks = ({ files = [], emptyMessage = 'No files available.' }) => {
  if (!files.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => {
        const fileUrl = getAssetUrl(file.url);
        const isImage =
          file.type?.startsWith('image/') ||
          /\.(png|jpe?g|gif|webp|svg)$/i.test(file.url || file.name || '');

        return (
          <a
            key={`${file.url || file.name}-${index}`}
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl bg-background border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-secondary/40"
          >
            <span className="flex min-w-0 items-center gap-3">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={file.name || 'Attachment preview'}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="truncate">{file.name || 'File'}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">{file.type || 'Attachment'}</span>
          </a>
        );
      })}
    </div>
  );
};

const ClientTaskDialog = ({ task, open, onOpenChange, onSubmitted }) => {
  const statusMeta = getClientTaskStatusMeta(task?.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="side"
        noPadding
        hideCloseButton
        className="flex flex-col min-h-0 p-0 overflow-hidden bg-background"
      >
        <div className="flex flex-col min-h-0 h-full">
          <div className="shrink-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                  {task?.taskTitle || task?.title || 'Task Details'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Review task details and confirm your response
                </DialogDescription>
              </div>
            </div>
            <DialogClose className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>

          <div className="space-y-5 p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
            {task ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {task.taskCategory === 'non_content' ? 'Non-Content Task' : 'Content Task'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Task Type
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatTaskTypeLabel(task.taskType)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Assigned To
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {extractTaskAssigneeNames(task).join(', ') || 'Unassigned'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{statusMeta.label}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold text-foreground mb-1">Requirements</p>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {task.description || task.websiteRequirements || 'No requirements shared yet.'}
                  </p>
                </div>

                {task.clientVisibleNotes && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-foreground mb-1">Notes</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {task.clientVisibleNotes}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="mb-2 text-xs font-semibold text-foreground">Attachments</p>
                    <FileLinks files={task.attachments || []} />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="mb-2 text-xs font-semibold text-foreground">Completed Files</p>
                    <FileLinks files={task.completedFiles || []} />
                  </div>
                </div>

                <ClientTaskResponsePanel task={task} onSubmitted={onSubmitted} compact />
              </div>
            ) : null}
          </div>

          <div className="shrink-0 bg-card border-t border-border px-6 py-3.5 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ContentCalendar = ({ embedded = false, defaultView = 'month' }) => {
  const { user } = useSelector((state) => state.auth);
  const normalizedInitialView = defaultView === 'list' ? 'agenda' : defaultView || 'month';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [miniMonthDate, setMiniMonthDate] = useState(new Date());
  const [view, setView] = useState(normalizedInitialView);
  const [agendaMode, setAgendaMode] = useState('projects'); // 'projects' | 'timeline'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');

  const [filters, setFilters] = useState({
    client: '',
    assignedTo: '',
    project: '',
    status: '',
  });

  // Google-Calendar layers
  const [layers, setLayers] = useState({
    projects: true,
    tasks: true,
    meetings: true,
  });

  // Modals / Drawers
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedClientTask, setSelectedClientTask] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedProjectDrawer, setSelectedProjectDrawer] = useState(null);

  const [taskModalState, setTaskModalState] = useState({
    open: false,
    initialValues: null,
  });
  const [meetingModalState, setMeetingModalState] = useState({
    open: false,
    meeting: null,
    initialDate: '',
    initialTime: '',
    initialClientId: '',
    initialProjectId: '',
  });

  const [dailyUpdateOpen, setDailyUpdateOpen] = useState(false);
  const [dailyCalendarTaskOpen, setDailyCalendarTaskOpen] = useState(false);

  const isClient = user?.role === 'client';
  const canManageCalendar = ['superAdmin', 'admin', 'organizationOwner', 'manager'].includes(
    user?.role
  );
  const canScheduleMeeting = !isClient;
  const canFilterAssignee = ['superAdmin', 'admin', 'organizationOwner', 'manager'].includes(
    user?.role
  );
  const canLogDailyUpdates = EMPLOYEE_ROLES.includes(user?.role);
  const canDownloadWeeklyReport = canLogDailyUpdates || canManageCalendar;

  useEffect(() => {
    setMiniMonthDate(currentDate);
  }, [currentDate]);

  const visibleRange = useMemo(() => getRangeForView(currentDate, view), [currentDate, view]);
  const weeklyReportRange = useMemo(() => getRangeForView(currentDate, 'week'), [currentDate]);

  const taskQueryFilters = useMemo(
    () => ({
      client: filters.client || undefined,
      assignedTo: filters.assignedTo || undefined,
      project: filters.project || undefined,
      status: filters.status || undefined,
      search: search || undefined,
      parent: 'all',
      startDate: format(visibleRange.start, 'yyyy-MM-dd'),
      endDate: format(visibleRange.end, 'yyyy-MM-dd'),
    }),
    [filters, search, visibleRange]
  );

  const meetingQueryFilters = useMemo(
    () => ({
      client: filters.client || undefined,
      assignedTo: filters.assignedTo || undefined,
      project: filters.project || undefined,
      search: search || undefined,
      startDate: format(visibleRange.start, 'yyyy-MM-dd'),
      endDate: format(visibleRange.end, 'yyyy-MM-dd'),
    }),
    [filters, search, visibleRange]
  );

  const { data: calendarData, isLoading: tasksLoading, refetch: refetchTasks } =
    useTaskCalendar(taskQueryFilters);
  const { data: meetingsRaw = [], isLoading: meetingsLoading, refetch: refetchMeetings } =
    useMeetings(meetingQueryFilters);
  const { data: clients = [] } = useClients({}, { enabled: !isClient });
  const { data: projectsRaw = [] } = useProjects({});
  const { data: usersRaw = [] } = useUsers({ enabled: canFilterAssignee || canScheduleMeeting });

  const { data: employeeTasks = [] } = useTasks(
    { assignedTo: user?._id, parent: 'all', limit: 300 },
    { enabled: canLogDailyUpdates && !!user?._id }
  );

  const weeklyReportQuery = useWeeklyTaskReport(
    {
      startDate: format(weeklyReportRange.start, 'yyyy-MM-dd'),
      endDate: format(weeklyReportRange.end, 'yyyy-MM-dd'),
      employeeId: canManageCalendar ? filters.assignedTo || undefined : undefined,
    },
    { enabled: canDownloadWeeklyReport }
  );

  const teamMembers = useMemo(
    () => (usersRaw || []).filter((u) => u.role !== 'client' && u.isActive !== false),
    [usersRaw]
  );

  const rawTasks = calendarData?.tasks || [];

  // Scope Tasks accurately on client too (e.g. if assignee/client filters active)
  const visibleTasks = useMemo(() => {
    return rawTasks.filter((task) => {
      if (filters.client) {
        const cid = task.client?._id || task.client || '';
        if (String(cid) !== String(filters.client)) return false;
      }
      if (filters.project) {
        const pid = task.project?._id || task.project || '';
        if (String(pid) !== String(filters.project)) return false;
      }
      if (filters.assignedTo && !doesTaskMatchUser(task, filters.assignedTo)) {
        return false;
      }
      if (filters.status) {
        if (normalizeTaskStatusLabel(task.status) !== filters.status) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [
          task.taskTitle,
          task.title,
          task.project?.name,
          task.client?.name,
          task.client?.company,
          ...extractTaskAssigneeNames(task),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rawTasks, filters, search]);

  // Visible Meetings (CalendarMeetings)
  const visibleMeetings = useMemo(() => {
    return (meetingsRaw || []).filter((mtg) => {
      if (filters.client) {
        const cid = mtg.client?._id || mtg.client || '';
        if (String(cid) !== String(filters.client)) return false;
      }
      if (filters.project) {
        const pid = mtg.project?._id || mtg.project || '';
        if (String(pid) !== String(filters.project)) return false;
      }
      if (filters.assignedTo) {
        const target = String(filters.assignedTo);
        const orgId = String(mtg.organizer?._id || mtg.organizer || '');
        const inAttendees = (mtg.attendees || []).some((a) => String(a?._id || a) === target);
        if (orgId !== target && !inAttendees) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [
          mtg.title,
          mtg.platform,
          mtg.project?.name,
          mtg.client?.name,
          mtg.notes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [meetingsRaw, filters, search]);

  // Projects filtered by selected client, project, employee, search, and visible dates
  const dropdownProjects = useMemo(() => {
    if (!filters.client) return projectsRaw;
    return projectsRaw.filter((p) => {
      const cid = p.client?._id || p.client || '';
      return String(cid) === String(filters.client);
    });
  }, [projectsRaw, filters.client]);

  const visibleProjects = useMemo(() => {
    const taskProjectIds = new Set(
      visibleTasks.map((t) => String(t.project?._id || t.project || '')).filter(Boolean)
    );
    const meetingProjectIds = new Set(
      visibleMeetings.map((m) => String(m.project?._id || m.project || '')).filter(Boolean)
    );

    return (projectsRaw || []).filter((proj) => {
      const pid = String(proj._id);
      if (filters.project && pid !== String(filters.project)) return false;
      if (filters.client) {
        const cid = String(proj.client?._id || proj.client || '');
        if (cid !== String(filters.client)) return false;
      }
      if (filters.assignedTo) {
        const target = String(filters.assignedTo);
        const isMgr = String(proj.manager?._id || proj.manager || '') === target;
        const inTeam = (proj.team || []).some((m) => String(m?._id || m) === target);
        if (!isMgr && !inTeam && !taskProjectIds.has(pid) && !meetingProjectIds.has(pid)) {
          return false;
        }
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [proj.name, proj.client?.name, proj.client?.company, proj.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q) && !taskProjectIds.has(pid) && !meetingProjectIds.has(pid)) {
          return false;
        }
      }

      // Include project if it overlaps the visible range OR has visible tasks/meetings in range
      if (taskProjectIds.has(pid) || meetingProjectIds.has(pid)) return true;

      const start = proj.startDate ? new Date(proj.startDate) : null;
      const due = proj.dueDate ? new Date(proj.dueDate) : null;
      const meetup = proj.nextMeetupDate ? new Date(proj.nextMeetupDate) : null;

      const overlapsRange =
        (start && start <= visibleRange.end && (!due || due >= visibleRange.start)) ||
        (due && due >= visibleRange.start && due <= visibleRange.end) ||
        (meetup && meetup >= visibleRange.start && meetup <= visibleRange.end);

      return Boolean(overlapsRange) || proj.status === 'In Progress' || proj.status === 'active';
    });
  }, [projectsRaw, visibleTasks, visibleMeetings, filters, search, visibleRange]);

  const tasksByDate = useMemo(() => {
    const grouped = new Map();
    if (!layers.tasks) return grouped;
    visibleTasks.forEach((task) => {
      const dateValue = task.dueDate || task.createdAt;
      if (!dateValue) return;
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return;
      const key = format(d, 'yyyy-MM-dd');
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(task);
    });
    return grouped;
  }, [visibleTasks, layers.tasks]);

  const meetingsByDate = useMemo(() => {
    const grouped = new Map();
    if (!layers.meetings) return grouped;
    visibleMeetings.forEach((mtg) => {
      if (!mtg.meetingDate) return;
      const d = new Date(mtg.meetingDate);
      if (Number.isNaN(d.getTime())) return;
      const key = format(d, 'yyyy-MM-dd');
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(mtg);
    });
    return grouped;
  }, [visibleMeetings, layers.meetings]);

  // Project milestones per date: startDate, dueDate, nextMeetupDate
  const projectEventsByDate = useMemo(() => {
    const grouped = new Map();
    if (!layers.projects) return grouped;
    visibleProjects.forEach((proj) => {
      const pushEvent = (dateVal, kind, label) => {
        if (!dateVal) return;
        const d = new Date(dateVal);
        if (Number.isNaN(d.getTime())) return;
        const key = format(d, 'yyyy-MM-dd');
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push({ project: proj, kind, label });
      };
      pushEvent(proj.dueDate, 'due', 'Due');
      pushEvent(proj.startDate, 'start', 'Kickoff');
      pushEvent(proj.nextMeetupDate, 'meetup', 'Sync');
    });
    return grouped;
  }, [visibleProjects, layers.projects]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const miniMonthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(miniMonthDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(miniMonthDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [miniMonthDate]);

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      }),
    [currentDate]
  );

  // Project -> Visible Tasks & Meetings grouping (used in Projects & List view + Day split view)
  const groupedByProject = useMemo(() => {
    const tasksByProj = new Map();
    const meetingsByProj = new Map();

    if (layers.tasks) {
      visibleTasks.forEach((t) => {
        const pid = String(t.project?._id || t.project || 'unassigned');
        if (!tasksByProj.has(pid)) tasksByProj.set(pid, []);
        tasksByProj.get(pid).push(t);
      });
    }
    if (layers.meetings) {
      visibleMeetings.forEach((m) => {
        const pid = String(m.project?._id || m.project || 'unassigned');
        if (!meetingsByProj.has(pid)) meetingsByProj.set(pid, []);
        meetingsByProj.get(pid).push(m);
      });
    }

    const groups = visibleProjects.map((proj) => {
      const pid = String(proj._id);
      return {
        project: proj,
        tasks: tasksByProj.get(pid) || [],
        meetings: meetingsByProj.get(pid) || [],
      };
    });

    const knownIds = new Set(visibleProjects.map((p) => String(p._id)));
    const otherTasks = [];
    const otherMeetings = [];

    tasksByProj.forEach((list, pid) => {
      if (!knownIds.has(pid)) otherTasks.push(...list);
    });
    meetingsByProj.forEach((list, pid) => {
      if (!knownIds.has(pid)) otherMeetings.push(...list);
    });

    return { groups, otherTasks, otherMeetings };
  }, [visibleProjects, visibleTasks, visibleMeetings, layers]);

  const selectedEmployeeObj = teamMembers.find((u) => String(u._id) === String(filters.assignedTo));
  const selectedClientObj = clients.find((c) => String(c._id) === String(filters.client));
  const selectedProjectObj = projectsRaw.find((p) => String(p._id) === String(filters.project));

  const hasActiveFilters =
    Boolean(filters.client || filters.assignedTo || filters.project || filters.status || search);

  const clearAllFilters = () => {
    setFilters({ client: '', assignedTo: '', project: '', status: '' });
    setSearch('');
  };

  const handleOpenTask = (task) => {
    if (isClient) {
      setSelectedClientTask(task);
    } else {
      setSelectedTaskId(task._id);
    }
  };

  const openCreateTask = (opts = {}) => {
    setTaskModalState({
      open: true,
      initialValues: {
        dueDate: opts.date || format(currentDate, 'yyyy-MM-dd'),
        dueTime: opts.time || '',
        client: opts.clientId || filters.client || '',
        project: opts.projectId || filters.project || '',
        assignedTo: opts.assignedTo || filters.assignedTo || '',
      },
    });
  };

  const openScheduleMeeting = (opts = {}) => {
    setMeetingModalState({
      open: true,
      meeting: opts.meeting || null,
      initialDate: opts.date || format(currentDate, 'yyyy-MM-dd'),
      initialTime: opts.time || '10:00',
      initialClientId: opts.clientId || filters.client || '',
      initialProjectId: opts.projectId || filters.project || '',
      initialAssigneeId: opts.assignedTo || filters.assignedTo || '',
    });
  };

  const handleRefreshAll = () => {
    refetchTasks();
    refetchMeetings();
  };

  const handleDownloadWeeklyReport = async () => {
    const result = await weeklyReportQuery.refetch();
    const report = result.data || weeklyReportQuery.data;
    if (!report) return;
    await downloadWeeklyReportPdf({
      report,
      range: weeklyReportRange,
      employeeName: selectedEmployeeObj?.name || user?.name || 'Team Schedule',
    });
  };

  const rangeHeading = useMemo(() => {
    if (view === 'day') return format(currentDate, 'EEEE, MMM d, yyyy');
    if (view === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: 0 });
      const e = endOfWeek(currentDate, { weekStartsOn: 0 });
      return s.getMonth() === e.getMonth()
        ? `${format(s, 'MMM d')} – ${format(e, 'd, yyyy')}`
        : `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  }, [currentDate, view]);

  const isLoading = tasksLoading || meetingsLoading;

  // Render Month Grid (Google Calendar Style)
  const renderMonthView = () => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
        {DAY_NAMES.map((dayName) => (
          <div
            key={dayName}
            className="py-2 text-center text-[11px] font-semibold tracking-wider text-muted-foreground border-r last:border-r-0 border-border/60"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="grid grid-cols-7">
        {monthDays.map((day, idx) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate.get(key) || [];
          const dayMeetings = meetingsByDate.get(key) || [];
          const dayProjectEvents = projectEventsByDate.get(key) || [];
          const inCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const selected = selectedDay && isSameDay(day, selectedDay);

          const totalItems =
            dayProjectEvents.length + dayMeetings.length + dayTasks.length;
          const MAX_CELL_ITEMS = 4;

          // Combine in priority order: Meetings -> Project milestones -> Tasks
          const combined = [
            ...dayMeetings.map((m) => ({ kind: 'meeting', id: m._id, data: m })),
            ...dayProjectEvents.map((p, i) => ({
              kind: 'project',
              id: `${p.project._id}-${p.kind}-${i}`,
              data: p,
            })),
            ...dayTasks.map((t) => ({ kind: 'task', id: t._id, data: t })),
          ];
          const shown = combined.slice(0, MAX_CELL_ITEMS);
          const hiddenCount = Math.max(0, combined.length - shown.length);

          return (
            <div
              key={key}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'group relative min-h-[122px] sm:min-h-[136px] p-1.5 sm:p-2 border-r border-b border-border/70 transition-colors cursor-pointer flex flex-col',
                idx % 7 === 6 && 'border-r-0',
                !inCurrentMonth ? 'bg-secondary/20 text-muted-foreground/60' : 'bg-card hover:bg-secondary/15',
                selected && 'ring-1 ring-inset ring-primary bg-primary/[0.03]'
              )}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDate(day);
                    setView('day');
                  }}
                  title="Open Day View"
                  className={cn(
                    'h-7 min-w-7 px-1.5 rounded-full inline-flex items-center justify-center text-xs font-semibold transition-colors',
                    today
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : inCurrentMonth
                      ? 'text-foreground hover:bg-secondary'
                      : 'text-muted-foreground/60 hover:bg-secondary/60'
                  )}
                >
                  {day.getDate() === 1 ? format(day, 'MMM d') : format(day, 'd')}
                </button>

                {/* Hover Quick-Add Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canManageCalendar && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateTask({ date: key });
                      }}
                      title="Add Task"
                      className="h-6 px-1.5 rounded-md text-[10px] font-semibold bg-secondary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors"
                    >
                      +Task
                    </button>
                  )}
                  {canScheduleMeeting && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openScheduleMeeting({ date: key });
                      }}
                      title="Schedule Meeting"
                      className="h-6 px-1.5 rounded-md text-[10px] font-semibold bg-violet-500/12 hover:bg-violet-600 hover:text-white text-violet-700 dark:text-violet-300 transition-colors"
                    >
                      +Meet
                    </button>
                  )}
                </div>
              </div>

              {/* Event Pills */}
              <div className="space-y-1 flex-1 min-w-0">
                {shown.map((entry) => {
                  if (entry.kind === 'meeting') {
                    const mtg = entry.data;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleMeeting({ meeting: mtg });
                        }}
                        className="w-full text-left rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-violet-500/15 hover:bg-violet-500/25 text-violet-900 dark:text-violet-200 border border-violet-500/25 flex items-center gap-1 truncate transition-colors"
                      >
                        <Video size={11} className="text-violet-600 dark:text-violet-400 shrink-0" />
                        {mtg.startTime && (
                          <span className="text-[10px] font-semibold opacity-80 shrink-0">
                            {mtg.startTime}
                          </span>
                        )}
                        <span className="truncate">{mtg.title}</span>
                      </button>
                    );
                  }

                  if (entry.kind === 'project') {
                    const { project, label } = entry.data;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectDrawer(project);
                        }}
                        className="w-full text-left rounded-md px-1.5 py-0.5 text-[11px] font-semibold bg-emerald-500/14 hover:bg-emerald-500/22 text-emerald-900 dark:text-emerald-200 border border-emerald-500/25 flex items-center gap-1 truncate transition-colors"
                      >
                        <FolderOpen size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{project.name}</span>
                        <span className="ml-auto text-[9px] uppercase opacity-75 shrink-0">{label}</span>
                      </button>
                    );
                  }

                  const task = entry.data;
                  const statusLabel = normalizeTaskStatusLabel(task.status);
                  const theme = TASK_STATUS_COLORS[statusLabel] || TASK_STATUS_COLORS['To Do'];
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTask(task);
                      }}
                      title={`${task.taskTitle || task.title}${task.project?.name ? ` • ${task.project.name}` : ''}`}
                      className={cn(
                        'w-full text-left rounded-md px-1.5 py-0.5 text-[11px] font-medium flex items-center gap-1.5 truncate transition-colors',
                        theme.pill
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dot)} />
                      {task.dueTime && (
                        <span className="text-[10px] opacity-75 shrink-0">{task.dueTime}</span>
                      )}
                      <span className="truncate flex-1">{task.taskTitle || task.title}</span>
                    </button>
                  );
                })}

                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDay(day);
                    }}
                    className="w-full text-left px-1.5 py-0.5 text-[11px] font-semibold text-primary hover:underline"
                  >
                    +{hiddenCount} more ({totalItems} total)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Google Calendar Time-Grid Week View
  const renderWeekView = () => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          {/* Column Headers */}
          <div className="grid grid-cols-[68px_repeat(7,minmax(0,1fr))] border-b border-border bg-secondary/30">
            <div className="p-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-end justify-center border-r border-border/60">
              Time
            </div>
            {weekDays.map((day) => {
              const today = isToday(day);
              return (
                <button
                  key={format(day, 'yyyy-MM-dd')}
                  type="button"
                  onClick={() => {
                    setCurrentDate(day);
                    setView('day');
                  }}
                  className={cn(
                    'py-2.5 px-2 text-center border-r last:border-r-0 border-border/60 hover:bg-secondary/40 transition-colors',
                    today && 'bg-primary/[0.04]'
                  )}
                >
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={cn(
                      'mt-0.5 mx-auto h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold',
                      today ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* All-Day Projects & Due Tasks Row */}
          <div className="grid grid-cols-[68px_repeat(7,minmax(0,1fr))] border-b border-border bg-secondary/10">
            <div className="p-2 text-[10px] font-semibold text-muted-foreground flex items-center justify-center border-r border-border/60">
              All-day
            </div>
            {weekDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const allDayTasks = (tasksByDate.get(key) || []).filter(
                (t) => parseHourFromTime(t.dueTime) === null
              );
              const dayProjEvents = projectEventsByDate.get(key) || [];
              const combined = [
                ...dayProjEvents.map((p, idx) => ({ kind: 'project', id: `${p.project._id}-${idx}`, data: p })),
                ...allDayTasks.map((t) => ({ kind: 'task', id: t._id, data: t })),
              ];
              return (
                <div
                  key={key}
                  className="p-1.5 border-r last:border-r-0 border-border/60 min-h-[58px] space-y-1"
                >
                  {combined.slice(0, 3).map((item) =>
                    item.kind === 'project' ? (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedProjectDrawer(item.data.project)}
                        className="w-full text-left rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/14 text-emerald-800 dark:text-emerald-200 truncate flex items-center gap-1"
                      >
                        <FolderOpen size={10} className="shrink-0" />
                        <span className="truncate">{item.data.project.name}</span>
                      </button>
                    ) : (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleOpenTask(item.data)}
                        className={cn(
                          'w-full text-left rounded px-1.5 py-0.5 text-[10px] font-medium truncate flex items-center gap-1',
                          (TASK_STATUS_COLORS[normalizeTaskStatusLabel(item.data.status)] ||
                            TASK_STATUS_COLORS['To Do']).pill
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full shrink-0',
                            (TASK_STATUS_COLORS[normalizeTaskStatusLabel(item.data.status)] ||
                              TASK_STATUS_COLORS['To Do']).dot
                          )}
                        />
                        <span className="truncate">{item.data.taskTitle || item.data.title}</span>
                      </button>
                    )
                  )}
                  {combined.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className="text-[10px] font-semibold text-primary hover:underline px-1"
                    >
                      +{combined.length - 3} more
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hourly Grid */}
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {HOURS.map((hour) => {
              const timeStr = `${String(hour).padStart(2, '0')}:00`;
              return (
                <div
                  key={hour}
                  className="grid grid-cols-[68px_repeat(7,minmax(0,1fr))] border-b last:border-b-0 border-border/50"
                >
                  <div className="px-2 py-2 text-[10px] font-medium text-muted-foreground text-right border-r border-border/60">
                    {formatHourLabel(hour)}
                  </div>
                  {weekDays.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const slotMeetings = (meetingsByDate.get(key) || []).filter(
                      (m) => (parseHourFromTime(m.startTime) ?? 10) === hour
                    );
                    const slotTasks = (tasksByDate.get(key) || []).filter(
                      (t) => parseHourFromTime(t.dueTime) === hour
                    );

                    return (
                      <div
                        key={`${key}-${hour}`}
                        onClick={() =>
                          canScheduleMeeting &&
                          openScheduleMeeting({ date: key, time: timeStr })
                        }
                        className="min-h-[50px] p-1 border-r last:border-r-0 border-border/50 hover:bg-primary/[0.03] cursor-pointer space-y-1 transition-colors"
                      >
                        {slotMeetings.map((mtg) => (
                          <button
                            key={mtg._id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openScheduleMeeting({ meeting: mtg });
                            }}
                            className="w-full text-left rounded-md px-1.5 py-1 text-[11px] font-semibold bg-violet-500/18 hover:bg-violet-500/28 text-violet-900 dark:text-violet-100 border-l-2 border-violet-600 truncate"
                          >
                            <div className="flex items-center gap-1 truncate">
                              <Video size={10} className="shrink-0" />
                              <span className="truncate">{mtg.title}</span>
                            </div>
                            <div className="text-[9px] opacity-80">
                              {mtg.startTime}
                              {mtg.endTime ? ` – ${mtg.endTime}` : ''}
                            </div>
                          </button>
                        ))}
                        {slotTasks.map((task) => {
                          const label = normalizeTaskStatusLabel(task.status);
                          const theme = TASK_STATUS_COLORS[label] || TASK_STATUS_COLORS['To Do'];
                          return (
                            <button
                              key={task._id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTask(task);
                              }}
                              className={cn(
                                'w-full text-left rounded-md px-1.5 py-1 text-[11px] font-medium truncate',
                                theme.pill
                              )}
                            >
                              {task.taskTitle || task.title}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Day View (Hourly Timeline + Active Projects Breakdown)
  const renderDayView = () => {
    const key = format(currentDate, 'yyyy-MM-dd');
    const dayTasks = tasksByDate.get(key) || [];
    const dayMeetings = meetingsByDate.get(key) || [];
    const dayProjectEvents = projectEventsByDate.get(key) || [];
    const allDayTasks = dayTasks.filter((t) => parseHourFromTime(t.dueTime) === null);

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Google Calendar Day Time Grid */}
        <div className="xl:col-span-8 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-secondary/20">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {dayMeetings.length} meetings • {dayTasks.length} tasks scheduled
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canManageCalendar && (
                <Button size="sm" variant="outline" onClick={() => openCreateTask({ date: key })}>
                  <Plus size={14} className="mr-1" /> Add Task
                </Button>
              )}
              {canScheduleMeeting && (
                <Button size="sm" onClick={() => openScheduleMeeting({ date: key })}>
                  <Video size={14} className="mr-1" /> Schedule Meeting
                </Button>
              )}
            </div>
          </div>

          {/* All-day Row */}
          {(dayProjectEvents.length > 0 || allDayTasks.length > 0) && (
            <div className="p-3 border-b border-border bg-secondary/10 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                All-Day Tasks & Project Milestones
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dayProjectEvents.map((ev, idx) => (
                  <button
                    key={`${ev.project._id}-${idx}`}
                    type="button"
                    onClick={() => setSelectedProjectDrawer(ev.project)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-emerald-500/14 text-emerald-800 dark:text-emerald-200 border border-emerald-500/25 hover:bg-emerald-500/22"
                  >
                    <FolderOpen size={12} /> {ev.project.name} ({ev.label})
                  </button>
                ))}
                {allDayTasks.map((task) => {
                  const statusLabel = normalizeTaskStatusLabel(task.status);
                  const theme = TASK_STATUS_COLORS[statusLabel] || TASK_STATUS_COLORS['To Do'];
                  return (
                    <button
                      key={task._id}
                      type="button"
                      onClick={() => handleOpenTask(task)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
                        theme.pill
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />
                      <span>{task.taskTitle || task.title}</span>
                      {task.project?.name && (
                        <span className="text-[10px] opacity-75">• {task.project.name}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hourly Schedule */}
          <div className="max-h-[580px] overflow-y-auto custom-scrollbar divide-y divide-border/50">
            {HOURS.map((hour) => {
              const timeStr = `${String(hour).padStart(2, '0')}:00`;
              const slotMeetings = dayMeetings.filter(
                (m) => (parseHourFromTime(m.startTime) ?? 10) === hour
              );
              const slotTasks = dayTasks.filter(
                (t) => parseHourFromTime(t.dueTime) === hour
              );
              return (
                <div
                  key={hour}
                  onClick={() =>
                    canScheduleMeeting && openScheduleMeeting({ date: key, time: timeStr })
                  }
                  className="grid grid-cols-[72px_1fr] min-h-[56px] hover:bg-primary/[0.02] cursor-pointer"
                >
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground text-right border-r border-border/60">
                    {formatHourLabel(hour)}
                  </div>
                  <div className="p-2 space-y-1.5">
                    {slotMeetings.map((mtg) => (
                      <button
                        key={mtg._id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleMeeting({ meeting: mtg });
                        }}
                        className="w-full text-left rounded-xl px-3 py-2 bg-violet-500/14 hover:bg-violet-500/22 border border-violet-500/25 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
                            <Video size={14} className="text-violet-600 shrink-0" />
                            <span className="truncate">{mtg.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {mtg.startTime} – {mtg.endTime || ''} • {mtg.platform}
                            {mtg.project?.name ? ` • ${mtg.project.name}` : ''}
                            {mtg.client?.name ? ` • ${mtg.client.name}` : ''}
                          </div>
                        </div>
                        <StatusBadge value={mtg.status || 'scheduled'} />
                      </button>
                    ))}
                    {slotTasks.map((task) => {
                      const label = normalizeTaskStatusLabel(task.status);
                      const theme = TASK_STATUS_COLORS[label] || TASK_STATUS_COLORS['To Do'];
                      return (
                        <button
                          key={task._id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTask(task);
                          }}
                          className={cn(
                            'w-full text-left rounded-xl px-3 py-2 text-xs font-medium flex items-center justify-between gap-2',
                            theme.pill
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn('h-2 w-2 rounded-full shrink-0', theme.dot)} />
                            <span className="font-semibold truncate">
                              {task.taskTitle || task.title}
                            </span>
                            {task.project?.name && (
                              <span className="opacity-75 truncate">• {task.project.name}</span>
                            )}
                          </div>
                          <span className="shrink-0">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Projects & Visible Tasks Inside */}
        <div className="xl:col-span-4 bg-card rounded-2xl border border-border p-4 space-y-3 self-start">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FolderOpen size={15} className="text-emerald-600" />
              Projects & Inside Tasks
            </h4>
            <span className="text-xs font-semibold text-muted-foreground">
              {groupedByProject.groups.length} projects
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {groupedByProject.groups.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No projects match the current filters.
              </p>
            ) : (
              groupedByProject.groups.map(({ project, tasks, meetings }) => (
                <div
                  key={project._id}
                  className="rounded-xl border border-border bg-background/70 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProjectDrawer(project)}
                      className="text-left min-w-0 flex-1 group"
                    >
                      <p className="text-xs font-bold text-foreground group-hover:text-primary truncate">
                        {project.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {project.client?.name || project.client?.company || 'Internal'} •{' '}
                        {tasks.length} tasks • {meetings.length} meets
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProjectDrawer(project)}
                      className="text-[10px] font-semibold text-primary hover:underline shrink-0"
                    >
                      Open
                    </button>
                  </div>

                  {(tasks.length > 0 || meetings.length > 0) && (
                    <div className="space-y-1 pt-1 border-t border-border/50">
                      {meetings.slice(0, 2).map((m) => (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => openScheduleMeeting({ meeting: m })}
                          className="w-full text-left text-[11px] px-2 py-1 rounded bg-violet-500/10 text-violet-800 dark:text-violet-200 flex items-center gap-1.5 truncate"
                        >
                          <Video size={10} className="shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </button>
                      ))}
                      {tasks.slice(0, 4).map((t) => {
                        const label = normalizeTaskStatusLabel(t.status);
                        const theme = TASK_STATUS_COLORS[label] || TASK_STATUS_COLORS['To Do'];
                        return (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => handleOpenTask(t)}
                            className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-secondary/60 flex items-center gap-1.5 truncate"
                          >
                            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dot)} />
                            <span className="truncate flex-1">{t.taskTitle || t.title}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {extractTaskAssigneeNames(t)[0] || ''}
                            </span>
                          </button>
                        );
                      })}
                      {tasks.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setSelectedProjectDrawer(project)}
                          className="text-[10px] font-semibold text-primary px-2 hover:underline"
                        >
                          View all {tasks.length} tasks →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Projects & List (Agenda) View — Clearly shows Projects -> Visible Tasks & Meetings Inside
  const renderAgendaView = () => {
    const timelineDays = Array.from(
      new Set([
        ...Array.from(tasksByDate.keys()),
        ...Array.from(meetingsByDate.keys()),
        ...Array.from(projectEventsByDate.keys()),
      ])
    ).sort();

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-card rounded-xl border border-border px-4 py-2.5">
          <div className="text-xs font-semibold text-muted-foreground">
            {agendaMode === 'projects'
              ? `Showing ${groupedByProject.groups.length} projects with their visible tasks & meetings`
              : `Chronological schedule across ${timelineDays.length} active days`}
          </div>
          <div className="inline-flex rounded-lg bg-secondary p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAgendaMode('projects')}
              className={cn(
                'px-3 py-1 rounded-md transition-colors',
                agendaMode === 'projects'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              By Project (Tasks Inside)
            </button>
            <button
              type="button"
              onClick={() => setAgendaMode('timeline')}
              className={cn(
                'px-3 py-1 rounded-md transition-colors',
                agendaMode === 'timeline'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              By Date
            </button>
          </div>
        </div>

        {agendaMode === 'projects' ? (
          <div className="space-y-3">
            {groupedByProject.groups.length === 0 &&
            groupedByProject.otherTasks.length === 0 &&
            groupedByProject.otherMeetings.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No matching projects, tasks, or meetings"
                description="Adjust your employee, client, or month filters, or create a new task or meeting."
              />
            ) : (
              <>
                {groupedByProject.groups.map(({ project, tasks, meetings }) => (
                  <div
                    key={project._id}
                    className="rounded-2xl border border-border bg-card overflow-hidden"
                  >
                    {/* Project Header */}
                    <div className="px-5 py-3.5 bg-secondary/20 border-b border-border flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/12 text-emerald-600 flex items-center justify-center shrink-0">
                          <FolderOpen size={18} />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedProjectDrawer(project)}
                            className="text-sm font-bold text-foreground hover:text-primary text-left truncate block"
                          >
                            {project.name}
                          </button>
                          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                              <Building2 size={11} />
                              {project.client?.name || project.client?.company || 'Internal Project'}
                            </span>
                            <span>•</span>
                            <span>{tasks.length} tasks</span>
                            <span>•</span>
                            <span>{meetings.length} meetings</span>
                            {project.dueDate && (
                              <>
                                <span>•</span>
                                <span>Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canManageCalendar && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openCreateTask({
                                projectId: project._id,
                                clientId: project.client?._id || project.client || '',
                              })
                            }
                          >
                            <Plus size={13} className="mr-1" /> Task
                          </Button>
                        )}
                        {canScheduleMeeting && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openScheduleMeeting({
                                projectId: project._id,
                                clientId: project.client?._id || project.client || '',
                              })
                            }
                          >
                            <Video size={13} className="mr-1 text-violet-600" /> Meeting
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedProjectDrawer(project)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>

                    {/* Inside Project Content: Meetings + Tasks */}
                    <div className="p-4 space-y-3">
                      {meetings.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                            Scheduled Meetings ({meetings.length})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {meetings.map((mtg) => (
                              <button
                                key={mtg._id}
                                type="button"
                                onClick={() => openScheduleMeeting({ meeting: mtg })}
                                className="text-left rounded-xl border border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 p-3 flex items-center justify-between gap-2 transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                                    <Video size={13} className="text-violet-600 shrink-0" />
                                    {mtg.title}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {format(new Date(mtg.meetingDate), 'MMM d, yyyy')}
                                    {mtg.startTime ? ` • ${mtg.startTime}` : ''} • {mtg.platform}
                                  </p>
                                </div>
                                <StatusBadge value={mtg.status || 'scheduled'} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {tasks.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Visible Tasks ({tasks.length})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {tasks.map((task) => {
                              const statusLabel = normalizeTaskStatusLabel(task.status);
                              const theme =
                                TASK_STATUS_COLORS[statusLabel] || TASK_STATUS_COLORS['To Do'];
                              const assignees = extractTaskAssigneeNames(task);
                              return (
                                <button
                                  key={task._id}
                                  type="button"
                                  onClick={() => handleOpenTask(task)}
                                  className="text-left rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-secondary/20 p-3 flex items-start justify-between gap-2 transition-colors"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                      {task.taskTitle || task.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                      {formatTaskTypeLabel(task.taskType)} •{' '}
                                      {assignees.join(', ') || 'Unassigned'}
                                      {task.dueDate
                                        ? ` • Due ${format(new Date(task.dueDate), 'MMM d')}`
                                        : ''}
                                    </p>
                                  </div>
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0',
                                      theme.badge
                                    )}
                                  >
                                    <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />
                                    {statusLabel}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        meetings.length === 0 && (
                          <p className="text-xs text-muted-foreground py-2">
                            No visible tasks or meetings match the active filters in this project.
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {(groupedByProject.otherTasks.length > 0 ||
                  groupedByProject.otherMeetings.length > 0) && (
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Standalone Meetings & Tasks (No Linked Project)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {groupedByProject.otherMeetings.map((mtg) => (
                        <button
                          key={mtg._id}
                          type="button"
                          onClick={() => openScheduleMeeting({ meeting: mtg })}
                          className="text-left rounded-xl border border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 p-3 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                              <Video size={13} className="text-violet-600 shrink-0" />
                              {mtg.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {format(new Date(mtg.meetingDate), 'MMM d, yyyy')} • {mtg.startTime}
                            </p>
                          </div>
                          <StatusBadge value={mtg.status || 'scheduled'} />
                        </button>
                      ))}
                      {groupedByProject.otherTasks.map((task) => {
                        const statusLabel = normalizeTaskStatusLabel(task.status);
                        const theme =
                          TASK_STATUS_COLORS[statusLabel] || TASK_STATUS_COLORS['To Do'];
                        return (
                          <button
                            key={task._id}
                            type="button"
                            onClick={() => handleOpenTask(task)}
                            className="text-left rounded-xl border border-border bg-background hover:border-primary/40 p-3 flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {task.taskTitle || task.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                {extractTaskAssigneeNames(task).join(', ') || 'Unassigned'}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0',
                                theme.badge
                              )}
                            >
                              {statusLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {timelineDays.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No scheduled items in this range"
                description="Schedule a meeting or add a task on any date."
              />
            ) : (
              timelineDays.map((dateKey) => {
                const day = new Date(`${dateKey}T12:00:00`);
                const mtgs = meetingsByDate.get(dateKey) || [];
                const tks = tasksByDate.get(dateKey) || [];
                const projs = projectEventsByDate.get(dateKey) || [];

                return (
                  <div
                    key={dateKey}
                    className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-4"
                  >
                    <div className="sm:w-36 shrink-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {format(day, 'EEE, MMM')}
                      </div>
                      <div className="text-2xl font-bold text-foreground">{format(day, 'd')}</div>
                    </div>

                    <div className="flex-1 space-y-2">
                      {mtgs.map((m) => (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => openScheduleMeeting({ meeting: m })}
                          className="w-full text-left rounded-xl border border-violet-500/25 bg-violet-500/8 px-3 py-2 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Video size={14} className="text-violet-600 shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate">
                              {m.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {m.startTime} • {m.platform}
                            </span>
                          </div>
                          <StatusBadge value={m.status || 'scheduled'} />
                        </button>
                      ))}
                      {projs.map((p, idx) => (
                        <button
                          key={`${p.project._id}-${idx}`}
                          type="button"
                          onClick={() => setSelectedProjectDrawer(p.project)}
                          className="w-full text-left rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2 flex items-center gap-2"
                        >
                          <FolderOpen size={14} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            {p.project.name}
                          </span>
                          <span className="text-xs text-muted-foreground">({p.label})</span>
                        </button>
                      ))}
                      {tks.map((t) => {
                        const label = normalizeTaskStatusLabel(t.status);
                        const theme = TASK_STATUS_COLORS[label] || TASK_STATUS_COLORS['To Do'];
                        return (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => handleOpenTask(t)}
                            className="w-full text-left rounded-xl border border-border bg-background hover:bg-secondary/30 px-3 py-2 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <span className={cn('h-2 w-2 rounded-full shrink-0', theme.dot)} />
                              <span className="text-xs font-semibold text-foreground truncate">
                                {t.taskTitle || t.title}
                              </span>
                              {t.project?.name && (
                                <span className="text-[11px] text-muted-foreground truncate">
                                  • {t.project.name}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                              {extractTaskAssigneeNames(t)[0] || label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // Selected day agenda modal details
  const selectedDayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
  const selectedDayTasks = selectedDayKey ? tasksByDate.get(selectedDayKey) || [] : [];
  const selectedDayMeetings = selectedDayKey ? meetingsByDate.get(selectedDayKey) || [] : [];
  const selectedDayProjects = selectedDayKey ? projectEventsByDate.get(selectedDayKey) || [] : [];

  return (
    <div className={cn('space-y-3', embedded && 'p-3 sm:p-4')}>
      {/* ── Google Calendar Top Header Bar ── */}
      <div className="bg-card rounded-2xl border border-border px-3 sm:px-4 py-2.5 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Navigation Cluster */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen((v) => !v)}
              title="Toggle calendar sidebar"
              className="h-9 w-9 rounded-xl"
            >
              <Menu size={18} />
            </Button>

            <div className="flex items-center gap-2 pr-1">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarDays size={17} />
              </div>
              <span className="text-base font-bold text-foreground hidden sm:inline">
                Calendar
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="h-8 px-3 rounded-lg text-xs font-semibold"
            >
              Today
            </Button>

            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate((d) => shiftDateByView(d, view, -1))}
                className="h-8 w-8 rounded-lg"
                title="Previous"
              >
                <ChevronLeft size={17} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate((d) => shiftDateByView(d, view, 1))}
                className="h-8 w-8 rounded-lg"
                title="Next"
              >
                <ChevronRight size={17} />
              </Button>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {rangeHeading}
            </h2>
          </div>

          {/* Right Actions Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, projects, meetings..."
              className="w-48 sm:w-56"
            />

            {/* View Switcher */}
            <div className="inline-flex items-center rounded-xl bg-secondary p-1">
              {VIEW_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = view === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setView(option.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                      active
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon size={13} />
                    <span className="hidden md:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {canScheduleMeeting && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openScheduleMeeting({ date: format(currentDate, 'yyyy-MM-dd') })}
                className="h-8 rounded-xl border-violet-500/35 text-violet-700 dark:text-violet-300 hover:bg-violet-500/10"
              >
                <Video size={14} className="mr-1.5" />
                Meeting
              </Button>
            )}

            {canManageCalendar && (
              <Button
                type="button"
                size="sm"
                onClick={() => openCreateTask({ date: format(currentDate, 'yyyy-MM-dd') })}
                className="h-8 rounded-xl"
              >
                <Plus size={14} className="mr-1" />
                Task
              </Button>
            )}

            {canLogDailyUpdates && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDailyUpdateOpen(true)}
                className="h-8 rounded-xl"
              >
                <TimerReset size={14} className="mr-1" />
                Log Work
              </Button>
            )}

            {canDownloadWeeklyReport && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleDownloadWeeklyReport}
                disabled={weeklyReportQuery.isFetching}
                title="Download Weekly PDF Report"
                className="h-8 w-8 rounded-xl"
              >
                <Download size={15} />
              </Button>
            )}
          </div>
        </div>

        {/* Active Scope Chips (only when filtered by Employee / Client / Project / Status) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/60 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">
              Viewing:
            </span>
            {selectedEmployeeObj && (
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, assignedTo: '' }))}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-semibold"
              >
                Employee: {selectedEmployeeObj.name} <X size={12} />
              </button>
            )}
            {selectedClientObj && (
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, client: '' }))}
                className="inline-flex items-center gap-1 rounded-full bg-sky-500/12 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 font-semibold"
              >
                Client: {selectedClientObj.name || selectedClientObj.company} <X size={12} />
              </button>
            )}
            {selectedProjectObj && (
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, project: '' }))}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 font-semibold"
              >
                Project: {selectedProjectObj.name} <X size={12} />
              </button>
            )}
            {filters.status && (
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, status: '' }))}
                className="inline-flex items-center gap-1 rounded-full bg-secondary text-foreground px-2.5 py-0.5 font-semibold"
              >
                Status: {filters.status} <X size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline ml-1"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* ── Main Google Calendar Workspace: Collapsible Left Rail + Calendar Grid ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start">
        {sidebarOpen && (
          <aside className="w-full lg:w-[268px] shrink-0 space-y-3">
            {/* Mini Month Calendar */}
            <div className="bg-card rounded-2xl border border-border p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">
                  {format(miniMonthDate, 'MMMM yyyy')}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setMiniMonthDate((d) => subMonths(d, 1))}
                    className="h-6 w-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMiniMonthDate((d) => addMonths(d, 1))}
                    className="h-6 w-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                {MINI_DAY_NAMES.map((d, i) => (
                  <span key={`${d}-${i}`} className="text-[10px] font-semibold text-muted-foreground">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {miniMonthDays.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const inMonth = isSameMonth(day, miniMonthDate);
                  const today = isToday(day);
                  const active = isSameDay(day, currentDate);
                  const hasItems =
                    (tasksByDate.get(key)?.length || 0) + (meetingsByDate.get(key)?.length || 0) >
                    0;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCurrentDate(day)}
                      className={cn(
                        'relative h-7 w-7 mx-auto rounded-full text-[11px] font-medium flex items-center justify-center transition-colors',
                        today
                          ? 'bg-primary text-primary-foreground font-bold'
                          : active
                          ? 'bg-primary/15 text-primary font-bold'
                          : inMonth
                          ? 'text-foreground hover:bg-secondary'
                          : 'text-muted-foreground/40 hover:bg-secondary/40'
                      )}
                    >
                      {format(day, 'd')}
                      {hasItems && !today && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter By Employee / Client / Project */}
            <div className="bg-card rounded-2xl border border-border p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users size={13} className="text-primary" /> People & Clients
                </span>
                {user?._id && !isClient && (
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        assignedTo:
                          String(prev.assignedTo) === String(user._id) ? '' : user._id,
                      }))
                    }
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors',
                      String(filters.assignedTo) === String(user._id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    My Schedule
                  </button>
                )}
              </div>

              {canFilterAssignee && (
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Employee
                  </label>
                  <SelectDropdown
                    value={filters.assignedTo}
                    onChange={(val) => setFilters((p) => ({ ...p, assignedTo: val || '' }))}
                    allOptionLabel="All Employees"
                    options={teamMembers.map((u) => ({
                      value: u._id,
                      label: u.name,
                      subLabel: u.role,
                    }))}
                    allowCustom={false}
                    placeholder="Select employee..."
                  />
                </div>
              )}

              {!isClient && (
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Client
                  </label>
                  <SelectDropdown
                    value={filters.client}
                    onChange={(val) =>
                      setFilters((p) => ({
                        ...p,
                        client: val || '',
                        project: '',
                      }))
                    }
                    allOptionLabel="All Clients"
                    options={clients.map((c) => ({
                      value: c._id,
                      label: c.name || c.company || 'Unnamed',
                      subLabel: c.company && c.company !== c.name ? c.company : undefined,
                    }))}
                    allowCustom={false}
                    placeholder="Select client..."
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Project
                </label>
                <SelectDropdown
                  value={filters.project}
                  onChange={(val) => setFilters((p) => ({ ...p, project: val || '' }))}
                  allOptionLabel="All Projects"
                  options={dropdownProjects.map((proj) => ({
                    value: proj._id,
                    label: proj.name,
                    subLabel: proj.client?.name || proj.status,
                  }))}
                  allowCustom={false}
                  placeholder="Select project..."
                />
              </div>
            </div>

            {/* Google Calendar Layers + Status Filters */}
            <div className="bg-card rounded-2xl border border-border p-3.5 space-y-3">
              <div>
                <span className="block text-xs font-bold text-foreground mb-2">
                  Show on Calendar
                </span>
                <div className="space-y-1.5">
                  {[
                    {
                      key: 'projects',
                      label: 'Projects',
                      count: visibleProjects.length,
                      color: 'accent-emerald-600',
                      dot: 'bg-emerald-500',
                    },
                    {
                      key: 'tasks',
                      label: 'Tasks',
                      count: visibleTasks.length,
                      color: 'accent-sky-600',
                      dot: 'bg-sky-500',
                    },
                    {
                      key: 'meetings',
                      label: 'Meetings',
                      count: visibleMeetings.length,
                      color: 'accent-violet-600',
                      dot: 'bg-violet-500',
                    },
                  ].map((layer) => (
                    <label
                      key={layer.key}
                      className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-secondary/50 cursor-pointer text-xs"
                    >
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={layers[layer.key]}
                          onChange={() =>
                            setLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))
                          }
                          className={cn('h-3.5 w-3.5 rounded', layer.color)}
                        />
                        <span className={cn('h-2 w-2 rounded-full', layer.dot)} />
                        {layer.label}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {layer.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60">
                <span className="block text-xs font-bold text-foreground mb-2">Task Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {['To Do', 'On Process', 'Waiting for Client', 'Review Required', 'Completed', 'Rework'].map(
                    (statusKey) => {
                      const meta = TASK_STATUS_COLORS[statusKey];
                      const active = filters.status === statusKey;
                      return (
                        <button
                          key={statusKey}
                          type="button"
                          onClick={() =>
                            setFilters((p) => ({
                              ...p,
                              status: p.status === statusKey ? '' : statusKey,
                            }))
                          }
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border transition-colors cursor-pointer',
                            active
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                          {meta.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── Right Calendar Stage ── */}
        <div className="flex-1 min-w-0 w-full space-y-3">
          {/* Active Projects Quick Strip (Click any project to inspect its Tasks & Meetings) */}
          {layers.projects && visibleProjects.length > 0 && view !== 'agenda' && (
            <div className="bg-card rounded-2xl border border-border px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderOpen size={12} className="text-emerald-600" />
                  Projects ({visibleProjects.length}) — click a project to view inside tasks & meetings
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setView('agenda');
                    setAgendaMode('projects');
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline shrink-0"
                >
                  Expand All Projects →
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {visibleProjects.map((proj) => {
                  const taskCount = visibleTasks.filter(
                    (t) => String(t.project?._id || t.project || '') === String(proj._id)
                  ).length;
                  const mtgCount = visibleMeetings.filter(
                    (m) => String(m.project?._id || m.project || '') === String(proj._id)
                  ).length;
                  return (
                    <button
                      key={proj._id}
                      type="button"
                      onClick={() => setSelectedProjectDrawer(proj)}
                      className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-border bg-background hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] px-3 py-1.5 text-left transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-foreground max-w-[160px] truncate">
                        {proj.name}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {taskCount}t{mtgCount > 0 ? ` · ${mtgCount}m` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-[460px] rounded-2xl border border-border bg-card flex items-center justify-center text-sm text-muted-foreground">
              Loading calendar schedule...
            </div>
          ) : view === 'month' ? (
            renderMonthView()
          ) : view === 'week' ? (
            renderWeekView()
          ) : view === 'day' ? (
            renderDayView()
          ) : (
            renderAgendaView()
          )}
        </div>
      </div>

      {/* ── Day Agenda Drawer (Clean Google-Calendar Day Breakdown) ── */}
      <Dialog open={Boolean(selectedDay)} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent
          variant="side"
          noPadding
          hideCloseButton
          className="flex flex-col min-h-0 p-0 overflow-hidden bg-background"
        >
          <div className="shrink-0 px-6 py-4 border-b border-border flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : ''}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {selectedDayMeetings.length} meetings • {selectedDayTasks.length} tasks •{' '}
                {selectedDayProjects.length} project milestones
              </DialogDescription>
            </div>
            <DialogClose className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/70 text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={17} />
            </DialogClose>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
            {(canManageCalendar || canScheduleMeeting) && selectedDay && (
              <div className="flex flex-wrap gap-2">
                {canManageCalendar && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const key = format(selectedDay, 'yyyy-MM-dd');
                      setSelectedDay(null);
                      openCreateTask({ date: key });
                    }}
                  >
                    <Plus size={14} className="mr-1.5" /> Add Task
                  </Button>
                )}
                {canScheduleMeeting && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const key = format(selectedDay, 'yyyy-MM-dd');
                      setSelectedDay(null);
                      openScheduleMeeting({ date: key });
                    }}
                  >
                    <Video size={14} className="mr-1.5 text-violet-600" /> Schedule Meeting
                  </Button>
                )}
                {canLogDailyUpdates && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDay(null);
                      setDailyCalendarTaskOpen(true);
                    }}
                  >
                    <Briefcase size={14} className="mr-1.5" /> Personal Task
                  </Button>
                )}
              </div>
            )}

            {/* Meetings */}
            {selectedDayMeetings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Meetings ({selectedDayMeetings.length})
                </h4>
                {selectedDayMeetings.map((mtg) => (
                  <button
                    key={mtg._id}
                    type="button"
                    onClick={() => {
                      setSelectedDay(null);
                      openScheduleMeeting({ meeting: mtg });
                    }}
                    className="w-full text-left rounded-xl border border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 p-3 space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                        <Video size={14} className="text-violet-600 shrink-0" />
                        {mtg.title}
                      </span>
                      <StatusBadge value={mtg.status || 'scheduled'} />
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {mtg.startTime}
                        {mtg.endTime ? ` – ${mtg.endTime}` : ''}
                      </span>
                      <span>• {mtg.platform}</span>
                      {mtg.project?.name && <span>• {mtg.project.name}</span>}
                      {mtg.client?.name && <span>• {mtg.client.name}</span>}
                    </div>
                    {mtg.meetingLink && (
                      <div className="pt-1">
                        <a
                          href={
                            mtg.meetingLink.startsWith('http')
                              ? mtg.meetingLink
                              : `https://${mtg.meetingLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          Open Meeting Link <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Project Milestones */}
            {selectedDayProjects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Project Milestones ({selectedDayProjects.length})
                </h4>
                {selectedDayProjects.map(({ project, label }, idx) => (
                  <button
                    key={`${project._id}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedProjectDrawer(project);
                    }}
                    className="w-full text-left rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                        <FolderOpen size={14} className="text-emerald-600 shrink-0" />
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project.client?.name || project.client?.company || 'Internal'} • Milestone:{' '}
                        {label}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                      View Tasks →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Tasks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tasks ({selectedDayTasks.length})
              </h4>
              {selectedDayTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No tasks due on this date.
                </div>
              ) : (
                selectedDayTasks.map((task) => {
                  const statusLabel = normalizeTaskStatusLabel(task.status);
                  const theme = TASK_STATUS_COLORS[statusLabel] || TASK_STATUS_COLORS['To Do'];
                  const assignees = extractTaskAssigneeNames(task);
                  return (
                    <button
                      key={task._id}
                      type="button"
                      onClick={() => {
                        setSelectedDay(null);
                        handleOpenTask(task);
                      }}
                      className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/40 p-3 flex items-start justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {task.taskTitle || task.title}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                          <span>{formatTaskTypeLabel(task.taskType)}</span>
                          {task.project?.name && <span>• {task.project.name}</span>}
                          <span>• {assignees.join(', ') || 'Unassigned'}</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0',
                          theme.badge
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />
                        {statusLabel}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Project Breakdown Drawer (Tasks Inside Project + Meetings) ── */}
      <ProjectCalendarDrawer
        open={Boolean(selectedProjectDrawer)}
        onOpenChange={(open) => !open && setSelectedProjectDrawer(null)}
        project={selectedProjectDrawer}
        tasks={visibleTasks}
        meetings={visibleMeetings}
        canManage={canManageCalendar}
        canScheduleMeeting={canScheduleMeeting}
        onSelectTask={(task) => handleOpenTask(task)}
        onSelectMeeting={(mtg) => openScheduleMeeting({ meeting: mtg })}
        onAddTaskForProject={(proj) =>
          openCreateTask({
            projectId: proj._id,
            clientId: proj.client?._id || proj.client || '',
            date: format(currentDate, 'yyyy-MM-dd'),
          })
        }
        onScheduleMeetingForProject={(proj) =>
          openScheduleMeeting({
            projectId: proj._id,
            clientId: proj.client?._id || proj.client || '',
            date: format(currentDate, 'yyyy-MM-dd'),
          })
        }
      />

      {/* ── Schedule / Edit Meeting Modal ── */}
      <ScheduleMeetingModal
        open={meetingModalState.open}
        onOpenChange={(open) => setMeetingModalState((prev) => ({ ...prev, open }))}
        meeting={meetingModalState.meeting}
        initialDate={meetingModalState.initialDate}
        initialTime={meetingModalState.initialTime}
        initialClientId={meetingModalState.initialClientId}
        initialProjectId={meetingModalState.initialProjectId}
        initialAssigneeId={meetingModalState.initialAssigneeId}
        clients={clients}
        projects={projectsRaw}
        users={teamMembers}
        readOnly={isClient}
        canDelete={canManageCalendar || String(meetingModalState.meeting?.organizer?._id || meetingModalState.meeting?.organizer || '') === String(user?._id || '')}
      />

      {/* ── Inline Create Task Modal ── */}
      <KanbanCreateTaskModal
        open={taskModalState.open}
        onOpenChange={(open) => setTaskModalState((prev) => ({ ...prev, open }))}
        initialValues={taskModalState.initialValues}
        onTaskCreated={handleRefreshAll}
      />

      {/* ── Employee Progress & Daily Task Dialogs ── */}
      {canLogDailyUpdates && (
        <DailyTaskUpdateDialog
          open={dailyUpdateOpen}
          onOpenChange={setDailyUpdateOpen}
          tasks={employeeTasks}
          defaultDate={format(currentDate, 'yyyy-MM-dd')}
          onSubmitted={handleRefreshAll}
        />
      )}

      {canLogDailyUpdates && (
        <DailyCalendarTaskDialog
          open={dailyCalendarTaskOpen}
          onOpenChange={setDailyCalendarTaskOpen}
          defaultDate={format(currentDate, 'yyyy-MM-dd')}
          onSubmitted={handleRefreshAll}
        />
      )}

      {/* ── Task Detail / Client Task Dialogs ── */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />

      <ClientTaskDialog
        task={selectedClientTask}
        open={Boolean(selectedClientTask)}
        onOpenChange={(open) => !open && setSelectedClientTask(null)}
        onSubmitted={handleRefreshAll}
      />
    </div>
  );
};

export default ContentCalendar;
