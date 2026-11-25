// =============================================
// DAILY TASKS WIDGET
// Interactive Daily Work Focus Section with live timer,
// from-to dates, status progression, and manager assignment.
// =============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
  FolderOpen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Filter,
  Sparkles,
  Scissors,
  Camera,
  Share2,
  FileText,
  Check,
  RotateCcw,
  Square,
  CheckSquare,
  ListChecks,
  Minus,
  Timer,
  X,
  Zap,
} from '@/components/ui/muiIcons';
import {
  useDailyTasks,
  useStartDailyTaskTimer,
  useStopDailyTaskTimer,
  useUpdateDailyTaskStatus,
  useToggleDailyTaskChecklist,
  useDeleteDailyTask,
  useCreateQuickDailyTask,
} from '../../hooks/useDailyTasks';
import { useUsers } from '../../hooks/useUsers';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { AddDailyTaskModal } from './AddDailyTaskModal';
import { SelectDropdown } from '../ui/SelectDropdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TaskDetailModal } from '../ui/TaskDetailModal';

export const formatTimerDisplay = (totalSeconds = 0) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatClock12h = (hhmm = '') => {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 || 12;
  return `${hr12}:${m.toString().padStart(2, '0')} ${suffix}`;
};

const addMinutesToClock = (hhmm = '', deltaMins = 0) => {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const total = ((h * 60 + m + deltaMins) % (24 * 60) + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60).toString().padStart(2, '0');
  const nm = (total % 60).toString().padStart(2, '0');
  return `${nh}:${nm}`;
};

const diffClockMinutes = (startHHMM = '', endHHMM = '') => {
  if (!/^\d{2}:\d{2}$/.test(startHHMM) || !/^\d{2}:\d{2}$/.test(endHHMM)) return null;
  const [sh, sm] = startHHMM.split(':').map(Number);
  const [eh, em] = endHHMM.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return diff;
};

const QUICK_CATEGORIES = [
  'General',
  'Video Edit',
  'Shoot',
  'SMM / Post',
  'Design',
  'Client Call',
  'Dev / Fix',
  'Admin',
];

const DURATION_PRESETS = [
  { label: '15m', mins: 15 },
  { label: '30m', mins: 30 },
  { label: '45m', mins: 45 },
  { label: '1h', mins: 60 },
  { label: '1.5h', mins: 90 },
  { label: '2h', mins: 120 },
  { label: '4h', mins: 240 },
];

