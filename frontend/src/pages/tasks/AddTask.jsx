import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PageHeader } from '../../components/ui/page';
import { AddTaskModal } from '../../components/modals/AddTaskModal';

const AddTask = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Create New Task"
          description="Select a project first, then choose content or non-content task fields."
        />
        <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => navigate('/tasks')} aria-label="Close">
          <X size={18} />
        </Button>
      </div>

      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <AddTaskModal
          open
          onOpenChange={(open) => {
            if (!open) navigate('/tasks');
          }}
          pageMode
        />
      </div>
    </div>
  );
};

export default AddTask;
