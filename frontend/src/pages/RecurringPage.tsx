import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate: string;
  isActive: boolean;
  notes?: string;
}

const DEFAULT_RECURRING: RecurringItem[] = [
  {
    id: 'rec-1',
    title: 'Netflix Subscription',
    amount: 649,
    category: 'Entertainment',
    frequency: 'MONTHLY',
    nextDueDate: '2026-07-15',
    isActive: true,
    notes: 'Premium standard plan',
  },
  {
    id: 'rec-2',
    title: 'Broadband Wifi Bill',
    amount: 999,
    category: 'Bills',
    frequency: 'MONTHLY',
    nextDueDate: '2026-07-22',
    isActive: true,
    notes: 'Airtel Fiber 100Mbps',
  },
  {
    id: 'rec-3',
    title: 'Gym Membership',
    amount: 1500,
    category: 'Health',
    frequency: 'MONTHLY',
    nextDueDate: '2026-08-01',
    isActive: true,
    notes: 'Gold Gym membership renewal',
  },
  {
    id: 'rec-4',
    title: 'AWS Server cost',
    amount: 3200,
    category: 'Bills',
    frequency: 'MONTHLY',
    nextDueDate: '2026-07-28',
    isActive: true,
    notes: 'Dev server instances EC2',
  },
];

export const RecurringPage = () => {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('finflow_recurring');
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(DEFAULT_RECURRING);
      localStorage.setItem('finflow_recurring', JSON.stringify(DEFAULT_RECURRING));
    }
  }, []);

  const handleToggleActive = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setItems(updated);
    localStorage.setItem('finflow_recurring', JSON.stringify(updated));
    const target = updated.find((i) => i.id === id);
    if (target?.isActive) {
      toast.success(`Activated subscription: ${target.title}`);
    } else {
      toast.error(`Disabled subscription: ${target?.title}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem('finflow_recurring', JSON.stringify(updated));
    toast.success(`Removed subscription: ${name}`);
  };

  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!title || isNaN(amountNum) || amountNum <= 0 || !nextDueDate) {
      toast.error('Please input valid title, positive amount, and next due date.');
      return;
    }

    const newItem: RecurringItem = {
      id: `rec-${Date.now()}`,
      title,
      amount: amountNum,
      category,
      frequency,
      nextDueDate,
      isActive: true,
      notes: notes || undefined,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem('finflow_recurring', JSON.stringify(updated));
    setShowAddModal(false);
    toast.success(`Added recurring item: ${title}`);

    // Reset form
    setTitle('');
    setAmount('');
    setCategory('Bills');
    setFrequency('MONTHLY');
    setNextDueDate('');
    setNotes('');
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Recurring Expenses</h1>
          <p className="text-sm text-surface-600">Trace subscriptions, standard invoices, and automated payouts.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4.5 h-4.5" />} onClick={() => setShowAddModal(true)}>
          Add Subscription
        </Button>
      </div>

      {/* Grid of Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Subscriptions Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Ledger items that renew automatically at selected intervals.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            {items.length > 0 ? (
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border border-surface-200/50 bg-surface-100/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-surface-300 transition-all duration-200 ${
                      !item.isActive && 'opacity-65'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-surface-200/60 flex items-center justify-center text-brand-400 shrink-0">
                        <RefreshCw className={`w-5 h-5 ${item.isActive && 'animate-spin-slow'}`} />
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-sm font-bold text-white truncate">{item.title}</span>
                        {item.notes && <span className="text-[10px] text-surface-500 truncate">{item.notes}</span>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge className="bg-brand-500/10 text-brand-400 border-brand-500/20 text-[9px] font-bold px-1.5 py-0.5 uppercase">
                            {item.frequency}
                          </Badge>
                          <span className="text-[10px] text-surface-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Next Due: {formatDate(item.nextDueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-surface-200/50">
                      <span className="text-sm font-extrabold text-white">
                        {formatCurrency(item.amount)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(item.id)}
                          className="text-surface-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {item.isActive ? (
                            <ToggleRight className="w-7 h-7 text-accent-emerald glow-emerald" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-surface-400" />
                          )}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="!p-2 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-10 h-10 text-surface-400 mb-3 animate-spin-slow" />
                <span className="text-sm font-semibold text-surface-400">No active recurring expenses</span>
                <p className="text-xs text-surface-600 mt-1 max-w-xs leading-relaxed">
                  Log items like subscriptions, domain renewals, or utility bills to track monthly recurring expenses automatically.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-surface-950/65 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card w-full max-w-md rounded-2xl border border-surface-200/50 p-6 shadow-modal relative z-10 text-left"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white">Add Recurring Subscription</h3>
                <Button variant="ghost" size="sm" className="!p-1 text-surface-400" onClick={() => setShowAddModal(false)}>
                  <X className="w-4.5 h-4.5" />
                </Button>
              </div>

              <form onSubmit={handleAddRecurring} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-surface-600">Subscription Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Netflix Premium"
                    className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-surface-600">Monthly Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 649"
                      className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-surface-600">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Bills">Bills</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Health">Health</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-surface-600">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-surface-600">Next Renewal Date</label>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-surface-600">Description (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Standard account shared with family"
                    className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 h-20 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <Button variant="outline" className="border-surface-200/50 text-surface-900" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Add Subscription
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
