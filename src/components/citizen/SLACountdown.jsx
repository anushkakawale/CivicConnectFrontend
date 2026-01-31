import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SLACountdown = ({ complaintId, citizenService }) => {
    const [slaInfo, setSlaInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        fetchSLAInfo();
        const interval = setInterval(fetchSLAInfo, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [complaintId]);

    useEffect(() => {
        if (slaInfo && !slaInfo.breached && slaInfo.remainingMinutes) {
            const interval = setInterval(() => {
                const deadline = new Date(slaInfo.deadline);
                const now = new Date();
                const diff = deadline - now;

                if (diff <= 0) {
                    setTimeRemaining({ hours: 0, minutes: 0, breached: true });
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    setTimeRemaining({ hours, minutes, breached: false });
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [slaInfo]);

    const fetchSLAInfo = async () => {
        try {
            const data = await citizenService.getSLACountdown(complaintId);
            setSlaInfo(data);
        } catch (err) {
            console.error('Failed to load SLA info:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                </div>
            </div>
        );
    }

    if (!slaInfo) return null;

    const isBreached = slaInfo.breached || (timeRemaining && timeRemaining.breached);
    const isWarning = !isBreached && timeRemaining && (timeRemaining.hours * 60 + timeRemaining.minutes) < 120; // Less than 2 hours

    return (
        <div className={`card border-0 shadow-sm ${isBreached ? 'border-danger border-3' : isWarning ? 'border-warning border-3' : ''}`}>
            <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-bold d-flex align-items-center">
                    <Clock size={18} className="me-2 text-primary" />
                    SLA Status
                </h6>
            </div>
            <div className="card-body">
                {/* Status Badge */}
                <div className="text-center mb-3">
                    {isBreached ? (
                        <div className="badge bg-danger fs-6 px-3 py-2">
                            <AlertTriangle size={16} className="me-1" />
                            SLA Breached
                        </div>
                    ) : isWarning ? (
                        <div className="badge bg-warning fs-6 px-3 py-2">
                            <AlertTriangle size={16} className="me-1" />
                            Expiring Soon
                        </div>
                    ) : (
                        <div className="badge bg-success fs-6 px-3 py-2">
                            <CheckCircle size={16} className="me-1" />
                            On Track
                        </div>
                    )}
                </div>

                {/* Deadline */}
                <div className="mb-3">
                    <small className="text-muted d-block mb-1">Deadline</small>
                    <div className="fw-semibold">
                        {new Date(slaInfo.deadline).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                {/* Countdown */}
                {!isBreached && timeRemaining && (
                    <div className="text-center">
                        <small className="text-muted d-block mb-2">Time Remaining</small>
                        <div className={`fs-3 fw-bold ${isWarning ? 'text-warning' : 'text-primary'}`}>
                            {timeRemaining.hours}h {timeRemaining.minutes}m
                        </div>
                    </div>
                )}

                {isBreached && (
                    <div className="alert alert-danger mb-0 mt-3">
                        <small>
                            <strong>⚠️ SLA Deadline Exceeded</strong><br />
                            This complaint has been escalated to ward officer and admin.
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SLACountdown;
