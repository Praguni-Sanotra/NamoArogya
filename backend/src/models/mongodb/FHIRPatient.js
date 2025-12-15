/**
 * FHIR Patient Resource Schema (MongoDB)
 * Based on FHIR R4 specification
 */

const mongoose = require('mongoose');

const fhirPatientSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        default: 'Patient',
        required: true,
    },
    id: {
        type: String,
        required: true,
        unique: true,
    },
    identifier: [{
        use: String,
        type: {
            coding: [{
                system: String,
                code: String,
                display: String,
            }],
            text: String,
        },
        system: String,
        value: String,
    }],
    active: {
        type: Boolean,
        default: true,
    },
    name: [{
        use: String,
        text: String,
        family: String,
        given: [String],
        prefix: [String],
        suffix: [String],
    }],
    telecom: [{
        system: String, // phone, email, etc.
        value: String,
        use: String,
    }],
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'unknown'],
    },
    birthDate: Date,
    address: [{
        use: String,
        type: String,
        text: String,
        line: [String],
        city: String,
        district: String,
        state: String,
        postalCode: String,
        country: String,
    }],
    maritalStatus: {
        coding: [{
            system: String,
            code: String,
            display: String,
        }],
        text: String,
    },
    contact: [{
        relationship: [{
            coding: [{
                system: String,
                code: String,
                display: String,
            }],
            text: String,
        }],
        name: {
            use: String,
            text: String,
            family: String,
            given: [String],
        },
        telecom: [{
            system: String,
            value: String,
            use: String,
        }],
        address: {
            use: String,
            type: String,
            text: String,
            line: [String],
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
    }],
    managingOrganization: {
        reference: String,
        display: String,
    },
    meta: {
        versionId: String,
        lastUpdated: Date,
        source: String,
        profile: [String],
        security: [{
            system: String,
            code: String,
            display: String,
        }],
        tag: [{
            system: String,
            code: String,
            display: String,
        }],
    },
}, {
    timestamps: true,
    collection: 'fhir_patients',
});

// Indexes
fhirPatientSchema.index({ id: 1 });
fhirPatientSchema.index({ 'identifier.value': 1 });
fhirPatientSchema.index({ 'name.family': 1 });
fhirPatientSchema.index({ birthDate: 1 });

module.exports = mongoose.model('FHIRPatient', fhirPatientSchema);
