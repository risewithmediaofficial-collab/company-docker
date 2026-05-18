// =============================================
// HR/EMPLOYEE QUERY HOOKS - TanStack Query
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

export const useEmployees = (filters = {}) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const response = await api.get('/hr/employees', { params: filters });
      return response.data.employees;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmployee = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/hr/employees/${id}`);
      return response.data.employee;
    },
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/hr/employees', data);
      return response.data.employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/hr/employees/${id}`, data);
      return response.data.employee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data._id] });
      toast.success('Employee updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/hr/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    },
  });
};

// Job Openings
export const useJobOpenings = (filters = {}) => {
  return useQuery({
    queryKey: ['job-openings', filters],
    queryFn: async () => {
      const response = await api.get('/hr/jobs', { params: filters });
      return response.data.jobs;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateJobOpening = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/hr/jobs', data);
      return response.data.job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] });
      toast.success('Job opening created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create job opening');
    },
  });
};
