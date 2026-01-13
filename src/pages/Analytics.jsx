/**
 * Analytics Dashboard Page
 * Data visualization and insights with Code Data tab
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, BarChart3, Database } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import CodeDataTab from '../components/CodeDataTab';
import axios from 'axios';

const Analytics = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('charts'); // 'charts' or 'codes'
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('6months');
    const [stats, setStats] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        patientTrends: [],
        diagnosisDistribution: [],
        dualCodingStats: []
    });

    useEffect(() => {
        if (activeTab === 'charts') {
            fetchAnalyticsData();
            fetchStats();
        }
    }, [period, activeTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.get(`http://localhost:5000/api/dashboard/analytics?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAnalyticsData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0891b2', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

    const handleExport = () => {
        // Create a printable version of the analytics
        const printWindow = window.open('', '_blank');
        const date = new Date().toLocaleDateString();

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Analytics Report - ${date}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        color: #333;
                    }
                    h1 {
                        color: #0891b2;
                        border-bottom: 3px solid #0891b2;
                        padding-bottom: 10px;
                    }
                    .header {
                        margin-bottom: 30px;
                    }
                    .metrics {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        margin: 30px 0;
                    }
                    .metric-card {
                        border: 1px solid #e5e7eb;
                        padding: 20px;
                        border-radius: 8px;
                    }
                    .metric-title {
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 8px;
                    }
                    .metric-value {
                        font-size: 32px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .metric-change {
                        font-size: 14px;
                        color: #22c55e;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #e5e7eb;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background-color: #f3f4f6;
                        font-weight: 600;
                    }
                    .section {
                        margin: 40px 0;
                    }
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Analytics Report</h1>
                    <p>Generated on: ${date}</p>
                    <p>Doctor: ${user?.name || 'N/A'}</p>
                </div>

                <div class="metrics">
                    <div class="metric-card">
                        <div class="metric-title">Total Patients</div>
                        <div class="metric-value">${stats?.totalPatients?.value || 0}</div>
                        <div class="metric-change">${stats?.totalPatients?.change >= 0 ? '↑' : '↓'} ${Math.abs(stats?.totalPatients?.change || 0)}% this month</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">Dual Codings</div>
                        <div class="metric-value">${stats?.dualCodings?.value || 0}</div>
                        <div class="metric-change">${stats?.dualCodings?.change >= 0 ? '↑' : '↓'} ${Math.abs(stats?.dualCodings?.change || 0)}% this month</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">Active Cases</div>
                        <div class="metric-value">${stats?.activeCases?.value || 0}</div>
                        <div class="metric-change">${stats?.activeCases?.change >= 0 ? '↑' : '↓'} ${Math.abs(stats?.activeCases?.change || 0)}% this month</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">This Month</div>
                        <div class="metric-value">${stats?.thisMonth?.value || 0}</div>
                        <div class="metric-change">${stats?.thisMonth?.change >= 0 ? '↑' : '↓'} ${Math.abs(stats?.thisMonth?.change || 0)}% from last</div>
                    </div>
                </div>

                <div class="section">
                    <h2>Patient Trends</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Patients</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${analyticsData.patientTrends.map(item => `
                                <tr>
                                    <td>${item.month}</td>
                                    <td>${item.patients}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>Diagnosis Distribution</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${analyticsData.diagnosisDistribution.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>Dual Coding Statistics</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>AYUSH Codes</th>
                                <th>ICD-11 Codes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${analyticsData.dualCodingStats.map(item => `
                                <tr>
                                    <td>${item.month}</td>
                                    <td>${item.namaste}</td>
                                    <td>${item.icd11}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>NAMOAROGYA Healthcare Platform - Analytics Report</p>
                    <p>This is a system-generated report</p>
                </div>

                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background-color: #0891b2; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                        Print / Save as PDF
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
                        Close
                    </button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Medical Code Database</h1>
                    <p className="text-neutral-600 mt-1">
                        {activeTab === 'charts'
                            ? 'Insights and trends from your healthcare data'
                            : 'Browse and search medical code databases'
                        }
                    </p>
                </div>
                {activeTab === 'charts' && (
                    <div className="flex items-center gap-3">
                        <select className="input w-48" value={period} onChange={handlePeriodChange}>
                            <option value="6months">Last 6 Months</option>
                            <option value="1year">Last Year</option>
                            <option value="all">All Time</option>
                        </select>
                        <Button variant="outline" icon={Download} onClick={handleExport}>
                            Export
                        </Button>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-neutral-200">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('charts')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'charts'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} />
                            Analytics Charts
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('codes')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'codes'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Database size={18} />
                            Code Data
                        </div>
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'codes' ? (
                <CodeDataTab />
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {loading || !stats ? (
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
                        ) : (
                            <>
                                <Card hover>
                                    <p className="text-sm text-neutral-600 mb-1">Total Patients</p>
                                    <p className="text-3xl font-bold text-neutral-900">{stats.totalPatients.value}</p>
                                    <p className="text-sm text-secondary-600 mt-2">
                                        {stats.totalPatients.change >= 0 ? '↑' : '↓'} {Math.abs(stats.totalPatients.change)}% this month
                                    </p>
                                </Card>
                                <Card hover>
                                    <p className="text-sm text-neutral-600 mb-1">Dual Codings</p>
                                    <p className="text-3xl font-bold text-neutral-900">{stats.dualCodings.value}</p>
                                    <p className="text-sm text-secondary-600 mt-2">
                                        {stats.dualCodings.change >= 0 ? '↑' : '↓'} {Math.abs(stats.dualCodings.change)}% this month
                                    </p>
                                </Card>
                                <Card hover>
                                    <p className="text-sm text-neutral-600 mb-1">Active Cases</p>
                                    <p className="text-3xl font-bold text-neutral-900">{stats.activeCases.value}</p>
                                    <p className="text-sm text-secondary-600 mt-2">
                                        {stats.activeCases.change >= 0 ? '↑' : '↓'} {Math.abs(stats.activeCases.change)}% this month
                                    </p>
                                </Card>
                                <Card hover>
                                    <p className="text-sm text-neutral-600 mb-1">This Month</p>
                                    <p className="text-3xl font-bold text-neutral-900">{stats.thisMonth.value}</p>
                                    <p className="text-sm text-secondary-600 mt-2">
                                        {stats.thisMonth.change >= 0 ? '↑' : '↓'} {Math.abs(stats.thisMonth.change)}% from last
                                    </p>
                                </Card>
                            </>
                        )}
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Patient Trends */}
                        <Card title="Patient Trends" subtitle="Monthly patient visits over time">
                            {loading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                                </div>
                            ) : analyticsData.patientTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analyticsData.patientTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="patients"
                                            stroke="#0891b2"
                                            strokeWidth={2}
                                            dot={{ fill: '#0891b2', r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500">
                                    No patient data available for the selected period
                                </div>
                            )}
                        </Card>

                        {/* Diagnosis Distribution */}
                        <Card title="Diagnosis Distribution" subtitle="Breakdown by AYUSH code category">
                            {loading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                                </div>
                            ) : analyticsData.diagnosisDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.diagnosisDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {analyticsData.diagnosisDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500">
                                    No diagnosis data available. Add patients with AYUSH codes.
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Charts Row 2 */}
                    <Card title="Dual Coding Statistics" subtitle="AYUSH vs ICD-11 coding trends">
                        {loading ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <div className="animate-pulse text-gray-400">Loading chart data...</div>
                            </div>
                        ) : analyticsData.dualCodingStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.dualCodingStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="namaste" fill="#0891b2" name="AYUSH Codes" />
                                    <Bar dataKey="icd11" fill="#22c55e" name="ICD-11 Codes" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                No coding data available for the selected period
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

export default Analytics;
