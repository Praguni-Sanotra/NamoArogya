/**
 * NAMASTE Code Routes
 * API endpoints for AYUSH medical codes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Placeholder controllers
const namasteController = {
    search: async (req, res) => {
        const { q } = req.query;
        // Mock data
        const mockCodes = [
            { code: 'NAM-001', display: 'Vata Dosha Imbalance', category: 'Ayurveda', description: 'Imbalance in Vata dosha' },
            { code: 'NAM-002', display: 'Pitta Dosha Imbalance', category: 'Ayurveda', description: 'Imbalance in Pitta dosha' },
            { code: 'NAM-003', display: 'Kapha Dosha Imbalance', category: 'Ayurveda', description: 'Imbalance in Kapha dosha' },
        ];
        res.json({ success: true, data: mockCodes });
    },
    getByCode: async (req, res) => {
        res.json({ success: true, data: { code: req.params.code, display: 'NAMASTE Code Details' } });
    },
    create: async (req, res) => {
        res.json({ success: true, message: 'NAMASTE code created', data: req.body });
    },
};

/**
 * @swagger
 * /api/namaste/search:
 *   get:
 *     tags: [NAMASTE]
 *     summary: Search NAMASTE codes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching NAMASTE codes
 */
router.get('/search', authenticate, namasteController.search);

/**
 * @swagger
 * /api/namaste/{code}:
 *   get:
 *     tags: [NAMASTE]
 *     summary: Get NAMASTE code by code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *     responses:
 *       200:
 *         description: NAMASTE code details
 */
router.get('/:code', authenticate, namasteController.getByCode);

/**
 * @swagger
 * /api/namaste:
 *   post:
 *     tags: [NAMASTE]
 *     summary: Create new NAMASTE code (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: NAMASTE code created
 */
router.post('/', authenticate, authorize('admin'), namasteController.create);

module.exports = router;
