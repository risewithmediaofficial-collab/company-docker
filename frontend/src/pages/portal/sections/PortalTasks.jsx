import { useQuery } from '@tanstack/react-query';
import { Clock, FileText, User2 } from 'lucide-react';
import api from '../../../api';
import { ClientTaskResponsePanel } from '../../../components/tasks/ClientTaskResponsePanel';
import {
  formatTaskTypeLabel,
  getClientTaskStatusMeta,
  normalizeTaskStatusLabel,
} from '../../../utils/taskFields';
import { getAssetUrl } from '../../../utils/assetUrl';

const AlertBox = ({ tone, message }) => {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    progress: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone] || styles.info}`}>
      {message}
    </div>
  );
};

const FileLinks = ({ files = [] }) => {
  if (!files.length) return <p className="text-sm text-muted-foreground">No files available.</p>;

  return (
    <div className="space-y-2">
      {files.map((file, index) => {
        const fileUrl = getAssetUrl(file.url);
        const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.url || file.name || '');

        return (
        <a
          key={`${file.url || file.name}-${index}`}
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-secondary/40"
        >
          <span className="flex min-w-0 items-center gap-3">
            {isImage ? (
              <img
                src={fileUrl}
                alt={file.name || 'Attachment preview'}
                className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover"
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

export default function PortalTasks() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['portal-tasks'],
    queryFn: async () => {
      const response = await api.get('/portal/tasks');
      return response.data.tasks || [];
    },
  });

  const tasks = data || [];

  if (isLoading) {
    return <div className="space-y-4 p-6"><div className="h-40 animate-pulse rounded-3xl bg-muted/60" /><div className="h-40 animate-pulse rounded-3xl bg-muted/60" /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your task progress, review deliveries, and confirm approvals.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          No client tasks are available right now.
        </div>
      ) : (
        <div className="grid gap-5">
          {tasks.map((task) => {
            const normalizedStatus = normalizeTaskStatusLabel(task.status);
            const statusMeta = getClientTaskStatusMeta(normalizedStatus);

            return (
              <div key={task._id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {task.taskCategory === 'non_content' ? 'Non-Content Task' : 'Content Task'}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                        {formatTaskTypeLabel(task.taskType)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-foreground">{task.taskTitle || task.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2"><User2 size={14} /> {task.assignedPersonName || task.assignedTo?.map((item) => item.name).join(', ') || 'Unassigned'}</span>
                      <span className="inline-flex items-center gap-2"><Clock size={14} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      <span className="inline-flex items-center gap-2"><FileText size={14} /> {statusMeta.label}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Current Status</p>
                    <p className="mt-2 font-semibold text-foreground">{statusMeta.label}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <AlertBox tone={statusMeta.tone} message={statusMeta.alert} />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Requirements</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{task.description || task.websiteRequirements || 'No additional requirements shared.'}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Notes Visible To You</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{task.clientVisibleNotes || 'No client notes shared yet.'}</p>
                  </div>

                  {task.taskCategory !== 'non_content' ? (
                    <>
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Script / Script Link</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{task.scriptText || task.scriptLink || 'No script added.'}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Caption / Editor Guide</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{task.caption || 'No caption provided.'}</p>
                        {task.editorGuide ? <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{task.editorGuide}</p> : null}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-border bg-background p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Website / Task Requirements</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                        {task.websiteRequirements || task.requiredFeatures || task.description || 'No extra requirements provided.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Attachments</p>
                    <FileLinks files={task.attachments || []} />
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Completed Files</p>
                    <FileLinks files={task.completedFiles || []} />
                  </div>
                </div>

                <ClientTaskResponsePanel task={task} onSubmitted={refetch} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
