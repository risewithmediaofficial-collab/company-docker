import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

export const useSOPs = (filters = {}) => {
  return useQuery({
    queryKey: ['sops', filters],
    queryFn: async () => {
      const response = await api.get('/sop', { params: filters });
      return response.data.sops || response.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSOP = (id) => {
  return useQuery({
    queryKey: ['sop', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/sop/${id}`);
      return response.data.sop || response.data;
    },
    enabled: !!id,
  });
};

export const useCreateSOP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/sop', data);
      return response.data.sop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
      toast.success('SOP created successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create SOP'),
  });
};

export const useUpdateSOP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/sop/${id}`, data);
      return response.data.sop;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
      queryClient.invalidateQueries({ queryKey: ['sop', data._id] });
      toast.success('SOP updated successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update SOP'),
  });
};

export const useDeleteSOP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/sop/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
      toast.success('SOP deleted');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete SOP'),
  });
};
