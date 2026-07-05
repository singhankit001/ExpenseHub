/**
 * Email Service
 * Development mode: logs emails to console (no SMTP required)
 * Production mode: extend this to use nodemailer or SendGrid
 */

/**
 * Send a verification email
 * @param {string} email - recipient email
 * @param {string} token - verification token (raw, before hashing)
 * @param {string} name - recipient name
 */
exports.sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  // Log to console in dev mode (replace with nodemailer/SendGrid in production)
  console.log('');
  console.log('========== [DEV EMAIL: Email Verification] ==========');
  console.log(`To: ${name} <${email}>`);
  console.log(`Subject: Verify your ExpenseFlow account`);
  console.log(`Body:`);
  console.log(`  Hello ${name},`);
  console.log(`  Please verify your email by clicking the link below:`);
  console.log(`  ${verificationUrl}`);
  console.log(`  This link expires in 24 hours.`);
  console.log('======================================================');
  console.log('');
};

/**
 * Send a password reset email
 * @param {string} email - recipient email
 * @param {string} token - reset token (raw, before hashing)
 * @param {string} name - recipient name
 */
exports.sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  console.log('');
  console.log('========== [DEV EMAIL: Password Reset] ==========');
  console.log(`To: ${name} <${email}>`);
  console.log(`Subject: Reset your ExpenseFlow password`);
  console.log(`Body:`);
  console.log(`  Hello ${name},`);
  console.log(`  Reset your password by clicking the link below:`);
  console.log(`  ${resetUrl}`);
  console.log(`  This link expires in 15 minutes.`);
  console.log(`  If you did not request this, please ignore this email.`);
  console.log('==================================================');
  console.log('');
};
