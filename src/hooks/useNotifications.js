import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

/**
 * Custom hook for managing notifications
 * Handles 403 errors gracefully and provides fallback
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unseenCount, setUnseenCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notificationService.getNotifications();
            setNotifications(data || []);

            // Fetch live stats for precision
            const stats = await notificationService.getStats();
            setUnreadCount(stats.unreadCount || 0);
            setUnseenCount(stats.unseenCount || 0);
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

    const fetchStats = async () => {
        try {
            const stats = await notificationService.getStats();
            setUnreadCount(stats.unreadCount || 0);
            setUnseenCount(stats.unseenCount || 0);
        } catch (err) {
            // Handle 403 Forbidden errors gracefully
            if (err.response?.status === 403) {
                console.warn('⚠️ Notifications stats endpoint not accessible (403 Forbidden).');
                setUnreadCount(0);
                setUnseenCount(0);
            } else {
                console.error('❌ Error fetching notification stats:', err);
                setUnreadCount(0);
                setUnseenCount(0);
            }
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state with dual ID support
            setNotifications(prev =>
                prev.map(n => {
                    const currentId = n.id || n.notificationId;
                    return currentId === notificationId ? { ...n, isRead: true } : n;
                })
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
            if (err.response?.status === 403) {
                console.warn('⚠️ Mark all read restricted (403). Optimistically updating UI.');
                // Optimistically update even if forbidden, to clear the annoying badge
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            } else {
                console.error('❌ Error marking all notifications as read:', err);
            }
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => (n.id || n.notificationId) !== notificationId));

            // Recalculate unread if necessary
            setUnreadCount(prev => {
                const deleted = notifications.find(n => (n.id || n.notificationId) === notificationId);
                return deleted && !deleted.isRead ? Math.max(0, prev - 1) : prev;
            });
        } catch (err) {
            console.error('❌ Error deleting notification:', err);
        }
    };

    const markAllAsSeen = async () => {
        try {
            await notificationService.markAllAsSeen();
            setUnseenCount(0);
        } catch (err) {
            // Handle 403 Forbidden errors gracefully
            if (err.response?.status === 403) {
                console.warn('⚠️ Mark all as seen endpoint not accessible (403 Forbidden).');
                // Optimistically clear unseen count to avoid UI issues
                setUnseenCount(0);
            } else {
                console.error('❌ Error marking all notifications as seen:', err);
            }
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Refresh every 5 seconds for real-time responsiveness
        const interval = setInterval(fetchNotifications, 5000);

        return () => clearInterval(interval);
    }, []);

    return {
        notifications,
        unreadCount,
        unseenCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        markAllAsSeen,
        deleteNotification,
        fetchNotifications,
        refresh: fetchNotifications
    };
};

export default useNotifications;
