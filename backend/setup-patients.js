/**
 * Setup Patients Table Script
 * Creates patients table in PostgreSQL
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

async function setupPatientsTable() {
    try {
        console.log('🔧 Setting up patients table...');

        // Create patients table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                age INTEGER,
                gender VARCHAR(20),
                contact_number VARCHAR(20),
                email VARCHAR(255),
                address TEXT,
                medical_history TEXT,
                symptoms TEXT,
                diagnosis TEXT,
                treatment_plan TEXT,
                matched_ayush_codes JSONB DEFAULT '[]'::jsonb,
                matched_icd11_codes JSONB DEFAULT '[]'::jsonb,
                status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Patients table created');

        // Create indexes - wrap in try-catch to handle existing indexes
        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id)');
            console.log('✅ doctor_id index created');
        } catch (e) {
            console.log('⚠️  doctor_id index skipped (column may not exist)');
        }

        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status)');
            console.log('✅ status index created');
        } catch (e) {
            console.log('⚠️  status index skipped');
        }

        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at)');
            console.log('✅ created_at index created');
        } catch (e) {
            console.log('⚠️  created_at index skipped');
        }

        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name)');
            console.log('✅ name index created');
        } catch (e) {
            console.log('⚠️  name index skipped');
        }

        console.log('✅ Indexes setup complete');

        // Check if there are any patients
        const result = await pool.query('SELECT COUNT(*) FROM patients');
        const count = parseInt(result.rows[0].count);

        console.log(`\n📊 Current patients count: ${count}`);

        if (count === 0) {
            console.log('\n💡 Tip: You can now add patients through the application!');
        }

        console.log('\n🎉 Patients table setup completed successfully!');

    } catch (error) {
        console.error('❌ Error setting up patients table:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the setup
setupPatientsTable()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
