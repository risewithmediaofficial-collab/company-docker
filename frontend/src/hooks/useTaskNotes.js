// =============================================
// TASK NOTES HOOKS - Employee pending notes
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

// ── Employee: fetch own notes ─────────────────────────────────────────────────
export const useMyNotes = () =>
  useQuery({
    queryKey: ['task-notes', 'mine'],
    queryFn: async () => {
      const res = await api.get('/task-notes/mine');
      return res.data.notes || [];
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

// ── Manager: fetch all notes (optionally filter by status) ────────────────────
export const useAllNotes = (status = '') =>
  useQuery({
    queryKey: ['task-notes', 'all', status],
    queryFn: async () => {
      const res = await api.get('/task-notes', { params: status ? { status } : {} });
      return res.data.notes || [];
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

// ── Create note ───────────────────────────────────────────────────────────────
export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/task-notes', data);
      return res.data.note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-notes'] });
      toast.success('Note sent to manager!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create note'),
  });
};

// ── Update note ───────────────────────────────────────────────────────────────
export const useUpdateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/task-notes/${id}`, data);
      return res.data.note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-notes'] });
      toast.success('Note updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update note'),
  });
};

// ── Delete note ───────────────────────────────────────────────────────────────
export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/task-notes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-notes'] });
      toast.success('Note deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete note'),
  });
};

// ── Manager: assign note to employee ─────────────────────────────────────────
export const useAssignNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`/task-notes/${id}/assign`, data);
      return res.data.note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-notes'] });
      toast.success('Note assigned to employee!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to assign note'),
  });
};

// ── Manager: dismiss note ─────────────────────────────────────────────────────
export const useDismissNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, managerNote }) => {
      const res = await api.patch(`/task-notes/${id}/dismiss`, { managerNote });
      return res.data.note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-notes'] });
      toast.success('Note dismissed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to dismiss note'),
  });
};
