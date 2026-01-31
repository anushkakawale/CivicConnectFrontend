import React, { useState, useEffect } from 'react';
import departmentOfficerService from '../../services/departmentOfficerService';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Award } from 'lucide-react';

const DepartmentAnalytics = () => {
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
            // Set mock data for demonstration
            setAnalytics({
                slaCompliance: 85,
                avgResolutionTime: 18,
                totalResolved: 45,
                totalBreached: 8,
                byCategory: [
                    { category: 'Water Supply', count: 15, resolved: 12 },
                    { category: 'Waste Management', count: 20, resolved: 18 },
                    { category: 'Roads', count: 10, resolved: 8 }
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

            {/* Performance Chart */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">SLA Compliance Trend</h5>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-info">
                                <TrendingUp size={18} className="me-2" />
                                Chart visualization will be implemented with a charting library (Chart.js or Recharts)
                            </div>
                            <div className="bg-light rounded p-4 text-center" style={{ height: '300px' }}>
                                <p className="text-muted">SLA Compliance Chart Placeholder</p>
                                <p className="small text-muted">Install Chart.js or Recharts for visualization</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">By Category</h5>
                        </div>
                        <div className="card-body">
                            {analytics?.byCategory?.map((item, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="fw-semibold">{item.category}</span>
                                        <span className="text-muted">{item.resolved}/{item.count}</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar bg-primary"
                                            style={{ width: `${(item.resolved / item.count) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Performance */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">Performance Summary</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded">
                                        <h6 className="fw-bold text-success">✅ Strengths</h6>
                                        <ul className="mb-0 small">
                                            <li>High SLA compliance rate</li>
                                            <li>Quick response time</li>
                                            <li>Consistent resolution quality</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded">
                                        <h6 className="fw-bold text-warning">⚠️ Areas to Improve</h6>
                                        <ul className="mb-0 small">
                                            <li>Reduce SLA breaches</li>
                                            <li>Improve documentation</li>
                                            <li>Faster initial response</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded">
                                        <h6 className="fw-bold text-primary">📊 Insights</h6>
                                        <ul className="mb-0 small">
                                            <li>Peak hours: 10 AM - 2 PM</li>
                                            <li>Most common: Waste Management</li>
                                            <li>Avg resolution: {analytics?.avgResolutionTime || 0} hours</li>
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

export default DepartmentAnalytics;
