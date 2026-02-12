import React, { useState, useEffect } from 'react';
import { MapPin, Send, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import apiService from '../../api/apiService';
import './WardChangeRequest.css';

const WardChangeRequest = ({ currentWard, onSuccess }) => {
    const [wards, setWards] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        newWardId: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoadingRequests(true);
            const [wardsData, requestsData] = await Promise.all([
                apiService.common.getWards(),
                apiService.wardChange.getMyRequests()
            ]);
            const wardsDataList = Array.isArray(wardsData) ? wardsData : (wardsData.data || []);
            setWards(wardsDataList || []);
            setMyRequests(requestsData || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!formData.newWardId) {
            setError('Please select a new ward');
            return;
        }

        if (formData.newWardId === currentWard.wardId.toString()) {
            setError('Please select a different ward from your current ward');
            return;
        }

        if (!formData.reason.trim() || formData.reason.trim().length < 20) {
            setError('Please provide a detailed reason (minimum 20 characters)');
            return;
        }

        try {
            setLoading(true);
            await apiService.wardChange.requestWardChange(
                formData.newWardId,
                formData.reason
            );

            setSuccess(true);
            setFormData({ newWardId: '', reason: '' });
            setShowForm(false);

            // Reload requests
            await loadData();

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'PENDING': { class: 'status-pending', icon: Clock, text: 'Pending Review' },
            'WARD_OFFICER_APPROVED': { class: 'status-ward-approved', icon: CheckCircle, text: 'Ward Officer Approved' },
            'APPROVED': { class: 'status-approved', icon: CheckCircle, text: 'Approved' },
            'REJECTED': { class: 'status-rejected', icon: AlertCircle, text: 'Rejected' }
        };
        return badges[status] || badges['PENDING'];
    };

    const hasPendingRequest = myRequests.some(req =>
        req.status === 'PENDING' || req.status === 'WARD_OFFICER_APPROVED'
    );

    return (
        <div className="ward-change-container">
            <div className="ward-change-header">
                <div className="header-icon">
                    <MapPin className="w-6 h-6" />
                </div>
                <div>
                    <h2>Ward Change Request</h2>
                    <p>Request to change your registered ward</p>
                </div>
            </div>

            {/* Current Ward Display */}
            <div className="current-ward-section">
                <div className="current-ward-card">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                        <span className="label">Current Ward</span>
                        <span className="value">{currentWard.wardName}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <CheckCircle className="w-5 h-5" />
                    <span>Ward change request submitted successfully!</span>
                </div>
            )}

            {/* My Requests Section */}
            {loadingRequests ? (
                <div className="loading-section">
                    <div className="spinner-large"></div>
                    <p>Loading your requests...</p>
                </div>
            ) : myRequests.length > 0 ? (
                <div className="requests-section">
                    <h3>Your Ward Change Requests</h3>
                    <div className="requests-list">
                        {myRequests.map((request) => {
                            const statusInfo = getStatusBadge(request.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={request.requestId} className="request-card">
                                    <div className="request-header">
                                        <div className="request-info">
                                            <span className="request-id">Request #{request.requestId}</span>
                                            <span className="request-date">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={`status-badge ${statusInfo.class}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            <span>{statusInfo.text}</span>
                                        </div>
                                    </div>

                                    <div className="request-details">
                                        <div className="detail-row">
                                            <span className="detail-label">From Ward:</span>
                                            <span className="detail-value">{request.currentWard?.wardName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">To Ward:</span>
                                            <span className="detail-value">{request.newWard?.wardName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Reason:</span>
                                            <p className="detail-description">{request.reason}</p>
                                        </div>

                                        {request.wardOfficerRemarks && (
                                            <div className="remarks-section">
                                                <h5>Ward Officer Remarks:</h5>
                                                <p>{request.wardOfficerRemarks}</p>
                                            </div>
                                        )}

                                        {request.adminRemarks && (
                                            <div className="remarks-section">
                                                <h5>Admin Remarks:</h5>
                                                <p>{request.adminRemarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {/* New Request Form */}
            {!showForm ? (
                <div className="new-request-section">
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-new-request"
                        disabled={hasPendingRequest}
                    >
                        <Send className="w-5 h-5" />
                        {hasPendingRequest
                            ? 'You have a pending request'
                            : 'Submit New Ward Change Request'}
                    </button>
                    {hasPendingRequest && (
                        <p className="info-text">
                            You cannot submit a new request while you have a pending request
                        </p>
                    )}
                </div>
            ) : (
                <div className="form-section">
                    <h3>New Ward Change Request</h3>

                    <form onSubmit={handleSubmit} className="ward-change-form">
                        <div className="form-group">
                            <label htmlFor="newWard">
                                Select New Ward <span className="required">*</span>
                            </label>
                            <select
                                id="newWard"
                                value={formData.newWardId}
                                onChange={(e) => setFormData({ ...formData, newWardId: e.target.value })}
                                disabled={loading}
                                required
                                className="ward-select"
                            >
                                <option value="">Choose a ward</option>
                                {wards
                                    .filter(ward => ward.wardId !== currentWard.wardId)
                                    .map(ward => (
                                        <option key={ward.wardId} value={ward.wardId}>
                                            {ward.wardName} - {ward.areaName}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="reason">
                                Reason for Ward Change <span className="required">*</span>
                            </label>
                            <textarea
                                id="reason"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Please provide a detailed explanation for why you need to change your ward. For example: relocation, change of residence, etc."
                                rows="5"
                                disabled={loading}
                                required
                                minLength={20}
                                className="reason-textarea"
                            />
                            <p className="input-hint">
                                Minimum 20 characters. Be specific about your reason.
                            </p>
                            <p className="char-count">
                                {formData.reason.length} / 500 characters
                            </p>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData({ newWardId: '', reason: '' });
                                    setError('');
                                }}
                                className="btn-cancel"
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Info Box */}
            <div className="info-box">
                <h4>📋 Request Process</h4>
                <div className="process-steps">
                    <div className="process-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h5>Submit Request</h5>
                            <p>Provide your reason for ward change</p>
                        </div>
                    </div>
                    <div className="process-arrow">→</div>
                    <div className="process-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h5>Ward Officer Review</h5>
                            <p>Current ward officer reviews your request</p>
                        </div>
                    </div>
                    <div className="process-arrow">→</div>
                    <div className="process-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h5>Admin Approval</h5>
                            <p>Admin makes final decision</p>
                        </div>
                    </div>
                    <div className="process-arrow">→</div>
                    <div className="process-step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h5>Ward Updated</h5>
                            <p>Your ward is changed if approved</p>
                        </div>
                    </div>
                </div>

                <div className="info-notes">
                    <h5>Important Notes:</h5>
                    <ul>
                        <li>Only one pending request allowed at a time</li>
                        <li>Provide genuine and detailed reasons</li>
                        <li>Processing time: 3-5 business days</li>
                        <li>You'll be notified of any status changes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WardChangeRequest;
