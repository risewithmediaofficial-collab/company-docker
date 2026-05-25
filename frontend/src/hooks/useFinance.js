// =============================================
// FINANCE QUERY HOOKS - TanStack Query
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

// Finance entries
export const useFinanceEntries = (filters = {}) => {
  return useQuery({
    queryKey: ['finance-entries', filters],
    queryFn: async () => {
      const response = await api.get('/finance', { params: filters });
      return response.data?.entries || response.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinance = useFinanceEntries;

export const useCreateFinanceEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/finance', data);
      return response.data.entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      toast.success('Finance entry created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create finance entry');
    },
  });
};

export const useUpdateFinanceEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/finance/${id}`, data);
      return response.data.entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      toast.success('Finance entry updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update finance entry');
    },
  });
};

export const useDeleteFinanceEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/finance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      toast.success('Finance entry deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete finance entry');
    },
  });
};

// Invoices
export const useInvoices = (filters = {}) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const response = await api.get('/finance/invoices', { params: filters });
      return response.data?.invoices || response.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/finance/invoices', data);
      return response.data.invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Invoice created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/finance/invoices/${id}`, data);
      return response.data.invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      toast.success('Invoice updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/finance/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Invoice deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data = {} }) => {
      const response = await api.post(`/finance/invoices/${id}/mark-paid`, data);
      return response.data.invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark invoice paid');
    },
  });
};

export const usePayments = (filters = {}) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const response = await api.get('/finance/payments', { params: filters });
      return response.data?.payments || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinanceSummary = (options = {}) => {
  return useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const response = await api.get('/finance/summary');
      return response.data?.summary || {};
    },
    enabled: options.enabled ?? true,
    staleTime: 2 * 60 * 1000,
  });
};
