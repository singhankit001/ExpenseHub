const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/appError');

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>}
 */
exports.registerUser = async (name, email, password) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('A user with this email already exists.', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Generate token
  const token = signToken(newUser.id);

  return { token, user: newUser };
};

/**
 * Log in an existing user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>}
 */
exports.loginUser = async (email, password) => {
  // Fetch user including password
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;

  // Generate token
  const token = signToken(user.id);

  return { token, user: userWithoutPassword };
};

/**
 * Retrieve user profile
 * @param {string} userId 
 * @returns {Promise<object>}
 */
exports.getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
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
 * @param {string} userId 
 * @param {string} name 
 * @param {string} email 
 * @returns {Promise<object>}
 */
exports.updateUserProfile = async (userId, name, email) => {
  // Check email uniqueness if email is changing
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (existingUser && existingUser.email !== email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email },
      });
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
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
