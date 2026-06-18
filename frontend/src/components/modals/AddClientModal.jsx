// =============================================
// ADD CLIENT FORM - React Hook Form + Zod
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
import { useCreateClient, useUpdateClient } from '../../hooks/useClients';
import { toast } from 'sonner';

const DRAFT_KEY = 'draft:client-modal';

const CLIENT_SECTORS = [
  'Real Estate',
  'Education',
  'Healthcare',
  'Finance',
  'Retail',
  'E-commerce',
  'Hospitality',
  'Food & Beverage',
  'Beauty & Wellness',
  'Fitness',
  'Technology',
  'Manufacturing',
  'Construction',
  'Interior Design',
  'Legal',
  'NGO',
  'Entertainment',
  'Travel',
  'Automotive',
  'Other',
];

const CLIENT_REQUIREMENTS = [
  'Website Content',
  'Website Development',
  'Video Production',
  'SEO',
  'Social Media Marketing',
  'Performance Marketing',
  'Google Ads',
  'Meta Ads',
  'Branding',
  'Graphic Design',
  'Reels / Short Videos',
  'Photography',
  'Content Writing',
  'Lead Generation',
  'Marketing Strategy',
  'Other',
];

const clientFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string(),
  website: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      if (!trimmed) return '';
      return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    },
    z.string().url('Invalid website URL').optional().or(z.literal(''))
  ),
  industry: z.string().optional(),
  services: z.array(z.string()).default([]),
  status: z.enum(['Active', 'Inactive', 'Prospect', 'Churned']).default('Active'),
  notes: z.string().optional(),
});


export const AddClientModal = ({ open, onOpenChange, client = null }) => {
  const form = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      industry: undefined,
      services: [],
      status: 'Active',
      notes: '',
    },
  });

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const isLoading = createClient.isPending || updateClient.isPending;

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        company: client.company || '',
        email: client.email,
        phone: client.phone || '',
        website: client.website || '',
        industry: client.industry || undefined,
        services: Array.isArray(client.services) ? client.services : [],
        status: client.status || 'Active',
        notes: client.notes || '',
      });
    } else if (open) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          form.reset(parsed);
          toast.info('Draft restored');
        } catch {
          form.reset({
            name: '',
            company: '',
            email: '',
            phone: '',
            website: '',
            industry: undefined,
            services: [],
            status: 'Active',
            notes: '',
          });
        }
      } else {
        form.reset({
          name: '',
          company: '',
          email: '',
          phone: '',
          website: '',
          industry: undefined,
          services: [],
          status: 'Active',
          notes: '',
        });
      }
    }
  }, [client, open, form]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      website: data.website || '',
      industry: data.industry || '',
      services: data.services || [],
    };

    if (client) {
      await updateClient.mutateAsync({ id: client._id, data: payload });
    } else {
      await createClient.mutateAsync(payload);
    }

    if (!createClient.isError && !updateClient.isError) {
      form.reset();
      localStorage.removeItem(DRAFT_KEY);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (!client && form.formState.isDirty) {
      const data = form.getValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      toast.info('Saved as draft');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {client ? 'Update the client information below' : 'Create a new client'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="www.company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type / Sector</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLIENT_SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Churned">Churned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="services"
              render={({ field }) => {
                const selected = field.value || [];

                return (
                  <FormItem>
                    <FormLabel>Client Requirements</FormLabel>
                    <div className="grid gap-2 rounded-2xl border border-border bg-background p-3 sm:grid-cols-2">
                      {CLIENT_REQUIREMENTS.map((requirement) => {
                        const checked = selected.includes(requirement);

                        return (
                          <label
                            key={requirement}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  field.onChange([...selected, requirement]);
                                } else {
                                  field.onChange(selected.filter((item) => item !== requirement));
                                }
                              }}
                              className="h-4 w-4 rounded border-border accent-primary"
                            />
                            {requirement}
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add notes about this client..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
