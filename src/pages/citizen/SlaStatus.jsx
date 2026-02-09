import React, { useState, useEffect } from 'react';
import {
    Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar,
    ShieldCheck, Activity, Timer, ChevronRight, Info, RefreshCw, Building2, Shield, Zap
} from 'lucide-react';
import apiService from '../../api/apiService';
import { COMPLAINT_STATUS, SLA_STATUS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DashboardHeader from '../../components/layout/DashboardHeader';

/**
 * Enhanced Citizen SLA Monitoring Console
 * High-contrast layout with dark text on white backgrounds.
 */
const SlaStatus = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await apiService.citizen.getMyComplaints({ page: 0, size: 100 });
            const data = response.data || response;
            const content = data.content || (Array.isArray(data) ? data : []);
            setComplaints(content);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSlaStatus = (complaint) => {
        if (!complaint.createdAt) return null;

        const createdDate = new Date(complaint.createdAt);
        const now = new Date();
        const slaHours = complaint.department?.slaHours || 48; // Default 48h
        const deadlineDate = new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000);

        let hoursRemaining = (deadlineDate - now) / (1000 * 60 * 60);
        let status = 'ACTIVE';
        let progressPercent = 0;

        if (['CLOSED', 'RESOLVED'].includes(complaint.status) && (complaint.updatedAt || complaint.resolvedAt)) {
            const resolvedDate = new Date(complaint.updatedAt || complaint.resolvedAt);
            const timeTaken = (resolvedDate - createdDate) / (1000 * 60 * 60);

            if (timeTaken <= slaHours) {
                status = 'MET';
                hoursRemaining = 0;
                progressPercent = (timeTaken / slaHours) * 100;
            } else {
                status = 'BREACHED';
                hoursRemaining = 0;
                progressPercent = 100;
            }
        } else {
            const timeElapsed = (now - createdDate) / (1000 * 60 * 60);
            progressPercent = (timeElapsed / slaHours) * 100;

            if (hoursRemaining < 0) {
                status = 'BREACHED';
                progressPercent = 100;
            } else if (hoursRemaining < 4) {
                status = 'WARNING';
            }
        }

        return {
            status,
            hoursRemaining: hoursRemaining,
            progressPercent: Math.min(progressPercent, 100),
            slaHours,
            deadline: deadlineDate
        };
    };

    const filteredComplaints = complaints.filter(complaint => {
        const slaInfo = calculateSlaStatus(complaint);
        if (!slaInfo) return false;

        if (filter === 'all') return true;
        if (filter === 'active') return slaInfo.status === 'ACTIVE' || slaInfo.status === 'WARNING';
        if (filter === 'breached') return slaInfo.status === 'BREACHED';
        if (filter === 'met') return slaInfo.status === 'MET';
        return true;
    });

    const stats = {
        total: complaints.length,
        active: complaints.filter(c => {
            const sla = calculateSlaStatus(c);
            return sla && (sla.status === 'ACTIVE' || sla.status === 'WARNING');
        }).length,
        breached: complaints.filter(c => {
            const sla = calculateSlaStatus(c);
            return sla && sla.status === 'BREACHED';
        }).length,
        met: complaints.filter(c => {
            const sla = calculateSlaStatus(c);
            return sla && sla.status === 'MET';
        }).length
    };

    if (loading && complaints.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#FFFFFF' }}>
            <Activity className="animate-spin text-primary mb-4" size={56} style={{ color: '#1254AF' }} />
            <p className="fw-black text-dark text-uppercase tracking-widest small">Synchronizing Timelines...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC CITIZEN PORTAL"
                userName="OPERATIONAL TIMELINES"
                wardName="SLA MONITOR"
                subtitle="OFFICIAL PERFORMANCE TRACKER | SERVICE LEVEL AGREEMENT VERIFICATION"
                icon={Timer}
                actions={
                    <button
                        onClick={fetchComplaints}
                        className="btn btn-white bg-white shadow-premium border-0 rounded-circle d-flex align-items-center justify-content-center p-0"
                        style={{ width: '54px', height: '54px' }}
                    >
                        <RefreshCw size={24} className={`text-primary ${loading ? 'animate-spin' : ''}`} style={{ color: '#1254AF' }} />
                    </button>
                }
            />

            <div className="container" style={{ maxWidth: '1200px', marginTop: '-30px' }}>
                {/* Visual Metrics Hub */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'TOTAL SUBMISSIONS', val: stats.total, icon: Calendar, color: '#1254AF', bg: 'white', border: '#1254AF' },
                        { label: 'ACTIVE WORKFLOWS', val: stats.active, icon: Zap, color: '#3B82F6', bg: 'white', border: '#3B82F6' },
                        { label: 'PROTOCOL MET', val: stats.met, icon: ShieldCheck, color: '#10B981', bg: 'white', border: '#10B981' },
                        { label: 'PROTOCOL BREACHED', val: stats.breached, icon: AlertTriangle, color: '#EF4444', bg: 'white', border: '#EF4444' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 h-100 bg-white border-top border-4 transition-all hover-up" style={{ borderColor: s.border }}>
                                <div className="d-flex flex-column gap-3">
                                    <div className="p-3 rounded-4 align-self-start shadow-sm border" style={{ backgroundColor: `${s.color}10`, color: s.color, width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <s.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="fw-black mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>{s.val}</h2>
                                        <p className="fw-black mb-0 extra-small tracking-widest text-muted">{s.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Command Bar */}
                <div className="d-flex justify-content-center mb-5">
                    <div className="card border-0 shadow-premium rounded-pill p-2 bg-white d-inline-flex flex-row gap-2">
                        {[
                            { id: 'all', label: 'ALL LOGS', color: '#1254AF' },
                            { id: 'active', label: 'ACTIVE PROTOCOLS', color: '#F59E0B' },
                            { id: 'met', label: 'PROTOCOL MET', color: '#10B981' },
                            { id: 'breached', label: 'BREACHED', color: '#EF4444' }
                        ].map(f => (
                            <button
                                key={f.id}
                                className={`btn rounded-pill px-4 py-2 fw-black extra-small tracking-widest transition-all ${filter === f.id ? 'text-white shadow-premium' : 'text-muted border-0'}`}
                                style={{ backgroundColor: filter === f.id ? f.color : 'transparent' }}
                                onClick={() => setFilter(f.id)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Registry List */}
                {filteredComplaints.length === 0 ? (
                    <div className="card border-0 shadow-premium rounded-4 p-5 text-center bg-white border-dashed border-2">
                        <div className="rounded-circle bg-light d-inline-flex p-4 mb-4">
                            <Activity size={64} className="text-muted opacity-20" />
                        </div>
                        <h4 className="fw-black text-dark text-uppercase tracking-widest extra-small">Registry Status: Clear</h4>
                        <p className="text-muted extra-small fw-bold opacity-60 uppercase mt-2">No municipal records matching your deployment frequency.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {filteredComplaints.map(complaint => {
                            const sla = calculateSlaStatus(complaint);
                            if (!sla) return null;

                            let statusColor = '#1254AF';
                            let statusLabel = 'ACTIVE COMMAND';

                            switch (sla.status) {
                                case 'BREACHED': statusColor = '#EF4444'; statusLabel = 'PROTOCOL BREACHED'; break;
                                case 'WARNING': statusColor = '#F59E0B'; statusLabel = 'SLA WARNING'; break;
                                case 'MET': statusColor = '#10B981'; statusLabel = 'PROTOCOL VERIFIED'; break;
                                default: statusColor = '#1254AF'; statusLabel = 'OPERATIONAL';
                            }

                            return (
                                <div key={complaint.complaintId} className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white transition-all hover-up border-start border-4" style={{ borderColor: statusColor }}>
                                    <div className="card-body p-5">
                                        <div className="row align-items-center g-4">
                                            <div className="col-lg-4">
                                                <div className="d-flex align-items-center gap-3 mb-4">
                                                    <span className="badge-rect-blue px-2 py-1 border-0" style={{ fontSize: '9px' }}>#{complaint.complaintId}</span>
                                                    <span className="extra-small fw-black tracking-[0.2em]" style={{ color: statusColor }}>{statusLabel}</span>
                                                </div>
                                                <h5 className="fw-black text-dark mb-3 uppercase tracking-tight">{complaint.title}</h5>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="circ-white border shadow-sm" style={{ width: '32px', height: '32px', color: '#1254AF' }}>
                                                        <Building2 size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="extra-small fw-bold text-muted uppercase d-block opacity-40">Assigned Unit</span>
                                                        <span className="extra-small fw-black text-dark uppercase tracking-wider">{complaint.departmentName || 'GENERAL SERVICES'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-5">
                                                <div className="d-flex justify-content-between extra-small fw-black text-muted mb-3 uppercase tracking-widest">
                                                    <span className="opacity-40">SLA Progress</span>
                                                    <span style={{ color: statusColor }}>{Math.round(sla.progressPercent)}% CERTAINTY</span>
                                                </div>
                                                <div className="progress rounded-0 bg-light" style={{ height: '6px' }}>
                                                    <div
                                                        className={`progress-bar ${sla.status === 'WARNING' ? 'progress-bar-striped progress-bar-animated' : ''}`}
                                                        style={{ width: `${sla.progressPercent}%`, backgroundColor: statusColor }}
                                                    ></div>
                                                </div>
                                                <div className="row mt-4">
                                                    <div className="col-6">
                                                        <span className="extra-small d-block fw-bold text-muted uppercase opacity-40 mb-1">Filed Date</span>
                                                        <span className="extra-small fw-black text-dark uppercase">{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="col-6 text-end">
                                                        <span className="extra-small d-block fw-bold text-muted uppercase opacity-40 mb-1">Target End</span>
                                                        <span className="extra-small fw-black text-dark uppercase">{sla.deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-3 text-lg-end">
                                                {['MET', 'BREACHED'].includes(sla.status) ? (
                                                    <div className="p-4 rounded-4 bg-light bg-opacity-30 border d-inline-block w-100" style={{ borderColor: `${statusColor}20` }}>
                                                        <div className="circ-white mx-auto mb-3" style={{ width: '40px', height: '40px', backgroundColor: statusColor, color: 'white' }}>
                                                            <ShieldCheck size={20} />
                                                        </div>
                                                        <h6 className="fw-black extra-small mb-0 uppercase tracking-widest" style={{ color: statusColor }}>{sla.status === 'MET' ? 'VERIFIED ON-TIME' : 'LATE RESOLUTION'}</h6>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 rounded-4 bg-white border-2 border-dashed text-center w-100" style={{ borderColor: `${statusColor}40` }}>
                                                        <span className="extra-small fw-black text-muted uppercase d-block mb-2 opacity-50 tracking-widest">Time Remaining</span>
                                                        <h4 className="fw-black mb-0 d-flex align-items-center justify-content-center gap-3" style={{ color: sla.hoursRemaining < 0 ? '#EF4444' : '#1E293B', letterSpacing: '-0.02em' }}>
                                                            <Clock size={20} />
                                                            {sla.hoursRemaining > 0
                                                                ? `${Math.floor(sla.hoursRemaining)}H ${Math.floor((sla.hoursRemaining % 1) * 60)}M`
                                                                : 'EXPIRED'}
                                                        </h4>
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

                {/* Tactical Intel Box */}
                <div className="mt-5 p-5 rounded-4 bg-white shadow-premium border-start border-4 transition-all hover-up-small" style={{ borderLeftColor: '#1254AF' }}>
                    <div className="d-flex gap-4 align-items-center">
                        <div className="p-3 shadow-inner rounded-circle" style={{ backgroundColor: '#F0F7FF', color: '#1254AF' }}>
                            <Info size={32} />
                        </div>
                        <div>
                            <h6 className="fw-black text-dark mb-1 uppercase tracking-wider">PROTOCOL SPECIFICATIONS</h6>
                            <p className="extra-small text-dark fw-bold mb-0 opacity-60 uppercase">Resolution targets are engineered based on department specific SLA mandates (standard 48h cycle).</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .extra-small { font-size: 0.65rem; }
                .animate-spin { animation: spin 1s linear infinite; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(18, 84, 175, 0.1) !important; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .fw-black { font-weight: 900; }
            `}} />
        </div>
    );
};

export default SlaStatus;
