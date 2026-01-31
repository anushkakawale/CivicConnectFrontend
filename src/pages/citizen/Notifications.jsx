import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCircle,
    Clock,
    AlertCircle,
    Info,
    FileText,
    RefreshCw,
    CheckCheck,
    Filter,
    Trash2
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import './Notifications.css';

const Notifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        deleteNotification
    } = useNotifications();

    const [filter, setFilter] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(n => {
        // Filter by read/unread
        if (filter === 'unread' && n.isRead) return false;
        if (filter === 'read' && !n.isRead) return false;

        // Filter by type
        if (selectedType !== 'all' && n.type !== selectedType) return false;

        return true;
    });

    const getIcon = (type) => {
        const icons = {
            'NEW_COMPLAINT': Bell,
            'STATUS_UPDATE': Info,
            'ASSIGNMENT': AlertCircle,
            'RESOLUTION': CheckCircle,
            'CLOSURE': CheckCircle,
            'SLA_WARNING': Clock,
            'FEEDBACK': FileText,
            'APPROVAL': CheckCircle,
            'REJECTION': AlertCircle
        };
        return icons[type] || Bell;
    };

    const getTypeColor = (type) => {
        const colors = {
            'NEW_COMPLAINT': '#667eea',
            'STATUS_UPDATE': '#3b82f6',
            'ASSIGNMENT': '#f59e0b',
            'RESOLUTION': '#10b981',
            'CLOSURE': '#6b7280',
            'SLA_WARNING': '#ef4444',
            'FEEDBACK': '#8b5cf6',
            'APPROVAL': '#10b981',
            'REJECTION': '#ef4444'
        };
        return colors[type] || '#667eea';
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.complaintId) {
            navigate(`/citizen/complaints/${notification.complaintId}`);
        }
    };

    const notificationTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'NEW_COMPLAINT', label: 'New Complaint' },
        { value: 'STATUS_UPDATE', label: 'Status Update' },
        { value: 'RESOLUTION', label: 'Resolution' },
        { value: 'SLA_WARNING', label: 'SLA Warning' }
    ];

    return (
        <div className="notifications-page">
            {/* Header */}
            <div className="notifications-header">
                <div className="header-content">
                    <div className="header-title">
                        <Bell className="w-8 h-8" />
                        <div>
                            <h1>Notifications</h1>
                            <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            onClick={fetchNotifications}
                            className="btn-icon"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'spinning' : ''}`} />
                        </button>
                        <button
                            onClick={markAllAsRead}
                            className="btn-mark-all"
                            disabled={unreadCount === 0}
                        >
                            <CheckCheck className="w-5 h-5" />
                            Mark All as Read
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <Filter className="w-5 h-5" />
                    <span className="filter-label">Filter:</span>
                    <div className="filter-buttons">
                        <button
                            onClick={() => setFilter('all')}
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                        >
                            Read ({notifications.length - unreadCount})
                        </button>
                    </div>
                </div>

                <div className="type-filter">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="type-select"
                    >
                        {notificationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Notifications List */}
            {loading && notifications.length === 0 ? (
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Loading notifications...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="empty-state">
                    <Bell className="w-16 h-16" />
                    <h3>No Notifications</h3>
                    <p>
                        {filter === 'unread'
                            ? "You're all caught up! No unread notifications."
                            : filter === 'read'
                                ? "No read notifications yet."
                                : "You don't have any notifications yet."}
                    </p>
                </div>
            ) : (
                <div className="notifications-list">
                    {filteredNotifications.map(notification => {
                        const Icon = getIcon(notification.type);
                        const iconColor = getTypeColor(notification.type);

                        return (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-icon" style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h4>{notification.title || 'Notification'}</h4>
                                        <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                    </div>
                                    <p className="notification-message">{notification.message}</p>

                                    {notification.complaintId && (
                                        <div className="notification-meta">
                                            <FileText className="w-3 h-3" />
                                            <span>Complaint #{notification.complaintId}</span>
                                        </div>
                                    )}
                                </div>

                                {!notification.isRead && (
                                    <div className="unread-indicator">
                                        <div className="unread-dot"></div>
                                    </div>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this notification?')) {
                                            deleteNotification && deleteNotification(notification.id);
                                        }
                                    }}
                                    className="btn-delete"
                                    title="Delete notification"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Notifications;
