import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            // Get only recent 5 notifications
            setNotifications(Array.isArray(data) ? data.slice(0, 5) : []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            if (!notification.isRead) {
                await notificationService.markAsRead(notification.notificationId);
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Close dropdown
            setIsOpen(false);

            // Navigate to reference if exists
            if (notification.referenceId) {
                // Determine route based on user role
                const role = localStorage.getItem('role');
                if (role === 'CITIZEN') {
                    navigate(`/citizen/complaints/${notification.referenceId}`);
                } else if (role === 'DEPARTMENT_OFFICER') {
                    navigate(`/department/complaints/${notification.referenceId}`);
                } else if (role === 'WARD_OFFICER') {
                    navigate(`/ward-officer/complaints/${notification.referenceId}`);
                }
            }
        } catch (error) {
            console.error('Failed to handle notification click:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'COMPLAINT_CREATED': '📝',
            'STATUS_UPDATE': '🔄',
            'SLA_WARNING': '⚠️',
            'SLA_BREACHED': '🚨',
            'ASSIGNMENT': '📌',
            'REOPENED': '🔁',
            'FEEDBACK_REQUEST': '⭐',
            'SYSTEM': '🔔'
        };
        return icons[type] || '📋';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="notification-dropdown-container">
            <button
                className="notification-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notification-overlay" onClick={() => setIsOpen(false)} />
                    <div className="notification-dropdown">
                        <div className="notification-dropdown-header">
                            <h6 className="mb-0 fw-bold">Notifications</h6>
                            <button
                                className="btn-close-dropdown"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="notification-dropdown-body">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                    <p className="text-muted small mt-2 mb-0">Loading...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-4">
                                    <Bell size={32} className="text-muted opacity-50 mb-2" />
                                    <p className="text-muted small mb-0">No notifications</p>
                                </div>
                            ) : (
                                <div className="notification-list">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.notificationId}
                                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="notification-icon">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-title">
                                                    {notification.title}
                                                    {!notification.isRead && (
                                                        <span className="badge-new">NEW</span>
                                                    )}
                                                </div>
                                                <div className="notification-message">
                                                    {notification.message}
                                                </div>
                                                <div className="notification-time">
                                                    {formatTime(notification.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="notification-dropdown-footer">
                                <button
                                    className="btn-view-all"
                                    onClick={() => {
                                        setIsOpen(false);
                                        const role = localStorage.getItem('role');
                                        if (role === 'CITIZEN') {
                                            navigate('/citizen/notifications');
                                        } else if (role === 'DEPARTMENT_OFFICER') {
                                            navigate('/department/notifications');
                                        } else if (role === 'WARD_OFFICER') {
                                            navigate('/ward-officer/notifications');
                                        }
                                    }}
                                >
                                    View All Notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
