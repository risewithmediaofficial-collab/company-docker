// =============================================
// ADD FINANCE ENTRY FORM - React Hook Form + Zod
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
import { useCreateFinanceEntry, useUpdateFinanceEntry } from '../../hooks/useFinance';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';

const financeFormSchema = z.object({
  type: z.enum(['Income', 'Expense']).default('Expense'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
  date: z.string(),
  paymentMethod: z.string().optional(),
  status: z.enum(['Pending', 'Completed', 'Cancelled']).default('Completed'),
  client: z.string().optional(),
  project: z.string().optional(),
});


const INCOME_CATEGORIES = ['Service Revenue', 'Product Sales', 'Consulting', 'Other Income'];
const EXPENSE_CATEGORIES = ['Salary', 'Software', 'Utilities', 'Travel', 'Marketing', 'Office Supplies', 'Other Expense'];

export const AddFinanceModal = ({ open, onOpenChange, entry = null }) => {
  const form = useForm({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      type: 'Expense',
      category: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      status: 'Completed',
      client: '',
      project: '',
    },
  });

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createEntry = useCreateFinanceEntry();
  const updateEntry = useUpdateFinanceEntry();
  const isLoading = createEntry.isPending || updateEntry.isPending;

  const entryType = form.watch('type');
  const selectedClientId = form.watch('client');
  const categories = entryType === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const clientProjects = selectedClientId
    ? projects.filter((project) => project.client?._id === selectedClientId || project.client === selectedClientId)
    : projects;

  useEffect(() => {
    if (entry) {
      form.reset({
        type: entry.type,
        category: entry.category,
        amount: entry.amount,
        description: entry.description || '',
        date: new Date(entry.date).toISOString().split('T')[0],
        paymentMethod: entry.paymentMethod || '',
        status: entry.status,
        client: entry.client?._id || entry.client || '',
        project: entry.project?._id || entry.project || '',
      });
    } else {
      form.reset({
        type: 'Expense',
        category: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        status: 'Completed',
        client: '',
        project: '',
      });
    }
  }, [entry, open, form]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
    };
    if (!payload.client) delete payload.client;
    if (!payload.project) delete payload.project;

    if (entry) {
      await updateEntry.mutateAsync({ id: entry._id, data: payload });
    } else {
      await createEntry.mutateAsync(payload);
    }

    if (!createEntry.isError && !updateEntry.isError) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Finance Entry' : 'Add Finance Entry'}</DialogTitle>
          <DialogDescription>
            {entry ? 'Update the finance entry' : 'Record income or expense'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('category', '');
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bank Transfer, Credit Card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value === 'none' ? '' : value);
                      form.setValue('project', '');
                    }} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No client</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.company || client.name}
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
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {clientProjects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                    <Textarea placeholder="Additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
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
                {isLoading ? 'Saving...' : entry ? 'Update Entry' : 'Add Entry'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
