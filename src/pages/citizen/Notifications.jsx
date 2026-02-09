import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CheckCircle, Clock, AlertCircle, Info, FileText,
    RefreshCw, CheckCheck, Filter, Trash2, Shield, Activity,
    Zap, Ghost, Layers, Navigation
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const Notifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        deleteNotification
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
            'CLOSURE': Shield,
            'SLA_WARNING': Clock,
            'APPROVAL': CheckCircle,
            'REJECTION': AlertCircle
        };
        return icons[type] || Bell;
    };

    const getTypeColor = (type) => {
        const colors = {
            'RESOLUTION': '#10B981', // Green
            'SLA_WARNING': '#EF4444', // Red
            'ASSIGNMENT': '#244799', // Blue
            'STATUS_UPDATE': '#3B82F6', // Light Blue
            'REJECTION': '#EF4444', // Red
            'APPROVAL': '#10B981', // Green
            'NEW_COMPLAINT': '#F59E0B' // Amber
        };
        return colors[type] || '#173470';
    };

    if (loading && notifications.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-4" size={48} style={{ color: '#173470' }} />
            <p className="fw-bold text-muted small">Accessing Alert Registry...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5 px-3 px-md-5" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="container-fluid max-ww-1400 py-4">

                {/* Notification Header */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5" style={{
                    background: '#173470'
                }}>
                    <div className="card-body p-4 p-md-5 position-relative">
                        <div className="position-absolute top-50 end-0 translate-middle-y p-5 opacity-10">
                            <Bell size={180} color="white" />
                        </div>
                        <div className="row align-items-center position-relative z-1 text-white">
                            <div className="col-md-8">
                                <div className="d-flex align-items-center gap-4 mb-3">
                                    <div className="p-3 rounded-4 bg-white bg-opacity-20 shadow-sm border border-white border-opacity-10">
                                        <Bell size={40} />
                                    </div>
                                    <div>
                                        <h1 className="h2 fw-bold mb-1 text-white">Notifications</h1>
                                        <p className="opacity-75 fw-medium mb-0">Stay updated on your reported issues and local activities</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 text-md-end d-flex gap-3 justify-content-md-end mt-4 mt-md-0">
                                <button onClick={fetchNotifications} className="btn btn-light rounded-pill px-3 shadow-sm" style={{ color: '#173470' }}><RefreshCw size={20} /></button>
                                <button onClick={markAllAsRead} className="btn btn-light rounded-pill px-4 py-3 fw-bold small shadow-sm d-flex align-items-center gap-2" style={{ color: '#173470' }}>
                                    <CheckCheck size={18} /> Mark all read
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-xl-10">
                        {/* Filters */}
                        <div className="d-flex gap-2 mb-4">
                            {['all', 'unread', 'read'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`btn rounded-pill px-4 py-2 small fw-bold text-capitalize transition-all ${filter === f ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`}
                                    style={filter === f ? { backgroundColor: '#173470', borderColor: '#173470' } : {}}
                                >
                                    {f} {f === 'unread' && unreadCount > 0 && <span className="ms-2 badge bg-white text-primary rounded-circle" style={{ color: '#173470' }}>{unreadCount}</span>}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        {filteredNotifications.length === 0 ? (
                            <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4 border-dashed">
                                <Ghost size={64} className="text-muted opacity-20 mb-4 mx-auto" />
                                <h4 className="fw-bold text-dark mb-2">No alerts found</h4>
                                <p className="text-muted small">When we have updates for you, they'll appear here.</p>
                            </div>
                        ) : (
                            <div className="d-grid gap-3">
                                {filteredNotifications.map((n) => {
                                    const Icon = getIcon(n.type);
                                    const color = getTypeColor(n.type);

                                    return (
                                        <div
                                            key={n.id}
                                            className={`card border-0 shadow-sm rounded-4 overflow-hidden transition-all ${!n.isRead ? 'border-start border-4' : ''}`}
                                            style={!n.isRead ? { borderLeftColor: color + ' !important' } : {}}
                                        >
                                            <div className="card-body p-4 d-flex align-items-start gap-4">
                                                <div className="p-3 rounded-4 shadow-sm border" style={{ backgroundColor: color + '10', color: color }}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className={`fw-bold mb-0 ${!n.isRead ? 'text-dark' : 'text-muted'}`}>{n.title}</h6>
                                                        <span className="extra-small text-muted fw-medium">{new Date(n.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <p className={`small mb-3 ${!n.isRead ? 'text-secondary' : 'text-muted opacity-60'} line-clamp-2`}>{n.message}</p>
                                                    <div className="d-flex gap-3">
                                                        {!n.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(n.id)}
                                                                className="btn btn-link p-0 text-decoration-none extra-small fw-bold text-primary"
                                                                style={{ color: '#173470' }}
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(n.id)}
                                                            className="btn btn-link p-0 text-decoration-none extra-small fw-bold text-muted hover-text-danger"
                                                        >
                                                            Dismiss
                                                        </button>
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
                .text-primary { color: #173470 !important; }
                .bg-primary { background-color: #173470 !important; }
                .extra-small { font-size: 0.7rem; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .hover-text-danger:hover { color: #EF4444 !important; background-color: rgba(239, 68, 68, 0.1) !important; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
            `}} />
        </div>
    );
};

export default Notifications;
