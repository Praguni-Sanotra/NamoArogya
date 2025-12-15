/**
 * Audit Logging Middleware
 * Logs all clinical actions for compliance and security
 */

const { pgPool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Audit log middleware
 * Logs actions on clinical resources
 */
async function auditLog(action, resourceType) {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        // Override send function to log after response
        res.send = function (data) {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                logAudit(req, action, resourceType, res.statusCode);
            }

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
}

/**
 * Log audit entry to database
 */
async function logAudit(req, action, resourceType, statusCode) {
    try {
        const userId = req.user?.id || null;
        const resourceId = req.params.id || req.body?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, status_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

        await pgPool.query(query, [
            userId,
            action,
            resourceType,
            resourceId,
            ipAddress,
            userAgent,
            statusCode,
        ]);

        logger.info(`Audit log: ${action} ${resourceType}`, {
            userId,
            resourceId,
            ipAddress,
        });
    } catch (error) {
        // Don't fail the request if audit logging fails
        logger.error('Failed to create audit log:', error);
    }
}

/**
 * Get audit logs for a resource
 */
async function getAuditLogs(resourceType, resourceId, limit = 50) {
    try {
        const query = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.resource_type = $1 AND al.resource_id = $2
      ORDER BY al.timestamp DESC
      LIMIT $3
    `;

        const result = await pgPool.query(query, [resourceType, resourceId, limit]);
        return result.rows;
    } catch (error) {
        logger.error('Failed to retrieve audit logs:', error);
        throw error;
    }
}

module.exports = {
    auditLog,
    getAuditLogs,
};
