import { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../api/apiService';
import { useToast } from './useToast';

/**
 * 🛰️ Global Notification Orchestration Hook
 * Manages fetching, marking, and filtering of system-wide alerts.
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Memoized counts to avoid unnecessary re-calculations
    const readCount = useMemo(() => notifications.filter(n => n.isRead).length, [notifications]);
    const unreadList = useMemo(() => notifications.filter(n => !n.isRead), [notifications]);
    const readList = useMemo(() => notifications.filter(n => n.isRead), [notifications]);

    const fetchNotifications = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await apiService.notifications.getAll();
            const data = response.data || response;
            const notificationList = Array.isArray(data) ? data : (data.content || []);

            // Sort by date descending
            notificationList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setNotifications(notificationList);

            // Sync unread count
            const count = notificationList.filter(n => !n.isRead).length;
            setUnreadCount(count);
        } catch (error) {
            if (error.response?.status !== 403) {
                console.error('❌ Notification synchronization failed:', error);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        if (!notificationId) return;

        // Optimistic UI update
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId || n.notificationId === notificationId)
                ? { ...n, isRead: true }
                : n
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await apiService.notifications.markAsRead(notificationId);
            // Optionally fetch to confirm backend state
            // fetchNotifications(true); 
        } catch (error) {
            console.error('❌ Failed to update notification state:', error);
            // Revert on error if necessary, but usually backend catchup is fine
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        // Optimistic UI update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await apiService.notifications.markAllAsRead();
            showToast('All messages archived as read', 'success');
        } catch (error) {
            console.error('❌ Mark all read failed:', error);
            fetchNotifications(true); // Sync back on error
        }
    }, [fetchNotifications, showToast]);

    const markAllAsSeen = useCallback(async () => {
        try {
            await apiService.notifications.markAllAsSeen();
        } catch (error) {
            if (error.response?.status !== 403) {
                console.error('❌ Clear seen status failed:', error);
            }
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        if (!notificationId) return;

        const wasUnread = notifications.find(n => (n.id === notificationId || n.notificationId === notificationId) && !n.isRead);

        setNotifications(prev => prev.filter(n => n.id !== notificationId && n.notificationId !== notificationId));
        if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await apiService.notifications.delete(notificationId);
        } catch (error) {
            console.error('❌ Message deletion failed:', error);
            fetchNotifications(true);
        }
    }, [notifications, fetchNotifications]);

    // Initial load and polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), 30000); // Pulse every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        readCount,
        unreadList,
        readList,
        loading,
        markAsRead,
        markAllAsRead,
        markAllAsSeen,
        deleteNotification,
        fetchNotifications
    };
};

export default useNotifications;
