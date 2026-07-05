const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async (req, res, next) => {
  // 1) Retrieve token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to gain access.', 401)
    );
  }

  // 2) Verify the JWT signature
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3) Check if user still exists in the database
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 5) Check if the user is disabled by an admin
  if (currentUser.isDisabled) {
    return next(
      new AppError('Your account has been disabled. Please contact support.', 403)
    );
  }

  // 6) Attach user to the request object
  req.user = currentUser;
  next();
});
