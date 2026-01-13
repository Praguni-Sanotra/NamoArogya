/**
 * Doctor Dashboard Page
 * Main dashboard with statistics and recent patients
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Activity, TrendingUp, BookOpen } from 'lucide-react';
import { fetchPatients } from '../store/slices/patientSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import AyushCodeBrowser from '../components/AyushCodeBrowser';
import AyushRecommendations from '../components/AyushRecommendations';
import { formatDate } from '../utils/helpers';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DoctorDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { patients, loading } = useSelector((state) => state.patients);
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        // Fetch dashboard statistics
        fetchDashboardStats();
        // Fetch recent patients
        dispatch(fetchPatients({ page: 1, limit: 5 }));
    }, [dispatch]);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.get(`${API_URL}/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const data = response.data.data.stats;
                setStats([
                    {
                        title: 'Total Patients',
                        value: data.totalPatients.value.toString(),
                        change: `${data.totalPatients.change >= 0 ? '+' : ''}${data.totalPatients.change}%`,
                        icon: Users,
                        color: 'primary',
                    },
                    {
                        title: 'Active Cases',
                        value: data.activeCases.value.toString(),
                        change: `${data.activeCases.change >= 0 ? '+' : ''}${data.activeCases.change}%`,
                        icon: Activity,
                        color: 'secondary',
                    },
                    {
                        title: 'Dual Codings',
                        value: data.dualCodings.value.toString(),
                        change: `${data.dualCodings.change >= 0 ? '+' : ''}${data.dualCodings.change}%`,
                        icon: FileText,
                        color: 'primary',
                    },
                    {
                        title: 'This Month',
                        value: data.thisMonth.value.toString(),
                        change: `${data.thisMonth.change >= 0 ? '+' : ''}${data.thisMonth.change}%`,
                        icon: TrendingUp,
                        color: 'secondary',
                    },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            // Set default empty stats on error
            setStats([
                {
                    title: 'Total Patients',
                    value: '0',
                    change: '+0%',
                    icon: Users,
                    color: 'primary',
                },
                {
                    title: 'Active Cases',
                    value: '0',
                    change: '+0%',
                    icon: Activity,
                    color: 'secondary',
                },
                {
                    title: 'Dual Codings',
                    value: '0',
                    change: '+0%',
                    icon: FileText,
                    color: 'primary',
                },
                {
                    title: 'This Month',
                    value: '0',
                    change: '+0%',
                    icon: TrendingUp,
                    color: 'secondary',
                },
            ]);
        } finally {
            setStatsLoading(false);
        }
    };

    // Table columns for recent patients
    const columns = [
        {
            header: 'Patient Name',
            accessor: 'name',
            render: (row) => (
                <div>
                    <p className="font-medium text-neutral-900">{row.name}</p>
                    <p className="text-xs text-neutral-500">ID: {row._id?.slice(-6)}</p>
                </div>
            ),
        },
        {
            header: 'Age',
            accessor: 'age',
        },
        {
            header: 'Last Visit',
            accessor: 'updated_at',
            render: (row) => formatDate(row.updated_at),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const statusColors = {
                    active: 'badge-secondary',
                    inactive: 'badge-primary',
                    discharged: 'badge-accent',
                    'follow-up': 'badge-primary',
                };
                return (
                    <span className={`badge ${statusColors[row.status] || 'badge-secondary'}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
                <p className="text-neutral-600 mt-1">
                    Overview of your healthcare practice
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsLoading ? (
                    // Loading skeleton
                    [1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </Card>
                    ))
                ) : stats ? (
                    stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} hover>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                                        <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                                        <p className="text-sm text-secondary-600 mt-2">
                                            {stat.change} from last month
                                        </p>
                                    </div>
                                    <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                        <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : null}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-neutral-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'overview'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('ayush-browser')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'ayush-browser'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    AYUSH Code Browser
                </button>
                <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'recommendations'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    AI Recommendations
                </button>
            </div>

            {/* Conditional Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Recent Patients */}
                    <Card title="Recent Patients" subtitle="Latest patient records">
                        <Table
                            columns={columns}
                            data={patients}
                            loading={loading}
                            emptyMessage="No patients found. Add your first patient to get started."
                        />
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Quick Actions" hover>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/patients/add')}
                                    className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                                >
                                    <p className="font-medium text-primary-700">Add New Patient</p>
                                    <p className="text-sm text-primary-600">Register a new patient record</p>
                                </button>
                                <button
                                    onClick={() => navigate('/dual-coding')}
                                    className="w-full text-left px-4 py-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
                                >
                                    <p className="font-medium text-secondary-700">Create Dual Coding</p>
                                    <p className="text-sm text-secondary-600">Map NAMASTE to ICD-11</p>
                                </button>
                            </div>
                        </Card>

                        <Card title="System Status" hover>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-700">API Connection</span>
                                    <span className="badge badge-secondary">Online</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-700">Database</span>
                                    <span className="badge badge-secondary">Connected</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-700">Last Sync</span>
                                    <span className="text-sm text-neutral-600">2 minutes ago</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'ayush-browser' && <AyushCodeBrowser />}

            {activeTab === 'recommendations' && <AyushRecommendations />}
        </div>
    );
};

export default DoctorDashboard;
