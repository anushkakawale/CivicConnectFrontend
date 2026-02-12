/**
 * Admin Notifications Page - Strategic Command Feed
 * High-fidelity interface for monitoring system-wide alerts and municipal dispatches.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CheckCircle, Clock, AlertCircle, Info, FileText,
    RefreshCw, CheckCheck, Filter, Trash2, Activity,
    Zap, Ghost, Layers, Navigation, ShieldAlert, ShieldCheck,
    ChevronRight, ExternalLink, Target
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminNotifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        readCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        deleteNotification
    } = useNotifications();

    const [filter, setFilter] = useState('all');
    const PRIMARY_COLOR = '#173470';

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
        const nId = n.id || n.notificationId;
        if (!n.isRead) await markAsRead(nId);
        if (cId) navigate(`/admin/complaints/${cId}`);
    };

    if (loading && notifications.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-primary text-uppercase tracking-widest small" style={{ color: PRIMARY_COLOR }}>Synchronizing Global Feed...</p>
        </div>
    );

    return (
        <div className="admin-notifications-premium min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC ADMIN CONSOLE"
                userName={localStorage.getItem('name') || "Executive Command"}
                wardName="GLOBAL OVERSIGHT"
                subtitle="High-fidelity citywide intelligence & operational dispatch registry"
                icon={Target}
                actions={
                    <div className="d-flex align-items-center gap-2">
                        <button onClick={() => fetchNotifications()} className="btn btn-white bg-white rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center transition-all hover-up-tiny" style={{ width: '42px', height: '42px', color: PRIMARY_COLOR }}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={markAllAsRead} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm fw-black extra-small tracking-widest d-flex align-items-center gap-2 border transition-all hover-up-tiny" style={{ color: PRIMARY_COLOR }}>
                            <CheckCheck size={16} /> ARCHIVE ALL
                        </button>
                    </div>
                }
            />

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>

                <div className="row g-4">
                    {/* Left Sidebar Control */}
                    <div className="col-xl-3">
                        <div className="card border-0 shadow-premium rounded-4 bg-white p-4 p-lg-5 sticky-top" style={{ top: '2rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="rounded-4 p-3 bg-light text-primary" style={{ color: PRIMARY_COLOR }}>
                                    <Filter size={20} />
                                </div>
                                <h6 className="fw-black text-dark mb-0 uppercase tracking-widest extra-small opacity-40">Intelligence Filters</h6>
                            </div>

                            <div className="d-flex flex-column gap-2">
                                {[
                                    { id: 'all', label: 'Global Feed', count: notifications.length, icon: Layers },
                                    { id: 'unread', label: 'Critical Ops', count: unreadCount, icon: Bell, activeColor: '#EF4444' },
                                    { id: 'read', label: 'Archived Log', count: readCount, icon: ShieldCheck }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilter(f.id)}
                                        className={`btn rounded-4 px-4 py-3 text-start fw-black transition-all d-flex align-items-center justify-content-between border-0 ${filter === f.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover-bg-light'}`}
                                        style={filter === f.id ? { backgroundColor: f.activeColor || PRIMARY_COLOR } : {}}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <f.icon size={18} opacity={filter === f.id ? 1 : 0.4} />
                                            <span className="text-uppercase extra-small tracking-widest">{f.label}</span>
                                        </div>
                                        <span className={`badge rounded-pill extra-small ${filter === f.id ? 'bg-white text-dark' : 'bg-light text-muted'}`} style={filter === f.id ? { color: f.activeColor || PRIMARY_COLOR } : {}}>
                                            {f.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 p-4 rounded-4 bg-light bg-opacity-50 border border-dashed text-center">
                                <Activity size={24} className="text-primary opacity-20 mb-3 mx-auto d-block" style={{ color: PRIMARY_COLOR }} />
                                <p className="extra-small fw-black text-muted uppercase tracking-widest mb-1 opacity-40">Frequency Status</p>
                                <div className="extra-small fw-black text-success uppercase">System Pulse: Online</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="col-xl-9">
                        {filteredNotifications.length === 0 ? (
                            <div className="card border-0 shadow-premium rounded-4 bg-white p-5 text-center min-vh-50 d-flex flex-column align-items-center justify-content-center">
                                <div className="rounded-circle bg-light p-5 mb-4">
                                    <Ghost size={80} className="text-muted opacity-20" />
                                </div>
                                <h4 className="fw-black text-dark tracking-widest uppercase mb-1">Spectrum Clean</h4>
                                <p className="text-muted fw-bold small opacity-60">No active dispatches localized in the {filter} registry.</p>
                                {filter !== 'all' && (
                                    <button onClick={() => setFilter('all')} className="btn btn-primary rounded-pill px-4 mt-3 fw-black extra-small tracking-widest shadow-lg border-0" style={{ backgroundColor: PRIMARY_COLOR }}>
                                        RESET FREQUENCY
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {filteredNotifications.map(n => {
                                    const Icon = getIcon(n.type);
                                    const color = getTypeColor(n.type);
                                    const nId = n.id || n.notificationId;
                                    return (
                                        <div
                                            key={nId}
                                            className={`card border-0 shadow-premium rounded-4 transition-all cursor-pointer hover-up-tiny position-relative overflow-hidden ${!n.isRead ? 'bg-white' : 'bg-light bg-opacity-50 opacity-80'}`}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            {!n.isRead && <div className="position-absolute h-100 top-0 start-0" style={{ width: '4px', backgroundColor: PRIMARY_COLOR }}></div>}

                                            <div className="card-body p-4 p-lg-5">
                                                <div className="row align-items-center g-4">
                                                    <div className="col-auto">
                                                        <div className="rounded-4 p-3 shadow-md d-flex align-items-center justify-content-center" style={{ backgroundColor: color + '15', color: color, width: '60px', height: '60px' }}>
                                                            <Icon size={26} strokeWidth={2.5} />
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                {!n.isRead && <span className="p-1 rounded-circle bg-primary animate-pulse" style={{ backgroundColor: PRIMARY_COLOR }}></span>}
                                                                <h6 className="fw-black text-dark mb-0 uppercase tracking-tight small">{n.title || 'Official Dispatch'}</h6>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="extra-small fw-black text-muted opacity-40 uppercase d-flex align-items-center gap-2">
                                                                    <Clock size={12} /> {new Date(n.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(nId); }}
                                                                    className="btn btn-link p-0 text-muted opacity-20 hover-opacity-100 transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="extra-small fw-bold text-muted mb-3 opacity-80" style={{ lineHeight: '1.6' }}>{n.message}</p>

                                                        {(n.complaintId || n.referenceId) && (
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="extra-small fw-black uppercase tracking-widest px-3 py-2 rounded-pill bg-light border d-flex align-items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                                                                    <Activity size={12} /> NODE ID: #{n.complaintId || n.referenceId}
                                                                </div>
                                                                {!n.isRead && (
                                                                    <button className="btn btn-link p-0 extra-small fw-black text-primary uppercase tracking-widest text-decoration-none" style={{ color: PRIMARY_COLOR }}>
                                                                        ACTION REQUIRED <ChevronRight size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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
                .admin-notifications-premium { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .tracking-tight { letter-spacing: -0.02em; }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-bg-light:hover { background-color: #F8FAFC !important; transform: translateX(5px); }
                .hover-up-tiny:hover { transform: translateY(-5px); box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.1) !important; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
                .animate-spin { animation: spin 1s linear infinite; }
                .min-vh-50 { min-height: 50vh; }

                .tactical-grid-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        linear-gradient(rgba(23, 52, 112, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(23, 52, 112, 0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                    z-index: 0;
                }

                .vertical-divider-guide {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to bottom, transparent, rgba(23, 52, 112, 0.03), transparent);
                    pointer-events: none;
                    z-index: -1;
                }
            `}} />
        </div>
    );
};

export default AdminNotifications;
