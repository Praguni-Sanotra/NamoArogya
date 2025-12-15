/**
 * Patient Routes
 * API endpoints for patient management
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

// Placeholder controllers - to be implemented
const patientController = {
    getAll: async (req, res) => {
        res.json({ success: true, message: 'Get all patients', data: [] });
    },
    getById: async (req, res) => {
        res.json({ success: true, message: 'Get patient by ID', data: {} });
    },
    create: async (req, res) => {
        res.json({ success: true, message: 'Patient created', data: {} });
    },
    update: async (req, res) => {
        res.json({ success: true, message: 'Patient updated', data: {} });
    },
    delete: async (req, res) => {
        res.json({ success: true, message: 'Patient deleted' });
    },
    getFHIR: async (req, res) => {
        res.json({ resourceType: 'Patient', id: req.params.id });
    },
};

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get('/', authenticate, patientController.getAll);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient details
 */
router.get('/:id', authenticate, patientController.getById);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     tags: [Patients]
 *     summary: Create new patient
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created
 */
router.post('/', authenticate, authorize('doctor', 'admin'), patientController.create);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     tags: [Patients]
 *     summary: Update patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated
 */
router.put('/:id', authenticate, authorize('doctor', 'admin'), patientController.update);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Delete patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient deleted
 */
router.delete('/:id', authenticate, authorize('admin'), patientController.delete);

/**
 * @swagger
 * /api/patients/{id}/fhir:
 *   get:
 *     tags: [Patients]
 *     summary: Get FHIR Patient resource
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FHIR Patient resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FHIRPatient'
 */
router.get('/:id/fhir', authenticate, patientController.getFHIR);

module.exports = router;
