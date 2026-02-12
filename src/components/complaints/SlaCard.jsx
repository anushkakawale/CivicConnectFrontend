import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle, Activity } from 'lucide-react';

const SlaCard = ({ sla }) => {
    if (!sla) return null;

    const isBreached = sla.status === 'BREACHED';
    const isWarning = sla.status === 'WARNING';
    const isMet = sla.status === 'MET' || sla.status === 'RESOLVED' || sla.status === 'CLOSED';
    const isEscalated = sla.escalated;

    const getStatusColor = () => {
        if (isBreached) return '#EF4444';
        if (isWarning) return '#F59E0B';
        if (isMet) return '#10B981';
        return '#173470';
    };

    const statusColor = getStatusColor();
    const statusText = (sla.status || 'ACTIVE').replace(/_/g, ' ');

    return (
        <div className="card b-none shadow-premium rounded-4 mb-4 overflow-hidden bg-white border">
            <div className="card-header py-4 px-4 border-0 d-flex justify-content-between align-items-center"
                style={{ backgroundColor: statusColor, background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%)` }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white bg-opacity-20 p-2 d-flex align-items-center justify-content-center">
                        <Clock className="text-white" size={18} />
                    </div>
                    <div>
                        <h6 className="text-white mb-0 fw-black extra-small uppercase tracking-widest">SLA Lifecycle Matrix</h6>
                        <span className="text-white text-opacity-60 extra-small fw-bold uppercase" style={{ fontSize: '0.55rem' }}>Operational Oversight Node</span>
                    </div>
                </div>
                {isBreached && <ShieldAlert className="text-white animate-pulse" size={20} />}
                {isMet && <CheckCircle className="text-white" size={20} />}
            </div>

            <div className="card-body p-4 p-xl-5">
                <div className="row g-4 mb-4">
                    <div className="col-6">
                        <div className="p-3 rounded-4 bg-light border-start border-4 shadow-sm h-100" style={{ borderLeftColor: statusColor }}>
                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-1 d-block opacity-40">Status</label>
                            <p className="fw-black mb-0 extra-small tracking-widest uppercase" style={{ color: statusColor }}>
                                {statusText}
                            </p>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="p-3 rounded-4 bg-light border shadow-sm h-100">
                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-1 d-block opacity-40">Deadline</label>
                            <span className="fw-black text-dark extra-small uppercase d-block">
                                {sla.deadline ? new Date(sla.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'NOT DEFINED'}
                            </span>
                        </div>
                    </div>
                </div>

                {!sla.completionTime && !isMet && (
                    <div className="tactical-progress-zone bg-light p-4 rounded-4 border border-dashed mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-2">
                                <Activity size={14} className="text-primary opacity-40" />
                                <label className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">Time Remaining</label>
                            </div>
                            <span className={`extra-small fw-black uppercase tracking-tight ${isBreached ? 'text-danger' : 'text-primary'}`}>
                                {sla.remainingHours > 0 ? `${sla.remainingHours} Hours` : (isBreached ? 'Lapsed' : 'Finalizing')}
                            </span>
                        </div>
                        <div className="progress rounded-pill bg-white border shadow-inner" style={{ height: '10px' }}>
                            <div
                                className="progress-bar rounded-pill transition-all"
                                style={{
                                    width: `${Math.min(100, Math.max(0, ((sla.totalHoursAllocated - sla.remainingHours) / sla.totalHoursAllocated) * 100))}%`,
                                    backgroundColor: statusColor,
                                    boxShadow: `0 0 10px ${statusColor}44`
                                }}
                            ></div>
                        </div>
                        <div className="mt-2 d-flex justify-content-between extra-small fw-bold text-muted opacity-30 uppercase">
                            <span>Started</span>
                            <span>Target Horizon</span>
                        </div>
                    </div>
                )}

                {isEscalated && (
                    <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-4 text-center border border-danger border-opacity-20 shadow-sm mt-3">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <AlertTriangle size={16} className="animate-bounce-subtle" />
                            <span className="fw-black extra-small uppercase tracking-widest">CRITICAL ESCALATION TRIGGERED</span>
                        </div>
                    </div>
                )}

                {(sla.completionTime || (isMet && !sla.completionTime)) && (
                    <div className="bg-success text-white p-4 rounded-4 text-center shadow-lg transform hover-scale-102 transition-all mt-2"
                        style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                        <div className="d-flex align-items-center justify-content-center gap-3">
                            <div className="rounded-circle bg-white bg-opacity-20 p-2"><CheckCircle size={20} /></div>
                            <div className="text-start">
                                <span className="extra-small fw-black uppercase tracking-widest d-block">SLA MET SUCCESSFULLY</span>
                                <span className="extra-small fw-bold opacity-80 uppercase d-block" style={{ fontSize: '0.6rem' }}>
                                    {sla.completionTime ? `RESOLVED AT ${new Date(sla.completionTime).toLocaleString()}` : 'RECORD SECURED'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlaCard;
