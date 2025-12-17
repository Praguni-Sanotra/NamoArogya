/**
 * User Model (MongoDB)
 * Mongoose schema for user authentication
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password_hash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['doctor', 'admin'],
        default: 'doctor'
    },
    specialty: {
        type: String
    },
    license_number: {
        type: String
    },
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

// Index for faster queries
userSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
