import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, X } from 'lucide-react';

const formatDistanceToNow = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
};

const SharedNotificationList = ({
    notifications,
    onClear,
    onClearAll,
    onItemClick,
    emptyMessage = "No new notifications"
}) => {

    const getIcon = (type) => {
        // Handle various backend type strings
        const normalizedType = (type || 'INFO').toUpperCase();
        if (normalizedType.includes('SUCCESS') || normalizedType === 'ASSIGNMENT') return <CheckCircle size={20} className="text-success" />;
        if (normalizedType.includes('WARNING') || normalizedType === 'SLA' || normalizedType === 'REOPENED') return <AlertTriangle size={20} className="text-warning" />;
        if (normalizedType.includes('ERROR') || normalizedType === 'BREACHED') return <X size={20} className="text-danger" />;
        return <Info size={20} className="text-primary" />;
    };

    const getBgColor = (type) => {
        const normalizedType = (type || 'INFO').toUpperCase();
        if (normalizedType.includes('SUCCESS') || normalizedType === 'ASSIGNMENT') return 'bg-success-subtle';
        if (normalizedType.includes('WARNING') || normalizedType === 'SLA' || normalizedType === 'REOPENED') return 'bg-warning-subtle';
        if (normalizedType.includes('ERROR') || normalizedType === 'BREACHED') return 'bg-danger-subtle';
        return 'bg-primary-subtle';
    };

    if (!notifications || notifications.length === 0) {
        return (
            <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                    <Bell size={48} className="text-muted opacity-25 mb-3" />
                    <p className="text-muted mb-0">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-list">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold">Notifications</h5>
                {onClearAll && (
                    <button className="btn btn-link btn-sm text-decoration-none" onClick={onClearAll}>
                        Mark All as Read
                    </button>
                )}
            </div>

            <div className="d-flex flex-column gap-3">
                {notifications.map((notification) => {
                    // normalize fields
                    const isRead = notification.read || notification.isRead;
                    const timestamp = notification.createdAt || notification.created_at || new Date();

                    return (
                        <div
                            key={notification.id || notification.notificationId || Math.random()}
                            className={`card border-0 shadow-sm ${isRead ? 'opacity-75 bg-light' : 'border-start border-primary border-4'}`}
                            style={{ cursor: onItemClick ? 'pointer' : 'default', transition: 'all 0.2s' }}
                            onClick={() => onItemClick && onItemClick(notification)}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex gap-3">
                                    <div className={`flex-shrink-0 rounded-0 p-2 d-flex align-items-center justify-content-center ${getBgColor(notification.type)}`} style={{ width: '40px', height: '40px' }}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h6 className="mb-1 fw-bold text-dark">{notification.title}</h6>
                                            <small className="text-muted text-nowrap ms-2">
                                                {formatDistanceToNow(timestamp)}
                                            </small>
                                        </div>
                                        <p className="mb-1 text-secondary small">{notification.message}</p>
                                    </div>
                                    {onClear && !isRead && (
                                        <button
                                            className="btn btn-link text-muted p-0 align-self-start"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClear(notification.id || notification.notificationId);
                                            }}
                                            title="Mark as read"
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SharedNotificationList;
