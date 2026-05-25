import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, Clock, ListChecks, Plus, TimerReset } from 'lucide-react';
import { useTasks, useDeleteTask, useUpdateTaskStatus } from '../../hooks/useTasks';
import { AddTaskModal } from '../../components/modals/AddTaskModal';
import { TaskDetailModal } from '../../components/ui/TaskDetailModal';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { MetricCard, MetricGrid, PageHeader, PageToolbar, SearchField, StatusBadge } from '../../components/ui/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusTone = {
  'To Do': 'neutral',
  'In Progress': 'info',
  'In Review': 'warning',
  Done: 'success',
  Blocked: 'danger',
};

const priorityTone = {
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Urgent: 'danger',
};

const Tasks = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useSelector((state) => state.auth);
  const isEmployee = user?.role === 'employee';

  const { data: tasks = [], isLoading } = useTasks({ search: searchTerm, status: statusFilter });
  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();

  const taskMetrics = {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === 'In Progress').length,
    done: tasks.filter((task) => task.status === 'Done').length,
    overdue: tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done').length,
  };

  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.project?.name || 'No project linked'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => updateStatusMutation.mutate({ id: row._id, status: event.target.value })}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option>To Do</option>
          <option>In Progress</option>
          <option>In Review</option>
          <option>Done</option>
          <option>Blocked</option>
        </select>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => (
        <StatusBadge tone={priorityTone[row.priority] || 'neutral'}>
          {row.priority}
        </StatusBadge>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'Not set',
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (row) => (
        row.assignedTo && row.assignedTo.length > 0 ? (
          <div className="flex -space-x-2">
            {row.assignedTo.slice(0, 3).map((assignee) => (
              <div
                key={assignee._id}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-card bg-primary/15 text-[11px] font-bold text-primary"
                title={assignee.name}
              >
                {assignee.name?.charAt(0)}
              </div>
            ))}
            {row.assignedTo.length > 3 ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-card bg-primary/15 text-[11px] font-bold text-primary">
                +{row.assignedTo.length - 3}
              </div>
            ) : null}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )
      ),
    },
  ];

  const handleDeleteTask = async () => {
    if (deleteTaskId) {
      await deleteTaskMutation.mutateAsync(deleteTaskId);
      setDeleteTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEmployee ? 'Personal Workflow' : 'Task Operations'}
        title={isEmployee ? 'Stay on top of assigned work.' : 'Manage team delivery with clarity.'}
        description={isEmployee
          ? 'Review what is due, log progress, and keep momentum visible for the rest of the team.'
          : 'Track task volume, assignment coverage, and progress updates without losing the operational picture.'}
        actions={!isEmployee ? (
          <Button
            onClick={() => {
              setSelectedTask(null);
              setShowAddModal(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        ) : null}
      >
        <MetricGrid>
          <MetricCard label="Assigned" value={taskMetrics.total} helper="Tasks in the current filtered view" icon={ListChecks} tone="info" />
          <MetricCard label="In Progress" value={taskMetrics.inProgress} helper="Active work underway right now" icon={Clock} tone="warning" />
          <MetricCard label="Completed" value={taskMetrics.done} helper="Closed tasks ready to archive" icon={CheckCircle2} tone="success" />
          <MetricCard label="Overdue" value={taskMetrics.overdue} helper="Needs immediate attention" icon={TimerReset} tone={taskMetrics.overdue > 0 ? 'danger' : 'neutral'} />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search tasks, projects, or assignees..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="app-pill">{tasks.length} tasks</div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </PageToolbar>

      <DataTable
        data={tasks}
        columns={columns}
        loading={isLoading}
        onRowClick={(task) => {
          setSelectedTaskId(task._id);
          setShowTaskDetail(true);
        }}
        onEdit={isEmployee ? null : (task) => {
          setSelectedTask(task);
          setShowAddModal(true);
        }}
        onDelete={isEmployee ? null : (id) => setDeleteTaskId(id)}
        emptyTitle="No tasks match this view"
        emptyDescription="Try a different search or create a new task to get work moving."
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        open={showTaskDetail}
        onOpenChange={setShowTaskDetail}
      />

      <AddTaskModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        task={selectedTask}
      />

      <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
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

export default Tasks;
