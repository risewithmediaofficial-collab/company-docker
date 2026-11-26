import { useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  IndianRupee,
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from '@/components/ui/muiIcons';
import {
  useDeleteEmployee,
  useDeleteVendor,
  useEmployees,
  useVendorsDirectory,
} from '../../hooks/useHR';
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';
import { AddVendorModal } from '../../components/modals/AddVendorModal';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import WorkspacePage from '../../components/ui/WorkspacePage';
import DatabaseView from '../../components/ui/DatabaseView';
import { formatINR } from '../../utils/financeFormatters';
import { cn } from '../../utils/cn';

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

const HR = () => {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'vendors'

  // Employee state
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Vendor state
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deleteVendorId, setDeleteVendorId] = useState(null);
  const [vendorSearch, setVendorSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

  const { data: rawEmployees = [] } = useEmployees({ search: searchTerm });
  const { data: rawVendors = [] } = useVendorsDirectory({ search: vendorSearch });
  const deleteEmployeeMutation = useDeleteEmployee();
  const deleteVendorMutation = useDeleteVendor();

  const isEmpClockedIn = (employee) => {
    const att = employee.todayAttendance;
    if (!att) return false;
    if (att.isClockedIn !== undefined) return att.isClockedIn;
    if (att.sessions && att.sessions.length > 0) return att.sessions.some((s) => !s.clockOut);
    return Boolean(att.clockIn && !att.clockOut);
  };

  // Employees filters & stats
  const departments = useMemo(() => {
    const set = new Set(rawEmployees.map((e) => e.department).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [rawEmployees]);

  const filteredEmployees = useMemo(() => {
    return rawEmployees.filter((emp) => {
      const q = searchTerm.toLowerCase();
      const name = (emp.name || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const dept = (emp.department || '').toLowerCase();
      const matchesSearch = !q || name.includes(q) || email.includes(q) || dept.includes(q);
      const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [rawEmployees, searchTerm, deptFilter]);

  const activeEmployees = rawEmployees.filter(
    (e) => e.status === 'Active' || e.employmentStatus === 'active'
  ).length;
  const clockedInNow = rawEmployees.filter(isEmpClockedIn).length;
  const loggedHoursToday = rawEmployees.reduce(
    (sum, e) => sum + Number(e.todayAttendance?.totalHours || 0),
    0
  );

  // Vendors filters & stats
  const vendorPositions = useMemo(() => {
    const set = new Set(rawVendors.map((v) => v.position).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [rawVendors]);

  const filteredVendors = useMemo(() => {
    return rawVendors.filter((v) => {
      const q = vendorSearch.toLowerCase();
      const matchesSearch =
        !q ||
        (v.name || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q) ||
        (v.position || '').toLowerCase().includes(q) ||
        (v.vendorCompany || '').toLowerCase().includes(q);
      const matchesPos = positionFilter === 'all' || v.position === positionFilter;
      return matchesSearch && matchesPos;
    });
  }, [rawVendors, vendorSearch, positionFilter]);

  const activeVendorsCount = rawVendors.filter((v) => v.isActive !== false).length;
  const totalVendorTasks = rawVendors.reduce((sum, v) => sum + Number(v.assignedTaskCount || 0), 0);
  const totalVendorPending = rawVendors.reduce(
    (sum, v) => sum + Number(v.financeSummary?.totalPending || 0),
    0
  );

  // Employee Columns
  const employeeColumns = [
    {
      key: 'name',
      label: 'Employee Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-secondary text-foreground flex items-center justify-center font-bold text-xs shrink-0">
            {row.name?.charAt(0) || 'E'}
          </div>
          <div>
            <p className="font-bold text-foreground">{row.name}</p>
            <p className="text-[11px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => (
        <span className="font-semibold text-xs text-foreground">
          {row.department || row.position || 'General'}
        </span>
      ),
    },
    {
      key: 'clockIn',
      label: 'Today Attendance',
      render: (row) => {
        const clockedIn = isEmpClockedIn(row);
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                clockedIn ? 'bg-foreground' : 'bg-muted-foreground/40'
              }`}
            />
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {clockedIn
                ? `Clocked In (${formatTime(row.todayAttendance?.clockIn)})`
                : 'Not Clocked In'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'totalHours',
      label: 'Logged Hours',
      render: (row) => (
        <span className="font-bold text-xs text-foreground tabular-nums">
          {row.todayAttendance?.totalHours ? `${row.todayAttendance.totalHours} hrs` : '0 hrs'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedEmployee(row);
              setShowAddEmployeeModal(true);
            }}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteEmployeeId(row._id)}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Vendor Columns
  const vendorColumns = [
    {
      key: 'name',
      label: 'Vendor & Login',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name?.charAt(0) || 'V'}
          </div>
          <div>
            <p className="font-bold text-foreground">
              {row.name}
              {row.vendorCompany ? (
                <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                  ({row.vendorCompany})
                </span>
              ) : null}
            </p>
            <p className="text-[11px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      label: 'Position',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-amber-500/12 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-semibold">
          {row.position || 'Vendor'}
        </span>
      ),
    },
    {
      key: 'loginStatus',
      label: 'Portal Login',
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            row.isActive !== false
              ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
              : 'bg-secondary text-muted-foreground'
          )}
        >
          <KeyRound size={11} />
          {row.isActive !== false ? 'Login Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'tasks',
      label: 'Assigned Tasks',
      render: (row) => (
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {row.activeTaskCount || 0} active / {row.assignedTaskCount || 0} total
        </span>
      ),
    },
    {
      key: 'finance',
      label: 'Finance Status',
      render: (row) => (
        <div className="text-xs tabular-nums">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Paid {formatINR(row.financeSummary?.totalPaid || 0)}
          </span>
          <span className="mx-1 text-muted-foreground">·</span>
          <span
            className={cn(
              'font-semibold',
              (row.financeSummary?.totalPending || 0) > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground'
            )}
          >
            Due {formatINR(row.financeSummary?.totalPending || 0)}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedVendor(row);
              setShowAddVendorModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            title="Edit Vendor / Reset Login Password"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteVendorId(row._id)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive cursor-pointer"
            title="Delete Vendor"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Employee Cards Render
  const renderEmployeeCard = (row) => {
    const clockedIn = isEmpClockedIn(row);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary uppercase tracking-wider">
            {row.department || 'General'}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              clockedIn
                ? 'bg-primary text-primary-foreground '
                : 'bg-secondary text-muted-foreground '
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                clockedIn ? 'bg-primary-foreground' : 'bg-muted-foreground'
              }`}
            />
            {clockedIn ? 'Clocked In' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center font-black text-sm text-foreground shrink-0">
            {row.name?.charAt(0) || 'E'}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-foreground truncate">{row.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{row.email}</p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-secondary/40 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Today&apos;s Hours:</span>
            <span className="font-bold text-foreground tabular-nums">
              {row.todayAttendance?.totalHours ? `${row.todayAttendance.totalHours} hrs` : '0 hrs'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Join Date:</span>
            <span className="font-medium text-foreground tabular-nums">
              {new Date(row.joinDate || row.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 pt-1 ">
          <button
            onClick={() => {
              setSelectedEmployee(row);
              setShowAddEmployeeModal(true);
            }}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setDeleteEmployeeId(row._id)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  // Vendor Cards Render
  const renderVendorCard = (row) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 truncate">
          {row.position || 'Vendor'}
        </span>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0',
            row.isActive !== false
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'bg-secondary text-muted-foreground'
          )}
        >
          <KeyRound size={10} />
          {row.isActive !== false ? 'Portal Active' : 'Disabled'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-amber-500/12 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
          {row.name?.charAt(0) || 'V'}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-foreground truncate">{row.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{row.email}</p>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-secondary/40 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Assigned Tasks:</span>
          <span className="font-bold text-foreground tabular-nums">
            {row.activeTaskCount || 0} active ({row.assignedTaskCount || 0} total)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Paid / Due:</span>
          <span className="font-bold text-foreground tabular-nums">
            {formatINR(row.financeSummary?.totalPaid || 0)} /{' '}
            <span className="text-amber-600 dark:text-amber-400">
              {formatINR(row.financeSummary?.totalPending || 0)}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 pt-1">
        <button
          onClick={() => {
            setSelectedVendor(row);
            setShowAddVendorModal(true);
          }}
          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          title="Edit / Reset Password"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => setDeleteVendorId(row._id)}
          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive cursor-pointer"
          title="Delete Vendor"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );

  const isVendorsTab = activeTab === 'vendors';

  return (
    <WorkspacePage
      breadcrumbs={['RiseWithMedia', 'Team & Workload', 'HR & Hiring']}
      title={isVendorsTab ? 'External Vendors Directory' : 'HR & Team Directory'}
      icon={isVendorsTab ? Briefcase : Users}
      properties={
        isVendorsTab
          ? [
              { label: 'Total Vendors', value: rawVendors.length, tone: 'neutral', icon: Briefcase },
              { label: 'Active Logins', value: activeVendorsCount, tone: 'neutral', icon: KeyRound },
              { label: 'Assigned Tasks', value: totalVendorTasks, tone: 'neutral', icon: CheckCircle2 },
              { label: 'Pending Payouts', value: formatINR(totalVendorPending), tone: 'neutral', icon: IndianRupee },
            ]
          : [
              { label: 'Active Team', value: activeEmployees, tone: 'neutral', icon: Users },
              { label: 'Clocked In Now', value: clockedInNow, tone: 'neutral', icon: UserCheck },
              { label: 'Departments', value: departments.length - 1, icon: Building2 },
              { label: 'Logged Hours Today', value: `${loggedHoursToday.toFixed(1)} hrs`, tone: 'neutral', icon: Clock },
            ]
      }
      actions={
        isVendorsTab ? (
          <Button
            size="sm"
            onClick={() => {
              setSelectedVendor(null);
              setShowAddVendorModal(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl transition-all hover:bg-primary/90 min-h-[38px] cursor-pointer"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Add Vendor</span>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              setSelectedEmployee(null);
              setShowAddEmployeeModal(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl transition-all hover:bg-primary/90 min-h-[38px] cursor-pointer"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Add Employee</span>
          </Button>
        )
      }
    >
      {/* Separate Section Switcher: Employees vs External Vendors */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border/70">
        <div className="inline-flex items-center rounded-xl bg-secondary p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              !isVendorsTab
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users size={14} />
            <span>Employees</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
              {rawEmployees.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              isVendorsTab
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Briefcase size={14} className="text-amber-600" />
            <span>Vendors (Separate Portal)</span>
            <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
              {rawVendors.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-primary" />
          {isVendorsTab
            ? 'Vendors log in to view only their assigned tasks and their own payout status.'
            : 'Internal employees directory & attendance tracking.'}
        </span>
      </div>

      {!isVendorsTab ? (
        <>
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 custom-scrollbar">
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
                  deptFilter === d
                    ? 'bg-primary text-primary-foreground '
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {d === 'all' ? 'All Departments' : d}
              </button>
            ))}
          </div>

          <DatabaseView
            viewKey="rwm_hr_view_v1"
            views={['cards', 'table']}
            items={filteredEmployees}
            totalCount={filteredEmployees.length}
            searchPlaceholder="Search employees by name, department, or email..."
            columns={employeeColumns}
            renderCard={renderEmployeeCard}
            onSearchChange={setSearchTerm}
          />
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 custom-scrollbar">
            {vendorPositions.map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
                  positionFilter === pos
                    ? 'bg-primary text-primary-foreground '
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {pos === 'all' ? 'All Positions' : pos}
              </button>
            ))}
          </div>

          <DatabaseView
            viewKey="rwm_hr_vendors_view_v1"
            views={['table', 'cards']}
            items={filteredVendors}
            totalCount={filteredVendors.length}
            searchPlaceholder="Search vendors by name, position, studio, or email..."
            columns={vendorColumns}
            renderCard={renderVendorCard}
            onSearchChange={setVendorSearch}
          />
        </>
      )}

      <AddEmployeeModal
        open={showAddEmployeeModal}
        onOpenChange={setShowAddEmployeeModal}
        employee={selectedEmployee}
      />

      <AddVendorModal
        open={showAddVendorModal}
        onOpenChange={setShowAddVendorModal}
        vendor={selectedVendor}
      />

      {/* Delete Employee Dialog */}
      <AlertDialog
        open={Boolean(deleteEmployeeId)}
        onOpenChange={(open) => !open && setDeleteEmployeeId(null)}
      >
        <AlertDialogContent className="bg-card ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete Employee Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              This action will remove the employee from the HR directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteEmployeeId) {
                  await deleteEmployeeMutation.mutateAsync(deleteEmployeeId);
                  setDeleteEmployeeId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-bold"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Vendor Dialog */}
      <AlertDialog
        open={Boolean(deleteVendorId)}
        onOpenChange={(open) => !open && setDeleteVendorId(null)}
      >
        <AlertDialogContent className="bg-card ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete Vendor Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This revokes the vendor&apos;s login portal access and removes them from the HR Vendors directory. Historical bills remain safely archived in Finance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteVendorId) {
                  await deleteVendorMutation.mutateAsync(deleteVendorId);
                  setDeleteVendorId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-bold"
            >
              Delete Vendor
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </WorkspacePage>
  );
};

export default HR;
