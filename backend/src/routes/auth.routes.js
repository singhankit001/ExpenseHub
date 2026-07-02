const express = require('express');
const authController = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
} = require('../validators/auth.validator');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique UUID
 *         name:
 *           type: string
 *           description: User full name
 *         email:
 *           type: string
 *           description: Unique email address
 *         password:
 *           type: string
 *           description: Hashed password
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "a3f5b7c8-9d0e-1f2a-3b4c-5d6e7f8a9b0c"
 *         name: "Ankit Singh"
 *         email: "ankit@example.com"
 *         createdAt: "2026-07-04T12:00:00.000Z"
 *         updatedAt: "2026-07-04T12:00:00.000Z"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ankit Singh
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ankit@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation failed or email in use
 */
router.post('/register', registerValidator, validate, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ankit@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, validate, authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current logged in user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update current logged in user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ankit Singh Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ankitnew@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed or email already taken
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', protect, updateProfileValidator, validate, authController.updateProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out from session (client instruction)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful instruction
 */
router.post('/logout', protect, authController.logout);

module.exports = router;
