/**
 * Notification Service
 * Handles all notification-related API calls
 * Delegates to centralized apiService
 */

import apiService from '../api/apiService';

class NotificationService {
    async getNotifications() {
        const response = await apiService.notifications.getUnread();
        return response.data;
    }

    async getUnreadCount() {
        try {
            const response = await apiService.notifications.getStats();
            // Assuming response.data has unreadCount or returning correct number
            return response.data;
        } catch (error) {
            console.error('Failed to get unread count:', error);
            return 0;
        }
    }

    async markAsRead(notificationId) {
        return apiService.notifications.markAsRead(notificationId);
    }

    async markAllAsRead() {
        return apiService.notifications.markAllAsRead();
    }
}

export default new NotificationService();
