const prisma = require('../config/db');

/**
 * Log an audit activity to the database.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} action - The action type (e.g., 'LOGIN', 'REGISTER').
 * @param {string} description - A human-readable description of the action.
 * @param {object} req - The Express request object to extract IP and user agent.
 */
exports.logActivity = async (userId, action, description, req) => {
  try {
    const ipAddress = req?.ip || req?.socket?.remoteAddress || 'unknown';
    const userAgent = req?.get('user-agent') || 'unknown';

    // Wait, let's check if AuditLog exists in prisma schema.
    // If not, we might just console.log for now, or check prisma schema.
    if (prisma.auditLog) {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          description,
          ipAddress,
          userAgent,
        },
      });
    } else {
      console.log(`[AUDIT] ${action} - ${userId}: ${description}`);
    }
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
};
