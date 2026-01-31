/**
 * Admin Analytics Page
 * Comprehensive analytics and insights for admin
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, Calendar, Download } from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChartComponent } from '../../components/charts/RealAnalyticsCharts';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [wardData, setWardData] = useState([]);
    const [deptData, setDeptData] = useState([]);
    const [slaData, setSlaData] = useState(null);
    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [wards, depts, sla] = await Promise.all([
                apiService.admin.getComplaintsByWard(),
                apiService.admin.getComplaintsByDepartment(),
                apiService.admin.getSlaStats()
            ]);

            // Handle response - extract data array from response object
            const wardArray = Array.isArray(wards) ? wards : (wards.data || []);
            const deptArray = Array.isArray(depts) ? depts : (depts.data || []);
            const slaArray = Array.isArray(sla) ? sla : (sla.data || []);

            setWardData(wardArray);
            setDeptData(deptArray);
            setSlaData(slaArray[0] || {});
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setWardData([]);
            setDeptData([]);
            setSlaData({});
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Export analytics data as CSV
        const csvContent = `Ward Analytics\n${wardData.map(w => `${w.wardName},${w.count}`).join('\n')}\n\nDepartment Analytics\n${deptData.map(d => `${d.departmentName},${d.count}`).join('\n')}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const totalComplaints = wardData.reduce((sum, w) => sum + w.count, 0);
    const avgComplaintsPerWard = wardData.length > 0 ? (totalComplaints / wardData.length).toFixed(1) : 0;
    const topWard = wardData.length > 0 ? wardData.reduce((max, w) => w.count > max.count ? w : max, wardData[0]) : null;
    const topDept = deptData.length > 0 ? deptData.reduce((max, d) => d.count > max.count ? d : max, deptData[0]) : null;

    return (
        <div className="admin-analytics-page">
            <div className="analytics-header">
                <div>
                    <h1>
                        <BarChart3 size={32} />
                        Analytics & Insights
                    </h1>
                    <p>Comprehensive data analysis and trends</p>
                </div>
                <div className="header-actions">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-range-select"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="365">Last Year</option>
                    </select>
                    <button onClick={handleExport} className="export-btn">
                        <Download size={18} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card gradient-purple">
                    <div className="metric-icon">
                        <Activity />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">Total Complaints</div>
                        <div className="metric-value">{totalComplaints}</div>
                        <div className="metric-trend">Across all wards</div>
                    </div>
                </div>

                <div className="metric-card gradient-blue">
                    <div className="metric-icon">
                        <TrendingUp />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">Avg per Ward</div>
                        <div className="metric-value">{avgComplaintsPerWard}</div>
                        <div className="metric-trend">Complaints per ward</div>
                    </div>
                </div>

                <div className="metric-card gradient-green">
                    <div className="metric-icon">
                        <PieChart />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">SLA Compliance</div>
                        <div className="metric-value">{slaData?.slaCompliancePercent || 0}%</div>
                        <div className="metric-trend">Overall performance</div>
                    </div>
                </div>

                <div className="metric-card gradient-orange">
                    <div className="metric-icon">
                        <Calendar />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">Active SLAs</div>
                        <div className="metric-value">{slaData?.active || 0}</div>
                        <div className="metric-trend">Currently tracking</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Ward Analytics */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Complaints by Ward</h3>
                        {topWard && <span className="top-badge">Top: {topWard.wardName}</span>}
                    </div>
                    <div className="chart-content">
                        <BarChartComponent
                            data={wardData}
                            xKey="wardName"
                            yKey="count"
                            color="#3B82F6"
                            height={350}
                        />
                    </div>
                </div>

                {/* Department Analytics */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Complaints by Department</h3>
                        {topDept && <span className="top-badge">Top: {topDept.departmentName}</span>}
                    </div>
                    <div className="chart-content">
                        <BarChartComponent
                            data={deptData}
                            xKey="departmentName"
                            yKey="count"
                            color="#8B5CF6"
                            height={350}
                        />
                    </div>
                </div>
            </div>

            {/* SLA Performance */}
            <div className="sla-performance-card">
                <h3>SLA Performance Overview</h3>
                <div className="sla-stats-grid">
                    <div className="sla-stat">
                        <div className="sla-stat-label">Total SLAs</div>
                        <div className="sla-stat-value">{slaData?.totalSla || 0}</div>
                    </div>
                    <div className="sla-stat">
                        <div className="sla-stat-label">Active</div>
                        <div className="sla-stat-value text-blue">{slaData?.active || 0}</div>
                    </div>
                    <div className="sla-stat">
                        <div className="sla-stat-label">Completed</div>
                        <div className="sla-stat-value text-green">{slaData?.completed || 0}</div>
                    </div>
                    <div className="sla-stat">
                        <div className="sla-stat-label">Breached</div>
                        <div className="sla-stat-value text-red">{slaData?.breached || 0}</div>
                    </div>
                    <div className="sla-stat">
                        <div className="sla-stat-label">Compliance Rate</div>
                        <div className="sla-stat-value text-purple">{slaData?.slaCompliancePercent || 0}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
