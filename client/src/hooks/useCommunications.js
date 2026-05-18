import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';

const normalizeCommunication = (communication) => ({
  ...communication,
  _id: communication?._id || '',
  subject: communication?.subject || 'Untitled conversation',
  category: communication?.category || 'general',
  priority: communication?.priority || 'medium',
  status: communication?.status || 'open',
  messages: Array.isArray(communication?.messages) ? communication.messages : [],
  participants: Array.isArray(communication?.participants) ? communication.participants : [],
});

const normalizeCommunications = (data) => {
  const communications = Array.isArray(data?.communications)
    ? data.communications
    : Array.isArray(data)
      ? data
      : [];

  return communications.filter(Boolean).map(normalizeCommunication);
};

export const useCommunications = (filters = {}) => {
  return useQuery({
    queryKey: ['communications', filters],
    queryFn: async () => {
      const response = await api.get('/communications', { params: filters });
      return normalizeCommunications(response.data);
    },
  });
};

export const useCreateCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/communications', data);
      return response.data.communication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Message sent');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to send message'),
  });
};

export const useUpdateCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/communications/${id}`, data);
      return response.data.communication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Message updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update message'),
  });
};

export const useReplyCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.post(`/communications/${id}/reply`, data);
      return response.data.communication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Reply added');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to reply'),
  });
};

export const useDeleteCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/communications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Message deleted');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete message'),
  });
};
