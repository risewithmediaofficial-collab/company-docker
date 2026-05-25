import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';

export const useClientFollowups = (filters = {}) => {
  return useQuery({
    queryKey: ['client-followups', filters],
    queryFn: async () => {
      const response = await api.get('/client-followups', { params: filters });
      return response.data.followups || [];
    },
    staleTime: 60 * 1000,
  });
};

export const useCreateClientFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/client-followups', data);
      return response.data.followup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-followups'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Follow-up saved');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save follow-up');
    },
  });
};

export const useUpdateClientFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/client-followups/${id}`, data);
      return response.data.followup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-followups'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Follow-up updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update follow-up');
    },
  });
};

export const useDeleteClientFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/client-followups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-followups'] });
      toast.success('Follow-up deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete follow-up');
    },
  });
};
