/**
 * Authentication Validation Schemas
 * Joi schemas for validating auth requests
 */

const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    role: Joi.string().valid('doctor', 'admin').required().messages({
        'any.only': 'Role must be either doctor or admin',
        'any.required': 'Role is required',
    }),
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token is required',
    }),
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        'any.required': 'Current password is required',
    }),
    newPassword: Joi.string().min(8).required().messages({
        'string.min': 'New password must be at least 8 characters',
        'any.required': 'New password is required',
    }),
});

const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('doctor', 'admin').required(),
    specialty: Joi.string().optional(),
    license_number: Joi.string().optional(),
});

module.exports = {
    loginSchema,
    refreshTokenSchema,
    changePasswordSchema,
    createUserSchema,
};
