import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
} from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';
import { AddTaskModal } from '../../components/modals/AddTaskModal';
import { TaskDetailModal } from '../../components/ui/TaskDetailModal';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  EmptyState,
  MetricCard,
  MetricGrid,
  PageHeader,
  PageToolbar,
  SearchField,
  SectionCard,
  StatusBadge,
} from '../../components/ui/page';
import { cn } from '../../utils/cn';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusTone = {
  'To Do': 'neutral',
  'In Progress': 'info',
  'In Review': 'warning',
  Approved: 'success',
  Done: 'success',
  Blocked: 'danger',
};

const taskTypeTone = {
  content: 'primary',
  reel: 'violet',
  poster: 'info',
  video: 'warning',
};

const formatTaskType = (value) => {
  if (!value) return 'Content';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ContentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState('');
  const { user } = useSelector((state) => state.auth);
  const canManageContent = ['superAdmin', 'manager'].includes(user?.role);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', { params: { parent: 'all' } });
      const allTasks = res.data.tasks || [];
      const contentTasks = allTasks
        .filter((task) => ['reel', 'poster', 'video', 'content'].includes(task.taskType))
        .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
      setTasks(contentTasks);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load content calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return tasks;

    return tasks.filter((task) => {
      const haystack = [
        task.title,
        task.description,
        task.client?.name,
        task.client?.company,
        task.project?.name,
        task.taskType,
        task.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [tasks, searchTerm]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date) => filteredTasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date));

  const selectedDateTasks = useMemo(
    () => (selectedDate ? getTasksForDate(selectedDate) : []),
    [selectedDate, filteredTasks],
  );

  const scheduledThisMonth = filteredTasks.filter(
    (task) => task.dueDate && isSameMonth(new Date(task.dueDate), currentDate),
  ).length;
  const inReviewCount = filteredTasks.filter((task) => task.status === 'In Review').length;
  const overdueCount = filteredTasks.filter(
    (task) => task.dueDate && isBefore(startOfDay(new Date(task.dueDate)), startOfDay(new Date())) && !['Done', 'Approved'].includes(task.status),
  ).length;
  const readyThisWeek = filteredTasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = startOfDay(new Date(task.dueDate));
    const today = startOfDay(new Date());
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    return dueDate >= today && dueDate <= weekEnd;
  }).length;

  const openDateDetails = (date) => {
    const dateTasks = getTasksForDate(date);

    if (dateTasks.length === 0) {
      if (canManageContent) {
        setSelectedTask(null);
        setDraftDueDate(format(date, 'yyyy-MM-dd'));
        setShowAddModal(true);
      }
      return;
    }

    setSelectedDate(date);
    setShowDetailModal(true);
  };

  const handleEditTask = (task) => {
    setDraftDueDate('');
    setSelectedTask(task);
    setShowDetailModal(false);
    setShowAddModal(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setDraftDueDate('');
    setShowAddModal(true);
  };

  const handleViewTaskDetail = (task) => {
    setSelectedTaskId(task._id);
    setShowDetailModal(false);
    setShowTaskDetail(true);
  };

  const listTasks = useMemo(
    () => [...filteredTasks].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)),
    [filteredTasks],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content Operations"
        title="Plan content delivery without losing schedule clarity."
        description="Manage reels, posters, videos, and production tasks in a calendar that gives deadlines, review stages, and workload a clearer structure."
        actions={(
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="inline-flex items-center rounded-2xl border border-border bg-card p-1 shadow-sm">
              <button
                onClick={() => setView('calendar')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
                  view === 'calendar'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <LayoutGrid size={16} />
                Calendar
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
                  view === 'list'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <List size={16} />
                List
              </button>
            </div>

            {canManageContent ? (
              <Button onClick={handleCreateTask} className="w-full justify-center sm:w-auto">
                <Plus size={16} className="mr-2" />
                Schedule Content
              </Button>
            ) : null}
          </div>
        )}
      >
        <MetricGrid>
          <MetricCard label="Scheduled Items" value={filteredTasks.length} helper="Visible in the current search scope" icon={CalendarDays} tone="primary" />
          <MetricCard label="This Month" value={scheduledThisMonth} helper={`Scheduled in ${format(currentDate, 'MMMM')}`} icon={Sparkles} tone="info" />
          <MetricCard label="In Review" value={inReviewCount} helper="Waiting on approval or next revision" icon={Clock3} tone="warning" />
          <MetricCard label="Overdue" value={overdueCount} helper={`${readyThisWeek} more due this week`} icon={CalendarDays} tone={overdueCount > 0 ? 'danger' : 'success'} />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search content titles, clients, projects, types, or statuses..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="app-pill">{view === 'calendar' ? 'Calendar view' : 'List view'}</div>
          <div className="app-pill">{filteredTasks.length} scheduled items</div>
        </div>
      </PageToolbar>

      {view === 'calendar' ? (
        <SectionCard
          title={format(currentDate, 'MMMM yyyy')}
          description="Click a day to review scheduled items. Empty days can be used to schedule new content."
          action={(
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        >
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-40 animate-pulse rounded-[24px] border border-border bg-secondary/50" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-border">
              <div className="grid grid-cols-7 border-b border-border bg-secondary/40">
                {DAY_NAMES.map((day) => (
                  <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => openDateDetails(day)}
                      className={cn(
                        'min-h-[152px] border-b border-r border-border p-3 text-left align-top transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20',
                        !isCurrentMonth && 'bg-secondary/20 text-muted-foreground',
                        isToday(day) && 'bg-primary/5',
                        dayTasks.length > 0 ? 'hover:bg-secondary/35' : 'hover:bg-secondary/20',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                            isToday(day) ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground',
                          )}
                        >
                          {format(day, 'd')}
                        </div>
                        {dayTasks.length > 0 ? (
                          <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                            {dayTasks.length}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 space-y-2">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task._id}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleViewTaskDetail(task);
                            }}
                            className="rounded-2xl border border-border bg-background/90 px-2.5 py-2 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-background"
                          >
                            <p className="truncate text-xs font-semibold text-foreground">{task.title}</p>
                            <p className="mt-1 truncate text-[11px] text-muted-foreground">
                              {task.client?.name || task.project?.name || formatTaskType(task.taskType)}
                            </p>
                          </div>
                        ))}

                        {dayTasks.length > 2 ? (
                          <div className="text-xs font-semibold text-primary">
                            +{dayTasks.length - 2} more scheduled
                          </div>
                        ) : null}

                        {dayTasks.length === 0 ? (
                          <div className="pt-6 text-xs leading-5 text-muted-foreground">
                            {canManageContent ? 'Click to schedule content for this day.' : 'No scheduled content.'}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>
      ) : (
        <SectionCard
          title="Scheduled Content"
          description="A clean list view for scanning upcoming deliverables, client context, and production status."
          action={<div className="app-pill">{listTasks.length} items</div>}
        >
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-44 animate-pulse rounded-[24px] border border-border bg-secondary/50" />
              ))}
            </div>
          ) : listTasks.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {listTasks.map((task) => (
                <article
                  key={task._id}
                  onClick={() => handleViewTaskDetail(task)}
                  className="group cursor-pointer rounded-[24px] border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={taskTypeTone[task.taskType] || 'neutral'}>
                          {formatTaskType(task.taskType)}
                        </StatusBadge>
                        <StatusBadge tone={statusTone[task.status] || 'neutral'}>
                          {task.status}
                        </StatusBadge>
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                        {task.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {task.description || 'No detailed brief has been added yet.'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-secondary px-3 py-2 text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Due</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Unscheduled'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{task.client?.name || 'No client linked'}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Assigned To</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {Array.isArray(task.assignedTo)
                          ? task.assignedTo.map((assignee) => assignee.name).join(', ') || 'Unassigned'
                          : task.assignedTo?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No scheduled content found"
              description="Try a broader search or schedule a new item to start building a cleaner delivery calendar."
              action={canManageContent ? (
                <Button onClick={handleCreateTask}>
                  <Plus size={16} className="mr-2" />
                  Schedule Content
                </Button>
              ) : null}
            />
          )}
        </SectionCard>
      )}

      <AddTaskModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);

          if (!open) {
            setSelectedTask(null);
            setDraftDueDate('');
            fetchTasks();
          }
        }}
        task={selectedTask}
        initialValues={{
          taskType: 'content',
          status: 'To Do',
          isClientVisible: true,
          dueDate: draftDueDate,
        }}
      />

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-3xl">
          <div className="border-b border-border bg-gradient-to-br from-background via-background to-secondary/60 px-6 py-5">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-2xl tracking-tight">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Scheduled Content'}
              </DialogTitle>
              <DialogDescription>
                {selectedDateTasks.length} scheduled {selectedDateTasks.length === 1 ? 'item' : 'items'} for this day.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="max-h-[calc(85vh-112px)] overflow-y-auto px-6 py-5">
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-4">
                {selectedDateTasks.map((task) => (
                  <article key={task._id} className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone={taskTypeTone[task.taskType] || 'neutral'}>
                            {formatTaskType(task.taskType)}
                          </StatusBadge>
                          <StatusBadge tone={statusTone[task.status] || 'neutral'}>
                            {task.status}
                          </StatusBadge>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-foreground">{task.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {task.description || 'No description added yet.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => handleViewTaskDetail(task)}>
                          View Details
                        </Button>
                        {canManageContent ? (
                          <Button variant="outline" onClick={() => handleEditTask(task)}>
                            Edit Task
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{task.client?.name || 'No client linked'}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{task.project?.name || 'No project linked'}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Assigned To</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {Array.isArray(task.assignedTo)
                            ? task.assignedTo.map((assignee) => assignee.name).join(', ') || 'Unassigned'
                            : task.assignedTo?.name || 'Unassigned'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Due Date</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Not scheduled'}
                        </p>
                      </div>
                    </div>

                    {task.tags && task.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.tags.map((tag, index) => (
                          <span key={`${tag}-${index}`} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing scheduled for this day"
                description="This date does not have any content tasks yet."
                action={canManageContent ? (
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedTask(null);
                      setDraftDueDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
                      setShowAddModal(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Schedule Content
                  </Button>
                ) : null}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TaskDetailModal
        taskId={selectedTaskId}
        open={showTaskDetail}
        onOpenChange={setShowTaskDetail}
      />
    </div>
  );
};

export default ContentCalendar;
