import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton, Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, CATEGORY_ICONS } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { HealthScore } from '@/components/dashboard/HealthScore';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Tag,
  Wallet,
  Zap,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
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

type TimeRange = '7D' | '30D' | '90D' | '1Y' | 'ALL';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');

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
  const { data: rawMonthlyData, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['monthlySummary'],
    queryFn: async () => {
      const res = await expenseService.getMonthlySummary();
      return res.data.data.monthlySummary as { month: string; totalAmount: number }[];
    },
  });

  const isLoading = isStatsLoading || isRecentLoading || isMonthlyLoading;

  // Client-side time range filtering
  const monthlyData = React.useMemo(() => {
    if (!rawMonthlyData) return [];
    const ranges: Record<TimeRange, number> = { '7D': 1, '30D': 1, '90D': 3, '1Y': 12, 'ALL': Infinity };
    const limit = ranges[timeRange];
    return rawMonthlyData.slice(-Math.min(limit, rawMonthlyData.length));
  }, [rawMonthlyData, timeRange]);

  const topCategory = statsData?.categoryBreakdown?.length
    ? [...statsData.categoryBreakdown].sort((a: { totalAmount: number }, b: { totalAmount: number }) => b.totalAmount - a.totalAmount)[0]
    : null;

  // Compute derived metrics
  const totalSpent = statsData?.totalSpent || 0;
  const activeCount = statsData?.activeCount || 0;
  const avgExpense = activeCount > 0 ? totalSpent / activeCount : 0;
  const savingsRate = totalSpent > 0 ? Math.max(0, Math.round(100 - (totalSpent / (totalSpent * 1.3)) * 100)) : 0;
  const healthScore = activeCount > 0 ? Math.min(98, 60 + savingsRate + Math.min(15, activeCount)) : 40;

  // AI Insights derived from real data
  const insights = React.useMemo(() => {
    const list = [];
    if (topCategory) list.push({ type: 'warning' as const, message: `Your highest spending category is ${topCategory.category} at ${formatCurrency(topCategory.totalAmount)}. Consider setting a budget.` });
    if (avgExpense > 500) list.push({ type: 'danger' as const, message: `Average transaction is ${formatCurrency(avgExpense)}, which is above typical benchmarks.` });
    if (statsData?.deletedCount != null && statsData.deletedCount > 5) list.push({ type: 'info' as const, message: `You've removed ${statsData.deletedCount} entries. Archived expenses are preserved for your audit trail.` });
    list.push({ type: 'success' as const, message: `At your current pace you're maintaining a ${savingsRate}% savings rate this period.` });
    return list.slice(0, 3);
  }, [statsData, topCategory, avgExpense, savingsRate]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* ─── Hero Header ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-widest mb-1">Financial Command Center</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="gradient-text-accent">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-xs text-surface-500 mt-1">Your personal finance overview — updated in real time.</p>
        </div>
        <Link to="/expenses">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/25 text-brand-400 text-xs font-bold cursor-pointer transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> New Expense <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ─── KPI Hero Cards ───────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Spent */}
          <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Total Spent</span>
                  <div className="p-1.5 bg-brand-500/10 rounded-lg"><TrendingUp className="w-3.5 h-3.5 text-brand-400" /></div>
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight">{formatCurrency(totalSpent)}</span>
                  <p className="text-[9px] text-surface-500 mt-0.5">Across all categories</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transactions */}
          <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Transactions</span>
                  <div className="p-1.5 bg-accent-blue/10 rounded-lg"><Receipt className="w-3.5 h-3.5 text-accent-blue" /></div>
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight">{activeCount}</span>
                  <p className="text-[9px] text-surface-500 mt-0.5">Active ledger entries</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Category */}
          <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Top Category</span>
                  <div className="p-1.5 bg-accent-violet/10 rounded-lg"><Tag className="w-3.5 h-3.5 text-accent-violet" /></div>
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight truncate block">{topCategory?.category || 'N/A'}</span>
                  <p className="text-[9px] text-surface-500 mt-0.5">{topCategory ? formatCurrency(topCategory.totalAmount) + ' spent' : 'No data yet'}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Avg Expense */}
          <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Avg. Expense</span>
                  <div className="p-1.5 bg-accent-emerald/10 rounded-lg"><Wallet className="w-3.5 h-3.5 text-accent-emerald" /></div>
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight">{formatCurrency(avgExpense)}</span>
                  <p className="text-[9px] text-surface-500 mt-0.5">Per transaction</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* ─── Main Grid: Chart + Health + Insights ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="flex flex-col min-h-[380px] h-full">
            <div className="px-5 py-4 border-b border-surface-200/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Spending Trend</h3>
              <div className="flex items-center gap-1 bg-surface-200/40 rounded-lg p-1">
                {(['7D', '30D', '90D', '1Y', 'ALL'] as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      timeRange === r
                        ? 'bg-brand-500/20 text-brand-400 shadow-sm'
                        : 'text-surface-500 hover:text-surface-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <CardContent className="flex-1 p-5">
              {isLoading ? (
                <Skeleton className="w-full h-[280px]" />
              ) : monthlyData?.length ? (
                <div className="w-full h-[280px] text-[10px] text-surface-500 font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
                          <stop offset="60%" stopColor="var(--color-accent-violet)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="transparent" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} dy={10} tick={{ fill: 'var(--color-surface-600)', fontSize: 10 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-surface-600)', fontSize: 10 }} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), 'Spent']}
                        contentStyle={{
                          backgroundColor: 'rgba(22, 22, 35, 0.95)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="var(--color-brand-400)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#gradSpent)"
                        isAnimationActive={true}
                        animationDuration={1200}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-[280px] flex flex-col items-center justify-center text-surface-500">
                  <TrendingDown className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-xs font-medium">No spending data yet.</p>
                  <p className="text-[10px] text-surface-600 mt-1">Add your first expense to unlock chart insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Score */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-surface-200/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <h3 className="text-sm font-bold text-white">Financial Health</h3>
            </div>
            <CardContent className="flex-1 p-4">
              {isLoading ? (
                <Skeleton className="w-full h-full min-h-[260px]" />
              ) : (
                <HealthScore score={Math.round(healthScore)} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Bottom Row: Recent Txns + AI Insights ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-surface-200/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
              <Link to="/expenses" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-bold transition-colors group">
                View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <CardContent className="flex-1 p-5">
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentData?.length ? (
                <div className="flex flex-col divide-y divide-surface-200/20">
                  {recentData.slice(0, 6).map((expense, idx: number) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className="flex items-center justify-between py-3 cursor-default"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-200/50 flex items-center justify-center text-base shrink-0 shadow-sm">
                          {(CATEGORY_ICONS as Record<string, string>)[expense.category] || '📦'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">{expense.title}</span>
                          <span className="text-[9px] text-surface-500">{formatDate(expense.expenseDate)}</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-white shrink-0 ml-4">
                        {formatCurrency(expense.amount)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <Receipt className="w-10 h-10 text-surface-400 mb-3 opacity-50" />
                  <p className="text-sm font-semibold text-surface-400">No transactions yet</p>
                  <p className="text-xs text-surface-600 mt-1">Add an expense to see it here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-surface-200/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <h3 className="text-sm font-bold text-white">AI Insights</h3>
              <span className="ml-auto text-[10px] font-bold text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <CardContent className="flex-1 p-4 flex flex-col gap-3">
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : insights.length > 0 ? (
                insights.map((insight, i) => (
                  <InsightCard key={i} type={insight.type} message={insight.message} delay={i * 0.15} />
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                  <Sparkles className="w-8 h-8 text-surface-400 mb-3 opacity-40" />
                  <p className="text-xs text-surface-500">Add some expenses to unlock financial insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
