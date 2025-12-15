/**
 * NAMOAROGYA Backend Server
 * Entry point for the healthcare API server
 */

require('dotenv').config();
const app = require('./src/app');
const { connectPostgres, connectMongoDB, connectRedis } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

/**
 * Initialize database connections and start server
 */
async function startServer() {
    try {
        // Connect to databases
        logger.info('🔌 Connecting to databases...');

        await connectPostgres();
        logger.info('✅ PostgreSQL connected');

        await connectMongoDB();
        logger.info('✅ MongoDB connected');

        await connectRedis();
        logger.info('✅ Redis connected');

        // Start Express server
        app.listen(PORT, () => {
            logger.info(`🚀 NAMOAROGYA Backend running on port ${PORT}`);
            logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            logger.info(`🏥 Environment: ${process.env.NODE_ENV}`);
            logger.info(`🔐 FHIR Version: ${process.env.FHIR_VERSION}`);
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
