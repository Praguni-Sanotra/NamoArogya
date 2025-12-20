/**
 * Dashboard Routes
 * API endpoints for dashboard statistics
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Doctor/Admin)
 */
router.get('/stats', dashboardController.getDoctorStats);

/**
 * @route   GET /api/dashboard/recent-patients
 * @desc    Get recent patients
 * @access  Private (Doctor/Admin)
 */
router.get('/recent-patients', dashboardController.getRecentPatients);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get analytics data for charts
 * @access  Private (Doctor/Admin)
 */
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;
