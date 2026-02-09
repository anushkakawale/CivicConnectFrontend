/**
 * Admin Notifications Page - Strategic Command Feed
 * High-fidelity interface for monitoring system-wide alerts and municipal dispatches.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CheckCircle, Clock, AlertCircle, Info, FileText,
    RefreshCw, CheckCheck, Filter, Trash2, Activity,
    Zap, Ghost, Layers, Navigation, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminNotifications = () => {
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
    const PRIMARY_COLOR = '#173470';

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
            'CLOSURE': ShieldCheck,
            'SLA_WARNING': Clock,
            'APPROVAL': CheckCheck,
            'REJECTION': AlertCircle,
            'SYSTEM': ShieldAlert
        };
        return icons[type] || Bell;
    };

    const getTypeColor = (type) => {
        const colors = {
            'RESOLUTION': '#10B981',
            'SLA_WARNING': '#EF4444',
            'ASSIGNMENT': '#1254AF',
            'STATUS_UPDATE': '#3B82F6',
            'REJECTION': '#EF4444',
            'SYSTEM': '#6366F1'
        };
        return colors[type] || PRIMARY_COLOR;
    };

    const handleNotificationClick = async (n) => {
        const cId = n.complaintId || n.referenceId;
        if (!n.isRead) await markAsRead(n.id || n.notificationId);
        if (cId) navigate(`/admin/complaints/${cId}`);
    };

    if (loading && notifications.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-primary text-uppercase tracking-widest small" style={{ color: PRIMARY_COLOR }}>Synchronizing Global Feed...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC ADMIN CONSOLE"
                userName={localStorage.getItem('name') || 'Administrator'}
                wardName="GLOBAL COMMAND"
                subtitle="Citywide Intelligence & Operational Notifications Stream"
                icon={Bell}
                actions={
                    <button onClick={markAllAsRead} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm fw-black extra-small tracking-widest d-flex align-items-center gap-2 border transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <CheckCheck size={16} /> MARK ALL READ
                    </button>
                }
            />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-premium rounded-4 bg-white p-4 sticky-top" style={{ top: '2rem' }}>
                            <h6 className="fw-black text-dark extra-small tracking-widest uppercase mb-4 opacity-40">Command Filter</h6>
                            <div className="d-flex flex-column gap-2">
                                {['all', 'unread', 'read'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`btn rounded-4 px-4 py-3 text-start fw-black transition-all d-flex align-items-center justify-content-between border-0 ${filter === f ? 'bg-primary text-white shadow-md' : 'text-muted hover-bg-light'}`}
                                        style={filter === f ? { backgroundColor: PRIMARY_COLOR } : {}}
                                    >
                                        <span className="text-uppercase extra-small tracking-widest">{f} Command</span>
                                        <span className={`badge rounded-pill extra-small ${filter === f ? 'bg-white text-primary' : 'bg-light text-muted'}`} style={filter === f ? { color: PRIMARY_COLOR } : {}}>
                                            {f === 'all' ? notifications.length : f === 'unread' ? unreadCount : notifications.length - unreadCount}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 p-4 rounded-4 bg-light border border-dashed text-center">
                                <Activity size={24} className="text-primary opacity-20 mb-2" style={{ color: PRIMARY_COLOR }} />
                                <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">System Pulse Online</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-9">
                        {filteredNotifications.length === 0 ? (
                            <div className="card border-0 shadow-premium rounded-4 bg-white p-5 text-center">
                                <Ghost size={64} className="text-muted opacity-10 mb-3 mx-auto" />
                                <h4 className="fw-black text-muted tracking-widest uppercase opacity-40">Spectrum Clean</h4>
                                <p className="text-muted fw-bold small">No active command alerts in the global registry.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {filteredNotifications.map(n => {
                                    const Icon = getIcon(n.type);
                                    const color = getTypeColor(n.type);
                                    return (
                                        <div
                                            key={n.id || n.notificationId}
                                            className={`card border-0 shadow-premium rounded-4 transition-all cursor-pointer hover-up-tiny ${!n.isRead ? 'bg-white border-start border-4' : 'bg-light opacity-75'}`}
                                            style={!n.isRead ? { borderLeftColor: PRIMARY_COLOR + ' !important' } : {}}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <div className="card-body p-4 d-flex align-items-center gap-4">
                                                <div className="rounded-4 p-3 shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: color + '15', color: color, width: '52px', height: '52px' }}>
                                                    <Icon size={22} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className="fw-black text-dark mb-0 uppercase tracking-tight small">{n.title || 'System Dispatch'}</h6>
                                                        <span className="extra-small fw-bold text-muted opacity-60 bg-light px-2 py-1 rounded-pill">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                                                    </div>
                                                    <p className="extra-small fw-bold text-muted mb-0 opacity-80">{n.message}</p>
                                                    {(n.complaintId || n.referenceId) && (
                                                        <div className="mt-2 d-flex align-items-center gap-2 extra-small fw-black uppercase tracking-wider" style={{ color: PRIMARY_COLOR }}>
                                                            <Activity size={12} /> GLOBAL NODE: #{n.complaintId || n.referenceId}
                                                        </div>
                                                    )}
                                                </div>
                                                {!n.isRead && <div className="p-1 rounded-circle bg-primary shadow-sm animate-pulse" style={{ backgroundColor: PRIMARY_COLOR }}></div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .tracking-tight { letter-spacing: -0.02em; }
                .transition-all { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-bg-light:hover { background-color: #F8FAFC !important; transform: translateX(5px); }
                .hover-up-tiny:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}} />
        </div>
    );
};

export default AdminNotifications;
