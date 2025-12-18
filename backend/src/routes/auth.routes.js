/**
 * Authentication Routes
 * Defines auth-related API endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    loginSchema,
    signupSchema,
    refreshTokenSchema,
    changePasswordSchema,
} = require('../validators/authValidator');

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
    '/login',
    authLimiter,
    validate(loginSchema),
    authController.loginController
);

/**
 * @route   POST /api/auth/signup
 * @desc    User signup
 * @access  Public
 */
router.post(
    '/signup',
    authLimiter,
    validate(signupSchema),
    authController.signupController
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/refresh',
    validate(refreshTokenSchema),
    authController.refreshTokenController
);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post(
    '/logout',
    authenticate,
    authController.logoutController
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    authController.changePasswordController
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    authController.getMeController
);

module.exports = router;
