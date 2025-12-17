import React, { useState } from 'react';
import axios from 'axios';

const AyushRecommendations = () => {
    const [symptoms, setSymptoms] = useState('');
    const [patientHistory, setPatientHistory] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingTime, setProcessingTime] = useState(0);
    const [topK, setTopK] = useState(5);

    const API_BASE_URL = 'http://localhost:8001/api/v1';

    const handleGetRecommendations = async () => {
        if (!symptoms.trim()) {
            alert('Please enter symptoms');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/recommend`, {
                symptoms: symptoms,
                patient_history: patientHistory || null,
                top_k: topK
            });

            setRecommendations(response.data.recommendations);
            setProcessingTime(response.data.processing_time_ms);
        } catch (error) {
            console.error('Recommendation failed:', error);
            alert('Failed to get recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceBadgeColor = (level) => {
        switch (level) {
            case 'high':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="ayush-recommendations p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">AI-Powered AYUSH Recommendations</h2>

            {/* Input Section */}
            <div className="input-section mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Symptoms *
                    </label>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Enter patient symptoms (e.g., fever, cough, breathlessness, fatigue)"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient History (Optional)
                    </label>
                    <textarea
                        value={patientHistory}
                        onChange={(e) => setPatientHistory(e.target.value)}
                        placeholder="Enter relevant patient history"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">
                        Number of Recommendations:
                    </label>
                    <select
                        value={topK}
                        onChange={(e) => setTopK(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                    </select>
                </div>

                <button
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                    {loading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
                </button>
            </div>

            {/* Results Section */}
            {recommendations.length > 0 && (
                <div className="results-section">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Recommended AYUSH Codes
                        </h3>
                        <span className="text-sm text-gray-500">
                            Processing time: {processingTime.toFixed(2)}ms
                        </span>
                    </div>

                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-lg font-semibold text-gray-900">
                                                {rec.code}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor(rec.confidence_level)}`}>
                                                {rec.confidence_level.toUpperCase()} ({(rec.confidence * 100).toFixed(1)}%)
                                            </span>
                                        </div>

                                        <h4 className="text-md font-medium text-gray-800 mb-1">
                                            {rec.name}
                                        </h4>

                                        {rec.name_english && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">English:</span> {rec.name_english}
                                            </p>
                                        )}

                                        {rec.description && (
                                            <p className="text-sm text-gray-700 mb-2">
                                                {rec.description}
                                            </p>
                                        )}

                                        {rec.category && (
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {rec.category}
                                            </span>
                                        )}
                                    </div>

                                    <div className="ml-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && recommendations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p>Enter patient symptoms to get AI-powered AYUSH code recommendations</p>
                </div>
            )}
        </div>
    );
};

export default AyushRecommendations;
