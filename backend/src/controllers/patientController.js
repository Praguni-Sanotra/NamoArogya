/**
 * Patient Controller - Hybrid Version
 * Handles patient-related HTTP requests
 * Falls back to PostgreSQL if MongoDB is not available
 */

const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/response');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Check if MongoDB is connected
function isMongoDBConnected() {
    return mongoose.connection.readyState === 1;
}

// Lazy load models and services
let Patient;
let pgPatientService;

try {
    Patient = require('../models/mongodb/Patient');
} catch (error) {
    logger.warn('MongoDB Patient model not available');
}

try {
    pgPatientService = require('../services/patientService.postgres');
} catch (error) {
    logger.warn('PostgreSQL patient service not available');
}

/**
 * Create new patient with auto code matching
 */
async function createPatient(req, res, next) {
    try {
        const patientData = req.body;
        let doctorId = req.user.id; // Default to current user

        // Allow admin to specify doctor_id
        if (req.user.role === 'admin' && patientData.doctor_id) {
            doctorId = patientData.doctor_id;
        }

        // Get AI code recommendations if not provided
        if (!patientData.matched_ayush_codes || patientData.matched_ayush_codes.length === 0) {
            try {
                const aiResult = await aiService.getCodeRecommendations(
                    patientData.symptoms,
                    patientData.medical_history,
                    5
                );

                if (aiResult.success && aiResult.recommendations.length > 0) {
                    patientData.matched_ayush_codes = aiResult.recommendations.map(rec => ({
                        code: rec.code,
                        name: rec.name,
                        name_english: rec.name_english || '',
                        description: rec.description || '',
                        category: rec.category || '',
                        confidence: rec.confidence,
                        confidence_level: rec.confidence_level,
                        selected: false // Doctor must manually select
                    }));
                }
            } catch (aiError) {
                logger.warn('AI recommendations failed:', aiError.message);
                // Continue without AI recommendations
            }
        }

        // Use PostgreSQL if MongoDB is not connected
        if (!isMongoDBConnected() && pgPatientService) {
            logger.info('Using PostgreSQL to create patient');
            const patient = await pgPatientService.createPatient(patientData, doctorId);
            return successResponse(res, { patient }, 'Patient created successfully', 201);
        }

        // Create patient with MongoDB
        const patient = new Patient({
            ...patientData,
            doctor_id: doctorId
        });

        await patient.save();

        logger.info(`Patient created: ${patient._id} by doctor: ${doctorId}`);

        return successResponse(res, { patient }, 'Patient created successfully', 201);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new ApiError(error.message, 400));
        }
        next(error);
    }
}

/**
 * Get all patients with pagination and filters
 */
async function getPatients(req, res, next) {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        // Admin users see all patients, doctors see only their patients
        const doctorId = req.user.role === 'admin' ? null : req.user.id;

        // Use PostgreSQL if MongoDB is not connected
        if (!isMongoDBConnected() && pgPatientService) {
            logger.info('Using PostgreSQL for patient data');
            const result = await pgPatientService.getPatients(doctorId, {
                page, limit, status, search, sortBy, sortOrder
            });
            return successResponse(res, result, 'Patients retrieved successfully', 200);
        }

        const query = doctorId ? { doctor_id: doctorId } : {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Search by name or symptoms
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [patients, total] = await Promise.all([
            Patient.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Patient.countDocuments(query)
        ]);

        return successResponse(res, {
            patients,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, 'Patients retrieved successfully', 200);
    } catch (error) {
        next(error);
    }
}

/**
 * Get single patient by ID
 */
async function getPatientById(req, res, next) {
    try {
        const { id } = req.params;
        const doctorId = req.user.id;

        const patient = await Patient.findOne({
            _id: id,
            doctor_id: doctorId
        });

        if (!patient) {
            throw new ApiError('Patient not found', 404);
        }

        return successResponse(res, { patient }, 'Patient retrieved successfully', 200);
    } catch (error) {
        next(error);
    }
}

/**
 * Update patient
 */
async function updatePatient(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const doctorId = req.user.id;

        // If symptoms changed, get new code recommendations
        if (updateData.symptoms) {
            const patient = await Patient.findOne({ _id: id, doctor_id: doctorId });

            if (patient && patient.symptoms !== updateData.symptoms) {
                const aiResult = await aiService.getCodeRecommendations(
                    updateData.symptoms,
                    updateData.medical_history || patient.medical_history,
                    5
                );

                if (aiResult.success && aiResult.recommendations.length > 0) {
                    // Keep previously selected codes, add new suggestions
                    const existingSelected = patient.matched_ayush_codes
                        .filter(code => code.selected)
                        .map(code => code.code);

                    const newCodes = aiResult.recommendations
                        .filter(rec => !existingSelected.includes(rec.code))
                        .map(rec => ({
                            code: rec.code,
                            name: rec.name,
                            name_english: rec.name_english || '',
                            description: rec.description || '',
                            category: rec.category || '',
                            confidence: rec.confidence,
                            confidence_level: rec.confidence_level,
                            selected: false
                        }));

                    updateData.matched_ayush_codes = [
                        ...patient.matched_ayush_codes.filter(code => code.selected),
                        ...newCodes
                    ];
                }
            }
        }

        const patient = await Patient.findOneAndUpdate(
            { _id: id, doctor_id: doctorId },
            { ...updateData, updated_at: new Date() },
            { new: true, runValidators: true }
        );

        if (!patient) {
            throw new ApiError('Patient not found', 404);
        }

        logger.info(`Patient updated: ${id} by doctor: ${doctorId}`);

        return successResponse(res, { patient }, 'Patient updated successfully', 200);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new ApiError(error.message, 400));
        }
        next(error);
    }
}

/**
 * Delete patient (soft delete by setting status to inactive)
 */
async function deletePatient(req, res, next) {
    try {
        const { id } = req.params;
        const doctorId = req.user.id;

        const patient = await Patient.findOneAndUpdate(
            { _id: id, doctor_id: doctorId },
            { status: 'inactive', updated_at: new Date() },
            { new: true }
        );

        if (!patient) {
            throw new ApiError('Patient not found', 404);
        }

        logger.info(`Patient deleted: ${id} by doctor: ${doctorId}`);

        return successResponse(res, { patient }, 'Patient deleted successfully', 200);
    } catch (error) {
        next(error);
    }
}

/**
 * Get code recommendations for symptoms (helper endpoint)
 */
async function getCodeRecommendations(req, res, next) {
    try {
        const { symptoms, medical_history, top_k = 5 } = req.body;

        if (!symptoms) {
            throw new ApiError('Symptoms are required', 400);
        }

        const result = await aiService.getCodeRecommendations(
            symptoms,
            medical_history,
            parseInt(top_k)
        );

        if (!result.success) {
            throw new ApiError(result.error || 'Failed to get recommendations', 500);
        }

        return successResponse(res, {
            recommendations: result.recommendations,
            processing_time: result.processing_time
        }, 'Recommendations retrieved successfully', 200);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getCodeRecommendations
};
