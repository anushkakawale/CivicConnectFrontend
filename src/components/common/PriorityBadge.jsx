import React from 'react';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../../utils/constants';
import './PriorityBadge.css';

/**
 * PriorityBadge Component
 * Displays complaint priority with color-coded badge
 * 
 * @param {string} priority - Complaint priority (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {string} size - Badge size ('sm', 'md', 'lg')
 * @param {boolean} showIcon - Show priority icon
 */
const PriorityBadge = ({ priority, size = 'md', showIcon = true }) => {
    if (!priority) return null;

    const getPriorityIcon = (priority) => {
        const icons = {
            LOW: '▼',
            MEDIUM: '■',
            HIGH: '▲',
            CRITICAL: '⚠'
        };
        return icons[priority] || '•';
    };

    return (
        <span
            className={`priority-badge priority-badge-${size} priority-${priority.toLowerCase()}`}
            style={{
                backgroundColor: PRIORITY_COLORS[priority],
                color: '#ffffff'
            }}
        >
            {showIcon && <span className="priority-icon">{getPriorityIcon(priority)}</span>}
            <span className="priority-label">{PRIORITY_LABELS[priority] || priority}</span>
        </span>
    );
};

export default PriorityBadge;
