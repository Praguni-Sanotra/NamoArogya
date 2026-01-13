/**
 * Migrate Patients Table Script
 * Adds missing columns to existing patients table
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

async function migratePatientsTable() {
    try {
        console.log('🔧 Migrating patients table...');

        // Add missing columns
        const alterations = [
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS doctor_id INTEGER",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20)",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history TEXT",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS symptoms TEXT",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS diagnosis TEXT",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS treatment_plan TEXT",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS matched_ayush_codes JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS matched_icd11_codes JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE patients ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'"
        ];

        for (const sql of alterations) {
            try {
                await pool.query(sql);
                console.log(`✅ ${sql.split('ADD COLUMN IF NOT EXISTS')[1]?.split(' ')[1] || 'Column'} added`);
            } catch (error) {
                if (error.code !== '42701') { // Ignore "column already exists" errors
                    console.log(`⚠️  ${error.message}`);
                }
            }
        }

        // Create indexes
        const indexes = [
            "CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id)",
            "CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status)",
            "CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name)"
        ];

        for (const sql of indexes) {
            try {
                await pool.query(sql);
                console.log(`✅ Index created: ${sql.split('idx_patients_')[1]?.split(' ')[0]}`);
            } catch (error) {
                console.log(`⚠️  Index skipped: ${error.message}`);
            }
        }

        // Check current state
        const result = await pool.query('SELECT COUNT(*) FROM patients');
        const count = parseInt(result.rows[0].count);

        console.log(`\n📊 Current patients count: ${count}`);
        console.log('\n🎉 Patients table migration completed successfully!');

    } catch (error) {
        console.error('❌ Error migrating patients table:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the migration
migratePatientsTable()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
