import { body, query } from 'express-validator';

const CATEGORIES = [
  'Food','Transport','Housing','Entertainment','Healthcare',
  'Education','Shopping','Utilities','Travel','Other',
];

export const createExpenseValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.')
    .isLength({ max: 100 }).withMessage('Title must be ≤100 characters.'),
  body('amount').notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('category').notEmpty().withMessage('Category is required.')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}.`),
  body('date').notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date string.'),
  body('notes').optional().trim()
    .isLength({ max: 500 }).withMessage('Notes must be ≤500 characters.'),
];

export const updateExpenseValidator = [
  body('title').optional().trim()
    .isLength({ max: 100 }).withMessage('Title must be ≤100 characters.'),
  body('amount').optional()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('category').optional()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}.`),
  body('date').optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date string.'),
  body('notes').optional().trim()
    .isLength({ max: 500 }).withMessage('Notes must be ≤500 characters.'),
];

export const listExpensesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be ≥1.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.'),
  query('category').optional().isIn(CATEGORIES).withMessage('Invalid category filter.'),
  query('sortBy').optional().isIn(['date', 'amount', 'createdAt']).withMessage('Invalid sort field.'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc.'),
];
