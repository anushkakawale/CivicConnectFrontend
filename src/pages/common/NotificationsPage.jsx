/**
 * Notifications Page
 * Full page view of all notifications with filtering
 */

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Filter, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import './NotificationsPage.css';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        await fetchNotifications();
        setLoading(false);
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Navigate to complaint
        if (notification.complaintId) {
            const role = localStorage.getItem('role');
            const roleRoutes = {
                'CITIZEN': '/citizen/complaints',
                'DEPARTMENT_OFFICER': '/department/complaints',
                'WARD_OFFICER': '/ward-officer/complaints',
                'ADMIN': '/admin/complaints'
            };
            const basePath = roleRoutes[role] || '/complaints';
            navigate(`${basePath}/${notification.complaintId}`);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        await fetchNotifications();
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'NEW_COMPLAINT': '📝',
            'STATUS_UPDATE': '🔄',
            'ASSIGNMENT': '👤',
            'APPROVAL': '✅',
            'REJECTION': '❌',
            'CLOSURE': '🔒',
            'SLA_WARNING': '⚠️',
            'FEEDBACK': '💬'
        };
        return icons[type] || '🔔';
    };

    const getNotificationColor = (type) => {
        const colors = {
            'NEW_COMPLAINT': '#3b82f6',
            'STATUS_UPDATE': '#8b5cf6',
            'ASSIGNMENT': '#06b6d4',
            'APPROVAL': '#10b981',
            'REJECTION': '#ef4444',
            'CLOSURE': '#6b7280',
            'SLA_WARNING': '#f59e0b',
            'FEEDBACK': '#ec4899'
        };
        return colors[type] || '#6b7280';
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true;
    });

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted fw-semibold">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            {/* Header */}
            <div className="notifications-header">
                <div className="header-content">
                    <div className="header-title">
                        <Bell size={32} />
                        <div>
                            <h1>Notifications</h1>
                            <p>Stay updated with all your complaint activities</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button className="mark-all-read-btn-lg" onClick={handleMarkAllRead}>
                            <CheckCheck size={20} />
                            Mark all as read ({unreadCount})
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="notifications-filters">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Notifications
                    <span className="count-badge">{notifications.length}</span>
                </button>
                <button
                    className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread
                    <span className="count-badge unread">{unreadCount}</span>
                </button>
                <button
                    className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Read
                    <span className="count-badge">{notifications.length - unreadCount}</span>
                </button>
            </div>

            {/* Notifications List */}
            <div className="notifications-container">
                {filteredNotifications.length > 0 ? (
                    <div className="notifications-grid">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div
                                    className="notification-card-icon"
                                    style={{ background: `${getNotificationColor(notification.type)}15` }}
                                >
                                    <span style={{ fontSize: '28px' }}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                </div>
                                <div className="notification-card-content">
                                    <div className="notification-card-header">
                                        <h3>{notification.message}</h3>
                                        {!notification.isRead && (
                                            <div className="unread-dot" title="Unread"></div>
                                        )}
                                    </div>
                                    <div className="notification-card-meta">
                                        <span className="notification-time">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                        {notification.complaintId && (
                                            <span className="notification-complaint">
                                                Complaint #{notification.complaintId}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!notification.isRead && (
                                    <button
                                        className="mark-read-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                        title="Mark as read"
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-notifications-state">
                        <Bell size={80} className="no-notifications-icon" />
                        <h3>No {filter !== 'all' ? filter : ''} notifications</h3>
                        <p>
                            {filter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : filter === 'read'
                                    ? "No read notifications yet."
                                    : "You don't have any notifications yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
