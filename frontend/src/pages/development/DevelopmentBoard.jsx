import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { devApi } from '../../api/development';
import { DevelopmentSubNav } from '../../components/development/DevelopmentSubNav';
import { PageHeader } from '../../components/ui/page';
import { TaskDetailModal } from '../../components/ui/TaskDetailModal';
import { AddTaskModal } from '../../components/modals/AddTaskModal';
import {
  Kanban,
  Search,
  Filter,
  PlusCircle,
  RefreshCcw,
  ShieldAlert,
  GitPullRequest,
  Bug,
  Calendar,
  Briefcase,
  User,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  Flame,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const PIPELINE_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'border-slate-500/30 bg-slate-500/5' },
  { id: 'analysis', title: 'Analysis', color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'ready_for_dev', title: 'Ready for Dev', color: 'border-indigo-500/30 bg-indigo-500/5' },
  { id: 'in_development', title: 'In Development', color: 'border-amber-500/30 bg-amber-500/5' },
  { id: 'code_review', title: 'Code Review', color: 'border-purple-500/30 bg-purple-500/5' },
  { id: 'qa_testing', title: 'QA / Testing', color: 'border-cyan-500/30 bg-cyan-500/5' },
  { id: 'client_uat', title: 'Client / UAT', color: 'border-teal-500/30 bg-teal-500/5' },
  { id: 'approved', title: 'Approved', color: 'border-emerald-500/30 bg-emerald-500/5' },
  { id: 'deployment', title: 'Deployment', color: 'border-sky-500/30 bg-sky-500/5' },
  { id: 'live', title: 'Live', color: 'border-green-500/30 bg-green-500/5' },
  { id: 'closed', title: 'Closed', color: 'border-gray-500/30 bg-gray-500/5' },
];

