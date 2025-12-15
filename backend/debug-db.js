/**
 * Debug database passwords
 * Run with: node debug-db.js
 */

const { pgPool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function debugPasswords() {
    try {
        await require('./src/config/database').connectPostgres();

        const query = 'SELECT email, role, password_hash FROM users';
        const result = await pgPool.query(query);

        console.log('\n=== Users in Database ===\n');

        for (const user of result.rows) {
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Hash: ${user.password_hash}`);

            // Test passwords
            const testPasswords = ['admin123', 'doctor123', 'demo123'];
            for (const pwd of testPasswords) {
                const match = await bcrypt.compare(pwd, user.password_hash);
                if (match) {
                    console.log(`✅ Password '${pwd}' MATCHES!`);
                }
            }
            console.log('');
        }

        await pgPool.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugPasswords();
