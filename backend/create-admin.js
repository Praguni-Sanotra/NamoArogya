/**
 * Create Admin User Script - MongoDB Version
 * Run with: node create-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2022a1r164_db_user:4pl6dV8bG4oN123l@namoarogya.3rf54cr.mongodb.net/?appName=NamoArogya';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['doctor', 'admin'] },
    specialty: String,
    license_number: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        console.log('\n=== Creating Admin User ===\n');
        console.log('Connecting to MongoDB...');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const adminData = {
            email: 'admin@namoarogya.com',
            password: 'admin123',
            name: 'System Administrator',
            role: 'admin',
        };

        // Check if admin already exists
        const existingUser = await User.findOne({ email: adminData.email });

        if (existingUser) {
            console.log('⚠️  Admin user already exists:');
            console.log('   Email:', existingUser.email);
            console.log('   Role:', existingUser.role);

            if (existingUser.role !== 'admin') {
                console.log('\n🔄 Updating role to admin...');
                existingUser.role = 'admin';
                await existingUser.save();
                console.log('✅ Role updated to admin');
            }

            // Update password
            console.log('\n🔄 Updating password...');
            const passwordHash = await bcrypt.hash(adminData.password, 10);
            existingUser.password_hash = passwordHash;
            existingUser.updated_at = new Date();
            await existingUser.save();
            console.log('✅ Password updated');
        } else {
            // Create new admin user
            console.log('Creating new admin user...');
            const passwordHash = await bcrypt.hash(adminData.password, 10);

            const newUser = new User({
                email: adminData.email,
                password_hash: passwordHash,
                name: adminData.name,
                role: adminData.role,
            });

            await newUser.save();

            console.log('✅ Admin user created successfully!');
            console.log('   ID:', newUser._id);
            console.log('   Email:', newUser.email);
            console.log('   Name:', newUser.name);
            console.log('   Role:', newUser.role);
        }

        console.log('\n=== Login Credentials ===');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('Role: admin');
        console.log('\n✅ You can now log in with these credentials!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

createAdminUser();
