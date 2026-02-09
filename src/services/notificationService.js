/**
 * Notification Service
 * Handles all notification-related API calls
 * Delegates to centralized apiService
 */

import apiService from '../api/apiService';

class NotificationService {
    async getNotifications() {
        try {
            const response = await apiService.notifications.getAll();
            return response.data;
        } catch (error) {
            console.error('Failed to get notifications:', error);
            return [];
        }
    }

    async getStats() {
        try {
            const response = await apiService.notifications.getStats();
            return response.data || { unreadCount: 0, unseenCount: 0 };
        } catch (error) {
            console.error('Failed to get notification stats:', error);
            return { unreadCount: 0, unseenCount: 0 };
        }
    }

    async markAsRead(notificationId) {
        return apiService.notifications.markAsRead(notificationId);
    }

    async markAllAsRead() {
        return apiService.notifications.markAllAsRead();
    }

    async markAsSeen(id) {
        return apiService.notifications.markAsSeen(id);
    }

    async markAllAsSeen() {
        return apiService.notifications.markAllAsSeen();
    }

    async deleteNotification(id) {
        return apiService.notifications.delete(id);
    }
}

export default new NotificationService();
