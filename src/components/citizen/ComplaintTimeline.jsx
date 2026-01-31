import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const ComplaintTimeline = ({ statusHistory }) => {
    const timelineSteps = [
        { status: 'SUBMITTED', label: 'Submitted', icon: '📝' },
        { status: 'ASSIGNED', label: 'Assigned', icon: '👤' },
        { status: 'IN_PROGRESS', label: 'Work Started', icon: '🔧' },
        { status: 'RESOLVED', label: 'Resolved', icon: '✅' },
        { status: 'APPROVED', label: 'Approved', icon: '👍' },
        { status: 'CLOSED', label: 'Closed', icon: '🔒' }
    ];

    const getCurrentStepIndex = () => {
        if (!statusHistory || statusHistory.length === 0) return 0;
        const currentStatus = statusHistory[statusHistory.length - 1].status;
        return timelineSteps.findIndex(step => step.status === currentStatus);
    };

    const currentIndex = getCurrentStepIndex();

    const getStepDate = (status) => {
        const historyItem = statusHistory?.find(h => h.status === status);
        return historyItem ? new Date(historyItem.changedAt).toLocaleDateString() : null;
    };

    return (
        <div className="card">
            <div className="card-body">
                <h6 className="card-title fw-bold mb-4">Complaint Timeline</h6>

                <div className="position-relative">
                    {timelineSteps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const stepDate = getStepDate(step.status);

                        return (
                            <div key={step.status} className="d-flex mb-4 position-relative">
                                {/* Timeline Line */}
                                {index < timelineSteps.length - 1 && (
                                    <div
                                        className="position-absolute"
                                        style={{
                                            left: '15px',
                                            top: '30px',
                                            width: '2px',
                                            height: '40px',
                                            backgroundColor: isCompleted ? '#198754' : '#dee2e6'
                                        }}
                                    ></div>
                                )}

                                {/* Icon */}
                                <div className="flex-shrink-0 me-3">
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center ${isCompleted ? 'bg-success' : 'bg-light'
                                            }`}
                                        style={{ width: '32px', height: '32px' }}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle size={18} className="text-white" />
                                        ) : (
                                            <Circle size={18} className="text-muted" />
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className={`mb-0 ${isCompleted ? 'fw-bold' : 'text-muted'}`}>
                                                <span className="me-2">{step.icon}</span>
                                                {step.label}
                                            </h6>
                                            {stepDate && (
                                                <small className="text-muted">{stepDate}</small>
                                            )}
                                        </div>
                                        {isCurrent && (
                                            <span className="badge bg-primary">Current</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ComplaintTimeline;
