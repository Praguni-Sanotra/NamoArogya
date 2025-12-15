/**
 * Dual Coding Routes
 * API endpoints for NAMASTE to ICD-11 mapping
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

// Placeholder controllers
const dualCodingController = {
    getAll: async (req, res) => {
        res.json({ success: true, message: 'Get all mappings', data: [] });
    },
    getMapping: async (req, res) => {
        res.json({ success: true, message: 'Get specific mapping', data: {} });
    },
    create: async (req, res) => {
        res.json({ success: true, message: 'Mapping created', data: req.body });
    },
    update: async (req, res) => {
        res.json({ success: true, message: 'Mapping updated', data: {} });
    },
    suggest: async (req, res) => {
        // AI-powered suggestion placeholder
        res.json({ success: true, message: 'AI mapping suggestions', data: [] });
    },
};

/**
 * @swagger
 * /api/dual-coding:
 *   get:
 *     tags: [Dual Coding]
 *     summary: Get all dual coding mappings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mappings
 */
router.get('/', authenticate, dualCodingController.getAll);

/**
 * @swagger
 * /api/dual-coding/mapping:
 *   get:
 *     tags: [Dual Coding]
 *     summary: Get specific mapping
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: namasteCode
 *       - in: query
 *         name: icd11Code
 *     responses:
 *       200:
 *         description: Mapping details
 */
router.get('/mapping', authenticate, dualCodingController.getMapping);

/**
 * @swagger
 * /api/dual-coding:
 *   post:
 *     tags: [Dual Coding]
 *     summary: Create new mapping
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               namasteCode:
 *                 type: string
 *               icd11Code:
 *                 type: string
 *               patientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mapping created
 */
router.post('/', authenticate, authorize('doctor', 'admin'), dualCodingController.create);

/**
 * @swagger
 * /api/dual-coding/{id}:
 *   put:
 *     tags: [Dual Coding]
 *     summary: Update mapping
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mapping updated
 */
router.put('/:id', authenticate, authorize('doctor', 'admin'), dualCodingController.update);

/**
 * @swagger
 * /api/dual-coding/suggest:
 *   post:
 *     tags: [Dual Coding]
 *     summary: Get AI-powered mapping suggestions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               namasteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mapping suggestions
 */
router.post('/suggest', authenticate, dualCodingController.suggest);

module.exports = router;
