const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const result = await authService.registerUser(name, email, password);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Protected
 */
exports.getProfile = catchAsync(async (req, res, next) => {
  const profile = await authService.getUserProfile(req.user.id);

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: { user: profile },
  });
});

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Protected
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const updatedProfile = await authService.updateUserProfile(req.user.id, name, email);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedProfile },
  });
});

/**
 * @desc    Log out user / JWT Invalidation strategy
 * @route   POST /api/auth/logout
 * @access  Protected
 */
exports.logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please delete the token from the client storage.',
    data: {},
  });
});
