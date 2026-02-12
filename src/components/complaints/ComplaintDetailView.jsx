import React, { useState } from 'react';
import {
    Clock, User, MapPin, Calendar, Building2, Image as ImageIcon,
    MessageSquare, Mail, Phone, Eye, CheckCircle, AlertTriangle,
    Shield, ArrowRight, History as HistoryIcon, Info, Camera, Zap, X, Star, FileText, Activity,
    ShieldCheck, CheckCheck, Quote, Search, Layers, Smartphone, SmartphoneIcon, RotateCcw, Timer, ShieldAlert,
    Upload, PlayCircle, Settings, XCircle, ThumbsUp, ThumbsDown, Send, AlertCircle, Stamp, Lock, Fingerprint
} from 'lucide-react';
import { extractImageUrl, getPlaceholderImage } from '../../utils/imageUtils';
import { COMPLAINT_STATUS, IMAGE_STAGES } from '../../constants';
import AuthenticatedImage from '../ui/AuthenticatedImage';

/**
 * ✨ CivicConnect – Universal Complaint Details Page
 * 🔐 One common page for ALL users (Citizen, Ward Officer, Department Officer, Admin)
 * 👁️ Full visibility with role-based action controls
 * 🎨 Premium tactical government-tech aesthetic
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
    const [activeImageTab, setActiveImageTab] = useState('CITIZEN');
    const PRIMARY_COLOR = '#173470';
    const SECONDARY_COLOR = '#10B981';

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
            'SUBMITTED': { label: 'RECEIVED', icon: FileText, color: '#64748B', bg: '#F8FAFC', accent: '#94A3B8' },
            'APPROVED': { label: 'APPROVED', icon: CheckCheck, color: '#0EA5E9', bg: '#F0F9FF', accent: '#38BDF8' },
            'ASSIGNED': { label: 'ASSIGNED', icon: User, color: '#6366F1', bg: '#F5F5FF', accent: '#818CF8' },
            'IN_PROGRESS': { label: 'WORKING', icon: Activity, color: '#F59E0B', bg: '#FFFBEB', accent: '#FBBF24' },
            'RESOLVED': { label: 'FIXED', icon: CheckCircle, color: '#10B981', bg: '#ECFDF5', accent: '#34D399' },
            'CLOSED': { label: 'FINISHED', icon: ShieldCheck, color: '#173470', bg: '#F1F5F9', accent: '#1E293B' },
            'REJECTED': { label: 'RETURNED', icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2', accent: '#F87171' },
            'REOPENED': { label: 'BACK OPEN', icon: RotateCcw, color: '#F43F5E', bg: '#FFF1F2', accent: '#FB7185' }
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
        const imageUrl = extractImageUrl(img, complaint.complaintId || complaint.id);

        return (
            <div className="group cursor-pointer position-relative overflow-hidden rounded-5 shadow-premium transition-standard border-2 border-white hover-up-tiny"
                style={{ height: '160px' }}
                onClick={onClick}>
                <AuthenticatedImage
                    src={imageUrl}
                    className="w-100 h-100 object-fit-cover transition-standard group-hover-scale"
                    alt="evidence"
                    placeholderType={stageKey}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-20 opacity-0 group-hover-opacity-100 transition-standard d-flex align-items-center justify-content-center" style={{ backdropFilter: 'blur(4px)' }}>
                    <div className="rounded-circle shadow-premium bg-white d-flex align-items-center justify-content-center transition-standard" style={{ width: '48px', height: '48px' }}>
                        <Eye size={22} style={{ color: PRIMARY_COLOR }} />
                    </div>
                </div>
                <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-white bg-opacity-95 border-top border-white border-opacity-20">
                    <div className="d-flex align-items-center justify-content-between">
                        <span className="extra-small fw-black tracking-widest text-primary uppercase" style={{ fontSize: '0.6rem', color: PRIMARY_COLOR }}>{stageKey} PHASE</span>
                        <Fingerprint size={12} className="opacity-40" />
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

    return (
        <div className="complaint-detail-view animate-fadeIn">
            {/* Top Action Protocol */}
            <div className="row mb-5">
                <div className="col-12">
                    {canReopen() ? (
                        <div className="p-4 rounded-5 shadow-premium border-0 overflow-hidden bg-white border-top border-5 border-danger anim-pulse-border">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-5">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="p-4 bg-danger bg-opacity-5 rounded-circle text-danger shadow-inner">
                                        <RotateCcw size={32} />
                                    </div>
                                    <div>
                                        <h5 className="fw-black text-danger mb-1 uppercase tracking-tight">Resolution Inadequate?</h5>
                                        <p className="extra-small text-muted fw-bold mb-0 opacity-60 uppercase tracking-widest lh-lg">Initiate higher clearance investigation protocol if resolution standards failed.</p>
                                    </div>
                                </div>
                                <button onClick={onReopen} className="btn btn-danger px-5 py-3 fw-black rounded-pill shadow-premium border-0 extra-small tracking-widest uppercase hover-up-tiny">
                                    EXECUTE RE-OPEN
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-5 bg-white shadow-premium border-2 border-dashed d-flex align-items-center justify-content-between strategic-border transition-standard hover-up-tiny">
                            <div className="d-flex align-items-center gap-4">
                                <div className="p-3 bg-primary bg-opacity-5 rounded-circle shadow-inner">
                                    <ShieldCheck size={20} style={{ color: PRIMARY_COLOR }} />
                                </div>
                                <div>
                                    <span className="extra-small fw-black text-dark uppercase tracking-widest">ENCRYPTED CASE TOKEN</span>
                                    <h6 className="fw-black mb-0 uppercase tracking-tighter" style={{ color: PRIMARY_COLOR }}>#{complaint.complaintId || complaint.id}</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className={`badge rounded-pill px-4 py-2 extra-small fw-black tracking-widest border-0 ${complaint.priority === 'HIGH' ? 'bg-danger shadow-danger-glow' : 'bg-primary'}`} style={{ backgroundColor: complaint.priority === 'HIGH' ? '#ef4444' : PRIMARY_COLOR }}>
                                    {complaint.priority || 'STANDARD'} PRIORITY
                                </div>
                                {children}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="row g-5">
                {/* Tactical Column: Status & Timeline */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden mb-5 transition-standard border-top border-5" style={{ borderColor: PRIMARY_COLOR }}>
                        <div className="row g-0">
                            <div className="col-md-5 tactical-dark p-5 d-flex flex-column justify-content-center text-center position-relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
                                <div className="strategic-grid position-absolute w-100 h-100 top-0 start-0 opacity-10"></div>
                                <div className="position-relative z-1">
                                    <div className="mx-auto bg-white bg-opacity-5 rounded-pill px-4 py-2 d-inline-flex align-items-center gap-3 mb-5 border border-white border-opacity-10 animate-fadeIn">
                                        <div className="bg-success rounded-circle anim-pulse" style={{ width: '8px', height: '8px', boxShadow: '0 0 10px #10b981' }}></div>
                                        <span className="extra-small fw-black text-white uppercase tracking-[0.25em]">LIVE SECTOR STATUS</span>
                                    </div>
                                    <h3 className="fw-black text-white mb-2 display-6 uppercase tracking-tight">{currentConf.label}</h3>
                                    <p className="extra-small fw-black text-white opacity-40 uppercase tracking-[0.35em] mb-5">OPERATIONAL ARCHIVE STATUS</p>

                                    <div className="rounded-circle mx-auto shadow-lg bg-white d-flex align-items-center justify-content-center anim-float transition-standard" style={{ width: '100px', height: '100px', color: currentConf.color }}>
                                        <currentConf.icon size={48} strokeWidth={2.5} />
                                    </div>

                                    <div className="mt-5 pt-5 border-top border-white border-opacity-10">
                                        <div className="d-flex justify-content-center gap-5">
                                            <div>
                                                <div className="extra-small fw-black text-white opacity-40 uppercase tracking-widest mb-2">SECTOR</div>
                                                <div className="extra-small fw-black text-white tracking-widest uppercase">{(complaint.wardName || 'PMC').toUpperCase()}</div>
                                            </div>
                                            <div className="border-start border-white border-opacity-10 ps-5">
                                                <div className="extra-small fw-black text-white opacity-40 uppercase tracking-widest mb-2">DOMAIN</div>
                                                <div className="extra-small fw-black text-white tracking-widest uppercase">{(complaint.departmentName || 'CIVIC').replace(/_/g, ' ')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-7 p-5 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-5 pb-4 border-bottom">
                                    <div>
                                        <h6 className="fw-black text-dark uppercase tracking-widest small mb-1">Mission Lifecycle</h6>
                                        <p className="extra-small fw-bold text-muted opacity-60 uppercase mb-0 tracking-widest">Linear intelligence tracking of field protocols.</p>
                                    </div>
                                    <div className="p-2 px-3 bg-light rounded-4 shadow-inner">
                                        <Lock size={12} className="text-primary me-2" style={{ color: PRIMARY_COLOR }} />
                                        <span className="extra-small fw-black text-muted tracking-widest uppercase">SECURE</span>
                                    </div>
                                </div>

                                <div className="workflow-timeline py-4">
                                    <div className="d-flex justify-content-between position-relative" style={{ minWidth: '400px' }}>
                                        {[
                                            { id: 'SUBMITTED', l: 'RECV', i: FileText },
                                            { id: 'APPROVED', l: 'APRV', i: ShieldCheck },
                                            { id: 'ASSIGNED', l: 'ASGN', i: User },
                                            { id: 'IN_PROGRESS', l: 'WORK', i: Activity },
                                            { id: 'RESOLVED', l: 'FIXD', i: CheckCircle },
                                            { id: 'CLOSED', l: 'DONE', i: CheckCheck }
                                        ].map((s, idx, arr) => {
                                            const currentStatusIdx = workflowStages.indexOf(complaint.status);
                                            const stepStatusIdx = workflowStages.indexOf(s.id);
                                            const isDone = stepStatusIdx <= currentStatusIdx;
                                            const isNow = stepStatusIdx === currentStatusIdx;

                                            return (
                                                <div key={s.id} className="d-flex flex-column align-items-center flex-grow-1 position-relative" style={{ zIndex: 10 }}>
                                                    <div className={`rounded-circle d-flex align-items-center justify-content-center transition-standard ${isNow ? 'animate-heartbeat' : ''} ${isDone ? 'shadow-premium' : 'opacity-30'}`}
                                                        style={{
                                                            width: isNow ? '56px' : '44px',
                                                            height: isNow ? '56px' : '44px',
                                                            backgroundColor: isNow ? PRIMARY_COLOR : isDone ? `${PRIMARY_COLOR}EE` : '#F1F5F9',
                                                            color: isDone ? 'white' : '#94A3B8',
                                                            border: isNow ? `5px solid #F1F5F9` : '2px solid white'
                                                        }}>
                                                        <s.i size={isNow ? 24 : 18} strokeWidth={isNow ? 3 : 2} />
                                                    </div>
                                                    <span className={`extra-small fw-black mt-3 d-block uppercase tracking-widest ${isNow ? 'text-primary' : isDone ? 'text-dark' : 'text-muted opacity-30'}`} style={{ fontSize: '0.6rem' }}>
                                                        {s.l}
                                                    </span>
                                                    {idx < arr.length - 1 && (
                                                        <div className="position-absolute" style={{ height: '4px', width: '100%', backgroundColor: stepStatusIdx < currentStatusIdx ? PRIMARY_COLOR : '#F1F5F9', top: isNow ? '28px' : '22px', left: '50%', zIndex: -1, borderBottom: '1px solid rgba(255,255,255,0.2)' }}></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="mt-5 p-4 bg-primary bg-opacity-5 rounded-5 border-2 border-dashed strategic-border d-flex align-items-center gap-4 transition-standard hover-up-tiny">
                                    <div className="p-3 bg-white shadow-premium rounded-circle">
                                        <Info size={18} style={{ color: PRIMARY_COLOR }} />
                                    </div>
                                    <div>
                                        <p className="extra-small fw-black text-dark mb-1 uppercase tracking-widest">LATEST TELEMETRY FEED</p>
                                        <p className="extra-small text-muted mb-0 uppercase tracking-widest fw-black opacity-60">
                                            {formatDate(statusHistory[0]?.updatedAt || complaint.updatedAt || complaint.createdAt)} • {statusHistory[0]?.remarks || 'CASE PROTOCOL DEPLOYED.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Gallery */}
                    <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden mb-5 transition-standard p-5">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-4 border-bottom">
                            <div className="d-flex align-items-center gap-4">
                                <div className="p-3 bg-light border shadow-inner rounded-circle">
                                    <Camera size={24} style={{ color: PRIMARY_COLOR }} />
                                </div>
                                <div>
                                    <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">Case Documentation</h5>
                                    <p className="extra-small fw-bold text-muted opacity-60 uppercase mb-0 tracking-widest">High-fidelity visual evidence logs.</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-primary bg-opacity-5 rounded-pill border-2 border-dashed extra-small fw-black tracking-widest uppercase" style={{ color: PRIMARY_COLOR, borderColor: `${PRIMARY_COLOR}40` }}>
                                {images.length} ARCHIVED OBJECTS
                            </div>
                        </div>

                        {/* Tactical Tab Interface */}
                        <div className="bg-light p-2 rounded-5 d-flex gap-2 mb-5 shadow-inner">
                            {[
                                { id: 'CITIZEN', label: 'BEFORE', icon: User, stages: ['INITIAL', 'BEFORE', 'SUBMITTED', 'CITIZEN_UPLOAD', 'BEFORE_WORK'] },
                                { id: 'WORK_STARTED', label: 'STARTED', icon: PlayCircle, stages: ['WORK_STARTED', 'START'] },
                                { id: 'IN_PROGRESS', label: 'DURING', icon: Activity, stages: ['IN_PROGRESS', 'DURING', 'PROGRESS', 'WORK_IN_PROGRESS'] },
                                { id: 'RESOLUTION', label: 'AFTER', icon: CheckCircle, stages: ['RESOLVED', 'AFTER', 'FINAL', 'RESOLUTION_PROOF', 'AFTER_RESOLUTION', 'COMPLETED'] }
                            ].map(tab => {
                                const tabImages = images.filter(img => tab.stages.includes((img.stage || '').toUpperCase().replace(/ /g, '_')));
                                const isActive = activeImageTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveImageTab(tab.id)}
                                        className={`btn flex-fill rounded-pill py-3 px-4 extra-small fw-black uppercase tracking-widest transition-standard d-flex align-items-center justify-content-center gap-3 border-0 ${isActive ? 'bg-primary text-white shadow-premium' : 'text-muted opacity-60 hover-opacity-100'}`}
                                        style={isActive ? { backgroundColor: PRIMARY_COLOR } : {}}
                                    >
                                        <tab.icon size={16} />
                                        <span className="d-none d-md-inline">{tab.label}</span>
                                        {tabImages.length > 0 && <span className={`badge rounded-circle shadow-inner ${isActive ? 'bg-white text-primary' : 'bg-secondary text-white'}`} style={{ padding: '4px 6px', fontSize: '9px' }}>{tabImages.length}</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {(() => {
                            const stageMap = {
                                'CITIZEN': ['INITIAL', 'BEFORE', 'SUBMITTED', 'CITIZEN_UPLOAD', 'BEFORE_WORK'],
                                'WORK_STARTED': ['WORK_STARTED', 'START'],
                                'IN_PROGRESS': ['IN_PROGRESS', 'DURING', 'PROGRESS', 'WORK_IN_PROGRESS'],
                                'RESOLUTION': ['RESOLVED', 'AFTER', 'FINAL', 'RESOLUTION_PROOF', 'AFTER_RESOLUTION', 'COMPLETED']
                            };
                            const activeImages = images.filter(img => stageMap[activeImageTab]?.includes((img.stage || '').toUpperCase().replace(/ /g, '_')));

                            if (activeImages.length === 0) {
                                return (
                                    <div className="text-center py-5 bg-light bg-opacity-30 rounded-5 border-2 border-dashed strategic-border">
                                        <div className="p-5 opacity-20">
                                            <Layers size={64} className="mb-4" />
                                            <h6 className="fw-black uppercase tracking-widest mb-2">NO VISUAL INTEL ARCHIVED</h6>
                                            <p className="extra-small fw-bold uppercase">Awaiting field documentation for this phase.</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="row g-4 animate-fadeIn">
                                    {activeImages.map((img, idx) => (
                                        <div key={idx} className="col-6 col-md-4 col-lg-3">
                                            <ImageThumbnail img={img} stageKey={activeImageTab} onClick={() => setSelectedImage(img)} />
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Operational Narrative Log */}
                    <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden mb-5 transition-standard">
                        <div className="p-5">
                            <h6 className="fw-black text-primary uppercase tracking-[0.25em] mb-5 small" style={{ color: PRIMARY_COLOR }}>PROTOCOL EXECUTION LOG</h6>
                            <div className="ps-5 border-start border-3 border-primary border-opacity-10 position-relative" style={{ marginLeft: '1rem' }}>
                                {statusHistory.map((h, i) => {
                                    const st = getStatusConfig(h.status);
                                    let roleLabel = (h.changedByRole || 'SYSTEM').toUpperCase().replace(/_/g, ' ');

                                    return (
                                        <div key={i} className="position-relative mb-5 transition-standard hover-up-tiny">
                                            <div className="position-absolute start-0 translate-middle-x rounded-circle shadow-premium d-flex align-items-center justify-content-center bg-white"
                                                style={{ width: '40px', height: '40px', left: '-1.5rem', color: st.color, border: `2px solid #f1f5f9`, top: '0' }}>
                                                <st.icon size={18} />
                                            </div>
                                            <div className="ps-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="extra-small fw-black mb-0 uppercase tracking-widest" style={{ color: st.color }}>{h.status?.replace(/_/g, ' ')}</h6>
                                                    <span className="extra-small fw-black text-muted opacity-40 uppercase tracking-widest">{formatDate(h.updatedAt)}</span>
                                                </div>
                                                <div className="p-4 bg-light bg-opacity-50 rounded-4 border-start border-4 shadow-inner" style={{ borderColor: st.color }}>
                                                    <p className="extra-small fw-black text-dark mb-0 uppercase tracking-widest lh-base opacity-80">"{h.remarks || 'Standard status transition recorded.'}"</p>
                                                </div>
                                                <div className="mt-3 d-flex gap-3">
                                                    <div className="px-3 py-1 bg-white border rounded-pill extra-small fw-black text-muted tracking-widest uppercase">{roleLabel}</div>
                                                    {h.changedByName && <div className="px-3 py-1 bg-primary bg-opacity-5 rounded-pill extra-small fw-black text-primary tracking-widest uppercase" style={{ color: PRIMARY_COLOR }}>{h.changedByName}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 text-center bg-light bg-opacity-50 border-top">
                            <p className="extra-small fw-black text-muted opacity-40 uppercase mb-0 tracking-[0.5em]">SYSTEM_ARCHIVE_TERMINATED</p>
                        </div>
                    </div>
                </div>

                {/* Tactical Column: Profile & Metadata */}
                <div className="col-lg-4">
                    {/* Primary Case Ledger Card */}
                    <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden mb-5 transition-standard p-5 border-top border-5" style={{ borderColor: PRIMARY_COLOR }}>
                        <div className="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom">
                            <div className="p-3 bg-primary bg-opacity-5 rounded-circle shadow-inner">
                                <FileText size={24} style={{ color: PRIMARY_COLOR }} />
                            </div>
                            <div>
                                <h6 className="fw-black text-primary uppercase tracking-widest mb-1 small" style={{ color: PRIMARY_COLOR }}>FIELD Intel</h6>
                                <p className="extra-small fw-bold text-muted opacity-60 uppercase mb-0 tracking-widest">Citizen Submission Data</p>
                            </div>
                        </div>

                        <div className="p-4 bg-light bg-opacity-50 rounded-5 mb-5 shadow-inner border border-white position-relative overflow-hidden">
                            <div className="strategic-grid position-absolute w-100 h-100 top-0 start-0 opacity-05"></div>
                            <div className="position-relative z-1">
                                <h4 className="fw-black text-dark mb-4 tracking-tighter uppercase" style={{ fontSize: '1.4rem' }}>{complaint.title || 'Untitled Case'}</h4>
                                <div className="p-4 bg-white bg-opacity-80 rounded-4 shadow-sm">
                                    <p className="extra-small fw-black text-muted mb-0 lh-lg tracking-widest opacity-80">{complaint.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="vstack gap-3">
                            {[
                                { l: 'SOURCE ENTITY', v: 'VERIFIED RESIDENT', i: User },
                                { l: 'OPERATIONAL SECTOR', v: complaint.wardName || 'CENTRAL SECTOR', i: MapPin },
                                { l: 'COMMAND DOMAIN', v: (complaint.departmentName || 'GENERAL').replace(/_/g, ' '), i: Building2 },
                                { l: 'LEDGER INGRESS', v: formatDate(complaint.createdAt, false), i: Calendar }
                            ].map((m, i) => (
                                <div key={i} className="d-flex align-items-center justify-content-between p-4 rounded-5 bg-light bg-opacity-30 transition-standard hover-up-tiny border border-transparent hover-border-primary">
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="p-2 bg-white rounded-circle shadow-sm">
                                            <m.i size={16} />
                                        </div>
                                        <span className="extra-small fw-black text-muted tracking-widest uppercase" style={{ fontSize: '0.6rem' }}>{m.l}</span>
                                    </div>
                                    <span className="extra-small fw-black text-dark uppercase tracking-widest opacity-80">{m.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational KPI Terminal */}
                    {complaint.createdAt && (
                        <div className="card border-0 shadow-premium rounded-5 overflow-hidden mb-5 transition-standard p-5 text-white position-relative" style={{
                            background: slaCountdown?.breached
                                ? 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)'
                                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                        }}>
                            <div className="strategic-grid position-absolute w-100 h-100 top-0 start-0 opacity-10"></div>
                            <div className="position-relative z-1">
                                <div className="d-flex align-items-center justify-content-between mb-5">
                                    <div className="d-flex align-items-center gap-4">
                                        <div className={`p-3 rounded-circle bg-white bg-opacity-10 shadow-inner ${slaCountdown?.breached ? 'text-danger' : 'text-warning'}`}>
                                            <Timer size={24} />
                                        </div>
                                        <div>
                                            <h6 className="fw-black text-white mb-0 small uppercase tracking-widest">KPI TELEMETRY</h6>
                                            <p className="extra-small fw-bold text-white opacity-40 uppercase mb-0 tracking-widest">Resolution Clock</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-pill extra-small fw-black tracking-widest border-0 ${slaCountdown?.breached ? 'bg-danger shadow-danger-glow' : 'bg-warning bg-opacity-20 text-warning'}`}>
                                        {slaCountdown?.breached ? 'SLA_VIOLATION' : 'ACTIVE_SLA'}
                                    </div>
                                </div>

                                <div className="mb-5 p-4 bg-white bg-opacity-5 rounded-4 border border-white border-opacity-10 shadow-inner">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="extra-small fw-black text-white opacity-40 uppercase tracking-widest">Target Resolution Window</span>
                                        <span className={`extra-small fw-black tracking-widest ${slaCountdown?.breached ? 'text-danger' : 'text-warning'}`}>
                                            {slaCountdown?.breached ? 'PROTOCOL_DELAY' : `${Math.floor(slaCountdown?.remainingMinutes / 60) || 48}H REMAINING`}
                                        </span>
                                    </div>
                                    <div className="progress bg-white bg-opacity-10 overflow-hidden" style={{ height: '10px', borderRadius: '10px' }}>
                                        <div className={`progress-bar progress-bar-striped progress-bar-animated ${slaCountdown?.breached ? 'bg-danger shadow-danger-glow' : 'bg-warning'}`} style={{ width: '65%' }}></div>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    <div className="col-6">
                                        <div className="p-4 bg-white bg-opacity-5 rounded-5 border border-white border-opacity-10 text-center transition-standard hover-up-tiny">
                                            <h6 className="extra-small fw-black text-white mb-2 opacity-40 uppercase tracking-widest">INITIALIZED</h6>
                                            <p className="text-white fw-black mb-0 small tracking-widest uppercase">{formatDate(complaint.createdAt, false)}</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-4 bg-white bg-opacity-5 rounded-5 border border-white border-opacity-10 text-center transition-standard hover-up-tiny">
                                            <h6 className="extra-small fw-black text-white mb-2 opacity-40 uppercase tracking-widest">DEADLINE</h6>
                                            <p className={`fw-black mb-0 small tracking-widest uppercase ${slaCountdown?.breached ? 'text-danger' : 'text-white'}`}>
                                                {slaCountdown?.deadline ? formatDate(slaCountdown.deadline, false) : 'AUTO_SLA_48H'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Authorized Personel */}
                    {(complaint.wardOfficerName || complaint.departmentOfficerName || complaint.assignedOfficerName) && (
                        <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden mb-5 transition-standard">
                            <div className="p-4 tactical-dark text-white d-flex align-items-center justify-content-between shadow-premium" style={{ backgroundColor: '#0f172a' }}>
                                <div className="d-flex align-items-center gap-4">
                                    <div className="p-2 bg-success bg-opacity-20 rounded-pill shadow-inner">
                                        <ShieldCheck size={18} className="text-success" />
                                    </div>
                                    <h6 className="fw-black extra-small uppercase tracking-widest mb-0">Operational Personnel</h6>
                                </div>
                                <div className="px-3 py-1 bg-white bg-opacity-10 rounded-pill extra-small fw-black tracking-widest border border-white border-opacity-10">AUTHORIZED</div>
                            </div>
                            <div className="p-5 vstack gap-4">
                                {complaint.wardOfficerName && (
                                    <div className="p-4 bg-light bg-opacity-50 rounded-5 border border-white shadow-inner transition-standard hover-up-tiny">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="p-4 bg-primary bg-opacity-5 rounded-circle shadow-premium border-2 border-white">
                                                <Shield size={24} style={{ color: PRIMARY_COLOR }} />
                                            </div>
                                            <div>
                                                <span className="extra-small fw-black text-primary uppercase tracking-widest d-block mb-1" style={{ fontSize: '0.55rem' }}>WARD_ADMINISTRATOR</span>
                                                <h6 className="fw-black text-dark mb-2 uppercase tracking-tighter">{complaint.wardOfficerName}</h6>
                                                {complaint.wardOfficerMobile && (
                                                    <a href={`tel:${complaint.wardOfficerMobile}`} className="text-decoration-none d-flex align-items-center gap-3 transition-standard hover-translate-x">
                                                        <Phone size={12} className="text-muted opacity-40" />
                                                        <span className="extra-small fw-black text-muted tracking-widest uppercase">{complaint.wardOfficerMobile}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {(complaint.departmentOfficerName || complaint.assignedOfficerName) && (
                                    <div className="p-4 bg-light bg-opacity-50 rounded-5 border border-white shadow-inner transition-standard hover-up-tiny">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="p-4 bg-success bg-opacity-5 rounded-circle shadow-premium border-2 border-white">
                                                <Building2 size={24} className="text-success" />
                                            </div>
                                            <div>
                                                <span className="extra-small fw-black text-success uppercase tracking-widest d-block mb-1" style={{ fontSize: '0.55rem' }}>FIELD_RESOLVER</span>
                                                <h6 className="fw-black text-dark mb-1 uppercase tracking-tighter">{complaint.departmentOfficerName || complaint.assignedOfficerName}</h6>
                                                <div className="extra-small fw-black text-muted uppercase tracking-widest opacity-40 bg-white d-inline-block px-3 py-1 rounded-pill mt-2">UNIT: {(complaint.departmentName || 'TECHNICAL').toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tactical Lightbox */}
            {selectedImage && (
                <div className="modal-overlay animate-fadeIn d-flex align-items-center justify-content-center p-5" style={{ background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)', zIndex: 3000 }}>
                    <button className="btn position-absolute top-0 end-0 p-5 text-white border-0 shadow-none hover-rotate transition-standard" onClick={() => setSelectedImage(null)}>
                        <X size={48} />
                    </button>
                    <div className="card bg-transparent border-0 animate-zoomIn w-100" style={{ maxWidth: '1000px' }}>
                        <div className="rounded-5 overflow-hidden shadow-premium border-2 border-white border-opacity-10 position-relative">
                            <AuthenticatedImage
                                src={extractImageUrl(selectedImage, complaint.complaintId || complaint.id)}
                                className="w-100 h-auto rounded-5"
                                style={{ maxHeight: '80vh', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="mt-5 text-center">
                            <div className="px-5 py-3 rounded-pill bg-white bg-opacity-10 d-inline-block border border-white border-opacity-10 extra-small fw-black text-white tracking-[0.4em] uppercase shadow-lg">
                                CASE_OBJECT_PROOF • {(selectedImage.stage || 'VERIFIED').toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .complaint-detail-view { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 950; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .tracking-tighter { letter-spacing: -0.05em; }
                .shadow-premium { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08), 0 5px 20px -5px rgba(0,0,0,0.03); }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
                .transition-standard { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up-tiny:hover { transform: translateY(-8px); }
                .hover-scale { transform: scale(1.05); }
                .group:hover .group-hover-scale { transform: scale(1.1); }
                .strategic-grid { background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 24px 24px; }
                .strategic-border { border-color: rgba(23, 52, 112, 0.1) !important; }
                .anim-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .anim-pulse-border { animation: pulse-border 2s infinite; }
                @keyframes pulse-border { 0%, 100% { border-color: rgba(239, 68, 68, 1); } 50% { border-color: rgba(239, 68, 68, 0.3); } }
                .anim-float { animation: float 3s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-heartbeat { animation: heartbeat 2s infinite; }
                @keyframes heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
                .hover-rotate:hover { transform: rotate(90deg); }
                .hover-translate-x:hover { transform: translateX(8px); }
                .shadow-danger-glow { box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
            `}} />
        </div>
    );
};

export default ComplaintDetailView;
