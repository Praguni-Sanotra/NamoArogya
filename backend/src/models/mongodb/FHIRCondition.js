/**
 * FHIR Condition Resource Schema (MongoDB)
 * For diagnoses and clinical conditions
 */

const mongoose = require('mongoose');

const fhirConditionSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        default: 'Condition',
        required: true,
    },
    id: {
        type: String,
        required: true,
        unique: true,
    },
    identifier: [{
        use: String,
        system: String,
        value: String,
    }],
    clinicalStatus: {
        coding: [{
            system: {
                type: String,
                default: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            },
            code: String, // active, recurrence, relapse, inactive, remission, resolved
            display: String,
        }],
        text: String,
    },
    verificationStatus: {
        coding: [{
            system: {
                type: String,
                default: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            },
            code: String, // unconfirmed, provisional, differential, confirmed, refuted, entered-in-error
            display: String,
        }],
        text: String,
    },
    category: [{
        coding: [{
            system: String,
            code: String,
            display: String,
        }],
        text: String,
    }],
    severity: {
        coding: [{
            system: String,
            code: String,
            display: String,
        }],
        text: String,
    },
    code: {
        coding: [{
            system: String, // NAMASTE or ICD-11
            code: String,
            display: String,
        }],
        text: String,
    },
    bodySite: [{
        coding: [{
            system: String,
            code: String,
            display: String,
        }],
        text: String,
    }],
    subject: {
        reference: String, // Reference to Patient
        display: String,
    },
    encounter: {
        reference: String,
        display: String,
    },
    onsetDateTime: Date,
    onsetAge: {
        value: Number,
        unit: String,
        system: String,
        code: String,
    },
    abatementDateTime: Date,
    recordedDate: Date,
    recorder: {
        reference: String, // Reference to Practitioner/Doctor
        display: String,
    },
    asserter: {
        reference: String,
        display: String,
    },
    stage: [{
        summary: {
            coding: [{
                system: String,
                code: String,
                display: String,
            }],
            text: String,
        },
        assessment: [{
            reference: String,
            display: String,
        }],
        type: {
            coding: [{
                system: String,
                code: String,
                display: String,
            }],
            text: String,
        },
    }],
    evidence: [{
        code: [{
            coding: [{
                system: String,
                code: String,
                display: String,
            }],
            text: String,
        }],
        detail: [{
            reference: String,
            display: String,
        }],
    }],
    note: [{
        authorReference: {
            reference: String,
            display: String,
        },
        time: Date,
        text: String,
    }],
    meta: {
        versionId: String,
        lastUpdated: Date,
        source: String,
        profile: [String],
    },
}, {
    timestamps: true,
    collection: 'fhir_conditions',
});

// Indexes
fhirConditionSchema.index({ id: 1 });
fhirConditionSchema.index({ 'subject.reference': 1 });
fhirConditionSchema.index({ 'code.coding.code': 1 });
fhirConditionSchema.index({ recordedDate: -1 });

module.exports = mongoose.model('FHIRCondition', fhirConditionSchema);
