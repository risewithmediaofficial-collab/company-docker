import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDailyTask } from '../../hooks/useTasks';

export const DailyCalendarTaskDialog = ({
  open,
  onOpenChange,
  defaultDate,
  onSubmitted,
}) => {
  const createDailyTask = useCreateDailyTask();
  const [title, setTitle] = useState('');
  const [workDate, setWorkDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [workNotes, setWorkNotes] = useState('');

  useEffect(() => {
    if (open) {
      setWorkDate(defaultDate || new Date().toISOString().split('T')[0]);
    }
  }, [defaultDate, open]);

  const resetForm = () => {
    setTitle('');
    setWorkDate(defaultDate || new Date().toISOString().split('T')[0]);
    setDescription('');
    setHours('');
    setWorkNotes('');
  };

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await createDailyTask.mutateAsync({
      title: title.trim(),
      workDate,
      description: description.trim(),
      hours: Number(hours) || 0,
      workNotes: workNotes.trim(),
    });

    resetForm();
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Daily Calendar Task</DialogTitle>
          <DialogDescription>
            Save a personal daily task to the calendar and include it in the weekly report automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Task Title *</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Prepare competitor content ideas"
              />
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
                placeholder="Describe what was completed for this daily task."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Work Notes</label>
              <Textarea
                className="min-h-24"
                value={workNotes}
                onChange={(event) => setWorkNotes(event.target.value)}
                placeholder="Add blockers, next steps, links, or reminders."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createDailyTask.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDailyTask.isPending || !title.trim() || !description.trim()}>
              {createDailyTask.isPending ? 'Saving...' : 'Save Daily Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
