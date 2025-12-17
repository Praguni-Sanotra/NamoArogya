import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AyushCodeBrowser = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState({ offset: 0, limit: 20, total: 0, hasMore: false });

    const API_BASE_URL = 'http://localhost:8001/api/v1';

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/ayush/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSearch = async (offset = 0) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const params = {
                query: searchQuery,
                limit: pagination.limit,
                offset: offset
            };

            if (selectedCategory) {
                params.category = selectedCategory;
            }

            const response = await axios.get(`${API_BASE_URL}/ayush/search`, { params });
            setSearchResults(response.data.results);
            setPagination({
                offset: response.data.offset,
                limit: response.data.limit,
                total: response.data.total,
                hasMore: response.data.has_more
            });
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeClick = async (code) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/ayush/${code}`);
            setSelectedCode(response.data);
            setShowModal(true);
        } catch (error) {
            console.error('Failed to fetch code details:', error);
        }
    };

    const handleNextPage = () => {
        if (pagination.hasMore) {
            const newOffset = pagination.offset + pagination.limit;
            handleSearch(newOffset);
        }
    };

    const handlePrevPage = () => {
        if (pagination.offset > 0) {
            const newOffset = Math.max(0, pagination.offset - pagination.limit);
            handleSearch(newOffset);
        }
    };

    return (
        <div className="ayush-code-browser p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">AYUSH Code Browser</h2>

            {/* Search Section */}
            <div className="search-section mb-6">
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search AYUSH codes, names, descriptions..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {searchResults.length > 0 && (
                <div className="results-section">
                    <div className="mb-4 text-sm text-gray-600">
                        Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">English Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {searchResults.map((code, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{code.code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{code.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{code.name_english || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleCodeClick(code.code)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={pagination.offset === 0}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {Math.floor(pagination.offset / pagination.limit) + 1}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={!pagination.hasMore}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Code Details Modal */}
            {showModal && selectedCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">AYUSH Code Details</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="font-semibold text-gray-700">Code:</label>
                                <p className="text-gray-900">{selectedCode.code}</p>
                            </div>

                            <div>
                                <label className="font-semibold text-gray-700">Name:</label>
                                <p className="text-gray-900">{selectedCode.name}</p>
                            </div>

                            {selectedCode.name_diacritical && (
                                <div>
                                    <label className="font-semibold text-gray-700">Name (Diacritical):</label>
                                    <p className="text-gray-900">{selectedCode.name_diacritical}</p>
                                </div>
                            )}

                            {selectedCode.name_devanagari && (
                                <div>
                                    <label className="font-semibold text-gray-700">Name (Devanagari):</label>
                                    <p className="text-gray-900 text-xl">{selectedCode.name_devanagari}</p>
                                </div>
                            )}

                            {selectedCode.name_english && (
                                <div>
                                    <label className="font-semibold text-gray-700">English Name:</label>
                                    <p className="text-gray-900">{selectedCode.name_english}</p>
                                </div>
                            )}

                            <div>
                                <label className="font-semibold text-gray-700">Category:</label>
                                <p className="text-gray-900">{selectedCode.category}</p>
                            </div>

                            {selectedCode.description && (
                                <div>
                                    <label className="font-semibold text-gray-700">Description:</label>
                                    <p className="text-gray-900">{selectedCode.description}</p>
                                </div>
                            )}

                            {selectedCode.ontology_branches && (
                                <div>
                                    <label className="font-semibold text-gray-700">Ontology Branches:</label>
                                    <p className="text-gray-900">{selectedCode.ontology_branches}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AyushCodeBrowser;
