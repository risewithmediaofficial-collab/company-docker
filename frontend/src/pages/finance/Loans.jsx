import { useState } from 'react';
import { Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { PageHeader, PageToolbar, SectionCard } from '../../components/ui/page';
import LoanCalculator from '../../components/finance/LoanCalculator';

const Loans = () => {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Loan Calculator"
        description="Calculate EMI and get loan details for various banks"
        icon={Calculator}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Average Rate</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">7.55%</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-300" size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Best Rate</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">6.70%</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">IDBI Bank</p>
            </div>
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <BarChart3 className="text-emerald-600 dark:text-emerald-300" size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-600 dark:text-violet-300">Banks Available</p>
              <p className="text-2xl font-bold text-violet-900 dark:text-violet-50">4 Banks</p>
              <p className="text-xs text-violet-600 dark:text-violet-300 mt-1">Easy comparison</p>
            </div>
            <div className="bg-violet-500/20 p-3 rounded-lg">
              <Calculator className="text-violet-600 dark:text-violet-300" size={24} />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Loan Calculator */}
      <SectionCard className="p-6">
        <LoanCalculator />
      </SectionCard>

      {/* Info Section */}
      <SectionCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">About Loan Calculation</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-semibold text-gray-900 dark:text-white">EMI Calculation:</span> The calculator uses the standard formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1], where P is principal, R is monthly interest rate, and N is number of months.
          </p>
          <p>
            <span className="font-semibold text-gray-900 dark:text-white">Total Interest:</span> Calculated as (EMI × Number of Months) - Principal Amount.
          </p>
          <p>
            <span className="font-semibold text-gray-900 dark:text-white">Bank Rates:</span> The interest rates shown are current market rates. Final rates may vary based on credit score, credit history, and bank policies. Contact banks directly for exact rates.
          </p>
        </div>
      </SectionCard>
    </div>
  );
};

export default Loans;
