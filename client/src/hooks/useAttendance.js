import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';

export const useAttendance = (filters = {}) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: async () => {
      const response = await api.get('/attendance', { params: filters });
      return response.data;
    },
  });
};

export const useClockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/attendance/clock-in');
      return response.data.attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Clocked in successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Clock in failed'),
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/attendance/clock-out');
      return response.data.attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Clocked out successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Clock out failed'),
  });
};

export const useSubmitEOD = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/attendance/eod', data);
      return response.data.attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('End of day report submitted');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to submit report'),
  });
};
