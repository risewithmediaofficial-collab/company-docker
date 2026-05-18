import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, Clock, RefreshCw, Search, ShieldCheck, UserCog, XCircle } from 'lucide-react';
import { useUpdateUser, useUpdateUserApproval, useUsers } from '../../hooks/useUsers';
import { Button } from '../../components/ui/button';
import UserPermissionsModal from './UserPermissionsModal';

const roles = [
  { value: 'superAdmin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'client', label: 'Client' },
  { value: 'referral', label: 'Referral' },
];

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-destructive/10 text-destructive',
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const Users = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { data: users = [], isLoading, isFetching, refetch } = useUsers();
  const updateUser = useUpdateUser();
  const updateApproval = useUpdateUserApproval();
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionsUser, setPermissionsUser] = useState(null);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      return [user.name, user.email, user.role, user.approvalStatus]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [searchTerm, users]);

  const counts = useMemo(() => {
    return users.reduce(
      (summary, user) => {
        const status = user.approvalStatus || 'approved';
        summary[status] = (summary[status] || 0) + 1;
        summary.total += 1;
        return summary;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [users]);

  const pendingUsers = useMemo(() => {
    return users.filter((user) => (user.approvalStatus || 'approved') === 'pending');
  }, [users]);

  const handleRoleChange = (targetUser, role) => {
    updateUser.mutate({ id: targetUser._id, data: { role } });
  };

  const handleActiveChange = (targetUser) => {
    updateUser.mutate({ id: targetUser._id, data: { isActive: !targetUser.isActive } });
  };

  const handleApprovalChange = (targetUser, approvalStatus) => {
    updateApproval.mutate({ id: targetUser._id, approvalStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserCog size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users & Approvals</h1>
            <p className="text-muted-foreground text-sm">Approve new accounts, change roles, and control access.</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Total Users', counts.total, ShieldCheck, 'text-primary', 'bg-primary/10'],
          ['Pending Approval', counts.pending, Clock, 'text-amber-600', 'bg-amber-500/10'],
          ['Approved', counts.approved, CheckCircle2, 'text-emerald-600', 'bg-emerald-500/10'],
          ['Rejected', counts.rejected, XCircle, 'text-destructive', 'bg-destructive/10'],
        ].map(([label, value, Icon, color, bg]) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className={`mb-4 inline-flex rounded-xl p-2.5 ${bg} ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-amber-500/5">
          <div>
            <h2 className="font-bold flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              Requested Approvals
            </h2>
            <p className="text-xs text-muted-foreground mt-1">New registrations waiting for super admin approval.</p>
          </div>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
            {pendingUsers.length} pending
          </span>
        </div>
        {pendingUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No approval requests right now.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingUsers.map((user) => (
              <div key={user._id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleChange(user, event.target.value)}
                    disabled={updateUser.isPending}
                    className="w-full sm:w-40 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => handleApprovalChange(user, 'approved')}
                    disabled={updateApproval.isPending}
                    className="h-9 px-3"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleApprovalChange(user, 'rejected')}
                    disabled={updateApproval.isPending}
                    className="h-9 px-3"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center bg-card/50 p-3 rounded-2xl border border-border backdrop-blur-sm">
        <Search size={16} className="absolute left-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by name, email, role, or status..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Approval</th>
                <th className="px-6 py-4">Access</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const approvalStatus = user.approvalStatus || 'approved';
                  const StatusIcon = statusIcons[approvalStatus] || CheckCircle2;
                  const isSelf = currentUser?._id === user._id;

                  return (
                    <tr key={user._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(event) => handleRoleChange(user, event.target.value)}
                          disabled={isSelf || updateUser.isPending}
                          className="w-40 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                        >
                          {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusStyles[approvalStatus] || statusStyles.approved}`}>
                          <StatusIcon size={14} />
                          {approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleActiveChange(user)}
                          disabled={isSelf || approvalStatus !== 'approved' || updateUser.isPending}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            user.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {approvalStatus !== 'approved' && (
                            <Button
                              onClick={() => handleApprovalChange(user, 'approved')}
                              disabled={updateApproval.isPending}
                              className="h-9 px-3"
                            >
                              Approve
                            </Button>
                          )}
                          {approvalStatus !== 'rejected' && !isSelf && (
                            <Button
                              variant="outline"
                              onClick={() => handleApprovalChange(user, 'rejected')}
                              disabled={updateApproval.isPending}
                              className="h-9 px-3"
                            >
                              Reject
                            </Button>
                          )}
                          {!isSelf && (
                            <Button
                              variant="secondary"
                              onClick={() => setPermissionsUser(user)}
                              className="h-9 px-3 bg-secondary text-foreground hover:bg-secondary/80"
                            >
                              Access
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {permissionsUser && (
        <UserPermissionsModal 
          user={permissionsUser} 
          onClose={() => setPermissionsUser(null)} 
          onSave={async (id, data) => {
            await updateUser.mutateAsync({ id, data });
          }} 
        />
      )}
    </div>
  );
};

export default Users;
