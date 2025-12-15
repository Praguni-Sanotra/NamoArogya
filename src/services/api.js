/**
 * Centralized Axios API Instance
 * Handles all HTTP requests with interceptors for auth and error handling
 */

import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

// Get base URL from environment variables or use default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles responses and errors globally
 */
api.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
            console.log('✅ API Response:', response.config.url, response.data);
        }

        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

                if (refreshToken) {
                    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { token } = response.data;
                    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                console.error('❌ Token refresh failed:', refreshError);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: errorMessage,
        });

        // Return structured error
        return Promise.reject({
            status: error.response?.status,
            message: errorMessage,
            data: error.response?.data,
        });
    }
);

export default api;
