/**
 * Diagnosis Routes
 * API endpoints for diagnosis management
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

// Placeholder controllers
const diagnosisController = {
    getAll: async (req, res) => {
        res.json({ success: true, message: 'Get all diagnoses', data: [] });
    },
    getById: async (req, res) => {
        res.json({ success: true, message: 'Get diagnosis by ID', data: {} });
    },
    getByPatient: async (req, res) => {
        res.json({ success: true, message: 'Get patient diagnoses', data: [] });
    },
    create: async (req, res) => {
        res.json({ success: true, message: 'Diagnosis created', data: {} });
    },
    update: async (req, res) => {
        res.json({ success: true, message: 'Diagnosis updated', data: {} });
    },
};

/**
 * @swagger
 * /api/diagnosis:
 *   get:
 *     tags: [Diagnosis]
 *     summary: Get all diagnoses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of diagnoses
 */
router.get('/', authenticate, diagnosisController.getAll);

/**
 * @swagger
 * /api/diagnosis/{id}:
 *   get:
 *     tags: [Diagnosis]
 *     summary: Get diagnosis by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Diagnosis details
 */
router.get('/:id', authenticate, diagnosisController.getById);

/**
 * @swagger
 * /api/diagnosis/patient/{patientId}:
 *   get:
 *     tags: [Diagnosis]
 *     summary: Get diagnoses for a patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *     responses:
 *       200:
 *         description: Patient diagnoses
 */
router.get('/patient/:patientId', authenticate, diagnosisController.getByPatient);

/**
 * @swagger
 * /api/diagnosis:
 *   post:
 *     tags: [Diagnosis]
 *     summary: Create new diagnosis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Diagnosis created
 */
router.post('/', authenticate, authorize('doctor', 'admin'), diagnosisController.create);

/**
 * @swagger
 * /api/diagnosis/{id}:
 *   put:
 *     tags: [Diagnosis]
 *     summary: Update diagnosis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnosis updated
 */
router.put('/:id', authenticate, authorize('doctor', 'admin'), diagnosisController.update);

module.exports = router;
