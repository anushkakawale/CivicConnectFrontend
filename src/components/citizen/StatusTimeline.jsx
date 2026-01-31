import React from 'react';
import { COMPLAINT_STATUS } from '../../constants';
import { CheckCircle } from 'lucide-react';

const StatusTimeline = ({ statusHistory }) => {
    if (!statusHistory || statusHistory.length === 0) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <h6 className="mb-0 fw-bold">Status Timeline</h6>
                </div>
                <div className="card-body text-center text-muted">
                    <small>No status history available</small>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-bold">Status Timeline</h6>
            </div>
            <div className="card-body">
                <div className="timeline">
                    {statusHistory.map((history, index) => {
                        const statusInfo = COMPLAINT_STATUS[history.status] || {
                            label: history.status,
                            color: 'secondary',
                            icon: '📋'
                        };

                        const isLast = index === statusHistory.length - 1;

                        return (
                            <div key={index} className="timeline-item mb-3">
                                <div className="d-flex">
                                    {/* Icon */}
                                    <div className="me-3 position-relative">
                                        <div
                                            className={`bg-${statusInfo.color} text-white rounded-circle d-flex align-items-center justify-content-center`}
                                            style={{ width: '40px', height: '40px', fontSize: '18px' }}
                                        >
                                            {statusInfo.icon}
                                        </div>
                                        {/* Connecting Line */}
                                        {!isLast && (
                                            <div
                                                className="position-absolute start-50 translate-middle-x bg-secondary"
                                                style={{
                                                    width: '2px',
                                                    height: 'calc(100% + 12px)',
                                                    top: '40px',
                                                    opacity: 0.3
                                                }}
                                            ></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <h6 className="mb-0 fw-bold">{statusInfo.label}</h6>
                                            <small className="text-muted">{formatDate(history.changedAt)}</small>
                                        </div>

                                        {history.changedBy && (
                                            <small className="text-muted d-block mb-1">
                                                By: {history.changedBy}
                                            </small>
                                        )}

                                        {statusInfo.description && (
                                            <small className="text-muted d-block mb-2">
                                                {statusInfo.description}
                                            </small>
                                        )}

                                        {history.remarks && (
                                            <div className="mt-2 p-2 bg-light rounded">
                                                <small className="text-dark">
                                                    <strong>Remarks:</strong> {history.remarks}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Current Status Indicator */}
                <div className="mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center text-success">
                        <CheckCircle size={16} className="me-2" />
                        <small className="fw-semibold">
                            Current Status: {COMPLAINT_STATUS[statusHistory[statusHistory.length - 1]?.status]?.label || 'Unknown'}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusTimeline;
