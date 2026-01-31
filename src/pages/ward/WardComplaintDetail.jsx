import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import ComplaintDetailView from '../../components/complaints/ComplaintDetailView';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const WardComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [images, setImages] = useState([]);
    const [statusHistory, setStatusHistory] = useState([]);

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);

            // Try fetching details directly
            try {
                const data = await apiService.complaints.getDetails(id);
                setComplaint(data);

                // Fetch images
                try {
                    const imgs = await apiService.complaints.getImages(id);
                    setImages(Array.isArray(imgs) ? imgs : []);
                } catch (e) {
                    setImages([]);
                }

                // Fetch timeline
                try {
                    // Assuming we can use citizen endpoint or generic endpoint if available
                    // If not, statusHistory might be in complaint object
                    setStatusHistory(data.statusHistory || []);
                } catch (e) {
                    setStatusHistory([]);
                }
            } catch (e) {
                // Fallback to list fetching if detail endpoint fails
                const response = await apiService.wardOfficer.getComplaints();
                const list = Array.isArray(response) ? response : (response.data || response.content || []);
                const found = list.find(c => (c.complaintId || c.id) == id);
                if (found) {
                    setComplaint(found);
                    setImages(found.images || []);
                    setStatusHistory(found.statusHistory || []);
                }
            }
        } catch (error) {
            console.error('Error fetching complaint:', error);
            showToast('Failed to load complaint', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!remarks.trim()) {
            alert('Please provide remarks for approval');
            return;
        }

        try {
            setActionLoading(true);
            // Assuming endpoint structure. If apiService doesn't have it explicitly, use direct api call or generic
            // Looking at pattern: /api/ward-officer/complaints/{id}/approve
            if (apiService.wardOfficer.approveComplaint) {
                await apiService.wardOfficer.approveComplaint(id, remarks);
            } else {
                // Fallback if method missing in service but endpoint exists
                // We'll rely on the assumption that apiService is robust or use axios logic here briefly
                console.warn("Using fallback approval method");
                // Implement fallback if needed or fail
                throw new Error("Approval method not found in service");
            }
            showToast('Complaint approved successfully', 'success');
            navigate('/ward-officer/complaints');
        } catch (error) {
            console.error('Error approving complaint:', error);
            showToast(error.response?.data?.message || 'Failed to approve complaint', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!remarks.trim()) {
            alert('Please provide reason for rejection');
            return;
        }

        try {
            setActionLoading(true);
            if (apiService.wardOfficer.rejectComplaint) {
                await apiService.wardOfficer.rejectComplaint(id, remarks);
            } else {
                throw new Error("Reject method not found in service");
            }
            showToast('Complaint rejected', 'success');
            navigate('/ward-officer/complaints');
        } catch (error) {
            console.error('Error rejecting complaint:', error);
            showToast(error.response?.data?.message || 'Failed to reject complaint', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (!complaint) {
        return (
            <div className="container py-5 text-center">
                <h3>Complaint not found</h3>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/ward-officer/complaints')}>
                    Back to Complaints
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <button className="btn btn-link mb-3 ps-0 text-decoration-none" onClick={() => navigate('/ward-officer/complaints')}>
                <ArrowLeft size={16} className="me-1" /> Back
            </button>

            <ComplaintDetailView
                complaint={complaint}
                images={images}
                statusHistory={statusHistory}
                userRole="WARD_OFFICER"
            >
                {/* Ward Officer Actions */}
                {complaint.status === 'PENDING' && (
                    <div className="card border-0 shadow-sm border-primary border-start border-4">
                        <div className="card-header bg-white fw-bold">
                            Review Complaint
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Remarks *</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter your remarks for approval/rejection..."
                                />
                            </div>
                            <div className="d-flex gap-3">
                                <button
                                    className="btn btn-success flex-grow-1"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : <><CheckCircle size={18} className="me-2" /> Approve</>}
                                </button>
                                <button
                                    className="btn btn-danger flex-grow-1"
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : <><XCircle size={18} className="me-2" /> Reject</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ComplaintDetailView>
        </div>
    );
};

export default WardComplaintDetail;
