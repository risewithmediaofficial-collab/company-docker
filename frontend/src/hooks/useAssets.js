import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';

export const useAssets = (filters = {}) => useQuery({
  queryKey: ['assets', filters],
  queryFn: async () => {
    const response = await api.get('/assets', { params: filters });
    return response.data.assets || [];
  },
  staleTime: 60 * 1000,
});

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/assets', data);
      return response.data.asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset uploaded successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload asset');
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/assets/${id}`, data);
      return response.data.asset;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', data._id] });
      toast.success('Asset updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update asset');
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete asset');
    },
  });
};
