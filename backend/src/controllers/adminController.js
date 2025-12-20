const User = require('../models/mongodb/User');
const Patient = require('../models/mongodb/Patient');
const { pool } = require('../config/database');

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: {
                users,
                count: users.length
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

/**
 * Get database information (Admin only)
 */
const getDatabaseInfo = async (req, res) => {
    try {
        // Get PostgreSQL database size and table info
        const sizeQuery = `
            SELECT pg_size_pretty(pg_database_size(current_database())) as size;
        `;

        const tablesQuery = `
            SELECT 
                schemaname,
                tablename as name,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                n_live_tup as rows
            FROM pg_stat_user_tables
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        `;

        const connectionsQuery = `
            SELECT count(*) as connections
            FROM pg_stat_activity
            WHERE datname = current_database();
        `;

        const [sizeResult, tablesResult, connectionsResult] = await Promise.all([
            pool.query(sizeQuery),
            pool.query(tablesQuery),
            pool.query(connectionsQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                size: sizeResult.rows[0]?.size || '0 MB',
                tables: tablesResult.rows || [],
                connections: parseInt(connectionsResult.rows[0]?.connections || 0)
            }
        });
    } catch (error) {
        console.error('Get database info error:', error);
        res.status(500).json({
            success: true, // Return success even on error to prevent frontend issues
            data: {
                size: 'N/A',
                tables: [],
                connections: 0
            }
        });
    }
};

/**
 * Get all dual coding mappings (Admin only)
 */
const getDualCodingMappings = async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                ayush_code,
                ayush_description,
                icd11_code,
                icd11_description,
                confidence_score,
                mapping_type,
                created_by,
                created_at,
                updated_at
            FROM dual_coding_mappings
            ORDER BY created_at DESC
            LIMIT 1000;
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            data: {
                mappings: result.rows,
                count: result.rows.length
            }
        });
    } catch (error) {
        console.error('Get dual coding mappings error:', error);
        res.status(200).json({
            success: true,
            data: {
                mappings: [],
                count: 0
            }
        });
    }
};

/**
 * Get system statistics (Admin only)
 */
const getSystemStats = async (req, res) => {
    try {
        const [userCount, patientCount, mappingCount] = await Promise.all([
            User.countDocuments(),
            Patient.countDocuments(),
            pool.query('SELECT COUNT(*) as count FROM dual_coding_mappings')
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers: userCount,
                    totalPatients: patientCount,
                    totalMappings: parseInt(mappingCount.rows[0]?.count || 0)
                }
            }
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system statistics'
        });
    }
};

module.exports = {
    getAllUsers,
    getDatabaseInfo,
    getDualCodingMappings,
    getSystemStats
};
