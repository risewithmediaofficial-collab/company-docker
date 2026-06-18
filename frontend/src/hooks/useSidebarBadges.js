import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useSidebarBadges = (enabled = true) => {
  return useQuery({
    queryKey: ['sidebar-badges'],
    queryFn: async () => {
      const [accessRes, usersRes] = await Promise.allSettled([
        api.get('/access-requests'),
        api.get('/users'),
      ]);

      const accessRequests =
        accessRes.status === 'fulfilled'
          ? (accessRes.value.data.requests || []).filter((r) => r.status === 'pending')
          : [];

      const pendingUsers =
        usersRes.status === 'fulfilled'
          ? (usersRes.value.data.users || []).filter((u) => u.approvalStatus === 'pending')
          : [];

      return {
        accessRequests: accessRequests.length,
        pendingUsers: pendingUsers.length,
      };
    },
    refetchInterval: 30000,
    enabled,
    staleTime: 10000,
  });
};
