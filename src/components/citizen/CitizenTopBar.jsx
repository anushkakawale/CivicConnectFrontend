import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Settings } from 'lucide-react';
import NotificationDropdown from '../notifications/NotificationDropdown';
import ThemeToggle from '../ui/ThemeToggle';
import authService from '../../services/authService';
import citizenService from '../../services/citizenService';

const CitizenTopBar = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await citizenService.getNotifications();
            const data = Array.isArray(response) ? response : (response?.data || []);
            setNotifications(data.slice(0, 5)); // Show latest 5
            setUnreadCount(data.filter(n => !n.seen).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            // Don't show error to user, just set empty state
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const formatNotificationTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'COMPLAINT_REGISTERED': '📝',
            'COMPLAINT_ASSIGNED': '👤',
            'COMPLAINT_IN_PROGRESS': '🔧',
            'COMPLAINT_RESOLVED': '✅',
            'COMPLAINT_CLOSED': '🔒',
            'SLA_WARNING': '⚠️',
            'SLA_BREACHED': '🚨',
            'WARD_CHANGE_APPROVED': '✓',
            'FEEDBACK_REQUESTED': '⭐'
        };
        return icons[type] || '🔔';
    };

    return (
        <div className="bg-white border-bottom shadow-sm">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center py-3">
                    {/* Left: Brand */}
                    <div>
                        <h5 className="mb-0 fw-bold text-primary">
                            CivicConnect <span className="text-muted fs-6 fw-normal">| Pune Municipal Corporation</span>
                        </h5>
                    </div>

                    {/* Right: Actions */}
                    <div className="d-flex align-items-center gap-3">
                        {/* Theme Toggle */}
                        <ThemeToggle />
                        {/* Notifications */}
                        <div className="position-relative">
                            <button
                                className="btn btn-light position-relative"
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowProfile(false);
                                }}
                                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: '0' }}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        style={{ fontSize: '10px' }}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div
                                    className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg"
                                    style={{ width: '350px', maxHeight: '400px', overflow: 'auto', zIndex: 1050 }}
                                >
                                    <div className="p-3 border-bottom bg-light">
                                        <h6 className="mb-0 fw-bold">Notifications</h6>
                                    </div>
                                    <div>
                                        {notifications.length === 0 ? (
                                            <div className="text-center py-4 text-muted">
                                                <Bell size={32} className="mb-2 opacity-50" />
                                                <p className="mb-0 small">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map((notification, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-3 border-bottom ${!notification.seen ? 'bg-light' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="d-flex align-items-start gap-2">
                                                        <span style={{ fontSize: '20px' }}>
                                                            {getNotificationIcon(notification.type)}
                                                        </span>
                                                        <div className="flex-grow-1">
                                                            <p className="mb-1 small fw-semibold">{notification.message}</p>
                                                            <small className="text-muted">
                                                                {formatNotificationTime(notification.createdAt)}
                                                            </small>
                                                        </div>
                                                        {!notification.seen && (
                                                            <span className="badge bg-primary rounded-pill" style={{ fontSize: '8px' }}>
                                                                NEW
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-2 border-top text-center">
                                            <button className="btn btn-sm btn-link text-decoration-none">
                                                View All Notifications
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="position-relative">
                            <button
                                className="btn btn-light d-flex align-items-center gap-2"
                                onClick={() => {
                                    setShowProfile(!showProfile);
                                    setShowNotifications(false);
                                }}
                                style={{ borderRadius: '20px' }}
                            >
                                <User size={18} />
                                <span className="small fw-semibold">{user?.email?.split('@')[0] || 'User'}</span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfile && (
                                <div
                                    className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg"
                                    style={{ width: '220px', zIndex: 1050 }}
                                >
                                    <div className="p-3 border-bottom">
                                        <p className="mb-0 fw-semibold small">{user?.email}</p>
                                        <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>
                                            Role: {user?.role || 'Citizen'}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            className="btn btn-link text-decoration-none text-dark w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
                                            onClick={() => {
                                                navigate('/citizen/profile');
                                                setShowProfile(false);
                                            }}
                                        >
                                            <Settings size={16} />
                                            <span className="small">Profile Settings</span>
                                        </button>
                                        <hr className="my-1" />
                                        <button
                                            className="btn btn-link text-decoration-none text-danger w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={16} />
                                            <span className="small">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showNotifications || showProfile) && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1040 }}
                    onClick={() => {
                        setShowNotifications(false);
                        setShowProfile(false);
                    }}
                />
            )}
        </div>
    );
};

export default CitizenTopBar;
