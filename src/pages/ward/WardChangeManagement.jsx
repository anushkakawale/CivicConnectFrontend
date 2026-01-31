/**
 * Ward Change Management Page (Ward Officer)
 * Approve/reject ward change requests
 */

import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { WARDS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import './WardChangeManagement.css';

const WardChangeManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState({ show: false, request: null, action: null });
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const data = await apiService.wardOfficer.getWardChangeRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            showToast('Failed to load pending requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (request) => {
        setActionModal({ show: true, request, action: 'approve' });
        setRemarks('');
    };

    const handleReject = (request) => {
        setActionModal({ show: true, request, action: 'reject' });
        setRemarks('');
    };

    const handleConfirmAction = async () => {
        if (!remarks.trim()) {
            showToast('Please provide remarks', 'error');
            return;
        }

        try {
            setProcessing(true);
            const { request, action } = actionModal;

            if (action === 'approve') {
                await apiService.wardOfficer.approveWardChange(request.requestId, remarks); // Pass remarks if backend supports
                showToast('Ward change request approved successfully', 'success');
            } else {
                // If reject endpoint exists, use it. Otherwise warn.
                if (apiService.wardOfficer.rejectWardChange) {
                    await apiService.wardOfficer.rejectWardChange(request.requestId, remarks);
                    showToast('Ward change request rejected', 'success');
                } else {
                    throw new Error("Reject functionality not supported by backend yet");
                }
            }

            setActionModal({ show: false, request: null, action: null });
            setRemarks('');
            fetchPendingRequests();
        } catch (error) {
            console.error('Error processing request:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                `Failed to ${actionModal.action} request`;
            showToast(errorMessage, 'error');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getWardName = (wardNumber) => {
        const ward = WARDS.find(w => w.number === wardNumber);
        return ward ? `Ward ${ward.number} - ${ward.area_name}` : `Ward ${wardNumber}`;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="ward-change-management-page">
            <div className="page-header">
                <h1>
                    <MapPin size={32} />
                    Ward Change Requests
                </h1>
                <p>Review and process pending ward change requests</p>
            </div>

            {requests.length === 0 ? (
                <div className="no-requests">
                    <Clock size={64} />
                    <h3>No Pending Requests</h3>
                    <p>All ward change requests have been processed.</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {requests.map((request) => (
                        <div key={request.requestId} className="request-card">
                            <div className="request-header">
                                <div className="citizen-info">
                                    <h3>{request.citizenName}</h3>
                                    <div className="contact-info">
                                        <span>📧 {request.citizenEmail}</span>
                                        <span>📱 {request.citizenMobile}</span>
                                    </div>
                                </div>
                                <span className="request-date">
                                    {formatDate(request.requestedAt)}
                                </span>
                            </div>

                            <div className="ward-change-details">
                                <div className="ward-box from-ward">
                                    <label>Current Ward</label>
                                    <span>{getWardName(request.oldWardNumber)}</span>
                                </div>
                                <div className="arrow">→</div>
                                <div className="ward-box to-ward">
                                    <label>Requested Ward</label>
                                    <span>{getWardName(request.newWardNumber)}</span>
                                </div>
                            </div>

                            <div className="request-actions">
                                <button
                                    className="btn-reject"
                                    onClick={() => handleReject(request)}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                                <button
                                    className="btn-approve"
                                    onClick={() => handleApprove(request)}
                                >
                                    <CheckCircle size={18} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Modal */}
            {actionModal.show && (
                <div className="modal-overlay" onClick={() => setActionModal({ show: false, request: null, action: null })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {actionModal.action === 'approve' ? (
                                    <><CheckCircle size={24} /> Approve Request</>
                                ) : (
                                    <><XCircle size={24} /> Reject Request</>
                                )}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => setActionModal({ show: false, request: null, action: null })}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="request-summary">
                                <p><strong>Citizen:</strong> {actionModal.request?.citizenName}</p>
                                <p><strong>Change:</strong> {getWardName(actionModal.request?.oldWardNumber)} → {getWardName(actionModal.request?.newWardNumber)}</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="remarks">Remarks *</label>
                                <textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder={`Enter remarks for ${actionModal.action === 'approve' ? 'approval' : 'rejection'}...`}
                                    rows={4}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setActionModal({ show: false, request: null, action: null })}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className={actionModal.action === 'approve' ? 'btn-approve' : 'btn-reject'}
                                onClick={handleConfirmAction}
                                disabled={processing || !remarks.trim()}
                            >
                                {processing ? 'Processing...' : actionModal.action === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardChangeManagement;
