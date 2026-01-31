import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/ToastProvider';

export default function WardOfficerComplaints() {
    const navigate = useNavigate();
    const toast = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [action, setAction] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await apiService.wardOfficer.getComplaints();
            setComplaints(response.data || []);
        } catch (error) {
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!remarks.trim()) {
            toast.warning('Please enter remarks');
            return;
        }

        try {
            if (action === 'approve') {
                await apiService.wardOfficer.approve(selectedComplaint.complaintId, { remarks });
                toast.success('Complaint approved successfully');
            } else {
                await apiService.wardOfficer.reject(selectedComplaint.complaintId, { remarks });
                toast.success('Complaint rejected successfully');
            }
            setShowModal(false);
            setRemarks('');
            fetchComplaints();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const filteredComplaints = complaints.filter(c => filter === 'ALL' || c.status === filter);

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom, #f8f9fc 0%, #e9ecef 100%)' }}>
            {/* Navbar */}
            <nav className="navbar navbar-dark shadow-sm" style={{ background: 'linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)' }}>
                <div className="container-fluid px-4">
                    <span className="navbar-brand fw-bold">
                        <i className="bi bi-building me-2"></i>Ward Officer Portal
                    </span>
                    <button onClick={() => navigate('/ward-officer')} className="btn btn-light btn-sm">
                        <i className="bi bi-house me-2"></i>Dashboard
                    </button>
                </div>
            </nav>

            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="fw-bold">Manage Complaints</h2>
                        <p className="text-muted">Review and approve/reject complaints</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="btn-group">
                            {['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS'].map(status => (
                                <button
                                    key={status}
                                    className={`btn ${filter === status ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Complaints Table */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredComplaints.map(complaint => (
                                        <tr key={complaint.complaintId}>
                                            <td>#{complaint.complaintId}</td>
                                            <td>{complaint.title}</td>
                                            <td>{complaint.departmentName}</td>
                                            <td><StatusBadge status={complaint.status} /></td>
                                            <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {complaint.status === 'SUBMITTED' && (
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => {
                                                                setSelectedComplaint(complaint);
                                                                setAction('approve');
                                                                setShowModal(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-check"></i> Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => {
                                                                setSelectedComplaint(complaint);
                                                                setAction('reject');
                                                                setShowModal(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-x"></i> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    {action === 'approve' ? 'Approve' : 'Reject'} Complaint
                                </h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Complaint:</strong> {selectedComplaint?.title}</p>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Remarks *</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter your remarks..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button
                                    className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                    onClick={handleAction}
                                >
                                    Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
