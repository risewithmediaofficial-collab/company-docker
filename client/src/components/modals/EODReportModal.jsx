import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitEOD } from '../../hooks/useAttendance';

const eodSchema = z.object({
  summary: z.string().min(10, 'Add a short summary of your day'),
  tasksCompleted: z.string().min(2, 'Add at least one completed task'),
  blockers: z.string().optional(),
});

export const EODReportModal = ({ open, onOpenChange, report }) => {
  const form = useForm({
    resolver: zodResolver(eodSchema),
    defaultValues: {
      summary: '',
      tasksCompleted: '',
      blockers: '',
    },
  });
  const submitEOD = useSubmitEOD();

  useEffect(() => {
    form.reset({
      summary: report?.summary || '',
      tasksCompleted: report?.tasksCompleted?.join(', ') || '',
      blockers: report?.blockers || '',
    });
  }, [form, open, report]);

  const onSubmit = async (data) => {
    await submitEOD.mutateAsync({
      summary: data.summary,
      tasksCompleted: data.tasksCompleted.split(',').map((task) => task.trim()).filter(Boolean),
      blockers: data.blockers || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>End of Day Report</DialogTitle>
          <DialogDescription>Share progress, completed work, and blockers before ending your day.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What did you work on today?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tasksCompleted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Tasks *</FormLabel>
                  <FormControl>
                    <Input placeholder="Campaign copy, client revisions, QA checklist" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Separate multiple tasks with commas.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="blockers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blockers</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anything blocking tomorrow's work?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitEOD.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitEOD.isPending}>
                {submitEOD.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
