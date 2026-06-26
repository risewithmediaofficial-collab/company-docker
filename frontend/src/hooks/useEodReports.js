import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

export const useEodReports = (days = 7, options = {}) => {
  return useQuery({
    queryKey: ['eod-reports', days],
    queryFn: async () => {
      const response = await api.get(`/attendance/eod-reports?days=${days}`);
      return response.data;
    },
    staleTime: 60 * 1000,
    ...options,
  });
};

export const useSubmitEod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/attendance/eod', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('EOD report submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['eod-reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit EOD report');
    },
  });
};
