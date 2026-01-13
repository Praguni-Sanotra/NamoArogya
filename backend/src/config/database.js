/**
 * Database Configuration
 * Manages connections to PostgreSQL, MongoDB, and Redis
 */

const { Pool } = require('pg');
const mongoose = require('mongoose');
const redis = require('redis');
const logger = require('../utils/logger');

// PostgreSQL Connection Pool
const pgPool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'namoarogya',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// PostgreSQL connection test
async function connectPostgres() {
    try {
        const client = await pgPool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger.info('PostgreSQL connection established');
    } catch (error) {
        logger.error('PostgreSQL connection failed:', error);
        throw error;
    }
}

// MongoDB connection
async function connectMongoDB() {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            logger.warn('⚠️  MONGODB_URI is not defined - MongoDB features will be disabled');
            return; // Make MongoDB optional
        }

        logger.info('Connecting to MongoDB...');

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
            socketTimeoutMillis: 45000,
        });

        mongoose.connection.on('connected', () => {
            logger.info('✅ MongoDB connection established');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️  MongoDB disconnected');
        });

        logger.info('MongoDB connection successful');

    } catch (error) {
        logger.warn('⚠️  MongoDB connection failed (optional service):', error.message);
        logger.warn('Some features may be limited without MongoDB');
        // MongoDB is now optional, so we don't throw
    }
}

// Redis connection
let redisClient;

async function connectRedis() {
    try {
        redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
            },
            password: process.env.REDIS_PASSWORD || undefined,
            database: process.env.REDIS_DB || 0,
        });

        // Disable error logging to prevent spam when Redis is not available
        // redisClient.on('error', (err) => {
        //   logger.error('Redis Client Error:', err);
        // });

        redisClient.on('connect', () => {
            logger.info('Redis connection established');
        });

        await redisClient.connect();

    } catch (error) {
        logger.warn('Redis connection failed (optional service):', error.message);
        // Redis is optional, so we don't throw
        redisClient = null;
    }
}

// Get Redis client
function getRedisClient() {
    return redisClient;
}

// Graceful shutdown
async function closeConnections() {
    try {
        await pgPool.end();
        await mongoose.connection.close();
        if (redisClient) {
            await redisClient.quit();
        }
        logger.info('All database connections closed');
    } catch (error) {
        logger.error('Error closing database connections:', error);
    }
}

module.exports = {
    pgPool,
    connectPostgres,
    connectMongoDB,
    connectRedis,
    getRedisClient,
    closeConnections,
};
