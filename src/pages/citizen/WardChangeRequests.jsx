/**
 * Ward Change Requests Page (Citizen)
 * Display ward change request history with status tracking
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { WARDS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import './WardChangeRequests.css';

const WardChangeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [selectedWard, setSelectedWard] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await apiService.getMyWardChangeRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching ward change requests:', error);
            showToast('Failed to load ward change requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNewRequest = async () => {
        if (!selectedWard) {
            showToast('Please select a ward', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await apiService.createWardChangeRequest(parseInt(selectedWard));
            showToast('Ward change request submitted successfully', 'success');
            setShowNewRequestModal(false);
            setSelectedWard('');
            fetchRequests();
        } catch (error) {
            console.error('Error creating ward change request:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to submit ward change request';
            showToast(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock size={20} className="status-icon pending" />;
            case 'APPROVED':
                return <CheckCircle size={20} className="status-icon approved" />;
            case 'REJECTED':
                return <XCircle size={20} className="status-icon rejected" />;
            default:
                return <AlertCircle size={20} className="status-icon" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'status-pending';
            case 'APPROVED':
                return 'status-approved';
            case 'REJECTED':
                return 'status-rejected';
            default:
                return '';
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
        <div className="ward-change-requests-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <MapPin size={32} />
                        Ward Change Requests
                    </h1>
                    <p>Track your ward change request status</p>
                </div>
                <button
                    className="btn-new-request"
                    onClick={() => setShowNewRequestModal(true)}
                >
                    <Plus size={20} />
                    New Request
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="no-requests">
                    <MapPin size={64} />
                    <h3>No Ward Change Requests</h3>
                    <p>You haven't submitted any ward change requests yet.</p>
                    <button
                        className="btn-primary"
                        onClick={() => setShowNewRequestModal(true)}
                    >
                        <Plus size={20} />
                        Submit New Request
                    </button>
                </div>
            ) : (
                <div className="requests-list">
                    {requests.map((request) => (
                        <div key={request.requestId} className="request-card">
                            <div className="request-header">
                                <div className="request-status">
                                    {getStatusIcon(request.status)}
                                    <span className={`status-label ${getStatusClass(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>
                                <span className="request-date">
                                    {formatDate(request.requestedAt)}
                                </span>
                            </div>

                            <div className="request-body">
                                <div className="ward-change-info">
                                    <div className="ward-item">
                                        <label>From:</label>
                                        <span className="ward-name old-ward">
                                            {getWardName(request.oldWardNumber)}
                                        </span>
                                    </div>
                                    <div className="arrow">→</div>
                                    <div className="ward-item">
                                        <label>To:</label>
                                        <span className="ward-name new-ward">
                                            {getWardName(request.newWardNumber)}
                                        </span>
                                    </div>
                                </div>

                                {request.status !== 'PENDING' && (
                                    <div className="request-decision">
                                        <div className="decision-info">
                                            <span className="decision-label">
                                                {request.status === 'APPROVED' ? 'Approved by:' : 'Rejected by:'}
                                            </span>
                                            <span className="decision-by">{request.decidedBy || 'Ward Officer'}</span>
                                        </div>
                                        {request.decidedAt && (
                                            <span className="decision-date">
                                                on {formatDate(request.decidedAt)}
                                            </span>
                                        )}
                                        {request.remarks && (
                                            <div className="decision-remarks">
                                                <strong>Remarks:</strong> {request.remarks}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Request Modal */}
            {showNewRequestModal && (
                <div className="modal-overlay" onClick={() => setShowNewRequestModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <MapPin size={24} />
                                Request Ward Change
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowNewRequestModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-description">
                                Select the ward you want to change to. Your request will be reviewed by the ward officer.
                            </p>

                            <div className="form-group">
                                <label htmlFor="wardSelect">Select New Ward *</label>
                                <select
                                    id="wardSelect"
                                    value={selectedWard}
                                    onChange={(e) => setSelectedWard(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">-- Select Ward --</option>
                                    {WARDS.map((ward) => (
                                        <option key={ward.wardId} value={ward.wardId}>
                                            Ward {ward.number} - {ward.area_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowNewRequestModal(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleNewRequest}
                                disabled={submitting || !selectedWard}
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardChangeRequests;
