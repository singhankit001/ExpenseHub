const { body } = require('express-validator');

const VALID_CATEGORIES = [
  'Food',
  'Travel',
  'Bills',
  'Shopping',
  'Education',
  'Entertainment',
  'Health',
  'Other',
];

exports.createExpenseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
    
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
    
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
    
  body('expenseDate')
    .optional()
    .isISO8601()
    .withMessage('Expense date must be a valid ISO 8601 date string')
    .toDate(),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

exports.updateExpenseValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Expense title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
    
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
    
  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
    
  body('expenseDate')
    .optional()
    .isISO8601()
    .withMessage('Expense date must be a valid ISO 8601 date string')
    .toDate(),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];
