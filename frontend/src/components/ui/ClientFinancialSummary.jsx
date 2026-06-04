import { IndianRupee, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { useClientProjectsFinance } from '../../hooks/useProjectFinance';
import { formatINR } from '../../utils/currency';
import { Badge } from './badge';

/**
 * ClientFinancialSummary - Display financial overview for a client
 */
const ClientFinancialSummary = ({ clientId, clientName, clientTier = 'growth' }) => {
  const { data: financeData, isLoading } = useClientProjectsFinance(clientId);

  const getHealthStatus = (margin) => {
    const m = parseFloat(margin);
    if (m >= 40) return { label: 'Excellent', color: 'bg-green-500', icon: '🟢' };
    if (m >= 20) return { label: 'Good', color: 'bg-blue-500', icon: '🔵' };
    if (m >= 0) return { label: 'Fair', color: 'bg-yellow-500', icon: '🟡' };
    return { label: 'Poor', color: 'bg-red-500', icon: '🔴' };
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!financeData) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-center text-muted-foreground">
        No financial data available
      </div>
    );
  }

  const healthStatus = getHealthStatus(financeData.avgProfitMargin);
  const profitMarginPercentage = parseFloat(financeData.avgProfitMargin);

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Financial Summary</h3>
          <p className="text-sm text-muted-foreground">{clientName} • Tier: {clientTier}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${healthStatus.color}/20 flex items-center justify-center text-2xl`}>
          {healthStatus.icon}
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">TOTAL INCOME</span>
            <IndianRupee size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatINR(financeData.totalIncome)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">{financeData.projects.length} projects</div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">TOTAL EXPENSES</span>
            <TrendingUp size={16} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatINR(financeData.totalExpenses)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {financeData.totalBudget > 0
              ? `${((financeData.totalExpenses / financeData.totalBudget) * 100).toFixed(0)}% of budget`
              : 'No budget set'}
          </div>
        </div>

        {/* Total Profit */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">TOTAL PROFIT</span>
            <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className={`text-2xl font-bold ${financeData.totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatINR(financeData.totalProfit)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {financeData.activeProjects} active
          </div>
        </div>

        {/* Health Status */}
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">AVG MARGIN</span>
            <AlertCircle size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {financeData.avgProfitMargin}%
          </div>
          <Badge className="mt-2 w-fit bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            {healthStatus.label}
          </Badge>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        {/* Budget Overview */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <IndianRupee size={16} />
            Budget Overview
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="font-semibold">{formatINR(financeData.totalBudget)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Utilized</span>
              <span className="font-semibold text-orange-600">
                {financeData.totalBudget > 0
                  ? `${((financeData.totalExpenses / financeData.totalBudget) * 100).toFixed(0)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className={`font-semibold ${financeData.totalBudget - financeData.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatINR(Math.max(0, financeData.totalBudget - financeData.totalExpenses))}
              </span>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <FileText size={16} />
            Project Stats
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Projects</span>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                {financeData.activeProjects}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Projects</span>
              <span className="font-semibold">{financeData.projects.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg ROI</span>
              <span className="font-semibold text-blue-600">
                {financeData.projects.length > 0
                  ? `${(financeData.projects.reduce((sum, p) => sum + parseFloat(p.roi), 0) / financeData.projects.length).toFixed(0)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Projects */}
      {financeData.projects.length > 0 && (
        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="font-semibold text-sm">Top Performing Projects</h4>
          <div className="space-y-2">
            {financeData.projects
              .sort((a, b) => parseFloat(b.profitMargin) - parseFloat(a.profitMargin))
              .slice(0, 3)
              .map((project) => (
                <div key={project._id} className="p-2 rounded-lg bg-secondary/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{formatINR(project.profit)} profit</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 whitespace-nowrap ml-2">
                    {project.profitMargin}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFinancialSummary;
