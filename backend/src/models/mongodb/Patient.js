/**
 * Patient Model (MongoDB)
 * Schema for patient records with AYUSH code matching
 */

const mongoose = require('mongoose');

const matchedCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    name_english: String,
    description: String,
    category: String,
    confidence: {
        type: Number,
        min: 0,
        max: 1
    },
    confidence_level: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    selected: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const patientSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 150
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    contact: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        trim: true
    },

    // Medical Information
    symptoms: {
        type: String,
        required: true,
        minlength: 10
    },
    diagnosis: {
        type: String,
        trim: true
    },
    medical_history: {
        type: String,
        trim: true
    },
    allergies: {
        type: String,
        trim: true
    },

    // Code Matching
    matched_ayush_codes: [matchedCodeSchema],
    icd_codes: [{
        type: String,
        trim: true
    }],

    // Status
    status: {
        type: String,
        enum: ['active', 'discharged', 'follow-up', 'inactive'],
        default: 'active'
    },

    // Doctor Reference
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Timestamps
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for faster queries
patientSchema.index({ name: 1 });
patientSchema.index({ doctor_id: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ created_at: -1 });

// Text index for search
patientSchema.index({ name: 'text', symptoms: 'text', diagnosis: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
