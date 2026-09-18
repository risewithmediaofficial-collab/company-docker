import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useSidebarBadges = (enabled = true, isSuperAdmin = false) => {
  return useQuery({
    queryKey: ['sidebar-badges', isSuperAdmin],
    queryFn: async () => {
      const requests = [
        api.get('/access-requests'),
        api.get('/users'),
      ];

      if (isSuperAdmin) {
        requests.push(api.get('/platform/stats'));
      }

      const results = await Promise.allSettled(requests);
      const accessRes = results[0];
      const usersRes = results[1];
      const platformRes = isSuperAdmin ? results[2] : null;

      const accessRequests =
        accessRes.status === 'fulfilled'
          ? (accessRes.value.data.requests || []).filter((r) => r.status === 'pending')
          : [];

      // Only count internal staff as pending users
      const pendingUsers =
        usersRes.status === 'fulfilled'
          ? (usersRes.value.data.users || []).filter(
              (u) => u.approvalStatus === 'pending' && u.role !== 'organizationOwner'
            )
          : [];

      // Pending company requests count for superAdmin
      const pendingCompanies =
        platformRes?.status === 'fulfilled'
          ? platformRes.value.data.stats?.pendingOrgs || 0
          : 0;

      return {
        accessRequests: accessRequests.length,
        pendingUsers: pendingUsers.length,
        pendingCompanies,
      };
    },
    refetchInterval: 30000,
    enabled,
    staleTime: 10000,
  });
};
