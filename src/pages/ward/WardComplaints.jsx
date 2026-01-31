import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import wardOfficerService from '../../services/wardOfficerService';
import { COMPLAINT_STATUS, DEPARTMENTS } from '../../constants';
import { FileText, Eye, Filter } from 'lucide-react';

const WardComplaints = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDepartment, setFilterDepartment] = useState('ALL');

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filterStatus, filterDepartment, complaints]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const data = await wardOfficerService.getWardComplaints();
            setComplaints(Array.isArray(data) ? data : (data?.content || []));
        } catch (err) {
            setError('Failed to load complaints');
            console.error(err);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...complaints];

        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(c => c.status === filterStatus);
        }

        if (filterDepartment !== 'ALL') {
            filtered = filtered.filter(c => c.departmentId === parseInt(filterDepartment));
        }

        setFilteredComplaints(filtered);
    };

    const getDepartmentInfo = (departmentId) => {
        const dept = DEPARTMENTS.find(d => d.department_id === parseInt(departmentId));
        return dept || { name: 'General', icon: '📋' };
    };

    const getStatusBadge = (status) => {
        const statusInfo = COMPLAINT_STATUS[status] || { label: status, color: 'secondary', icon: '📋' };
        return (
            <span className={`badge bg-${statusInfo.color}`}>
                <span className="me-1">{statusInfo.icon}</span>
                {statusInfo.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading complaints...</p>
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
                        <FileText size={28} className="me-2 text-primary" />
                        Ward Complaints
                    </h2>
                    <p className="text-muted mb-0">All complaints in your ward</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Filters */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">
                                <Filter size={16} className="me-1" />
                                Filter by Status
                            </label>
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="APPROVED">Approved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Filter by Department</label>
                            <select
                                className="form-select"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <option value="ALL">All Departments</option>
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                        {dept.icon} {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <div className="text-muted">
                                Showing <strong>{filteredComplaints.length}</strong> of <strong>{complaints.length}</strong> complaints
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Complaints List</h5>
                </div>
                <div className="card-body p-0">
                    {filteredComplaints.length === 0 ? (
                        <div className="text-center py-5">
                            <FileText size={48} className="text-muted opacity-50 mb-3" />
                            <h5 className="text-muted">No complaints found</h5>
                            <p className="text-muted mb-0">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Officer</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredComplaints.map((complaint) => {
                                        const complaintId = complaint?.complaintId || complaint?.id || complaint?.complaint_id;
                                        const deptId = complaint?.departmentId || complaint?.department_id || complaint?.department?.id;
                                        const dept = getDepartmentInfo(deptId);
                                        const officerName = complaint.assignedOfficer?.name || complaint.officerName || 'Unassigned';

                                        return (
                                            <tr key={complaintId || Math.random()}>
                                                <td className="fw-semibold">#{complaintId}</td>
                                                <td>{complaint.title || 'N/A'}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        {dept.icon} {dept.name}
                                                    </span>
                                                </td>
                                                <td>{getStatusBadge(complaint.status)}</td>
                                                <td>{officerName}</td>
                                                <td>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate(`/ward-officer/complaints/${complaintId}`)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} className="me-1" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WardComplaints;
