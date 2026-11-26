import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  CheckSquare,
  Clock,
  IndianRupee,
  Receipt,
} from '@/components/ui/muiIcons';
import { useTasks } from '../../hooks/useTasks';
import { useVendorMyFinance } from '../../hooks/useFinance';
import { formatINR } from '../../utils/financeFormatters';
import WorkspacePage from '../../components/ui/WorkspacePage';
import { Button } from '../../components/ui/button';
import { formatTaskTypeLabel, normalizeTaskStatusLabel } from '../../utils/taskFields';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({ parent: 'all', limit: 200 });
  const { data: financeData, isLoading: financeLoading } = useVendorMyFinance();

  const summary = financeData?.summary || {
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    billCount: 0,
  };
  const recentBills = (financeData?.bills || []).slice(0, 5);

  const taskStats = useMemo(() => {
    let active = 0;
    let completed = 0;
    tasks.forEach((t) => {
      const label = normalizeTaskStatusLabel(t.status);
      if (label === 'Completed' || label === 'Approved') completed += 1;
      else active += 1;
    });
    return { total: tasks.length, active, completed };
  }, [tasks]);

  const recentTasks = useMemo(() => tasks.slice(0, 6), [tasks]);

  return (
    <WorkspacePage
      breadcrumbs={['Vendor Portal', user?.position || 'External Vendor', 'Overview']}
      title={`Welcome, ${user?.name || 'Vendor'}`}
      icon={Briefcase}
      properties={[
        { label: 'Position', value: user?.position || 'External Vendor', tone: 'neutral', icon: Briefcase },
        { label: 'Active Tasks', value: taskStats.active, tone: 'neutral', icon: CheckSquare },
        { label: 'Paid So Far', value: formatINR(summary.totalPaid), tone: 'success', icon: CheckCircle2 },
        { label: 'Pending Payout', value: formatINR(summary.totalPending), tone: summary.totalPending > 0 ? 'warning' : 'neutral', icon: Clock },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/my-finance')}>
            <IndianRupee size={14} className="mr-1.5" />
            My Finance
          </Button>
          <Button size="sm" onClick={() => navigate('/tasks')}>
            <CheckSquare size={14} className="mr-1.5" />
            My Tasks
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Assigned Tasks Only */}
        <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">My Assigned Tasks ({taskStats.total})</h2>
              <p className="text-xs text-muted-foreground">
                Showing only deliverables assigned to your account
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Open All Tasks <ArrowUpRight size={13} />
            </button>
          </div>

          {tasksLoading ? (
            <div className="py-10 text-center text-xs text-muted-foreground">Loading your tasks...</div>
          ) : recentTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No tasks have been assigned to you yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => {
                const statusLabel = normalizeTaskStatusLabel(task.status);
                return (
                  <button
                    key={task._id}
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="w-full text-left rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-secondary/30 p-3.5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {task.taskTitle || task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {formatTaskTypeLabel(task.taskType)}
                        {task.project?.name ? ` • ${task.project.name}` : ''}
                        {task.dueDate ? ` • Due ${format(new Date(task.dueDate), 'MMM d')}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                      {statusLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Own Finance Status Only */}
        <div className="lg:col-span-5 bg-card rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">My Finance Status</h2>
              <p className="text-xs text-muted-foreground">Your personal bills & payout clearance</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/my-finance')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Full Statement <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-secondary/40 p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Billed</p>
              <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
                {formatINR(summary.totalBilled)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <p className="text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                Paid
              </p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                {formatINR(summary.totalPaid)}
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3">
              <p className="text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-300">
                Pending
              </p>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums mt-0.5">
                {formatINR(summary.totalPending)}
              </p>
            </div>
          </div>

          {financeLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading finance status...</div>
          ) : recentBills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
              <Receipt size={18} className="text-muted-foreground/60" />
              <span>No payout bills recorded yet.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBills.map((bill) => (
                <button
                  key={bill._id}
                  type="button"
                  onClick={() => navigate('/my-finance')}
                  className="w-full text-left rounded-xl border border-border bg-background hover:bg-secondary/30 p-3 flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{bill.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {bill.date ? format(new Date(bill.date), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <p className="text-xs font-bold text-foreground">{formatINR(bill.amount)}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground capitalize">
                      {String(bill.paymentStatus || 'unpaid').replace('_', ' ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspacePage>
  );
}
