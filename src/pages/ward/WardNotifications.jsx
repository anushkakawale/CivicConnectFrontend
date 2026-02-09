/**
 * Ward Notifications Page - Teal Design System
 * Tactical Command Dispatch for Ward Executives
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CheckCircle, Clock, AlertCircle, Info, FileText,
    RefreshCw, CheckCheck, Filter, Trash2, Activity,
    Zap, Ghost, Layers, Navigation
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import DashboardHeader from '../../components/layout/DashboardHeader';

const WardNotifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications
    } = useNotifications();

    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread' && n.isRead) return false;
        if (filter === 'read' && !n.isRead) return false;
        return true;
    });

    const getIcon = (type) => {
        const icons = {
            'NEW_COMPLAINT': Bell,
            'STATUS_UPDATE': Zap,
            'ASSIGNMENT': Layers,
            'RESOLUTION': CheckCircle,
            'CLOSURE': CheckCircle,
            'SLA_WARNING': Clock,
            'APPROVAL': CheckCheck,
            'REJECTION': AlertCircle
        };
        return icons[type] || Bell;
    };

    const getTypeColor = (type) => {
        const colors = {
            'RESOLUTION': '#10B981',
            'SLA_WARNING': '#EF4444',
            'ASSIGNMENT': '#1254AF',
            'STATUS_UPDATE': '#3B82F6',
            'REJECTION': '#EF4444'
        };
        return colors[type] || '#173470';
    };

    const handleNotificationClick = async (n) => {
        const cId = n.complaintId || n.referenceId;
        if (!n.isRead) await markAsRead(n.id || n.notificationId);
        if (cId) navigate(`/ward-officer/complaints/${cId}`);
    };

    if (loading && notifications.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Bell className="animate-spin text-primary mb-4" size={56} style={{ color: '#173470' }} />
            <p className="fw-black text-primary text-uppercase tracking-widest" style={{ color: '#173470' }}>Accessing Command Feed...</p>
        </div>
    );

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#F8FAFC', padding: '2rem' }}>

            <DashboardHeader
                portalName="PMC WARD CONSOLE"
                userName={localStorage.getItem('name') || 'Ward Executive'}
                wardName="COMMAND FEED"
                subtitle="Official Jurisdictional Alerts & Nodal Oversight Stream"
                icon={Bell}
            />

            <div className="row g-4">
                <div className="col-lg-3">
                    <div className="card border-0 shadow-sm rounded-0 bg-white p-4 sticky-top" style={{ top: '2rem' }}>
                        <h6 className="fw-black text-muted extra-small tracking-widest uppercase mb-4">Command Filter</h6>
                        <div className="d-flex flex-column gap-2">
                            {['all', 'unread', 'read'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`btn rounded-0 px-4 py-3 text-start fw-bold transition-all d-flex align-items-center justify-content-between ${filter === f ? 'bg-primary text-white shadow-md' : 'text-muted hover-bg-light'}`}
                                    style={{ backgroundColor: filter === f ? '#173470' : 'transparent' }}
                                >
                                    <span className="text-uppercase extra-small tracking-widest">{f} Command</span>
                                    <span className="badge bg-white bg-opacity-20 rounded-0">{f === 'all' ? notifications.length : f === 'unread' ? unreadCount : notifications.length - unreadCount}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-lg-9">
                    {filteredNotifications.length === 0 ? (
                        <div className="card border-0 shadow-sm rounded-0 bg-white p-5 text-center">
                            <Ghost size={64} className="text-muted opacity-25 mb-3 mx-auto" />
                            <h4 className="fw-black text-muted tracking-widest uppercase">Spectrum Clean</h4>
                            <p className="text-muted fw-bold">No active command alerts in the current sector.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {filteredNotifications.map(n => {
                                const Icon = getIcon(n.type);
                                const color = getTypeColor(n.type);
                                return (
                                    <div
                                        key={n.id || n.notificationId}
                                        className={`card border-0 shadow-sm rounded-0 transition-all cursor-pointer border-hover-primary ${!n.isRead ? 'bg-white' : 'bg-light opacity-75'}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="card-body p-4 d-flex align-items-center gap-4">
                                            <div className="p-3 rounded-0" style={{ backgroundColor: color + '15', color: color }}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <h6 className="fw-black text-dark mb-0">{n.title || 'System Dispatch'}</h6>
                                                    <span className="extra-small fw-bold text-muted">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="extra-small fw-bold text-muted mb-0">{n.message}</p>
                                                {(n.complaintId || n.referenceId) && (
                                                    <div className="mt-2 d-flex align-items-center gap-2 extra-small fw-black text-teal uppercase tracking-wider" style={{ color: '#1CA7A6' }}>
                                                        <Activity size={12} /> JURISDICTION NODE: #{n.complaintId || n.referenceId}
                                                    </div>
                                                )}
                                            </div>
                                            {!n.isRead && <div className="p-1 rounded-0 bg-primary shadow-md" style={{ backgroundColor: '#173470' }}></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-bg-light:hover { background-color: #F8FAFC !important; transform: translateX(5px); }
                .border-hover-primary:hover { border-color: #173470 !important; }
            `}} />
        </div>
    );
};

export default WardNotifications;
