/**
 * Authentication Service
 * Handles user authentication, token generation, and password management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pgPool } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Hash password
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new ApiError('Invalid refresh token', 401);
    }
}

/**
 * Login user
 */
async function login(email, password, role) {
    try {
        // Find user by email and role
        const query = `
      SELECT id, email, password_hash, name, role, specialty, license_number, created_at
      FROM users
      WHERE email = $1 AND role = $2
    `;

        const result = await pgPool.query(query, [email, role]);

        if (result.rows.length === 0) {
            throw new ApiError('Invalid credentials', 401);
        }

        const user = result.rows[0];

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            throw new ApiError('Invalid credentials', 401);
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Remove password hash from user object
        delete user.password_hash;

        logger.info(`User logged in: ${user.email} (${user.role})`);

        return {
            user,
            token: accessToken,
            refreshToken,
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Login error:', error);
        throw new ApiError('Login failed', 500);
    }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(refreshToken) {
    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user from database
        const query = `
      SELECT id, email, name, role
      FROM users
      WHERE id = $1
    `;

        const result = await pgPool.query(query, [decoded.id]);

        if (result.rows.length === 0) {
            throw new ApiError('User not found', 404);
        }

        const user = result.rows[0];

        // Generate new access token
        const accessToken = generateAccessToken(user);

        return {
            token: accessToken,
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Token refresh error:', error);
        throw new ApiError('Token refresh failed', 401);
    }
}

/**
 * Change password
 */
async function changePassword(userId, oldPassword, newPassword) {
    try {
        // Get current password hash
        const query = `SELECT password_hash FROM users WHERE id = $1`;
        const result = await pgPool.query(query, [userId]);

        if (result.rows.length === 0) {
            throw new ApiError('User not found', 404);
        }

        const { password_hash } = result.rows[0];

        // Verify old password
        const isPasswordValid = await comparePassword(oldPassword, password_hash);

        if (!isPasswordValid) {
            throw new ApiError('Current password is incorrect', 401);
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        const updateQuery = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
    `;

        await pgPool.query(updateQuery, [newPasswordHash, userId]);

        logger.info(`Password changed for user: ${userId}`);

        return true;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Password change error:', error);
        throw new ApiError('Password change failed', 500);
    }
}

/**
 * Create new user (for admin)
 */
async function createUser(userData) {
    try {
        const { email, password, name, role, specialty, license_number } = userData;

        // Check if user already exists
        const checkQuery = `SELECT id FROM users WHERE email = $1`;
        const checkResult = await pgPool.query(checkQuery, [email]);

        if (checkResult.rows.length > 0) {
            throw new ApiError('User already exists', 409);
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Insert user
        const insertQuery = `
      INSERT INTO users (email, password_hash, name, role, specialty, license_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, role, specialty, license_number, created_at
    `;

        const result = await pgPool.query(insertQuery, [
            email,
            passwordHash,
            name,
            role,
            specialty || null,
            license_number || null,
        ]);

        logger.info(`New user created: ${email} (${role})`);

        return result.rows[0];
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('User creation error:', error);
        throw new ApiError('User creation failed', 500);
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    login,
    refreshAccessToken,
    changePassword,
    createUser,
};
