import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { StatCard, StatusBadge, PriorityBadge } from '../../components/common';
import CreateComplaintModal from '../../components/citizen/CreateComplaintModal';
import {
    Plus, FileText, Clock, CheckCircle, AlertCircle, TrendingUp,
    ChevronRight, Activity, RefreshCw, MapPin, Bell
} from 'lucide-react';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const userName = localStorage.getItem('name') || 'Citizen';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError('');

            // Try to fetch dashboard data
            try {
                const dashResponse = await apiService.citizen.getDashboard();
                setDashboardData(dashResponse);

                // Get recent complaints from dashboard or fetch separately
                if (dashResponse.recentComplaints) {
                    setRecentComplaints(dashResponse.recentComplaints.slice(0, 5));
                }
            } catch (dashErr) {
                console.warn('Dashboard API not available, fetching complaints directly:', dashErr);

                // Fallback: fetch complaints directly
                const complaintsResponse = await apiService.citizen.getMyComplaints();
                let complaintsData = [];

                if (Array.isArray(complaintsResponse)) {
                    complaintsData = complaintsResponse;
                } else if (complaintsResponse?.content) {
                    complaintsData = complaintsResponse.content;
                } else if (complaintsResponse?.data) {
                    complaintsData = complaintsResponse.data;
                }

                // Calculate stats manually
                const stats = {
                    totalComplaints: complaintsData.length,
                    pendingComplaints: complaintsData.filter(c =>
                        ['SUBMITTED', 'PENDING'].includes(c.status)
                    ).length,
                    inProgressComplaints: complaintsData.filter(c =>
                        ['APPROVED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)
                    ).length,
                    resolvedComplaints: complaintsData.filter(c =>
                        c.status === 'RESOLVED'
                    ).length,
                    closedComplaints: complaintsData.filter(c =>
                        c.status === 'CLOSED'
                    ).length,
                };

                setDashboardData(stats);
                setRecentComplaints(complaintsData.slice(0, 5));
            }

        } catch (err) {
            console.error('Dashboard error:', err);
            setError('Failed to load dashboard data. Please try again.');
            // Set default empty data
            setDashboardData({
                totalComplaints: 0,
                pendingComplaints: 0,
                inProgressComplaints: 0,
                resolvedComplaints: 0,
                closedComplaints: 0
            });
            setRecentComplaints([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    const handleComplaintCreated = () => {
        setShowCreateModal(false);
        fetchDashboardData(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            'SUBMITTED': '#667eea',
            'PENDING': '#667eea',
            'APPROVED': '#8b5cf6',
            'ASSIGNED': '#f59e0b',
            'IN_PROGRESS': '#3b82f6',
            'RESOLVED': '#10b981',
            'CLOSED': '#6b7280'
        };
        return colors[status] || '#667eea';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'SUBMITTED': 'Submitted',
            'PENDING': 'Pending',
            'APPROVED': 'Approved',
            'ASSIGNED': 'Assigned',
            'IN_PROGRESS': 'In Progress',
            'RESOLVED': 'Resolved',
            'CLOSED': 'Closed'
        };
        return labels[status] || status;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    if (loading) {
        return (
            <div className="citizen-dashboard-loading">
                <div className="spinner-large"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    const stats = dashboardData || {
        totalComplaints: 0,
        pendingComplaints: 0,
        inProgressComplaints: 0,
        resolvedComplaints: 0,
        closedComplaints: 0
    };

    return (
        <div className="citizen-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>Welcome back, {userName}! 👋</h1>
                        <p>Here's what's happening with your complaints</p>
                    </div>
                    <div className="header-actions">
                        <button
                            onClick={handleRefresh}
                            className="btn-refresh"
                            disabled={refreshing}
                        >
                            <RefreshCw className={refreshing ? 'spinning' : ''} size={18} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-create"
                        >
                            <Plus size={18} />
                            New Complaint
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-banner">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={handleRefresh}>Retry</button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                <StatCard
                    icon="fas fa-clipboard-list"
                    value={stats.totalComplaints || 0}
                    label="Total Complaints"
                    variant="primary"
                    onClick={() => navigate('/citizen/complaints')}
                />
                <StatCard
                    icon="fas fa-clock"
                    value={stats.pendingComplaints || 0}
                    label="Pending"
                    variant="warning"
                />
                <StatCard
                    icon="fas fa-spinner"
                    value={stats.inProgressComplaints || 0}
                    label="In Progress"
                    variant="info"
                />
                <StatCard
                    icon="fas fa-check-circle"
                    value={stats.resolvedComplaints || 0}
                    label="Resolved"
                    variant="success"
                />
            </div>

            {/* Recent Complaints */}
            <div className="recent-section">
                <div className="section-header">
                    <div>
                        <h2>Recent Complaints</h2>
                        <p>Your latest complaint submissions</p>
                    </div>
                    <button
                        onClick={() => navigate('/citizen/complaints')}
                        className="btn-view-all"
                    >
                        View All
                        <ChevronRight size={16} />
                    </button>
                </div>

                {recentComplaints.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No Complaints Yet</h3>
                        <p>You haven't registered any complaints yet.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-create-first"
                        >
                            <Plus size={18} />
                            Create Your First Complaint
                        </button>
                    </div>
                ) : (
                    <div className="complaints-list">
                        {recentComplaints.map((complaint) => (
                            <div
                                key={complaint.complaintId || complaint.id}
                                className="complaint-card"
                                onClick={() => navigate(`/citizen/complaints/${complaint.complaintId || complaint.id}`)}
                            >
                                <div className="complaint-header">
                                    <div className="complaint-id">
                                        #{complaint.complaintId || complaint.id}
                                    </div>
                                    <span
                                        className="complaint-status"
                                        style={{
                                            backgroundColor: `${getStatusColor(complaint.status)}15`,
                                            color: getStatusColor(complaint.status)
                                        }}
                                    >
                                        {getStatusLabel(complaint.status)}
                                    </span>
                                </div>

                                <h4 className="complaint-title">{complaint.title}</h4>

                                <p className="complaint-description">
                                    {complaint.description?.substring(0, 100)}
                                    {complaint.description?.length > 100 ? '...' : ''}
                                </p>

                                <div className="complaint-meta">
                                    <div className="meta-item">
                                        <MapPin size={14} />
                                        <span>{complaint.location || complaint.wardName || 'N/A'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Clock size={14} />
                                        <span>{formatDate(complaint.createdAt)}</span>
                                    </div>
                                </div>

                                <ChevronRight className="complaint-arrow" size={20} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <button
                        onClick={() => navigate('/citizen/complaints')}
                        className="action-card"
                    >
                        <FileText size={24} />
                        <span>My Complaints</span>
                    </button>
                    <button
                        onClick={() => navigate('/citizen/notifications')}
                        className="action-card"
                    >
                        <Bell size={24} />
                        <span>Notifications</span>
                    </button>
                    <button
                        onClick={() => navigate('/citizen/map')}
                        className="action-card"
                    >
                        <MapPin size={24} />
                        <span>Area Complaints</span>
                    </button>
                    <button
                        onClick={() => navigate('/citizen/profile')}
                        className="action-card"
                    >
                        <Activity size={24} />
                        <span>My Profile</span>
                    </button>
                </div>
            </div>

            {/* Create Complaint Modal */}
            {showCreateModal && (
                <CreateComplaintModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleComplaintCreated}
                />
            )}
        </div>
    );
};

export default CitizenDashboard;
