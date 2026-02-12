/**
 * Enhanced Notification Bell Component - PMC Strategic System
 * High-fidelity tactical dispatch alerts for authorized personnel and citizens.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, BellDot, Check, CheckCheck, X, Zap, Shield, Activity, Layers, Info, AlertTriangle, RefreshCw, Settings, ShieldAlert, ChevronRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

const NotificationBell = ({ darkIcon = false }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const {
        notifications, unreadCount, markAsRead,
        markAllAsRead, markAllAsSeen, fetchNotifications
    } = useNotifications();

    const brandColor = '#173470';
    const brandGradient = 'linear-gradient(135deg, #173470 0%, #112652 100%)';

    // Prioritize unread notifications, then newest first
    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [notifications]);

    const recentNotifications = useMemo(() => sortedNotifications.slice(0, 7), [sortedNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Mark all as seen silently when opening the bell
            markAllAsSeen();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, markAllAsSeen]);

    const handleNotificationClick = async (n) => {
        try {
            const nId = n.id || n.notificationId;
            if (!nId) return;

            if (!n.isRead) {
                await markAsRead(nId);
            }

            const cId = n.complaintId || n.referenceId;
            const role = localStorage.getItem('role');

            let path = '/';
            if (cId) {
                if (role === 'ADMIN') path = `/admin/complaints/${cId}`;
                else if (role === 'WARD_OFFICER') path = `/ward-officer/complaints/${cId}`;
                else if (role === 'DEPARTMENT_OFFICER') path = `/department/complaints/${cId}`;
                else path = `/citizen/complaints/${cId}`;
            } else {
                if (role === 'ADMIN') path = '/admin/notifications';
                else if (role === 'WARD_OFFICER') path = '/ward-officer/notifications';
                else if (role === 'DEPARTMENT_OFFICER') path = '/department/notifications';
                else path = '/citizen/notifications';
            }

            navigate(path);
        } catch (err) {
            console.error('Notification action failed:', err);
        } finally {
            setIsOpen(false);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'NEW_COMPLAINT': <Shield size={18} />,
            'STATUS_UPDATE': <RefreshCw size={18} />,
            'ASSIGNMENT': <Layers size={18} />,
            'APPROVAL': <CheckCheck size={18} />,
            'REJECTION': <X size={18} />,
            'CLOSURE': <Zap size={18} />,
            'SLA_WARNING': <AlertTriangle size={18} />,
            'FEEDBACK': <Info size={18} />,
            'OTP': <ShieldAlert size={18} />,
            'SYSTEM': <Settings size={18} />
        };
        return icons[type] || <Bell size={18} />;
    };

    const getTypeColor = (type) => {
        const colors = {
            'NEW_COMPLAINT': '#173470',
            'STATUS_UPDATE': '#3B82F6',
            'ASSIGNMENT': '#6366F1',
            'APPROVAL': '#10B981',
            'REJECTION': '#EF4444',
            'CLOSURE': '#64748B',
            'SLA_WARNING': '#F59E0B',
            'FEEDBACK': '#EC4899'
        };
        return colors[type] || brandColor;
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className={`notification-bell-button ${unreadCount > 0 ? 'has-unread' : 'is-empty'}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
                style={darkIcon ? (unreadCount > 0 ? { color: brandColor } : { color: '#64748B' }) : { color: '#FFFFFF' }}
            >
                {unreadCount > 0 ? <BellDot size={22} className="animate-pulse" /> : <Bell size={22} style={{ opacity: darkIcon ? 1 : 0.8 }} />}
                {unreadCount > 0 && (
                    <span className="notification-badge shadow-lg border border-white border-opacity-20">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown shadow-2xl animate-slideDown overflow-hidden border-0 rounded-4">
                    <div className="notification-dropdown-header px-4 py-4 d-flex align-items-center justify-content-between" style={{ background: brandGradient }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-white bg-opacity-20 p-2 d-flex align-items-center justify-content-center">
                                <Activity size={18} className="text-white" />
                            </div>
                            <div className="d-flex flex-column">
                                <span className="fw-black text-white text-uppercase tracking-widest" style={{ fontSize: '0.7rem' }}>Intelligence Center</span>
                                <span className="extra-small text-white opacity-60 fw-bold uppercase">Real-time Command Feed</span>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <span className="badge bg-white text-primary rounded-pill extra-small fw-black" style={{ color: brandColor, padding: '4px 10px' }}>{unreadCount} NEW</span>
                        )}
                    </div>

                    <div className="notification-list custom-scrollbar bg-white">
                        {unreadCount > 0 && (
                            <div className="px-4 py-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                                <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-60">Pending Directives</span>
                                <button className="btn btn-link p-0 extra-small fw-black text-primary text-uppercase text-decoration-none border-0" onClick={markAllAsRead}>
                                    Mark all read
                                </button>
                            </div>
                        )}

                        {recentNotifications.length > 0 ? (
                            recentNotifications.map((n) => {
                                const color = getTypeColor(n.type);
                                const nId = n.id || n.notificationId;
                                return (
                                    <div
                                        key={nId}
                                        className={`notification-item p-4 d-flex align-items-start gap-4 transition-all ${n.isRead ? 'opacity-60 bg-white' : 'unread-premium shadow-sm'}`}
                                        onClick={() => handleNotificationClick(n)}
                                        style={!n.isRead ? { borderLeft: `4px solid ${brandColor}` } : {}}
                                    >
                                        <div className="rounded-4 p-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
                                            {getNotificationIcon(n.type)}
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">{n.type?.replace('_', ' ') || 'SYSTEM'}</span>
                                                <span className="extra-small text-muted fw-bold opacity-40">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                                            </div>
                                            <div className={`small mb-1 ${!n.isRead ? 'fw-black text-dark' : 'fw-bold text-muted'}`}>
                                                {n.message}
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                {(n.complaintId || n.referenceId) && (
                                                    <div className="extra-small fw-black uppercase tracking-widest px-2 py-0.5 rounded bg-light border" style={{ color: brandColor, fontSize: '0.6rem' }}>
                                                        NODE: #{n.complaintId || n.referenceId}
                                                    </div>
                                                )}
                                                {!n.isRead && (
                                                    <div className="extra-small fw-black text-primary uppercase animate-pulse" style={{ fontSize: '0.55rem', color: brandColor }}>
                                                        Action Required
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!n.isRead && <div className="p-1 rounded-circle mt-1" style={{ backgroundColor: brandColor }}></div>}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-notifications py-5 text-center px-4">
                                <div className="rounded-circle bg-light d-inline-flex p-4 mb-3">
                                    <Target size={40} className="text-muted opacity-10" />
                                </div>
                                <h6 className="fw-black text-muted text-uppercase extra-small tracking-widest mb-1">Spectrum Clean</h6>
                                <p className="extra-small text-muted opacity-40 fw-bold mb-0">Operational directives current at nominal levels.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-light border-top">
                        <button
                            className="btn btn-primary w-100 rounded-pill py-3 fw-black extra-small tracking-widest text-uppercase shadow-lg border-0 transition-all hover-up-tiny"
                            style={{ background: brandGradient }}
                            onClick={() => {
                                const role = localStorage.getItem('role');
                                const path = role === 'ADMIN' ? '/admin/notifications' :
                                    role === 'WARD_OFFICER' ? '/ward-officer/notifications' :
                                        role === 'DEPARTMENT_OFFICER' ? '/department/notifications' :
                                            '/citizen/notifications';
                                navigate(path);
                                setIsOpen(false);
                            }}
                        >
                            Executive Feed Overview <ChevronRight size={14} className="ms-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
