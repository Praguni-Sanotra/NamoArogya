/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} credentials.role - User role (doctor/admin)
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
    try {
        const response = await api.post(API_ENDPOINTS.LOGIN, credentials);

        // Backend returns {success, message, data: {user, token, refreshToken}}
        // Extract the actual data
        const { user, token, refreshToken } = response.data || response;

        // Store token and user data
        if (token) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        }
        if (refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }

        return { user, token, refreshToken };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
    try {
        await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage regardless of API response
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User data or null
 */
export const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
};

/**
 * Refresh authentication token
 * @returns {Promise<string>} New token
 */
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });

        if (response.token) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        }

        return response.token;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};
