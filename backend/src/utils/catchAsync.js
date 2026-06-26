/**
 * Wraps async route handlers so thrown errors are forwarded to Express
 * error middleware automatically, removing repetitive try/catch blocks.
 *
 * @param {Function} fn - async express route handler
 * @returns {Function} middleware that catches and forwards rejections
 */
export const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
