const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const expenseRoutes = require('./routes/expense.routes');
const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/appError');

const app = express();

// 1) GLOBAL MIDDLEWARES
// HTTP Request Logging
app.use(morgan('dev'));

// Enable CORS for all origins (configurable via env)
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));

// Parse incoming JSON payloads
app.use(express.json());

// Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Simple base health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy and running',
    timestamp: new Date(),
  });
});

// 2) SWAGGER API DOCUMENTATION ENDPOINT
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3) MODULE ROUTERS
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// 4) CATCH-ALL ROUTE (UNHANDLED ENDPOINTS)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

module.exports = app;
