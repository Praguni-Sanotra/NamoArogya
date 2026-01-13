/**
 * Patient Service - PostgreSQL Version
 * Handles patient data operations using PostgreSQL
 */

const { pgPool } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create new patient
 */
async function createPatient(patientData, doctorId) {
    const client = await pgPool.connect();
    try {
        const {
            name,
            age,
            gender,
            contact_number,
            email,
            address,
            medical_history,
            symptoms,
            diagnosis,
            treatment_plan,
            matched_ayush_codes = [],
            matched_icd11_codes = [],
            status = 'active'
        } = patientData;

        // Generate next patient_id
        const countResult = await client.query('SELECT COUNT(*) FROM patients');
        const nextNumber = parseInt(countResult.rows[0].count) + 1;
        const patient_id = `P-${String(nextNumber).padStart(2, '0')}`;

        const result = await client.query(
            `INSERT INTO patients (
                doctor_id, patient_id, name, age, gender, contact_number, email, address,
                medical_history, symptoms, diagnosis, treatment_plan,
                matched_ayush_codes, matched_icd11_codes, status,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
            RETURNING *`,
            [
                doctorId, patient_id, name, age, gender, contact_number, email, address,
                medical_history, symptoms, diagnosis, treatment_plan,
                JSON.stringify(matched_ayush_codes),
                JSON.stringify(matched_icd11_codes),
                status
            ]
        );

        logger.info(`Patient created: ${result.rows[0].patient_id} (${result.rows[0].id}) by doctor: ${doctorId}`);
        return result.rows[0];
    } finally {
        client.release();
    }
}

/**
 * Get all patients with pagination and filters
 * If doctorId is null, returns all patients (for admin)
 */
