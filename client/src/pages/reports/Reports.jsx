import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, IndianRupee, Users, Briefcase, CheckCircle2,
  AlertTriangle, Target, BarChart3, Award, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAdminReport } from '../../hooks/useReports';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useAdminReport();
  const [period, setPeriod] = useState('6m');

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-card rounded-3xl border border-border" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-card rounded-2xl border border-border" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-72 bg-card rounded-2xl border border-border" />)}
        </div>
      </div>
    );
  }

  const revenue = (charts.revenueChart || []).map(item => ({
    month: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(item._id?.month || 1) - 1]}`,
    revenue: item.revenue || 0,
  }));

  const leadFunnel = (charts.stageFunnel || []).map(item => ({
    stage: String(item._id || '').replace(/_/g, ' '),
    count: item.count,
  }));

  const taskBreakdown = (charts.taskBreakdown || []).map(item => ({
    status: String(item._id || '').replace(/_/g, ' '),
    count: item.count,
  }));

  const totalLeads = leadFunnel.reduce((s, i) => s + i.count, 0);
  const wonLeads = leadFunnel.find(l => l.stage === 'won')?.count || 0;
  const convRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const formatCompactCurrency = (value) => (
    value >= 1000
      ? `₹${(value / 1000).toFixed(0)}k`
      : `₹${Number(value || 0).toLocaleString('en-IN')}`
  );

  const kpiCards = [
    {
      label: 'Revenue This Month',
      value: formatCurrency(stats.monthRevenue),
      icon: IndianRupee,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth || 0}%`,
      up: (stats.revenueGrowth || 0) >= 0,
      sub: 'vs last month',
    },
    {
      label: 'Lead Conversion',
      value: `${convRate}%`,
      icon: Target,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: `${wonLeads} won`,
      up: true,
      sub: `${totalLeads} total leads`,
    },
    {
      label: 'Active Clients',
      value: stats.activeClients || 0,
      icon: Users,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      trend: `${stats.totalClients || 0} total`,
      up: true,
      sub: 'In active contracts',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects || 0,
      icon: Briefcase,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      trend: `${stats.totalProjects || 0} total`,
      up: true,
      sub: 'Currently in delivery',
    },
    {
      label: 'Tasks Overdue',
      value: stats.overdueTasks || 0,
      icon: AlertTriangle,
      color: stats.overdueTasks > 0 ? 'text-red-500' : 'text-emerald-500',
      bg: stats.overdueTasks > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      trend: `${stats.totalTasks || 0} total`,
      up: stats.overdueTasks === 0,
      sub: 'Require attention',
    },
    {
      label: 'Team Members',
      value: stats.totalUsers || 0,
      icon: Award,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      trend: 'Active',
      up: true,
      sub: 'Active accounts',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 size={24} className="text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Company-wide revenue, pipeline health, and delivery metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
          {['3m', '6m', '12m'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-start gap-4 card-hover"
          >
            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} flex-shrink-0`}>
              <card.icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">{card.label}</p>
              <p className="text-2xl font-bold mt-1 tracking-tight">{card.value}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {card.up
                  ? <ArrowUpRight size={12} className="text-emerald-500" />
                  : <ArrowDownRight size={12} className="text-red-500" />
                }
                <span className={`text-xs font-semibold ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>{card.trend}</span>
                <span className="text-xs text-muted-foreground">· {card.sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Revenue Trend - wide */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold">Revenue Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue from paid invoices</p>
            </div>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={formatCompactCurrency} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={v => [formatCurrency(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Breakdown Pie */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold">Task Status</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Current task distribution</p>
            </div>
            <CheckCircle2 size={18} className="text-primary" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="count" nameKey="status">
                  {taskBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {taskBreakdown.slice(0, 4).map((item, i) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground capitalize">{item.status}</span>
                </div>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Lead Funnel */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold">Lead Funnel</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Leads by pipeline stage</p>
            </div>
            <Target size={18} className="text-primary" />
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]}>
                  {leadFunnel.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Health Summary */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="mb-6">
            <h2 className="font-bold">Business Health</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Key performance ratios</p>
          </div>
          <div className="space-y-5">
            {[
              {
                label: 'Lead Conversion Rate',
                value: convRate,
                max: 100,
                color: 'bg-emerald-500',
                note: `${wonLeads} won from ${totalLeads} leads`,
              },
              {
                label: 'Client Retention',
                value: stats.activeClients && stats.totalClients
                  ? Math.round((stats.activeClients / stats.totalClients) * 100)
                  : 0,
                max: 100,
                color: 'bg-blue-500',
                note: `${stats.activeClients || 0} of ${stats.totalClients || 0} clients active`,
              },
              {
                label: 'Project Delivery',
                value: stats.activeProjects && stats.totalProjects
                  ? Math.round((stats.activeProjects / stats.totalProjects) * 100)
                  : 0,
                max: 100,
                color: 'bg-indigo-500',
                note: `${stats.activeProjects || 0} active of ${stats.totalProjects || 0}`,
              },
              {
                label: 'Task Completion',
                value: stats.totalTasks > 0 && stats.overdueTasks !== undefined
                  ? Math.max(0, Math.round(((stats.totalTasks - stats.overdueTasks) / stats.totalTasks) * 100))
                  : 0,
                max: 100,
                color: stats.overdueTasks > 0 ? 'bg-amber-500' : 'bg-emerald-500',
                note: `${stats.overdueTasks || 0} overdue tasks`,
              },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">{metric.label}</span>
                  <span className="font-bold">{metric.value}%</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(metric.value, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${metric.color}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{metric.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
