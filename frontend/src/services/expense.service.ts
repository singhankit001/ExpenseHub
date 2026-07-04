import api from './api';
import type {
  ApiResponse,
  DashboardStats,
  Expense,
  ExpenseFilters,
  ExpenseListResponse,
  ExpensePayload,
  CategorySpending,
  TopCategories,
  MonthlySummary,
  MonthlyDetail,
} from '@/types';

export const expenseService = {
  // CRUD
  create: (data: ExpensePayload) =>
    api.post<ApiResponse<{ expense: Expense }>>('/expenses', data),

  list: (filters?: ExpenseFilters) =>
    api.get<ApiResponse<ExpenseListResponse>>('/expenses', { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`),

  update: (id: string, data: Partial<ExpensePayload>) =>
    api.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`),

  restore: (id: string) =>
    api.patch<ApiResponse<{ expense: Expense }>>(`/expenses/${id}/restore`),

  // Dashboard
  getDashboardStats: () =>
    api.get<ApiResponse<DashboardStats>>('/expenses/dashboard/stats'),

  getRecentTransactions: () =>
    api.get<ApiResponse<{ expenses: Expense[] }>>('/expenses/dashboard/recent'),

  // Analytics
  getCategorySpending: () =>
    api.get<ApiResponse<CategorySpending>>('/expenses/analytics/category'),

  getTopCategories: () =>
    api.get<ApiResponse<TopCategories>>('/expenses/analytics/top-categories'),

  getMonthlySummary: () =>
    api.get<ApiResponse<MonthlySummary>>('/expenses/analytics/monthly-summary'),

  getMonthlyDetail: () =>
    api.get<ApiResponse<MonthlyDetail>>('/expenses/analytics/monthly-detail'),
};
