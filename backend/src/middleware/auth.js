/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and implements role-based access control
 */

const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Verify JWT token
 */
async function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token expired', 401);
        }
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid token', 401);
        }
        next(error);
    }
}

/**
 * Role-based access control middleware
 * @param {...String} roles - Allowed roles
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError('Unauthorized', 401);
        }

        if (!roles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
            throw new ApiError('Forbidden - Insufficient permissions', 403);
        }

        next();
    };
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name,
            };
        }

        next();
    } catch (error) {
        // Continue without user info
        next();
    }
}

module.exports = {
    authenticate,
    authorize,
    optionalAuth,
};
