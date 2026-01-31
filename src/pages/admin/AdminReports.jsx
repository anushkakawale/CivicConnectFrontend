/**
 * Admin Reports Page
 * Generate and download various reports
 */

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, AlertCircle } from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import './AdminReports.css';

const AdminReports = () => {
    const [loading, setLoading] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [slaData, setSlaData] = useState(null);
    const [reportType, setReportType] = useState('summary');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const [complaintsData, sla] = await Promise.all([
                apiService.admin.getAllComplaints(),
                apiService.admin.getSlaStats()
            ]);

            setComplaints(complaintsData.content || []);
            // Handle SLA response - extract from array or object
            const slaArray = Array.isArray(sla) ? sla : (sla.data || []);
            setSlaData(slaArray[0] || {});
        } catch (error) {
            console.error('Error fetching report data:', error);
            setComplaints([]);
            setSlaData({});
        } finally {
            setLoading(false);
        }
    };

    const generateReport = (type) => {
        let reportContent = '';
        const date = new Date().toLocaleString();

        switch (type) {
            case 'summary':
                reportContent = `CIVIC CONNECT - SUMMARY REPORT\nGenerated: ${date}\n\n`;
                reportContent += `Total Complaints: ${complaints.length}\n`;
                reportContent += `SLA Compliance: ${slaData?.slaCompliancePercent || 0}%\n`;
                reportContent += `Active SLAs: ${slaData?.active || 0}\n`;
                reportContent += `Breached SLAs: ${slaData?.breached || 0}\n`;
                break;

            case 'detailed':
                reportContent = `CIVIC CONNECT - DETAILED COMPLAINTS REPORT\nGenerated: ${date}\n\n`;
                reportContent += `ID,Title,Status,Ward,Department,Created Date\n`;
                complaints.forEach(c => {
                    reportContent += `${c.complaintId},"${c.title}",${c.status},${c.wardName || 'N/A'},${c.departmentName || 'N/A'},${c.createdAt || 'N/A'}\n`;
                });
                break;

            case 'sla':
                reportContent = `CIVIC CONNECT - SLA PERFORMANCE REPORT\nGenerated: ${date}\n\n`;
                reportContent += `Total SLAs: ${slaData?.totalSla || 0}\n`;
                reportContent += `Active: ${slaData?.active || 0}\n`;
                reportContent += `Completed: ${slaData?.completed || 0}\n`;
                reportContent += `Breached: ${slaData?.breached || 0}\n`;
                reportContent += `Compliance Rate: ${slaData?.slaCompliancePercent || 0}%\n`;
                break;

            default:
                reportContent = 'Invalid report type';
        }

        // Download as text file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const reportTemplates = [
        {
            id: 'summary',
            title: 'Summary Report',
            description: 'Overview of all complaints and SLA performance',
            icon: <FileText />,
            color: 'purple'
        },
        {
            id: 'detailed',
            title: 'Detailed Complaints Report',
            description: 'Complete list of all complaints with details',
            icon: <TrendingUp />,
            color: 'blue'
        },
        {
            id: 'sla',
            title: 'SLA Performance Report',
            description: 'Comprehensive SLA metrics and compliance',
            icon: <AlertCircle />,
            color: 'green'
        },
        {
            id: 'users',
            title: 'User Activity Report',
            description: 'User registrations and activity statistics',
            icon: <Users />,
            color: 'orange'
        }
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="admin-reports-page">
            <div className="reports-header">
                <div>
                    <h1>
                        <FileText size={32} />
                        Reports & Downloads
                    </h1>
                    <p>Generate and export comprehensive reports</p>
                </div>
                <div className="header-filters">
                    <div className="date-range">
                        <Calendar size={18} />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="stat-box">
                    <div className="stat-icon purple">
                        <FileText />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{complaints.length}</div>
                        <div className="stat-label">Total Complaints</div>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon blue">
                        <TrendingUp />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{slaData?.slaCompliancePercent || 0}%</div>
                        <div className="stat-label">SLA Compliance</div>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon green">
                        <AlertCircle />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{slaData?.active || 0}</div>
                        <div className="stat-label">Active SLAs</div>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon orange">
                        <Users />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{slaData?.breached || 0}</div>
                        <div className="stat-label">Breached SLAs</div>
                    </div>
                </div>
            </div>

            {/* Report Templates */}
            <div className="reports-grid">
                {reportTemplates.map(template => (
                    <div key={template.id} className={`report-card ${template.color}`}>
                        <div className="report-icon">
                            {template.icon}
                        </div>
                        <div className="report-content">
                            <h3>{template.title}</h3>
                            <p>{template.description}</p>
                        </div>
                        <button
                            className="download-report-btn"
                            onClick={() => generateReport(template.id)}
                        >
                            <Download size={18} />
                            Generate
                        </button>
                    </div>
                ))}
            </div>

            {/* Recent Reports */}
            <div className="recent-reports-section">
                <h2>Recent Complaint Data</h2>
                <div className="reports-table-container">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Ward</th>
                                <th>Department</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.slice(0, 10).map(complaint => (
                                <tr key={complaint.complaintId}>
                                    <td>#{complaint.complaintId}</td>
                                    <td>{complaint.title}</td>
                                    <td>
                                        <span className={`status-badge ${complaint.status?.toLowerCase()}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td>
                                        {complaint.wardName ||
                                            complaint.ward?.areaName ||
                                            complaint.ward?.wardName ||
                                            (typeof complaint.ward === 'string' ? complaint.ward : 'N/A')}
                                    </td>
                                    <td>
                                        {complaint.departmentName ||
                                            complaint.department?.departmentName ||
                                            (typeof complaint.department === 'string' ? complaint.department : 'N/A')}
                                    </td>
                                    <td>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {complaints.length === 0 && (
                        <div className="empty-state">
                            <FileText size={48} />
                            <p>No complaint data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
