const swaggerJsdoc = require('swagger-jsdoc');

const port = process.env.PORT || 5001;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Expense Tracker API',
      version: '1.0.0',
      description:
        'A RESTful API for tracking personal expenses with JWT authentication, category-based analytics, soft delete, and monthly spending summaries.',
      contact: {
        name: 'Ankit Singh',
        email: 'ankit@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local Development Server',
      },
      {
        url: 'https://expense-tracker-api.onrender.com',
        description: 'Production Server (Render)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your JWT token obtained from /api/auth/login here.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI JSDoc annotations
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
