/**
 * Ward Officer Dashboard
 * Manage complaints and approvals for the ward
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, CheckCircle, Clock, AlertTriangle,
    TrendingUp, FileText, XCircle, Eye
} from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import './WardOfficerDashboard.css';

const WardOfficerDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        breached: 0
    });
    const [pendingApprovals, setPendingApprovals] = useState([]);

    // For handling processing state of individual cards
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const [summaryRes, approvalsRes] = await Promise.all([
                apiService.wardOfficer.getSummaryStats().catch(err => { console.warn('Stats fetch failed', err); return {}; }),
                apiService.wardOfficer.getPendingApprovals().catch(err => { console.warn('Approvals fetch failed', err); return []; })
            ]);

            // Handle stats
            // Depending on backend, summaryRes might be array or object
            // If API returns array of counts, or object with keys
            const summaryData = summaryRes.data || summaryRes || {};

            setStats({
                total: summaryData.totalComplaints || summaryData.total || 0,
                pending: summaryData.pendingApprovals || summaryData.pending || 0,
                resolved: summaryData.resolved || summaryData.completed || 0,
                breached: summaryData.slaBreached || summaryData.breached || 0
            });

            // Handle approvals
            const approvals = Array.isArray(approvalsRes) ? approvalsRes : (approvalsRes.data || []);
            setPendingApprovals(approvals);

        } catch (error) {
            console.error('Failed to load dashboard:', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (complaintId) => {
        if (!window.confirm('Approve this resolution?')) return;

        try {
            setProcessingId(complaintId);
            await apiService.wardOfficer.approveResolution(complaintId, 'Approved by Ward Officer');
            showToast('Resolution approved successfully', 'success');

            // Remove from list immediately for better UI feel
            setPendingApprovals(prev => prev.filter(c => c.complaintId !== complaintId));

            // Refresh in background
            loadDashboardData();
        } catch (error) {
            console.error('Approval failed:', error);
            showToast('Failed to approve resolution', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (complaintId) => {
        const remarks = prompt('Enter rejection remarks (required):');
        if (!remarks) return;

        try {
            setProcessingId(complaintId);
            await apiService.wardOfficer.rejectResolution(complaintId, remarks);
            showToast('Resolution rejected', 'info');

            setPendingApprovals(prev => prev.filter(c => c.complaintId !== complaintId));
            loadDashboardData();
        } catch (error) {
            console.error('Rejection failed:', error);
            showToast('Failed to reject resolution', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="ward-dashboard">
            <div className="dashboard-header">
                <h1>Ward Portal</h1>
                <p>Overview of ward activities and pending actions</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-header">
                        <span className="stat-title">Total Complaints</span>
                        <div className="stat-icon">
                            <FileText size={20} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-subtitle">In your ward</div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-header">
                        <span className="stat-title">Pending Action</span>
                        <div className="stat-icon">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="stat-value">{pendingApprovals.length}</div>
                    <div className="stat-subtitle">Need approval</div>
                </div>

                <div className="stat-card green">
                    <div className="stat-header">
                        <span className="stat-title">Resolved</span>
                        <div className="stat-icon">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.resolved}</div>
                    <div className="stat-subtitle">Successfully closed</div>
                </div>

                <div className="stat-card red">
                    <div className="stat-header">
                        <span className="stat-title">SLA Breached</span>
                        <div className="stat-icon">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.breached}</div>
                    <div className="stat-subtitle">Overdue items</div>
                </div>
            </div>

            {/* Approvals Section */}
            <div className="approvals-section">
                <div className="section-header">
                    <h2>
                        <Shield size={24} color="#3b82f6" />
                        Pending Approvals
                    </h2>
                    {pendingApprovals.length > 0 && (
                        <span className="badge-count">{pendingApprovals.length} Pending</span>
                    )}
                </div>

                {pendingApprovals.length > 0 ? (
                    <div className="approval-list">
                        {pendingApprovals.map(complaint => (
                            <div key={complaint.complaintId} className="approval-card">
                                <div className="card-top">
                                    <span className="complaint-id">#{complaint.complaintId}</span>
                                    <span className="dept-badge">{complaint.departmentName || 'General'}</span>
                                </div>

                                <h3 className="card-title">{complaint.title}</h3>
                                <p className="card-desc">{complaint.description}</p>

                                <div className="resolution-box">
                                    <div className="res-label">Resolution Note</div>
                                    <div className="res-text">
                                        {complaint.resolutionRemarks || 'Work completed as per request.'}
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="action-btn btn-view"
                                        onClick={() => navigate(`/ward/complaints/${complaint.complaintId}`)}
                                        disabled={processingId === complaint.complaintId}
                                    >
                                        <Eye size={16} /> View
                                    </button>
                                    <button
                                        className="action-btn btn-reject"
                                        onClick={() => handleReject(complaint.complaintId)}
                                        disabled={processingId === complaint.complaintId}
                                    >
                                        <XCircle size={16} /> Reject
                                    </button>
                                    <button
                                        className="action-btn btn-approve"
                                        onClick={() => handleApprove(complaint.complaintId)}
                                        disabled={processingId === complaint.complaintId}
                                    >
                                        {processingId === complaint.complaintId ? (
                                            <span className="spinner-border spinner-border-sm" />
                                        ) : (
                                            <>
                                                <CheckCircle size={16} /> Approve
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <CheckCircle size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
                        <p>No pending approvals!</p>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>You're all caught up.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WardOfficerDashboard;
