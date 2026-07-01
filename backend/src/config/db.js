const { PrismaClient } = require('@prisma/client');

// Instantiate the client. In a real-world server setup, this is a singleton 
// to prevent active database connection overflows.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
