/**
 * Admin Dashboard Page
 * System-wide statistics and administrative features
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Users,
    UserCog,
    FileText,
    Activity,
    Server,
    Database,
    Cpu,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Brain,
    BookOpen
} from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import AyushCodeBrowser from '../components/AyushCodeBrowser';
import AyushRecommendations from '../components/AyushRecommendations';
import { formatDate } from '../utils/helpers';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [serviceStatus, setServiceStatus] = useState({
        backend: 'checking',
        aiService: 'checking',
        database: 'checking'
    });
    const [ayushStats, setAyushStats] = useState({
        totalCodes: 0,
        categories: [],
        isLoaded: false
    });
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'browser', 'recommendations'

    useEffect(() => {
        // Check service health status
        checkServiceHealth();
        // Fetch AYUSH dataset stats
        fetchAyushStats();
    }, []);

    const checkServiceHealth = async () => {
        try {
            // Check backend
            const backendResponse = await fetch('http://localhost:5000/api/health').catch(() => null);

            // Check AI service
            const aiResponse = await fetch('http://localhost:8001/api/v1/health').catch(() => null);

            // Get AI service stats
            let aiStats = null;
            if (aiResponse?.ok) {
                aiStats = await aiResponse.json();
            }

            setServiceStatus({
                backend: backendResponse?.ok ? 'online' : 'offline',
                aiService: aiResponse?.ok ? 'online' : 'offline',
                database: backendResponse?.ok ? 'online' : 'offline'
            });

            // Update AYUSH stats from AI service
            if (aiStats) {
                const modelsResponse = await fetch('http://localhost:8001/api/v1/models').catch(() => null);
                if (modelsResponse?.ok) {
                    const modelsData = await modelsResponse.json();
                    setAyushStats({
                        totalCodes: modelsData.namaste_codes_count || 0,
                        isLoaded: true
                    });
                }
            }
        } catch (error) {
            console.error('Error checking service health:', error);
        }
    };

    const fetchAyushStats = async () => {
        try {
            const categoriesResponse = await fetch('http://localhost:8001/api/v1/ayush/categories').catch(() => null);
            if (categoriesResponse?.ok) {
                const categories = await categoriesResponse.json();
                setAyushStats(prev => ({
                    ...prev,
                    categories: categories
                }));
            }
        } catch (error) {
            console.error('Error fetching AYUSH stats:', error);
        }
    };

    // System-wide statistics
    const systemStats = [
        {
            title: 'Total Doctors',
            value: '24',
            change: '+3 this month',
            icon: UserCog,
            color: 'primary',
        },
        {
            title: 'Total Patients',
            value: '2,847',
            change: '+156 this month',
            icon: Users,
            color: 'secondary',
        },
        {
            title: 'AYUSH Codes',
            value: ayushStats.isLoaded ? ayushStats.totalCodes.toLocaleString() : 'Loading...',
            change: `${(ayushStats.categories || []).length} categories`,
            icon: BookOpen,
            color: 'primary',
        },
        {
            title: 'System Uptime',
            value: '99.9%',
            change: 'Last 30 days',
            icon: TrendingUp,
            color: 'secondary',
        },
    ];

    // Service status cards
    const services = [
        {
            name: 'Backend API',
            status: serviceStatus.backend,
            url: 'http://localhost:5000',
            icon: Server,
        },
        {
            name: 'AI Service',
            status: serviceStatus.aiService,
            url: 'http://localhost:8000',
            icon: Cpu,
        },
        {
            name: 'Database',
            status: serviceStatus.database,
            url: 'PostgreSQL',
            icon: Database,
        },
    ];

    // Mock doctors data - Replace with real API call
    const doctors = [
        {
            id: 'D-001',
            name: 'Dr. Rajesh Kumar',
            specialty: 'Ayurveda',
            patients: 156,
            codings: 89,
            status: 'active',
            lastActive: new Date()
        },
        {
            id: 'D-002',
            name: 'Dr. Priya Sharma',
            specialty: 'Unani',
            patients: 142,
            codings: 76,
            status: 'active',
            lastActive: new Date()
        },
        {
            id: 'D-003',
            name: 'Dr. Amit Patel',
            specialty: 'Siddha',
            patients: 98,
            codings: 54,
            status: 'inactive',
            lastActive: new Date(Date.now() - 86400000 * 3)
        },
    ];

    // Table columns for doctors
    const doctorColumns = [
        {
            header: 'Doctor',
            accessor: 'name',
            render: (row) => (
                <div>
                    <p className="font-medium text-neutral-900">{row.name}</p>
                    <p className="text-xs text-neutral-500">{row.id}</p>
                </div>
            ),
        },
        {
            header: 'Specialty',
            accessor: 'specialty',
        },
        {
            header: 'Patients',
            accessor: 'patients',
            render: (row) => (
                <span className="font-medium text-neutral-900">{row.patients}</span>
            ),
        },
        {
            header: 'Codings',
            accessor: 'codings',
            render: (row) => (
                <span className="font-medium text-neutral-900">{row.codings}</span>
            ),
        },
        {
            header: 'Last Active',
            accessor: 'lastActive',
            render: (row) => formatDate(row.lastActive),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const statusColors = {
                    active: 'badge-secondary',
                    inactive: 'badge-primary',
                };
                return (
                    <span className={`badge ${statusColors[row.status]}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                );
            },
        },
    ];

    const getStatusIcon = (status) => {
        if (status === 'online') return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (status === 'offline') return <AlertCircle className="w-5 h-5 text-red-500" />;
        return <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />;
    };

    const getStatusBadge = (status) => {
        if (status === 'online') return 'badge-secondary';
        if (status === 'offline') return 'badge-accent';
        return 'badge-primary';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
                <p className="text-neutral-600 mt-1">
                    System-wide overview and administrative controls
                </p>
            </div>

            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} hover>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                                    <p className="text-sm text-secondary-600 mt-2">
                                        {stat.change}
                                    </p>
                                </div>
                                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Service Status */}
            <Card title="Service Health" subtitle="Real-time status of all services">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={index}
                                className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-neutral-100 rounded-lg">
                                            <Icon className="w-5 h-5 text-neutral-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">{service.name}</p>
                                            <p className="text-xs text-neutral-500">{service.url}</p>
                                        </div>
                                    </div>
                                    {getStatusIcon(service.status)}
                                </div>
                                <span className={`badge ${getStatusBadge(service.status)}`}>
                                    {service.status === 'checking' ? 'Checking...' : service.status.toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Tab Navigation for AYUSH Features */}
            <div className="flex gap-2 border-b border-neutral-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'overview'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    System Overview
                </button>
                <button
                    onClick={() => setActiveTab('browser')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'browser'
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

            {/* Conditional Content Based on Active Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Doctors Management */}
                    <Card title="Registered Doctors" subtitle="Overview of all doctors in the system">
                        <Table
                            columns={doctorColumns}
                            data={doctors}
                            emptyMessage="No doctors found"
                        />
                    </Card>

                    {/* Quick Admin Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Quick Actions" hover>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                                    <p className="font-medium text-primary-700">Add New Doctor</p>
                                    <p className="text-sm text-primary-600">Register a new doctor account</p>
                                </button>
                                <button className="w-full text-left px-4 py-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors">
                                    <p className="font-medium text-secondary-700">View System Logs</p>
                                    <p className="text-sm text-secondary-600">Access system activity logs</p>
                                </button>
                                <button className="w-full text-left px-4 py-3 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors">
                                    <p className="font-medium text-accent-700">Generate Reports</p>
                                    <p className="text-sm text-accent-600">Create system-wide reports</p>
                                </button>
                            </div>
                        </Card>

                        <Card title="Recent Activity" hover>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3 pb-3 border-b border-neutral-100">
                                    <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-900">New doctor registered</p>
                                        <p className="text-xs text-neutral-500">Dr. Amit Patel - 2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 pb-3 border-b border-neutral-100">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-900">System backup completed</p>
                                        <p className="text-xs text-neutral-500">5 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-900">Database optimized</p>
                                        <p className="text-xs text-neutral-500">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'browser' && <AyushCodeBrowser />}

            {activeTab === 'recommendations' && <AyushRecommendations />}
        </div>
    );
};

export default AdminDashboard;
