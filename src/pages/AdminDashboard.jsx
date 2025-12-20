/**
 * Admin Dashboard Page
 * System-wide monitoring and administrative features
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Server,
    Database,
    Activity,
    Link2,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import { formatDate } from '../utils/helpers';
import axios from 'axios';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('apis');
    const [loading, setLoading] = useState(false);

    // API Status
    const [apiStatus, setApiStatus] = useState([]);

    // Backend Data
    const [backendData, setBackendData] = useState({
        users: [],
        patients: [],
        stats: {}
    });

    // PostgreSQL Data
    const [postgresData, setPostgresData] = useState({
        tables: [],
        connections: 0,
        size: '0 MB'
    });

    // Dual Coding Mappings
    const [mappings, setMappings] = useState([]);

    // Fetch all data on component mount
    useEffect(() => {
        fetchAPIStatus();
        fetchBackendData();
        fetchPostgresData();
        fetchMappings();
    }, []);

    // Refresh data when tab changes
    useEffect(() => {
        if (activeTab === 'apis') fetchAPIStatus();
        if (activeTab === 'backend') fetchBackendData();
        if (activeTab === 'postgres') fetchPostgresData();
        if (activeTab === 'mappings') fetchMappings();
    }, [activeTab]);

    const fetchAPIStatus = async () => {
        setLoading(true);
        const apis = [
            { name: 'Backend API', url: 'http://localhost:5000/api/health', type: 'REST' },
            { name: 'AYUSH AI Service', url: 'http://localhost:8001/api/v1/health', type: 'AI/ML' },
            { name: 'Auth Service', url: 'http://localhost:5000/api/auth/health', type: 'Auth' },
            { name: 'Patient Service', url: 'http://localhost:5000/api/patients/health', type: 'Data' },
            { name: 'Dashboard Service', url: 'http://localhost:5000/api/dashboard/health', type: 'Analytics' },
        ];

        const statusChecks = await Promise.all(
            apis.map(async (api) => {
                try {
                    const start = Date.now();
                    const response = await fetch(api.url);
                    const latency = Date.now() - start;
                    return {
                        ...api,
                        status: response.ok ? 'online' : 'offline',
                        latency: `${latency}ms`,
                        lastChecked: new Date().toISOString()
                    };
                } catch (error) {
                    return {
                        ...api,
                        status: 'offline',
                        latency: 'N/A',
                        lastChecked: new Date().toISOString(),
                        error: error.message
                    };
                }
            })
        );

        setApiStatus(statusChecks);
        setLoading(false);
    };

    const fetchBackendData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('namoarogya_token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch users - with fallback
            let users = [];
            try {
                const usersRes = await axios.get('http://localhost:5000/api/admin/users', { headers });
                users = usersRes.data.data?.users || usersRes.data.users || [];
            } catch (error) {
                console.warn('Failed to fetch users:', error.message);
            }

            // Fetch patients - with fallback
            let patients = [];
            try {
                const patientsRes = await axios.get('http://localhost:5000/api/patients?limit=100', { headers });
                patients = patientsRes.data.data?.patients || patientsRes.data.patients || [];
            } catch (error) {
                console.warn('Failed to fetch patients:', error.message);
            }

            // Fetch stats - with fallback
            let stats = {};
            try {
                const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', { headers });
                stats = statsRes.data.data?.stats || statsRes.data.stats || {};
            } catch (error) {
                console.warn('Failed to fetch stats:', error.message);
            }

            setBackendData({
                users,
                patients,
                stats
            });
        } catch (error) {
            console.error('Failed to fetch backend data:', error);
            setBackendData({
                users: [],
                patients: [],
                stats: {}
            });
        }
        setLoading(false);
    };

    const fetchPostgresData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.get('http://localhost:5000/api/admin/database-info', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.data || response.data || {};
            setPostgresData({
                tables: data.tables || [],
                connections: data.connections || 0,
                size: data.size || '0 MB'
            });
        } catch (error) {
            console.error('Failed to fetch PostgreSQL data:', error);
            setPostgresData({
                tables: [],
                connections: 0,
                size: 'N/A'
            });
        }
        setLoading(false);
    };

    const fetchMappings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.get('http://localhost:5000/api/admin/dual-coding-mappings', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.data || response.data || {};
            setMappings(data.mappings || []);
        } catch (error) {
            console.error('Failed to fetch mappings:', error);
            setMappings([]);
        }
        setLoading(false);
    };

    const apiColumns = [
        {
            header: 'API Name',
            accessor: 'name',
            render: (row) => (
                <div>
                    <p className="font-medium text-neutral-900">{row.name}</p>
                    <p className="text-xs text-neutral-500">{row.url}</p>
                </div>
            ),
        },
        {
            header: 'Type',
            accessor: 'type',
            render: (row) => (
                <span className="badge badge-primary">{row.type}</span>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.status === 'online' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={row.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                        {row.status.toUpperCase()}
                    </span>
                </div>
            ),
        },
        {
            header: 'Latency',
            accessor: 'latency',
        },
        {
            header: 'Last Checked',
            accessor: 'lastChecked',
            render: (row) => formatDate(row.lastChecked),
        },
    ];

    const userColumns = [
        {
            header: 'Name',
            accessor: 'name',
        },
        {
            header: 'Email',
            accessor: 'email',
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (row) => (
                <span className={`badge ${row.role === 'admin' ? 'badge-accent' : 'badge-primary'}`}>
                    {row.role}
                </span>
            ),
        },
        {
            header: 'Created',
            accessor: 'created_at',
            render: (row) => formatDate(row.created_at),
        },
    ];

    const patientColumns = [
        {
            header: 'Patient Name',
            accessor: 'name',
        },
        {
            header: 'Age',
            accessor: 'age',
        },
        {
            header: 'Gender',
            accessor: 'gender',
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className="badge badge-secondary">{row.status}</span>
            ),
        },
        {
            header: 'Created',
            accessor: 'created_at',
            render: (row) => formatDate(row.created_at),
        },
    ];

    const mappingColumns = [
        {
            header: 'AYUSH Code',
            accessor: 'ayush_code',
            render: (row) => (
                <div>
                    <p className="font-mono text-sm text-primary-600 font-medium">{row.ayush_code}</p>
                    <p className="text-xs text-neutral-600">{row.ayush_description}</p>
                </div>
            ),
        },
        {
            header: 'ICD-11 Code',
            accessor: 'icd11_code',
            render: (row) => (
                <div>
                    <p className="font-mono text-sm text-secondary-600 font-medium">{row.icd11_code}</p>
                    <p className="text-xs text-neutral-600">{row.icd11_description}</p>
                </div>
            ),
        },
        {
            header: 'Confidence',
            accessor: 'confidence_score',
            render: (row) => (
                <span className={`badge ${row.confidence_score > 0.8 ? 'badge-secondary' :
                    row.confidence_score > 0.6 ? 'badge-primary' : 'badge-accent'
                    }`}>
                    {(row.confidence_score * 100).toFixed(0)}%
                </span>
            ),
        },
        {
            header: 'Type',
            accessor: 'mapping_type',
        },
        {
            header: 'Created',
            accessor: 'created_at',
            render: (row) => formatDate(row.created_at),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
                    <p className="text-neutral-600 mt-1">
                        System monitoring and administrative controls
                    </p>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading data...</span>
                    </div>
                )}
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card hover>
                    <div className="text-center">
                        <p className="text-sm text-neutral-600">APIs Online</p>
                        <p className="text-2xl font-bold text-green-600">
                            {apiStatus.filter(api => api.status === 'online').length}/{apiStatus.length}
                        </p>
                    </div>
                </Card>
                <Card hover>
                    <div className="text-center">
                        <p className="text-sm text-neutral-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-600">{backendData.users.length}</p>
                    </div>
                </Card>
                <Card hover>
                    <div className="text-center">
                        <p className="text-sm text-neutral-600">Total Patients</p>
                        <p className="text-2xl font-bold text-purple-600">{backendData.patients.length}</p>
                    </div>
                </Card>
                <Card hover>
                    <div className="text-center">
                        <p className="text-sm text-neutral-600">Dual Codings</p>
                        <p className="text-2xl font-bold text-orange-600">{mappings.length}</p>
                    </div>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-neutral-200">
                <button
                    onClick={() => setActiveTab('apis')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'apis'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        API Status
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('backend')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'backend'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Backend Data
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('postgres')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'postgres'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        PostgreSQL
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('mappings')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'mappings'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Dual Coding Mappings
                    </div>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'apis' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">API Health Status</h2>
                        <button
                            onClick={fetchAPIStatus}
                            className="btn btn-outline btn-sm flex items-center gap-2"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                    <Card>
                        <Table
                            columns={apiColumns}
                            data={apiStatus}
                            loading={loading}
                            emptyMessage="No API data available"
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'backend' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card hover>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Total Users</p>
                                    <p className="text-2xl font-bold">{backendData.users.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card hover>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Total Patients</p>
                                    <p className="text-2xl font-bold">{backendData.patients.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card hover>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Activity className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Active Cases</p>
                                    <p className="text-2xl font-bold">{backendData.stats.activeCases?.value || 0}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Users Table */}
                    <Card title="System Users" subtitle="All registered users">
                        <Table
                            columns={userColumns}
                            data={backendData.users}
                            loading={loading}
                            emptyMessage="No users found"
                        />
                    </Card>

                    {/* Patients Table */}
                    <Card title="Recent Patients" subtitle="Latest patient records">
                        <Table
                            columns={patientColumns}
                            data={backendData.patients.slice(0, 10)}
                            loading={loading}
                            emptyMessage="No patients found"
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'postgres' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card hover>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <Database className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Database Size</p>
                                    <p className="text-2xl font-bold">{postgresData.size}</p>
                                </div>
                            </div>
                        </Card>
                        <Card hover>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Activity className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Active Connections</p>
                                    <p className="text-2xl font-bold">{postgresData.connections}</p>
                                </div>
                            </div>
                        </Card>
                        <Card hover>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Tables</p>
                                    <p className="text-2xl font-bold">{postgresData.tables.length}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card title="Database Tables" subtitle="PostgreSQL table information">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Table Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Row Count</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Size</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {postgresData.tables.length > 0 ? (
                                        postgresData.tables.map((table, index) => (
                                            <tr key={index} className="border-b border-neutral-100">
                                                <td className="px-4 py-3 text-sm font-mono">{table.name}</td>
                                                <td className="px-4 py-3 text-sm">{table.rows}</td>
                                                <td className="px-4 py-3 text-sm">{table.size}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-neutral-500">
                                                {loading ? 'Loading...' : 'No table data available'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'mappings' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Dual Coding Mappings</h2>
                            <p className="text-sm text-neutral-600">AYUSH to ICD-11 code mappings created by doctors</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{mappings.length}</p>
                            <p className="text-sm text-neutral-600">Total Mappings</p>
                        </div>
                    </div>

                    <Card>
                        <Table
                            columns={mappingColumns}
                            data={mappings}
                            loading={loading}
                            emptyMessage="No dual coding mappings found. Doctors can create mappings from the Dual Coding page."
                        />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
