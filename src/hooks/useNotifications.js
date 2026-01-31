import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

/**
 * Custom hook for managing notifications
 * Handles 403 errors gracefully and provides fallback
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notificationService.getNotifications();
            setNotifications(data || []);

            // Count unread
            const unread = (data || []).filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (err) {
            // Handle 403 Forbidden errors gracefully
            if (err.response?.status === 403) {
                console.warn('⚠️ Notifications endpoint not accessible (403 Forbidden).');
                console.warn('💡 Backend needs to update @PreAuthorize to allow all authenticated users.');
                console.warn('📝 Setting notifications to empty array as fallback.');
                setNotifications([]);
                setUnreadCount(0);
                setError('Notifications not available');
            } else {
                console.error('❌ Error fetching notifications:', err);
                setNotifications([]);
                setUnreadCount(0);
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const data = await notificationService.getUnreadCount();
            setUnreadCount(data);
        } catch (err) {
            // Handle 403 Forbidden errors gracefully
            if (err.response?.status === 403) {
                console.warn('⚠️ Notifications count endpoint not accessible (403 Forbidden).');
                setUnreadCount(0);
            } else {
                console.error('❌ Error fetching unread count:', err);
                setUnreadCount(0);
            }
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('❌ Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('❌ Error marking all notifications as read:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        refresh: fetchNotifications
    };
};

export default useNotifications;
