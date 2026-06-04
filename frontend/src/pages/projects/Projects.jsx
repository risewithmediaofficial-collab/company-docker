import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Gauge, Plus, Target, TrendingUp } from 'lucide-react';
import { useProjects, useDeleteProject } from '../../hooks/useProjects';
import { AddProjectModal } from '../../components/modals/AddProjectModal';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { MetricCard, MetricGrid, PageHeader, PageToolbar, SearchField, StatusBadge } from '../../components/ui/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatINR } from '../../utils/currency';

const projectStatusTone = {
  Completed: 'success',
  'In Progress': 'info',
  'On Hold': 'warning',
  Planning: 'neutral',
  Cancelled: 'danger',
};

const projectPriorityTone = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'neutral',
};

const Projects = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects = [], isLoading } = useProjects({ search: searchTerm });
  const deleteProjectMutation = useDeleteProject();

  const inDelivery = projects.filter((project) => project.status === 'In Progress').length;
  const completed = projects.filter((project) => project.status === 'Completed').length;
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / projects.length)
    : 0;

  const columns = [
    {
      key: 'name',
      label: 'Project Name',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.client?.name || 'No client linked'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge tone={projectStatusTone[row.status] || 'neutral'}>
          {row.status}
        </StatusBadge>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => (
        <StatusBadge tone={projectPriorityTone[row.priority] || 'neutral'}>
          {row.priority}
        </StatusBadge>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (row) => formatINR(row.budget),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (row) => (
        <div className="w-28">
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${row.progress || 0}%` }} />
          </div>
          <span className="mt-1 inline-block text-xs text-muted-foreground">{row.progress || 0}% complete</span>
        </div>
      ),
    },
  ];

  const handleDeleteProject = async () => {
    if (deleteProjectId) {
      await deleteProjectMutation.mutateAsync(deleteProjectId);
      setDeleteProjectId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project Delivery"
        title="Monitor every project from kickoff to close."
        description="Keep active delivery, budget context, and portfolio progress aligned in a single management view."
        actions={(
          <Button
            onClick={() => {
              setSelectedProject(null);
              setShowAddModal(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Create Project
          </Button>
        )}
      >
        <MetricGrid>
          <MetricCard label="Portfolio Size" value={projects.length} helper="Projects visible in the current search" icon={Briefcase} tone="info" />
          <MetricCard label="In Delivery" value={inDelivery} helper="Projects currently being executed" icon={TrendingUp} tone="warning" />
          <MetricCard label="Completed" value={completed} helper="Finished work ready for archive" icon={Target} tone="success" />
          <MetricCard label="Average Progress" value={`${averageProgress}%`} helper="Across the visible portfolio" icon={Gauge} tone="primary" />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search projects, clients, or delivery themes..."
        />
        <div className="app-pill">{projects.length} projects</div>
      </PageToolbar>

      <DataTable
        data={projects}
        columns={columns}
        loading={isLoading}
        onRowClick={(project) => navigate(`/projects/${project._id}`)}
        onEdit={(project) => {
          setSelectedProject(project);
          setShowAddModal(true);
        }}
        onDelete={(id) => setDeleteProjectId(id)}
        emptyTitle="No projects found"
        emptyDescription="Try a broader search or create a project to start structuring delivery work."
      />

      <AddProjectModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        project={selectedProject}
      />

      <AlertDialog open={!!deleteProjectId} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
