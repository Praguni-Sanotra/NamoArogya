/**
 * Add Patient Page
 * Form to create new patient with automatic AYUSH code matching
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, Phone, Mail, MapPin, FileText, Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AddPatient = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingCodes, setLoadingCodes] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        contact: '',
        email: '',
        address: '',
        symptoms: '',
        diagnosis: '',
        medical_history: '',
        allergies: '',
        status: 'active',
        doctor_id: ''
    });

    const { user } = useSelector((state) => state.auth);
    const [doctors, setDoctors] = useState([]);

    const [suggestedCodes, setSuggestedCodes] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [symptomsDebounce, setSymptomsDebounce] = useState(null);

    // Debounced code suggestions
    useEffect(() => {
        if (symptomsDebounce) {
            clearTimeout(symptomsDebounce);
        }

        if (formData.symptoms.length >= 10) {
            const timeout = setTimeout(() => {
                fetchCodeSuggestions();
            }, 1000); // Wait 1 second after user stops typing

            setSymptomsDebounce(timeout);
        } else {
            setSuggestedCodes([]);
        }

        return () => {
            if (symptomsDebounce) {
                clearTimeout(symptomsDebounce);
            }
        };
    }, [formData.symptoms]);

    // Fetch doctors if user is admin
    useEffect(() => {
        const fetchDoctors = async () => {
            if (user?.role === 'admin') {
                try {
                    const token = localStorage.getItem('namoarogya_token');
                    const response = await axios.get('http://localhost:5000/api/admin/users', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data.success) {
                        // Filter only doctors
                        const doctorUsers = response.data.data.users.filter(u => u.role === 'doctor');
                        setDoctors(doctorUsers);
                    }
                } catch (err) {
                    console.error('Failed to fetch doctors:', err);
                }
            }
        };

        fetchDoctors();
    }, [user]);

    const fetchCodeSuggestions = async () => {
        setLoadingCodes(true);
        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.post(
                'http://localhost:5000/api/patients/code-recommendations',
                {
                    symptoms: formData.symptoms,
                    medical_history: formData.medical_history || null,
                    top_k: 5
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSuggestedCodes(response.data.data.recommendations || []);
            }
        } catch (err) {
            console.error('Failed to fetch code suggestions:', err);
        } finally {
            setLoadingCodes(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const toggleCodeSelection = (code) => {
        const isSelected = selectedCodes.some(c => c.code === code.code);

        if (isSelected) {
            setSelectedCodes(selectedCodes.filter(c => c.code !== code.code));
        } else {
            setSelectedCodes([...selectedCodes, { ...code, selected: true }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.post(
                'http://localhost:5000/api/patients',
                {
                    ...formData,
                    age: parseInt(formData.age),
                    matched_ayush_codes: selectedCodes
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/patients');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create patient. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceBadgeColor = (level) => {
        switch (level) {
            case 'high':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Added Successfully!</h2>
                    <p className="text-gray-600 mb-4">Redirecting to patient list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Add New Patient</h1>
                <p className="text-neutral-600 mt-1">Enter patient information and symptoms for automatic AYUSH code matching</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                        {user?.role === 'admin' && (
                            <div className="w-64">
                                <select
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 font-medium"
                                >
                                    <option value="">Select Doctor *</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name} ({doc.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age *
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                                min="0"
                                max="150"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="45"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender *
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="patient@example.com"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="123 Main Street, City, State, PIN"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
                    <div className="space-y-4">
                        {/* Symptoms */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Symptoms / Chief Complaints *
                            </label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    name="symptoms"
                                    value={formData.symptoms}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe patient's symptoms in detail (minimum 10 characters)..."
                                />
                            </div>
                            {loadingCodes && (
                                <p className="text-sm text-blue-600 mt-2">🔍 Analyzing symptoms for AYUSH code suggestions...</p>
                            )}
                        </div>

                        {/* Diagnosis */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Diagnosis
                            </label>
                            <input
                                type="text"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Preliminary diagnosis"
                            />
                        </div>

                        {/* Medical History */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medical History
                            </label>
                            <textarea
                                name="medical_history"
                                value={formData.medical_history}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Past medical conditions, surgeries, etc."
                            />
                        </div>

                        {/* Allergies */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Allergies
                            </label>
                            <input
                                type="text"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Known allergies"
                            />
                        </div>
                    </div>
                </div>

                {/* Suggested AYUSH Codes */}
                {suggestedCodes.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Suggested AYUSH Codes
                            <span className="text-sm font-normal text-gray-600 ml-2">
                                (Select relevant codes)
                            </span>
                        </h2>
                        <div className="space-y-3">
                            {suggestedCodes.map((code, index) => {
                                const isSelected = selectedCodes.some(c => c.code === code.code);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => toggleCodeSelection(code)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => { }}
                                                        className="w-5 h-5 text-blue-600 rounded"
                                                    />
                                                    <span className="font-semibold text-gray-900">{code.code}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceBadgeColor(code.confidence_level)}`}>
                                                        {code.confidence_level.toUpperCase()} ({(code.confidence * 100).toFixed(0)}%)
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-800 ml-8">{code.name}</p>
                                                {code.name_english && (
                                                    <p className="text-sm text-gray-600 ml-8 mt-1">English: {code.name_english}</p>
                                                )}
                                                {code.description && (
                                                    <p className="text-sm text-gray-600 ml-8 mt-1">{code.description}</p>
                                                )}
                                                {code.category && (
                                                    <span className="inline-block ml-8 mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                        {code.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {selectedCodes.length > 0 && (
                            <p className="text-sm text-green-600 mt-4">
                                ✓ {selectedCodes.length} code(s) selected
                            </p>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/patients')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Creating Patient...' : 'Create Patient'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPatient;
