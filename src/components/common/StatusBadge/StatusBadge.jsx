/**
 * StatusBadge Component
 * Displays complaint status with consistent styling
 */

import React from 'react';
import PropTypes from 'prop-types';
import './StatusBadge.css';

const StatusBadge = ({ status, size = 'medium', showIcon = true }) => {
    const statusConfig = {
        'SUBMITTED': {
            label: 'Submitted',
            icon: 'fas fa-paper-plane',
            className: 'submitted'
        },
        'APPROVED': {
            label: 'Approved',
            icon: 'fas fa-check-circle',
            className: 'approved'
        },
        'ASSIGNED': {
            label: 'Assigned',
            icon: 'fas fa-user-check',
            className: 'assigned'
        },
        'IN_PROGRESS': {
            label: 'In Progress',
            icon: 'fas fa-spinner',
            className: 'in-progress'
        },
        'RESOLVED': {
            label: 'Resolved',
            icon: 'fas fa-check-double',
            className: 'resolved'
        },
        'CLOSED': {
            label: 'Closed',
            icon: 'fas fa-times-circle',
            className: 'closed'
        },
        'REJECTED': {
            label: 'Rejected',
            icon: 'fas fa-ban',
            className: 'rejected'
        }
    };

    const config = statusConfig[status] || {
        label: status,
        icon: 'fas fa-question-circle',
        className: 'default'
    };

    return (
        <span className={`status-badge ${config.className} ${size}`}>
            {showIcon && <i className={config.icon}></i>}
            <span>{config.label}</span>
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showIcon: PropTypes.bool
};

export default StatusBadge;
