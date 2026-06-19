import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAddProgressUpdate } from '../../hooks/useTasks';
import { uploadFiles } from '../../utils/taskFields';

const buildTaskLabel = (task) => {
  const title = task.taskTitle || task.title || 'Untitled task';
  const client = task.client?.name || task.client?.company || task.clientName || '';
  return client ? `${title} - ${client}` : title;
};

export const DailyTaskUpdateDialog = ({
  open,
  onOpenChange,
  tasks = [],
  defaultDate,
  onSubmitted,
}) => {
  const addProgressUpdate = useAddProgressUpdate();
  const [taskId, setTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [workNotes, setWorkNotes] = useState('');
  const [workDate, setWorkDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [files, setFiles] = useState([]);

  const orderedTasks = useMemo(
    () => [...tasks].sort((a, b) => buildTaskLabel(a).localeCompare(buildTaskLabel(b))),
    [tasks],
  );

  const resetForm = () => {
    setTaskId('');
    setDescription('');
    setHours('');
    setWorkNotes('');
    setWorkDate(defaultDate || new Date().toISOString().split('T')[0]);
    setFiles([]);
  };

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!taskId || !description.trim()) return;

    const attachments = await uploadFiles(files);
    await addProgressUpdate.mutateAsync({
      id: taskId,
      data: {
        description: description.trim(),
        hours: Number(hours) || 0,
        workNotes: workNotes.trim(),
        workDate,
        attachments,
      },
    });

    resetForm();
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Daily Task Update</DialogTitle>
          <DialogDescription>
            Save today&apos;s completed work against a task so it appears in the weekly report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Task *</label>
              <select
                value={taskId}
                onChange={(event) => setTaskId(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Select a task</option>
                {orderedTasks.map((task) => (
                  <option key={task._id} value={task._id}>{buildTaskLabel(task)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Work Date *</label>
              <Input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Hours Spent</label>
              <Input
                type="number"
                min="0"
                step="0.25"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Completed Work *</label>
              <Textarea
                className="min-h-24"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What did you complete today?"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Work Notes</label>
              <Textarea
                className="min-h-24"
                value={workNotes}
                onChange={(event) => setWorkNotes(event.target.value)}
                placeholder="Blockers, next steps, links, or notes for the team"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Attachments</label>
              <Input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
              />
              {files.length ? (
                <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
                  {files.map((file) => (
                    <div key={`${file.name}-${file.size}`}>{file.name}</div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={addProgressUpdate.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProgressUpdate.isPending || !taskId || !description.trim()}>
              {addProgressUpdate.isPending ? 'Saving...' : 'Save Daily Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
