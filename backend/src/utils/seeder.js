/**
 * Seeder Utility
 * Seeds database with initial users and patients
 */

const { pgPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

async function seedData() {
    console.log('🌱 Starting database seed...');

    const client = await pgPool.connect();
    try {
        await client.query('BEGIN');

        // 1. Setup Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'staff')),
                specialty VARCHAR(255),
                license_number VARCHAR(100),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const doctorPassword = await bcrypt.hash('doctor123', 10);

        // Insert Admin
        await client.query(`
            INSERT INTO users (email, password_hash, name, role, specialty, license_number)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                updated_at = CURRENT_TIMESTAMP
        `, [
            'admin@namoarogya.com',
            adminPassword,
            'System Administrator',
            'admin',
            'Administration',
            'ADMIN001'
        ]);

        // Insert Doctor
        const doctorResult = await client.query(`
            INSERT INTO users (email, password_hash, name, role, specialty, license_number)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `, [
            'doctor@namoarogya.com',
            doctorPassword,
            'Dr. Demo Doctor',
            'doctor',
            'General Medicine',
            'DOC001'
        ]);

        const doctorId = doctorResult.rows[0].id;
        console.log(`✅ Doctor user secured (ID: ${doctorId})`);

        // 2. Setup Patients Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                doctor_id INTEGER REFERENCES users(id),
                patient_id VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                age INTEGER,
                gender VARCHAR(20),
                contact_number VARCHAR(50),
                email VARCHAR(255),
                address TEXT,
                medical_history TEXT,
                symptoms TEXT,
                diagnosis TEXT,
                treatment_plan TEXT,
                matched_ayush_codes JSONB DEFAULT '[]',
                matched_icd11_codes JSONB DEFAULT '[]',
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Insert Sample Patients with AYUSH codes
        // We'll insert patients if they don't exist (checking by name for simplicity here)

        const ayushCodes = [
            [{ "code": "AA", "name": "Vata Disorders", "category": "Vata", "description": "Disorders due to Vata dosha imbalance" }],
            [{ "code": "AB", "name": "Pitta Disorders", "category": "Pitta", "description": "Disorders due to Pitta dosha imbalance" }],
            [{ "code": "AC", "name": "Kapha Disorders", "category": "Kapha", "description": "Disorders due to Kapha dosha imbalance" }]
        ];

        const patients = [
            {
                name: 'Aakarshan Verma',
                dob: '1996-03-15',
                age: 28,
                gender: 'M',
                contact_number: '+91-9876543210',
                email: 'aakarshan.verma@example.com',
                address: '123 MG Road, New Delhi',
                symptoms: 'Mild headache, fatigue',
                diagnosis: 'Stress-related tension headache',
                treatment_plan: 'Rest, stress management',
                ayush: ayushCodes[0]
            },
            {
                name: 'Praguni Sanotra',
                dob: '1999-07-22',
                age: 25,
                gender: 'F',
                contact_number: '+91-9876543211',
                email: 'praguni.sanotra@example.com',
                address: '456 Park Street, Mumbai',
                symptoms: 'Sneezing, watery eyes',
                diagnosis: 'Allergic rhinitis',
                treatment_plan: 'Antihistamines',
                ayush: ayushCodes[1]
            },
            {
                name: 'Lomash Gupta',
                dob: '1992-11-08',
                age: 32,
                gender: 'M',
                contact_number: '+91-9876543212',
                email: 'lomash.gupta@example.com',
                address: '789 Brigade Road, Bangalore',
                symptoms: 'Chest discomfort',
                diagnosis: 'Hypertension',
                treatment_plan: 'Medication',
                ayush: ayushCodes[2]
            }
        ];

        let pIndex = 1;
        for (const patient of patients) {
            // Check existence
            const check = await client.query('SELECT id FROM patients WHERE name = $1', [patient.name]);
            if (check.rows.length === 0) {
                const pid = `P-${String(pIndex).padStart(2, '0')}`;
                await client.query(
                    `INSERT INTO patients (
                        doctor_id, patient_id, name, age, gender, contact_number, email, address,
                        symptoms, diagnosis, treatment_plan, matched_ayush_codes, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')`,
                    [
                        doctorId, pid, patient.name, patient.age, patient.gender,
                        patient.contact_number, patient.email, patient.address,
                        patient.symptoms, patient.diagnosis, patient.treatment_plan,
                        JSON.stringify(patient.ayush)
                    ]
                );
                console.log(`✅ Added patient: ${patient.name}`);
                pIndex++;
            } else {
                console.log(`ℹ️ Patient exists: ${patient.name}`);
            }
        }

        await client.query('COMMIT');
        console.log('🎉 Seed completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = seedData;
