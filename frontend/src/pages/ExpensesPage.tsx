import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import type { Expense, Category, ExpenseFilters } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { TableRowSkeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, CATEGORY_ICONS, getErrorMessage } from '@/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Undo2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const expenseFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  category: z.enum([
    'Food',
    'Travel',
    'Bills',
    'Shopping',
    'Education',
    'Entertainment',
    'Health',
    'Other',
  ]),
  expenseDate: z.string().optional(),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type ExpenseFormFields = z.infer<typeof expenseFormSchema>;

export const ExpensesPage = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'expenseDate',
    sortOrder: 'desc',
    includeDeleted: 'false',
  });

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Fetch list query
  const { data, isLoading } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      const res = await expenseService.list(filters);
      return res.data.data;
    },
  });

  // ─── Forms Configurations ──────────────────────────────────────
  const addForm = useForm<ExpenseFormFields>({
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues: {
      title: '',
      amount: undefined,
      category: 'Food',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const editForm = useForm<ExpenseFormFields>({
    resolver: zodResolver(expenseFormSchema) as any,
  });

  // ─── Mutations ────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (data: ExpenseFormFields) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyDetail'] });
      queryClient.invalidateQueries({ queryKey: ['categorySpending'] });
      queryClient.invalidateQueries({ queryKey: ['topCategories'] });
      setIsAddOpen(false);
      addForm.reset();
      toast.success('Expense added successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: ExpenseFormFields }) =>
      expenseService.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setIsEditOpen(false);
      setSelectedExpense(null);
      toast.success('Expense updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setIsDeleteOpen(false);
      setSelectedExpense(null);
      toast.success('Expense soft deleted successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => expenseService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Expense restored successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // ─── Actions ──────────────────────────────────────────────────
  const handleOpenEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    editForm.reset({
      title: expense.title,
      amount: parseFloat(expense.amount),
      category: expense.category,
      expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : '',
      notes: expense.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteOpen(true);
  };

  const handleFilterChange = (field: keyof ExpenseFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">Expenses</h1>
          <p className="text-sm text-surface-600">Track, update, and sort your transaction ledger.</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Expense
        </Button>
      </div>

      {/* ─── Search & Filters Card ────────────────────────────────────── */}
      <Card className="border border-surface-200">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-surface-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Bills">Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>

            {/* Soft Deleted Toggle */}
            <select
              value={filters.includeDeleted}
              onChange={(e) => handleFilterChange('includeDeleted', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
            >
              <option value="false">Active Only</option>
              <option value="true">Include Deleted</option>
              <option value="only">Deleted Only</option>
            </select>

            {/* Sort Order */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
              >
                <option value="expenseDate">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="title">Sort by Name</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-24 px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          {/* Date range filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-600 font-semibold w-16">Start Date:</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-600 font-semibold w-16">End Date:</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Ledger List Table ────────────────────────────────────────── */}
      <Card className="border border-surface-200 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 flex flex-col gap-4">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </div>
          ) : data?.expenses?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-50 text-surface-700 border-b border-surface-100 font-semibold">
                    <th className="px-5 py-3">Expense</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className={`border-b border-surface-100 last:border-0 hover:bg-surface-50 transition-colors ${
                        expense.isDeleted ? 'bg-red-50/10' : ''
                      }`}
                    >
                      {/* Name & date */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-base p-1.5 bg-surface-100 rounded-lg shrink-0">
                            {CATEGORY_ICONS[expense.category] || '📦'}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-surface-900 truncate">{expense.title}</span>
                            <span className="text-[10px] text-surface-500">{formatDate(expense.expenseDate)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 align-middle">
                        <Badge variant="secondary">{expense.category}</Badge>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 align-middle text-right font-bold text-surface-900">
                        {formatCurrency(expense.amount)}
                      </td>

                      {/* Deleted State Badge */}
                      <td className="px-5 py-3.5 align-middle">
                        {expense.isDeleted ? (
                          <Badge variant="danger">Deleted</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {expense.isDeleted ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="!p-1.5 text-blue-600 hover:bg-blue-50"
                              onClick={() => restoreMutation.mutate(expense.id)}
                            >
                              <Undo2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="!p-1.5 text-surface-600 hover:bg-surface-100"
                                onClick={() => handleOpenEdit(expense)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="!p-1.5 text-red-600 hover:bg-red-50"
                                onClick={() => handleOpenDelete(expense)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
              <HelpCircle className="w-12 h-12 text-surface-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-surface-950">No expenses found</span>
                <span className="text-xs text-surface-500">Try adjusting your filters or search options</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Pagination Footer Controls ──────────────────────────────── */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-2 border-t border-surface-200 mt-2">
          <span className="text-xs font-semibold text-surface-650">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasPrevPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasNextPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ─── Add Expense Modal ────────────────────────────────────────── */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Expense">
        <form onSubmit={addForm.handleSubmit((val: any) => addMutation.mutate(val))} className="flex flex-col gap-4">
          <Input
            label="Title"
            id="add-title"
            placeholder="Office Laptop rental"
            error={addForm.formState.errors.title?.message}
            {...addForm.register('title')}
          />
          <Input
            label="Amount (INR)"
            id="add-amount"
            type="number"
            placeholder="2500"
            error={addForm.formState.errors.amount?.message}
            {...addForm.register('amount')}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-category" className="text-xs font-semibold text-surface-800">
              Category
            </label>
            <select
              id="add-category"
              className="w-full px-3 py-2 text-sm bg-white border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
              {...addForm.register('category')}
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
            {addForm.formState.errors.category?.message && (
              <span className="text-xs text-red-600 font-semibold">{addForm.formState.errors.category.message}</span>
            )}
          </div>
          <Input
            label="Expense Date"
            id="add-date"
            type="date"
            error={addForm.formState.errors.expenseDate?.message}
            {...addForm.register('expenseDate')}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-notes" className="text-xs font-semibold text-surface-800">
              Notes (Optional)
            </label>
            <textarea
              id="add-notes"
              placeholder="Rent check paid on first date of the month."
              className="w-full px-3 py-2 text-sm bg-white border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 min-h-[80px]"
              {...addForm.register('notes')}
            />
            {addForm.formState.errors.notes?.message && (
              <span className="text-xs text-red-600 font-semibold">{addForm.formState.errors.notes.message}</span>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={addMutation.isPending}>
              Add Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Expense Modal ────────────────────────────────────────── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Expense">
        <form
          onSubmit={editForm.handleSubmit((val: any) =>
            updateMutation.mutate({ id: selectedExpense!.id, payload: val })
          )}
          className="flex flex-col gap-4"
        >
          <Input
            label="Title"
            id="edit-title"
            error={editForm.formState.errors.title?.message}
            {...editForm.register('title')}
          />
          <Input
            label="Amount (INR)"
            id="edit-amount"
            type="number"
            error={editForm.formState.errors.amount?.message}
            {...editForm.register('amount')}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-category" className="text-xs font-semibold text-surface-800">
              Category
            </label>
            <select
              id="edit-category"
              className="w-full px-3 py-2 text-sm bg-white border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
              {...editForm.register('category')}
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
          <Input
            label="Expense Date"
            id="edit-date"
            type="date"
            error={editForm.formState.errors.expenseDate?.message}
            {...editForm.register('expenseDate')}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-notes" className="text-xs font-semibold text-surface-800">
              Notes (Optional)
            </label>
            <textarea
              id="edit-notes"
              className="w-full px-3 py-2 text-sm bg-white border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 min-h-[80px]"
              {...editForm.register('notes')}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
              Update Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ─────────────────────────────────── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Expense">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-surface-650 leading-relaxed text-balance">
            Are you sure you want to soft delete the expense "{selectedExpense?.title}"? You will be able to view and restore it later.
          </p>
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(selectedExpense!.id)}>
              Delete Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
