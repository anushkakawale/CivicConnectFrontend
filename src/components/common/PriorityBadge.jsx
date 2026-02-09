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

    const getPriorityConfig = (priority) => {
        const configs = {
            LOW: { color: '#10B981', icon: '🔵', label: 'Low Frequency' },
            MEDIUM: { color: '#3B82F6', icon: '🟡', label: 'Standard' },
            HIGH: { color: '#F59E0B', icon: '🟠', label: 'High Priority' },
            CRITICAL: { color: '#EF4444', icon: '🔴', label: 'Strategic Action' }
        };
        return configs[priority] || { color: '#6B7280', icon: '⚪', label: priority };
    };

    const config = getPriorityConfig(priority);

    return (
        <span
            className={`priority-badge priority-badge-${size}`}
            style={{
                backgroundColor: 'white',
                color: config.color,
                border: `1px solid ${config.color}40`,
                boxShadow: `0 2px 4px ${config.color}15`,
                fontWeight: '700',
                fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '0'
            }}
        >
            {showIcon && <span style={{ filter: 'saturate(1.5)' }}>{config.icon}</span>}
            <span style={{ letterSpacing: '0.3px' }}>{config.label.toUpperCase()}</span>
        </span>
    );
};

export default PriorityBadge;
