/**
 * StatusBadge Component
 * Premium professional status badge with consistent design
 */

import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ status, size = 'medium', showIcon = true }) => {
    const normalizedStatus = status?.toUpperCase().replace(' ', '_');

    const statusConfig = {
        'SUBMITTED': { label: 'Submitted', className: 'submitted' },
        'PENDING': { label: 'Pending', className: 'submitted' },
        'APPROVED': { label: 'Approved', className: 'approved' },
        'ASSIGNED': { label: 'Assigned', className: 'assigned' },
        'IN_PROGRESS': { label: 'In Progress', className: 'in-progress' },
        'RESOLVED': { label: 'Resolved', className: 'resolved' },
        'CLOSED': { label: 'Closed', className: 'closed' },
        'REJECTED': { label: 'Rejected', className: 'rejected' }
    };

    const config = statusConfig[normalizedStatus] || {
        label: status,
        className: 'closed'
    };

    return (
        <span className={`status-badge ${config.className} ${size === 'small' ? 'px-2 py-0.5 text-[10px]' : ''}`}>
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
