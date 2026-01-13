/**
 * Dual Coding Page
 * Interface for mapping NAMASTE codes to ICD-11 codes
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, ArrowRight, Save } from 'lucide-react';
import { setSelectedNAMASTECode, setSelectedICD11Code } from '../store/slices/diagnosisSlice';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api/v1';

const DualCoding = () => {
    const dispatch = useDispatch();
    const { selectedNAMASTECode, selectedICD11Code } = useSelector((state) => state.diagnosis);

    const [namasteQuery, setNamasteQuery] = useState('');
    const [icd11Query, setIcd11Query] = useState('');
    const [namasteResults, setNamasteResults] = useState([]);
    const [icd11Results, setIcd11Results] = useState([]);
    const [namasteLoading, setNamasteLoading] = useState(false);
    const [icd11Loading, setIcd11Loading] = useState(false);
    const [semanticSuggestions, setSemanticSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Search AYUSH codes
    const searchAyushCodes = async (query) => {
        if (query.length < 2) {
            setNamasteResults([]);
            return;
        }

        setNamasteLoading(true);
        try {
            const response = await axios.get(`${AI_SERVICE_URL}/ayush/search`, {
                params: { query, limit: 10 }
            });

            // API returns results directly, not nested in data
            if (response.data && response.data.results) {
                const codes = response.data.results.map(item => ({
                    code: item.code,
                    description: item.name_english || item.name_devanagari || item.description,
                    category: item.category || item.system || 'AYUSH'
                }));
                setNamasteResults(codes);
            } else {
                setNamasteResults([]);
            }
        } catch (error) {
            console.error('Failed to search AYUSH codes:', error);
            setNamasteResults([]);
        } finally {
            setNamasteLoading(false);
        }
    };

    // Search ICD-11 codes
    const searchICD11Codes = async (query) => {
        if (query.length < 2) {
            setIcd11Results([]);
            return;
        }

        setIcd11Loading(true);
        try {
            const response = await axios.get(`${AI_SERVICE_URL}/icd11/search`, {
                params: { query, limit: 10 }
            });

            // API returns results directly, not nested in data
            if (response.data && response.data.results) {
                const codes = response.data.results.map(item => ({
                    code: item.code || item.id,
                    description: item.title || item.name || item.description,
                    category: item.chapter || item.category || 'ICD-11'
                }));
                setIcd11Results(codes);
            } else {
                setIcd11Results([]);
            }
        } catch (error) {
            console.error('Failed to search ICD-11 codes:', error);
            setIcd11Results([]);
        } finally {
            setIcd11Loading(false);
        }
    };

    // Get semantic mapping suggestions for selected AYUSH code
    const getSemanticSuggestions = async (ayushCode) => {
        setLoadingSuggestions(true);
        setSemanticSuggestions([]);
        setIcd11Results([]);

        // Validate description
        const description = ayushCode.description || ayushCode.name_english || ayushCode.name_devanagari || '';

        if (!description || description.length < 3) {
            console.warn('Description too short for semantic mapping:', description);
            const infoSuggestion = {
                code: 'INFO',
                description: `Selected: ${ayushCode.code}. Description too short for automatic mapping. Please search ICD-11 codes manually.`,
                category: 'Information',
                confidence: 1.0,
                isInfo: true
            };
            setSemanticSuggestions([infoSuggestion]);
            setIcd11Results([infoSuggestion]);
            setLoadingSuggestions(false);
            return;
        }

        try {
            // Use the /map endpoint to get ICD-11 suggestions
            const response = await axios.post(`${AI_SERVICE_URL}/map`, {
                namaste_code: ayushCode.code,
                disease_name: description,
                symptoms: description,
                top_k: 5
            });

            if (response.data && response.data.suggestions && response.data.suggestions.length > 0) {
                // Map the ICD-11 suggestions to our format
                const suggestions = response.data.suggestions.map((item) => ({
                    code: item.icd_code,
                    description: item.icd_title || item.icd_definition,
                    category: item.icd_chapter || 'ICD-11',
                    confidence: item.confidence_score,
                    isReference: false // These are actual ICD-11 codes
                }));

                // Add info message at the top
                const infoMsg = {
                    code: 'INFO',
                    description: `🤖 AI-Generated ICD-11 suggestions for "${ayushCode.code}". Select the most appropriate match or search manually for more options.`,
                    category: 'AI Suggestions',
                    confidence: 1.0,
                    isInfo: true
                };

                setSemanticSuggestions([infoMsg, ...suggestions]);
                setIcd11Results([infoMsg, ...suggestions]);
            } else {
                // No recommendations found
                const infoSuggestion = {
                    code: 'INFO',
                    description: `Selected: ${ayushCode.code} - ${description}. No automatic ICD-11 suggestions available. Please search for ICD-11 codes manually using the search box above.`,
                    category: 'Information',
                    confidence: 1.0,
                    isInfo: true
                };
                setSemanticSuggestions([infoSuggestion]);
                setIcd11Results([infoSuggestion]);
            }
        } catch (error) {
            console.error('Failed to get semantic suggestions:', error);
            const errorSuggestion = {
                code: 'ERROR',
                description: `Selected: ${ayushCode.code}. Unable to fetch automatic ICD-11 suggestions (${error.message}). Please search for ICD-11 codes manually.`,
                category: 'Error',
                confidence: 1.0,
                isInfo: true
            };
            setSemanticSuggestions([errorSuggestion]);
            setIcd11Results([errorSuggestion]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Handle AYUSH code selection
    const handleAyushCodeSelect = (code) => {
        dispatch(setSelectedNAMASTECode(code));
        // Automatically get semantic mapping suggestions
        getSemanticSuggestions(code);
    };

    const handleSaveMapping = async () => {
        if (!selectedNAMASTECode || !selectedICD11Code) {
            alert('Please select both AYUSH and ICD-11 codes');
            return;
        }

        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.post(
                `${API_URL}/dual-coding`,
                {
                    ayush_code: selectedNAMASTECode.code,
                    ayush_description: selectedNAMASTECode.description,
                    icd11_code: selectedICD11Code.code,
                    icd11_description: selectedICD11Code.description,
                    confidence_score: 0.95,
                    mapping_type: 'manual'
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                alert(`Mapping saved successfully!\nAYUSH: ${selectedNAMASTECode.code}\nICD-11: ${selectedICD11Code.code}`);
                // Reset selections
                dispatch(setSelectedNAMASTECode(null));
                dispatch(setSelectedICD11Code(null));
                setNamasteQuery('');
                setIcd11Query('');
                setNamasteResults([]);
                setIcd11Results([]);
            }
        } catch (error) {
            console.error('Failed to save mapping:', error);
            alert('Failed to save mapping. Please try again.');
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (namasteQuery) {
                searchAyushCodes(namasteQuery);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [namasteQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (icd11Query) {
                searchICD11Codes(icd11Query);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [icd11Query]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Dual Coding</h1>
                <p className="text-neutral-600 mt-1">
                    Map AYUSH codes to ICD-11 international standards
                </p>
            </div>

            {/* Dual Coding Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NAMASTE Code Search */}
                <Card title="AYUSH Codes" subtitle="Search and select AYUSH medical codes">
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Search AYUSH codes (min 2 characters)..."
                            value={namasteQuery}
                            onChange={(e) => {
                                setNamasteQuery(e.target.value);
                            }}
                            icon={Search}
                        />

                        {/* Search Results */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {namasteLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : namasteResults.length > 0 ? (
                                namasteResults.map((code) => (
                                    <button
                                        key={code.code}
                                        onClick={() => handleAyushCodeSelect(code)}
                                        className={`w-full text-left p-4 border-2 rounded-lg transition-all ${selectedNAMASTECode?.code === code.code
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-neutral-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-mono text-sm text-primary-600 font-medium">
                                                    {code.code}
                                                </p>
                                                <p className="text-neutral-900 mt-1">{code.description}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{code.category}</p>
                                            </div>
                                            {selectedNAMASTECode?.code === code.code && (
                                                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : namasteQuery.length >= 2 ? (
                                <p className="text-center text-neutral-500 py-8">
                                    No AYUSH codes found for "{namasteQuery}"
                                </p>
                            ) : (
                                <p className="text-center text-neutral-500 py-8">
                                    Type at least 2 characters to search
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ICD-11 Code Search */}
                <Card
                    title="ICD-11 Codes"
                    subtitle={selectedNAMASTECode
                        ? "Search for matching ICD-11 codes"
                        : "Search and select ICD-11 international codes"
                    }
                >
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Search ICD-11 codes (min 2 characters)..."
                            value={icd11Query}
                            onChange={(e) => setIcd11Query(e.target.value)}
                            icon={Search}
                        />

                        {/* Semantic Suggestions Banner */}
                        {semanticSuggestions.length > 1 && !semanticSuggestions[0].isInfo && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800 font-medium">
                                    🤖 AI-Generated ICD-11 Code Suggestions
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    These are semantically matched ICD-11 codes based on the selected AYUSH code
                                </p>
                            </div>
                        )}

                        {/* Search Results */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {(icd11Loading || loadingSuggestions) ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
                                </div>
                            ) : icd11Results.length > 0 ? (
                                icd11Results.map((code, index) => (
                                    code.isInfo ? (
                                        // Info message display
                                        <div key="info" className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                ℹ️ {code.description}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-2">
                                                💡 Tip: Use the search box above to manually find ICD-11 codes
                                            </p>
                                        </div>
                                    ) : (
                                        // Regular ICD-11 code display
                                        <button
                                            key={code.code + index}
                                            onClick={() => dispatch(setSelectedICD11Code(code))}
                                            className={`w-full text-left p-4 border-2 rounded-lg transition-all ${selectedICD11Code?.code === code.code
                                                ? 'border-secondary-500 bg-secondary-50'
                                                : 'border-neutral-200 hover:border-secondary-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-mono text-sm text-secondary-600 font-medium">
                                                            {code.code}
                                                        </p>
                                                        {code.confidence && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${code.confidence > 0.8
                                                                ? 'bg-green-100 text-green-700'
                                                                : code.confidence > 0.6
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {(code.confidence * 100).toFixed(0)}% match
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-neutral-900 mt-1">{code.description}</p>
                                                    <p className="text-xs text-neutral-500 mt-1">{code.category}</p>
                                                </div>
                                                {selectedICD11Code?.code === code.code && (
                                                    <div className="w-5 h-5 bg-secondary-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                ))
                            ) : icd11Query.length >= 2 ? (
                                <p className="text-center text-neutral-500 py-8">
                                    No ICD-11 codes found for "{icd11Query}"
                                </p>
                            ) : semanticSuggestions.length === 0 ? (
                                <p className="text-center text-neutral-500 py-8">
                                    {selectedNAMASTECode
                                        ? "Getting AI suggestions..."
                                        : "Select an AYUSH code to see AI suggestions or search manually"
                                    }
                                </p>
                            ) : null}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Selected Mapping Preview */}
            {(selectedNAMASTECode || selectedICD11Code) && (
                <Card title="Selected Mapping" hover>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {selectedNAMASTECode ? (
                                <div className="p-4 bg-primary-50 rounded-lg">
                                    <p className="text-xs text-primary-600 font-medium mb-1">NAMASTE</p>
                                    <p className="font-mono text-sm font-medium">{selectedNAMASTECode.code}</p>
                                    <p className="text-sm text-neutral-700 mt-1">{selectedNAMASTECode.description}</p>
                                </div>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center text-neutral-500">
                                    Select NAMASTE code
                                </div>
                            )}
                        </div>

                        <div className="px-6">
                            <ArrowRight className="w-8 h-8 text-neutral-400" />
                        </div>

                        <div className="flex-1">
                            {selectedICD11Code ? (
                                <div className="p-4 bg-secondary-50 rounded-lg">
                                    <p className="text-xs text-secondary-600 font-medium mb-1">ICD-11</p>
                                    <p className="font-mono text-sm font-medium">{selectedICD11Code.code}</p>
                                    <p className="text-sm text-neutral-700 mt-1">{selectedICD11Code.description}</p>
                                </div>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center text-neutral-500">
                                    Select ICD-11 code
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            variant="primary"
                            icon={Save}
                            onClick={handleSaveMapping}
                            disabled={!selectedNAMASTECode || !selectedICD11Code}
                        >
                            Save Mapping
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DualCoding;
