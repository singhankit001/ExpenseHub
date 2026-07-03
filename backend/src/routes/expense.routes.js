const express = require('express');
const expenseController = require('../controllers/expense.controller');
const protect = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createExpenseValidator,
  updateExpenseValidator,
} = require('../validators/expense.validator');

const router = express.Router();

// Apply protection middleware to all expense routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - title
 *         - amount
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique UUID
 *         title:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 *         category:
 *           type: string
 *           enum: [Food, Travel, Bills, Shopping, Education, Entertainment, Health, Other]
 *         expenseDate:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         isDeleted:
 *           type: boolean
 *         deletedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 */

// Analytical & Dashboard Routes (Must be declared before /:id parameter routes)

/**
 * @swagger
 * /api/expenses/dashboard/stats:
 *   get:
 *     summary: Retrieve dashboard overview statistics
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/dashboard/stats', expenseController.getDashboardStats);

/**
 * @swagger
 * /api/expenses/dashboard/recent:
 *   get:
 *     summary: Retrieve the 5 most recent transactions
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent transactions retrieved
 */
router.get('/dashboard/recent', expenseController.getRecentTransactions);

/**
 * @swagger
 * /api/expenses/analytics/category:
 *   get:
 *     summary: Retrieve spending breakdown grouped by categories
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category spending breakdown retrieved
 */
router.get('/analytics/category', expenseController.getCategorySpending);

/**
 * @swagger
 * /api/expenses/analytics/top-categories:
 *   get:
 *     summary: Retrieve categories sorted by highest spending amount
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top categories retrieved
 */
router.get('/analytics/top-categories', expenseController.getTopCategories);

/**
 * @swagger
 * /api/expenses/analytics/monthly-summary:
 *   get:
 *     summary: Retrieve monthly total spending overview
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly overview list retrieved
 */
router.get('/analytics/monthly-summary', expenseController.getMonthlySummary);

/**
 * @swagger
 * /api/expenses/analytics/monthly-detail:
 *   get:
 *     summary: Retrieve monthly category breakdown overview
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly detailed analytics retrieved
 */
router.get('/analytics/monthly-detail', expenseController.getMonthlyDetail);

// CRUD routes

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Office lunch
 *               amount:
 *                 type: number
 *                 example: 350.50
 *               category:
 *                 type: string
 *                 example: Food
 *               expenseDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-07-04T12:00:00.000Z
 *               notes:
 *                 type: string
 *                 example: Lunch with dev team
 *     responses:
 *       201:
 *         description: Expense created successfully
 */
router.post('/', createExpenseValidator, validate, expenseController.addExpense);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses (with pagination, filtering, search, and sorting)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search for title or notes
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by specific category name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date range (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter end date range (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field (amount, expenseDate, title, etc)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         description: Sort direction (asc or desc)
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: string
 *         description: Include soft deleted items (true, false, only)
 *     responses:
 *       200:
 *         description: Expenses list retrieved successfully
 */
router.get('/', expenseController.getAllExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get a single expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *       404:
 *         description: Expense not found
 */
router.get('/:id', expenseController.getExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Edit an existing expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               expenseDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */
router.put('/:id', updateExpenseValidator, validate, expenseController.editExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Soft delete an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense soft deleted successfully
 *       404:
 *         description: Expense not found
 */
router.delete('/:id', expenseController.deleteExpense);

/**
 * @swagger
 * /api/expenses/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense restored successfully
 *       404:
 *         description: Expense not found
 */
router.patch('/:id/restore', expenseController.restoreExpense);

module.exports = router;
