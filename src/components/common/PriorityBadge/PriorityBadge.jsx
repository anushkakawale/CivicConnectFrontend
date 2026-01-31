/**
 * PriorityBadge Component
 * Displays complaint priority with consistent styling
 */

import React from 'react';
import PropTypes from 'prop-types';
import './PriorityBadge.css';

const PriorityBadge = ({ priority, size = 'medium', showIcon = true }) => {
    const priorityConfig = {
        'LOW': {
            label: 'Low',
            icon: 'fas fa-arrow-down',
            className: 'low'
        },
        'MEDIUM': {
            label: 'Medium',
            icon: 'fas fa-minus',
            className: 'medium'
        },
        'HIGH': {
            label: 'High',
            icon: 'fas fa-arrow-up',
            className: 'high'
        },
        'CRITICAL': {
            label: 'Critical',
            icon: 'fas fa-exclamation-triangle',
            className: 'critical'
        }
    };

    const config = priorityConfig[priority] || {
        label: priority,
        icon: 'fas fa-question-circle',
        className: 'default'
    };

    return (
        <span className={`priority-badge ${config.className} ${size}`}>
            {showIcon && <i className={config.icon}></i>}
            <span>{config.label}</span>
        </span>
    );
};

PriorityBadge.propTypes = {
    priority: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showIcon: PropTypes.bool
};

export default PriorityBadge;
