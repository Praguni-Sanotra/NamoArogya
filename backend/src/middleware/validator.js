/**
 * Request Validation Middleware
 * Uses Joi schemas to validate request data
 */

const Joi = require('joi');
const { errorResponse } = require('../utils/response');

/**
 * Validate request using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, query, params)
 */
function validate(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return errorResponse(res, 'Validation failed', 400, { errors });
        }

        // Replace request data with validated data
        req[property] = value;
        next();
    };
}

module.exports = {
    validate,
};
