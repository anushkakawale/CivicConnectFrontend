import { useState, useCallback } from 'react';

/**
 * Custom hook for managing OTP notifications
 * Provides methods to show, hide, and manage OTP-related notifications
 */
export const useOTPNotification = () => {
    const [notifications, setNotifications] = useState([]);

    /**
     * Show an OTP notification
     * @param {Object} options - Notification options
     * @param {string} options.type - Notification type (success, error, warning, info)
     * @param {string} options.message - Notification message
     * @param {string} options.otp - OTP code to display
     * @param {number} options.duration - Auto-close duration in ms (0 for no auto-close)
     * @param {boolean} options.showCountdown - Show countdown timer
     * @param {number} options.countdownSeconds - Countdown duration in seconds
     */
    const showOTPNotification = useCallback((options) => {
        const {
            type = 'info',
            message,
            otp = null,
            duration = 5000,
            showCountdown = false,
            countdownSeconds = 300
        } = options;

        const id = Date.now() + Math.random();

        const notification = {
            id,
            type,
            message,
            otp,
            duration,
            showCountdown,
            countdownSeconds
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove if duration is set
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    /**
     * Show success notification
     */
    const showSuccess = useCallback((message, otp = null, duration = 5000) => {
        return showOTPNotification({
            type: 'success',
            message,
            otp,
            duration
        });
    }, [showOTPNotification]);

    /**
     * Show error notification
     */
    const showError = useCallback((message, duration = 5000) => {
        return showOTPNotification({
            type: 'error',
            message,
            duration
        });
    }, [showOTPNotification]);

    /**
     * Show warning notification
     */
    const showWarning = useCallback((message, duration = 5000) => {
        return showOTPNotification({
            type: 'warning',
            message,
            duration
        });
    }, [showOTPNotification]);

    /**
     * Show info notification
     */
    const showInfo = useCallback((message, duration = 5000) => {
        return showOTPNotification({
            type: 'info',
            message,
            duration
        });
    }, [showOTPNotification]);

    /**
     * Show OTP sent notification with countdown
     */
    const showOTPSent = useCallback((otp = null, mobile = null) => {
        const message = mobile
            ? `OTP sent to ${mobile}`
            : 'OTP sent successfully';

        return showOTPNotification({
            type: 'success',
            message,
            otp,
            duration: 0, // Don't auto-close
            showCountdown: true,
            countdownSeconds: 300 // 5 minutes
        });
    }, [showOTPNotification]);

    /**
     * Show OTP verified notification
     */
    const showOTPVerified = useCallback(() => {
        return showOTPNotification({
            type: 'success',
            message: 'OTP verified successfully!',
            duration: 3000
        });
    }, [showOTPNotification]);

    /**
     * Show OTP expired notification
     */
    const showOTPExpired = useCallback(() => {
        return showOTPNotification({
            type: 'warning',
            message: 'OTP has expired. Please request a new one.',
            duration: 5000
        });
    }, [showOTPNotification]);

    /**
     * Show OTP invalid notification
     */
    const showOTPInvalid = useCallback(() => {
        return showOTPNotification({
            type: 'error',
            message: 'Invalid OTP. Please check and try again.',
            duration: 5000
        });
    }, [showOTPNotification]);

    /**
     * Remove a specific notification
     */
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    /**
     * Clear all notifications
     */
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        showOTPNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showOTPSent,
        showOTPVerified,
        showOTPExpired,
        showOTPInvalid,
        removeNotification,
        clearAll
    };
};

export default useOTPNotification;
