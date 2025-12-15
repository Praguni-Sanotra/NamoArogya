/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user and return JWT tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [doctor, admin]
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
async function loginController(req, res, next) {
    try {
        const { email, password, role } = req.body;

        const result = await authService.login(email, password, role);

        return successResponse(res, result, 'Login successful', 200);
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
async function refreshTokenController(req, res, next) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ApiError('Refresh token is required', 400);
        }

        const result = await authService.refreshAccessToken(refreshToken);

        return successResponse(res, result, 'Token refreshed successfully', 200);
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user (client should discard tokens)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
async function logoutController(req, res, next) {
    try {
        // In a stateless JWT system, logout is handled client-side
        // Here we just acknowledge the logout
        // In production, you might want to blacklist the token in Redis

        return successResponse(res, null, 'Logout successful', 200);
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change password
 *     description: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 */
async function changePasswordController(req, res, next) {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        await authService.changePassword(userId, oldPassword, newPassword);

        return successResponse(res, null, 'Password changed successfully', 200);
    } catch (error) {
        next(error);
    }
}

/**
 * Get current user profile
 */
async function getMeController(req, res, next) {
    try {
        return successResponse(res, req.user, 'User profile retrieved', 200);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    loginController,
    refreshTokenController,
    logoutController,
    changePasswordController,
    getMeController,
};
