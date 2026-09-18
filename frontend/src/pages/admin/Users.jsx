import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  XCircle,
  Users as UsersIcon,
  Mail,
  Building2,
  Shield,
  Pencil,
  Check,
  X,
  Plus,
  Crown,
  UserPlus,
  Briefcase,
  Phone,
  Lock,
} from 'lucide-react';
import {
  useAdminChangeUserPassword,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUpdateUserApproval,
  useUsers,
} from '../../hooks/useUsers';
import { Button } from '../../components/ui/button';
import UserPermissionsModal from './UserPermissionsModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import WorkspacePage from '../../components/ui/WorkspacePage';
import DatabaseView from '../../components/ui/DatabaseView';

const platformRoles = [
  { value: 'superAdmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'client', label: 'Client' },
  { value: 'referral', label: 'Referral' },
];

const companyRoles = [
  { value: 'admin', label: 'Company Admin (Full Management)' },
  { value: 'manager', label: 'Company Manager (Projects & Operations)' },
  { value: 'employee', label: 'Team Member (Employee / Specialist)' },
];

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const Users = () => {
  const { user: currentUser, organization } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: users = [], isLoading, isFetching, refetch } = useUsers();
  const updateUser = useUpdateUser();
  const updateApproval = useUpdateUserApproval();
  const deleteUser = useDeleteUser();
  const adminChangeUserPassword = useAdminChangeUserPassword();
  const createUser = useCreateUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [permissionsUser, setPermissionsUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPasswordFields, setShowPasswordFields] = useState({ newPassword: false, confirmPassword: false });

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    position: '',
    phone: '',
  });

  const isSuperAdmin = currentUser?.role === 'superAdmin' && !currentUser?.isGhostMode;
  const isTenant = Boolean(currentUser?.organizationId || organization);
  const canManageUsers = isSuperAdmin || ['organizationOwner', 'admin'].includes(currentUser?.role);
  const maxSeats = organization?.maxUsers || 3;

  // In tenant workspace, include company owner; for platform superadmin in global view, omit external organizationOwners (handled in Company Requests)
  const teamUsers = useMemo(() => {
    if (currentUser?.role === 'superAdmin' && !currentUser?.organizationId) {
      return users.filter((u) => u.role !== 'organizationOwner');
    }
    return users;
  }, [users, currentUser]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return teamUsers.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      const dept = (u.department || '').toLowerCase();

      const matchesSearch = !term || name.includes(term) || email.includes(term) || role.includes(term) || dept.includes(term);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [teamUsers, searchTerm, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser.mutateAsync({ id: userId, data: { role: newRole } });
      toast.success('User role updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleApprovalChange = async (userId, approvalStatus) => {
    try {
      await updateApproval.mutateAsync({ id: userId, approvalStatus });
      toast.success(`User marked as ${approvalStatus}`);
    } catch {
      toast.error('Failed to update approval status');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const isSelf = String(passwordUser._id) === String(currentUser?._id);
      await adminChangeUserPassword.mutateAsync({
        id: passwordUser._id,
        newPassword: passwordForm.newPassword,
      });

      const updatedUserName = passwordUser.name;
      setPasswordUser(null);
      setPasswordForm({ newPassword: '', confirmPassword: '' });

      if (isSelf) {
        toast.success('Your password was updated. Logging out...');
        dispatch(logout());
        navigate('/login');
      } else {
        toast.success(`Password updated for ${updatedUserName}. That user alone has been logged out.`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error('Please fill in name, email, and a password');
      return;
    }
    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmittingUser(true);
      await createUser.mutateAsync(addForm);
      toast.success(`Team member ${addForm.name} added successfully!`);
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        position: '',
        phone: '',
      });
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create team member');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Statistics
  const total = teamUsers.length;
  const approvedCount = teamUsers.filter((u) => u.approvalStatus === 'approved' || !u.approvalStatus).length;
  const pendingCount = teamUsers.filter((u) => u.approvalStatus === 'pending').length;
  const activeCount = teamUsers.filter((u) => u.isActive).length;
  const adminsAndManagersCount = teamUsers.filter((u) => ['admin', 'manager'].includes(u.role)).length;

  const renderRoleBadge = (u) => {
    if (u.role === 'organizationOwner') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-black shadow-xs">
          <Crown size={12} className="text-amber-500" />
          <span>Company Owner</span>
        </span>
      );
    }
    if (u.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold shadow-xs">
          <Shield size={12} className="text-indigo-500" />
          <span>{isTenant ? 'Company Admin' : 'Admin'}</span>
        </span>
      );
    }
    if (u.role === 'manager') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-xs">
          <Briefcase size={12} className="text-emerald-500" />
          <span>{isTenant ? 'Company Manager' : 'Manager'}</span>
        </span>
      );
    }
    if (u.role === 'superAdmin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs font-black shadow-xs">
          <ShieldCheck size={12} />
          <span>Super Admin</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20 text-xs font-semibold">
        <span>{u.role === 'employee' ? 'Team Member' : u.role}</span>
      </span>
    );
  };

  // Table Columns
  const tableColumns = [
    {
      key: 'name',
      label: 'Team Member',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
            u.role === 'organizationOwner' ? 'bg-amber-500/15 text-amber-600' :
            u.role === 'admin' ? 'bg-indigo-500/15 text-indigo-600' :
            u.role === 'manager' ? 'bg-emerald-500/15 text-emerald-600' :
            'bg-primary/10 text-primary'
          }`}>
            {u.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate">{u.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role & Responsibility',
      render: (u) => {
        // If owner or non-admin viewer, render static badge
        if (u.role === 'organizationOwner' || !canManageUsers) {
          return renderRoleBadge(u);
        }

        // If target is superAdmin and viewer is not platform superAdmin, disable
        const isSuperAdminTarget = u.role === 'superAdmin';
        if (isSuperAdminTarget && !isSuperAdmin) {
          return renderRoleBadge(u);
        }

        return (
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u._id, e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-semibold cursor-pointer focus:ring-1 focus:ring-primary"
          >
            {isTenant ? (
              <>
                <option value="admin">Company Admin</option>
                <option value="manager">Company Manager</option>
                <option value="employee">Team Member / Staff</option>
              </>
            ) : (
              platformRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))
            )}
          </select>
        );
      },
    },
    {
      key: 'department',
      label: 'Dept & Position',
      render: (u) => (
        <div className="text-xs">
          <p className="font-medium text-foreground">{u.department || 'General'}</p>
          <p className="text-[11px] text-muted-foreground">{u.position || 'Specialist'}</p>
        </div>
      ),
    },
    {
      key: 'approvalStatus',
      label: 'Status',
      render: (u) => {
        const st = u.approvalStatus || 'approved';
        return (
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusStyles[st] || statusStyles.approved}`}>
              {st}
            </span>
            {st === 'pending' && canManageUsers && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleApprovalChange(u._id, 'approved')}
                  className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  title="Approve User"
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => handleApprovalChange(u._id, 'rejected')}
                  className="p-1 rounded-md bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  title="Reject User"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (u) => {
        const isTargetOwner = u.role === 'organizationOwner';
        const isSelf = String(u._id) === String(currentUser?._id);
        const canEditThisUser = canManageUsers && (!isTargetOwner || isSelf);

        if (!canEditThisUser) return null;

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setPermissionsUser(u)}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Custom Permissions"
            >
              <ShieldCheck size={15} />
            </button>
            <button
              onClick={() => {
                setPasswordUser(u);
                setPasswordForm({ newPassword: '', confirmPassword: '' });
              }}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Reset Password"
            >
              <KeyRound size={15} />
            </button>
            {!isTargetOwner && !isSelf && (
              <button
                onClick={() => setDeleteUserTarget(u)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors"
                title="Delete User"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // Cards Render
  const renderCard = (u) => {
    const st = u.approvalStatus || 'approved';
    const isTargetOwner = u.role === 'organizationOwner';
    const isSelf = String(u._id) === String(currentUser?._id);
    const canEditThisUser = canManageUsers && (!isTargetOwner || isSelf);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {renderRoleBadge(u)}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusStyles[st] || statusStyles.approved}`}>
            {st}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
            u.role === 'organizationOwner' ? 'bg-amber-500/15 text-amber-600' :
            u.role === 'admin' ? 'bg-indigo-500/15 text-indigo-600' :
            u.role === 'manager' ? 'bg-emerald-500/15 text-emerald-600' :
            'bg-secondary text-foreground'
          }`}>
            {u.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-foreground truncate">{u.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/60 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Department:</span>
            <span className="font-semibold text-foreground">{u.department || 'General'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position:</span>
            <span className="font-medium text-foreground">{u.position || 'Specialist'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined:</span>
            <span className="font-medium text-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        {/* Approval action controls for pending card */}
        {st === 'pending' && canManageUsers && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Clock size={13} />
              <span>Pending Action</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApprovalChange(u._id, 'approved')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                title="Approve User"
              >
                <Check size={13} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => handleApprovalChange(u._id, 'rejected')}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-1 border border-rose-500/20 transition-all"
                title="Reject User"
              >
                <X size={13} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

        {canEditThisUser && (
          <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/40">
            <button
              onClick={() => setPermissionsUser(u)}
              className="px-2.5 py-1 rounded-lg hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1"
            >
              <ShieldCheck size={13} />
              <span>Permissions</span>
            </button>
            <button
              onClick={() => {
                setPasswordUser(u);
                setPasswordForm({ newPassword: '', confirmPassword: '' });
              }}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
              title="Reset Password"
            >
              <KeyRound size={13} />
            </button>
            {!isTargetOwner && !isSelf && (
              <button
                onClick={() => setDeleteUserTarget(u)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const companyDisplayName = organization?.name ? `${organization.name} + RWM` : 'RiseWithMedia';

  return (
    <WorkspacePage
      breadcrumbs={[companyDisplayName, 'Team & People', 'User Directory']}
      title={isTenant ? `${organization?.name || 'Company'} Team & Roles` : 'Team Directory & User Access'}
      subtitle={
        isTenant
          ? `Manage company admins, managers, specialists, and team member accounts for ${organization?.name || 'your company'}.`
          : 'Manage team accounts, permission policies, system role assignments, and registration approval workflows.'
      }
      icon="👥"
      properties={[
        { label: 'Total Members', value: total, icon: UsersIcon },
        ...(isTenant && organization
          ? [
              {
                label: 'Team Seats',
                value: `${total} / ${maxSeats}`,
                tone: total >= maxSeats ? 'warning' : 'success',
                icon: UsersIcon,
              },
            ]
          : []),
        { label: 'Admins & Managers', value: adminsAndManagersCount, tone: 'info', icon: Shield },
        { label: 'Active Status', value: activeCount, tone: 'success', icon: CheckCircle2 },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => refetch()}
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
          {canManageUsers && (
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="rounded-xl text-xs font-bold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={14} />
              <span>Add Team Member</span>
            </Button>
          )}
        </div>
      }
    >
      {/* Super Admin Notice for Company Registration Requests */}
      {currentUser?.role === 'superAdmin' && !currentUser?.organizationId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm shadow-indigo-600/20">
              <Building2 size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Looking for Company Registration Requests?</p>
              <p className="text-xs text-muted-foreground">
                External company registrations and SaaS tenant onboarding requests are managed in the separate Company Requests Dashboard.
              </p>
            </div>
          </div>
          <Link
            to="/admin/company-requests"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <span>Open Company Requests</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {(isTenant
          ? ['all', 'organizationOwner', 'admin', 'manager', 'employee']
          : ['all', 'superAdmin', 'admin', 'manager', 'employee', 'client', 'referral']
        ).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              roleFilter === r
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {r === 'all'
              ? 'All Roles'
              : r === 'organizationOwner'
              ? 'Owner'
              : r === 'admin'
              ? (isTenant ? 'Company Admin' : 'Admin')
              : r === 'manager'
              ? (isTenant ? 'Company Manager' : 'Manager')
              : r === 'employee'
              ? 'Team Members'
              : r.replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      <DatabaseView
        viewKey="rwm_users_view_v1"
        views={['table', 'cards']}
        items={filteredUsers}
        totalCount={filteredUsers.length}
        searchPlaceholder={
          isTenant
            ? `Search ${organization?.name || 'company'} members by name, email, role, or department...`
            : 'Search team members by name, email, role, or department...'
        }
        columns={tableColumns}
        renderCard={renderCard}
        onSearchChange={setSearchTerm}
      />

      {/* Add Team Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg bg-card border border-border shadow-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <UserPlus size={16} />
              </div>
              <DialogTitle className="text-lg font-black text-foreground">
                {isTenant ? `Add Team Member to ${organization?.name || 'Company'}` : 'Create New User Account'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a dedicated login for a Company Admin, Manager, or Employee.
              {isTenant && (
                <span className="block mt-1 font-semibold text-foreground/80">
                  Plan Usage: {total} of {maxSeats} seats assigned.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUserSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Initial Password *</label>
                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 pr-9 text-xs focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Assigned Role *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {isTenant ? (
                    companyRoles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))
                  ) : (
                    platformRoles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Department</label>
                <input
                  type="text"
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                  placeholder="e.g. Engineering, Sales"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Position / Job Title</label>
                <input
                  type="text"
                  value={addForm.position}
                  onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                  placeholder="e.g. Lead Project Manager"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
              />
            </div>

            {isTenant && total >= maxSeats && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                Warning: You have reached the maximum seat limit ({maxSeats}) for this plan. You may need to upgrade to create more users.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingUser}
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmittingUser ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      {permissionsUser && (
        <UserPermissionsModal
          isOpen={Boolean(permissionsUser)}
          onClose={() => setPermissionsUser(null)}
          user={permissionsUser}
          onSave={async (userId, data) => {
            await updateUser.mutateAsync({ id: userId, data });
          }}
        />
      )}

      {/* Reset Password Modal */}
      <Dialog open={Boolean(passwordUser)} onOpenChange={(open) => !open && setPasswordUser(null)}>
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-foreground">Reset Password for {passwordUser?.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set a new secure password for this user account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPasswordFields.newPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground hover:text-foreground"
                  aria-label={showPasswordFields.newPassword ? 'Hide password' : 'Show password'}
                >
                  {showPasswordFields.newPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswordFields.confirmPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground hover:text-foreground"
                  aria-label={showPasswordFields.confirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showPasswordFields.confirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPasswordUser(null)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="rounded-xl text-xs font-bold">
                Update Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <AlertDialog open={Boolean(deleteUserTarget)} onOpenChange={(open) => !open && setDeleteUserTarget(null)}>
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete {deleteUserTarget?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteUserTarget) {
                  await deleteUser.mutateAsync(deleteUserTarget._id);
                  setDeleteUserTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-bold"
            >
              Delete User
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </WorkspacePage>
  );
};

export default Users;
