class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag for operational (trusted) errors
    this.errors = errors; // Array to hold specific validation errors if any

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
