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
import { useCreateExpense } from '../../hooks/useFinance';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';

const expenseSchema = z.object({
  title: z.string().min(1, 'Expense title is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than zero'),
  category: z.string().min(1, 'Category is required'),
  client: z.string().optional().or(z.literal('')),
  project: z.string().optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional().or(z.literal('')),
});

const CATEGORIES = [
  { id: 'salary', label: 'Salary' },
  { id: 'tools', label: 'Software Tools' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'travel', label: 'Travel' },
  { id: 'office', label: 'Office & Rent' },
  { id: 'freelance', label: 'Freelancer Fees' },
  { id: 'misc', label: 'Miscellaneous' },
];

export const AddExpenseModal = ({ open, onOpenChange }) => {
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: 0,
      category: 'misc',
      client: '',
      project: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createExpense = useCreateExpense();
  const selectedClientId = form.watch('client');

  const clientProjects = selectedClientId && selectedClientId !== '_none'
    ? projects.filter((project) => project.client?._id === selectedClientId || project.client === selectedClientId)
    : [];

  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        amount: 0,
        category: 'misc',
        client: '',
        project: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [open, form]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      client: (values.client && values.client !== '_none') ? values.client : undefined,
      project: (values.project && values.project !== '_none') ? values.project : undefined,
      status: 'approved', // Admin transactions are auto-approved
    };

    await createExpense.mutateAsync(payload);
    onOpenChange(false);
  };

  const isLoading = createExpense.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Company Expense</DialogTitle>
          <DialogDescription>
            Note any salary payments, tooling software subscriptions, ads spend, office overheads, or misc items.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Expense Title *</FormLabel>
                    <FormControl><Input placeholder="E.g., AWS Hosting Subscription, Lead Gen Ads" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Client (Optional)</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('project', '');
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_none">None</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>{client.company || client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Project (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_none">None</SelectItem>
                        {clientProjects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes / Description</FormLabel>
                  <FormControl><Textarea className="min-h-24" placeholder="Brief explanation of the company expense..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Record Expense'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
