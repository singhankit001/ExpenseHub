import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatMonthKey, CATEGORY_COLORS, CATEGORY_ICONS } from '@/utils';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { BarChart3, PieChartIcon, TrendingUp, CalendarDays } from 'lucide-react';

export const AnalyticsPage = () => {
  // Query 1: Category spending
  const { data: categorySpending, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['categorySpending'],
    queryFn: async () => {
      const res = await expenseService.getCategorySpending();
      return res.data.data.categories;
    },
  });

  // Query 2: Detailed monthly aggregation report
  const { data: monthlyDetail, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['monthlyDetail'],
    queryFn: async () => {
      const res = await expenseService.getMonthlyDetail();
      return res.data.data.analytics;
    },
  });

  // Query 3: Top categories list
  const { data: topCategories, isLoading: isTopLoading } = useQuery({
    queryKey: ['topCategories'],
    queryFn: async () => {
      const res = await expenseService.getTopCategories();
      return res.data.data.topCategories;
    },
  });

  const isLoading = isCategoryLoading || isMonthlyLoading || isTopLoading;

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Analytics</h1>
        <p className="text-sm text-surface-600">Deep-dive financial breakdown and spending analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Pie Chart) */}
        <Card className="border border-surface-200 flex flex-col min-h-[350px]">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-surface-100 py-3">
            <PieChartIcon className="w-4 h-4 text-surface-550" />
            <div>
              <CardTitle className="!text-sm">Category Breakdown</CardTitle>
              <CardDescription className="!text-[10px]">Percentage share of expenditures</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-5">
            {isLoading ? (
              <Skeleton className="w-full h-full min-h-[220px]" />
            ) : categorySpending?.length ? (
              <div className="w-full h-[220px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categorySpending}
                      dataKey="totalAmount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categorySpending.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[entry.category]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <span className="text-xs text-surface-500">No category transactions available.</span>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Trend (Bar Chart) */}
        <Card className="border border-surface-200 flex flex-col min-h-[350px]">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-surface-100 py-3">
            <BarChart3 className="w-4 h-4 text-surface-550" />
            <div>
              <CardTitle className="!text-sm">Monthly Trend</CardTitle>
              <CardDescription className="!text-[10px]">Cash outflow history by month</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-5">
            {isLoading ? (
              <Skeleton className="w-full h-full min-h-[220px]" />
            ) : monthlyDetail?.length ? (
              <div className="w-full h-[220px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...monthlyDetail].reverse()} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.94 0.005 264)" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="totalAmount" fill="oklch(0.55 0.22 264)" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <span className="text-xs text-surface-500">No monthly aggregates available.</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Spending Categories List */}
        <Card className="border border-surface-200 lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-surface-100 py-3">
            <TrendingUp className="w-4 h-4 text-surface-550" />
            <div>
              <CardTitle className="!text-sm">Top Categories</CardTitle>
              <CardDescription className="!text-[10px]">Highest consuming expense channels</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-4">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : topCategories?.length ? (
              <div className="flex flex-col gap-3.5">
                {topCategories.map((item) => (
                  <div key={item.category} className="flex items-center justify-between border-b border-surface-50 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{CATEGORY_ICONS[item.category] || '📦'}</span>
                      <span className="text-xs font-semibold text-surface-900">{item.category}</span>
                    </div>
                    <span className="text-xs font-bold text-surface-900">
                      {formatCurrency(item.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-surface-500 text-center py-5">No category logs</span>
            )}
          </CardContent>
        </Card>

        {/* Detailed Monthly Summary Table */}
        <Card className="border border-surface-200 lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-surface-100 py-3">
            <CalendarDays className="w-4 h-4 text-surface-550" />
            <div>
              <CardTitle className="!text-sm">Monthly Aggregations</CardTitle>
              <CardDescription className="!text-[10px]">Monthly details and top category channels</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-5 flex flex-col gap-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : monthlyDetail?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-50 text-surface-700 border-b border-surface-100">
                      <th className="px-5 py-3 font-semibold">Month</th>
                      <th className="px-5 py-3 font-semibold text-right">Outflow Amount</th>
                      <th className="px-5 py-3 font-semibold">Spending Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyDetail.map((item) => (
                      <tr key={item.month} className="border-b border-surface-100 last:border-0 hover:bg-surface-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-surface-900">{formatMonthKey(item.month)}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-surface-900">{formatCurrency(item.totalAmount)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            {item.breakdown.slice(0, 3).map((brk) => (
                              <span key={brk.category} className="inline-flex items-center px-1.5 py-0.5 bg-surface-100 rounded text-[9px] font-semibold text-surface-750">
                                {CATEGORY_ICONS[brk.category] || '📦'} {brk.category}: {formatCurrency(brk.amount)}
                              </span>
                            ))}
                            {item.breakdown.length > 3 && (
                              <span className="text-[9px] text-surface-500 font-semibold align-middle">+ {item.breakdown.length - 3} more</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-surface-500">No monthly aggregations found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
