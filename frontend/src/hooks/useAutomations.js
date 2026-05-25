// =============================================
// AUTOMATION QUERY HOOKS - TanStack Query
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

export const useAutomations = (filters = {}) => {
  return useQuery({
    queryKey: ['automations', filters],
    queryFn: async () => {
      const response = await api.get('/automations', { params: filters });
      return response.data.automations;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAutomation = (id) => {
  return useQuery({
    queryKey: ['automation', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/automations/${id}`);
      return response.data.automation;
    },
    enabled: !!id,
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/automations', data);
      return response.data.automation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create automation');
    },
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/automations/${id}`, data);
      return response.data.automation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      queryClient.invalidateQueries({ queryKey: ['automation', data._id] });
      toast.success('Automation updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update automation');
    },
  });
};

export const useDeleteAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete automation');
    },
  });
};

export const useToggleAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }) => {
      const response = await api.patch(`/automations/${id}/toggle`, { enabled });
      return response.data.automation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to toggle automation');
    },
  });
};
