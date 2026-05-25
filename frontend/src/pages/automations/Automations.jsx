import { useState } from 'react';
import { Activity, PauseCircle, PlayCircle, Plus, Zap } from 'lucide-react';
import { useAutomations, useDeleteAutomation, useToggleAutomation } from '../../hooks/useAutomations';
import { AddAutomationModal } from '../../components/modals/AddAutomationModal';
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

const Automations = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: automations = [], isLoading } = useAutomations({ search: searchTerm });
  const deleteAutomation = useDeleteAutomation();
  const toggleAutomation = useToggleAutomation();

  const activeAutomations = automations.filter((item) => item.enabled).length;
  const totalRuns = automations.reduce((sum, item) => sum + Number(item.runCount || 0), 0);

  const columns = [
    {
      key: 'name',
      label: 'Workflow',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.description || 'No description added yet'}</div>
        </div>
      ),
    },
    { key: 'trigger', label: 'Trigger' },
    { key: 'action', label: 'Action' },
    {
      key: 'enabled',
      label: 'Status',
      render: (row) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            toggleAutomation.mutate({ id: row._id, enabled: !row.enabled });
          }}
        >
          <StatusBadge tone={row.enabled ? 'success' : 'neutral'}>
            {row.enabled ? 'Active' : 'Paused'}
          </StatusBadge>
        </button>
      ),
    },
    {
      key: 'runCount',
      label: 'Runs',
      render: (row) => row.runCount || 0,
    },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteAutomation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automation Hub"
        title="Operational workflows, without the clutter."
        description="Create trigger-action automations that reduce manual work while keeping workflow state easy to scan."
        actions={(
          <Button
            onClick={() => {
              setSelectedAutomation(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Automation
          </Button>
        )}
      >
        <MetricGrid>
          <MetricCard label="Workflows" value={automations.length} helper="Automations in the current scope" icon={Zap} tone="primary" />
          <MetricCard label="Active" value={activeAutomations} helper="Running without intervention" icon={PlayCircle} tone="success" />
          <MetricCard label="Paused" value={automations.length - activeAutomations} helper="Ready to resume when needed" icon={PauseCircle} tone="neutral" />
          <MetricCard label="Total Runs" value={totalRuns} helper="Historical execution count" icon={Activity} tone="info" />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search workflows, triggers, or actions..."
        />
        <div className="app-pill">{automations.length} workflows</div>
      </PageToolbar>

      <DataTable
        data={automations}
        columns={columns}
        loading={isLoading}
        onEdit={(automation) => {
          setSelectedAutomation(automation);
          setShowModal(true);
        }}
        onDelete={(id) => setDeleteId(id)}
        emptyTitle="No automations found"
        emptyDescription="Create the first automation to turn repeated operational steps into reusable workflows."
      />

      <AddAutomationModal open={showModal} onOpenChange={setShowModal} automation={selectedAutomation} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Automations;
