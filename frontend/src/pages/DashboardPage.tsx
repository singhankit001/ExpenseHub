import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, CATEGORY_ICONS } from '@/utils';
import {
  TrendingUp,
  Receipt,
  Tag,
  ArrowUpRight,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  // Query 1: Fetch stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await expenseService.getDashboardStats();
      return res.data.data;
    },
  });

  // Query 2: Fetch recent transactions
  const { data: recentData, isLoading: isRecentLoading } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async () => {
      const res = await expenseService.getRecentTransactions();
      return res.data.data.expenses;
    },
  });

  // Query 3: Fetch monthly summaries for the chart
  const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['monthlySummary'],
    queryFn: async () => {
      const res = await expenseService.getMonthlySummary();
      return res.data.data.monthlySummary;
    },
  });

  const isLoading = isStatsLoading || isRecentLoading || isMonthlyLoading;

  // Find the top category
  const topCategory = statsData?.categoryBreakdown?.length
    ? [...statsData.categoryBreakdown].sort((a, b) => b.totalAmount - a.totalAmount)[0]
    : null;

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Welcome & Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">Dashboard</h1>
          <p className="text-sm text-surface-600">Track and monitor your category spending trends.</p>
        </div>
        <Link to="/expenses">
          <Badge className="hover:bg-brand-100 cursor-pointer transition-colors px-3 py-1 text-xs font-semibold gap-1">
            Manage Expenses <ArrowUpRight className="w-3.5 h-3.5" />
          </Badge>
        </Link>
      </div>

      {/* ─── Summary Cards Row ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Spent */}
          <Card className="border border-surface-200">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Total Expenses</span>
                <div className="p-2 bg-brand-50 rounded-lg text-brand-650">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-surface-900">
                  {formatCurrency(statsData?.totalSpent || 0)}
                </span>
                <span className="text-[10px] text-surface-500 mt-1">Across all categories</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Number of Transactions */}
          <Card className="border border-surface-200">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Transactions</span>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-650">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-surface-900">
                  {statsData?.activeCount || 0}
                </span>
                <span className="text-[10px] text-surface-500 mt-1">Active ledger entries</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Top Category */}
          <Card className="border border-surface-200">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Top Category</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-650">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-surface-900 truncate">
                  {topCategory ? topCategory.category : 'N/A'}
                </span>
                <span className="text-[10px] text-surface-500 mt-1">
                  {topCategory ? `${formatCurrency(topCategory.totalAmount)} spent` : 'No transactions'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Soft-Deleted Ledger entries */}
          <Card className="border border-surface-200">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Deleted Entries</span>
                <div className="p-2 bg-red-50 rounded-lg text-red-650">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-surface-900">
                  {statsData?.deletedCount || 0}
                </span>
                <span className="text-[10px] text-surface-500 mt-1">Soft-deleted items</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Graphs & Tables grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart Column */}
        <Card className="lg:col-span-2 border border-surface-200 flex flex-col min-h-[350px]">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-surface-550" /> Spending Overview
            </h3>
            <span className="text-[10px] font-medium text-surface-500">Last 6 Months</span>
          </div>
          <CardContent className="flex-1 p-5">
            {isLoading ? (
              <Skeleton className="w-full h-full min-h-[260px]" />
            ) : monthlyData?.length ? (
              <div className="w-full h-[260px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.94 0.005 264)" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} dy={10} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid oklch(0.94 0.005 264)',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="oklch(0.55 0.22 264)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSpent)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center text-xs text-surface-500 py-10">
                <span>No transaction data available.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions List Column */}
        <Card className="lg:col-span-1 border border-surface-200 flex flex-col">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900">Recent Transactions</h3>
            <Link to="/expenses" className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              See All
            </Link>
          </div>
          <CardContent className="flex-1 p-5 flex flex-col gap-4">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentData?.length ? (
              <div className="flex flex-col gap-4">
                {recentData.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between border-b border-surface-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center text-lg shrink-0">
                        {CATEGORY_ICONS[expense.category] || '📦'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-surface-900 truncate">{expense.title}</span>
                        <span className="text-[10px] text-surface-500">{formatDate(expense.expenseDate)}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-surface-900 shrink-0">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <Receipt className="w-8 h-8 text-surface-400 mb-2" />
                <span className="text-xs text-surface-500">No recent transactions</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
