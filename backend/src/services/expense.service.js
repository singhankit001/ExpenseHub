const prisma = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Add a new expense
 * @param {string} userId 
 * @param {object} data 
 * @returns {Promise<object>}
 */
exports.createExpense = async (userId, data) => {
  const { title, amount, category, expenseDate, notes } = data;

  return await prisma.expense.create({
    data: {
      title,
      amount: parseFloat(amount),
      category,
      expenseDate: expenseDate ? new Date(expenseDate) : undefined,
      notes,
      userId,
    },
  });
};

/**
 * View all expenses with pagination, search, category/date range filters, sorting, soft deleted filters
 * @param {string} userId 
 * @param {object} options 
 * @returns {Promise<object>}
 */
exports.getExpenses = async (userId, options) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    startDate,
    endDate,
    sortBy = 'expenseDate',
    sortOrder = 'desc',
    includeDeleted = 'false',
  } = options;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build filter query
  const where = {
    userId,
  };

  // Handle soft deletion query option
  if (includeDeleted === 'true') {
    // Return both active and deleted
  } else if (includeDeleted === 'only') {
    where.isDeleted = true;
  } else {
    where.isDeleted = false; // default: active only
  }

  // Text search on title or notes
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by category
  if (category) {
    where.category = category;
  }

  // Filter by date range
  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) {
      where.expenseDate.gte = new Date(startDate);
    }
    if (endDate) {
      where.expenseDate.lte = new Date(endDate);
    }
  }

  // Validate sort parameters
  const allowedSortFields = ['amount', 'expenseDate', 'createdAt', 'title'];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'expenseDate';
  const actualSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';

  // Run transactions to fetch counts and items
  const [expenses, totalCount] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [actualSortBy]: actualSortOrder,
      },
    }),
    prisma.expense.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limitNum);

  return {
    pagination: {
      totalItems: totalCount,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    expenses,
  };
};

/**
 * Retrieve details of a single expense owned by the user
 * @param {string} userId 
 * @param {string} expenseId 
 * @returns {Promise<object>}
 */
exports.getExpenseById = async (userId, expenseId) => {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
    },
  });

  if (!expense) {
    throw new AppError('Expense not found or unauthorized access.', 404);
  }

  return expense;
};

/**
 * Edit an expense
 * @param {string} userId 
 * @param {string} expenseId 
 * @param {object} updateData 
 * @returns {Promise<object>}
 */
exports.updateExpense = async (userId, expenseId, updateData) => {
  // Check ownership
  await exports.getExpenseById(userId, expenseId);

  const { title, amount, category, expenseDate, notes } = updateData;

  return await prisma.expense.update({
    where: { id: expenseId },
    data: {
      title: title !== undefined ? title : undefined,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      category: category !== undefined ? category : undefined,
      expenseDate: expenseDate ? new Date(expenseDate) : undefined,
      notes: notes !== undefined ? notes : undefined,
    },
  });
};

/**
 * Soft delete an expense
 * @param {string} userId 
 * @param {string} expenseId 
 * @returns {Promise<object>}
 */
exports.deleteExpense = async (userId, expenseId) => {
  // Check ownership and state
  const expense = await exports.getExpenseById(userId, expenseId);

  if (expense.isDeleted) {
    throw new AppError('Expense is already deleted.', 400);
  }

  return await prisma.expense.update({
    where: { id: expenseId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

/**
 * Restore a soft-deleted expense
 * @param {string} userId 
 * @param {string} expenseId 
 * @returns {Promise<object>}
 */
exports.restoreExpense = async (userId, expenseId) => {
  // Check ownership and state
  const expense = await exports.getExpenseById(userId, expenseId);

  if (!expense.isDeleted) {
    throw new AppError('Expense is not deleted.', 400);
  }

  return await prisma.expense.update({
    where: { id: expenseId },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
  });
};

/**
 * Get dashboard aggregations
 * @param {string} userId 
 * @returns {Promise<object>}
 */
exports.getDashboardStats = async (userId) => {
  const [activeStats, deletedCount, categoryBreakdown] = await prisma.$transaction([
    prisma.expense.aggregate({
      where: { userId, isDeleted: false },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.expense.count({
      where: { userId, isDeleted: true },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: { userId, isDeleted: false },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  return {
    activeCount: activeStats._count.id,
    totalSpent: activeStats._sum.amount ? parseFloat(activeStats._sum.amount) : 0,
    deletedCount,
    categoryBreakdown: categoryBreakdown.map((item) => ({
      category: item.category,
      totalAmount: parseFloat(item._sum.amount) || 0,
      count: item._count.id,
    })),
  };
};

/**
 * Get the 5 most recent active expenses
 * @param {string} userId 
 * @returns {Promise<array>}
 */
exports.getRecentTransactions = async (userId) => {
  return await prisma.expense.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    take: 5,
    orderBy: {
      expenseDate: 'desc',
    },
  });
};

/**
 * Get spending aggregates grouped by category
 * @param {string} userId 
 * @returns {Promise<object>}
 */
exports.getCategorySpending = async (userId) => {
  const result = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      userId,
      isDeleted: false,
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  return {
    categories: result.map((item) => ({
      category: item.category,
      totalAmount: parseFloat(item._sum.amount) || 0,
      transactionCount: item._count.id,
    })),
  };
};

/**
 * Get categories sorted by spending amount descending
 * @param {string} userId 
 * @returns {Promise<object>}
 */
exports.getTopCategories = async (userId) => {
  const result = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      userId,
      isDeleted: false,
    },
    _sum: { amount: true },
  });

  const sortedResult = result
    .map((item) => ({
      category: item.category,
      totalAmount: parseFloat(item._sum.amount) || 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return { topCategories: sortedResult };
};

/**
 * Get monthly totals (last 6 months overview)
 * @param {string} userId 
 * @returns {Promise<object>}
 */
exports.getMonthlySummary = async (userId) => {
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      amount: true,
      expenseDate: true,
    },
    orderBy: {
      expenseDate: 'asc',
    },
  });

  const monthlyGroups = {};

  expenses.forEach((exp) => {
    const date = new Date(exp.expenseDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = {
        month: monthKey,
        totalAmount: 0,
        count: 0,
      };
    }

    monthlyGroups[monthKey].totalAmount += parseFloat(exp.amount);
    monthlyGroups[monthKey].count += 1;
  });

  const monthlySummary = Object.values(monthlyGroups).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  return { monthlySummary };
};

/**
 * Get detailed monthly category aggregates
 * @param {string} userId 
 * @returns {Promise<object>}
 */
exports.getMonthlyDetail = async (userId) => {
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      amount: true,
      category: true,
      expenseDate: true,
    },
  });

  const report = {};

  expenses.forEach((exp) => {
    const date = new Date(exp.expenseDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!report[monthKey]) {
      report[monthKey] = {
        month: monthKey,
        totalAmount: 0,
        categories: {},
      };
    }

    report[monthKey].totalAmount += parseFloat(exp.amount);

    if (!report[monthKey].categories[exp.category]) {
      report[monthKey].categories[exp.category] = 0;
    }
    report[monthKey].categories[exp.category] += parseFloat(exp.amount);
  });

  const formattedReport = Object.values(report)
    .map((monthData) => {
      const categoryList = Object.entries(monthData.categories).map(([category, amount]) => ({
        category,
        amount,
      }));
      return {
        month: monthData.month,
        totalAmount: monthData.totalAmount,
        breakdown: categoryList,
      };
    })
    .sort((a, b) => b.month.localeCompare(a.month));

  return { analytics: formattedReport };
};
