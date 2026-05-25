import { useState } from 'react';
import { useAddProgressUpdate } from '../../hooks/useTasks';
import { AlertCircle, Clock, Plus } from 'lucide-react';

export const ProgressUpdateForm = ({ taskId, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [showForm, setShowForm] = useState(false);
  const addProgress = useAddProgressUpdate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      return;
    }

    try {
      await addProgress.mutateAsync({
        id: taskId,
        data: {
          description: description.trim(),
          hours: Number(hours) || 0,
        },
      });

      setDescription('');
      setHours('');
      setShowForm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding progress:', error);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
      >
        <Plus size={16} className="mr-2" />
        Add Progress Update
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-border bg-secondary/30 p-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          What did you complete?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work you completed..."
          className="min-h-[96px] w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          disabled={addProgress.isPending}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Hours Spent (optional)
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0"
            min="0"
            step="0.5"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            disabled={addProgress.isPending}
          />
        </div>

        <div className="flex items-end">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-xs text-muted-foreground">
            <Clock size={14} className="text-primary" />
            Updates create a clearer delivery trail for the team.
          </div>
        </div>
      </div>

      {addProgress.error && (
        <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>{addProgress.error.response?.data?.message || 'Failed to add progress'}</div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!description.trim() || addProgress.isPending}
          className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {addProgress.isPending ? 'Saving...' : 'Log Progress'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setDescription('');
            setHours('');
          }}
          disabled={addProgress.isPending}
          className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
