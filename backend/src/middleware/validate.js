import { validationResult } from 'express-validator';
import { AppError } from '../utils/appError.js';

/**
 * Reads express-validator results and throws a 422 on the first failure.
 * Place after any validator chain in a route definition.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join('; ');
    return next(new AppError(`Validation failed: ${messages}`, 422));
  }
  next();
};
