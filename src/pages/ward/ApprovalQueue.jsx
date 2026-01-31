import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { COMPLAINT_STATUS, DEPARTMENTS } from '../../constants';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';

const ApprovalQueue = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            setLoading(true);
            const data = await apiService.wardOfficer.getPendingApprovals();
            // Handle pagination or array response
            const list = Array.isArray(data) ? data : (data?.content || []);
            setComplaints(list);
        } catch (err) {
            setError('Failed to load pending approvals');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (complaint) => {
        const complaintId = complaint?.complaintId || complaint?.id || complaint?.complaint_id;

        if (!complaintId) {
            alert('Invalid complaint ID');
            return;
        }

        if (!window.confirm(`Approve complaint #${complaintId}?`)) return;

        try {
            setProcessingId(complaintId);
            await apiService.wardOfficer.approveResolution(complaintId, 'Approved by ward officer');
            alert('✅ Complaint approved successfully!');
            fetchPendingApprovals();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve complaint');
            console.error('Approve error:', err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (complaint) => {
        const complaintId = complaint?.complaintId || complaint?.id || complaint?.complaint_id;

        if (!complaintId) {
            alert('Invalid complaint ID');
            return;
        }

        const reason = prompt('Enter rejection reason:');
        if (!reason || reason.trim() === '') return;

        try {
            setProcessingId(complaintId);
            await apiService.wardOfficer.rejectResolution(complaintId, reason);
            alert('❌ Complaint rejected. Officer will be notified.');
            fetchPendingApprovals();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject complaint');
            console.error('Reject error:', err);
        } finally {
            setProcessingId(null);
        }
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
                    <p className="mt-3 text-muted">Loading approvals...</p>
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
                        <Clock size={28} className="me-2 text-warning" />
                        Pending Approvals
                    </h2>
                    <p className="text-muted mb-0">Review and approve resolved complaints</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Approvals List */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Complaints Awaiting Approval ({complaints.length})</h5>
                </div>
                <div className="card-body p-0">
                    {complaints.length === 0 ? (
                        <div className="text-center py-5">
                            <CheckCircle size={48} className="text-success opacity-50 mb-3" />
                            <h5 className="text-muted">No pending approvals</h5>
                            <p className="text-muted mb-0">All resolved complaints have been reviewed</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Department</th>
                                        <th>Officer</th>
                                        <th>Resolved At</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.map((complaint) => {
                                        const complaintId = complaint?.complaintId || complaint?.id || complaint?.complaint_id;
                                        const dept = getDepartmentInfo(complaint.departmentId);
                                        const isProcessing = processingId === complaintId;

                                        return (
                                            <tr key={complaintId || Math.random()}>
                                                <td className="fw-semibold">#{complaintId}</td>
                                                <td>{complaint.title || 'N/A'}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        {dept.icon} {dept.name}
                                                    </span>
                                                </td>
                                                <td>{complaint.assignedOfficer?.name || complaint.officerName || 'N/A'}</td>
                                                <td>{complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'N/A'}</td>
                                                <td>{getStatusBadge(complaint.status)}</td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => handleApprove(complaint)}
                                                            disabled={isProcessing}
                                                            title="Approve"
                                                        >
                                                            {isProcessing ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <CheckCircle size={14} />
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleReject(complaint)}
                                                            disabled={isProcessing}
                                                            title="Reject"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => navigate(`/ward-officer/complaints/${complaintId}`)}
                                                            title="View Details"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
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

            {/* Info Card */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="alert alert-info d-flex align-items-start">
                        <AlertCircle size={24} className="me-3 flex-shrink-0 mt-1" />
                        <div>
                            <h6 className="fw-bold mb-2">Approval Guidelines</h6>
                            <ul className="mb-0 small">
                                <li>Review complaint details and uploaded images before approving</li>
                                <li>Verify that the work has been completed satisfactorily</li>
                                <li>Reject if work is incomplete or unsatisfactory with clear reason</li>
                                <li>Approved complaints will be sent to admin for final closure</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalQueue;
