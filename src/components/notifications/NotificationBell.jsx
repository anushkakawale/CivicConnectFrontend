/**
 * Enhanced Notification Bell Component
 * Shows unread count and dropdown with read/unread visual states
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

const NotificationBell = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

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

        setIsOpen(false);
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

    // Show only recent 5 notifications in dropdown
    const recentNotifications = (notifications || []).slice(0, 5);

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className="notification-bell-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    {/* Header */}
                    <div className="notification-dropdown-header">
                        <div className="notification-header-title">
                            <Bell size={18} />
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="unread-count-badge">{unreadCount} new</span>
                            )}
                        </div>
                        <button
                            className="close-dropdown-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Actions */}
                    {unreadCount > 0 && (
                        <div className="notification-actions">
                            <button
                                className="mark-all-read-btn"
                                onClick={handleMarkAllRead}
                            >
                                <CheckCheck size={16} />
                                Mark all as read
                            </button>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="notification-list">
                        {recentNotifications.length > 0 ? (
                            recentNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-message">
                                            {notification.message}
                                        </div>
                                        <div className="notification-time">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="unread-indicator" title="Unread"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-notifications">
                                <Bell size={48} className="no-notifications-icon" />
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="notification-dropdown-footer">
                            <button
                                className="view-all-btn"
                                onClick={() => {
                                    const role = localStorage.getItem('role');
                                    const roleRoutes = {
                                        'CITIZEN': '/citizen/notifications',
                                        'DEPARTMENT_OFFICER': '/department/notifications',
                                        'WARD_OFFICER': '/ward-officer/notifications',
                                        'ADMIN': '/admin/notifications'
                                    };
                                    const path = roleRoutes[role] || '/notifications';
                                    navigate(path);
                                    setIsOpen(false);
                                }}
                            >
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
