import { TrendingUp, TrendingDown, IndianRupee, Target } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { Badge } from './badge';

/**
 * ProjectProfitabilityCard - Display project financial metrics
 */
const ProjectProfitabilityCard = ({ 
  project, 
  income = 0, 
  expenses = 0, 
  budget = 0,
  profit = 0,
  profitMargin = 0,
  roi = 0,
  budgetUtilization = 0,
  compact = false 
}) => {
  const isPositive = profit >= 0;
  const isBudgetHealthy = budgetUtilization <= 100;

  const getROIColor = (roiValue) => {
    const roi = parseFloat(roiValue);
    if (roi >= 30) return 'text-green-600 dark:text-green-400';
    if (roi >= 0) return 'text-blue-600 dark:text-blue-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProfitMarginColor = (marginValue) => {
    const margin = parseFloat(marginValue);
    if (margin >= 40) return 'text-green-600 dark:text-green-400';
    if (margin >= 20) return 'text-blue-600 dark:text-blue-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Income</div>
          <div className="text-lg font-bold text-green-600">{formatINR(income)}</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Expenses</div>
          <div className="text-lg font-bold text-red-600">{formatINR(expenses)}</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Profit</div>
          <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatINR(profit)}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Margin</div>
          <div className={`text-lg font-bold ${getProfitMarginColor(profitMargin)}`}>
            {profitMargin}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg">{project?.name || 'Project Financials'}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {project?.description || 'Financial overview and metrics'}
          </p>
        </div>
        <Badge variant={isPositive ? 'success' : 'destructive'}>
          {isPositive ? 'Profitable' : 'Loss'}
        </Badge>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Income */}
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">INCOME</span>
            <IndianRupee size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatINR(income)}
          </div>
        </div>

        {/* Expenses */}
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">EXPENSES</span>
            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatINR(expenses)}
          </div>
        </div>

        {/* Profit */}
        <div className={`p-4 rounded-lg ${isPositive ? 'bg-blue-500/10 border border-blue-200 dark:border-blue-800' : 'bg-orange-500/10 border border-orange-200 dark:border-orange-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">PROFIT</span>
            {isPositive ? (
              <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <TrendingDown size={16} className="text-orange-600 dark:text-orange-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {formatINR(profit)}
          </div>
        </div>

        {/* Budget Status */}
        <div className={`p-4 rounded-lg ${isBudgetHealthy ? 'bg-purple-500/10 border border-purple-200 dark:border-purple-800' : 'bg-red-500/10 border border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">BUDGET</span>
            <Target size={16} className={isBudgetHealthy ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'} />
          </div>
          <div className={`text-2xl font-bold ${isBudgetHealthy ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
            {budgetUtilization}%
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Profit Margin</div>
          <div className={`text-3xl font-bold ${getProfitMarginColor(profitMargin)}`}>
            {profitMargin}%
          </div>
          <p className="text-xs text-muted-foreground">
            {profitMargin >= 40 ? '🔥 Excellent' : profitMargin >= 20 ? '👍 Good' : '⚠️ Low'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase">ROI</div>
          <div className={`text-3xl font-bold ${getROIColor(roi)}`}>
            {roi}%
          </div>
          <p className="text-xs text-muted-foreground">
            {roi >= 30 ? '🚀 Excellent' : roi >= 0 ? '👍 Positive' : '📉 Negative'}
          </p>
        </div>
      </div>

      {/* Progress Bar - Budget Utilization */}
      {budget > 0 && (
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Budget Utilization</span>
            <span className="text-xs font-bold">{formatINR(expenses)} / {formatINR(budget)}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetUtilization <= 75 ? 'bg-green-500' : budgetUtilization <= 100 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProfitabilityCard;
