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

        const result = await client.query(
            `INSERT INTO patients (
                doctor_id, name, age, gender, contact_number, email, address,
                medical_history, symptoms, diagnosis, treatment_plan,
                matched_ayush_codes, matched_icd11_codes, status,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
            RETURNING *`,
            [
                doctorId, name, age, gender, contact_number, email, address,
                medical_history, symptoms, diagnosis, treatment_plan,
                JSON.stringify(matched_ayush_codes),
                JSON.stringify(matched_icd11_codes),
                status
            ]
        );

        logger.info(`Patient created: ${result.rows[0].id} by doctor: ${doctorId}`);
        return result.rows[0];
    } finally {
        client.release();
    }
}

/**
 * Get all patients with pagination and filters
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
    const params = [doctorId];
    let paramIndex = 2;

    let query = 'SELECT * FROM patients WHERE doctor_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM patients WHERE doctor_id = $1';

    // Filter by status
    if (status) {
        query += ` AND status = $${paramIndex}`;
        countQuery += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }

    // Search by name or symptoms
    if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR symptoms ILIKE $${paramIndex})`;
        countQuery += ` AND (name ILIKE $${paramIndex} OR symptoms ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
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

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getDashboardStats
};
