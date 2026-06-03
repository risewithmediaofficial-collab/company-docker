import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useSubmitClientTaskResponse } from '../../hooks/useTasks';
import { canClientRespondToTask } from '../../utils/taskFields';

export const ClientTaskResponsePanel = ({ task, onSubmitted, compact = false }) => {
  const [feedback, setFeedback] = useState(task?.clientFeedback || '');
  const [showFeedback, setShowFeedback] = useState(false);
  const submitResponse = useSubmitClientTaskResponse();

  if (!task) return null;

  const responseState = task.clientResponse || 'pending';
  const canRespond = canClientRespondToTask(task);

  const handleRespond = async (clientResponse) => {
    if (clientResponse === 'no' && !feedback.trim()) {
      toast.error('Feedback is required when selecting No');
      return;
    }

    await submitResponse.mutateAsync({
      id: task._id,
      data: {
        clientResponse,
        clientFeedback: clientResponse === 'no' ? feedback.trim() : '',
      },
    });

    toast.success(
      clientResponse === 'yes'
        ? 'Thank you. Your approval has been submitted.'
        : 'Your feedback has been submitted. Our team will update the task.',
    );

    setShowFeedback(false);
    onSubmitted?.();
  };

  return (
    <div className={`rounded-2xl border border-border bg-background p-4 ${compact ? '' : 'mt-5'}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Client Response</p>
      <p className="mt-2 text-sm text-foreground">
        {responseState === 'yes' && <span className="inline-flex items-center gap-2 text-emerald-600"><CheckCircle2 size={16} /> You approved this task.</span>}
        {responseState === 'no' && <span className="inline-flex items-center gap-2 text-amber-600"><AlertTriangle size={16} /> You requested changes for this task.</span>}
        {responseState === 'pending' && 'Awaiting your response when review is needed.'}
      </p>

      {task.clientFeedback ? (
        <div className="mt-3 rounded-xl border border-border bg-secondary/30 p-3 text-sm text-foreground">
          <p className="font-semibold">Your feedback</p>
          <p className="mt-1 whitespace-pre-wrap">{task.clientFeedback}</p>
        </div>
      ) : null}

      {canRespond ? (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground">Please confirm this task</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button type="button" onClick={() => handleRespond('yes')} disabled={submitResponse.isPending}>
              Yes
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowFeedback((current) => !current)}>
              No
            </Button>
          </div>

          {showFeedback ? (
            <div className="mt-4">
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Please describe the changes you need..."
                className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <div className="mt-3">
                <Button type="button" onClick={() => handleRespond('no')} disabled={submitResponse.isPending}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
