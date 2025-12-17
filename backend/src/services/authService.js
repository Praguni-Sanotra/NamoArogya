/**
 * Authentication Service - MongoDB Version
 * Handles user authentication, token generation, and password management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/mongodb/User');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this';
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
            id: user._id || user.id,
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
            id: user._id || user.id,
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
 * Login user - MongoDB version
 */
async function login(email, password, role) {
    try {
        // Find user by email and role
        const user = await User.findOne({ email, role });

        if (!user) {
            throw new ApiError('Invalid credentials', 401);
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            throw new ApiError('Invalid credentials', 401);
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Convert to plain object and remove password hash
        const userObject = user.toObject();
        delete userObject.password_hash;

        logger.info(`User logged in: ${user.email} (${user.role})`);

        return {
            user: userObject,
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
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new ApiError('User not found', 404);
        }

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
        // Get user
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        // Verify old password
        const isPasswordValid = await comparePassword(oldPassword, user.password_hash);

        if (!isPasswordValid) {
            throw new ApiError('Current password is incorrect', 401);
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        user.password_hash = newPasswordHash;
        user.updated_at = new Date();
        await user.save();

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
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new ApiError('User already exists', 409);
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = new User({
            email,
            password_hash: passwordHash,
            name,
            role,
            specialty,
            license_number
        });

        await user.save();

        logger.info(`New user created: ${email} (${role})`);

        // Return user without password
        const userObject = user.toObject();
        delete userObject.password_hash;

        return userObject;
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
