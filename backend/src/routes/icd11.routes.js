/**
 * ICD-11 Code Routes
 * API endpoints for ICD-11 codes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Placeholder controllers
const icd11Controller = {
    search: async (req, res) => {
        const { q } = req.query;
        // Mock data
        const mockCodes = [
            { code: 'ICD-A01', display: 'Typhoid fever', category: 'Infectious diseases', description: 'Typhoid and paratyphoid fevers' },
            { code: 'ICD-B02', display: 'Zoster [herpes zoster]', category: 'Infectious diseases', description: 'Herpes zoster infection' },
            { code: 'ICD-C03', display: 'Malignant neoplasm', category: 'Neoplasms', description: 'Malignant neoplasms' },
        ];
        res.json({ success: true, data: mockCodes });
    },
    getByCode: async (req, res) => {
        res.json({ success: true, data: { code: req.params.code, display: 'ICD-11 Code Details' } });
    },
    create: async (req, res) => {
        res.json({ success: true, message: 'ICD-11 code created', data: req.body });
    },
};

/**
 * @swagger
 * /api/icd11/search:
 *   get:
 *     tags: [ICD-11]
 *     summary: Search ICD-11 codes
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
 *         description: List of matching ICD-11 codes
 */
router.get('/search', authenticate, icd11Controller.search);

/**
 * @swagger
 * /api/icd11/{code}:
 *   get:
 *     tags: [ICD-11]
 *     summary: Get ICD-11 code by code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *     responses:
 *       200:
 *         description: ICD-11 code details
 */
router.get('/:code', authenticate, icd11Controller.getByCode);

/**
 * @swagger
 * /api/icd11:
 *   post:
 *     tags: [ICD-11]
 *     summary: Create new ICD-11 code (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: ICD-11 code created
 */
router.post('/', authenticate, authorize('admin'), icd11Controller.create);

module.exports = router;
