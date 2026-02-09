import React, { useState } from 'react';
import {
    Clock, User, MapPin, Calendar, Building2, Image as ImageIcon,
    MessageSquare, Mail, Phone, Eye, CheckCircle, AlertTriangle,
    Shield, ArrowRight, History as HistoryIcon, Info, Camera, Zap, X, Star, FileText, Activity,
    ShieldCheck, CheckCheck, Quote, Search, Layers, Smartphone, SmartphoneIcon, RotateCcw, Timer, ShieldAlert
} from 'lucide-react';
import { extractImageUrl, getPlaceholderImage } from '../../utils/imageUtils';
import { COMPLAINT_STATUS, IMAGE_STAGES } from '../../constants';

/**
 * Unified Strategic Complaint Detail Engine
 * Premium high-contrast layout with tactical activity streams.
 */
const ComplaintDetailView = ({
    complaint,
    images = [],
    statusHistory = [],
    slaCountdown = null,
    userRole,
    onReopen,
    children
}) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const PRIMARY_COLOR = '#173470';

    const formatDate = (dateString, includeTime = true) => {
        if (!dateString) return '';
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleString('en-IN', options);
    };

    const getStatusConfig = (status) => {
        const configs = {
            'SUBMITTED': { label: 'Reported', icon: FileText, color: '#64748B', bg: '#F8FAFC' },
            'APPROVED': { label: 'Verified', icon: CheckCheck, color: '#0EA5E9', bg: '#F0F9FF' },
            'ASSIGNED': { label: 'Dispatched', icon: User, color: '#6366F1', bg: '#F5F5FF' },
            'IN_PROGRESS': { label: 'Work started', icon: Activity, color: '#F59E0B', bg: '#FFFBEB' },
            'RESOLVED': { label: 'Fixed', icon: CheckCircle, color: '#10B981', bg: '#ECFDF5' },
            'CLOSED': { label: 'Closed', icon: ShieldCheck, color: '#173470', bg: '#F1F5F9' },
            'REJECTED': { label: 'Rejected', icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
            'REOPENED': { label: 'Reopened', icon: RotateCcw, color: '#F43F5E', bg: '#FFF1F2' }
        };
        return configs[status] || configs['SUBMITTED'];
    };

    const workflowStages = ['SUBMITTED', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    if (!complaint) return null;

    const currentConf = getStatusConfig(complaint.status);

    const canReopen = () => {
        if (userRole !== 'CITIZEN' || complaint.status !== 'CLOSED') return false;
        if (!complaint.closedAt) return true;
        const closedDate = new Date(complaint.closedAt);
        const diffDays = Math.ceil(Math.abs(new Date() - closedDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const ImageThumbnail = ({ img, stageKey, onClick }) => {
        return (
            <div className="group cursor-pointer position-relative overflow-hidden rounded-4 shadow-sm transition-all hover-up"
                style={{ height: '140px' }}
                onClick={onClick}>
                <img
                    src={extractImageUrl(img, complaint.complaintId || complaint.id)}
                    className="w-100 h-100 object-fit-cover group-hover-scale-110"
                    alt="evidence"
                    onError={(e) => { e.target.src = getPlaceholderImage(stageKey || 'IMAGE'); }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10 opacity-0 group-hover-opacity-100 transition-standard d-flex align-items-center justify-content-center">
                    <div className="circ-white shadow-sm" style={{ width: '36px', height: '36px' }}>
                        <ImageIcon size={18} className="text-primary" />
                    </div>
                </div>
                <div className="position-absolute bottom-0 start-0 w-100 p-2 glass-panel border-0 border-top">
                    <div className="d-flex align-items-center justify-content-between">
                        <span className="extra-small fw-bold opacity-70" style={{ fontSize: '0.6rem' }}>{stageKey} phase</span>
                        <Camera size={10} className="opacity-40" />
                    </div>
                </div>
            </div>
        );
    };

    const evidenceStages = [
        { key: 'Initial', label: 'Before work', icon: Search, color: '#173470', stages: ['INITIAL', 'BEFORE', 'BEFORE_WORK', 'SUBMITTED'] },
        { key: 'Progress', label: 'During work', icon: Zap, color: '#F59E0B', stages: ['IN_PROGRESS', 'DURING', 'PROGRESS', 'WORK_IN_PROGRESS'] },
        { key: 'Resolution', label: 'After work', icon: CheckCircle, color: '#10B981', stages: ['RESOLVED', 'AFTER', 'FINAL', 'AFTER_RESOLUTION', 'COMPLETED'] }
    ];

    const getStageImages = (stageConfig) => {
        return images.filter(img => {
            const imgStage = (img.stage || '').toUpperCase().replace(/ /g, '_');
            return stageConfig.stages.includes(imgStage);
        });
    };

    const categorizedImageIds = new Set();
    evidenceStages.forEach(stage => {
        getStageImages(stage).forEach(img => categorizedImageIds.add(img.id || img.imageUrl));
    });

    const uncategorizedImages = images.filter(img => !categorizedImageIds.has(img.id || img.imageUrl));

    const EvidenceSection = ({ title, stageImages, icon: Icon, color, stageKey }) => {
        if (stageImages.length === 0) return null;

        return (
            <div className="mb-5">
                <div className="d-flex align-items-center gap-3 mb-4 ps-1">
                    <div className="circ-white shadow-sm" style={{ width: '40px', height: '40px', backgroundColor: `${color}15`, color: color }}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h6 className="fw-bold text-dark mb-0 small">{title}</h6>
                        <span className="extra-small fw-bold text-muted opacity-40">Photo evidence • {stageImages.length} files</span>
                    </div>
                </div>
                <div className="row g-3">
                    {stageImages.map((img, idx) => (
                        <div key={idx} className="col-6 col-md-4 col-lg-3">
                            <ImageThumbnail img={img} stageKey={stageKey} onClick={() => setSelectedImage(img)} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="complaint-detail-view animate-fadeIn">
            {/* Top Command Bar & Escalation */}
            <div className="row mb-5">
                <div className="col-12">
                    {canReopen() ? (
                        <div className="alert border-0 shadow-premium p-4 rounded-4" style={{ backgroundColor: '#FEF2F2', borderLeft: '6px solid #EF4444 !important' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="circ-white shadow-premium border text-danger" style={{ width: '64px', height: '64px' }}>
                                        <ShieldAlert size={32} />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold text-danger mb-1">Not satisfied?</h5>
                                        <p className="extra-small text-muted mb-0 opacity-80">If the work is not done properly, you can ask to reopen this case.</p>
                                    </div>
                                </div>
                                <button onClick={onReopen} className="btn btn-danger btn-premium px-5 shadow-float">
                                    <RotateCcw size={18} /> Reopen case
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-4 gov-rounded elevation-1 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                    <Activity size={18} />
                                </div>
                                <span className="extra-small fw-black text-dark uppercase tracking-widest">Complaint ID: {complaint.complaintId || complaint.id}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className={`badge-rect-blue px-3 py-1 border-0 ${complaint.priority === 'HIGH' ? 'bg-danger' : 'bg-primary'}`} style={{ fontSize: '10px' }}>
                                    {complaint.priority || 'STANDARD'} PRIORITY
                                </div>
                                {children}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column */}
                <div className="col-lg-8">
                    {/* Status Visualization */}
                    <div className="premium-card p-0 mb-4 overflow-hidden elevation-2">
                        <div className="row g-0">
                            <div className="col-md-4 theme-dark-bg p-5 d-flex flex-column justify-content-center text-center position-relative overflow-hidden">
                                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                                    <Activity size={200} className="position-absolute bottom-0 end-0" style={{ transform: 'translate(40%, 40%)' }} />
                                </div>
                                <div className="position-relative z-1">
                                    <p className="extra-small fw-bold text-white opacity-60 mb-3">Current status</p>
                                    <h3 className="fw-black text-white mb-4">{currentConf.label}</h3>
                                    <div className="circ-white mx-auto shadow-float elevation-4" style={{ width: '84px', height: '84px', color: currentConf.color }}>
                                        <currentConf.icon size={40} strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8 p-5 bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-5">
                                    <div>
                                        <h6 className="fw-bold text-dark extra-small mb-1 opacity-40">Process flow</h6>
                                        <p className="extra-small fw-bold text-muted">Tracking work</p>
                                    </div>
                                    <div className="badge-rect-blue glass-panel-dark border-0" style={{ color: currentConf.color }}>
                                        Verified
                                    </div>
                                </div>

                                <div className="position-relative py-5 overflow-auto no-scrollbar">
                                    <div className="d-flex justify-content-between position-relative" style={{ minWidth: '450px' }}>
                                        {[
                                            { id: 'SUBMITTED', l: 'Reported', i: FileText },
                                            { id: 'APPROVED', l: 'Verified', i: ShieldCheck },
                                            { id: 'ASSIGNED', l: 'Assigned', i: User },
                                            { id: 'IN_PROGRESS', l: 'Working', i: Zap },
                                            { id: 'RESOLVED', l: 'Solved', i: CheckCircle },
                                            { id: 'CLOSED', l: 'Done', i: CheckCheck }
                                        ].map((s, idx, arr) => {
                                            const cIdx = workflowStages.indexOf(complaint.status);
                                            const isDone = idx <= cIdx;
                                            const isNow = idx === cIdx;
                                            return (
                                                <div key={s.id} className="d-flex flex-column align-items-center flex-grow-1 position-relative" style={{ zIndex: 10 }}>
                                                    <div className={`circ-white transition-standard ${isNow ? 'animate-heartbeat' : ''}`}
                                                        style={{
                                                            width: isNow ? '52px' : '44px',
                                                            height: isNow ? '52px' : '44px',
                                                            backgroundColor: isNow ? PRIMARY_COLOR : isDone ? `${PRIMARY_COLOR}CC` : '#F8FAFC',
                                                            color: isDone ? 'white' : '#CBD5E1',
                                                            boxShadow: isNow ? `0 0 25px ${PRIMARY_COLOR}40` : 'none',
                                                            border: isNow ? `3px solid white` : '1px solid #E2E8F0'
                                                        }}>
                                                        <s.i size={isNow ? 24 : 18} strokeWidth={isNow ? 3 : 2} />
                                                    </div>
                                                    <span className={`extra-small fw-bold mt-3 d-block text-center ${isNow ? 'text-primary' : 'text-muted opacity-40'}`} style={{ fontSize: '0.6rem' }}>
                                                        {s.l}
                                                    </span>
                                                    {idx < arr.length - 1 && (
                                                        <div className="position-absolute" style={{ height: '3px', width: '100%', backgroundColor: idx < cIdx ? PRIMARY_COLOR : '#F1F5F9', top: isNow ? '26px' : '22px', left: '50%', zIndex: -1 }}></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Collection */}
                    <div className="premium-card p-5 mb-4 elevation-2">
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="circ-blue shadow-premium" style={{ width: '48px', height: '48px' }}><Camera size={24} /></div>
                                <h5 className="fw-bold text-dark mb-0">Photos</h5>
                            </div>
                            <div className="badge-rect-white border" style={{ color: PRIMARY_COLOR }}>{images.length} files</div>
                        </div>

                        {evidenceStages.map(stage => (
                            <EvidenceSection
                                key={stage.key}
                                title={stage.label}
                                stageImages={getStageImages(stage)}
                                icon={stage.icon}
                                color={stage.color}
                                stageKey={stage.key}
                            />
                        ))}

                        {uncategorizedImages.length > 0 && (
                            <EvidenceSection
                                title="Other photos"
                                stageImages={uncategorizedImages}
                                icon={Layers}
                                color="#64748B"
                                stageKey="System"
                            />
                        )}
                    </div>

                    <div className="premium-card p-0 elevation-3 overflow-hidden bg-white mb-5">
                        <div className="p-5">
                            <div className="timeline-narrative ps-4 border-start border-2 border-primary border-opacity-10" style={{ marginLeft: '1rem' }}>
                                {statusHistory.map((h, i) => {
                                    const st = getStatusConfig(h.status);
                                    let roleLabel = (h.changedByRole || 'SYSTEM').toUpperCase();

                                    if (roleLabel === 'DEPARTMENT_OFFICER') {
                                        roleLabel = 'FIELD OPERATIONS OFFICER';
                                    } else {
                                        roleLabel = roleLabel.replace(/_/g, ' ');
                                    }

                                    const isFieldOp = roleLabel === 'FIELD OPERATIONS OFFICER';
                                    const badgeClass = isFieldOp ? 'badge-rect-blue' : 'badge-rect-white border text-dark';

                                    return (
                                        <div key={i} className="position-relative mb-5">
                                            <div className="position-absolute start-0 translate-middle-x circ-white shadow-sm"
                                                style={{ width: '36px', height: '36px', left: '-1.5rem', backgroundColor: st.bg, color: st.color, border: `2px solid white`, top: '0' }}>
                                                <st.icon size={16} />
                                            </div>
                                            <div className="ps-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="extra-small fw-bold mb-0" style={{ color: st.color }}>{h.status?.replace(/_/g, ' ')}</h6>
                                                    <span className="extra-small fw-bold text-muted opacity-40">{formatDate(h.updatedAt)}</span>
                                                </div>
                                                <div className="p-3 bg-light bg-opacity-40 gov-rounded border-0 border-start border-3" style={{ borderColor: st.color }}>
                                                    <p className="small text-dark mb-0 fw-medium">"{h.remarks || 'Status updated.'}"</p>
                                                </div>
                                                <div className="mt-2 d-flex gap-2">
                                                    <span className={`${badgeClass} py-1 px-2`} style={{ fontSize: '0.6rem', ...(isFieldOp ? { opacity: 1 } : { opacity: 0.8 }) }}>{roleLabel}</span>
                                                    {h.changedByName && <span className="badge-rect-white py-1 px-2 border text-dark fw-bold" style={{ fontSize: '0.6rem' }}>{h.changedByName}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 text-center bg-light border-top">
                            <p className="extra-small fw-bold text-muted opacity-40 uppercase mb-0 tracking-[0.3em]">End of Official Log</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-lg-4">
                    {/* Basic Info */}
                    <div className="premium-card p-5 mb-4 elevation-3 bg-white">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <Layers className="text-primary" size={20} />
                            <h6 className="fw-black text-primary uppercase tracking-widest mb-0 small">Record Specification</h6>
                        </div>

                        <div className="p-5 glass-panel-dark gov-rounded mb-4 position-relative border-premium shadow-sm">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="circ-blue" style={{ width: '32px', height: '32px', opacity: 0.1 }}><FileText size={16} /></div>
                                <h6 className="extra-small fw-black text-primary uppercase tracking-widest mb-0">Record Subject</h6>
                            </div>
                            <h4 className="fw-black text-dark mb-4" style={{ fontSize: '1.4rem', lineHeight: '1.2' }}>{complaint.title || 'Untitled Case Record'}</h4>

                            <div className="border-top pt-4 mt-2">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="circ-blue" style={{ width: '32px', height: '32px', opacity: 0.1 }}><Quote size={16} /></div>
                                    <h6 className="extra-small fw-black text-primary uppercase tracking-widest mb-0">Strategic Narrative</h6>
                                </div>
                                <p className="fw-bold text-dark lh-base mb-0 text-break opacity-80" style={{ fontSize: '0.95rem' }}>{complaint.description}</p>
                            </div>
                        </div>

                        <div className="vstack gap-3">
                            {[
                                { l: 'Reported by', v: 'Resident', i: User },
                                { l: 'Area', v: complaint.wardName || 'PMC District', i: MapPin },
                                { l: 'Department', v: (complaint.departmentName || 'General').replace(/_/g, ' '), i: Building2 },
                                { l: 'Date', v: formatDate(complaint.createdAt, false), i: Calendar }
                            ].map((m, i) => (
                                <div key={i} className="d-flex align-items-center justify-content-between p-3 border-bottom border-light">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="circ-white border" style={{ width: '32px', height: '32px', color: PRIMARY_COLOR }}><m.i size={14} /></div>
                                        <span className="extra-small fw-bold text-muted">{m.l}</span>
                                    </div>
                                    <span className="extra-small fw-bold text-dark">{m.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SLA Status Terminal */}
                    {complaint.createdAt && (
                        <div className="premium-card p-5 mb-4 elevation-4" style={{
                            background: slaCountdown?.breached
                                ? 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)'
                                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        }}>
                            <div className="d-flex align-items-center justify-content-between mb-5">
                                <div className="d-flex align-items-center gap-3">
                                    <Timer className={slaCountdown?.breached ? 'text-danger' : 'text-warning'} size={24} />
                                    <h6 className="fw-bold text-white mb-0 small uppercase tracking-widest">SLA Countdown</h6>
                                </div>
                                <div className={`badge-rect-blue ${slaCountdown?.breached ? 'bg-danger' : 'bg-warning'} bg-opacity-20 ${slaCountdown?.breached ? 'text-white' : 'text-warning'} border-0`} style={{ fontSize: '9px' }}>
                                    {slaCountdown?.breached ? 'SLA BREACHED' : 'OFFICIAL KPI'}
                                </div>
                            </div>

                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="extra-small fw-bold text-white opacity-40 uppercase">Progress Tracker</span>
                                    <span className={`extra-small fw-bold ${slaCountdown?.breached ? 'text-danger' : 'text-warning'}`}>
                                        {slaCountdown?.breached
                                            ? 'DELAYED RESPONSE'
                                            : slaCountdown?.remainingMinutes
                                                ? `${Math.floor(slaCountdown.remainingMinutes / 60)}H ${slaCountdown.remainingMinutes % 60}M LEFT`
                                                : 'EST. 48 HOUR CYCLE'}
                                    </span>
                                </div>
                                <div className="progress overflow-hidden" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{
                                        width: ['RESOLVED', 'CLOSED'].includes(complaint.status) ? '100%' : slaCountdown?.breached ? '100%' : '45%',
                                        backgroundColor: slaCountdown?.breached ? '#EF4444' : '#F59E0B'
                                    }}></div>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="p-3 bg-white bg-opacity-5 gov-rounded border border-white border-opacity-10">
                                        <h6 className="extra-small fw-bold text-white mb-1 opacity-40 uppercase">Logged</h6>
                                        <p className="text-white fw-bold mb-0 small">{formatDate(complaint.createdAt, false)}</p>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 bg-white bg-opacity-5 gov-rounded border border-white border-opacity-10">
                                        <h6 className="extra-small fw-bold text-white mb-1 opacity-40 uppercase">Deadline</h6>
                                        <p className={`fw-bold mb-0 small ${slaCountdown?.breached ? 'text-danger' : 'text-white'}`}>
                                            {slaCountdown?.deadline ? formatDate(slaCountdown.deadline, false) : formatDate(new Date(new Date(complaint.createdAt).getTime() + 48 * 60 * 60 * 1000), false)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Personnel Registry & Authority */}
                    {/* Personnel Registry & Authority */}
                    {(complaint.wardOfficerName || complaint.departmentOfficerName || complaint.assignedOfficerName) && (
                        <div className="premium-card p-0 mb-4 elevation-3 overflow-hidden">
                            <div className="p-4 theme-dark-bg text-white d-flex align-items-center gap-3">
                                <ShieldCheck size={20} className="text-success" />
                                <h6 className="fw-black extra-small uppercase tracking-widest mb-0">Verification Authority</h6>
                            </div>
                            <div className="p-5 vstack gap-4 bg-white">
                                {complaint.wardOfficerName && (
                                    <div className="d-flex align-items-start gap-4 p-4 rounded-4 bg-light border-0 transition-standard hover-up-small">
                                        <div className="circ-blue shadow-premium flex-shrink-0" style={{ width: '52px', height: '52px' }}>
                                            <Shield size={22} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <span className="extra-small fw-black text-primary uppercase tracking-[0.2em] d-block mb-1">Ward Officer</span>
                                            <h6 className="fw-bold text-dark mb-1">{complaint.wardOfficerName}</h6>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="badge-rect-blue py-1 px-2 border-0 opacity-60" style={{ fontSize: '0.65rem' }}>LOGGED AS AUTH_OFFICER</div>
                                                {complaint.wardOfficerMobile && (
                                                    <div className="d-flex align-items-center gap-2 text-primary">
                                                        <Smartphone size={12} />
                                                        <span className="extra-small fw-bold">{complaint.wardOfficerMobile}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {(complaint.departmentOfficerName || complaint.assignedOfficerName) && (
                                    <div className="d-flex align-items-start gap-4 p-4 rounded-4 bg-light border-0 transition-standard hover-up-small">
                                        <div className="circ-white border shadow-sm flex-shrink-0 text-primary" style={{ width: '52px', height: '52px' }}>
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <span className="extra-small fw-black text-muted uppercase tracking-[0.2em] d-block mb-1">Field Operations Officer</span>
                                            <h6 className="fw-bold text-dark mb-1">{complaint.departmentOfficerName || complaint.assignedOfficerName}</h6>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="badge-rect-white py-1 px-2 border text-dark opacity-60" style={{ fontSize: '0.6rem' }}>UNIT: {complaint.departmentName || 'TECHNICAL'}</div>
                                                {(complaint.assignedOfficerMobile || complaint.departmentOfficerMobile) && (
                                                    <div className="d-flex align-items-center gap-2 text-primary">
                                                        <Smartphone size={12} />
                                                        <span className="extra-small fw-bold">{complaint.assignedOfficerMobile || complaint.departmentOfficerMobile}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Citizen Feedback Ledger */}
                    {complaint.feedback && (
                        <div className="premium-card p-0 mb-4 elevation-3 overflow-hidden bg-white border-0">
                            <div className="p-4 bg-warning bg-opacity-10 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <Star size={20} className="text-warning" fill="#F59E0B" />
                                    <h6 className="fw-black extra-small uppercase tracking-widest mb-0">Citizen Satisfaction</h6>
                                </div>
                                <div className="d-flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => {
                                        const rating = typeof complaint.feedback === 'object' ? complaint.feedback.rating : complaint.rating;
                                        return <Star key={s} size={12} fill={s <= rating ? '#F59E0B' : 'none'} stroke={s <= rating ? '#F59E0B' : '#CBD5E1'} />;
                                    })}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="p-4 bg-light rounded-4 position-relative">
                                    <Quote className="position-absolute top-0 end-0 p-3 opacity-5" size={40} />
                                    <p className="small fw-bold text-dark mb-0 lh-base italic">
                                        "{typeof complaint.feedback === 'object' ? complaint.feedback.comment : complaint.feedback}"
                                    </p>
                                </div>
                                <div className="mt-4 d-flex align-items-center gap-2">
                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                        {complaint.citizenName?.charAt(0) || 'C'}
                                    </div>
                                    <span className="extra-small fw-bold text-muted uppercase tracking-widest">Logged by Resident</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox / Image Zoom */}
            {selectedImage && (
                <div className="locked-modal-overlay animate-fadeIn" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 3000, backdropFilter: 'blur(10px)' }}>
                    <div className="position-absolute top-0 end-0 p-5 z-2">
                        <button className="btn btn-premium circ-white bg-white text-dark shadow-float border-0" onClick={() => setSelectedImage(null)} style={{ width: '64px', height: '64px' }}>
                            <X size={32} />
                        </button>
                    </div>

                    <div className="container d-flex align-items-center justify-content-center h-100">
                        <div className="row justify-content-center w-100">
                            <div className="col-lg-10 col-xl-8">
                                <div className="card bg-transparent border-0">
                                    <div className="premium-card overflow-hidden shadow-float elevation-float border-2 border-white border-opacity-20 animate-zoomIn">
                                        <img
                                            src={extractImageUrl(selectedImage, complaint.id)}
                                            className="w-100 h-auto"
                                            style={{ maxHeight: '75vh', objectFit: 'contain' }}
                                            alt="full scale evidence"
                                            onError={(e) => { e.target.src = getPlaceholderImage(selectedImage.stage || 'IMAGE'); }}
                                        />
                                    </div>
                                    <div className="mt-5 text-center">
                                        <div className="badge-rect-blue btn-premium px-5 py-2 mx-auto" style={{ fontSize: '0.8rem', background: '#173470', color: 'white' }}>
                                            {(selectedImage.stage || selectedImage.type || 'IMAGE')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .group:hover .group-hover\\:scale-110 { transform: scale(1.1); }
                .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
                .backdrop-blur-sm { backdrop-filter: blur(4px); }
                .animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes zoomIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
                .group-hover\\:scale-110 { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
            `}} />
        </div>
    );
};

export default ComplaintDetailView;
