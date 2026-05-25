import { useQuery } from '@tanstack/react-query';
import api from '../api';

/**
 * Hook to get financial data for a project
 * Returns revenue, expenses, budget, ROI, profitability
 */
export const useProjectFinance = (projectId) => {
  return useQuery({
    queryKey: ['projectFinance', projectId],
    queryFn: async () => {
      const [projectRes, financeRes, invoiceRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get('/finance', { params: { project: projectId } }),
        api.get('/finance/invoices', { params: { project: projectId } }),
      ]);

      const project = projectRes.data?.data || projectRes.data;
      const financeEntries = financeRes.data?.data || financeRes.data?.entries || [];
      const invoices = invoiceRes.data?.data || invoiceRes.data?.invoices || [];

      // Calculate metrics
      const income = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.total : 0), 0);
      const expenses = financeEntries
        .filter((entry) => entry.type === 'Expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
      const budget = project.budget || 0;
      const profit = income - expenses;
      const profitMargin = income > 0 ? ((profit / income) * 100).toFixed(2) : 0;
      const roi = budget > 0 ? ((profit / budget) * 100).toFixed(2) : 0;
      const budgetUtilization = budget > 0 ? ((expenses / budget) * 100).toFixed(2) : 0;

      return {
        project,
        income,
        expenses,
        budget,
        profit,
        profitMargin,
        roi,
        budgetUtilization,
        financeEntries,
        invoices,
        status: project.status,
      };
    },
    enabled: !!projectId,
  });
};

/**
 * Hook to get financial metrics for all projects of a client
 */
export const useClientProjectsFinance = (clientId) => {
  return useQuery({
    queryKey: ['clientProjectsFinance', clientId],
    queryFn: async () => {
      const [projectsRes, financeRes, invoiceRes] = await Promise.all([
        api.get('/projects', { params: { client: clientId, limit: 100 } }),
        api.get('/finance', { params: { client: clientId, limit: 500 } }),
        api.get('/finance/invoices', { params: { client: clientId, limit: 500 } }),
      ]);

      const projects = projectsRes.data?.data || projectsRes.data?.projects || [];
      const financeEntries = financeRes.data?.data || financeRes.data?.entries || [];
      const invoices = invoiceRes.data?.data || invoiceRes.data?.invoices || [];

      // Calculate per-project metrics
      const projectMetrics = projects.map((project) => {
        const projectInvoices = invoices.filter((inv) => inv.project?._id === project._id || inv.project === project._id);
        const projectExpenses = financeEntries.filter(
          (entry) => (entry.project?._id === project._id || entry.project === project._id) && entry.type === 'Expense'
        );

        const income = projectInvoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.total : 0), 0);
        const expenses = projectExpenses.reduce((sum, entry) => sum + entry.amount, 0);
        const budget = project.budget || 0;
        const profit = income - expenses;

        return {
          ...project,
          income,
          expenses,
          budget,
          profit,
          profitMargin: income > 0 ? ((profit / income) * 100).toFixed(2) : 0,
          roi: budget > 0 ? ((profit / budget) * 100).toFixed(2) : 0,
        };
      });

      // Aggregate metrics
      const totalIncome = projectMetrics.reduce((sum, p) => sum + p.income, 0);
      const totalExpenses = projectMetrics.reduce((sum, p) => sum + p.expenses, 0);
      const totalBudget = projectMetrics.reduce((sum, p) => sum + p.budget, 0);
      const totalProfit = totalIncome - totalExpenses;

      return {
        projects: projectMetrics,
        totalIncome,
        totalExpenses,
        totalBudget,
        totalProfit,
        avgProfitMargin: projectMetrics.length > 0 
          ? (projectMetrics.reduce((sum, p) => sum + parseFloat(p.profitMargin), 0) / projectMetrics.length).toFixed(2)
          : 0,
        activeProjects: projectMetrics.filter((p) => p.status === 'active').length,
      };
    },
    enabled: !!clientId,
  });
};

/**
 * Hook to get overall finance summary with project breakdown
 */
export const useFinanceDashboard = (filters = {}) => {
  return useQuery({
    queryKey: ['financeDashboard', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.clientId) params.append('client', filters.clientId);
      if (filters.projectId) params.append('project', filters.projectId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const [financeRes, invoiceRes, projectsRes] = await Promise.all([
        api.get('/finance', { params: Object.fromEntries(params) }),
        api.get('/finance/invoices', { params: Object.fromEntries(params) }),
        api.get('/projects', { params: Object.fromEntries(params) }),
      ]);

      const financeEntries = financeRes.data?.data || financeRes.data?.entries || [];
      const invoices = invoiceRes.data?.data || invoiceRes.data?.invoices || [];
      const projects = projectsRes.data?.data || projectsRes.data?.projects || [];

      const income = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.total : 0), 0);
      const expenses = financeEntries
        .filter((entry) => entry.type === 'Expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
      const pending = invoices.reduce((sum, inv) => sum + (inv.status !== 'Paid' && inv.status !== 'Cancelled' ? inv.total : 0), 0);
      const profit = income - expenses;

      return {
        income,
        expenses,
        pending,
        profit,
        profitMargin: income > 0 ? ((profit / income) * 100).toFixed(2) : 0,
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === 'active').length,
        invoices: invoices.length,
        unpaidInvoices: invoices.filter((inv) => inv.status !== 'Paid').length,
      };
    },
  });
};
