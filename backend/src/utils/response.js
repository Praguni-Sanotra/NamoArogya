/**
 * Standardized API Response Utility
 * Ensures consistent response format across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
function successResponse(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {*} error - Error details
 */
function errorResponse(res, message = 'Error occurred', statusCode = 500, error = null) {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development' && error) {
        response.error = error;
    }

    return res.status(statusCode).json(response);
}

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items count
 * @param {String} message - Success message
 */
function paginatedResponse(res, data, page, limit, total, message = 'Success') {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
        timestamp: new Date().toISOString(),
    });
}

/**
 * FHIR response
 * @param {Object} res - Express response object
 * @param {Object} fhirResource - FHIR resource
 * @param {Number} statusCode - HTTP status code
 */
function fhirResponse(res, fhirResource, statusCode = 200) {
    return res.status(statusCode).json(fhirResource);
}

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse,
    fhirResponse,
};
