import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../api/axios';

export default function AdminComplaints() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const userName = localStorage.getItem("email") || "Admin";

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || 'ALL',
        ward: searchParams.get('ward') || 'ALL',
        department: searchParams.get('department') || 'ALL',
        sla: searchParams.get('sla') || 'ALL',
        search: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'complaintId', direction: 'desc' });

    useEffect(() => {
        fetchComplaints();
    }, [filters, sortConfig]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/complaints');
            // Handle paginated response
            const complaintsData = response.data.content || response.data || [];
            setComplaints(complaintsData);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'ALL') params.set(k, v);
        });
        setSearchParams(params);
    };

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'SUBMITTED': 'submitted',
            'ASSIGNED': 'assigned',
            'IN_PROGRESS': 'in-progress',
            'RESOLVED': 'resolved',
            'CLOSED': 'closed',
            'REJECTED': 'rejected'
        };
        return `gov-badge ${statusMap[status] || ''}`;
    };

    const getSLAClass = (slaStatus) => {
        const slaMap = {
            'SAFE': 'safe',
            'WARNING': 'warning',
            'DANGER': 'danger',
            'BREACHED': 'breached',
            'COMPLETED': 'safe'
        };
        return `gov-sla ${slaMap[slaStatus] || ''}`;
    };

    const filteredComplaints = complaints.filter(complaint => {
        if (filters.search && !complaint.title.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        return true;
    });

    const sortedComplaints = [...filteredComplaints].sort((a, b) => {
        if (sortConfig.key) {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    return (
        <PageLayout role="ADMIN" userName={userName}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Complaint Management</h2>
                <p style={{ color: 'var(--gov-text-light)', marginBottom: 0 }}>
                    View, filter, and manage all complaints
                </p>
            </div>

            {/* Filters */}
            <div className="gov-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {/* Search */}
                    <div className="gov-form-group" style={{ marginBottom: 0 }}>
                        <label className="gov-label">Search</label>
                        <input
                            type="text"
                            className="gov-input"
                            placeholder="Search by title..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="gov-form-group" style={{ marginBottom: 0 }}>
                        <label className="gov-label">Status</label>
                        <select
                            className="gov-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Ward Filter */}
                    <div className="gov-form-group" style={{ marginBottom: 0 }}>
                        <label className="gov-label">Ward</label>
                        <select
                            className="gov-select"
                            value={filters.ward}
                            onChange={(e) => handleFilterChange('ward', e.target.value)}
                        >
                            <option value="ALL">All Wards</option>
                            <option value="Ward 1">Ward 1</option>
                            <option value="Ward 2">Ward 2</option>
                            <option value="Ward 3">Ward 3</option>
                            <option value="Ward 5">Ward 5</option>
                            <option value="Ward 7">Ward 7</option>
                        </select>
                    </div>

                    {/* Department Filter */}
                    <div className="gov-form-group" style={{ marginBottom: 0 }}>
                        <label className="gov-label">Department</label>
                        <select
                            className="gov-select"
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                        >
                            <option value="ALL">All Departments</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Sanitation">Sanitation</option>
                            <option value="Roads">Roads</option>
                            <option value="Water">Water</option>
                            <option value="Drainage">Drainage</option>
                        </select>
                    </div>

                    {/* SLA Filter */}
                    <div className="gov-form-group" style={{ marginBottom: 0 }}>
                        <label className="gov-label">SLA Status</label>
                        <select
                            className="gov-select"
                            value={filters.sla}
                            onChange={(e) => handleFilterChange('sla', e.target.value)}
                        >
                            <option value="ALL">All SLA</option>
                            <option value="SAFE">Safe</option>
                            <option value="WARNING">Warning</option>
                            <option value="BREACHED">Breached</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="gov-table">
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="spinner-border text-primary" role="status"></div>
                        <p style={{ marginTop: '1rem', color: 'var(--gov-text-light)' }}>Loading complaints...</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('complaintId')} style={{ cursor: 'pointer' }}>
                                    ID {sortConfig.key === 'complaintId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                                    Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Ward</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>SLA</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gov-text-light)' }}>
                                        No complaints found
                                    </td>
                                </tr>
                            ) : (
                                sortedComplaints.map((complaint) => (
                                    <tr
                                        key={complaint.complaintId}
                                        className={complaint.slaStatus === 'BREACHED' ? 'sla-breached' : ''}
                                    >
                                        <td style={{ fontWeight: 600 }}>#{complaint.complaintId}</td>
                                        <td>{complaint.title}</td>
                                        <td>
                                            {/* Handle both string and object formats for Ward */}
                                            {complaint.wardName ||
                                                complaint.ward?.areaName ||
                                                complaint.ward?.wardName ||
                                                (typeof complaint.ward === 'string' ? complaint.ward : 'N/A')}
                                        </td>
                                        <td>
                                            {/* Handle both string and object formats for Department */}
                                            {complaint.departmentName ||
                                                complaint.department?.departmentName ||
                                                (typeof complaint.department === 'string' ? complaint.department : 'N/A')}
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(complaint.status)}>
                                                {complaint.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={getSLAClass(complaint.slaStatus || 'SAFE')}>
                                                {complaint.slaRemaining || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="gov-btn gov-btn-outline"
                                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                                    onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                    View
                                                </button>
                                                {complaint.status === 'RESOLVED' && (
                                                    <button
                                                        className="gov-btn gov-btn-secondary"
                                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                                        onClick={() => {/* Handle close */ }}
                                                    >
                                                        <i className="bi bi-check-circle"></i>
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Info */}
            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--gov-text-light)', fontSize: '0.875rem' }}>
                Showing {sortedComplaints.length} complaint(s)
            </div>
        </PageLayout>
    );
}
