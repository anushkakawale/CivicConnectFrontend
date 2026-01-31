import React from 'react';
import './LoadingSkeleton.css';

/**
 * LoadingSkeleton Component
 * Loading placeholder skeletons for better UX
 * 
 * @param {string} variant - Skeleton variant ('text', 'circle', 'rect', 'card', 'table')
 * @param {number} width - Width in pixels or percentage
 * @param {number} height - Height in pixels
 * @param {number} count - Number of skeleton items
 * @param {string} className - Additional CSS classes
 */
const LoadingSkeleton = ({
    variant = 'text',
    width,
    height,
    count = 1,
    className = ''
}) => {
    const renderSkeleton = () => {
        switch (variant) {
            case 'text':
                return <div className={`skeleton skeleton-text ${className}`} style={{ width, height }} />;

            case 'circle':
                return <div className={`skeleton skeleton-circle ${className}`} style={{ width: width || height, height }} />;

            case 'rect':
                return <div className={`skeleton skeleton-rect ${className}`} style={{ width, height }} />;

            case 'card':
                return (
                    <div className={`skeleton-card ${className}`}>
                        <div className="skeleton skeleton-rect" style={{ height: 200 }} />
                        <div className="skeleton-card-content">
                            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className={`skeleton-table ${className}`}>
                        <div className="skeleton-table-header">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="skeleton skeleton-text" />
                            ))}
                        </div>
                        {[...Array(5)].map((_, rowIndex) => (
                            <div key={rowIndex} className="skeleton-table-row">
                                {[...Array(4)].map((_, colIndex) => (
                                    <div key={colIndex} className="skeleton skeleton-text" />
                                ))}
                            </div>
                        ))}
                    </div>
                );

            case 'dashboard':
                return (
                    <div className={`skeleton-dashboard ${className}`}>
                        <div className="skeleton-stats">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="skeleton-stat-card">
                                    <div className="skeleton skeleton-circle" style={{ width: 48, height: 48 }} />
                                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                                </div>
                            ))}
                        </div>
                        <div className="skeleton skeleton-rect" style={{ height: 300 }} />
                    </div>
                );

            default:
                return <div className={`skeleton ${className}`} style={{ width, height }} />;
        }
    };

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <React.Fragment key={index}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </>
    );
};

// Predefined skeleton components for common use cases
export const TextSkeleton = ({ lines = 3, ...props }) => (
    <LoadingSkeleton variant="text" count={lines} {...props} />
);

export const CardSkeleton = ({ count = 1, ...props }) => (
    <LoadingSkeleton variant="card" count={count} {...props} />
);

export const TableSkeleton = (props) => (
    <LoadingSkeleton variant="table" {...props} />
);

export const DashboardSkeleton = (props) => (
    <LoadingSkeleton variant="dashboard" {...props} />
);

export default LoadingSkeleton;
