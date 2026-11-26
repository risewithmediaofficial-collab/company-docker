import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';

export const useMeetings = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['calendar-meetings', filters],
    queryFn: async () => {
      const response = await api.get('/meetings', { params: filters });
      return response.data?.meetings || [];
    },
    staleTime: 60 * 1000,
    ...options,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/meetings', data);
      return response.data?.meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });
      toast.success('Meeting scheduled');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to schedule meeting');
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/meetings/${id}`, data);
      return response.data?.meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });
      toast.success('Meeting updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update meeting');
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/meetings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });
      toast.success('Meeting deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
    },
  });
};
