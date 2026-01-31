import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import './OTPNotification.css';

/**
 * OTP Notification Component
 * Displays OTP-related notifications with countdown and actions
 */
const OTPNotification = ({
    type = 'info',
    message,
    otp = null,
    duration = 5000,
    onClose,
    showCountdown = false,
    countdownSeconds = 300 // 5 minutes default
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [countdown, setCountdown] = useState(countdownSeconds);

    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    useEffect(() => {
        if (showCountdown && countdown > 0) {
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [showCountdown, countdown]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="otp-notification-icon" />;
            case 'error':
                return <AlertCircle className="otp-notification-icon" />;
            case 'warning':
                return <AlertCircle className="otp-notification-icon" />;
            default:
                return <Info className="otp-notification-icon" />;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVisible) return null;

    return (
        <div className={`otp-notification otp-notification-${type} ${isVisible ? 'otp-notification-enter' : 'otp-notification-exit'}`}>
            <div className="otp-notification-content">
                <div className="otp-notification-header">
                    {getIcon()}
                    <div className="otp-notification-message">
                        <p className="otp-notification-text">{message}</p>
                        {otp && (
                            <div className="otp-code-display">
                                <span className="otp-label">OTP Code:</span>
                                <span className="otp-code">{otp}</span>
                                <button
                                    className="otp-copy-btn"
                                    onClick={() => {
                                        navigator.clipboard.writeText(otp);
                                        // Could add a mini toast here
                                    }}
                                    title="Copy OTP"
                                >
                                    Copy
                                </button>
                            </div>
                        )}
                        {showCountdown && countdown > 0 && (
                            <div className="otp-countdown">
                                <Clock size={14} />
                                <span>Expires in: {formatTime(countdown)}</span>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    className="otp-notification-close"
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    <X size={18} />
                </button>
            </div>
            {duration && duration > 0 && (
                <div
                    className="otp-notification-progress"
                    style={{ animationDuration: `${duration}ms` }}
                />
            )}
        </div>
    );
};

/**
 * OTP Notification Container
 * Manages multiple OTP notifications
 */
export const OTPNotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div className="otp-notification-container">
            {notifications.map((notification, index) => (
                <OTPNotification
                    key={notification.id || index}
                    {...notification}
                    onClose={() => onRemove(notification.id || index)}
                />
            ))}
        </div>
    );
};

export default OTPNotification;
