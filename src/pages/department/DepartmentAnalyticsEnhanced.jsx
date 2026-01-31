import React, { useState, useEffect } from 'react';
import departmentOfficerService from '../../services/departmentOfficerService';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Award } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DepartmentAnalyticsEnhanced = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await departmentOfficerService.getSLAAnalytics();
            setAnalytics(data);
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
            // Set comprehensive mock data for demonstration
            setAnalytics({
                slaCompliance: 85,
                avgResolutionTime: 18,
                totalResolved: 45,
                totalBreached: 8,
                byCategory: [
                    { category: 'Water Supply', count: 15, resolved: 12, icon: '💧' },
                    { category: 'Waste Management', count: 20, resolved: 18, icon: '🗑️' },
                    { category: 'Roads', count: 10, resolved: 8, icon: '🛣️' },
                    { category: 'Electricity', count: 8, resolved: 7, icon: '⚡' }
                ],
                monthlyTrend: [
                    { month: 'Jan', complaints: 12, resolved: 10 },
                    { month: 'Feb', complaints: 15, resolved: 13 },
                    { month: 'Mar', complaints: 18, resolved: 16 },
                    { month: 'Apr', complaints: 20, resolved: 18 },
                    { month: 'May', complaints: 16, resolved: 15 }
                ],
                statusDistribution: [
                    { name: 'Assigned', value: 5 },
                    { name: 'In Progress', value: 8 },
                    { name: 'Resolved', value: 45 },
                    { name: 'Closed', value: 32 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted fw-semibold">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold mb-1">
                        <BarChart3 size={28} className="me-2 text-primary" />
                        Analytics Dashboard
                    </h2>
                    <p className="text-muted mb-0">Performance metrics and insights</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-warning mb-4">
                    <AlertTriangle size={18} className="me-2" />
                    {error} - Showing sample data
                </div>
            )}

            {/* Key Metrics */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <Award size={40} className="text-success" />
                            </div>
                            <h2 className="mb-0 text-success">{analytics?.slaCompliance || 0}%</h2>
                            <p className="text-muted mb-0">SLA Compliance</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <Clock size={40} className="text-primary" />
                            </div>
                            <h2 className="mb-0 text-primary">{analytics?.avgResolutionTime || 0}h</h2>
                            <p className="text-muted mb-0">Avg Resolution Time</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <CheckCircle size={40} className="text-success" />
                            </div>
                            <h2 className="mb-0 text-success">{analytics?.totalResolved || 0}</h2>
                            <p className="text-muted mb-0">Total Resolved</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <AlertTriangle size={40} className="text-danger" />
                            </div>
                            <h2 className="mb-0 text-danger">{analytics?.totalBreached || 0}</h2>
                            <p className="text-muted mb-0">SLA Breached</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="row g-4 mb-4">
                {/* Monthly Trend */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">
                                <TrendingUp size={20} className="me-2 text-primary" />
                                Monthly Trend
                            </h5>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics?.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="complaints"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Total Complaints"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="resolved"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        name="Resolved"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">Status Distribution</h5>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analytics?.statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analytics?.statusDistribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="row g-4 mb-4">
                {/* Category Performance */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">Performance by Category</h5>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics?.byCategory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" name="Total" />
                                    <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Category Details */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">Category Details</h5>
                        </div>
                        <div className="card-body">
                            {analytics?.byCategory?.map((item, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-semibold">
                                            {item.icon} {item.category}
                                        </span>
                                        <span className="text-muted small">
                                            {item.resolved}/{item.count}
                                        </span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar bg-primary"
                                            style={{ width: `${(item.resolved / item.count) * 100}%` }}
                                        ></div>
                                    </div>
                                    <small className="text-muted">
                                        {((item.resolved / item.count) * 100).toFixed(1)}% resolved
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">Performance Summary</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="p-3 bg-success bg-opacity-10 rounded">
                                        <h6 className="fw-bold text-success mb-2">✅ Strengths</h6>
                                        <ul className="mb-0 small">
                                            <li>High SLA compliance rate ({analytics?.slaCompliance}%)</li>
                                            <li>Quick average resolution time</li>
                                            <li>Consistent resolution quality</li>
                                            <li>Good category coverage</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-warning bg-opacity-10 rounded">
                                        <h6 className="fw-bold text-warning mb-2">⚠️ Areas to Improve</h6>
                                        <ul className="mb-0 small">
                                            <li>Reduce SLA breaches ({analytics?.totalBreached} cases)</li>
                                            <li>Improve initial response time</li>
                                            <li>Better documentation practices</li>
                                            <li>Increase citizen feedback</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-primary bg-opacity-10 rounded">
                                        <h6 className="fw-bold text-primary mb-2">📊 Key Insights</h6>
                                        <ul className="mb-0 small">
                                            <li>Peak hours: 10 AM - 2 PM</li>
                                            <li>Most common: {analytics?.byCategory?.[0]?.category}</li>
                                            <li>Avg resolution: {analytics?.avgResolutionTime}h</li>
                                            <li>Total resolved: {analytics?.totalResolved}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentAnalyticsEnhanced;
