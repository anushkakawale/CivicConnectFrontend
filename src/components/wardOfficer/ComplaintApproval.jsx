import React, { useState } from 'react';
import {
    CheckCircle,
    XCircle,
    User,
    AlertCircle,
    MessageSquare,
    Send,
    ArrowRight
} from 'lucide-react';
import apiService from '../../api/apiService';
import './ComplaintApproval.css';

const ComplaintApproval = ({ complaint, onApprove, onReject, onClose }) => {
    const [action, setAction] = useState(null); // 'approve' or 'reject'
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [officers, setOfficers] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingOfficers, setLoadingOfficers] = useState(false);

    // Load department officers when approving
    const handleApproveClick = async () => {
        setAction('approve');
        setError('');

        try {
            setLoadingOfficers(true);
            const officersList = await apiService.wardOfficer.getDepartmentOfficers(
                complaint.department.departmentId
            );
            setOfficers(officersList || []);
        } catch (err) {
            setError('Failed to load officers. Please try again.');
            console.error('Error loading officers:', err);
        } finally {
            setLoadingOfficers(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (action === 'approve' && !selectedOfficer) {
            setError('Please select an officer to assign');
            return;
        }

        if (action === 'reject' && !remarks.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        try {
            setLoading(true);

            if (action === 'approve') {
                await apiService.wardOfficer.approveComplaint(
                    complaint.complaintId,
                    selectedOfficer,
                    remarks
                );
                if (onApprove) onApprove(complaint.complaintId);
            } else {
                await apiService.wardOfficer.rejectComplaint(
                    complaint.complaintId,
                    remarks
                );
                if (onReject) onReject(complaint.complaintId);
            }

            if (onClose) onClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${action} complaint`);
        } finally {
            setLoading(false);
        }
    };

    if (!action) {
        return (
            <div className="complaint-approval-container">
                <div className="approval-header">
                    <h2>Review Complaint</h2>
                    <p>Choose an action for this complaint</p>
                </div>

                {/* Complaint Details */}
                <div className="complaint-details-card">
                    <div className="detail-row">
                        <span className="label">Complaint ID</span>
                        <span className="value">CMP-{complaint.complaintId}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Title</span>
                        <span className="value">{complaint.title}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Department</span>
                        <span className="value">{complaint.department.departmentName}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Priority</span>
                        <span className={`priority-badge priority-${complaint.priority?.toLowerCase()}`}>
                            {complaint.priority}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Description</span>
                        <p className="description">{complaint.description}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-selection">
                    <button
                        onClick={handleApproveClick}
                        className="action-btn approve-btn"
                        disabled={loadingOfficers}
                    >
                        <CheckCircle className="w-6 h-6" />
                        <div className="btn-content">
                            <h3>Approve & Assign</h3>
                            <p>Assign to department officer</p>
                        </div>
                        <ArrowRight className="w-5 h-5 arrow-icon" />
                    </button>

                    <button
                        onClick={() => setAction('reject')}
                        className="action-btn reject-btn"
                    >
                        <XCircle className="w-6 h-6" />
                        <div className="btn-content">
                            <h3>Reject</h3>
                            <p>Send back with reason</p>
                        </div>
                        <ArrowRight className="w-5 h-5 arrow-icon" />
                    </button>
                </div>

                {loadingOfficers && (
                    <div className="loading-message">
                        <div className="spinner"></div>
                        <span>Loading officers...</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="complaint-approval-container">
            <div className={`approval-header ${action === 'approve' ? 'approve-header' : 'reject-header'}`}>
                <div className="header-icon">
                    {action === 'approve' ? (
                        <CheckCircle className="w-6 h-6" />
                    ) : (
                        <XCircle className="w-6 h-6" />
                    )}
                </div>
                <div>
                    <h2>{action === 'approve' ? 'Approve Complaint' : 'Reject Complaint'}</h2>
                    <p>CMP-{complaint.complaintId} - {complaint.title}</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="approval-form">
                {action === 'approve' && (
                    <div className="form-group">
                        <label htmlFor="officer">
                            Assign to Officer <span className="required">*</span>
                        </label>
                        <select
                            id="officer"
                            value={selectedOfficer}
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                            disabled={loading}
                            required
                            className="officer-select"
                        >
                            <option value="">Select Department Officer</option>
                            {officers.map((officer) => (
                                <option key={officer.userId} value={officer.userId}>
                                    {officer.name} - {officer.department?.departmentName}
                                    {officer.assignedComplaints > 0 && ` (${officer.assignedComplaints} active)`}
                                </option>
                            ))}
                        </select>
                        {officers.length === 0 && !loadingOfficers && (
                            <p className="warning-hint">
                                No officers available in this department
                            </p>
                        )}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="remarks">
                        {action === 'approve' ? 'Remarks (Optional)' : 'Reason for Rejection *'}
                    </label>
                    <textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder={
                            action === 'approve'
                                ? 'Add any instructions or notes for the officer...'
                                : 'Explain why this complaint is being rejected...'
                        }
                        rows="4"
                        disabled={loading}
                        required={action === 'reject'}
                        className="remarks-textarea"
                    />
                    <p className="input-hint">
                        {action === 'approve'
                            ? 'These notes will be visible to the assigned officer'
                            : 'This reason will be sent to the citizen'}
                    </p>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => {
                            setAction(null);
                            setSelectedOfficer('');
                            setRemarks('');
                            setError('');
                        }}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Back
                    </button>

                    <button
                        type="submit"
                        className={action === 'approve' ? 'btn-approve' : 'btn-reject'}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                {action === 'approve' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Approve & Assign
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Rejection
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Info Box */}
            <div className={`info-box ${action === 'approve' ? 'info-approve' : 'info-reject'}`}>
                <h4>
                    {action === 'approve' ? '✓ What happens next?' : '⚠️ Important'}
                </h4>
                <ul>
                    {action === 'approve' ? (
                        <>
                            <li>Complaint will be assigned to the selected officer</li>
                            <li>Officer will receive a notification</li>
                            <li>Citizen will be notified of approval</li>
                            <li>Officer can start working on the complaint</li>
                        </>
                    ) : (
                        <>
                            <li>Complaint will be marked as rejected</li>
                            <li>Citizen will receive your rejection reason</li>
                            <li>Citizen can resubmit with corrections</li>
                            <li>This action can be reversed by admin</li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ComplaintApproval;
