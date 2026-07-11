import { useEffect, useState } from 'react';
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
import { useClients } from '../../hooks/useClients';
import api from '../../api';
import toast from 'react-hot-toast';

const adsCampaignSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  year: z.string().min(1, 'Year is required'),
  month: z.string().min(1, 'Month is required'),
  adSpend: z.coerce.number().min(0, 'Ad spend must be at least 0'),
  optIns: z.coerce.number().min(0, 'Opt-ins must be at least 0'),
  callsBooked: z.coerce.number().min(0, 'Calls booked must be at least 0'),
  newClients: z.coerce.number().min(0, 'New clients must be at least 0'),
  cashCollected: z.coerce.number().min(0, 'Cash collected must be at least 0'),
  totalRevenue: z.coerce.number().min(0, 'Contracted revenue must be at least 0'),
  notes: z.string().optional().or(z.literal('')),
  showToClient: z.boolean().default(false),
});

const MONTHS_LIST = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = [2023, 2024, 2025, 2026];

export const AddAdsCampaignModal = ({ open, onOpenChange, onSuccess }) => {
  const form = useForm({
    resolver: zodResolver(adsCampaignSchema),
    defaultValues: {
      client: '',
      year: new Date().getFullYear().toString(),
      month: String(new Date().getMonth() + 1).padStart(2, '0'),
      adSpend: 0,
      optIns: 0,
      callsBooked: 0,
      newClients: 0,
      cashCollected: 0,
      totalRevenue: 0,
      notes: '',
      showToClient: false,
    },
  });

  const { data: clients = [] } = useClients();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      form.reset({
        client: clients[0]?._id || '',
        year: new Date().getFullYear().toString(),
        month: String(new Date().getMonth() + 1).padStart(2, '0'),
        adSpend: 0,
        optIns: 0,
        callsBooked: 0,
        newClients: 0,
        cashCollected: 0,
        totalRevenue: 0,
        notes: '',
        showToClient: false,
      });
    }
  }, [open, clients, form]);

  const onSubmit = async (values) => {
    setSaving(true);
    const monthStr = `${values.year}-${values.month}`;
    const payload = {
      clientId: values.client,
      month: monthStr,
      date: `${monthStr}-01`,
      adSpend: values.adSpend,
      optIns: values.optIns,
      callsBooked: values.callsBooked,
      newClients: values.newClients,
      cashCollected: values.cashCollected,
      totalRevenue: values.totalRevenue,
      notes: values.notes,
      showToClient: values.showToClient,
    };

    try {
      await api.post('/portal/reporting', payload);
      toast.success('Ad campaign metrics logged successfully');
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log metrics');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Ad Campaign & Spend</DialogTitle>
          <DialogDescription>
            Log actual ad spend, opt-ins, calls booked, revenue generated, and notes for monthly performance tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS_LIST.map((m, i) => (
                          <SelectItem key={m} value={m}>{MONTH_NAMES[i]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adSpend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Spend (₹) *</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="optIns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opt-Ins *</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="callsBooked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calls Booked *</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newClients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Clients *</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cashCollected"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cash Collected (₹) *</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contracted Revenue (₹) *</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
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
                  <FormLabel>Campaign Notes</FormLabel>
                  <FormControl><Textarea className="min-h-20" placeholder="Optional notes for this month's ad campaign performance..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showToClient"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border p-4 bg-secondary/15 border-border/40">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 h-4 w-4 cursor-pointer"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none cursor-pointer select-none" onClick={() => form.setValue('showToClient', !field.value)}>
                    <FormLabel className="font-semibold text-xs text-foreground cursor-pointer">Show to Client</FormLabel>
                    <p className="text-[10px] text-muted-foreground">Make this month's ad spend and KPI tracking visible in the client's portal.</p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Record Campaign'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
