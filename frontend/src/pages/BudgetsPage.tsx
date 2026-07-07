import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sliders,
  X,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BudgetLimit {
  category: string;
  limit: number;
}

const DEFAULT_BUDGETS: BudgetLimit[] = [
  { category: 'Food', limit: 12000 },
  { category: 'Travel', limit: 8000 },
  { category: 'Bills', limit: 15000 },
  { category: 'Shopping', limit: 10000 },
  { category: 'Education', limit: 5000 },
  { category: 'Entertainment', limit: 8000 },
  { category: 'Health', limit: 6000 },
  { category: 'Other', limit: 4000 },
];

export const BudgetsPage = () => {
  const queryClient = useQueryClient();
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  // Load budgets from localStorage or set defaults
  useEffect(() => {
    const stored = localStorage.getItem('finflow_budgets');
    if (stored) {
      setBudgets(JSON.parse(stored));
    } else {
      setBudgets(DEFAULT_BUDGETS);
      localStorage.setItem('finflow_budgets', JSON.stringify(DEFAULT_BUDGETS));
    }
  }, []);

  // Fetch actual spending from category stats
  const { data: spendingData, isLoading } = useQuery({
    queryKey: ['categorySpending'],
    queryFn: async () => {
      const res = await expenseService.getCategorySpending();
      return res.data.data.categories;
    },
  });

  const getSpentAmount = (categoryName: string) => {
    if (!spendingData) return 0;
    const item = spendingData.find((c) => c.category === categoryName);
    return item ? item.totalAmount : 0;
  };

  const handleEditClick = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setTempLimit(currentLimit.toString());
  };

  const handleSaveLimit = () => {
    const limitNum = parseFloat(tempLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      toast.error('Please enter a valid budget limit.');
      return;
    }

    const updated = budgets.map((b) =>
      b.category === editingCategory ? { ...b, limit: limitNum } : b
    );
    setBudgets(updated);
    localStorage.setItem('finflow_budgets', JSON.stringify(updated));
    setEditingCategory(null);
    toast.success(`Updated ${editingCategory} budget limit.`);
    queryClient.invalidateQueries({ queryKey: ['categorySpending'] });
  };

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = spendingData?.reduce((sum, s) => sum + s.totalAmount, 0) || 0;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const totalSpentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Budgets</h1>
        <p className="text-sm text-surface-600">Establish limits per category and monitor your spending health index.</p>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Budget Card */}
        <Card className="glow-purple">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Total Monthly Budget</span>
              <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-white">{formatCurrency(totalBudget)}</span>
              <span className="text-[10px] text-surface-500 mt-1">Accumulated category limits</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent Card */}
        <Card className={totalSpentPercentage >= 90 ? 'glow-red border-red-500/20' : 'glow-purple'}>
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Total Expenses Spent</span>
              <div className={`p-2 rounded-lg ${totalSpentPercentage >= 90 ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-white">{formatCurrency(totalSpent)}</span>
              <span className="text-[10px] text-surface-500 mt-1">
                {totalSpentPercentage}% utilized ({formatCurrency(remainingBudget)} remaining)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Burn Rate Health Indicator */}
        <Card className="glow-emerald">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Financial Health Score</span>
              <div className="p-2 bg-accent-emerald/10 text-accent-emerald rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-white">
                {Math.max(0, 100 - totalSpentPercentage)}%
              </span>
              <span className="text-[10px] text-surface-500 mt-1">
                {totalSpentPercentage > 85 ? 'Overburn state — optimize shopping/food' : 'Healthy expenditure velocity'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets List */}
      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>Allocate limits for each active category segment. Click edit to customize.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-5">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((b) => {
                const spent = getSpentAmount(b.category);
                const percent = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
                const isOver = percent >= 100;
                const isWarning = percent >= 80 && percent < 100;

                return (
                  <div
                    key={b.category}
                    className="p-5 rounded-xl border border-surface-200/50 bg-surface-100/30 flex flex-col gap-4 hover:border-surface-300 transition-all duration-200 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-white">{b.category}</span>
                        {isOver ? (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-bold px-2 py-0.5">
                            Exceeded
                          </Badge>
                        ) : isWarning ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-bold px-2 py-0.5">
                            Warning 80%
                          </Badge>
                        ) : (
                          <Badge className="bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20 text-[9px] font-bold px-2 py-0.5">
                            Healthy
                          </Badge>
                        )}
                      </div>

                      {editingCategory === b.category ? (
                        <div className="flex items-center gap-1.5 z-10">
                          <input
                            type="number"
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            className="w-20 px-2 py-1 text-xs bg-surface-50 border border-surface-350 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                          />
                          <Button size="sm" variant="primary" onClick={handleSaveLimit} className="!py-1 !px-2.5 text-xs">
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)} className="!py-1 !px-2 border-surface-200/50 text-surface-900">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(b.category, b.limit)}
                          leftIcon={<Sliders className="w-3.5 h-3.5" />}
                          className="text-xs text-brand-400 hover:text-brand-350 hover:bg-brand-500/10"
                        >
                          Modify
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] text-surface-500 font-medium">
                        <span>Spent: {formatCurrency(spent)}</span>
                        <span>Limit: {formatCurrency(b.limit)}</span>
                      </div>
                      <div className="w-full h-2 bg-surface-200/40 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, percent)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-accent-emerald'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-surface-600 mt-0.5">
                        <span>{percent}% utilized</span>
                        {percent > 0 && (
                          <span className={isOver ? 'text-red-400' : 'text-surface-500'}>
                            {isOver
                              ? `Overspent by ${formatCurrency(spent - b.limit)}`
                              : `${formatCurrency(b.limit - spent)} remaining`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
