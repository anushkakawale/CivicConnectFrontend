import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle, X } from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SharedNotificationList from '../../components/common/SharedNotificationList';

const WardNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiService.shared.getNotifications();
            setNotifications(response.data || response || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Mock data for demonstration
            setNotifications([
                {
                    id: 1,
                    title: 'New Complaint Registered',
                    message: 'A new complaint has been registered in your ward',
                    type: 'info',
                    read: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'SLA Breach Warning',
                    message: 'Complaint #123 is approaching SLA breach',
                    type: 'warning',
                    read: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 3,
                    title: 'Complaint Resolved',
                    message: 'Complaint #456 has been marked as resolved',
                    type: 'success',
                    read: true,
                    createdAt: new Date(Date.now() - 7200000).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiService.shared.markNotificationRead(id);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiService.shared.markAllNotificationsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <Check className="text-success" size={24} />;
            case 'warning':
                return <AlertCircle className="text-warning" size={24} />;
            case 'error':
                return <X className="text-danger" size={24} />;
            default:
                return <Bell className="text-info" size={24} />;
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-2">
                                <Bell className="me-2" size={32} />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="badge bg-danger ms-2">{unreadCount}</span>
                                )}
                            </h2>
                            <p className="text-muted">Stay updated with important alerts and updates</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-primary"
                                onClick={markAllAsRead}
                            >
                                <Check size={18} className="me-2" />
                                Mark All as Read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="btn-group" role="group">
                        <button
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            className={`btn ${filter === 'read' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setFilter('read')}
                        >
                            Read ({notifications.length - unreadCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="row">
                <div className="col-12">
                    <SharedNotificationList
                        notifications={filteredNotifications}
                        onClear={markAsRead}
                        onClearAll={markAllAsRead}
                        emptyMessage={filter === 'all' ? 'You have no notifications yet.' : `No ${filter} notifications.`}
                    />
                </div>
            </div>
        </div>
    );
};

export default WardNotifications;
