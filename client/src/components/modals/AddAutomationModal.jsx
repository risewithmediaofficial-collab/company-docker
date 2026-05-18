// =============================================
// ADD AUTOMATION FORM - React Hook Form + Zod
// =============================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateAutomation, useUpdateAutomation } from '../../hooks/useAutomations';

const automationFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  trigger: z.string().min(1, 'Trigger is required'),
  action: z.string().min(1, 'Action is required'),
  enabled: z.boolean().default(true),
});


const TRIGGERS = [
  'Lead Created',
  'Lead Status Changed',
  'Task Completed',
  'Project Started',
  'Invoice Created',
  'Email Received',
  'Date Specific',
  'Manual Trigger',
];

const ACTIONS = [
  'Send Email',
  'Create Task',
  'Update Lead Status',
  'Notify Team',
  'Create Invoice',
  'Log Activity',
  'Assign Task',
  'Generate Report',
];

export const AddAutomationModal = ({ open, onOpenChange, automation = null }) => {
  const form = useForm({
    resolver: zodResolver(automationFormSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger: '',
      action: '',
      enabled: true,
    },
  });

  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();
  const isLoading = createAutomation.isPending || updateAutomation.isPending;

  useEffect(() => {
    if (automation) {
      form.reset({
        name: automation.name,
        description: automation.description || '',
        trigger: automation.trigger,
        action: automation.action,
        enabled: automation.enabled,
      });
    } else {
      form.reset();
    }
  }, [automation, open, form]);

  const onSubmit = async (data) => {
    if (automation) {
      await updateAutomation.mutateAsync({ id: automation._id, data });
    } else {
      await createAutomation.mutateAsync(data);
    }

    if (!createAutomation.isError && !updateAutomation.isError) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{automation ? 'Edit Automation' : 'Create New Automation'}</DialogTitle>
          <DialogDescription>
            {automation ? 'Update the automation workflow' : 'Create an automated workflow'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Automation Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Send Welcome Email to New Leads" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRIGGERS.map((trigger) => (
                          <SelectItem key={trigger} value={trigger}>
                            {trigger}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIONS.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this automation does..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Automation</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {field.value ? 'This automation is active' : 'This automation is inactive'}
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : automation ? 'Update Automation' : 'Create Automation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
