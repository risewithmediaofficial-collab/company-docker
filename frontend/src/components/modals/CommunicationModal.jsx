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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCommunication, useUpdateCommunication } from '../../hooks/useCommunications';
import { useUsers } from '../../hooks/useUsers';
import { useClients } from '../../hooks/useClients';

const schema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  message: z.preprocess(
    (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
    z.string().min(10, 'Message must be at least 10 characters').optional(),
  ),
  category: z.enum(['support', 'project', 'billing', 'general', 'internal', 'approval']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedParticipant: z.string().optional(),
});

export const CommunicationModal = ({ open, onOpenChange, communication, isClient }) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: '',
      message: '',
      category: isClient ? 'support' : 'general',
      priority: 'medium',
      assignedParticipant: '',
    },
  });
  
  const { data: users = [] } = useUsers({ enabled: open });
  const { data: clients = [] } = useClients({}, { enabled: open });
  const createCommunication = useCreateCommunication();
  const updateCommunication = useUpdateCommunication();
  const isLoading = createCommunication.isPending || updateCommunication.isPending;
  const availableClients = clients.filter((client) => client.userId?._id || client.userId);
  const availableUsers = users.filter((user) => ['superAdmin', 'manager', 'employee'].includes(user.role));

  useEffect(() => {
    form.reset({
      subject: communication?.subject || '',
      message: '',
      category: communication?.category || (isClient ? 'support' : 'general'),
      priority: communication?.priority || 'medium',
      assignedParticipant: '',
    });
  }, [communication, form, open, isClient]);

  const onSubmit = async (data) => {
    let participants = [];
    if (data.assignedParticipant && data.assignedParticipant !== 'unassigned') {
      const [model, id] = data.assignedParticipant.split('_');
      if (model && id) {
        participants.push({ user: id, userModel: model, role: 'assignee' });
      }
    }

    const payload = { 
       subject: data.subject,
       message: data.message,
       category: data.category,
       priority: data.priority,
       participants
    };

    if (communication) {
      await updateCommunication.mutateAsync({
        id: communication._id,
        data: {
          subject: data.subject,
          priority: data.priority,
          category: data.category,
          addParticipants: participants,
        },
      });
    } else {
      await createCommunication.mutateAsync(payload);
    }

    if (!createCommunication.isError && !updateCommunication.isError) {
      form.reset({
        subject: '',
        message: '',
        category: isClient ? 'support' : 'general',
        priority: 'medium',
        assignedParticipant: '',
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{communication ? 'Edit Conversation Details' : 'New Conversation'}</DialogTitle>
          <DialogDescription>
            {isClient ? 'Open a new support ticket or ask a question to our team.' : 'Start a new client conversation or internal team thread.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Need help with XYZ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isClient ? (
                           <>
                             <SelectItem value="support">Support</SelectItem>
                             <SelectItem value="project">Project</SelectItem>
                             <SelectItem value="billing">Billing</SelectItem>
                             <SelectItem value="approval">Approval</SelectItem>
                           </>
                        ) : (
                           <>
                             <SelectItem value="support">Client Support</SelectItem>
                             <SelectItem value="project">Project Discussion</SelectItem>
                             <SelectItem value="internal">Internal Team</SelectItem>
                             <SelectItem value="approval">Approvals</SelectItem>
                             <SelectItem value="general">General</SelectItem>
                           </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isClient && (
                <FormField
                  control={form.control}
                  name="assignedParticipant"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>Include Participant</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'unassigned'}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select user or client" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Team Members</div>
                          {availableUsers.map((u) => (
                            <SelectItem key={u._id} value={`User_${u._id}`}>{u.name} (Team)</SelectItem>
                          ))}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Clients</div>
                          {availableClients.map((c) => (
                            <SelectItem key={c._id} value={`Client_${c._id}`}>{c.company || c.name} (Client)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {!communication && (
                <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Initial Message *</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Write your first message here..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : communication ? 'Update Settings' : 'Start Conversation'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
