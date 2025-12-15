/**
 * Patient Service
 * Handles all patient-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all patients
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status
 * @returns {Promise<Object>} Patients data with pagination
 */
export const getPatients = async (params = {}) => {
    try {
        const response = await api.get(API_ENDPOINTS.PATIENTS, { params });
        return response;
    } catch (error) {
        console.error('Get patients error:', error);
        throw error;
    }
};

/**
 * Get patient by ID
 * @param {string} id - Patient ID
 * @returns {Promise<Object>} Patient data
 */
export const getPatientById = async (id) => {
    try {
        const response = await api.get(API_ENDPOINTS.PATIENT_BY_ID(id));
        return response;
    } catch (error) {
        console.error('Get patient error:', error);
        throw error;
    }
};

/**
 * Create new patient
 * @param {Object} patientData - Patient information
 * @returns {Promise<Object>} Created patient data
 */
export const createPatient = async (patientData) => {
    try {
        const response = await api.post(API_ENDPOINTS.PATIENTS, patientData);
        return response;
    } catch (error) {
        console.error('Create patient error:', error);
        throw error;
    }
};

/**
 * Update patient
 * @param {string} id - Patient ID
 * @param {Object} patientData - Updated patient information
 * @returns {Promise<Object>} Updated patient data
 */
export const updatePatient = async (id, patientData) => {
    try {
        const response = await api.put(API_ENDPOINTS.PATIENT_BY_ID(id), patientData);
        return response;
    } catch (error) {
        console.error('Update patient error:', error);
        throw error;
    }
};

/**
 * Delete patient
 * @param {string} id - Patient ID
 * @returns {Promise<void>}
 */
export const deletePatient = async (id) => {
    try {
        await api.delete(API_ENDPOINTS.PATIENT_BY_ID(id));
    } catch (error) {
        console.error('Delete patient error:', error);
        throw error;
    }
};
