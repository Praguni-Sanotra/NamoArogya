/**
 * Setup Users Script
 * Creates users table and seeds default admin and doctor accounts
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'namoarogya',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
});

async function setupUsers() {
    try {
        console.log('🔧 Setting up users table...');

        // Create users table
        await pool.query(`
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

        console.log('✅ Users table created');

        // Create indexes
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

        console.log('✅ Indexes created');

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const doctorPassword = await bcrypt.hash('doctor123', 10);

        console.log('✅ Passwords hashed');

        // Insert admin user
        await pool.query(`
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

        console.log('✅ Admin user created/updated');
        console.log('   Email: admin@namoarogya.com');
        console.log('   Password: admin123');

        // Insert doctor user
        await pool.query(`
            INSERT INTO users (email, password_hash, name, role, specialty, license_number)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                updated_at = CURRENT_TIMESTAMP
        `, [
            'doctor@namoarogya.com',
            doctorPassword,
            'Dr. Demo Doctor',
            'doctor',
            'General Medicine',
            'DOC001'
        ]);

        console.log('✅ Doctor user created/updated');
        console.log('   Email: doctor@namoarogya.com');
        console.log('   Password: doctor123');

        console.log('\n🎉 User setup completed successfully!');
        console.log('\nYou can now login with:');
        console.log('  Admin:  admin@namoarogya.com / admin123');
        console.log('  Doctor: doctor@namoarogya.com / doctor123');

    } catch (error) {
        console.error('❌ Error setting up users:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the setup
setupUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
