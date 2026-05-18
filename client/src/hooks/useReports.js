import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useAdminReport = () => {
  return useQuery({
    queryKey: ['reports', 'admin'],
    queryFn: async () => {
      const response = await api.get('/reports/admin');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};
