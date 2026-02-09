import React from 'react';
import {
    Clock, ShieldCheck, UserCheck, Play,
    CheckCircle, Lock, XCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import './StatusBadge.css';

/**
 * Premium StatusBadge Component
 * Displays complaint status with color-coded badge and high-quality iconography.
 */
const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
    if (!status) return null;

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { color: '#F59E0B', icon: Clock, label: 'Pending' },
            APPROVED: { color: '#1254AF', icon: ShieldCheck, label: 'Approved' },
            ASSIGNED: { color: '#6366F1', icon: UserCheck, label: 'Assigned' },
            IN_PROGRESS: { color: '#8B5CF6', icon: Play, label: 'In Progress' },
            RESOLVED: { color: '#10B981', icon: CheckCircle, label: 'Resolved' },
            CLOSED: { color: '#475569', icon: Lock, label: 'Closed' },
            REJECTED: { color: '#EF4444', icon: XCircle, label: 'Rejected' },
            REOPENED: { color: '#F97316', icon: RefreshCw, label: 'Reopened' }
        };
        return configs[status] || { color: '#94a3b8', icon: AlertCircle, label: status.replace(/_/g, ' ') };
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span
            className={`status-badge status-badge-${size} d-inline-flex align-items-center gap-2`}
            style={{
                backgroundColor: `${config.color}10`,
                color: config.color,
                borderColor: `${config.color}25`,
                borderWidth: '1.5px',
                borderStyle: 'solid',
                fontWeight: '900',
                letterSpacing: '0.05em',
                borderRadius: '6px',
                padding: size === 'sm' ? '2px 8px' : '4px 12px',
                fontSize: size === 'sm' ? '0.65rem' : '0.75rem',
                textTransform: 'uppercase'
            }}
        >
            {showIcon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={3} />}
            <span className="status-label">{config.label}</span>
        </span>
    );
};

export default StatusBadge;
