import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, Edit2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/page';
import { useTask } from '../../hooks/useTasks';
import { AddTaskModal } from '../../components/modals/AddTaskModal';
import { formatTaskTypeLabel, normalizeTaskStatusLabel } from '../../utils/taskFields';

const Field = ({ label, value }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-2 text-sm whitespace-pre-wrap">{value || '—'}</p>
  </div>
);

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const { data: task, isLoading, refetch } = useTask(id);

  const canEdit = ['superAdmin', 'manager'].includes(user?.role);

  if (isLoading) {
    return <div className="animate-pulse h-64 rounded-3xl bg-card border border-border" />;
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Task not found</p>
        <Button className="mt-4" onClick={() => navigate('/tasks')}>Back to Tasks</Button>
      </div>
    );
  }

  const status = normalizeTaskStatusLabel(task.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/tasks" className="rounded-xl p-2 hover:bg-secondary">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{task.taskTitle || task.title}</h1>
            <p className="text-sm text-muted-foreground">{task.project?.name} • {task.client?.name || task.clientName}</p>
          </div>
          <StatusBadge tone="info">{status}</StatusBadge>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={() => setEditing(true)}>
              <Edit2 size={16} className="mr-2" />
              Edit
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => navigate('/tasks')} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Task Type" value={task.taskCategory === 'non_content' ? 'Non-Content' : 'Content'} />
        <Field label="Category" value={formatTaskTypeLabel(task.taskType)} />
        <Field label="Content Type" value={task.contentType?.replace(/_/g, ' ')} />
        <Field label="Video Type" value={task.videoType?.replace(/_/g, ' ')} />
        <Field label="Reel / Video Title" value={task.contentTitle} />
        <Field label="Assigned To" value={Array.isArray(task.assignedTo) ? task.assignedTo.map((u) => u.name).join(', ') : task.assignedPersonName} />
        <Field label="Priority" value={task.priority} />
        <Field label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleString() : null} />
        <Field label="Description" value={task.description} />
        <Field label="Script" value={task.scriptText} />
        <Field label="Script Link" value={task.scriptLink} />
        <Field label="Caption" value={task.caption} />
        <Field label="Hashtags" value={task.hashtags} />
        <Field label="Keywords" value={task.keywords} />
        <Field label="Hashtags" value={task.hashtags} />
        <Field label="Reference Link" value={task.referenceLink} />
        <Field label="Content Idea" value={task.contentIdea} />
        <Field label="Editor Guide" value={task.editorGuide} />
        <Field label="Audio Reference" value={task.audioReference} />
        <Field label="Shoot Instructions" value={task.shootInstructions} />
        <Field label="Editing Instructions" value={task.editingInstructions} />
        <Field label="Requirement Details" value={task.requirementDetails} />
        <Field label="Notes" value={task.internalNotes} />
      </div>

      <AddTaskModal
        open={editing}
        onOpenChange={(open) => {
          setEditing(open);
          if (!open) refetch();
        }}
        task={task}
      />
    </div>
  );
};

export default TaskDetails;
