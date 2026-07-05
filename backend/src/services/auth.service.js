const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const AppError = require('../utils/appError');
const emailService = require('../utils/email');
const { logActivity } = require('../utils/auditLogger');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Token helpers ────────────────────────────────────────────────────────────

/**
 * Sign a short-lived access token (15 minutes)
 */
const signAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

/**
 * Generate a cryptographically random opaque refresh token string
 */
const generateRefreshTokenString = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Store a new refresh token in the database for a user
 * @returns {string} the raw token string
 */
const createRefreshToken = async (userId) => {
  const token = generateRefreshTokenString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

/**
 * Build the safe user object to return to clients (no sensitive fields)
 */
const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ─── Auth Services ────────────────────────────────────────────────────────────

/**
 * Register a new user
 */
exports.registerUser = async (name, email, password, req) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('A user with this email already exists.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a verification token
  const rawVerificationToken = crypto.randomBytes(32).toString('hex');

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      verificationToken: rawVerificationToken,
    },
  });

  // Send verification email (non-blocking)
  emailService.sendVerificationEmail(email, rawVerificationToken, name).catch(console.error);

  // Generate tokens
  const accessToken = signAccessToken(newUser.id, newUser.role);
  const refreshToken = await createRefreshToken(newUser.id);

  await logActivity(newUser.id, 'REGISTER', `New user registered: ${email}`, req);

  return {
    accessToken,
    refreshToken,
    user: safeUser(newUser),
  };
};

/**
 * Log in an existing user
 */
exports.loginUser = async (email, password, req) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.isDisabled) {
    throw new AppError('Your account has been disabled. Please contact support.', 403);
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  await logActivity(user.id, 'LOGIN', `Login from ${req?.ip || 'unknown IP'}`, req);

  return {
    accessToken,
    refreshToken,
    user: safeUser(user),
  };
};

/**
 * Log in or register user using Google ID Token
 */
exports.loginWithGoogle = async (idToken, req) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, email_verified } = payload;
  
  if (!email_verified) {
    throw new AppError('Google email not verified.', 401);
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        googleId,
        provider: 'GOOGLE',
        isVerified: true,
      },
    });
    await logActivity(user.id, 'REGISTER', `New user registered via Google: ${email}`, req);
  } else {
    // If user exists but no googleId is linked, link it
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId, provider: 'GOOGLE', isVerified: true },
      });
    }
  }

  if (user.isDisabled) {
    throw new AppError('Your account has been disabled. Please contact support.', 403);
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  await logActivity(user.id, 'LOGIN', `Google Login from ${req?.ip || 'unknown IP'}`, req);

  return {
    accessToken,
    refreshToken,
    user: safeUser(user),
  };
};

/**
 * Rotate refresh tokens — invalidate old token, issue new pair
 */
exports.refreshTokens = async (rawToken, req) => {
  // Find the refresh token record
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: rawToken },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new AppError('Invalid refresh token.', 401);
  }

  // Detect token reuse (revoked token replay attack)
  if (tokenRecord.isRevoked) {
    // Security: revoke ALL tokens for this user (compromised account)
    await prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId },
      data: { isRevoked: true },
    });
    await logActivity(tokenRecord.userId, 'TOKEN_REUSE_DETECTED', 'All refresh tokens revoked due to reuse attack', req);
    throw new AppError('Token reuse detected. All sessions have been invalidated. Please log in again.', 401);
  }

  // Check expiry
  if (new Date() > tokenRecord.expiresAt) {
    throw new AppError('Refresh token has expired. Please log in again.', 401);
  }

  const user = tokenRecord.user;

  if (user.isDisabled) {
    throw new AppError('Your account has been disabled. Please contact support.', 403);
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { isRevoked: true },
  });

  // Issue new pair
  const newAccessToken = signAccessToken(user.id, user.role);
  const newRefreshToken = await createRefreshToken(user.id);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: safeUser(user),
  };
};

/**
 * Logout a single session (revoke one refresh token)
 */
exports.logoutUser = async (rawToken, userId, req) => {
  if (rawToken) {
    await prisma.refreshToken.updateMany({
      where: { token: rawToken, userId },
      data: { isRevoked: true },
    });
  }
  await logActivity(userId, 'LOGOUT', 'User logged out', req);
};

/**
 * Logout from all devices (revoke all refresh tokens for user)
 */
exports.logoutAllDevices = async (userId, req) => {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
  await logActivity(userId, 'LOGOUT_ALL', 'User logged out from all devices', req);
};

/**
 * Verify email with a token
 */
exports.verifyEmail = async (token, req) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token.', 400);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified.', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  await logActivity(user.id, 'EMAIL_VERIFIED', 'Email address verified', req);

  return safeUser({ ...user, isVerified: true });
};

/**
 * Initiate password reset — generate hashed reset token
 */
exports.forgotPassword = async (email, req) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) return;

  // Generate a raw token and hash it for storage
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });

  await emailService.sendPasswordResetEmail(email, rawToken, user.name);
  await logActivity(user.id, 'PASSWORD_RESET_REQUEST', 'Password reset requested', req);
};

/**
 * Reset password using the raw reset token
 */
exports.resetPassword = async (rawToken, newPassword, req) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gte: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired password reset token.', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  // Revoke all existing refresh tokens (force re-login everywhere)
  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { isRevoked: true },
  });

  await logActivity(user.id, 'PASSWORD_RESET', 'Password was reset successfully', req);
};

/**
 * Retrieve user profile
 */
exports.getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

/**
 * Update user profile details
 */
exports.updateUserProfile = async (userId, name, email, req) => {
  if (email) {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (existingUser && existingUser.email !== email) {
      const emailConflict = await prisma.user.findUnique({ where: { email } });
      if (emailConflict) {
        throw new AppError('Email is already in use by another account.', 400);
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      email: email || undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logActivity(userId, 'PROFILE_UPDATE', 'Profile updated', req);

  return updatedUser;
};
