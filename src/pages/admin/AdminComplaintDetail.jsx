import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Calendar, MapPin, User, Building2,
    Clock, CheckCircle, AlertTriangle, ShieldCheck,
    MessageSquare, Image as ImageIcon, FileText,
    History, ArrowRight, Shield, Download, Map,
    Maximize2, ExternalLink, MoreVertical, X,
    Activity, Send, Zap, Eye, CheckCircle2, RotateCcw,
    Lock, Unlock, ShieldAlert, Target, Info, Layers,
    Users, Globe, Phone, Mail
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { getImageUrl, extractImageUrl } from '../../utils/imageUtils';
import SlaCard from '../../components/complaints/SlaCard';
import OfficerAssignmentAlert from '../../components/complaints/OfficerAssignmentAlert';

/**
 * High-Fidelity Admin Complaint Audit Console
 * Tier 1 Strategic Control • PMC Headquarters
 */
const AdminComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [complaint, setComplaint] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [slaInfo, setSlaInfo] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closeRemarks, setCloseRemarks] = useState('');
    const [activeTab, setActiveTab] = useState('evidence');

    const PRIMARY_COLOR = '#173470';

    const fetchFullAuditData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiService.complaint.getDetails(id);
            const data = response.data || response;

            if (!data) throw new Error('COULD_NOT_RETRIEVE_RECORD');

            setComplaint(data);

            // Unified DTO provides timeline/history
            if (data.history) setTimeline(data.history);

            // Map SLA info from DTO
            if (data.slaDeadline) {
                const start = new Date(data.createdAt);
                const end = data.status === 'CLOSED' && data.updatedAt ? new Date(data.updatedAt) : new Date();
                const elapsed = Math.floor((end - start) / (1000 * 60 * 60));

                setSlaInfo({
                    status: data.slaStatus || 'ACTIVE',
                    slaDeadline: data.slaDeadline,
                    breached: data.slaBreached,
                    elapsedHours: elapsed
                });
            }

            console.log('🏛️ Unified Audit Data Synchronized:', data);
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        if (id) fetchFullAuditData();
    }, [id, fetchFullAuditData]);

    const handleCloseComplaint = async () => {
        if (!closeRemarks.trim()) {
            showToast('Enter a reason for closing the complaint.', 'warning');
            return;
        }
        try {
            await apiService.admin.closeComplaint(id, { remarks: closeRemarks });
            showToast('Complaint has been closed successfully.', 'success');
            setShowCloseModal(false);
            fetchFullAuditData();
        } catch (error) {
            showToast('Failed to close complaint. Please check your permissions.', 'error');
        }
    };

    if (loading && !complaint) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
                <RotateCcw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
                <p className="extra-small fw-black text-muted uppercase tracking-widest animate-pulse">Synchronizing Record Data...</p>
            </div>
        );
    }

    const lifecycleStages = [
        { label: 'RECEIVED', key: 'SUBMITTED', icon: Send },
        { label: 'DISPATCHED', key: 'ASSIGNED', icon: User },
        { label: 'WORKING', key: 'IN_PROGRESS', icon: Activity },
        { label: 'FIXED', key: 'RESOLVED', icon: CheckCircle2 },
        { label: 'VERIFIED', key: 'APPROVED', icon: ShieldCheck },
        { label: 'CLOSED', key: 'CLOSED', icon: Lock }
    ];

    const currentStatusIdx = lifecycleStages.findIndex(s => s.key === complaint?.status);

    return (
        <div className="admin-complaint-audit min-vh-100 pb-5">
            <DashboardHeader
                portalName="Operational Audit"
                userName={`Record #${id}`}
                wardName={complaint?.wardName || "PMC CENTRAL"}
                subtitle="High-Fidelity Strategic Complaint Management"
                icon={Target}
                actions={
                    <div className="d-flex gap-2">
                        <button onClick={() => navigate(-1)} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm border d-flex align-items-center gap-2 extra-small fw-black tracking-widest transition-all hover-shadow-md">
                            <ChevronLeft size={16} /> BACK
                        </button>
                        {complaint?.status === 'APPROVED' && (
                            <button
                                onClick={() => setShowCloseModal(true)}
                                className="btn btn-primary rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-lg border-0 d-flex align-items-center gap-2 animate-bounce-subtle"
                                style={{ backgroundColor: '#173470' }}
                            >
                                <Lock size={16} /> AUTHORIZE CLOSURE
                            </button>
                        )}
                        {complaint?.status === 'CLOSED' && (
                            <div className="px-4 py-2 rounded-pill bg-dark text-success extra-small fw-black tracking-widest d-flex align-items-center gap-2 border border-success border-opacity-20 shadow-sm">
                                <ShieldCheck size={16} /> RECORD SECURED
                            </div>
                        )}
                    </div>
                }
            />

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>
                <div className="row g-4">
                    {/* Level 1: Core Intelligence Hub */}
                    <div className="col-lg-8">
                        {/* Personnel Alert Hub */}
                        <OfficerAssignmentAlert complaint={complaint} />

                        {/* Operational Brief Card */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border">
                            <div className="card-header bg-white p-4 p-lg-5 border-bottom">
                                <div className="d-flex justify-content-between align-items-start gap-4">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 extra-small fw-black text-primary mb-2 uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>
                                            <Shield size={14} /> SYSTEM REGISTRY NODE • IDENTIFIER: #{id}
                                        </div>
                                        <h1 className="fw-black text-dark mb-0 uppercase tracking-tighter lh-1" style={{ fontSize: '2rem' }}>
                                            {complaint?.title || 'Classified Grievance Record'}
                                        </h1>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-2">
                                        <StatusBadge status={complaint?.status} />
                                        {complaint?.priority === 'HIGH' && (
                                            <span className="badge bg-danger bg-opacity-10 text-danger extra-small fw-black d-flex align-items-center gap-1 border border-danger border-opacity-20 px-3 shadow-sm">
                                                <AlertTriangle size={12} /> PRIORITY
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="row g-0">
                                <div className="col-md-4 p-4 border-end border-bottom d-flex align-items-center gap-3">
                                    <div className="rounded-circle bg-light p-3 text-primary"><Calendar size={20} /></div>
                                    <div>
                                        <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1">Temporal Stamp</div>
                                        <div className="small fw-black text-dark">{new Date(complaint?.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="col-md-4 p-4 border-end border-bottom d-flex align-items-center gap-3">
                                    <div className="rounded-circle bg-light p-3 text-primary"><Clock size={20} /></div>
                                    <div>
                                        <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1">Response Latency</div>
                                        <div className="small fw-black text-dark">{slaInfo?.elapsedHours || 'N/A'} HOURS ELAPSED</div>
                                    </div>
                                </div>
                                <div className="col-md-4 p-4 border-bottom d-flex align-items-center gap-3">
                                    <div className="rounded-circle bg-light p-3 text-primary"><MapPin size={20} /></div>
                                    <div>
                                        <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1">Deployment Sector</div>
                                        <div className="small fw-black text-dark uppercase">{complaint?.wardName || 'CENTRAL PMC'}</div>
                                    </div>
                                </div>

                                <div className="col-12 p-4 p-lg-5 bg-light bg-opacity-25">
                                    <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60">Operational Intelligence Description</h6>
                                    <p className="fw-bold text-dark leading-relaxed mb-0" style={{ fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: '1.7' }}>
                                        {complaint?.description || 'No descriptive intel provided for this operational record.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Operational Path (Stepper) */}
                        <div className="card b-none shadow-premium rounded-4 p-4 p-lg-5 bg-white mb-4 border-0">
                            <div className="d-flex align-items-center justify-content-between mb-5">
                                <h6 className="extra-small fw-black text-dark uppercase tracking-widest mb-0 d-flex align-items-center gap-2">
                                    <RotateCcw size={16} className="text-primary" /> Operational Lifecycle Progress
                                </h6>
                                <span className="extra-small fw-black text-muted opacity-40 uppercase tracking-tight">Sync Status: Live</span>
                            </div>

                            <div className="lifecycle-stepper d-flex justify-content-between position-relative pb-2">
                                <div className="position-absolute top-50 start-0 w-100 translate-middle-y bg-light" style={{ height: '2px', zIndex: 0 }}>
                                    <div className="h-100 transition-all" style={{ width: `${(currentStatusIdx / (lifecycleStages.length - 1)) * 100}%`, backgroundColor: PRIMARY_COLOR }}></div>
                                </div>
                                {lifecycleStages.map((s, idx) => {
                                    const active = idx <= currentStatusIdx;
                                    const isCurrent = idx === currentStatusIdx;
                                    return (
                                        <div key={idx} className="step-node text-center position-relative" style={{ zIndex: 1 }}>
                                            <div
                                                className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center transition-all ${active ? 'shadow-md shadow-primary-subtle' : 'bg-white border text-muted opacity-20'}`}
                                                style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    backgroundColor: active ? (isCurrent ? PRIMARY_COLOR : '#FFFFFF') : '#F8FAFC',
                                                    color: active ? (isCurrent ? '#FFFFFF' : PRIMARY_COLOR) : 'inherit',
                                                    border: active ? `2px solid ${PRIMARY_COLOR}` : '1px solid #E2E8F0'
                                                }}
                                            >
                                                <s.icon size={18} strokeWidth={isCurrent ? 3 : 2} />
                                            </div>
                                            <span className={`extra-small fw-black uppercase tracking-widest d-block ${active ? 'text-dark' : 'text-muted opacity-20'}`} style={{ fontSize: '0.6rem' }}>{s.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Citizen Satisfaction */}
                        {(complaint?.rating || complaint?.feedback) && (
                            <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                                <div className="card-header bg-warning p-4 d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                                    <MessageSquare size={20} className="text-white" />
                                    <h6 className="fw-black text-white mb-0 text-uppercase tracking-widest">Citizen Satisfaction</h6>
                                </div>
                                <div className="card-body p-4 p-lg-5">
                                    <div className="d-flex align-items-center gap-4 mb-4">
                                        {complaint.rating && (
                                            <div className="d-flex gap-1 bg-light p-2 rounded-pill border px-3">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} style={{ color: star <= complaint.rating ? '#F59E0B' : '#E5E7EB', fontSize: '20px' }}>★</span>
                                                ))}
                                            </div>
                                        )}
                                        <span className="extra-small fw-black text-muted uppercase tracking-widest">Voice of Citizen</span>
                                    </div>
                                    <blockquote className="blockquote mb-0">
                                        <p className="fw-bold text-dark fst-italic position-relative" style={{ zIndex: 1 }}>
                                            "{complaint.feedback || complaint.comments || 'No written comments provided.'}"
                                        </p>
                                    </blockquote>
                                </div>
                            </div>
                        )}

                        {/* Evidence & Archives Tabbed Deck */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-4 bg-light p-2 shadow-sm border d-flex align-items-center justify-content-center" style={{ color: PRIMARY_COLOR, width: '40px', height: '40px' }}><Layers size={20} /></div>
                                    <div>
                                        <span className="extra-small fw-black text-dark uppercase tracking-widest d-block">Strategic Archive Repository</span>
                                        <span className="extra-small fw-bold text-muted opacity-40 uppercase" style={{ fontSize: '0.55rem' }}>Secured Evidence Node</span>
                                    </div>
                                </div>
                                <div className="d-flex gap-1 bg-light p-1 rounded-pill border">
                                    {[
                                        { id: 'evidence', label: 'EVIDENCE', icon: ImageIcon },
                                        { id: 'history', label: 'HISTORY', icon: History }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`btn rounded-pill px-4 py-2 extra-small fw-black transition-all d-flex align-items-center gap-2 border-0 ${activeTab === tab.id ? 'bg-white text-dark shadow-sm' : 'text-muted opacity-50 hover-opacity-100'}`}
                                            style={activeTab === tab.id ? { color: PRIMARY_COLOR } : {}}
                                        >
                                            <tab.icon size={14} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="card-body p-4 p-lg-5">
                                {activeTab === 'evidence' ? (
                                    <div className="row g-3">
                                        {(complaint?.images || complaint?.imageUrls || []).length > 0 ? (
                                            (complaint.images || complaint.imageUrls).map((img, i) => {
                                                const isObj = typeof img === 'object';
                                                const url = getImageUrl(isObj ? (img.imageUrl || img.url || img) : img, id);
                                                const stage = isObj ? (img.stage || img.imageStage || 'EVIDENCE') : 'EVIDENCE';
                                                const uploader = isObj ? (img.uploadedBy || img.uploaderName || 'System') : 'System';
                                                const time = isObj && img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString() : '';

                                                if (!url || url === '/placeholder.png') return null;

                                                return (
                                                    <div key={i} className="col-6 col-md-4 col-lg-3">
                                                        <div className="position-relative rounded-4 overflow-hidden shadow-sm border cursor-pointer hover-up-tiny group" onClick={() => setActiveImage(url)}>
                                                            <div className="aspect-ratio-1x1 bg-light" style={{ paddingBottom: '100%', position: 'relative' }}>
                                                                <img
                                                                    src={url}
                                                                    alt={stage}
                                                                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-transform duration-500 hover-scale-110"
                                                                />
                                                            </div>
                                                            <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-gradient-to-t from-black to-transparent" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                                                <span className="badge bg-white text-dark extra-small fw-black uppercase tracking-widest shadow-sm border border-light">
                                                                    {stage.replace('_', ' ')}
                                                                </span>
                                                                {time && <div className="text-white extra-small opacity-75 mt-1 ms-1">{time}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-12">
                                                <div className="rounded-4 border-2 border-dashed p-5 d-flex flex-column align-items-center justify-content-center bg-light bg-opacity-50">
                                                    <ImageIcon size={32} className="text-muted opacity-20 mb-3" />
                                                    <h6 className="fw-bold text-muted opacity-50 mb-0">No Evidence Found</h6>
                                                    <p className="extra-small text-muted opacity-40 uppercase tracking-widest">Repository Empty</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="timeline-trail">
                                        {timeline === 'RESTRICTED' ? (
                                            <div className="text-center py-5">
                                                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex p-4 mb-4">
                                                    <ShieldAlert size={42} className="text-danger opacity-40" />
                                                </div>
                                                <h6 className="fw-black text-dark uppercase mb-1">Authorization Breach</h6>
                                                <p className="extra-small text-muted fw-bold opacity-60 uppercase mb-0 tracking-widest">Unauthorized access to tactical timeline node detected.</p>
                                            </div>
                                        ) : timeline.length === 0 ? (
                                            <div className="text-center py-5">
                                                <div className="rounded-circle bg-light d-inline-flex p-4 mb-4">
                                                    <History size={42} className="text-muted opacity-20" />
                                                </div>
                                                <h6 className="fw-black text-dark uppercase mb-1">Ledger Clean</h6>
                                                <p className="extra-small text-muted fw-bold opacity-60 uppercase mb-0 tracking-widest">No status transitions synchronized for this record.</p>
                                            </div>
                                        ) : (
                                            <div className="vstack gap-0 ps-3">
                                                {timeline.map((log, idx) => {
                                                    const getStatusIcon = (status) => {
                                                        switch (status?.toUpperCase()) {
                                                            case 'SUBMITTED': return FileText;
                                                            case 'ASSIGNED': return User;
                                                            case 'IN_PROGRESS': return Activity;
                                                            case 'RESOLVED':
                                                            case 'APPROVED': return ShieldCheck;
                                                            case 'CLOSED': return Lock;
                                                            default: return Info;
                                                        }
                                                    };
                                                    const StatusIcon = getStatusIcon(log.status);
                                                    const isSystem = log.changedBy === 'System' || !log.changedBy;

                                                    return (
                                                        <div key={idx} className="d-flex gap-4 position-relative pb-4">
                                                            {idx !== (timeline.length - 1) && (
                                                                <div className="position-absolute h-100 border-start border-2 border-primary border-opacity-10" style={{ left: '19px', top: '10px', zIndex: 0 }}></div>
                                                            )}
                                                            <div className="circ-white shadow-premium border border-primary border-opacity-10 transition-all hover-scale" style={{ width: '40px', height: '40px', zIndex: 1, minWidth: '40px' }}>
                                                                <StatusIcon size={18} strokeWidth={2.5} className="text-primary" />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <span className="extra-small fw-black text-dark uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>{log.status}</span>
                                                                        <span className={`extra-small fw-black px-2 py-0.5 rounded-pill border ${isSystem ? 'bg-light text-muted' : 'bg-primary text-white'}`} style={!isSystem ? { backgroundColor: PRIMARY_COLOR } : { fontSize: '0.55rem' }}>
                                                                            {isSystem ? 'KERNEL' : 'FIELD_OPS'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="extra-small text-muted fw-bold opacity-40">{new Date(log.changedAt || log.createdAt).toLocaleString()}</span>
                                                                </div>
                                                                <div className="extra-small text-muted fw-bold uppercase opacity-50 mb-1 d-flex align-items-center gap-2">
                                                                    <User size={10} /> Action By: {log.changedBy || 'SYSTEM REGISTRY'}
                                                                </div>
                                                                <p className="extra-small text-dark fw-bold mb-0 opacity-70 italic bg-light p-3 rounded-3 border-start border-2 border-primary border-opacity-20">
                                                                    "{log.remarks || 'Standard diagnostic update logged in central registry.'}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Level 2: Strategic Personnel & Stats */}
                    <div className="col-lg-4">
                        {/* Deployment Matrix: Personnel */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                            <div className="card-header bg-dark text-white p-4 d-flex align-items-center justify-content-between">
                                <h6 className="extra-small fw-black uppercase tracking-widest mb-0 d-flex align-items-center gap-2">
                                    <Users size={16} className="text-success" /> Deployment Personnel Matrix
                                </h6>
                                <Activity size={12} className="text-success animate-pulse" />
                            </div>
                            <div className="card-body p-4 d-flex flex-column gap-3">
                                {[
                                    { role: 'REPORTING CITIZEN', name: complaint?.citizenName ? `CITIZEN-${complaint.citizenName.charAt(0)}***` : 'ANONYMOUS NODE', icon: User, color: '#6366F1' },
                                    { role: 'WARD COMMANDER', name: complaint?.wardOfficerName || 'AWAITING DISPATCH', icon: Shield, color: '#F59E0B' },
                                    { role: 'FUNCTIONAL UNIT', name: complaint?.departmentName?.replace(/_/g, ' ') || 'GENERAL FLEET', icon: Building2, color: PRIMARY_COLOR },
                                    {
                                        role: 'ASSIGNED OPERATIVE',
                                        name: complaint?.assignedOfficerName || 'UNASSIGNED',
                                        icon: Target,
                                        color: '#10B981',
                                        mobile: complaint?.assignedOfficerMobile,
                                        email: complaint?.assignedOfficerEmail
                                    }
                                ].map((p, idx) => (
                                    <div key={idx} className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-50 border transition-all hover-shadow-sm border-2">
                                        <div className="rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: p.color + '15', color: p.color, width: '42px', height: '42px' }}>
                                            <p.icon size={20} />
                                        </div>
                                        <div className="overflow-hidden w-100">
                                            <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>{p.role}</div>
                                            <div className="small fw-black text-dark uppercase tracking-tight text-truncate">{p.name || 'SECURE DATA'}</div>

                                            {(p.mobile || p.email) && (
                                                <div className="mt-2 pt-2 border-top border-muted border-opacity-10 d-flex flex-column gap-1">
                                                    {p.mobile && (
                                                        <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted">
                                                            <Phone size={10} className="opacity-50" />
                                                            <span className="tracking-wider">{p.mobile}</span>
                                                        </div>
                                                    )}
                                                    {p.email && (
                                                        <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted">
                                                            <Mail size={10} className="opacity-50" />
                                                            <span className="text-truncate">{p.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tactical Sector Intel */}
                        <div className="card b-none shadow-premium rounded-4 p-4 bg-white mb-4 border-0 overflow-hidden position-relative">
                            <Map size={80} className="position-absolute end-0 top-0 m-n3 opacity-5 text-primary" />
                            <div className="extra-small fw-black text-muted uppercase tracking-widest mb-4 opacity-50 position-relative z-1">Sector Logistics</div>
                            <div className="d-flex flex-column gap-3 position-relative z-1">
                                <div className="p-3 rounded-4 bg-light d-flex align-items-center gap-3 border shadow-sm">
                                    <div className="rounded-circle bg-white shadow-sm p-2 text-primary d-flex align-items-center justify-content-center" style={{ color: PRIMARY_COLOR, width: '36px', height: '36px' }}><MapPin size={18} /></div>
                                    <div>
                                        <div className="extra-small fw-black text-muted uppercase">Primary Ward</div>
                                        <div className="small fw-black text-dark uppercase tracking-wide">{complaint?.wardName || 'PMC CENTRAL HUB'}</div>
                                    </div>
                                </div>

                                <div className="rounded-4 bg-dark p-4 text-center overflow-hidden position-relative" style={{ height: '140px' }}>
                                    <div className="position-absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at center, transparent 0%, black 100%)', zIndex: 1 }}></div>
                                    <div className="position-relative" style={{ zIndex: 2 }}>
                                        <Globe size={28} className="text-primary mb-2 opacity-50 animate-spin" style={{ animationDuration: '10s' }} />
                                        <div className="extra-small fw-black text-white uppercase tracking-widest mb-1 opacity-60">Strategic Geospatial</div>
                                        <div className="extra-small fw-bold text-success font-monospace">LAT: {complaint?.latitude || '0.00'} • LON: {complaint?.longitude || '0.00'}</div>
                                        <button className="btn btn-primary rounded-pill px-4 py-1 extra-small fw-black mt-3 shadow-lg border-0" style={{ backgroundColor: PRIMARY_COLOR }}>LAUNCH MAP HUD</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operational SLA Meter - Unified System */}
                        <SlaCard sla={complaint?.slaDetails || (slaInfo ? {
                            status: slaInfo.status,
                            deadline: slaInfo.slaDeadline,
                            remainingHours: 0,
                            totalHoursAllocated: 24
                        } : null)} />

                        {/* Enforcement Notice */}
                        <div className="card border-0 bg-dark text-white rounded-4 p-4 position-relative overflow-hidden shadow-2xl">
                            <div className="position-absolute start-0 top-0 h-100 bg-success opacity-10" style={{ width: '4px' }}></div>
                            <ShieldAlert size={80} className="position-absolute end-0 bottom-0 m-n3 opacity-10 text-success" />
                            <h6 className="extra-small fw-black uppercase tracking-widest mb-3 text-success">Institutional Compliance</h6>
                            <p className="extra-small fw-bold opacity-60 mb-0 uppercase leading-relaxed font-monospace" style={{ fontSize: '0.62rem', lineHeight: '1.6' }}>
                                This record is protected by Institutional Multi-Layer Encryption. All data alterations and status transitions are audited by PMC Central Command.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Close Complaint */}
            {showCloseModal && (
                <div className="modal-backdrop-premium d-flex align-items-center justify-content-center p-3 animate-fadeIn" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000 }}>
                    <div className="modal-content-premium bg-white rounded-4 shadow-2xl p-4 p-lg-5 w-100 animate-slideUp" style={{ maxWidth: '600px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle p-2 bg-dark text-white"><Lock size={20} /></div>
                                <h5 className="fw-black mb-0 uppercase tracking-tight">Close Operation</h5>
                            </div>
                            <button onClick={() => setShowCloseModal(false)} className="btn btn-light rounded-circle p-2 border-0"><X size={20} /></button>
                        </div>
                        <div className="mb-4">
                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60">Closure Reason / Remarks</label>
                            <textarea
                                className="form-control border-2 shadow-none extra-small fw-black p-4 rounded-4 bg-light transition-all focus-bg-white"
                                rows="5"
                                placeholder="Enter final remarks for archiving this complaint..."
                                value={closeRemarks}
                                onChange={(e) => setCloseRemarks(e.target.value)}
                                style={{ resize: 'none' }}
                            ></textarea>
                        </div>
                        <div className="d-flex gap-3">
                            <button onClick={() => setShowCloseModal(false)} className="btn btn-light rounded-pill flex-grow-1 py-3 fw-black extra-small border-2 transition-all">ABORT</button>
                            <button onClick={handleCloseComplaint} className="btn btn-primary rounded-pill flex-grow-1 py-3 fw-black extra-small shadow-lg border-0 transition-all hover-up-tiny" style={{ backgroundColor: PRIMARY_COLOR }}>AUTHORIZE CLOSURE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Strategic Lightbox */}
            {activeImage && (
                <div className="modal-overlay d-flex align-items-center justify-content-center p-4 animate-fadeIn" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)', zIndex: 9999 }} onClick={() => setActiveImage(null)}>
                    <div className="position-absolute top-0 end-0 p-4">
                        <button className="btn btn-white circ-white shadow-lg border-0 hover-scale-110 transition-all rounded-circle p-2" onClick={() => setActiveImage(null)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="position-relative animate-zoomIn" onClick={e => e.stopPropagation()}>
                        <div className="rounded-4 overflow-hidden shadow-2xl border border-white border-opacity-10 bg-dark" style={{ maxWidth: '90vw', maxHeight: '85vh' }}>
                            <img src={activeImage} alt="Audit Evidence" className="img-fluid d-block" style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxHeight: '80vh' }} />
                            <div className="bg-dark p-4 d-flex justify-content-between align-items-center institutional-dark">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center transition-all hover-scale" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <ShieldCheck size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="extra-small fw-black text-white uppercase tracking-widest">AUTHENTICATED EVIDENCE</div>
                                        <div className="extra-small text-white text-opacity-40 uppercase fw-bold tracking-tight">VERIFIED AUDIT LOG • PMC SECURITY</div>
                                    </div>
                                </div>
                                <button className="btn btn-outline-light rounded-pill px-4 py-2 extra-small fw-black uppercase tracking-widest border-2 transition-all hover-up-tiny" onClick={() => window.open(activeImage, '_blank')}>
                                    FULL RESOLUTION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-complaint-audit { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up-tiny:hover { transform: translateY(-4px); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                .focus-bg-white:focus { background-color: #FFFFFF !important; border-color: ${PRIMARY_COLOR}30 !important; }
                .hover-shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .brand-gradient { background: linear-gradient(135deg, #173470 0%, #112652 100%); }

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

const brandGradient = 'linear-gradient(135deg, #173470 0%, #112652 100%)';

export default AdminComplaintDetail;
