
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'namoarogya',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
});

async function checkUsers() {
    try {
        const result = await pool.query('SELECT id, name, email, role FROM users');
        console.log('Users in DB:');
        console.table(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkUsers();