const PRIORITY_BADGES = {
  urgent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
  high: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  medium: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  low: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

export default function DevelopmentBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState([]);

  // Filters
  const [filterSprint, setFilterSprint] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterBlockedOnly, setFilterBlockedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Task detail & Add task modal states
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Blocked modal state
  const [blockingTask, setBlockingTask] = useState(null);
  const [blockedReasonInput, setBlockedReasonInput] = useState('');

  // Fetch Sprints & Tasks
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, sprintsRes] = await Promise.all([
        devApi.getTasks({
          sprint: filterSprint || undefined,
          project: filterProject || undefined,
          isBlocked: filterBlockedOnly ? 'true' : undefined,
          search: searchQuery.trim() || undefined,
        }),
        devApi.getSprints().catch(() => ({ data: { data: [] } })),
      ]);

      if (tasksRes.data?.success) {
        setTasks(tasksRes.data.data || []);
      }
      if (sprintsRes.data?.success) {
        setSprints(sprintsRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load board data:', err);
      toast.error('Failed to load development tasks');
    } finally {
      setLoading(false);
    }
  }, [filterSprint, filterProject, filterBlockedOnly, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle stage transition
  const handleStageChange = async (taskId, newStage) => {
    try {
      await devApi.updateStage(taskId, { stage: newStage });
      toast.success(`Task moved to ${newStage.replace(/_/g, ' ')}`);
      fetchData();
    } catch (err) {
      console.error('Failed to update stage:', err);
      toast.error(err.response?.data?.message || 'Failed to move task');
    }
  };

  // Handle Block / Unblock
  const handleToggleBlock = async (task) => {
    const isCurrentlyBlocked = task.development?.isBlocked || task.development?.stage === 'blocked';
    if (isCurrentlyBlocked) {
      // Unblock
      try {
        await devApi.toggleBlocked(task._id, { isBlocked: false });
        toast.success('Task unblocked');
        fetchData();
      } catch (err) {
        toast.error('Failed to unblock task');
      }
    } else {
      // Prompt block reason
      setBlockingTask(task);
      setBlockedReasonInput('');
    }
  };

  const confirmBlock = async () => {
    if (!blockingTask) return;
    try {
      await devApi.toggleBlocked(blockingTask._id, {
        isBlocked: true,
        blockedReason: blockedReasonInput || 'Blocked by team',
      });
      toast.success('Task marked as Blocked');
      setBlockingTask(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to block task');
    }
  };

  // Group tasks by column stage
  const groupedTasks = useMemo(() => {
    const map = {};
    PIPELINE_COLUMNS.forEach((col) => {
      map[col.id] = [];
    });

    tasks.forEach((t) => {
      const stage = t.development?.stage || 'backlog';
      if (map[stage]) {
        map[stage].push(t);
      } else {
        map['backlog'].push(t);
      }
    });

    return map;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Development Board"
        subtitle="Track and transition existing CRM tasks across all stages of the development pipeline"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border text-foreground font-semibold rounded-xl text-xs hover:bg-secondary/80 transition-all shadow-xs"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {/* ── RULE: Uses existing task creation modal ─────────── */}
            <button
              id="dev-create-task-btn"
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-md shadow-primary/25 hover:opacity-95 transition-all"
            >
              <PlusCircle size={14} />
              Add Task
            </button>
          </div>
        }
      />

      <DevelopmentSubNav />

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search title, branch, PR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="app-input w-full pl-8 text-xs"
            />
          </div>

          {/* Sprint Filter */}
          <div>
            <select
              value={filterSprint}
              onChange={(e) => setFilterSprint(e.target.value)}
              className="app-select w-full text-xs"
            >
              <option value="">All Sprints</option>
              {sprints.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          {/* Blocked Only Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground select-none p-2 rounded-xl bg-secondary/40 border border-border w-full">
              <input
                type="checkbox"
                checked={filterBlockedOnly}
                onChange={(e) => setFilterBlockedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <ShieldAlert size={14} /> Blocked Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Kanban Columns Horizon ───────────────────────────────────── */}
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex items-start gap-3 min-w-[2800px] pt-1">
          {PIPELINE_COLUMNS.map((column) => {
            const colTasks = groupedTasks[column.id] || [];

            return (
              <div
                key={column.id}
                className={`w-[250px] rounded-2xl border p-3 flex flex-col shrink-0 min-h-[500px] transition-all ${column.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-xs uppercase tracking-wider">
                      {column.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-card border border-border text-foreground font-mono">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Task Cards Container */}
                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground/50 text-[11px] italic">
                      No tasks in this stage
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const dev = task.development || {};
                      const isBlocked = dev.isBlocked || dev.stage === 'blocked';
                      const devUser = dev.developer || (task.assignedTo && task.assignedTo[0]);

                      return (
                        <div
                          key={task._id}
                          className={`p-3 bg-card border rounded-xl shadow-xs space-y-2 hover:shadow-md transition-all group relative cursor-pointer ${
                            isBlocked ? 'border-rose-500/50 bg-rose-500/5' : 'border-border'
                          }`}
                          onClick={() => {
                            setSelectedTaskId(task._id);
                            setShowTaskDetail(true);
                          }}
                        >
                          {/* Blocked Alert Banner */}
                          {isBlocked && (
                            <div className="px-2 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <ShieldAlert size={11} /> BLOCKED
                              </span>
                              <span className="truncate max-w-[120px]" title={dev.blockedReason}>
                                {dev.blockedReason || 'Waiting on team'}
                              </span>
                            </div>
                          )}

                          {/* Task Badges (Project / Priority / Bug) */}
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded truncate max-w-[130px]">
                              {task.project?.name || 'CRM Task'}
                            </span>
                            <div className="flex items-center gap-1">
                              {dev.isBug && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold flex items-center gap-0.5">
                                  <Bug size={9} /> Bug
                                </span>
                              )}
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  PRIORITY_BADGES[task.priority?.toLowerCase()] || PRIORITY_BADGES.medium
                                }`}
                              >
                                {task.priority || 'Medium'}
                              </span>
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="font-bold text-foreground text-xs leading-snug line-clamp-2 hover:text-primary transition-colors">
                            {task.title}
                          </h4>

                          {/* Git Branch / PR Badges if present */}
                          {(dev.branch || dev.pullRequestNumber || dev.pullRequestUrl) && (
                            <div className="flex items-center gap-1 flex-wrap pt-0.5">
                              {dev.branch && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-secondary text-muted-foreground rounded truncate max-w-[110px]">
                                  🌿 {dev.branch}
                                </span>
                              )}
                              {(dev.pullRequestNumber || dev.pullRequestUrl) && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded flex items-center gap-0.5">
                                  <GitPullRequest size={9} /> #{dev.pullRequestNumber || 'PR'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Card Footer: Assignee & Stage Move Dropdown */}
                          <div
                            className="flex items-center justify-between pt-1 border-t border-border text-[10px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Assignee */}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px]">
                                {devUser?.name ? devUser.name.charAt(0) : <User size={10} />}
                              </div>
                              <span className="truncate max-w-[80px]">
                                {devUser?.name || 'Unassigned'}
                              </span>
                            </div>

                            {/* Quick Stage Move Dropdown */}
                            <select
                              value={dev.stage || column.id}
                              onChange={(e) => handleStageChange(task._id, e.target.value)}
                              className="bg-secondary/70 border border-border rounded text-[10px] font-bold text-foreground py-0.5 px-1 outline-none hover:bg-secondary cursor-pointer"
                              title="Move task to stage"
                            >
                              {PIPELINE_COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Block Reason Modal ───────────────────────────────────────── */}
      {blockingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-500 font-bold">
              <ShieldAlert size={18} />
              <h3>Mark Task as Blocked</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide a reason why "{blockingTask.title}" is blocked (e.g. Waiting on third-party API keys, design review).
            </p>
            <textarea
              rows={3}
              placeholder="Enter blocked reason..."
              value={blockedReasonInput}
              onChange={(e) => setBlockedReasonInput(e.target.value)}
              className="w-full p-2.5 bg-background border border-border rounded-xl text-xs outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockingTask(null)}
                className="app-button-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBlock}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Existing Task Detail Modal (Reused directly) ─────────────── */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          open={showTaskDetail}
          onOpenChange={(isOpen) => {
            setShowTaskDetail(isOpen);
            if (!isOpen) {
              setSelectedTaskId(null);
              fetchData();
            }
          }}
        />
      )}

      {/* ── Existing Task Creation Modal (Reused directly) ───────────── */}
      {showAddTaskModal && (
        <AddTaskModal
          open={showAddTaskModal}
          onOpenChange={(isOpen) => {
            setShowAddTaskModal(isOpen);
            if (!isOpen) {
              fetchData();
            }
          }}
        />
      )}
    </div>
  );
}
