const AppError = require('../utils/appError');

const handlePrismaUniqueConstraintError = (err) => {
  const field = err.meta?.target?.[0] || 'field';
  return new AppError(`A record with this ${field} already exists.`, 400);
};

const handlePrismaNotFoundError = (err) => {
  return new AppError(err.meta?.cause || 'Record not found.', 404);
};

const handlePrismaValidationError = (err) => {
  return new AppError('Invalid database operations or schema fields.', 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Programming or other unknown error: don't leak error details to client
  console.error('ERROR 💥', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.',
    errors: [],
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Prisma-specific errors
    if (err.code === 'P2002') error = handlePrismaUniqueConstraintError(err);
    if (err.code === 'P2025') error = handlePrismaNotFoundError(err);
    if (err.name === 'PrismaClientValidationError') error = handlePrismaValidationError(err);

    // JWT errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorDev(error, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.code === 'P2002') error = handlePrismaUniqueConstraintError(err);
    if (err.code === 'P2025') error = handlePrismaNotFoundError(err);
    if (err.name === 'PrismaClientValidationError') error = handlePrismaValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
