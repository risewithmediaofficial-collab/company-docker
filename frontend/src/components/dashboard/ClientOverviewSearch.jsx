import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  FolderKanban,
  CheckSquare,
  X,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  Plus,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileText,
  User,
  Loader,
} from '@/components/ui/muiIcons';
import api from '../../api';
import { formatINR } from '../../utils/currency';
import { toast } from 'sonner';

export const ClientOverviewSearch = ({ onCreateTask, onCreateProject }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOverview, setSelectedOverview] = useState(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'projects' | 'tasks'
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'overdue' | 'completed'

  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced client suggestion search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get('/clients', { params: { search: query.trim(), limit: 8 } });
        const list = res.data?.clients || res.data?.data || [];
        setSuggestions(list);
        setIsDropdownOpen(list.length > 0);
      } catch (err) {
        console.error('Client autocomplete error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const loadClientOverview = async (identifier) => {
    if (!identifier) return;
    setIsLoadingOverview(true);
    setIsDropdownOpen(false);
    try {
      const res = await api.get('/clients/lookup/overview', {
        params: { search: identifier },
      });
      if (res.data?.success) {
        setSelectedOverview(res.data);
      }
    } catch (err) {
      console.error('Failed to load client 360 overview:', err);
      toast.error(err.response?.data?.message || 'Could not load client details');
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    loadClientOverview(query.trim());
  };

  const handleSelectSuggestion = (client) => {
    setQuery(client.clientId || client.company || client.name);
    setIsDropdownOpen(false);
    loadClientOverview(client._id || client.clientId);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedOverview(null);
    setSuggestions([]);
    setIsDropdownOpen(false);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const client = selectedOverview?.client;
  const projects = selectedOverview?.projects || [];
  const tasks = selectedOverview?.tasks || [];
  const stats = selectedOverview?.stats || {};

  const filteredTasks = tasks.filter((t) => {
    const isDone = ['done', 'completed', 'approved', 'Completed', 'Done', 'Approved'].includes(t.status);
    const isOverdue = !isDone && t.dueDate && new Date(t.dueDate) < new Date();
    if (taskFilter === 'completed') return isDone;
    if (taskFilter === 'overdue') return isOverdue;
    if (taskFilter === 'pending') return !isDone;
    return true;
  });

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 1. SEARCH BAR */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
          <div className="absolute left-3.5 sm:left-4 pointer-events-none text-muted-foreground flex items-center gap-1.5">
            <Search size={18} className="text-primary" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Search client by Client ID (e.g. CLT-0001) or Name to show full projects, tasks & client details..."
            className="w-full h-12 sm:h-14 pl-11 sm:pl-12 pr-24 sm:pr-28 rounded-2xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground/70 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-xs"
          />
          <div className="absolute right-2 sm:right-3 flex items-center gap-1.5">
            {isSearching && <Loader size={16} className="animate-spin text-muted-foreground" />}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <button
              type="submit"
              disabled={!query.trim() || isLoadingOverview}
              className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Real-time Autocomplete Dropdown */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto custom-scrollbar animate-in fade-in-50 zoom-in-95">
            <div className="p-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/40 border-b border-border/40">
              Matching Clients ({suggestions.length})
            </div>
            {suggestions.map((item) => {
              const displayName = item.company || item.name;
              return (
                <div
                  key={item._id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="p-3 hover:bg-secondary/70 transition-colors cursor-pointer flex items-center justify-between gap-3 border-b border-border/30 last:border-b-0"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-foreground truncate">{displayName}</span>
                        {item.clientId && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                            {item.clientId}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {[item.company ? item.name : null, item.email, item.phone].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        item.status === 'Active' || item.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {item.status || 'Active'}
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. LOADING STATE */}
      {isLoadingOverview && (
        <div className="p-8 rounded-2xl bg-card border border-border/80 flex items-center justify-center gap-3 text-muted-foreground text-xs sm:text-sm">
          <Loader size={18} className="animate-spin text-primary" />
          <span>Fetching complete client 360° overview, linked projects, and tasks...</span>
        </div>
      )}

      {/* 3. SELECTED CLIENT 360° OVERVIEW CARD */}
      {selectedOverview && client && !isLoadingOverview && (
        <div className="rounded-3xl bg-card border border-border/80 shadow-md p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Building2 size={24} />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                    {client.company || client.name}
                  </h2>
                  {client.clientId && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(client.clientId)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors cursor-pointer"
                      title="Click to copy Client ID"
                    >
                      <span>{client.clientId}</span>
                      {copiedId ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      client.status === 'Active' || client.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-secondary text-muted-foreground border border-border'
                    }`}
                  >
                    {client.status || 'Active'}
                  </span>
                  {client.tier && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground">
                      {client.tier}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {client.company && client.name && (
                    <span className="flex items-center gap-1">
                      <User size={13} className="shrink-0" />
                      <span>{client.name}</span>
                    </span>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-foreground">
                      <Mail size={13} className="shrink-0" />
                      <span>{client.email}</span>
                    </a>
                  )}
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-foreground">
                      <Phone size={13} className="shrink-0" />
                      <span>{client.phone}</span>
                    </a>
                  )}
                  {client.monthlyPlanFee > 0 && (
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <DollarSign size={13} className="shrink-0 text-primary" />
                      <span>{formatINR(client.monthlyPlanFee)}/mo</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link
                to={`/clients/${client._id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                <span>Full Client Page</span>
                <ExternalLink size={13} />
              </Link>
              {onCreateProject && (
                <button
                  type="button"
                  onClick={onCreateProject}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Project</span>
                </button>
              )}
              {onCreateTask && (
                <button
                  type="button"
                  onClick={onCreateTask}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Task</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Close overview"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-border/40 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Projects</span>
                <FolderKanban size={13} className="text-primary shrink-0" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.totalProjects || 0}</div>
              <div className="text-[10px] text-muted-foreground">{stats.activeProjects || 0} active</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-border/40 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Total Tasks</span>
                <CheckSquare size={13} className="text-primary shrink-0" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.totalTasks || 0}</div>
              <div className="text-[10px] text-muted-foreground">{stats.completedTasks || 0} done</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-border/40 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Pending</span>
                <Clock size={13} className="text-amber-500 shrink-0" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.pendingTasks || 0}</div>
              <div className="text-[10px] text-muted-foreground">In pipeline</div>
            </div>

            <div className={`p-3 sm:p-3.5 rounded-2xl border space-y-1 ${stats.overdueTasks > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-secondary/50 border-border/40'}`}>
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Overdue</span>
                <AlertTriangle size={13} className={stats.overdueTasks > 0 ? 'text-rose-500 shrink-0' : 'text-muted-foreground shrink-0'} />
              </div>
              <div className={`text-xl font-bold ${stats.overdueTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                {stats.overdueTasks || 0}
              </div>
              <div className="text-[10px] text-muted-foreground">Need attention</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-border/40 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Completed</span>
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.completedTasks || 0}</div>
              <div className="text-[10px] text-muted-foreground">Delivered</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-border/40 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Services</span>
                <Sparkles size={13} className="text-indigo-500 shrink-0" />
              </div>
              <div className="text-sm font-bold text-foreground truncate">
                {Array.isArray(client.services) && client.services.length > 0 ? client.services[0] : 'General'}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {Array.isArray(client.services) && client.services.length > 1 ? `+${client.services.length - 1} more` : 'Active'}
              </div>
            </div>
          </div>

          {/* Section Selector Tabs */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 p-1 bg-secondary/60 rounded-xl">
              <button
                type="button"
                onClick={() => setViewTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewTab === 'all' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Projects & Tasks
              </button>
              <button
                type="button"
                onClick={() => setViewTab('projects')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewTab === 'projects' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setViewTab('tasks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewTab === 'tasks' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tasks ({tasks.length})
              </button>
            </div>

            {viewTab !== 'projects' && tasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                {['all', 'pending', 'overdue', 'completed'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTaskFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                      taskFilter === f ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. PROJECTS LIST */}
          {(viewTab === 'all' || viewTab === 'projects') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderKanban size={14} className="text-primary" />
                  <span>Client Projects ({projects.length})</span>
                </h3>
                <Link to="/projects" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  <span>Open Project Board</span>
                  <ArrowRight size={11} />
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/40 text-center text-xs text-muted-foreground">
                  No projects linked to this client yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projects.map((proj) => {
                    const progress = proj.progress || 0;
                    return (
                      <div
                        key={proj._id}
                        onClick={() => navigate(`/projects/${proj._id}`)}
                        className="p-4 rounded-2xl bg-secondary/35 hover:bg-secondary/70 border border-border/50 hover:border-primary/40 transition-all cursor-pointer space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {proj.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              {proj.category && (
                                <span className="capitalize">{proj.category}</span>
                              )}
                              {proj.dueDate && (
                                <span>• Due {new Date(proj.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                              ['completed', 'delivered'].includes((proj.status || '').toLowerCase())
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {proj.status || 'Active'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Progress</span>
                            <span className="font-bold text-foreground">{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. TASKS LIST */}
          {(viewTab === 'all' || viewTab === 'tasks') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-primary" />
                  <span>Client Tasks ({filteredTasks.length})</span>
                </h3>
                <Link to="/tasks" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  <span>Open Tasks Pipeline</span>
                  <ArrowRight size={11} />
                </Link>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/40 text-center text-xs text-muted-foreground">
                  {taskFilter === 'all' ? 'No tasks created for this client yet.' : `No ${taskFilter} tasks found.`}
                </div>
              ) : (
                <div className="divide-y divide-border/40 rounded-2xl bg-secondary/35 border border-border/50 overflow-hidden">
                  {filteredTasks.map((t) => {
                    const isDone = ['done', 'completed', 'approved', 'Completed', 'Done', 'Approved'].includes(t.status);
                    const isOverdue = !isDone && t.dueDate && new Date(t.dueDate) < new Date();

                    return (
                      <div
                        key={t._id}
                        onClick={() => navigate('/tasks')}
                        className="p-3.5 hover:bg-secondary/70 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div
                            className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isDone ? 'bg-emerald-500/15 text-emerald-600' : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            <CheckCircle2 size={13} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-semibold truncate group-hover:text-primary transition-colors ${
                                  isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                                }`}
                              >
                                {t.title}
                              </span>
                              {t.project?.name && (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-secondary text-muted-foreground truncate max-w-[140px]">
                                  {t.project.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              {t.assignedTo?.name && (
                                <span>Assigned to {t.assignedTo.name}</span>
                              )}
                              {t.dueDate && (
                                <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
                                  • Due {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {t.priority && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                                t.priority === 'urgent' || t.priority === 'high'
                                  ? 'bg-rose-500/15 text-rose-600 border border-rose-500/20'
                                  : 'bg-secondary text-muted-foreground'
                              }`}
                            >
                              {t.priority}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              isDone
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {t.status || 'To Do'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientOverviewSearch;
