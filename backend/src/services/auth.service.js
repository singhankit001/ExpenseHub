import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';

const SAFE_USER_SELECT = { id: true, name: true, email: true, createdAt: true };

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use.', 409);

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: SAFE_USER_SELECT,
  });
  return { user, token: signToken(user.id) };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  const { password: _pwd, ...safeUser } = user;
  return { user: safeUser, token: signToken(user.id) };
};

export const getProfile = async (userId) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { ...SAFE_USER_SELECT, updatedAt: true },
  });

export const updateProfile = async (userId, data) => {
  if (data.email) {
    const conflict = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
    });
    if (conflict) throw new AppError('Email already in use by another account.', 409);
  }
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, updatedAt: true },
  });
};
