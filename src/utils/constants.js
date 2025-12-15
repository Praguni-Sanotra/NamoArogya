/**
 * Application Constants
 * Centralized constants for roles, status, and configuration
 */

// User Roles
export const ROLES = {
    DOCTOR: 'doctor',
    ADMIN: 'admin',
};

// Patient Status
export const PATIENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCHARGED: 'discharged',
};

// Diagnosis Status
export const DIAGNOSIS_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    REVIEWED: 'reviewed',
};

// API Endpoints (relative to base URL)
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',

    // Patients
    PATIENTS: '/patients',
    PATIENT_BY_ID: (id) => `/patients/${id}`,

    // Diagnosis
    DIAGNOSIS: '/diagnosis',
    DIAGNOSIS_BY_ID: (id) => `/diagnosis/${id}`,

    // NAMASTE Codes
    NAMASTE_SEARCH: '/namaste/search',
    NAMASTE_BY_CODE: (code) => `/namaste/${code}`,

    // ICD-11 Codes
    ICD11_SEARCH: '/icd11/search',
    ICD11_BY_CODE: (code) => `/icd11/${code}`,

    // Dual Coding
    DUAL_CODING: '/dual-coding',
    DUAL_CODING_MAPPING: '/dual-coding/mapping',

    // Analytics
    ANALYTICS_OVERVIEW: '/analytics/overview',
    ANALYTICS_PATIENTS: '/analytics/patients',
    ANALYTICS_DIAGNOSIS: '/analytics/diagnosis',
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'namoarogya_token',
    REFRESH_TOKEN: 'namoarogya_refresh_token',
    USER: 'namoarogya_user',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_WITH_TIME: 'MMM DD, YYYY hh:mm A',
    API: 'YYYY-MM-DD',
};
