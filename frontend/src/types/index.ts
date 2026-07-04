// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type Category =
  | 'Food'
  | 'Travel'
  | 'Bills'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Health'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food',
  'Travel',
  'Bills',
  'Shopping',
  'Education',
  'Entertainment',
  'Health',
  'Other',
];

export interface Expense {
  id: string;
  title: string;
  amount: string;
  category: Category;
  expenseDate: string;
  notes: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ExpensePayload {
  title: string;
  amount: number;
  category: Category;
  expenseDate?: string;
  notes?: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ExpenseListResponse {
  pagination: Pagination;
  expenses: Expense[];
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: Category | '';
  startDate?: string;
  endDate?: string;
  sortBy?: 'amount' | 'expenseDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: 'true' | 'false' | 'only';
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface CategoryItem {
  category: Category;
  totalAmount: number;
  transactionCount?: number;
}

export interface CategorySpending {
  categories: CategoryItem[];
}

export interface TopCategory {
  category: Category;
  totalAmount: number;
}

export interface TopCategories {
  topCategories: TopCategory[];
}

export interface MonthlyEntry {
  month: string;
  totalAmount: number;
  count: number;
}

export interface MonthlySummary {
  monthlySummary: MonthlyEntry[];
}

export interface MonthlyDetailBreakdown {
  category: Category;
  amount: number;
}

export interface MonthlyDetailEntry {
  month: string;
  totalAmount: number;
  breakdown: MonthlyDetailBreakdown[];
}

export interface MonthlyDetail {
  analytics: MonthlyDetailEntry[];
}

export interface DashboardStats {
  activeCount: number;
  totalSpent: number;
  deletedCount: number;
  categoryBreakdown: CategoryItem[];
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: { field?: string; message: string }[];
}
