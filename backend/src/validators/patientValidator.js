/**
 * Patient Validation Schemas
 * Joi schemas for validating patient requests
 */

const Joi = require('joi');

const createPatientSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.min': 'Name must be at least 2 characters long',
        'any.required': 'Name is required',
    }),
    age: Joi.number().min(0).max(150).required().messages({
        'number.min': 'Age must be a positive number',
        'number.max': 'Age must be less than 150',
        'any.required': 'Age is required',
    }),
    gender: Joi.string().valid('male', 'female', 'other').required().messages({
        'any.only': 'Gender must be male, female, or other',
        'any.required': 'Gender is required',
    }),
    contact: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().optional().allow(''),
    symptoms: Joi.string().min(10).required().messages({
        'string.min': 'Symptoms must be at least 10 characters long',
        'any.required': 'Symptoms are required',
    }),
    diagnosis: Joi.string().optional().allow(''),
    medical_history: Joi.string().optional().allow(''),
    allergies: Joi.string().optional().allow(''),
    matched_ayush_codes: Joi.array().items(
        Joi.object({
            code: Joi.string().required(),
            name: Joi.string().required(),
            name_english: Joi.string().optional().allow(''),
            description: Joi.string().optional().allow(''),
            category: Joi.string().optional().allow(''),
            confidence: Joi.number().min(0).max(1).optional(),
            confidence_level: Joi.string().valid('low', 'medium', 'high').optional(),
            selected: Joi.boolean().optional(),
        })
    ).optional(),
    icd_codes: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'discharged', 'follow-up', 'inactive').optional(),
    doctor_id: Joi.alternatives().try(Joi.string(), Joi.number()).optional(), // Allow admin to set doctor_id
});

const updatePatientSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    age: Joi.number().min(0).max(150).optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    contact: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().optional().allow(''),
    symptoms: Joi.string().min(10).optional(),
    diagnosis: Joi.string().optional().allow(''),
    medical_history: Joi.string().optional().allow(''),
    allergies: Joi.string().optional().allow(''),
    matched_ayush_codes: Joi.array().items(
        Joi.object({
            code: Joi.string().required(),
            name: Joi.string().required(),
            name_english: Joi.string().optional().allow(''),
            description: Joi.string().optional().allow(''),
            category: Joi.string().optional().allow(''),
            confidence: Joi.number().min(0).max(1).optional(),
            confidence_level: Joi.string().valid('low', 'medium', 'high').optional(),
            selected: Joi.boolean().optional(),
        })
    ).optional(),
    icd_codes: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'discharged', 'follow-up', 'inactive').optional(),
});

module.exports = {
    createPatientSchema,
    updatePatientSchema,
};
