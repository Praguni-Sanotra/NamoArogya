/**
 * ICD-11 Code Schema (MongoDB)
 * International Classification of Diseases codes
 */

const mongoose = require('mongoose');

const icd11CodeSchema = new mongoose.Schema({
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
    chapter: String,
    category: String,
    subcategory: String,
    system: {
        type: String,
        default: 'ICD-11',
    },
    uri: String, // WHO ICD-11 URI
    synonyms: [String],
    inclusions: [String],
    exclusions: [String],
    relatedCodes: [String],
    namasteMappings: [{
        namasteCode: String,
        confidence: Number,
        verified: Boolean,
    }],
    active: {
        type: Boolean,
        default: true,
    },
    metadata: {
        version: String,
        releaseDate: Date,
        lastUpdated: Date,
        source: String,
    },
}, {
    timestamps: true,
    collection: 'icd11_codes',
});

// Text search index
icd11CodeSchema.index({ display: 'text', description: 'text', synonyms: 'text' });
icd11CodeSchema.index({ chapter: 1 });
icd11CodeSchema.index({ category: 1 });
icd11CodeSchema.index({ active: 1 });

module.exports = mongoose.model('ICD11Code', icd11CodeSchema);
