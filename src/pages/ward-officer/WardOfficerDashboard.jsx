/**
 * Enhanced Ward Officer Dashboard
 * Professional design with consistent UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import {
    ClipboardList, AlertTriangle, CheckCircle, Clock,
    Users, Activity, ArrowRight, UserPlus
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EnhancedWardOfficerDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [stats, setStats] = useState({
        active: 0,
        closed: 0,
        pendingApprovals: 0,
        wardId: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingApprovals, setPendingApprovals] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Summary Stats
            // Trying to fetch summary stats, if fails, we might calculate from complaints
            let summaryStats = {};
            try {
                summaryStats = await apiService.wardOfficer.getSummaryStats();
            } catch (e) {
                console.warn("Summary stats API not available, falling back to specific calls");
            }

            // 2. Fetch Pending Approvals
            try {
                const approvals = await apiService.wardOfficer.getPendingApprovals();
                const approvalList = Array.isArray(approvals) ? approvals : (approvals.content || []);
                setPendingApprovals(approvalList);
                summaryStats.pendingApprovals = approvalList.length;
            } catch (e) {
                console.warn("Approvals API invalid");
            }

            // 3. Fetch Ward Complaints to calc other stats if needed
            // If summaryAPI returned active/closed, use it. Else calculate.
            if (summaryStats.active === undefined) {
                const complaints = await apiService.wardOfficer.getComplaints();
                const list = Array.isArray(complaints) ? complaints : (complaints.content || []);
                summaryStats.active = list.filter(c => c.status !== 'CLOSED' && c.status !== 'RESOLVED').length;
                summaryStats.closed = list.filter(c => c.status === 'CLOSED').length;
                // If dashboard distinguishes RESOLVED (Waiting Approval) vs CLOSED
            }

            setStats({
                active: summaryStats.active || 0,
                closed: summaryStats.closed || 0,
                pendingApprovals: summaryStats.pendingApprovals || 0
            });
            setError('');

        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h2 className="fw-bold mb-1">
                                <Activity size={28} className="me-2 text-primary" />
                                Ward Dashboard
                            </h2>
                            <p className="text-muted mb-0">Overview of ward performance and operations</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary" onClick={() => navigate('/ward-officer/register-officer')}>
                                <UserPlus size={18} className="me-2" />
                                Add Dept Officer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Quick Stats Cards */}
            <div className="row g-3 mb-4">
                {/* Pending Approvals - Action Card */}
                <div className="col-md-4">
                    <div
                        className="card border-0 shadow-sm hover-lift h-100 bg-warning bg-opacity-10 border-warning border-start border-4"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/ward-officer/approvals')}
                    >
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="text-warning fw-bold mb-0 text-uppercase">Pending Approvals</h6>
                                <AlertTriangle size={24} className="text-warning" />
                            </div>
                            <h2 className="fw-bold mb-1 text-warning display-6">{stats.pendingApprovals}</h2>
                            <small className="text-muted">Complaints waiting for your review</small>
                            <div className="mt-2 text-primary small d-flex align-items-center">
                                Review Now <ArrowRight size={14} className="ms-1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Complaints */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm hover-lift h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="text-secondary fw-bold mb-0 text-uppercase">Active Issues</h6>
                                <Clock size={24} className="text-primary opacity-50" />
                            </div>
                            <h2 className="fw-bold mb-1 text-primary display-6">{stats.active}</h2>
                            <small className="text-muted">Currently open or in-progress</small>
                        </div>
                    </div>
                </div>

                {/* Closed Complaints */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm hover-lift h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="text-secondary fw-bold mb-0 text-uppercase">Closed</h6>
                                <CheckCircle size={24} className="text-success opacity-50" />
                            </div>
                            <h2 className="fw-bold mb-1 text-success display-6">{stats.closed}</h2>
                            <small className="text-muted">Total resolved and closed</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Split: Approvals List & Quick Actions */}
            <div className="row g-4">
                {/* Recent Approvals List */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white py-3 border-bottom">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">Pending Approvals</h5>
                                <button className="btn btn-sm btn-link text-decoration-none" onClick={() => navigate('/ward-officer/approvals')}>View All</button>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {pendingApprovals.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <CheckCircle size={48} className="mb-3 opacity-25" />
                                    <p className="mb-0">No pending approvals. Good job!</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {pendingApprovals.slice(0, 5).map(approval => (
                                        <div key={approval.id} className="list-group-item px-4 py-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-dark">{approval.title}</h6>
                                                    <p className="small text-muted mb-0">
                                                        Resolved by Dept Officer on {approval.updatedAt ? new Date(approval.updatedAt).toLocaleDateString() : 'Recent'}
                                                    </p>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => navigate(`/ward-officer/approvals`)}
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="fw-bold mb-0">Quick Management</h5>
                        </div>
                        <div className="list-group list-group-flush">
                            <button className="list-group-item list-group-item-action py-3 d-flex align-items-center" onClick={() => navigate('/ward-officer/complaints')}>
                                <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary">
                                    <ClipboardList size={20} />
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-semibold">All Ward Complaints</h6>
                                    <small className="text-muted">View and filter all issues</small>
                                </div>
                            </button>
                            <button className="list-group-item list-group-item-action py-3 d-flex align-items-center" onClick={() => navigate('/ward-officer/officers')}>
                                <div className="bg-success bg-opacity-10 p-2 rounded me-3 text-success">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-semibold">Department Officers</h6>
                                    <small className="text-muted">Manage assigned officers</small>
                                </div>
                            </button>
                            <button className="list-group-item list-group-item-action py-3 d-flex align-items-center" onClick={() => navigate('/ward-officer/ward-changes')}>
                                <div className="bg-info bg-opacity-10 p-2 rounded me-3 text-info">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-semibold">Ward Change Requests</h6>
                                    <small className="text-muted">Approve citizen transfers</small>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedWardOfficerDashboard;
