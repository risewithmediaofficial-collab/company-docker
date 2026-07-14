// =============================================
// PAYMENT REQUEST HOOKS — TanStack Query
// ─────────────────────────────────────────────
// QR-based manual payment verification system.
//
// RAZORPAY RESTORATION GUIDE:
//   When switching back to Razorpay, create a
//   useRazorpay.js hook and replace calls to
//   useSubmitPaymentRequest() in QRPaymentModal.
//   These hooks can remain for payment history.
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

// ─── User: Get own payment history ───────────────────────────────────────────
export const useUserPaymentRequests = () => {
  return useQuery({
    queryKey: ['paymentRequests', 'user'],
    queryFn: async () => {
      const res = await api.get('/payment-requests/user');
      return res.data.paymentRequests || [];
    },
    staleTime: 30_000,
  });
};

// ─── Admin: Get all payment requests ─────────────────────────────────────────
export const useAllPaymentRequests = (filters = {}) => {
  return useQuery({
    queryKey: ['paymentRequests', 'admin', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/payment-requests/admin${params ? `?${params}` : ''}`);
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
};

// ─── Submit Payment Request ───────────────────────────────────────────────────
export const useSubmitPaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/payment-requests', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      toast.success('Payment request submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit payment request');
    },
  });
};

// ─── Admin: Approve Payment Request ──────────────────────────────────────────
export const useApprovePaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put(`/payment-requests/${id}/approve`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      toast.success('Payment approved and subscription activated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    },
  });
};

// ─── Admin: Reject Payment Request ───────────────────────────────────────────
export const useRejectPaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put(`/payment-requests/${id}/reject`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      toast.success('Payment request rejected');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    },
  });
};
