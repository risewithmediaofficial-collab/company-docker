import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2, Clock, ListChecks, Plus, TimerReset } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { MetricCard, MetricGrid, PageHeader, PageToolbar, SearchField, StatusBadge } from '../../components/ui/page';
import { useClients } from '../../hooks/useClients';
import { useDeleteTask, useTasks, useUpdateTaskStatus } from '../../hooks/useTasks';
import { useUsers } from '../../hooks/useUsers';
import { CONTENT_TASK_TYPE_OPTIONS, NON_CONTENT_TASK_TYPE_OPTIONS, PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, formatTaskTypeLabel, normalizeTaskStatusLabel } from '../../utils/taskFields';

const statusTone = {
  'To Do': 'neutral',
  'On Process': 'info',
  'Waiting for Client': 'warning',
  Completed: 'success',
  Rework: 'danger',
  Approved: 'success',
  'Rework Completed': 'info',
  'Review Required': 'warning',
};

const priorityTone = {
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Urgent: 'danger',
};

const ALL_TASK_TYPES = [...CONTENT_TASK_TYPE_OPTIONS, ...NON_CONTENT_TASK_TYPE_OPTIONS];

const ManagerTaskAssignments = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    search: '',
    client: '',
    assignedManager: '',
    assignedTo: '',
    status: '',
    taskType: '',
    priority: '',
    dueDate: '',
  });

  const { data: tasks = [], isLoading } = useTasks(filters);
  const { data: clients = [] } = useClients();
  const { data: users = [] } = useUsers({ enabled: true });
  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();

  const managerUsers = useMemo(() => users.filter((person) => person.role === 'manager'), [users]);
  const assignableUsers = useMemo(
    () => users.filter((person) => ['superAdmin', 'manager', 'employee'].includes(person.role)),
    [users],
  );

  const normalizedTasks = useMemo(
    () => tasks.map((task) => ({ ...task, status: normalizeTaskStatusLabel(task.status) })),
    [tasks],
  );

  const taskMetrics = {
    total: normalizedTasks.length,
    inProgress: normalizedTasks.filter((task) => task.status === 'On Process').length,
    done: normalizedTasks.filter((task) => ['Completed', 'Approved'].includes(task.status)).length,
    overdue: normalizedTasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && !['Completed', 'Approved'].includes(task.status),
    ).length,
  };

  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.taskTitle || row.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.client?.name || row.client?.company || row.clientName || 'No client linked'}</div>
        </div>
      ),
    },
    {
      key: 'assignedManager',
      label: 'Manager',
      render: (row) => row.assignedManager?.name || 'Unassigned',
    },
    {
      key: 'assignedTo',
      label: 'Assigned Person',
      render: (row) => (
        <div className="text-sm text-foreground">
          {Array.isArray(row.assignedTo) && row.assignedTo.length
            ? row.assignedTo.map((assignee) => assignee.name).join(', ')
            : row.assignedPersonName || 'Unassigned'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(event) => updateStatusMutation.mutate({ id: row._id, status: event.target.value })}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <StatusBadge tone={priorityTone[row.priority] || 'neutral'}>{row.priority}</StatusBadge>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'Not set',
    },
  ];

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTaskMutation.mutateAsync(taskId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Assignment Dashboard"
        description="Monitor and assign tasks to managers across clients and projects. Use filters to locate manager-assigned work quickly."
        actions={(
          <Button onClick={() => navigate('/tasks/new')}>
            <Plus size={16} className="mr-2" />
            Create Task
          </Button>
        )}
      >
        <MetricGrid>
          <MetricCard label="Total Tasks" value={taskMetrics.total} helper="Tasks currently visible" icon={ListChecks} tone="info" />
          <MetricCard label="In Progress" value={taskMetrics.inProgress} helper="Work currently active" icon={Clock} tone="warning" />
          <MetricCard label="Completed" value={taskMetrics.done} helper="Work finished or approved" icon={CheckCircle2} tone="success" />
          <MetricCard label="Overdue" value={taskMetrics.overdue} helper="Needs attention now" icon={TimerReset} tone={taskMetrics.overdue > 0 ? 'danger' : 'neutral'} />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder="Search tasks, manager names, clients, or requirements..."
        />
        <div className="grid w-full gap-2 md:grid-cols-4 xl:grid-cols-8">
          <select
            value={filters.client}
            onChange={(event) => updateFilter('client', event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
          <select
            value={filters.assignedManager}
            onChange={(event) => updateFilter('assignedManager', event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All managers</option>
            {managerUsers.map((manager) => (
              <option key={manager._id} value={manager._id}>{manager.name}</option>
            ))}
          </select>
          <select
            value={filters.assignedTo}
            onChange={(event) => updateFilter('assignedTo', event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All assignees</option>
            {assignableUsers.map((person) => (
              <option key={person._id} value={person._id}>{person.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All statuses</option>
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={filters.taskType}
            onChange={(event) => updateFilter('taskType', event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All task types</option>
            {ALL_TASK_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(event) => updateFilter('priority', event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.dueDate}
            onChange={(event) => updateFilter('dueDate', event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </PageToolbar>

      <DataTable
        data={normalizedTasks}
        columns={columns}
        loading={isLoading}
        onRowClick={(task) => navigate(`/tasks/${task._id}`)}
        onDelete={(id) => handleDeleteTask(id)}
        emptyTitle="No manager-assigned tasks found"
        emptyDescription="Update filters or create a new manager assignment to display tasks here."
      />
    </div>
  );
};

export default ManagerTaskAssignments;
