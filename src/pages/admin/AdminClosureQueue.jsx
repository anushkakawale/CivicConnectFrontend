import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import apiService from '../../api/apiService';
import {
    CheckCircle,
    XCircle,
    Clock,
    Image as ImageIcon,
    Eye,
    FileText,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import '../../styles/professional-layout.css';

const AdminClosureQueue = () => {
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [closureRemarks, setClosureRemarks] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getClosureApprovalQueue({ page: 0, size: 50 });
            setQueue(response.data.content || []);
        } catch (error) {
            console.error('Error fetching closure queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseComplaint = async () => {
        if (!selectedComplaint || !closureRemarks.trim()) {
            alert('Please provide closure remarks');
            return;
        }

        try {
            const id = selectedComplaint.complaintId || selectedComplaint.id;
            await apiService.admin.closeComplaint(id, {
                closureRemarks: closureRemarks
            });

            setShowModal(false);
            setSelectedComplaint(null);
            setClosureRemarks('');
            fetchQueue(); // Refresh the queue
        } catch (error) {
            console.error('Error closing complaint:', error);
            alert('Failed to close complaint');
        }
    };

    const getWaitingTimeColor = (days) => {
        if (days < 1) return 'success';
        if (days <= 3) return 'warning';
        return 'danger';
    };

    const headerProps = {
        title: 'Closure Approval Queue',
        subtitle: 'Review and close approved complaints',
        showNotifications: true,
        showProfile: true
    };

    if (loading) {
        return (
            <div className="professional-container">
                <DashboardHeader {...headerProps} />
                <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-40px' }}>
                    <div className="text-center py-5">
                        <RefreshCw className="spin" size={48} />
                        <p className="mt-3">Loading closure queue...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="professional-container position-relative overflow-hidden">
            <div className="tactical-grid-overlay"></div>
            <DashboardHeader {...headerProps} />

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-40px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>
                {/* Stats Section */}
                <div className="grid-section">
                    <div className="grid-header">
                        <h3>QUEUE STATISTICS</h3>
                        <div className="grid-header-actions">
                            <button className="btn-professional" onClick={fetchQueue}>
                                <RefreshCw size={16} /> REFRESH
                            </button>
                        </div>
                    </div>
                    <div className="grid-body">
                        <div className="grid-col-4 grid-col-md-6 grid-col-sm-12">
                            <div className="stat-card info">
                                <div className="stat-value">{queue.length}</div>
                                <div className="stat-label">PENDING CLOSURE</div>
                            </div>
                        </div>
                        <div className="grid-col-4 grid-col-md-6 grid-col-sm-12">
                            <div className="stat-card warning">
                                <div className="stat-value">
                                    {queue.filter(c => c.daysWaitingForClosure > 3).length}
                                </div>
                                <div className="stat-label">WAITING &gt; 3 DAYS</div>
                            </div>
                        </div>
                        <div className="grid-col-4 grid-col-md-6 grid-col-sm-12">
                            <div className="stat-card success">
                                <div className="stat-value">
                                    {queue.filter(c => c.afterImageCount > 0).length}
                                </div>
                                <div className="stat-label">WITH VERIFICATION</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complaints Queue */}
                <div className="grid-section">
                    <div className="grid-header">
                        <h3>COMPLAINTS AWAITING CLOSURE ({queue.length})</h3>
                    </div>

                    {queue.length === 0 ? (
                        <div className="text-center py-5">
                            <CheckCircle size={64} className="text-success mb-3" />
                            <h4>No Complaints Pending Closure</h4>
                            <p className="text-muted">All approved complaints have been closed.</p>
                        </div>
                    ) : (
                        <div className="grid-body">
                            {queue.map((complaint) => (
                                <div key={complaint.complaintId || complaint.id} className="grid-col-12">
                                    <div className="professional-card with-accent mb-3">
                                        <div className="card-header-line">
                                            <div>
                                                <h5 className="mb-1">
                                                    COMPLAINT #{complaint.complaintId || complaint.id}
                                                </h5>
                                                <span className="badge-professional info">
                                                    {complaint.priority}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2 align-items-center">
                                                <span className={`badge-professional ${getWaitingTimeColor(complaint.daysWaitingForClosure)}`}>
                                                    <Clock size={12} /> {complaint.daysWaitingForClosure} days waiting
                                                </span>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="form-group-line">
                                                    <label>TITLE</label>
                                                    <p className="fw-bold mb-0">{complaint.title}</p>
                                                </div>

                                                <div className="form-group-line">
                                                    <label>LOCATION</label>
                                                    <p className="mb-0">
                                                        {complaint.wardName} - {complaint.departmentName}
                                                    </p>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group-line">
                                                            <label>CITIZEN</label>
                                                            <p className="mb-0">{complaint.citizenName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group-line">
                                                            <label>ASSIGNED OFFICER</label>
                                                            <p className="mb-0">{complaint.assignedOfficerName}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="form-group-line">
                                                    <label>APPROVAL REMARKS</label>
                                                    <p className="mb-0 fst-italic">
                                                        "{complaint.approvalRemarks}"
                                                    </p>
                                                    <small className="text-muted">
                                                        - Approved by {complaint.approvedByName}
                                                    </small>
                                                </div>

                                                <div className="form-group-line">
                                                    <label>RESOLUTION REMARKS</label>
                                                    <p className="mb-0 fst-italic">
                                                        "{complaint.resolutionRemarks}"
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="professional-card" style={{ background: '#f8fafc' }}>
                                                    <div className="form-group-line">
                                                        <label>IMAGES</label>
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <div className="text-center">
                                                                <ImageIcon size={24} className="text-muted mb-1" />
                                                                <div className="fw-bold">{complaint.beforeImageCount}</div>
                                                                <small className="text-muted">Before</small>
                                                            </div>
                                                            <div className="text-center">
                                                                <ImageIcon size={24} className="text-success mb-1" />
                                                                <div className="fw-bold">{complaint.afterImageCount}</div>
                                                                <small className="text-muted">After</small>
                                                            </div>
                                                            {complaint.afterImageCount > 0 && (
                                                                <CheckCircle size={20} className="text-success" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="form-group-line">
                                                        <label>TIMELINE</label>
                                                        <div className="small">
                                                            <div className="mb-1">
                                                                <strong>Created:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                                                            </div>
                                                            <div className="mb-1">
                                                                <strong>Resolved:</strong> {new Date(complaint.resolvedAt).toLocaleDateString()}
                                                            </div>
                                                            <div className="mb-1">
                                                                <strong>Approved:</strong> {new Date(complaint.approvedAt).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-success fw-bold">
                                                                Resolved in {complaint.daysToResolve} days
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex gap-2 mt-3">
                                                        <button
                                                            className="btn-professional outline flex-fill"
                                                            onClick={() => navigate(`/admin/complaints/${complaint.complaintId || complaint.id}`)}
                                                        >
                                                            <Eye size={16} /> VIEW
                                                        </button>
                                                        <button
                                                            className="btn-professional flex-fill"
                                                            onClick={() => {
                                                                setSelectedComplaint(complaint);
                                                                setShowModal(true);
                                                            }}
                                                        >
                                                            <CheckCircle size={16} /> CLOSE
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Closure Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #173470 0%, #2a4a8f 100%)', color: 'white' }}>
                                <h5 className="modal-title fw-black">
                                    <FileText size={20} className="me-2" />
                                    CLOSE COMPLAINT #{selectedComplaint?.complaintId || selectedComplaint?.id}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedComplaint(null);
                                        setClosureRemarks('');
                                    }}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info d-flex align-items-start">
                                    <AlertCircle size={20} className="me-2 mt-1" />
                                    <div>
                                        <strong>Final Step:</strong> This will permanently close the complaint.
                                        Please provide final closure remarks.
                                    </div>
                                </div>

                                <div className="form-group-line">
                                    <label>CLOSURE REMARKS *</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={closureRemarks}
                                        onChange={(e) => setClosureRemarks(e.target.value)}
                                        placeholder="Enter final closure remarks..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn-professional outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedComplaint(null);
                                        setClosureRemarks('');
                                    }}
                                >
                                    <XCircle size={16} /> CANCEL
                                </button>
                                <button
                                    className="btn-professional"
                                    onClick={handleCloseComplaint}
                                    disabled={!closureRemarks.trim()}
                                >
                                    <CheckCircle size={16} /> CLOSE COMPLAINT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .tactical-grid-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        linear-gradient(rgba(23, 52, 112, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(23, 52, 112, 0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                    z-index: 0;
                }

                .vertical-divider-guide {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to bottom, transparent, rgba(23, 52, 112, 0.03), transparent);
                    pointer-events: none;
                    z-index: -1;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .fw-black { font-weight: 900; }
            `}} />
        </div>
    );
};

export default AdminClosureQueue;
