import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2 } from '@/components/ui/muiIcons';
import BranchManager from '../components/branches/BranchManager';

const BranchesPage = () => {
  const [searchParams] = useSearchParams();
  const autoOpenAdd = searchParams.get('create') === 'true';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Company Branches & Locations
            </h1>
          </div>
        </div>
      </div>

      {/* Main Branch Management Component */}
      <BranchManager autoOpenAdd={autoOpenAdd} />
    </div>
  );
};

export default BranchesPage;
