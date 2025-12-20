const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    getDatabaseInfo,
    getDualCodingMappings,
    getSystemStats
} = require('../controllers/adminController');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', authenticate, authorize(['admin']), getAllUsers);

/**
 * @swagger
 * /api/admin/database-info:
 *   get:
 *     summary: Get database information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database size, tables, and connections
 */
router.get('/database-info', authenticate, authorize(['admin']), getDatabaseInfo);

/**
 * @swagger
 * /api/admin/dual-coding-mappings:
 *   get:
 *     summary: Get all dual coding mappings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all AYUSH to ICD-11 mappings
 */
router.get('/dual-coding-mappings', authenticate, authorize(['admin']), getDualCodingMappings);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System-wide statistics
 */
router.get('/stats', authenticate, authorize(['admin']), getSystemStats);

module.exports = router;
