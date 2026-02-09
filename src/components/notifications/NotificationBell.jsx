/**
 * Enhanced Notification Bell Component - PMC Blue System
 * Shows unread count and dropdown with simplified terminology
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellDot, Check, CheckCheck, X, Zap, Shield, Activity, Layers, Info, AlertTriangle, RefreshCw, Settings, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

const NotificationBell = ({ darkIcon = false }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const {
        notifications, unreadCount, unseenCount, markAsRead,
        markAllAsRead, markAllAsSeen, fetchNotifications
    } = useNotifications();

    const brandColor = '#173470';
    const brandGradient = 'linear-gradient(135deg, #173470 0%, #112652 100%)';

    // Close dropdown when clicking outside and mark all as seen
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Mark all as seen when opening the bell
            markAllAsSeen();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, markAllAsSeen]);

    const handleNotificationClick = async (notification) => {
        try {
            const notificationId = notification.id || notification.notificationId;
            if (!notificationId) return;

            if (!notification.isRead) {
                await markAsRead(notificationId);
            }

            // Also mark as seen explicitly if needed - catch silently for 403s
            apiService.notifications.markAsSeen(notificationId).catch(() => { });

            const actionUrl = notification.actionUrl || (notification.complaintId || notification.referenceId ? getFallbackPath(notification) : null);
            if (actionUrl) {
                navigate(actionUrl);
            }
        } catch (err) {
            console.error('Notification action failed:', err);
        } finally {
            setIsOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            await fetchNotifications();
        } catch (err) {
            console.error('Mark all read failed:', err);
        }
    };

    const getNotificationIcon = (type, customIcon) => {
        if (customIcon) {
            // Mapping string icon names to Lucide icons if needed, 
            // but for now we'll prioritize the type-based icons.
        }
        const icons = {
            'NEW_COMPLAINT': <Shield size={18} />,
            'STATUS_UPDATE': <RefreshCw size={18} />,
            'ASSIGNMENT': <Layers size={18} />,
            'APPROVAL': <CheckCheck size={18} />,
            'REJECTION': <X size={18} />,
            'CLOSURE': <Zap size={18} />,
            'SLA_WARNING': <AlertTriangle size={18} />,
            'FEEDBACK': <Info size={18} />,
            'OTP': <ShieldAlert size={18} />,
            'SYSTEM': <Settings size={18} />
        };
        return icons[type] || <Bell size={18} />;
    };

    const getFallbackPath = (notification) => {
        const cId = notification.complaintId || notification.referenceId;
        if (!cId) return null;
        const role = localStorage.getItem('role');
        const rolePaths = {
            'CITIZEN': `/citizen/complaint/${cId}`,
            'DEPARTMENT_OFFICER': `/department/complaints/${cId}`,
            'WARD_OFFICER': `/ward-officer/complaints/${cId}`,
            'ADMIN': `/admin/complaints/${cId}`
        };
        return rolePaths[role] || `/complaints/${cId}`;
    };

    const getTypeColor = (type) => {
        const colors = {
            'NEW_COMPLAINT': brandColor,
            'STATUS_UPDATE': '#3B82F6',
            'ASSIGNMENT': '#6366F1',
            'APPROVAL': '#10B981',
            'REJECTION': '#EF4444',
            'CLOSURE': '#64748B',
            'SLA_WARNING': '#F59E0B',
            'FEEDBACK': '#EC4899'
        };
        return colors[type] || brandColor;
    };

    const recentNotifications = (notifications || []).slice(0, 5);

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className={`notification-bell-button ${unreadCount > 0 ? 'has-unread' : 'is-empty'}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
                style={darkIcon ? (unreadCount > 0 ? { color: brandColor } : { color: '#64748B' }) : { color: '#FFFFFF' }}
            >
                <Bell size={22} fill={(unreadCount > 0 && darkIcon) ? brandColor : 'none'} style={{ opacity: (unreadCount > 0 || !darkIcon) ? 1 : 0.6 }} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown shadow-lg animate-slideDown">
                    <div className="notification-dropdown-header" style={{ background: brandGradient }}>
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

                    {unreadCount > 0 && (
                        <div className="notification-actions bg-light">
                            <button
                                className="mark-all-read-btn fw-black extra-small tracking-widest text-uppercase"
                                onClick={handleMarkAllRead}
                            >
                                <CheckCheck size={14} className="me-2" />
                                Mark all as read
                            </button>
                        </div>
                    )}

                    <div className="notification-list custom-scrollbar">
                        {recentNotifications.length > 0 ? (
                            recentNotifications.map((notification) => {
                                const color = getTypeColor(notification.type);
                                return (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-icon" style={{
                                            backgroundColor: notification.priority === 'CRITICAL' ? '#FEF2F2' : `${color}15`,
                                            color: notification.priority === 'CRITICAL' ? '#EF4444' : color,
                                            border: notification.priority === 'CRITICAL' ? '1px solid #FEE2E2' : 'none'
                                        }}>
                                            {getNotificationIcon(notification.type, notification.icon)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-message fw-bold">
                                                {notification.message}
                                            </div>
                                            <div className="notification-time extra-small">
                                                <Activity size={10} className="me-1" />
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </div>
                                            {notification.complaintId && (
                                                <div className="mt-1 extra-small fw-black opacity-75 text-uppercase tracking-wider" style={{ color: brandColor }}>
                                                    ID: #{notification.complaintId}
                                                </div>
                                            )}
                                        </div>
                                        {!notification.isRead && (
                                            <div className="unread-dot-indicator" style={{ backgroundColor: brandColor, boxShadow: `0 0 0 4px ${brandColor}15` }}></div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-notifications py-5">
                                <Bell size={48} className="no-notifications-icon opacity-20 mb-3" />
                                <p className="fw-black text-muted text-uppercase extra-small tracking-widest">No Alerts</p>
                                <span className="extra-small text-muted opacity-50">Your inbox is currently empty.</span>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-dropdown-footer">
                            <button
                                className="view-all-btn fw-black extra-small tracking-widest text-uppercase"
                                style={{ backgroundColor: brandColor, boxShadow: `0 10px 20px ${brandColor}22` }}
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
                                View full history
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
