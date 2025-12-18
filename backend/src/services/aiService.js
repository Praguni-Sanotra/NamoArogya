/**
 * AI Service
 * Integration with AYUSH AI service for code recommendations
 */

const axios = require('axios');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001/api/v1';

/**
 * Get AYUSH code recommendations based on symptoms
 */
async function getCodeRecommendations(symptoms, patientHistory = null, topK = 5) {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/recommend`, {
            symptoms,
            patient_history: patientHistory,
            top_k: topK
        }, {
            timeout: 10000 // 10 second timeout
        });

        if (response.data && response.data.recommendations) {
            return {
                success: true,
                recommendations: response.data.recommendations,
                processing_time: response.data.processing_time_ms
            };
        }

        return {
            success: false,
            recommendations: [],
            error: 'Invalid response from AI service'
        };
    } catch (error) {
        logger.error('AI service error:', error.message);

        // Return empty recommendations on error rather than failing
        return {
            success: false,
            recommendations: [],
            error: error.message
        };
    }
}

/**
 * Search AYUSH codes
 */
async function searchAyushCodes(query, category = null, limit = 20) {
    try {
        const params = {
            query,
            limit
        };

        if (category) {
            params.category = category;
        }

        const response = await axios.get(`${AI_SERVICE_URL}/ayush/search`, {
            params,
            timeout: 5000
        });

        if (response.data && response.data.results) {
            return {
                success: true,
                results: response.data.results,
                total: response.data.total
            };
        }

        return {
            success: false,
            results: [],
            error: 'Invalid response from AI service'
        };
    } catch (error) {
        logger.error('AI service search error:', error.message);

        return {
            success: false,
            results: [],
            error: error.message
        };
    }
}

/**
 * Get AYUSH code by code ID
 */
async function getAyushCode(code) {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/ayush/${code}`, {
            timeout: 5000
        });

        if (response.data) {
            return {
                success: true,
                code: response.data
            };
        }

        return {
            success: false,
            error: 'Code not found'
        };
    } catch (error) {
        logger.error('AI service get code error:', error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    getCodeRecommendations,
    searchAyushCodes,
    getAyushCode
};
