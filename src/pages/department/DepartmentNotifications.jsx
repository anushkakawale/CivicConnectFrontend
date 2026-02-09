import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CheckCircle, Clock, AlertCircle, Info, FileText,
    RefreshCw, CheckCheck, Filter, Trash2, Activity,
    Zap, Ghost, Layers, Navigation, Loader, ChevronRight
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../hooks/useToast';

const DepartmentNotifications = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
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
            'APPROVAL': CheckCircle,
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
        return colors[type] || '#1254AF';
    };

    const handleNotificationClick = async (n) => {
        const cId = n.complaintId || n.referenceId;
        if (!n.isRead) await markAsRead(n.id || n.notificationId);
        if (cId) navigate(`/department/complaints/${cId}`);
    };

    if (loading && notifications.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F0F2F5' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: '#1254AF' }} />
            <p className="fw-black text-primary text-uppercase tracking-widest" style={{ color: '#1254AF' }}>Accessing Tactical Feed...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F0F2F5' }}>
            {/* Header Block */}
            <div className="card border-0 shadow-sm rounded-0 mb-4 position-relative overflow-hidden" style={{ backgroundColor: '#1254AF', minHeight: '120px' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                    <div className="d-flex gap-4 position-absolute" style={{ top: '-20px', right: '-20px' }}>
                        <Bell size={80} className="text-white" />
                        <Activity size={60} className="text-white" style={{ marginTop: '30px' }} />
                    </div>
                </div>
                <div className="card-body p-4 position-relative">
                    <div className="container" style={{ maxWidth: '1200px' }}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <div className="d-flex align-items-center gap-3 text-white">
                                <div className="p-3 rounded-0 bg-white bg-opacity-15 shadow-sm border border-white border-opacity-20">
                                    <Bell size={36} />
                                </div>
                                <div>
                                    <h1 className="h3 fw-black mb-0">Operational Dispatches</h1>
                                    <p className="mb-0 opacity-75 small fw-medium uppercase tracking-widest">FIELD OPERATIONS OFFICER DIRECTIVE STREAM</p>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button onClick={markAllAsRead} className="btn btn-light rounded-0 px-4 py-2 fw-black extra-small tracking-widest d-flex align-items-center gap-2 shadow-sm" style={{ color: '#1254AF' }}>
                                    <CheckCheck size={18} /> MARK ALL READ
                                </button>
                                <button onClick={fetchNotifications} className="btn btn-white bg-opacity-10 border-white text-white rounded-0 p-2 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="row g-4">
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm rounded-0 bg-white p-4 sticky-top" style={{ top: '90px' }}>
                            <h6 className="fw-black text-muted extra-small tracking-widest uppercase mb-4">Command Filters</h6>
                            <div className="d-flex flex-column gap-2">
                                {['all', 'unread', 'read'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`btn rounded-0 px-3 py-2 text-start fw-bold transition-all d-flex align-items-center justify-content-between ${filter === f ? 'bg-primary text-white shadow-sm' : 'text-muted hover-bg-light border-0'}`}
                                        style={filter === f ? { backgroundColor: '#1254AF' } : {}}
                                    >
                                        <span className="text-uppercase extra-small tracking-widest">{f} Stream</span>
                                        <span className={`badge rounded-0 ${filter === f ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                                            {f === 'all' ? notifications.length : f === 'unread' ? unreadCount : notifications.length - unreadCount}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-9">
                        {filteredNotifications.length === 0 ? (
                            <div className="card border-0 shadow-sm rounded-0 bg-white p-5 text-center">
                                <Ghost size={64} className="text-muted opacity-25 mb-3 mx-auto" />
                                <h4 className="fw-black text-muted tracking-widest uppercase mb-1">Spectrum Clean</h4>
                                <p className="text-muted fw-bold">No operational directives in the current frequency.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {filteredNotifications.map(n => {
                                    const Icon = getIcon(n.type);
                                    const color = getTypeColor(n.type);
                                    return (
                                        <div
                                            key={n.id || n.notificationId}
                                            className={`card border-0 shadow-sm rounded-0 transition-all cursor-pointer hover-up ${!n.isRead ? 'bg-white border-start border-4 border-primary' : 'bg-white opacity-75'}`}
                                            onClick={() => handleNotificationClick(n)}
                                            style={!n.isRead ? { borderLeftColor: '#1254AF !important' } : {}}
                                        >
                                            <div className="card-body p-4 d-flex align-items-center gap-4">
                                                <div className="p-3 rounded-0" style={{ backgroundColor: color + '12', color: color }}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className="fw-bold text-dark mb-0">{n.title || 'Directive Update'}</h6>
                                                        <span className="extra-small fw-bold text-muted">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                                                    </div>
                                                    <p className="extra-small fw-bold text-muted mb-0">{n.message}</p>
                                                    {(n.complaintId || n.referenceId) && (
                                                        <div className="mt-2 d-inline-flex align-items-center gap-2 px-2 py-1 rounded-0 bg-light extra-small fw-black text-primary uppercase tracking-wider" style={{ color: '#1254AF' }}>
                                                            NODE ID: #{n.complaintId || n.referenceId}
                                                        </div>
                                                    )}
                                                </div>
                                                <ChevronRight size={18} className="text-muted opacity-50" />
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
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .transition-all { transition: all 0.25s ease-in-out; }
                .hover-up:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default DepartmentNotifications;
