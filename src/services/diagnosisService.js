/**
 * Diagnosis Service
 * Handles diagnosis and dual coding (NAMASTE + ICD-11) API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Search NAMASTE codes
 * @param {string} query - Search query
 * @returns {Promise<Array>} NAMASTE codes
 */
export const searchNAMASTECodes = async (query) => {
    try {
        const response = await api.get(API_ENDPOINTS.NAMASTE_SEARCH, {
            params: { q: query }
        });
        return response;
    } catch (error) {
        console.error('Search NAMASTE codes error:', error);
        throw error;
    }
};

/**
 * Get NAMASTE code by code
 * @param {string} code - NAMASTE code
 * @returns {Promise<Object>} NAMASTE code details
 */
export const getNAMASTECode = async (code) => {
    try {
        const response = await api.get(API_ENDPOINTS.NAMASTE_BY_CODE(code));
        return response;
    } catch (error) {
        console.error('Get NAMASTE code error:', error);
        throw error;
    }
};

/**
 * Search ICD-11 codes
 * @param {string} query - Search query
 * @returns {Promise<Array>} ICD-11 codes
 */
export const searchICD11Codes = async (query) => {
    try {
        const response = await api.get(API_ENDPOINTS.ICD11_SEARCH, {
            params: { q: query }
        });
        return response;
    } catch (error) {
        console.error('Search ICD-11 codes error:', error);
        throw error;
    }
};

/**
 * Get ICD-11 code by code
 * @param {string} code - ICD-11 code
 * @returns {Promise<Object>} ICD-11 code details
 */
export const getICD11Code = async (code) => {
    try {
        const response = await api.get(API_ENDPOINTS.ICD11_BY_CODE(code));
        return response;
    } catch (error) {
        console.error('Get ICD-11 code error:', error);
        throw error;
    }
};

/**
 * Create dual coding mapping
 * @param {Object} mappingData - Mapping data
 * @param {string} mappingData.namasteCode - NAMASTE code
 * @param {string} mappingData.icd11Code - ICD-11 code
 * @param {string} mappingData.patientId - Patient ID
 * @returns {Promise<Object>} Created mapping
 */
export const createDualCoding = async (mappingData) => {
    try {
        const response = await api.post(API_ENDPOINTS.DUAL_CODING, mappingData);
        return response;
    } catch (error) {
        console.error('Create dual coding error:', error);
        throw error;
    }
};

/**
 * Get dual coding mappings
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Dual coding mappings
 */
export const getDualCodingMappings = async (params = {}) => {
    try {
        const response = await api.get(API_ENDPOINTS.DUAL_CODING_MAPPING, { params });
        return response;
    } catch (error) {
        console.error('Get dual coding mappings error:', error);
        throw error;
    }
};

/**
 * Get diagnosis for patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} Patient diagnoses
 */
export const getPatientDiagnosis = async (patientId) => {
    try {
        const response = await api.get(API_ENDPOINTS.DIAGNOSIS, {
            params: { patientId }
        });
        return response;
    } catch (error) {
        console.error('Get patient diagnosis error:', error);
        throw error;
    }
};
