/**
 * Dashboard Controller - Hybrid Version
 * Handles dashboard statistics and analytics
 * Falls back to PostgreSQL if MongoDB is not available
 */

const mongoose = require('mongoose');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

// Check if MongoDB is connected
function isMongoDBConnected() {
    return mongoose.connection.readyState === 1;
}

// Lazy load models and services
let Patient;
let pgPatientService;

try {
    Patient = require('../models/mongodb/Patient');
} catch (error) {
    logger.warn('MongoDB Patient model not available');
}

try {
    pgPatientService = require('../services/patientService.postgres');
} catch (error) {
    logger.warn('PostgreSQL patient service not available');
}

// Check if using PostgreSQL
function isPostgresEnabled() {
    return !!pgPatientService;
}

/**
 * Get dashboard statistics for doctor
 */
async function getDoctorStats(req, res, next) {
    try {
        const doctorId = req.user.id;

        // Prioritize PostgreSQL if available
        if (isPostgresEnabled()) {
            logger.info('Using PostgreSQL for dashboard stats');
            const stats = await pgPatientService.getDashboardStats(doctorId);
            return successResponse(res, { stats }, 'Dashboard statistics retrieved successfully', 200);
        }

        if (!isMongoDBConnected()) {
            throw new Error('No database connection available');
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get total patients count
        const totalPatients = await Patient.countDocuments({ doctor_id: doctorId });

        // Get active cases count
        const activeCases = await Patient.countDocuments({
            doctor_id: doctorId,
            status: 'active'
        });

        // Get patients with AYUSH codes (dual codings)
        const dualCodings = await Patient.countDocuments({
            doctor_id: doctorId,
            'matched_ayush_codes.0': { $exists: true }
        });

        // Get this month's patients
        const thisMonth = await Patient.countDocuments({
            doctor_id: doctorId,
            created_at: { $gte: firstDayOfMonth }
        });

        // Get last month's data for comparison
        const lastMonthTotal = await Patient.countDocuments({
            doctor_id: doctorId,
            created_at: { $lt: firstDayOfMonth }
        });

        const lastMonthActive = await Patient.countDocuments({
            doctor_id: doctorId,
            status: 'active',
            created_at: { $lt: firstDayOfMonth }
        });

        const lastMonthDualCodings = await Patient.countDocuments({
            doctor_id: doctorId,
            'matched_ayush_codes.0': { $exists: true },
            created_at: { $lt: firstDayOfMonth }
        });

        const lastMonthCount = await Patient.countDocuments({
            doctor_id: doctorId,
            created_at: {
                $gte: firstDayOfLastMonth,
                $lte: lastDayOfLastMonth
            }
        });

        // Calculate percentage changes
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const stats = {
            totalPatients: {
                value: totalPatients,
                change: calculateChange(totalPatients, lastMonthTotal)
            },
            activeCases: {
                value: activeCases,
                change: calculateChange(activeCases, lastMonthActive)
            },
            dualCodings: {
                value: dualCodings,
                change: calculateChange(dualCodings, lastMonthDualCodings)
            },
            thisMonth: {
                value: thisMonth,
                change: calculateChange(thisMonth, lastMonthCount)
            }
        };

        return successResponse(res, { stats }, 'Dashboard statistics retrieved successfully', 200);
    } catch (error) {
        logger.error('Dashboard stats error:', error);
        next(error);
    }
}

/**
 * Get recent patients for doctor
 */
async function getRecentPatients(req, res, next) {
    try {
        const doctorId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;

        // Prioritize PostgreSQL if available
        if (isPostgresEnabled()) {
            // getPatients supports sorting and pagination, use that
            const result = await pgPatientService.getPatients(doctorId, {
                limit,
                page: 1,
                sortBy: 'updated_at',
                sortOrder: 'desc'
            });
            return successResponse(res, { patients: result.patients }, 'Recent patients retrieved successfully', 200);
        }

        const recentPatients = await Patient.find({ doctor_id: doctorId })
            .sort({ updated_at: -1 })
            .limit(limit)
            .select('name age gender contact status created_at updated_at')
            .lean();

        return successResponse(res, { patients: recentPatients }, 'Recent patients retrieved successfully', 200);
    } catch (error) {
        logger.error('Recent patients error:', error);
        next(error);
    }
}

/**
 * Get analytics data for charts
 */
async function getAnalytics(req, res, next) {
    try {
        const doctorId = req.user.id;
        const { period = '6months' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;
        let monthsToShow = 6;

        switch (period) {
            case '1year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
                monthsToShow = 12;
                break;
            case 'all':
                startDate = new Date(2020, 0, 1); // Start from 2020
                monthsToShow = 12;
                break;
            default: // 6months
                startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                monthsToShow = 6;
        }

        // Prioritize PostgreSQL if available
        if (isPostgresEnabled()) {
            logger.info('Using PostgreSQL for analytics data');
            const result = await pgPatientService.getAnalytics(doctorId, startDate, monthsToShow);
            return successResponse(res, result, 'Analytics data retrieved successfully', 200);
        }

        // Get patient trends (monthly counts)
        const patientTrends = await Patient.aggregate([
            {
                $match: {
                    doctor_id: doctorId,
                    created_at: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format patient trends data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const patientTrendsData = [];

        for (let i = 0; i < monthsToShow; i++) {
            const date = new Date(startDate);
            date.setMonth(startDate.getMonth() + i);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const dataPoint = patientTrends.find(
                t => t._id.year === year && t._id.month === month
            );

            patientTrendsData.push({
                month: monthNames[month - 1],
                patients: dataPoint ? dataPoint.count : 0
            });
        }

        // Get diagnosis distribution (top categories from AYUSH codes)
        const diagnosisDistribution = await Patient.aggregate([
            {
                $match: {
                    doctor_id: doctorId,
                    'matched_ayush_codes.0': { $exists: true }
                }
            },
            { $unwind: '$matched_ayush_codes' },
            {
                $group: {
                    _id: '$matched_ayush_codes.category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const diagnosisDistributionData = diagnosisDistribution.map(d => ({
            name: d._id || 'Uncategorized',
            value: d.count
        }));

        // Get dual coding stats (patients with AYUSH codes over time)
        const dualCodingStats = await Patient.aggregate([
            {
                $match: {
                    doctor_id: doctorId,
                    created_at: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' }
                    },
                    ayush: {
                        $sum: {
                            $cond: [{ $gt: [{ $size: { $ifNull: ['$matched_ayush_codes', []] } }, 0] }, 1, 0]
                        }
                    },
                    icd11: {
                        $sum: {
                            $cond: [{ $gt: [{ $size: { $ifNull: ['$icd_codes', []] } }, 0] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const dualCodingStatsData = [];
        for (let i = 0; i < monthsToShow; i++) {
            const date = new Date(startDate);
            date.setMonth(startDate.getMonth() + i);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const dataPoint = dualCodingStats.find(
                t => t._id.year === year && t._id.month === month
            );

            dualCodingStatsData.push({
                month: monthNames[month - 1],
                namaste: dataPoint ? dataPoint.ayush : 0,
                icd11: dataPoint ? dataPoint.icd11 : 0
            });
        }

        return successResponse(res, {
            patientTrends: patientTrendsData,
            diagnosisDistribution: diagnosisDistributionData,
            dualCodingStats: dualCodingStatsData
        }, 'Analytics data retrieved successfully', 200);
    } catch (error) {
        logger.error('Analytics error:', error);
        next(error);
    }
}

module.exports = {
    getDoctorStats,
    getRecentPatients,
    getAnalytics
};
