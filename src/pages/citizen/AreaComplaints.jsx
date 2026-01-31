import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Eye,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    Calendar,
    Building2,
    TrendingUp
} from 'lucide-react';
import apiService from '../../api/apiService';
import './AreaComplaints.css';

const AreaComplaints = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDepartment, setFilterDepartment] = useState('ALL');
    const [departments, setDepartments] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [wardInfo, setWardInfo] = useState(null);

    useEffect(() => {
        loadDepartments();
        fetchComplaints();
    }, [page]);

    const loadDepartments = async () => {
        try {
            const response = await apiService.masterData.getDepartments();
            setDepartments(response.data || []);
        } catch (err) {
            console.error('Failed to load departments:', err);
        }
    };

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await apiService.citizen.getAreaComplaints();
            const data = response.data || response;

            if (Array.isArray(data)) {
                setComplaints(data);
                setTotalPages(1);
                if (data.length > 0) {
                    setWardInfo({
                        wardName: data[0].wardName || 'Your Ward',
                        wardId: data[0].wardId
                    });
                }
            } else {
                setComplaints([]);
            }
        } catch (err) {
            console.error('❌ Failed to fetch ward complaints:', err);
            setError('Failed to load ward complaints. Please try again.');
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'SUBMITTED': { class: 'status-submitted', icon: Clock, text: 'Submitted' },
            'APPROVED': { class: 'status-approved', icon: CheckCircle, text: 'Approved' },
            'ASSIGNED': { class: 'status-assigned', icon: CheckCircle, text: 'Assigned' },
            'IN_PROGRESS': { class: 'status-in-progress', icon: RefreshCw, text: 'In Progress' },
            'RESOLVED': { class: 'status-resolved', icon: CheckCircle, text: 'Resolved' },
            'CLOSED': { class: 'status-closed', icon: CheckCircle, text: 'Closed' },
            'REJECTED': { class: 'status-rejected', icon: AlertCircle, text: 'Rejected' }
        };
        return badges[status] || badges['SUBMITTED'];
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            'LOW': 'priority-low',
            'MEDIUM': 'priority-medium',
            'HIGH': 'priority-high',
            'CRITICAL': 'priority-critical'
        };
        return badges[priority] || 'priority-medium';
    };

    const filterComplaints = () => {
        let filtered = complaints;

        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(c => c.status === filterStatus);
        }

        if (filterDepartment !== 'ALL') {
            filtered = filtered.filter(c => c.department?.departmentId === parseInt(filterDepartment));
        }

        return filtered;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const filteredComplaints = filterComplaints();

    // Calculate statistics
    const stats = {
        total: complaints.length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
        pending: complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'APPROVED').length
    };

    if (loading && page === 0) {
        return (
            <div className="area-complaints-container">
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Loading ward complaints...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="area-complaints-container">
            {/* Header */}
            <div className="complaints-header">
                <div className="header-content">
                    <div className="header-title">
                        <MapPin className="w-8 h-8" />
                        <div>
                            <h1>Area Complaints</h1>
                            <p>View all complaints in {wardInfo?.wardName || 'your ward'}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchComplaints}
                        className="btn-refresh"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="alert-close">×</button>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="statistics-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Complaints</div>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
                <div className="stat-card stat-progress">
                    <div className="stat-icon">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>
                <div className="stat-card stat-resolved">
                    <div className="stat-icon">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.resolved}</div>
                        <div className="stat-label">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filters-header">
                    <Filter className="w-5 h-5" />
                    <span>Filter Complaints</span>
                </div>
                <div className="filter-groups">
                    <div className="filter-group">
                        <label>Status</label>
                        <div className="filter-buttons">
                            <button
                                onClick={() => setFilterStatus('ALL')}
                                className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('SUBMITTED')}
                                className={`filter-btn ${filterStatus === 'SUBMITTED' ? 'active' : ''}`}
                            >
                                Submitted
                            </button>
                            <button
                                onClick={() => setFilterStatus('IN_PROGRESS')}
                                className={`filter-btn ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => setFilterStatus('RESOLVED')}
                                className={`filter-btn ${filterStatus === 'RESOLVED' ? 'active' : ''}`}
                            >
                                Resolved
                            </button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Department</label>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="department-select"
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.departmentId} value={dept.departmentId}>
                                    {dept.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Complaints List */}
            {filteredComplaints.length === 0 ? (
                <div className="empty-state">
                    <MapPin className="w-16 h-16" />
                    <h3>No Complaints Found</h3>
                    <p>
                        {filterStatus === 'ALL' && filterDepartment === 'ALL'
                            ? "No complaints in your ward yet"
                            : "No complaints match your filters"}
                    </p>
                </div>
            ) : (
                <div className="complaints-grid">
                    {filteredComplaints.map((complaint) => {
                        const statusInfo = getStatusBadge(complaint.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={complaint.complaintId} className="complaint-card">
                                {/* Card Header */}
                                <div className="card-header">
                                    <div className="complaint-id">
                                        <span className="id-label">CMP-{complaint.complaintId}</span>
                                        <span className={`priority-badge ${getPriorityBadge(complaint.priority)}`}>
                                            {complaint.priority || 'MEDIUM'}
                                        </span>
                                    </div>
                                    <div className={`status-badge ${statusInfo.class}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        <span>{statusInfo.text}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="card-body">
                                    <h3 className="complaint-title">{complaint.title}</h3>
                                    <p className="complaint-description">
                                        {complaint.description?.length > 120
                                            ? complaint.description.substring(0, 120) + '...'
                                            : complaint.description}
                                    </p>

                                    <div className="complaint-meta">
                                        <div className="meta-item">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(complaint.createdAt)}</span>
                                            <span className="meta-secondary">({getDaysAgo(complaint.createdAt)})</span>
                                        </div>
                                        <div className="meta-item">
                                            <Building2 className="w-4 h-4" />
                                            <span>{complaint.department?.departmentName || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {complaint.citizenName && (
                                        <div className="citizen-info">
                                            <span className="citizen-label">Reported by:</span>
                                            <span className="citizen-name">{complaint.citizenName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="card-footer">
                                    <button
                                        onClick={() => navigate(`/citizen/complaint/${complaint.complaintId}`)}
                                        className="btn-view-details"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1 || loading}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AreaComplaints;