async function getPatients(doctorId, options = {}) {
    const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
    } = options;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let paramIndex = 1;

    let query = 'SELECT * FROM patients';
    let countQuery = 'SELECT COUNT(*) FROM patients';

    // Add WHERE clause
    const whereClauses = [];

    // Filter by doctor_id only if provided (doctors see their patients, admins see all)
    if (doctorId) {
        whereClauses.push(`doctor_id = $${paramIndex}`);
        params.push(doctorId);
        paramIndex++;
    }

    // Filter by status
    if (status) {
        whereClauses.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
    }

    // Search by name or symptoms
    if (search) {
        whereClauses.push(`(name ILIKE $${paramIndex} OR symptoms ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
    }

    // Add WHERE clauses if any
    if (whereClauses.length > 0) {
        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        query += whereString;
        countQuery += whereString;
    }

    // Add sorting and pagination
    const validSortColumns = ['created_at', 'updated_at', 'name', 'age'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const [patientsResult, countResult] = await Promise.all([
        pgPool.query(query, [...params, parseInt(limit), offset]),
        pgPool.query(countQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
        patients: patientsResult.rows.map(parsePatientData),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    };
}

/**
 * Get patient by ID
 */
async function getPatientById(patientId, doctorId) {
    const result = await pgPool.query(
        'SELECT * FROM patients WHERE id = $1 AND doctor_id = $2',
        [patientId, doctorId]
    );

    if (result.rows.length === 0) {
        throw new ApiError('Patient not found', 404);
    }

    return parsePatientData(result.rows[0]);
}

/**
 * Update patient
 */
async function updatePatient(patientId, doctorId, updateData) {
    const allowedFields = [
        'name', 'age', 'gender', 'contact_number', 'email', 'address',
        'medical_history', 'symptoms', 'diagnosis', 'treatment_plan',
        'matched_ayush_codes', 'matched_icd11_codes', 'status'
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = $${paramIndex}`);
            if (key === 'matched_ayush_codes' || key === 'matched_icd11_codes') {
                values.push(JSON.stringify(updateData[key]));
            } else {
                values.push(updateData[key]);
            }
            paramIndex++;
        }
    });

    if (updates.length === 0) {
        throw new ApiError('No valid fields to update', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(patientId, doctorId);

    const result = await pgPool.query(
        `UPDATE patients SET ${updates.join(', ')}
         WHERE id = $${paramIndex} AND doctor_id = $${paramIndex + 1}
         RETURNING *`,
        values
    );

    if (result.rows.length === 0) {
        throw new ApiError('Patient not found', 404);
    }

    logger.info(`Patient updated: ${patientId} by doctor: ${doctorId}`);
    return parsePatientData(result.rows[0]);
}

/**
 * Delete patient (soft delete)
 */
async function deletePatient(patientId, doctorId) {
    const result = await pgPool.query(
        `UPDATE patients SET status = 'inactive', updated_at = NOW()
         WHERE id = $1 AND doctor_id = $2
         RETURNING *`,
        [patientId, doctorId]
    );

    if (result.rows.length === 0) {
        throw new ApiError('Patient not found', 404);
    }

    logger.info(`Patient deleted: ${patientId} by doctor: ${doctorId}`);
    return parsePatientData(result.rows[0]);
}

/**
 * Get dashboard statistics
 */
async function getDashboardStats(doctorId) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const queries = {
        totalPatients: pgPool.query(
            'SELECT COUNT(*) FROM patients WHERE doctor_id = $1',
            [doctorId]
        ),
        activeCases: pgPool.query(
            "SELECT COUNT(*) FROM patients WHERE doctor_id = $1 AND status = 'active'",
            [doctorId]
        ),
        dualCodings: pgPool.query(
            "SELECT COUNT(*) FROM patients WHERE doctor_id = $1 AND matched_ayush_codes::text != '[]'",
            [doctorId]
        ),
        thisMonth: pgPool.query(
            'SELECT COUNT(*) FROM patients WHERE doctor_id = $1 AND created_at >= $2',
            [doctorId, firstDayOfMonth]
        ),
        lastMonthTotal: pgPool.query(
            'SELECT COUNT(*) FROM patients WHERE doctor_id = $1 AND created_at < $2',
            [doctorId, firstDayOfMonth]
        ),
        lastMonthActive: pgPool.query(
            "SELECT COUNT(*) FROM patients WHERE doctor_id = $1 AND status = 'active' AND created_at < $2",
            [doctorId, firstDayOfMonth]
        ),
        lastMonthDualCodings: pgPool.query(
            "SELECT COUNT(*) FROM patients WHERE doctor_id = $1 AND matched_ayush_codes::text != '[]' AND created_at < $2",
            [doctorId, firstDayOfMonth]
        ),
        lastMonthCount: pgPool.query(
            'SELECT COUNT(*) FROM patients WHERE doctor_id = $1 AND created_at >= $2 AND created_at <= $3',
            [doctorId, firstDayOfLastMonth, lastDayOfLastMonth]
        )
    };

    const results = await Promise.all(Object.values(queries));
    const [
        totalPatients,
        activeCases,
        dualCodings,
        thisMonth,
        lastMonthTotal,
        lastMonthActive,
        lastMonthDualCodings,
        lastMonthCount
    ] = results.map(r => parseInt(r.rows[0].count));

    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    return {
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
}

/**
 * Parse patient data from database (convert JSON fields)
 */
function parsePatientData(patient) {
    return {
        ...patient,
        matched_ayush_codes: typeof patient.matched_ayush_codes === 'string'
            ? JSON.parse(patient.matched_ayush_codes)
            : patient.matched_ayush_codes || [],
        matched_icd11_codes: typeof patient.matched_icd11_codes === 'string'
            ? JSON.parse(patient.matched_icd11_codes)
            : patient.matched_icd11_codes || []
    };
}

/**
 * Get analytics data for charts
 */
async function getAnalytics(doctorId, startDate, monthsToShow) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get patient trends (monthly counts)
    const patientTrendsData = [];
    for (let i = 0; i < monthsToShow; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;

        const result = await pgPool.query(
            `SELECT COUNT(*) FROM patients 
             WHERE doctor_id = $1 
             AND EXTRACT(YEAR FROM created_at) = $2 
             AND EXTRACT(MONTH FROM created_at) = $3`,
            [doctorId, year, month]
        );

        patientTrendsData.push({
            month: monthNames[month - 1],
            patients: parseInt(result.rows[0].count)
        });
    }

    // Get diagnosis distribution (top categories from AYUSH codes)
    const diagnosisResult = await pgPool.query(
        `SELECT category, COUNT(*) as count
         FROM (
             SELECT jsonb_array_elements(matched_ayush_codes::jsonb)->>'category' as category
             FROM patients
             WHERE doctor_id = $1 
             AND matched_ayush_codes::text != '[]'
         ) AS categories
         WHERE category IS NOT NULL
         GROUP BY category
         ORDER BY count DESC
         LIMIT 5`,
        [doctorId]
    );

    const diagnosisDistributionData = diagnosisResult.rows.map(row => ({
        name: row.category || 'Uncategorized',
        value: parseInt(row.count)
    }));

    // Get dual coding stats (patients with AYUSH codes over time)
    const dualCodingStatsData = [];
    for (let i = 0; i < monthsToShow; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const result = await pgPool.query(
            `SELECT 
                COUNT(CASE WHEN matched_ayush_codes::text != '[]' THEN 1 END) as ayush,
                COUNT(CASE WHEN matched_icd11_codes::text != '[]' THEN 1 END) as icd11
             FROM patients 
             WHERE doctor_id = $1 
             AND EXTRACT(YEAR FROM created_at) = $2 
             AND EXTRACT(MONTH FROM created_at) = $3`,
            [doctorId, year, month]
        );

        dualCodingStatsData.push({
            month: monthNames[month - 1],
            namaste: parseInt(result.rows[0].ayush) || 0,
            icd11: parseInt(result.rows[0].icd11) || 0
        });
    }

    return {
        patientTrends: patientTrendsData,
        diagnosisDistribution: diagnosisDistributionData,
        dualCodingStats: dualCodingStatsData
    };
}

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getDashboardStats,
    getAnalytics
};
