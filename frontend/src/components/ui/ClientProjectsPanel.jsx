import { useNavigate } from 'react-router-dom';
import { FolderOpen, IndianRupee, Plus, TrendingUp } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { formatINR } from '../../utils/currency';
import { Button } from './button';
import { Badge } from './badge';

/**
 * ClientProjectsPanel - Display all projects for a client with quick actions
 */
const ClientProjectsPanel = ({ clientId, clientName, onAddProject }) => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects({ client: clientId, limit: 50 });

  const statusColor = {
    planning: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    on_hold: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    completed: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
    cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  const priorityColor = {
    low: 'text-blue-600 dark:text-blue-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-orange-600 dark:text-orange-400',
    urgent: 'text-red-600 dark:text-red-400',
  };

  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'In Progress');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  if (isLoading) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderOpen size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Projects</h3>
            <p className="text-sm text-muted-foreground">{projects.length} projects for {clientName}</p>
          </div>
        </div>
        <Button onClick={onAddProject} size="sm" className="gap-2">
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">{activeProjects.length}</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Completed</div>
          <div className="text-2xl font-bold text-blue-600">{completedProjects.length}</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Total Budget</div>
          <div className="text-lg font-bold truncate">{formatINR(totalBudget)}</div>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="py-12 text-center">
          <FolderOpen size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Button onClick={onAddProject} variant="outline" size="sm">
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="w-full p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{project.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                </div>
                <Badge className={statusColor[project.status]}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  {project.budget > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <IndianRupee size={14} />
                      <span>{formatINR(project.budget)}</span>
                    </div>
                  )}
                  {project.progress > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp size={14} />
                      <span>{project.progress}%</span>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-semibold ${priorityColor[project.priority]}`}>
                  {project.priority}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProjectsPanel;
