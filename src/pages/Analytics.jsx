/**
 * Analytics Dashboard Page
 * Data visualization and insights
 */

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const Analytics = () => {
    // Mock data for charts
    const patientTrendsData = [
        { month: 'Jan', patients: 65 },
        { month: 'Feb', patients: 78 },
        { month: 'Mar', patients: 90 },
        { month: 'Apr', patients: 81 },
        { month: 'May', patients: 95 },
        { month: 'Jun', patients: 110 },
    ];

    const diagnosisDistributionData = [
        { name: 'Vata Imbalance', value: 35 },
        { name: 'Pitta Imbalance', value: 28 },
        { name: 'Kapha Imbalance', value: 22 },
        { name: 'Other', value: 15 },
    ];

    const dualCodingStatsData = [
        { month: 'Jan', namaste: 45, icd11: 42 },
        { month: 'Feb', namaste: 52, icd11: 48 },
        { month: 'Mar', namaste: 61, icd11: 58 },
        { month: 'Apr', namaste: 58, icd11: 55 },
        { month: 'May', namaste: 67, icd11: 64 },
        { month: 'Jun', namaste: 75, icd11: 72 },
    ];

    const COLORS = ['#0891b2', '#22c55e', '#f59e0b', '#ef4444'];

    const handleExport = () => {
        alert('Export analytics data - To be implemented');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
                    <p className="text-neutral-600 mt-1">
                        Insights and trends from your healthcare data
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="input w-48">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                        <option>All Time</option>
                    </select>
                    <Button variant="outline" icon={Download} onClick={handleExport}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card hover>
                    <p className="text-sm text-neutral-600 mb-1">Total Patients</p>
                    <p className="text-3xl font-bold text-neutral-900">1,234</p>
                    <p className="text-sm text-secondary-600 mt-2">↑ 12% this month</p>
                </Card>
                <Card hover>
                    <p className="text-sm text-neutral-600 mb-1">Dual Codings</p>
                    <p className="text-3xl font-bold text-neutral-900">456</p>
                    <p className="text-sm text-secondary-600 mt-2">↑ 18% this month</p>
                </Card>
                <Card hover>
                    <p className="text-sm text-neutral-600 mb-1">Avg. Visit Duration</p>
                    <p className="text-3xl font-bold text-neutral-900">32m</p>
                    <p className="text-sm text-neutral-600 mt-2">→ No change</p>
                </Card>
                <Card hover>
                    <p className="text-sm text-neutral-600 mb-1">Patient Satisfaction</p>
                    <p className="text-3xl font-bold text-neutral-900">4.8</p>
                    <p className="text-sm text-secondary-600 mt-2">↑ 0.3 points</p>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Trends */}
                <Card title="Patient Trends" subtitle="Monthly patient visits over time">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={patientTrendsData}>
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
                </Card>

                {/* Diagnosis Distribution */}
                <Card title="Diagnosis Distribution" subtitle="Breakdown by diagnosis type">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={diagnosisDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {diagnosisDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <Card title="Dual Coding Statistics" subtitle="NAMASTE vs ICD-11 coding trends">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dualCodingStatsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="namaste" fill="#0891b2" name="NAMASTE Codes" />
                        <Bar dataKey="icd11" fill="#22c55e" name="ICD-11 Codes" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Recent Activity */}
            <Card title="Recent Activity" subtitle="Latest system events">
                <div className="space-y-3">
                    {[
                        { action: 'New patient registered', time: '5 minutes ago', type: 'success' },
                        { action: 'Dual coding created', time: '12 minutes ago', type: 'info' },
                        { action: 'Patient record updated', time: '1 hour ago', type: 'success' },
                        { action: 'Analytics report generated', time: '2 hours ago', type: 'info' },
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-secondary-500' : 'bg-primary-500'
                                    }`}></div>
                                <span className="text-neutral-900">{activity.action}</span>
                            </div>
                            <span className="text-sm text-neutral-500">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
