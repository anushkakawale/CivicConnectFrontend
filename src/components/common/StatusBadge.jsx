import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import './StatusBadge.css';

/**
 * StatusBadge Component
 * Displays complaint status with color-coded badge
 * 
 * @param {string} status - Complaint status
 * @param {string} size - Badge size ('sm', 'md', 'lg')
 * @param {boolean} showIcon - Show status icon
 */
const StatusBadge = ({ status, size = 'md', showIcon = false }) => {
    if (!status) return null;

    const getStatusIcon = (status) => {
        const icons = {
            PENDING: '⏳',
            APPROVED: '✓',
            IN_PROGRESS: '🔄',
            RESOLVED: '✅',
            CLOSED: '🔒',
            REJECTED: '❌',
            REOPENED: '🔄',
            ESCALATED: '⚠️'
        };
        return icons[status] || '•';
    };

    return (
        <span
            className={`status-badge status-badge-${size}`}
            style={{
                backgroundColor: STATUS_COLORS[status],
                color: '#ffffff'
            }}
        >
            {showIcon && <span className="status-icon">{getStatusIcon(status)}</span>}
            <span className="status-label">{STATUS_LABELS[status] || status}</span>
        </span>
    );
};

export default StatusBadge;
