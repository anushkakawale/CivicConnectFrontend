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
    Users, Globe, Phone, Mail, Camera, Play
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { getImageUrl } from '../../utils/imageUtils';
import SlaCard from '../../components/complaints/SlaCard';
import ImageUploadComponent from '../../components/complaints/ImageUploadComponent';

/**
 * 🚀 High-Fidelity Department Operational Console
 * Tier 2 Strategic Deployment • PMC Functional Unit
 */
const DepartmentComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [complaint, setComplaint] = useState(null);
    const [activeTab, setActiveTab] = useState('intelligence');
    const [activeImage, setActiveImage] = useState(null);

    const PRIMARY_COLOR = '#173470';

    const fetchOperationalData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiService.complaint.getDetails(id);
            const data = response.data || response;
            setComplaint(data);
        } catch (error) {
            showToast('Strategic connection failed. Unable to sync unit records.', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchOperationalData();
    }, [fetchOperationalData]);

    const handleStartWork = async () => {
        try {
            setActionLoading(true);
            await apiService.departmentOfficer.startWork(id);
            showToast('Deployment activated. Status updated to IN_PROGRESS.', 'success');
            fetchOperationalData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Command activation failure.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolve = async () => {
        try {
            setActionLoading(true);
            await apiService.departmentOfficer.resolveComplaint(id);
            showToast('Operational objective secured. Awaiting verification.', 'success');
            fetchOperationalData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Resolution logging failure.', 'error');
        } finally {
            setActionLoading(false);
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

    if (!complaint) return null;

    const lifecycleStages = [
        { label: 'RECEIVED', key: 'SUBMITTED', icon: Send },
        { label: 'DISPATCHED', key: 'ASSIGNED', icon: User },
        { label: 'WORKING', key: 'IN_PROGRESS', icon: Activity },
        { label: 'FIXED', key: 'RESOLVED', icon: CheckCircle2 },
        { label: 'VERIFIED', key: 'APPROVED', icon: ShieldCheck },
        { label: 'CLOSED', key: 'CLOSED', icon: Lock }
    ];

    const currentStatusIdx = lifecycleStages.findIndex(s => s.key === complaint.status);
    const canStart = complaint.status === 'ASSIGNED';
    const canResolve = complaint.status === 'IN_PROGRESS';
    const isResolved = ['RESOLVED', 'APPROVED', 'CLOSED'].includes(complaint.status);

    const rawImages = complaint.images || complaint.imageUrls || [];

    return (
        <div className="dept-complaint-audit min-vh-100 pb-5">
            <DashboardHeader
                portalName="Department Operations"
                userName={`Case Dossier #${id}`}
                wardName={complaint.wardName || "SECURED SECTOR"}
                subtitle="Functional Unit Decision Support System"
                icon={Target}
                actions={
                    <button onClick={() => navigate(-1)} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm border d-flex align-items-center gap-2 extra-small fw-black tracking-widest transition-all hover-shadow-md">
                        <ChevronLeft size={16} /> BACK
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="row g-4">
                    {/* Main Command Panel */}
                    <div className="col-lg-8">
                        {/* Phase Controller */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                            <div className="card-header bg-white p-4 p-lg-5 border-bottom">
                                <div className="d-flex justify-content-between align-items-start gap-4">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 extra-small fw-black text-primary mb-2 uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>
                                            <Zap size={14} className="animate-pulse" /> OPERATIONAL WORKFLOW CONTROL
                                        </div>
                                        <h1 className="fw-black text-dark mb-0 uppercase tracking-tighter lh-1" style={{ fontSize: '2rem' }}>
                                            {complaint.title || 'OPERATIONAL DOSSIER'}
                                        </h1>
                                    </div>
                                    <StatusBadge status={complaint.status} />
                                </div>
                            </div>

                            <div className="card-body p-0">
                                <div className="row g-0 border-bottom">
                                    <div className="col-md-4 p-4 border-end border-bottom d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-light p-3 text-primary"><Calendar size={20} /></div>
                                        <div>
                                            <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1">Temporal Stamp</div>
                                            <div className="small fw-black text-dark">{new Date(complaint.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 p-4 border-end border-bottom d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-light p-3 text-primary"><Clock size={20} /></div>
                                        <div>
                                            <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1">Response Latency</div>
                                            <div className="small fw-black text-dark">
                                                {(() => {
                                                    const start = new Date(complaint.createdAt);
                                                    const end = complaint.status === 'CLOSED' && complaint.updatedAt ? new Date(complaint.updatedAt) : new Date();
                                                    return Math.floor((end - start) / (1000 * 60 * 60));
                                                })()} HOURS ELAPSED
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 p-4 border-bottom d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-light p-3 text-primary"><MapPin size={20} /></div>
                                        <div>
                                            <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1">Target Sector</div>
                                            <div className="small fw-black text-dark uppercase">{complaint.wardName || 'PMC CENTRAL'}</div>
                                        </div>
                                    </div>
                                    <div className="col-12 p-4 p-lg-5 bg-light bg-opacity-25">
                                        <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60">Operational Briefing</h6>
                                        <p className="fw-bold text-dark leading-relaxed mb-0" style={{ fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: '1.7' }}>
                                            {complaint.description || 'No descriptive intel provided.'}
                                        </p>
                                    </div>
                                </div>
                                {complaint.status === 'REJECTED' && (
                                    <div className="p-4 rounded-4 bg-danger bg-opacity-5 border border-danger border-opacity-10 mb-5 d-flex gap-4 align-items-center mx-4 mt-4">
                                        <div className="rounded-circle bg-danger p-2 text-white shadow-sm"><AlertTriangle size={24} /></div>
                                        <div>
                                            <h6 className="extra-small fw-black text-danger uppercase tracking-widest mb-1">Dossier Rejected • Action Required</h6>
                                            <p className="extra-small fw-bold text-dark opacity-70 mb-0">"{complaint.remarks || 'No specific rejection intelligence provided.'}"</p>
                                        </div>
                                    </div>
                                )}

                                <div className="row g-4 p-4 p-lg-5 pt-0">
                                    <div className="col-md-6">
                                        <div className={`p-4 rounded-4 border-2 text-center transition-all ${canStart ? 'border-primary bg-primary bg-opacity-5 shadow-sm' : 'border-light bg-light opacity-50'}`}>
                                            <div className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                                style={{ width: '64px', height: '64px', backgroundColor: canStart ? PRIMARY_COLOR : '#CBD5E1', color: 'white' }}>
                                                <Play size={24} className={canStart ? 'animate-pulse' : ''} />
                                            </div>
                                            <h6 className="fw-black text-dark uppercase mb-1 extra-small">DEPLOYMENT PHASE</h6>
                                            <p className="extra-small text-muted fw-bold mb-4 opacity-60">INITIALIZE WORKLOAD</p>
                                            {canStart ? (
                                                <button onClick={handleStartWork} disabled={actionLoading} className="btn w-100 py-3 rounded-pill fw-black extra-small shadow-lg border-0 transition-all hover-up-tiny" style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                                                    {actionLoading ? 'CONNECTING...' : 'START DEPLOYMENT'}
                                                </button>
                                            ) : (
                                                <div className="extra-small fw-black text-muted opacity-40 py-2 border rounded-pill uppercase d-flex align-items-center justify-content-center gap-2">
                                                    {(currentStatusIdx >= 2 || isResolved) && <CheckCircle size={14} className="text-success" />}
                                                    {currentStatusIdx >= 2 ? 'DEPLOYED' : 'LOCKED'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className={`p-4 rounded-4 border-2 text-center transition-all ${canResolve ? 'border-success bg-success bg-opacity-5 shadow-sm' : 'border-light bg-light opacity-50'}`}>
                                            <div className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                                style={{ width: '64px', height: '64px', backgroundColor: canResolve || isResolved ? '#10B981' : '#CBD5E1', color: 'white' }}>
                                                <ShieldCheck size={28} />
                                            </div>
                                            <h6 className="fw-black text-dark uppercase mb-1 extra-small">RESOLUTION PHASE</h6>
                                            <p className="extra-small text-muted fw-bold mb-4 opacity-60">LOCK OBJECTIVE</p>
                                            {canResolve ? (
                                                <button onClick={() => document.getElementById('ops-upload-node').scrollIntoView({ behavior: 'smooth' })} className="btn w-100 py-3 rounded-pill fw-black extra-small shadow-lg border-0 transition-all hover-up-tiny" style={{ backgroundColor: '#10B981', color: 'white' }}>
                                                    UPLOAD & RESOLVE
                                                </button>
                                            ) : (
                                                <div className={`extra-small fw-black py-2 border rounded-pill uppercase d-flex align-items-center justify-content-center gap-2 ${isResolved ? 'text-success border-success' : 'text-muted opacity-40'}`}>
                                                    {isResolved && <CheckCircle size={14} />}
                                                    {isResolved ? 'OBJECTIVE MET' : 'LOCKED'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Direct Evidence Submission Hub */}
                        {canResolve && (
                            <div id="ops-upload-node" className="mb-4 animate-slideUp">
                                <ImageUploadComponent
                                    complaintId={id}
                                    stage="progress"
                                    title="FIELD DEPLOYMENT EVIDENCE"
                                    apiMethod={apiService.departmentOfficer.uploadProgressImages}
                                    onUploadSuccess={fetchOperationalData}
                                />
                                <div className="mt-4">
                                    <ImageUploadComponent
                                        complaintId={id}
                                        stage="combined"
                                        title="FINAL RESOLUTION DOSSIER"
                                        apiMethod={apiService.departmentOfficer.resolveWithImages}
                                        onUploadSuccess={fetchOperationalData}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Intelligence Deck */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-4 bg-light p-2 shadow-sm border text-primary" style={{ color: PRIMARY_COLOR }}><Layers size={20} /></div>
                                    <div>
                                        <span className="extra-small fw-black text-dark uppercase tracking-widest d-block">Strategic Intelligence Deck</span>
                                        <span className="extra-small fw-bold text-muted opacity-40 uppercase">Record Node Archive</span>
                                    </div>
                                </div>
                                <div className="d-flex gap-1 bg-light p-1 rounded-pill border">
                                    {[
                                        { id: 'intelligence', label: 'INTEL', icon: Target },
                                        { id: 'evidence', label: 'EVIDENCE', icon: Camera },
                                        { id: 'registry', label: 'REGISTRY', icon: History }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`btn rounded-pill px-4 py-2 extra-small fw-black transition-all d-flex align-items-center gap-2 border-0 ${activeTab === tab.id ? 'bg-white text-dark shadow-sm' : 'text-muted opacity-50'}`}
                                            style={activeTab === tab.id ? { color: PRIMARY_COLOR } : {}}
                                        >
                                            <tab.icon size={14} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="card-body p-4 p-lg-5">
                                {activeTab === 'intelligence' ? (
                                    <div className="animate-fadeIn">
                                        <div className="p-4 bg-light rounded-4 border-start border-4 mb-5" style={{ borderColor: PRIMARY_COLOR }}>
                                            <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-40">Operational Briefing</h6>
                                            <h2 className="fw-black text-dark mb-4 uppercase tracking-tighter lh-sm">{complaint.title || 'RECORD_UNNAMED'}</h2>
                                            <p className="fw-bold text-dark leading-relaxed mb-0">{complaint.description || 'No descriptive intel provided.'}</p>
                                        </div>
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="p-4 rounded-4 border border-dashed text-center">
                                                    <MapPin size={24} className="text-primary mb-2" />
                                                    <h6 className="extra-small fw-black text-muted uppercase mb-1">Sector</h6>
                                                    <span className="small fw-black text-dark uppercase">{complaint.wardName || 'PMC CENTRAL'}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="p-4 rounded-4 border border-dashed text-center">
                                                    <ShieldCheck size={24} className="text-primary mb-2" />
                                                    <h6 className="extra-small fw-black text-muted uppercase mb-1">Functional Unit</h6>
                                                    <span className="small fw-black text-dark uppercase">{complaint.departmentName?.replace(/_/g, ' ') || 'GENERAL'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : activeTab === 'evidence' ? (
                                    <div className="row g-3 animate-fadeIn">
                                        {rawImages.length > 0 ? (
                                            rawImages.map((img, i) => {
                                                const isObj = typeof img === 'object';
                                                const url = getImageUrl(isObj ? (img.imageUrl || img.url || img) : img, id);
                                                const stage = isObj ? (img.stage || img.imageStage || 'EVIDENCE') : 'EVIDENCE';
                                                const time = isObj && img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString() : '';

                                                if (!url || url === '/placeholder.png') return null;

                                                return (
                                                    <div key={i} className="col-6 col-md-4 col-lg-3">
                                                        <div className="position-relative rounded-4 overflow-hidden shadow-sm border cursor-pointer hover-up-tiny" onClick={() => setActiveImage(url)}>
                                                            <div className="aspect-ratio-1x1 bg-light" style={{ paddingBottom: '100%', position: 'relative' }}>
                                                                <img src={url} alt={stage} className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
                                                            </div>
                                                            <div className="position-absolute bottom-0 start-0 w-100 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                                                <span className="badge bg-white text-dark extra-small fw-black uppercase tracking-widest shadow-sm">
                                                                    {stage.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-12 py-5 text-center">
                                                <Camera size={48} className="text-muted opacity-20 mb-3" />
                                                <p className="extra-small fw-black text-muted uppercase tracking-widest">No evidence archives found.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="vstack gap-0 animate-fadeIn">
                                        {(complaint.history || []).map((log, idx) => (
                                            <div key={idx} className="d-flex gap-4 position-relative pb-4">
                                                {idx !== (complaint.history.length - 1) && (
                                                    <div className="position-absolute h-100 border-start border-2 border-primary border-opacity-10" style={{ left: '19px', top: '10px' }}></div>
                                                )}
                                                <div className="rounded-circle bg-white shadow-sm border border-primary border-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', zIndex: 1, minWidth: '40px' }}>
                                                    <Info size={16} className="text-primary" />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="extra-small fw-black text-primary uppercase tracking-widest">{log.status}</span>
                                                        <span className="extra-small text-muted fw-bold opacity-40">{new Date(log.changedAt || log.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="extra-small text-muted fw-bold uppercase opacity-50 mb-2">OPERATIVE: {log.changedBy || 'SYSTEM'}</div>
                                                    <p className="extra-small text-dark fw-bold mb-0 opacity-70 italic bg-light p-3 rounded-3 border-start border-2 border-primary border-opacity-20">
                                                        "{log.remarks || 'Standard diagnostic update'}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats & Personnel */}
                    <div className="col-lg-4">
                        {/* SLA Meter */}
                        <SlaCard sla={complaint.slaDetails} />

                        {/* Personnel Matrix */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                            <div className="card-header bg-dark text-white p-4">
                                <h6 className="extra-small fw-black uppercase tracking-widest mb-0 d-flex align-items-center gap-2">
                                    <Users size={16} className="text-success" /> Deployment Personnel
                                </h6>
                            </div>
                            <div className="card-body p-4 d-flex flex-column gap-3">
                                {[
                                    { role: 'FILING_CITIZEN', name: complaint.citizenName || 'ANONYMOUS', icon: User, color: '#6366F1' },
                                    { role: 'AREA_CONTROLLER', name: complaint.wardOfficerName || 'SECURED', icon: Shield, color: '#F59E0B' },
                                    { role: 'UNIT_OPERATIVE', name: complaint.assignedOfficerName || 'UNASSIGNED', icon: Target, color: '#10B981' }
                                ].map((p, idx) => (
                                    <div key={idx} className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light border border-2">
                                        <div className="rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: p.color + '15', color: p.color, width: '42px', height: '42px' }}>
                                            <p.icon size={20} />
                                        </div>
                                        <div>
                                            <div className="extra-small fw-black text-muted uppercase opacity-50 mb-1" style={{ fontSize: '0.6rem' }}>{p.role}</div>
                                            <div className="small fw-black text-dark uppercase tracking-tight">{p.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Citizen Sentiment */}
                        {(complaint.rating || complaint.feedback) && (
                            <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                                <div className="card-header bg-warning p-4">
                                    <h6 className="fw-black text-white mb-0 text-uppercase extra-small tracking-widest d-flex align-items-center gap-2">
                                        <MessageSquare size={16} /> Citizen Satisfaction
                                    </h6>
                                </div>
                                <div className="card-body p-4">
                                    {complaint.rating && (
                                        <div className="mb-3 d-flex gap-1 text-warning">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} style={{ fontSize: '20px' }}>{star <= complaint.rating ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="extra-small fw-black text-dark mb-0 italic">"{complaint.feedback || 'No written feedback provided.'}"</p>
                                </div>
                            </div>
                        )}

                        {/* Registry Compliance Notice */}
                        <div className="card border-0 bg-dark text-white rounded-4 p-4 position-relative overflow-hidden shadow-2xl">
                            <div className="position-absolute start-0 top-0 h-100 bg-success opacity-20" style={{ width: '4px' }}></div>
                            <ShieldAlert size={60} className="position-absolute end-0 bottom-0 m-n3 opacity-10 text-success" />
                            <h6 className="extra-small fw-black uppercase tracking-widest mb-3 text-success">Institutional Compliance</h6>
                            <p className="extra-small fw-bold opacity-60 mb-0 uppercase leading-relaxed font-monospace" style={{ fontSize: '0.6rem' }}>
                                This dossier access is encrypted. All status changes and metadata edits are synced with PMC Central Hub and audited for SLA integrity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                            <img src={activeImage} alt="Audit Evidence" className="img-fluid d-block" style={{ objectFit: 'contain', maxHeight: '80vh' }} />
                            <div className="bg-dark p-4 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
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
                .dept-complaint-audit { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up-tiny:hover { transform: translateY(-4px); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}} />
        </div>
    );
};

export default DepartmentComplaintDetail;
