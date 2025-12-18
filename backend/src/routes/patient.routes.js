/**
 * Patient Routes
 * Defines patient-related API endpoints
 */

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
    createPatientSchema,
    updatePatientSchema,
} = require('../validators/patientValidator');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/patients
 * @desc    Create new patient
 * @access  Private (Doctor/Admin)
 */
router.post(
    '/',
    validate(createPatientSchema),
    patientController.createPatient
);

/**
 * @route   GET /api/patients
 * @desc    Get all patients with pagination
 * @access  Private (Doctor/Admin)
 */
router.get(
    '/',
    patientController.getPatients
);

/**
 * @route   GET /api/patients/:id
 * @desc    Get patient by ID
 * @access  Private (Doctor/Admin)
 */
router.get(
    '/:id',
    patientController.getPatientById
);

/**
 * @route   PUT /api/patients/:id
 * @desc    Update patient
 * @access  Private (Doctor/Admin)
 */
router.put(
    '/:id',
    validate(updatePatientSchema),
    patientController.updatePatient
);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Delete patient (soft delete)
 * @access  Private (Doctor/Admin)
 */
router.delete(
    '/:id',
    patientController.deletePatient
);

/**
 * @route   POST /api/patients/code-recommendations
 * @desc    Get AYUSH code recommendations for symptoms
 * @access  Private (Doctor/Admin)
 */
router.post(
    '/code-recommendations',
    patientController.getCodeRecommendations
);

module.exports = router;
