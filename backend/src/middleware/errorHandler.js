import { AppError } from '../utils/appError.js';

const handlePrismaNotFound = () => new AppError('Resource not found.', 404);

const handlePrismaUniqueConstraint = (err) => {
  const field = err.meta?.target?.[0] ?? 'field';
  return new AppError(`A record with that ${field} already exists.`, 409);
};

const handleJwtInvalid = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJwtExpired = () =>
  new AppError('Token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ status: err.status, message: err.message });
  }
  console.error('UNHANDLED ERROR:', err);
  res.status(500).json({ status: 'error', message: 'Something went wrong.' });
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };
    if (err.code === 'P2025') error = handlePrismaNotFound();
    if (err.code === 'P2002') error = handlePrismaUniqueConstraint(err);
    if (err.name === 'JsonWebTokenError') error = handleJwtInvalid();
    if (err.name === 'TokenExpiredError') error = handleJwtExpired();
    sendErrorProd(error, res);
  }
};
