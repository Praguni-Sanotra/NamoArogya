/**
 * Add Sample Patients Script
 * Adds 3 sample patients to the database
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'namoarogya',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
});

async function addSamplePatients() {
    try {
        console.log('🏥 Adding sample patients...\n');

        // Use doctor_id = 2 (the doctor user from setup-users.js)
        const doctorId = 2;
        console.log(`✅ Using doctor ID: ${doctorId}\n`);

        // Sample patients data
        const patients = [
            {
                name: 'Aakarshan Verma',
                dob: '1996-03-15', // 28 years old
                age: 28,
                gender: 'M',
                contact_number: '+91-9876543210',
                email: 'aakarshan.verma@example.com',
                address: '123 MG Road, New Delhi, Delhi 110001',
                medical_history: 'No significant medical history. Regular health checkups.',
                symptoms: 'Mild headache, fatigue',
                diagnosis: 'Stress-related tension headache',
                treatment_plan: 'Rest, stress management techniques, prescribed mild pain relievers',
                status: 'active'
            },
            {
                name: 'Praguni Sanotra',
                dob: '1999-07-22', // 25 years old
                age: 25,
                gender: 'F',
                contact_number: '+91-9876543211',
                email: 'praguni.sanotra@example.com',
                address: '456 Park Street, Mumbai, Maharashtra 400001',
                medical_history: 'Seasonal allergies. Previous treatment for vitamin D deficiency.',
                symptoms: 'Seasonal allergic rhinitis, sneezing, watery eyes',
                diagnosis: 'Allergic rhinitis',
                treatment_plan: 'Antihistamines, nasal spray, avoid allergens',
                status: 'active'
            },
            {
                name: 'Lomash Gupta',
                dob: '1992-11-08', // 32 years old
                age: 32,
                gender: 'M',
                contact_number: '+91-9876543212',
                email: 'lomash.gupta@example.com',
                address: '789 Brigade Road, Bangalore, Karnataka 560001',
                medical_history: 'Hypertension (controlled with medication). Family history of diabetes.',
                symptoms: 'Occasional chest discomfort, elevated blood pressure readings',
                diagnosis: 'Essential hypertension - under monitoring',
                treatment_plan: 'Continue current medication, lifestyle modifications, regular BP monitoring',
                status: 'active'
            }
        ];

        // Insert patients
        for (const patient of patients) {
            const result = await pool.query(
                `INSERT INTO patients (
                    doctor_id, name, dob, age, gender, contact_number, email, address,
                    medical_history, symptoms, diagnosis, treatment_plan,
                    matched_ayush_codes, matched_icd11_codes, status,
                    created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
                RETURNING id, name`,
                [
                    doctorId,
                    patient.name,
                    patient.dob,
                    patient.age,
                    patient.gender,
                    patient.contact_number,
                    patient.email,
                    patient.address,
                    patient.medical_history,
                    patient.symptoms,
                    patient.diagnosis,
                    patient.treatment_plan,
                    JSON.stringify([]), // Empty AYUSH codes for now
                    JSON.stringify([]), // Empty ICD-11 codes for now
                    patient.status
                ]
            );

            console.log(`✅ Added patient: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        }

        console.log('\n🎉 Successfully added 3 sample patients!');
        console.log('\nPatient Details:');
        console.log('1. Aakarshan Verma - 28 years, Male');
        console.log('2. Praguni Sanotra - 25 years, Female');
        console.log('3. Lomash Gupta - 32 years, Male');
        console.log('\nYou can now view these patients in the Patient Records page!');

    } catch (error) {
        console.error('❌ Error adding patients:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the script
addSamplePatients()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
