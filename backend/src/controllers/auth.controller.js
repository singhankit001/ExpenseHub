const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser(name, email, password, req);
  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
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
  const result = await authService.loginUser(email, password, req);
  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

/**
 * @desc    Log in with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleLogin = catchAsync(async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ success: false, message: 'ID token is required.' });
  }
  const result = await authService.loginWithGoogle(idToken, req);
  res.status(200).json({
    success: true,
    message: 'Logged in with Google successfully',
    data: result,
  });
});

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required.' });
  }
  const result = await authService.refreshTokens(refreshToken, req);
  res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: result,
  });
});

/**
 * @desc    Log out from current session
 * @route   POST /api/auth/logout
 * @access  Protected
 */
exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  await authService.logoutUser(refreshToken, req.user.id, req);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
    data: {},
  });
});

/**
 * @desc    Log out from all devices
 * @route   POST /api/auth/logout-all
 * @access  Protected
 */
exports.logoutAll = catchAsync(async (req, res, next) => {
  await authService.logoutAllDevices(req.user.id, req);
  res.status(200).json({
    success: true,
    message: 'Logged out from all devices successfully.',
    data: {},
  });
});

/**
 * @desc    Verify email address
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  const user = await authService.verifyEmail(token, req);
  res.status(200).json({
    success: true,
    message: 'Email verified successfully.',
    data: { user },
  });
});

/**
 * @desc    Request password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  await authService.forgotPassword(email, req);
  res.status(200).json({
    success: true,
    message: 'If that email is registered, a password reset link has been sent.',
    data: {},
  });
});

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password, req);
  res.status(200).json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.',
    data: {},
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
  const updatedProfile = await authService.updateUserProfile(req.user.id, name, email, req);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedProfile },
  });
});
