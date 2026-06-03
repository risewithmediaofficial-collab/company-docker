import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckSquare,
  Award,
  DollarSign,
  ShieldCheck,
  Target,
  ClipboardList,
  Wallet,
  Send,
  Copy
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import api from '../api';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'superAdmin' || user.role === 'manager'
        ? '/reports/admin'
        : user.role === 'client'
          ? '/reports/client'
          : user.role === 'referral'
            ? '/referrals'
            : '/reports/employee';
          
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.role) return;
    fetchStats();
  }, [user?.role]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchStats();
    };

    socket.on('userCreated', handleUpdate);
    socket.on('clientCreated', handleUpdate);

    return () => {
      socket.off('userCreated', handleUpdate);
      socket.off('clientCreated', handleUpdate);
    };
  }, [socket]);

  if (!user || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card rounded-2xl border border-border"></div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">We could not load your dashboard data. Please refresh or sign in again.</p>
      </div>
    );
  }

  const renderAdminStats = () => {
    const taskBreakdown = data.charts.taskBreakdown || [];
    const stageFunnel = data.charts.stageFunnel || [];
    const completedTasks = taskBreakdown
      .filter((item) => ['done', 'approved'].includes(item._id))
      .reduce((sum, item) => sum + item.count, 0);
    const taskCompletionRate = data.stats.totalTasks > 0
      ? Math.round((completedTasks / data.stats.totalTasks) * 100)
      : 0;
    const avgRevenuePerClient = data.stats.activeClients > 0
      ? Math.round(data.stats.monthRevenue / data.stats.activeClients)
      : 0;
    const pipelineLeads = stageFunnel.reduce((sum, item) => sum + item.count, 0);
    const wonLeads = stageFunnel.find((item) => item._id === 'won')?.count || 0;
    const isManager = user.role === 'manager';
    const roleTitle = isManager ? 'Manager Workspace' : 'Executive Dashboard';
    const roleSubtitle = isManager
      ? 'Team delivery, client health, and work requiring your attention.'
      : "Company-wide revenue, pipeline, operations, and user health.";
    const analyticsCards = [
      {
        label: isManager ? 'Team Completion' : 'Task Completion',
        value: `${taskCompletionRate}%`,
        detail: `${completedTasks} of ${data.stats.totalTasks} tasks closed`,
        color: 'bg-emerald-500',
      },
      {
        label: 'Pipeline Volume',
        value: pipelineLeads,
        detail: `${wonLeads} won opportunities`,
        color: 'bg-blue-500',
      },
      {
        label: isManager ? 'Client Avg. Value' : 'Revenue / Active Client',
        value: `₹${avgRevenuePerClient.toLocaleString()}`,
        detail: 'Monthly average from paid invoices',
        color: 'bg-indigo-500',
      },
      {
        label: 'Overdue Work',
        value: data.stats.overdueTasks,
        detail: 'Tasks past due date',
        color: 'bg-amber-500',
      },
    ];

    const stats = [
      { label: isManager ? 'Managed Revenue' : 'Total Revenue', value: `₹${data.stats.monthRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: `${data.stats.revenueGrowth}%`, up: data.stats.revenueGrowth >= 0 },
      { label: isManager ? 'Active Clients' : 'Total Clients', value: data.stats.totalClients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Active', up: true },
      { label: isManager ? 'Projects In Delivery' : 'Active Projects', value: data.stats.activeProjects, icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-500/10', trend: 'In Delivery', up: true },
      { label: isManager ? 'Team Tasks' : 'Conversion Rate', value: isManager ? data.stats.totalTasks : `${data.stats.conversionRate}%`, icon: isManager ? ClipboardList : CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: isManager ? `${data.stats.overdueTasks} Overdue` : 'Won Deals', up: !isManager || data.stats.overdueTasks === 0 },
    ];

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {isManager ? <Target size={22} /> : <ShieldCheck size={22} />}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{roleTitle}</h1>
                <p className="text-muted-foreground text-sm">Welcome back, {user.name}. {roleSubtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Link to="/calendar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
            <Calendar size={16} />
            Content Calendar
          </Link>
          <div className="flex items-center space-x-2 bg-card p-1 rounded-xl border border-border shadow-sm">
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-foreground">Overview</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors">Analytics</button>
          </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm card-hover"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                  {stat.up ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold">{isManager ? 'Delivery Revenue' : 'Revenue Growth'}</h3>
              <select className="bg-secondary/50 border-none text-xs rounded-lg px-2 py-1 focus:ring-0">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.revenueChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="_id" 
                    tickFormatter={(val) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][val.month - 1]}`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold mb-6">{isManager ? 'Team Pipeline' : 'Lead Funnel'}</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.stageFunnel}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.charts.stageFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {data.charts.stageFunnel.slice(0, 4).map((entry, i) => (
                <div key={entry._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i % 4] }}></div>
                    <span className="capitalize text-muted-foreground">{entry._id.replace('_', ' ')}</span>
                  </div>
                  <span className="font-bold">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Analytics</h2>
              <p className="text-sm text-muted-foreground">Operational health across revenue, pipeline, and delivery.</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground bg-card border border-border rounded-full px-3 py-1">
              Live MongoDB data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {analyticsCards.map((card) => (
              <div key={card.label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
                </div>
                <p className="mt-3 text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Task Productivity</h3>
                <span className="text-xs text-muted-foreground">{taskCompletionRate}% completion</span>
              </div>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="_id"
                      tickFormatter={(value) => String(value).replace(/_/g, ' ')}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Lead Stage Analytics</h3>
                <span className="text-xs text-muted-foreground">{data.stats.conversionRate}% conversion</span>
              </div>
              <div className="space-y-4">
                {stageFunnel.length > 0 ? stageFunnel.map((stage) => {
                  const width = pipelineLeads > 0 ? Math.max(8, Math.round((stage.count / pipelineLeads) * 100)) : 0;
                  return (
                    <div key={stage._id}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="capitalize font-medium">{String(stage._id).replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground">{stage.count}</span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                    No lead data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeeStats = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Personal Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome, {user.name}. Here's your focus for today.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/calendar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
              <Calendar size={18} />
              Content Calendar
            </Link>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="mr-2" />
              <span className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
                <h3 className="font-bold flex items-center">
                  <CheckCircle2 size={18} className="mr-2 text-primary" />
                  Priority Tasks
                </h3>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{data.myTasks.length} Assigned</span>
              </div>
              <div className="divide-y divide-border">
                {data.myTasks.length > 0 ? data.myTasks.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <CheckSquare size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{task.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{task.project?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center text-muted-foreground">
                        <Clock size={14} className="mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <span className={`px-2 py-1 rounded-lg font-bold capitalize ${
                        task.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                        task.priority === 'high' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground">No tasks assigned today. Take a break!</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Attendance */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-bold mb-4">Daily Attendance</h3>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl mb-4 border border-border">
                <div className="flex items-center">
                  <Clock size={20} className="text-primary mr-3" />
                  <div>
                    <p className="text-xs text-muted-foreground">Clock In</p>
                    <p className="text-sm font-bold">{data.todayAttendance?.clockIn ? new Date(data.todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                  </div>
                </div>
                {!data.todayAttendance?.clockIn && (
                  <Link to="/attendance" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all">Clock In</Link>
                )}
              </div>
              <div className="space-y-3">
                <Link to="/calendar" className="block w-full text-center py-2.5 rounded-xl bg-primary text-white text-sm font-bold transition-colors hover:bg-primary/90">Open Content Calendar</Link>
                <Link to="/attendance" className="block w-full text-center py-2.5 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">Submit EOD Report</Link>
                <Link to="/chat" className="block w-full text-center py-2.5 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">Message Manager</Link>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm bg-gradient-to-br from-indigo-600 to-primary text-white">
              <Award size={32} className="mb-4 opacity-50" />
              <h3 className="text-lg font-bold leading-tight">Weekly Progress</h3>
              <p className="text-white/70 text-xs mt-1">You've completed {data.completedThisWeek} tasks this week. Keep crushing it!</p>
              <div className="mt-4 bg-white/20 h-2 rounded-full">
                <div className="bg-white h-full rounded-full" style={{ width: `${Math.min(100, (data.completedThisWeek / 10) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClientStats = () => {
    const projects = data.projects || [];
    const invoices = data.invoices || [];
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-muted-foreground text-sm">Project progress and recent billing for {data.client?.company || data.client?.name || user.name}.</p>
          </div>
          <Link to="/calendar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
            <Calendar size={16} />
            Content Calendar
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Active Projects', projects.filter((project) => project.status === 'active').length || projects.length, Briefcase],
            ['Open Invoices', invoices.filter((invoice) => invoice.status !== 'paid').length, DollarSign],
            ['Average Progress', projects.length ? `${Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length)}%` : '0%', CheckCircle2],
          ].map(([label, value, Icon]) => (
            <div key={label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <Icon size={20} className="text-primary mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-bold mb-4">Projects</h2>
            <div className="space-y-3">
              {projects.length ? projects.map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} className="block rounded-xl border border-border p-4 hover:bg-secondary/40">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{project.name}</span>
                    <span className="capitalize text-muted-foreground">{String(project.status).replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </Link>
              )) : <p className="text-sm text-muted-foreground">No projects are visible yet.</p>}
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-bold mb-4">Recent Invoices</h2>
            <div className="space-y-3">
              {invoices.length ? invoices.map((invoice) => (
                <div key={invoice._id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                    <span className="capitalize text-muted-foreground">{invoice.status}</span>
                  </div>
                  <p className="mt-2 text-xl font-bold">${Number(invoice.total || 0).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No invoices found.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReferralStats = () => {
    const referrals = data.referrals || [];
    const converted = referrals.filter((referral) => referral.status === 'converted').length;
    const pending = referrals.filter((referral) => !referral.isPaid && referral.status === 'converted').length;
    const conversionRate = referrals.length ? Math.round((converted / referrals.length) * 100) : 0;
    const recentReferrals = referrals.slice(0, 5);
    const stats = [
      { label: 'Total Earnings', value: `₹${Number(data.totalEarnings || 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Pending Payouts', value: `₹${Number(data.pendingEarnings || 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Submitted Leads', value: referrals.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
      { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const copyRefCode = () => {
      if (!user.referralCode) return;
      navigator.clipboard.writeText(user.referralCode);
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Award size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Referral Partner Home</h1>
              <p className="text-muted-foreground text-sm">Track your network, commissions, and active lead submissions.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/calendar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              <Calendar size={16} />
              Content Calendar
            </Link>
            <button
              onClick={copyRefCode}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold hover:bg-secondary transition-colors"
            >
              <Copy size={16} />
              {user.referralCode || 'No referral code'}
            </button>
            <Link to="/referral" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              <Send size={16} />
              Open Partner Portal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={stat.label}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm card-hover"
            >
              <div className={`mb-5 inline-flex rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/20">
              <h2 className="font-bold">Recent Referrals</h2>
              <span className="text-xs font-semibold text-muted-foreground">{pending} pending payout</span>
            </div>
            <div className="divide-y divide-border">
              {recentReferrals.length ? recentReferrals.map((referral) => (
                <div key={referral._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{referral.lead?.name || 'Manual submission'}</p>
                    <p className="text-xs text-muted-foreground">{referral.lead?.email || 'Lead details pending'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      referral.status === 'converted' ? 'bg-emerald-500/10 text-emerald-600' :
                      referral.status === 'qualified' ? 'bg-blue-500/10 text-blue-600' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {referral.status}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">${Number(referral.commissionAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No referrals yet. Your submitted leads will appear here.
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-bold">Partner Next Steps</h2>
            <div className="mt-5 space-y-4">
              {[
                ['Share your code', 'Use it with warm introductions and campaign links.'],
                ['Submit qualified leads', 'Add context so the sales team can follow up quickly.'],
                ['Track commissions', 'Converted leads move into payout review automatically.'],
              ].map(([title, detail], index) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      {user.role === 'superAdmin' || user.role === 'manager'
        ? renderAdminStats()
        : user.role === 'client'
          ? renderClientStats()
          : user.role === 'referral'
            ? renderReferralStats()
            : renderEmployeeStats()}
    </div>
  );
};

export default Dashboard;
