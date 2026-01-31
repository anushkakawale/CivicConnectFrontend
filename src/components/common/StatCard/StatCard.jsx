/**
 * StatCard Component
 * Professional stat card with icon, value, and label
 * Supports different variants (primary, secondary, success, warning, danger, info)
 */

import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.css';

const StatCard = ({
    icon,
    value,
    label,
    variant = 'primary',
    trend = null,
    onClick = null,
    loading = false
}) => {
    const cardClass = `stat-card ${variant} ${onClick ? 'clickable' : ''} ${loading ? 'loading' : ''}`;

    return (
        <div className={cardClass} onClick={onClick}>
            {loading ? (
                <div className="stat-card-loading">
                    <div className="spinner-small"></div>
                </div>
            ) : (
                <>
                    <div className="stat-card-icon">
                        <i className={icon}></i>
                    </div>
                    <div className="stat-card-content">
                        <div className="stat-card-value">{value}</div>
                        <div className="stat-card-label">{label}</div>
                        {trend && (
                            <div className={`stat-card-trend ${trend.direction}`}>
                                <i className={`fas fa-arrow-${trend.direction === 'up' ? 'up' : 'down'}`}></i>
                                <span>{trend.value}%</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

StatCard.propTypes = {
    icon: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'info']),
    trend: PropTypes.shape({
        direction: PropTypes.oneOf(['up', 'down']),
        value: PropTypes.number
    }),
    onClick: PropTypes.func,
    loading: PropTypes.bool
};

export default StatCard;
