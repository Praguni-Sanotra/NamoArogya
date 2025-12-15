/**
 * NAMASTE Code Schema (MongoDB)
 * AYUSH medical coding system
 */

const mongoose = require('mongoose');

const namasteCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    display: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        enum: ['Ayurveda', 'Yoga', 'Unani', 'Siddha', 'Homeopathy', 'Naturopathy'],
        required: true,
    },
    subcategory: String,
    system: {
        type: String,
        default: 'NAMASTE',
    },
    synonyms: [String],
    relatedCodes: [String],
    icd11Mappings: [{
        icd11Code: String,
        confidence: Number,
        verified: Boolean,
    }],
    active: {
        type: Boolean,
        default: true,
    },
    metadata: {
        version: String,
        lastUpdated: Date,
        source: String,
    },
}, {
    timestamps: true,
    collection: 'namaste_codes',
});

// Text search index
namasteCodeSchema.index({ display: 'text', description: 'text', synonyms: 'text' });
namasteCodeSchema.index({ category: 1 });
namasteCodeSchema.index({ active: 1 });

module.exports = mongoose.model('NAMASTECode', namasteCodeSchema);