export const DailyTasksWidget = ({
  currentUser,
  isManagerOrAdmin = false,
  className = '',
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedUserId, setSelectedUserId] = useState(currentUser?._id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [quickCategory, setQuickCategory] = useState('General');
  const [quickHours, setQuickHours] = useState(0);
  const [quickMinutes, setQuickMinutes] = useState(30);
  const [quickStartTime, setQuickStartTime] = useState('');
  const [quickEndTime, setQuickEndTime] = useState('');
  const [quickClientId, setQuickClientId] = useState('');
  const [quickProjectId, setQuickProjectId] = useState('');
  const [quickAssigneeId, setQuickAssigneeId] = useState('');
  const [quickChecklist, setQuickChecklist] = useState([]);
  const [quickStepInput, setQuickStepInput] = useState('');
  const [quickStartImmediately, setQuickStartImmediately] = useState(false);
  const [quickNotes, setQuickNotes] = useState('');
  const [selectedTaskDetailId, setSelectedTaskDetailId] = useState(null);

  // Local live ticking clock state
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: usersData = [] } = useUsers();
  const staffUsers = useMemo(() => {
    const list = Array.isArray(usersData) ? usersData : usersData?.users || [];
    return list.filter((u) => u.role !== 'client');
  }, [usersData]);

  const { data: clientsData = [] } = useClients({}, { enabled: showQuickModal });
  const { data: projectsData = [] } = useProjects({}, { enabled: showQuickModal });

  const clientsList = useMemo(() => {
    return Array.isArray(clientsData) ? clientsData : clientsData?.clients || [];
  }, [clientsData]);

  const filteredQuickProjects = useMemo(() => {
    const list = Array.isArray(projectsData) ? projectsData : projectsData?.projects || [];
    if (!quickClientId) return list;
    return list.filter((p) => (p.client?._id || p.client) === quickClientId);
  }, [projectsData, quickClientId]);

  // Target user for query: either manager's selected user, or current user
  const effectiveUserId = isManagerOrAdmin && selectedUserId ? selectedUserId : currentUser?._id;
  const targetUserObj = useMemo(() => {
    return staffUsers.find((u) => u._id === effectiveUserId) || currentUser;
  }, [staffUsers, effectiveUserId, currentUser]);

  const { data: dailyData, isLoading, refetch } = useDailyTasks(
    selectedDate,
    effectiveUserId
  );

  const startTimerMutation = useStartDailyTaskTimer();
  const stopTimerMutation = useStopDailyTaskTimer();
  const updateStatusMutation = useUpdateDailyTaskStatus();
  const toggleChecklistMutation = useToggleDailyTaskChecklist();
  const deleteDailyTaskMutation = useDeleteDailyTask();
  const createQuickTaskMutation = useCreateQuickDailyTask();

  const tasks = dailyData?.tasks || [];
  const stats = dailyData?.stats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    totalTimeSpentSeconds: 0,
  };

  // Day navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isSelectedDateToday = useMemo(() => {
    return selectedDate === new Date().toISOString().split('T')[0];
  }, [selectedDate]);

  const readableDate = useMemo(() => {
    const parts = selectedDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  const resetQuickForm = () => {
    setQuickTitle('');
    setQuickPriority('medium');
    setQuickCategory('General');
    setQuickHours(0);
    setQuickMinutes(30);
    setQuickStartTime('');
    setQuickEndTime('');
    setQuickClientId('');
    setQuickProjectId('');
    setQuickAssigneeId('');
    setQuickChecklist([]);
    setQuickStepInput('');
    setQuickStartImmediately(false);
    setQuickNotes('');
  };

  const applyTotalDurationMins = (totalMins, syncEndFromStart = true) => {
    const safeTotal = Math.max(0, Math.min(24 * 60, Number(totalMins) || 0));
    const h = Math.floor(safeTotal / 60);
    const m = safeTotal % 60;
    setQuickHours(h);
    setQuickMinutes(m);
    if (syncEndFromStart && quickStartTime && safeTotal > 0) {
      setQuickEndTime(addMinutesToClock(quickStartTime, safeTotal));
    }
  };

  const handleStartTimeChange = (newStart) => {
    setQuickStartTime(newStart);
    if (!newStart) return;
    const curTotal = (Number(quickHours) || 0) * 60 + (Number(quickMinutes) || 0);
    if (quickEndTime && curTotal === 0) {
      const diff = diffClockMinutes(newStart, quickEndTime);
      if (diff && diff > 0) applyTotalDurationMins(diff, false);
    } else if (curTotal > 0) {
      setQuickEndTime(addMinutesToClock(newStart, curTotal));
    }
  };

  const handleEndTimeChange = (newEnd) => {
    setQuickEndTime(newEnd);
    if (quickStartTime && newEnd) {
      const diff = diffClockMinutes(quickStartTime, newEnd);
      if (diff !== null && diff > 0) {
        applyTotalDurationMins(diff, false);
      }
    }
  };

  const handleSetClockNow = () => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const nowClock = `${hh}:${mm}`;
    setQuickStartTime(nowClock);
    const curTotal = (Number(quickHours) || 0) * 60 + (Number(quickMinutes) || 0);
    const mins = curTotal > 0 ? curTotal : 30;
    if (curTotal === 0) {
      setQuickHours(0);
      setQuickMinutes(30);
    }
    setQuickEndTime(addMinutesToClock(nowClock, mins));
  };

  const handleAddQuickStep = () => {
    const trimmed = quickStepInput.trim();
    if (!trimmed) return;
    setQuickChecklist((prev) => [...prev, { text: trimmed, isCompleted: false }]);
    setQuickStepInput('');
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const pendingSteps = quickStepInput.trim()
      ? [...quickChecklist, { text: quickStepInput.trim(), isCompleted: false }]
      : quickChecklist;

    try {
      await createQuickTaskMutation.mutateAsync({
        title: quickTitle.trim(),
        userId: (isManagerOrAdmin && quickAssigneeId) ? quickAssigneeId : effectiveUserId,
        date: selectedDate,
        priority: quickPriority,
        category: quickCategory,
        roleLabel: quickCategory,
        allocatedHours: Number(quickHours) || 0,
        allocatedMinutes: Number(quickMinutes) || 0,
        startTime: quickStartTime,
        endTime: quickEndTime,
        clientId: quickClientId || null,
        projectId: quickProjectId || null,
        checklist: pendingSteps,
        startImmediately: quickStartImmediately,
        notes: quickNotes,
      });
      resetQuickForm();
      setShowQuickModal(false);
    } catch (err) {
      // handled in hook
    }
  };

  const getRoleIcon = (roleLabel = '') => {
    const norm = roleLabel.toLowerCase();
    if (norm.includes('edit')) return Scissors;
    if (norm.includes('shoot') || norm.includes('video')) return Camera;
    if (norm.includes('smm') || norm.includes('post')) return Share2;
    return FileText;
  };

  return (
    <div className={`rounded-3xl bg-card border border-border/40 p-4 sm:p-6 space-y-5 shadow-xs transition-all ${className}`}>
      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <CheckSquare size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Daily Work Tasks
              </h2>
              {isManagerOrAdmin && targetUserObj && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-xs font-semibold text-foreground">
                  <User size={11} className="text-primary" />
                  <span>{targetUserObj.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date Navigator & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Day Navigator */}
          <div className="flex items-center rounded-xl bg-secondary/50 p-1">
            <button
              type="button"
              onClick={handlePrevDay}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                isSelectedDateToday
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-foreground hover:bg-card'
              }`}
            >
              {readableDate}
            </button>

            <button
              type="button"
              onClick={handleNextDay}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Manager Employee Switcher */}
          {isManagerOrAdmin && staffUsers.length > 0 && (
            <div className="min-w-[170px]">
              <SelectDropdown
                value={selectedUserId}
                onChange={(val) => setSelectedUserId(val || currentUser?._id)}
                options={staffUsers.map((u) => ({
                  value: u._id,
                  label: u._id === currentUser?._id ? `My Tasks (${u.name})` : u.name,
                  subLabel: u.position || u.role,
                }))}
                allowCustom={false}
                allowDeselect={false}
                className="w-full"
                buttonClassName="h-9 bg-secondary/50 text-xs font-semibold rounded-xl"
              />
            </div>
          )}

          {/* Action Buttons */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Add from Assigned</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuickModal(true)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Quick Task</span>
          </button>
        </div>
      </div>

      {/* ── DAILY SUMMARY BAR ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Daily Tasks
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-foreground tabular-nums">
            {stats.total}
          </div>
          <span className="text-[11px] text-muted-foreground">Planned for Day</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            In Progress
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-primary tabular-nums">
            {stats.inProgress}
          </div>
          <span className="text-[11px] text-muted-foreground">Currently Working</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Completed
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.completed}
          </div>
          <span className="text-[11px] text-muted-foreground">Finished Work</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Time Logged Today
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-foreground tabular-nums flex items-center gap-1.5">
            <Clock size={16} className="text-primary shrink-0" />
            <span>{formatTimerDisplay(stats.totalTimeSpentSeconds)}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Live Working Hours</span>
        </div>
      </div>

      {/* ── DAILY TASKS LIST ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Loading daily tasks…
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 sm:p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                No Daily Tasks Added for {readableDate}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Select from your assigned tasks (with from–to dates) to schedule your daily work focus and track time with the live timer.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Add from Assigned Tasks</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQuickModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Quick Task</span>
              </button>
            </div>
          </div>
        ) : (
          tasks.map((item) => {
            const isTimerRunning = Boolean(item.timerRunning);
            let liveSeconds = item.timeSpentSeconds || 0;
            if (isTimerRunning && item.timerStartedAt) {
              const extra = Math.max(0, Math.floor((nowTimestamp - new Date(item.timerStartedAt).getTime()) / 1000));
              liveSeconds += extra;
            }

            const RoleIcon = getRoleIcon(item.roleLabel);
            const isCompleted = item.status === 'completed' || item.status === 'done';

            return (
              <div
                key={item._id}
                className={`group rounded-2xl p-4 sm:p-4.5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                  isTimerRunning
                    ? 'bg-primary/5 border-primary/40 shadow-[0_0_15px_-3px_hsl(var(--brand)/0.2)]'
                    : isCompleted
                    ? 'bg-secondary/15 border-border/30 opacity-75'
                    : 'bg-card border-border/40 hover:border-border/80'
                }`}
              >
                {/* Left: Check toggle + Content details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      const next = isCompleted ? 'todo' : 'completed';
                      updateStatusMutation.mutate({ id: item._id, status: next });
                    }}
                    className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-border/70 hover:border-primary text-transparent'
                    }`}
                    title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                  >
                    <Check size={14} className={isCompleted ? 'stroke-[3]' : 'opacity-0'} />
                  </button>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold text-muted-foreground shrink-0">
                        <RoleIcon size={11} className="text-primary" />
                        <span>{item.roleLabel || 'Assignee'}</span>
                      </span>

                      {item.priority && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            item.priority === 'urgent'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : item.priority === 'high'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          {item.priority}
                        </span>
                      )}

                      <h4
                        onClick={() => {
                          if (item.task?._id || item.task) {
                            setSelectedTaskDetailId(item.task?._id || item.task);
                          }
                        }}
                        className={`text-xs sm:text-sm font-bold text-foreground hover:underline cursor-pointer transition-colors truncate ${
                          isCompleted ? 'line-through text-muted-foreground' : ''
                        }`}
                        title="Click to view task details"
                      >
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
                      {item.clientName && (
                        <span className="inline-flex items-center gap-1 text-foreground/80 font-medium">
                          <Building2 size={11} className="text-muted-foreground" />
                          <span className="truncate">{item.clientName}</span>
                        </span>
                      )}

                      {item.projectName && (
                        <span className="inline-flex items-center gap-1 text-foreground/80 font-medium">
                          <FolderOpen size={11} className="text-muted-foreground" />
                          <span className="truncate">{item.projectName}</span>
                        </span>
                      )}

                      {/* FROM DATE - TO DATE BADGE */}
                      {item.dateLabel && (
                        <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                          <Calendar size={10} />
                          <span>{item.dateLabel}</span>
                        </span>
                      )}

                      {(item.startTime || item.endTime) && (
                        <span className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md shrink-0">
                          <Clock size={10} />
                          <span>
                            {item.startTime ? formatClock12h(item.startTime) : ''}
                            {item.startTime && item.endTime ? ' – ' : ''}
                            {item.endTime ? formatClock12h(item.endTime) : ''}
                          </span>
                        </span>
                      )}

                      {(item.allocatedHours > 0 || item.allocatedMinutes > 0) && (
                        <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md shrink-0">
                          <Timer size={10} />
                          <span>Target: {item.allocatedHours || 0}h {item.allocatedMinutes || 0}m</span>
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-muted-foreground/90 line-clamp-2 pt-0.5">
                        {item.notes}
                      </p>
                    )}

                    {Array.isArray(item.checklist) && item.checklist.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.checklist.map((step, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => toggleChecklistMutation.mutate({ id: item._id, itemIndex: sIdx })}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                              step.isCompleted
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 line-through opacity-75'
                                : 'bg-secondary/40 border-border/50 text-foreground hover:bg-secondary'
                            }`}
                          >
                            <Check size={10} className={step.isCompleted ? 'text-emerald-500' : 'text-muted-foreground/40'} />
                            <span>{step.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Live Timer Controller & Status Actions */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t border-border/20 md:border-none shrink-0">
                  {/* Live Timer Display & Play/Pause */}
                  <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/30">
                    {isTimerRunning ? (
                      <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    ) : (
                      <Clock size={13} className="text-muted-foreground" />
                    )}

                    <span
                      className={`text-xs font-mono font-extrabold tabular-nums ${
                        isTimerRunning
                          ? 'text-primary'
                          : liveSeconds > 0
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTimerDisplay(liveSeconds)}
                    </span>

                    {/* Timer Button */}
                    {isTimerRunning ? (
                      <button
                        type="button"
                        onClick={() => stopTimerMutation.mutate(item._id)}
                        disabled={stopTimerMutation.isPending}
                        className="p-1 rounded-lg bg-card hover:bg-secondary text-amber-500 transition-colors cursor-pointer"
                        title="Pause Timer"
                      >
                        <Pause size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startTimerMutation.mutate(item._id)}
                        disabled={startTimerMutation.isPending || isCompleted}
                        className="p-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors cursor-pointer disabled:opacity-40"
                        title="Start Timer"
                      >
                        <Play size={14} />
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="w-[125px]">
                    <SelectDropdown
                      value={item.status}
                      onChange={(val) => {
                        if (val && val !== item.status) {
                          updateStatusMutation.mutate({ id: item._id, status: val });
                        }
                      }}
                      options={[
                        { value: 'todo', label: 'To Do' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'review', label: 'Review' },
                        { value: 'completed', label: 'Completed' },
                      ]}
                      allowCustom={false}
                      allowDeselect={false}
                      className="w-full"
                      buttonClassName={`h-8 text-[11px] font-bold rounded-xl ${
                        item.status === 'completed' || item.status === 'done'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : item.status === 'in_progress'
                          ? 'bg-primary/15 text-primary'
                          : item.status === 'review'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-secondary text-foreground'
                      }`}
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => deleteDailyTaskMutation.mutate(item._id)}
                    className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove from Daily Tasks"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddDailyTaskModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          targetUser={targetUserObj}
          currentDateStr={selectedDate}
          onTaskAdded={() => refetch()}
        />
      )}

      {/* Quick Task Modal */}
      {showQuickModal && (
        <Dialog
          open={showQuickModal}
          onOpenChange={(open) => {
            setShowQuickModal(open);
            if (!open) resetQuickForm();
          }}
        >
          <DialogContent size="lg" className="max-w-xl p-0 overflow-hidden rounded-3xl bg-card border border-border/40 shadow-2xl">
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/30 bg-secondary/15">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                    Add Quick Daily Task
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleQuickCreate} className="p-5 sm:p-6 space-y-3.5 max-h-[82vh] overflow-y-auto custom-scrollbar">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finish final color grade for Reel #2..."
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  required
                  autoFocus
                  className="h-10 w-full rounded-xl bg-background border border-border/60 px-3.5 text-xs text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Focus Category Chips */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Category / Focus Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setQuickCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                        quickCategory === cat
                          ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                          : 'bg-background text-muted-foreground border-border/60 hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clock & Time Allocation Block */}
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    <span className="text-xs font-bold text-foreground">Schedule Clock &amp; Duration</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSetClockNow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Timer size={11} />
                    <span>Start Now</span>
                  </button>
                </div>

                {/* Clock Start & End Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Start Time (Clock)
                    </label>
                    <input
                      type="time"
                      value={quickStartTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="h-9 w-full rounded-xl bg-background border border-border/60 px-3 text-xs font-semibold text-foreground tabular-nums focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      End Time (Clock)
                    </label>
                    <input
                      type="time"
                      value={quickEndTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="h-9 w-full rounded-xl bg-background border border-border/60 px-3 text-xs font-semibold text-foreground tabular-nums focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Hours & Minutes Steppers */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Hours
                    </label>
                    <div className="flex items-center h-9 rounded-xl bg-background border border-border/60 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => applyTotalDurationMins(Math.max(0, ((Number(quickHours) || 0) - 1) * 60 + (Number(quickMinutes) || 0)))}
                        className="h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        title="Decrease hours"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={quickHours}
                        onChange={(e) => applyTotalDurationMins(Math.max(0, Math.min(24, Number(e.target.value) || 0)) * 60 + (Number(quickMinutes) || 0))}
                        className="w-full text-center bg-transparent border-0 shadow-none text-xs font-bold text-foreground tabular-nums focus:outline-none focus:ring-0"
                      />
                      <span className="text-[11px] font-semibold text-muted-foreground pr-1">hr</span>
                      <button
                        type="button"
                        onClick={() => applyTotalDurationMins(Math.min(24, (Number(quickHours) || 0) + 1) * 60 + (Number(quickMinutes) || 0))}
                        className="h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        title="Increase hours"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Minutes
                    </label>
                    <div className="flex items-center h-9 rounded-xl bg-background border border-border/60 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => applyTotalDurationMins(Math.max(0, (Number(quickHours) || 0) * 60 + (Number(quickMinutes) || 0) - 5))}
                        className="h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        title="Decrease 5 minutes"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={quickMinutes}
                        onChange={(e) => applyTotalDurationMins((Number(quickHours) || 0) * 60 + Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                        className="w-full text-center bg-transparent border-0 shadow-none text-xs font-bold text-foreground tabular-nums focus:outline-none focus:ring-0"
                      />
                      <span className="text-[11px] font-semibold text-muted-foreground pr-1">min</span>
                      <button
                        type="button"
                        onClick={() => applyTotalDurationMins((Number(quickHours) || 0) * 60 + (Number(quickMinutes) || 0) + 5)}
                        className="h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        title="Increase 5 minutes"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Duration Presets */}
                <div className="flex items-center justify-between flex-wrap gap-1.5 pt-0.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {DURATION_PRESETS.map((preset) => {
                      const active = ((Number(quickHours) || 0) * 60 + (Number(quickMinutes) || 0)) === preset.mins;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyTotalDurationMins(preset.mins)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer border ${
                            active
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  {(quickStartTime || quickEndTime || Number(quickHours) > 0 || Number(quickMinutes) > 0) && (
                    <span className="text-[10px] font-bold text-primary tabular-nums">
                      {quickStartTime ? `${formatClock12h(quickStartTime)}${quickEndTime ? ` – ${formatClock12h(quickEndTime)}` : ''} · ` : ''}
                      {Number(quickHours) || 0}h {Number(quickMinutes) || 0}m
                    </span>
                  )}
                </div>
              </div>

              {/* Priority & Assignee */}
              <div className={`grid gap-3 ${isManagerOrAdmin ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Priority
                  </label>
                  <SelectDropdown
                    value={quickPriority}
                    onChange={(val) => setQuickPriority(val || 'medium')}
                    options={[
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' },
                    ]}
                    allowCustom={false}
                    className="w-full"
                    buttonClassName="h-9 text-xs rounded-xl bg-background border border-border/60"
                  />
                </div>

                {isManagerOrAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Assign To
                    </label>
                    <SelectDropdown
                      value={quickAssigneeId || effectiveUserId}
                      onChange={(val) => setQuickAssigneeId(val || '')}
                      options={staffUsers.map((u) => ({ value: u._id, label: u.name }))}
                      allowCustom={false}
                      className="w-full"
                      buttonClassName="h-9 text-xs rounded-xl bg-background border border-border/60"
                    />
                  </div>
                )}
              </div>

              {/* Optional Client & Project */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Client (Optional)
                  </label>
                  <SelectDropdown
                    value={quickClientId}
                    onChange={(val) => {
                      setQuickClientId(val || '');
                      setQuickProjectId('');
                    }}
                    placeholder="No Client"
                    options={[
                      { value: '', label: 'No Client' },
                      ...clientsList.map((c) => ({ value: c._id, label: c.company || c.name })),
                    ]}
                    allowCustom={false}
                    className="w-full"
                    buttonClassName="h-9 text-xs rounded-xl bg-background border border-border/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Project (Optional)
                  </label>
                  <SelectDropdown
                    value={quickProjectId}
                    onChange={(val) => setQuickProjectId(val || '')}
                    placeholder="No Project"
                    options={[
                      { value: '', label: 'No Project' },
                      ...filteredQuickProjects.map((p) => ({ value: p._id, label: p.name })),
                    ]}
                    allowCustom={false}
                    className="w-full"
                    buttonClassName="h-9 text-xs rounded-xl bg-background border border-border/60"
                  />
                </div>
              </div>

              {/* Quick Subtasks / Checklist */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                  <ListChecks size={13} className="text-primary" />
                  <span>Quick Checklist (Optional)</span>
                </label>
                {quickChecklist.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {quickChecklist.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-secondary/40 text-xs">
                        <span className="truncate font-medium text-foreground">{idx + 1}. {step.text}</span>
                        <button
                          type="button"
                          onClick={() => setQuickChecklist((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-rose-500 cursor-pointer shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add step (press Enter)..."
                    value={quickStepInput}
                    onChange={(e) => setQuickStepInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQuickStep();
                      }
                    }}
                    className="h-9 flex-1 rounded-xl bg-background border border-border/60 px-3 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuickStep}
                    className="h-9 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Add Step
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief note, links, or reminders..."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full rounded-xl bg-background border border-border/60 p-3 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                />
              </div>

              {/* Start Timer Toggle + Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/30">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={quickStartImmediately}
                    onChange={(e) => setQuickStartImmediately(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <span>Start live timer immediately</span>
                </label>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetQuickForm();
                      setShowQuickModal(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createQuickTaskMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Plus size={13} />
                    <span>{createQuickTaskMutation.isPending ? 'Adding…' : 'Add Task'}</span>
                  </button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Task Details Modal */}
      {selectedTaskDetailId && (
        <TaskDetailModal
          isOpen={Boolean(selectedTaskDetailId)}
          onClose={() => setSelectedTaskDetailId(null)}
          taskId={selectedTaskDetailId}
        />
      )}
    </div>
  );
};

export default DailyTasksWidget;
