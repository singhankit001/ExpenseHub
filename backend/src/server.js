const dotenv = require('dotenv');

// Handle uncaught exceptions synchronously before anything else
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// 1) Load environment variables from .env
dotenv.config();

const app = require('./app');

// 2) Listen to incoming requests
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`==================================================`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`👉 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`👉 Swagger UI Docs: http://localhost:${port}/api-docs`);
  console.log(`==================================================`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
