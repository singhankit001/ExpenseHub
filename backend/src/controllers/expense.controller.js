const expenseService = require('../services/expense.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Add an expense
 * @route   POST /api/expenses
 * @access  Protected
 */
exports.addExpense = catchAsync(async (req, res, next) => {
  const expense = await expenseService.createExpense(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Expense added successfully',
    data: { expense },
  });
});

/**
 * @desc    View all expenses (with Pagination, Search, Filter, Sort)
 * @route   GET /api/expenses
 * @access  Protected
 */
exports.getAllExpenses = catchAsync(async (req, res, next) => {
  const result = await expenseService.getExpenses(req.user.id, req.query);

  res.status(200).json({
    success: true,
    message: 'Expenses retrieved successfully',
    data: result,
  });
});

/**
 * @desc    View single expense
 * @route   GET /api/expenses/:id
 * @access  Protected
 */
exports.getExpense = catchAsync(async (req, res, next) => {
  const expense = await expenseService.getExpenseById(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Expense details retrieved successfully',
    data: { expense },
  });
});

/**
 * @desc    Edit an expense
 * @route   PUT /api/expenses/:id
 * @access  Protected
 */
exports.editExpense = catchAsync(async (req, res, next) => {
  const updatedExpense = await expenseService.updateExpense(
    req.user.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense: updatedExpense },
  });
});

/**
 * @desc    Soft Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Protected
 */
exports.deleteExpense = catchAsync(async (req, res, next) => {
  const deletedExpense = await expenseService.deleteExpense(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Expense soft deleted successfully. It can be restored using the restore endpoint.',
    data: { expense: deletedExpense },
  });
});

/**
 * @desc    Restore a soft-deleted expense
 * @route   PATCH /api/expenses/:id/restore
 * @access  Protected
 */
exports.restoreExpense = catchAsync(async (req, res, next) => {
  const restoredExpense = await expenseService.restoreExpense(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Expense restored successfully',
    data: { expense: restoredExpense },
  });
});

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/expenses/dashboard/stats
 * @access  Protected
 */
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await expenseService.getDashboardStats(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: stats,
  });
});

/**
 * @desc    Recent Transactions (last 5 active transactions)
 * @route   GET /api/expenses/dashboard/recent
 * @access  Protected
 */
exports.getRecentTransactions = catchAsync(async (req, res, next) => {
  const expenses = await expenseService.getRecentTransactions(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Recent transactions retrieved successfully',
    data: { expenses },
  });
});

/**
 * @desc    Total Spending By Category
 * @route   GET /api/expenses/analytics/category
 * @access  Protected
 */
exports.getCategorySpending = catchAsync(async (req, res, next) => {
  const result = await expenseService.getCategorySpending(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Category spending breakdown retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Top Spending Categories (sorted by total amount descending)
 * @route   GET /api/expenses/analytics/top-categories
 * @access  Protected
 */
exports.getTopCategories = catchAsync(async (req, res, next) => {
  const result = await expenseService.getTopCategories(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Top spending categories retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Monthly Expense Summary (last 6 months overview)
 * @route   GET /api/expenses/analytics/monthly-summary
 * @access  Protected
 */
exports.getMonthlySummary = catchAsync(async (req, res, next) => {
  const result = await expenseService.getMonthlySummary(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Monthly summary retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Detailed Monthly Analytics (grouping by month & category)
 * @route   GET /api/expenses/analytics/monthly-detail
 * @access  Protected
 */
exports.getMonthlyDetail = catchAsync(async (req, res, next) => {
  const result = await expenseService.getMonthlyDetail(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Detailed monthly analytics retrieved successfully',
    data: result,
  });
});
