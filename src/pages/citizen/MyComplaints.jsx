import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Eye,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    MapPin,
    Calendar,
    Image as ImageIcon
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common';
import apiService from '../../api/apiService';
import './MyComplaints.css';

const MyComplaints = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchComplaints();
    }, [page]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('🔄 Fetching my complaints...');

            const response = await apiService.citizen.getMyComplaints({ page, size: 10 });
            console.log('✅ Complaints Request Complete. Response:', response);

            // Backend returns a Page object: { content: [], pageable: {}, totalPages: ... }
            // axios interceptor might return response.data directly
            const data = response.data || response;

            if (data && Array.isArray(data.content)) {
                setComplaints(data.content);
                setTotalPages(data.totalPages || 0);
            } else if (Array.isArray(data)) {
                // Fallback for list
                setComplaints(data);
                setTotalPages(1);
            } else {
                console.warn('⚠️ Unexpected response format:', data);
                setComplaints([]);
            }
        } catch (err) {
            console.error('❌ Failed to fetch complaints:', err);
            setError('Failed to load complaints. Please try again.');
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };



    const filterComplaints = () => {
        if (filterStatus === 'ALL') return complaints;
        return complaints.filter(c => c.status === filterStatus);
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

    if (loading && page === 0) {
        return (
            <div className="my-complaints-container">
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Loading your complaints...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-complaints-container">
            {/* Header */}
            <div className="complaints-header">
                <div className="header-content">
                    <div className="header-title">
                        <FileText className="w-8 h-8" />
                        <div>
                            <h1>My Complaints</h1>
                            <p>Track and manage all your submitted complaints</p>
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

            {/* Filters */}
            <div className="filters-section">
                <div className="filters-header">
                    <Filter className="w-5 h-5" />
                    <span>Filter by Status</span>
                </div>
                <div className="filter-buttons">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                    >
                        All ({complaints.length})
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
                    <button
                        onClick={() => setFilterStatus('CLOSED')}
                        className={`filter-btn ${filterStatus === 'CLOSED' ? 'active' : ''}`}
                    >
                        Closed
                    </button>
                </div>
            </div>

            {/* Complaints List */}
            {filteredComplaints.length === 0 ? (
                <div className="empty-state">
                    <FileText className="w-16 h-16" />
                    <h3>No Complaints Found</h3>
                    <p>
                        {filterStatus === 'ALL'
                            ? "You haven't submitted any complaints yet"
                            : `No ${filterStatus.toLowerCase()} complaints`}
                    </p>
                    <button
                        onClick={() => navigate('/citizen/register-complaint')}
                        className="btn-primary"
                    >
                        Register New Complaint
                    </button>
                </div>
            ) : (
                <div className="complaints-grid">
                    {filteredComplaints.map((complaint) => {
                        return (
                            <div key={complaint.complaintId} className="complaint-card">
                                {/* Card Header */}
                                <div className="card-header">
                                    <div className="complaint-id">
                                        <span className="id-label">CMP-{complaint.complaintId}</span>
                                        <PriorityBadge priority={complaint.priority} />
                                    </div>
                                    <StatusBadge status={complaint.status} />
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
                                            <MapPin className="w-4 h-4" />
                                            <span>{complaint.wardName || 'Ward Area'}</span>
                                        </div>
                                        {complaint.imageCount > 0 && (
                                            <div className="meta-item">
                                                <ImageIcon className="w-4 h-4" />
                                                <span>{complaint.imageCount} {complaint.imageCount === 1 ? 'image' : 'images'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {complaint.departmentName && (
                                        <div className="complaint-category">
                                            <span className="department-badge">
                                                {complaint.departmentName}
                                            </span>
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

            {/* Statistics */}
            {complaints.length > 0 && (
                <div className="statistics-section">
                    <div className="stat-card">
                        <div className="stat-value">{complaints.length}</div>
                        <div className="stat-label">Shown on Page</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {complaints.filter(c => c.status === 'IN_PROGRESS').length}
                        </div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length}
                        </div>
                        <div className="stat-label">Resolved</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'APPROVED').length}
                        </div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyComplaints;
