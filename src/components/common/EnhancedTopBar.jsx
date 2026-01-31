/**
 * Enhanced Top Bar Component
 * Professional header with user profile, notifications, and role display
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import apiService from '../../api/apiService';

export default function EnhancedTopBar({ title = "Dashboard" }) {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [profile, setProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Get user data from localStorage
    const userName = localStorage.getItem('name') || localStorage.getItem('email') || 'User';
    const userRole = localStorage.getItem('role') || 'USER';
    const userEmail = localStorage.getItem('email') || '';

    useEffect(() => {
        loadProfile();
        loadNotifications();
    }, []);

    const loadProfile = async () => {
        try {
            const role = localStorage.getItem('role');
            let profileData;

            if (role === 'CITIZEN') {
                profileData = await apiService.citizen.getProfile();
            } else if (role === 'DEPARTMENT_OFFICER' || role === 'WARD_OFFICER') {
                profileData = await apiService.profile.getOfficerProfile();
            } else if (role === 'ADMIN') {
                // Admin might not have a specific profile endpoint, use stored data
                profileData = {
                    name: userName,
                    email: userEmail,
                    role: userRole
                };
            }

            setProfile(profileData);
        } catch (error) {
            console.error('Error loading profile:', error);
            // Use localStorage data as fallback
            setProfile({
                name: userName,
                email: userEmail,
                role: userRole
            });
        }
    };

    const loadNotifications = async () => {
        try {
            const notifs = await apiService.notifications.getAll();
            const notifArray = Array.isArray(notifs) ? notifs : (notifs.content || []);
            setNotifications(notifArray.slice(0, 5)); // Show latest 5
            setUnreadCount(notifArray.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleProfileClick = () => {
        const role = localStorage.getItem('role');
        if (role === 'CITIZEN') {
            navigate('/citizen/profile');
        } else if (role === 'DEPARTMENT_OFFICER') {
            navigate('/department/profile');
        } else if (role === 'WARD_OFFICER') {
            navigate('/ward-officer/profile');
        } else if (role === 'ADMIN') {
            navigate('/admin/profile');
        }
        setShowProfileMenu(false);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800';
            case 'WARD_OFFICER': return 'bg-blue-100 text-blue-800';
            case 'DEPARTMENT_OFFICER': return 'bg-green-100 text-green-800';
            case 'CITIZEN': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatRole = (role) => {
        return role.split('_').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    return (
        <div className="gov-header" style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="header-content" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                maxWidth: '100%'
            }}>
                {/* Left: Title */}
                <div className="header-left">
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {title}
                    </h1>
                </div>

                {/* Right: Notifications + Profile */}
                <div className="header-right" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                }}>
                    {/* Notifications */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{
                                position: 'relative',
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: 'white'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    background: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 0.5rem)',
                                background: 'white',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                minWidth: '300px',
                                maxHeight: '400px',
                                overflowY: 'auto',
                                zIndex: 1000
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                        Notifications
                                    </h3>
                                </div>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map((notif, index) => (
                                        <div key={index} style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid #f3f4f6',
                                            background: notif.read ? 'white' : '#eff6ff'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#111827' }}>
                                                {notif.message}
                                            </p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: 'white'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                            }}>
                                {(profile?.name || userName).charAt(0).toUpperCase()}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                    {profile?.name || userName}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    opacity: 0.9
                                }}>
                                    {formatRole(userRole)}
                                </div>
                            </div>
                            <ChevronDown size={16} />
                        </button>

                        {/* Profile Dropdown */}
                        {showProfileMenu && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 0.5rem)',
                                background: 'white',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                minWidth: '200px',
                                zIndex: 1000
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                    <div style={{ fontWeight: '600', color: '#111827' }}>
                                        {profile?.name || userName}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {profile?.email || userEmail}
                                    </div>
                                    <span className={`${getRoleBadgeColor(userRole)}`} style={{
                                        display: 'inline-block',
                                        marginTop: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {formatRole(userRole)}
                                    </span>
                                </div>
                                <button
                                    onClick={handleProfileClick}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#374151',
                                        fontSize: '0.875rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                    onMouseLeave={(e) => e.target.style.background = 'none'}
                                >
                                    <User size={16} />
                                    View Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'none',
                                        border: 'none',
                                        borderTop: '1px solid #e5e7eb',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        fontSize: '0.875rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                    onMouseLeave={(e) => e.target.style.background = 'none'}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
