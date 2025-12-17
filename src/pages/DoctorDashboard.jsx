/**
 * Doctor Dashboard Page
 * Main dashboard with statistics and recent patients
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, FileText, Activity, TrendingUp, BookOpen } from 'lucide-react';
import { fetchPatients } from '../store/slices/patientSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import AyushCodeBrowser from '../components/AyushCodeBrowser';
import AyushRecommendations from '../components/AyushRecommendations';
import { formatDate } from '../utils/helpers';

const DoctorDashboard = () => {
    const dispatch = useDispatch();
    const { patients, loading } = useSelector((state) => state.patients);
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Fetch recent patients
        dispatch(fetchPatients({ page: 1, limit: 5 }));
    }, [dispatch]);

    // Mock statistics - Replace with real data from API
    const stats = [
        {
            title: 'Total Patients',
            value: '1,234',
            change: '+12%',
            icon: Users,
            color: 'primary',
        },
        {
            title: 'Active Cases',
            value: '89',
            change: '+5%',
            icon: Activity,
            color: 'secondary',
        },
        {
            title: 'Dual Codings',
            value: '456',
            change: '+18%',
            icon: FileText,
            color: 'primary',
        },
        {
            title: 'This Month',
            value: '234',
            change: '+23%',
            icon: TrendingUp,
            color: 'secondary',
        },
    ];

    // Table columns for recent patients
    const columns = [
        {
            header: 'Patient Name',
            accessor: 'name',
            render: (row) => (
                <div>
                    <p className="font-medium text-neutral-900">{row.name || 'Patient Name'}</p>
                    <p className="text-xs text-neutral-500">{row.id || 'ID: P-001'}</p>
                </div>
            ),
        },
        {
            header: 'Age',
            accessor: 'age',
            render: (row) => row.age || '45',
        },
        {
            header: 'Last Visit',
            accessor: 'lastVisit',
            render: (row) => formatDate(row.lastVisit || new Date()),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const status = row.status || 'active';
                const statusColors = {
                    active: 'badge-secondary',
                    inactive: 'badge-primary',
                    discharged: 'badge-accent',
                };
                return (
                    <span className={`badge ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            },
        },
    ];

    // Mock data if no patients from API
    const displayData = patients.length > 0 ? patients : [
        { id: 'P-001', name: 'John Doe', age: 45, lastVisit: new Date(), status: 'active' },
        { id: 'P-002', name: 'Jane Smith', age: 32, lastVisit: new Date(), status: 'active' },
        { id: 'P-003', name: 'Robert Johnson', age: 58, lastVisit: new Date(), status: 'inactive' },
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
                {stats.map((stat, index) => {
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
                })}
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
                            data={displayData}
                            loading={loading}
                            emptyMessage="No patients found"
                        />
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Quick Actions" hover>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                                    <p className="font-medium text-primary-700">Add New Patient</p>
                                    <p className="text-sm text-primary-600">Register a new patient record</p>
                                </button>
                                <button className="w-full text-left px-4 py-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors">
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
