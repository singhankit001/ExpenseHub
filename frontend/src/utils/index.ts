import { format, parseISO } from 'date-fns';
import type { Category } from '@/types';

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const currentCurrency = localStorage.getItem('finflow_currency') || 'INR';
  const formatLocale = currentCurrency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currentCurrency,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (date: string, fmt = 'd MMM yyyy'): string => {
  try {
    return format(parseISO(date), fmt);
  } catch {
    return date;
  }
};

export const formatMonthKey = (key: string): string => {
  // key is "YYYY-MM"
  try {
    return format(parseISO(`${key}-01`), 'MMM yyyy');
  } catch {
    return key;
  }
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#6366f1',
  Travel: '#8b5cf6',
  Bills: '#ec4899',
  Shopping: '#f59e0b',
  Education: '#10b981',
  Entertainment: '#3b82f6',
  Health: '#ef4444',
  Other: '#6b7280',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍽️',
  Travel: '✈️',
  Bills: '🧾',
  Shopping: '🛍️',
  Education: '📚',
  Entertainment: '🎬',
  Health: '💊',
  Other: '📦',
};

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message ?? 'An unexpected error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};
