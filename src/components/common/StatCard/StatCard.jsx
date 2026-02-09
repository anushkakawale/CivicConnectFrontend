/**
 * StatCard Component
 * Premium professional stat card with icon, value, and label
 * Uses global premium-stat-card styling from index.css
 */

import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({
    icon,
    value,
    label,
    variant = 'primary',
    trend = null,
    onClick = null,
    loading = false
}) => {
    const IconComponent = icon;

    if (loading) {
        return (
            <div className="gov-card p-4 animate-pulse d-flex align-items-center gap-3">
                <div className="rounded-0 bg-light" style={{ width: '50px', height: '50px' }}></div>
                <div className="flex-grow-1">
                    <div className="h-4 bg-light rounded-0 w-50 mb-2"></div>
                    <div className="h-6 bg-light rounded-0 w-75"></div>
                </div>
            </div>
        );
    }

    const getVariantColors = () => {
        const variants = {
            primary: { bg: '#0B3C5D', text: '#FFFFFF', iconBg: 'rgba(255,255,255,0.1)' },
            success: { bg: '#10B981', text: '#FFFFFF', iconBg: 'rgba(255,255,255,0.1)' },
            warning: { bg: '#F59E0B', text: '#FFFFFF', iconBg: 'rgba(255,255,255,0.1)' },
            info: { bg: '#3B82F6', text: '#FFFFFF', iconBg: 'rgba(255,255,255,0.1)' },
            danger: { bg: '#EF4444', text: '#FFFFFF', iconBg: 'rgba(255,255,255,0.1)' }
        };
        return variants[variant] || variants.primary;
    };

    const colors = getVariantColors();

    return (
        <div
            className="gov-card p-4 border-0 position-relative overflow-hidden shadow-sm"
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                background: colors.bg,
                color: colors.text,
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
            {/* Background Pattern */}
            <div className="position-absolute" style={{
                right: '-20px',
                top: '-20px',
                opacity: 0.1,
                transform: 'rotate(-15deg)'
            }}>
                <IconComponent size={120} />
            </div>

            <div className="position-relative z-index-1">
                <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="p-2 rounded-0" style={{ background: colors.iconBg }}>
                        <IconComponent size={20} />
                    </div>
                    <span className="text-uppercase small fw-extrabold tracking-wider opacity-75">{label}</span>
                </div>
                <h2 className="display-6 fw-black mb-0">{value}</h2>
                {trend && (
                    <div className="small mt-2 fw-bold opacity-75">
                        <span className="me-1">{trend.direction === 'up' ? '↑' : '↓'} {trend.value}%</span>
                        <span className="fw-medium small opacity-50 text-uppercase">v-period</span>
                    </div>
                )}
            </div>
        </div>
    );
};

StatCard.propTypes = {
    icon: PropTypes.any,
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
