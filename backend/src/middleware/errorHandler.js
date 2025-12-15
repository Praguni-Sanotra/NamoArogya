/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
    let { statusCode, message } = err;

    // Default to 500 if no status code
    statusCode = statusCode || 500;
    message = message || 'Internal Server Error';

    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    }

    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Unauthorized - Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Unauthorized - Token expired';
    }

    if (err.code === '23505') { // PostgreSQL unique violation
        statusCode = 409;
        message = 'Resource already exists';
    }

    if (err.code === '23503') { // PostgreSQL foreign key violation
        statusCode = 400;
        message = 'Invalid reference';
    }

    // Send error response
    return errorResponse(
        res,
        message,
        statusCode,
        process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err.message,
        } : null
    );
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    const error = new ApiError(`Route ${req.originalUrl} not found`, 404);
    next(error);
}

module.exports = {
    errorHandler,
    notFoundHandler,
    ApiError,
};
