import React from 'react';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const SlaCard = ({ complaint, size = 'md' }) => {
    if (!complaint) return null;

    const getSlaStatus = () => {
        if (complaint.slaBreached || complaint.slaStatus === 'BREACHED') {
            return {
                status: 'BREACHED',
                color: '#EF4444',
                bgColor: '#FEE2E2',
                icon: AlertTriangle,
                text: 'SLA BREACHED',
                message: 'Deadline has passed'
            };
        }

        if (complaint.slaStatus === 'WARNING') {
            return {
                status: 'WARNING',
                color: '#F59E0B',
                bgColor: '#FEF3C7',
                icon: Clock,
                text: 'SLA WARNING',
                message: 'Approaching deadline'
            };
        }

        if (complaint.status === 'RESOLVED' || complaint.status === 'APPROVED' || complaint.status === 'CLOSED') {
            return {
                status: 'MET',
                color: '#10B981',
                bgColor: '#D1FAE5',
                icon: CheckCircle,
                text: 'SLA MET',
                message: 'Resolved within deadline'
            };
        }

        return {
            status: 'ON_TRACK',
            color: '#3B82F6',
            bgColor: '#DBEAFE',
            icon: TrendingUp,
            text: 'ON TRACK',
            message: 'Within SLA timeframe'
        };
    };

    const formatTimeRemaining = () => {
        if (!complaint.slaDeadline) return 'N/A';

        const deadline = new Date(complaint.slaDeadline);
        const now = new Date();
        const diff = deadline - now;

        if (diff < 0) {
            const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
            return `Overdue by ${hours}h`;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h remaining`;
        }

        return `${hours}h ${minutes}m remaining`;
    };

    const slaInfo = getSlaStatus();
    const Icon = slaInfo.icon;
    const isSmall = size === 'sm';

    return (
        <div
            className={`sla-card rounded-4 ${isSmall ? 'p-3' : 'p-4'} border-start border-4`}
            style={{
                backgroundColor: slaInfo.bgColor,
                borderColor: slaInfo.color,
                borderLeftWidth: '4px'
            }}
        >
            <div className="d-flex align-items-start gap-3">
                <div
                    className={`rounded-circle ${isSmall ? 'p-2' : 'p-3'} d-flex align-items-center justify-content-center`}
                    style={{ backgroundColor: slaInfo.color }}
                >
                    <Icon size={isSmall ? 16 : 20} className="text-white" />
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6
                                className={`fw-bold mb-1 ${isSmall ? 'small' : ''}`}
                                style={{ color: slaInfo.color }}
                            >
                                {slaInfo.text}
                            </h6>
                            <p className={`text-muted mb-0 ${isSmall ? 'extra-small' : 'small'}`}>
                                {slaInfo.message}
                            </p>
                        </div>
                        {!isSmall && complaint.slaDeadline && (
                            <span
                                className="badge rounded-pill px-3 py-2 fw-bold"
                                style={{
                                    backgroundColor: slaInfo.color,
                                    color: 'white'
                                }}
                            >
                                {formatTimeRemaining()}
                            </span>
                        )}
                    </div>
                    {!isSmall && complaint.slaDeadline && (
                        <div className="small text-muted">
                            <Clock size={12} className="me-1" />
                            Deadline: {new Date(complaint.slaDeadline).toLocaleString()}
                        </div>
                    )}
                    {isSmall && complaint.slaDeadline && (
                        <div className="extra-small fw-bold" style={{ color: slaInfo.color }}>
                            {formatTimeRemaining()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SlaCard;
