/**
 * Department Notifications Page
 * Display and manage notifications for department officers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SharedNotificationList from '../../components/common/SharedNotificationList';
import './DepartmentNotifications.css';

const DepartmentNotifications = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotifications();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                await markAsRead(notification.id);
            }

            // Navigate to complaint if there's a reference
            if (notification.referenceId) {
                navigate(`/department/complaints/${notification.referenceId}`);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
            showToast('Failed to process notification', 'error');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            showToast('All notifications marked as read', 'success');
        } catch (error) {
            console.error('Error marking all as read:', error);
            showToast('Failed to mark all as read', 'error');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="department-notifications-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <Bell size={32} />
                        Notifications
                    </h1>
                    <p>Stay updated with your complaint assignments and updates</p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn-mark-all-read" onClick={handleMarkAllAsRead}>
                        <CheckCircle size={18} />
                        Mark All as Read ({unreadCount})
                    </button>
                )}
            </div>

            <SharedNotificationList
                notifications={notifications}
                onClear={markAsRead}
                onClearAll={handleMarkAllAsRead}
                onItemClick={handleNotificationClick}
                emptyMessage="You're all caught up! No new notifications at the moment."
            />
        </div>
    );
};

export default DepartmentNotifications;
