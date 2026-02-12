import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Calendar, MapPin, Building2, User,
    Clock, CheckCircle, AlertTriangle, ShieldCheck,
    MessageSquare, Image as ImageIcon, FileText,
    History, ArrowRight, Shield, Download, Map,
    Maximize2, ExternalLink, MoreVertical, X,
    Activity, Send, Zap, Eye, CheckCircle2, RotateCcw,
    Lock, Unlock, ShieldAlert, Target, Info, Star,
    Layers, Search, RefreshCw, Camera, Users
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { getImageUrl } from '../../utils/imageUtils';
import { useMasterData } from '../../contexts/MasterDataContext';
import SlaCard from '../../components/complaints/SlaCard';

/**
 * 🎯 High-Fidelity Citizen Governance Console
 * Premium Tactical Aesthetic • User Empowerment Layer
 */
const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { wards, departments } = useMasterData();

    const [loading, setLoading] = useState(true);
    const [complaint, setComplaint] = useState(null);
    const [activeTab, setActiveTab] = useState('intelligence');
    const [activeImage, setActiveImage] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showReopenModal, setShowReopenModal] = useState(false);

    // Action State
    const [rating, setRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reopenReason, setReopenReason] = useState('');

    const PRIMARY_COLOR = '#173470';

    const fetchTacticalIntelligence = useCallback(async () => {
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
        fetchTacticalIntelligence();
    }, [fetchTacticalIntelligence]);

    const handleSubmitFeedback = async () => {
        if (!feedbackComment.trim()) {
            showToast('Please add your feedback comments.', 'warning');
            return;
        }
        try {
            setSubmitting(true);
            await apiService.feedback.submit(id, {
                rating: parseInt(rating),
                comments: feedbackComment.trim()
            });
            showToast('Feedback successfully logged in central registry.', 'success');
            setShowFeedbackModal(false);

            // Artificial delay to ensure DB sync before refresh
            setTimeout(fetchTacticalIntelligence, 1000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || '';
            if (errorMsg.includes('already') || error.response?.status === 400) {
                showToast('Records indicate feedback already exists for this case.', 'info');
                setShowFeedbackModal(false);
                fetchTacticalIntelligence();
            } else {
                showToast('Feedback submission failed. Network instability detected.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleReopen = async () => {
        if (!reopenReason.trim()) {
            showToast('Reason required for operational reopening.', 'warning');
            return;
        }
        try {
            setSubmitting(true);
            await apiService.complaint.reopen(id, reopenReason);
            showToast('Operational objective reset. Status updated to REOPENED.', 'success');
            setShowReopenModal(false);
            fetchTacticalIntelligence();
        } catch (error) {
            showToast('Reopen failed.', 'error');
        } finally {
            setSubmitting(false);
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

    const rawImages = complaint.images || complaint.imageUrls || [];
    const isFinalStatus = ['RESOLVED', 'CLOSED'].includes(complaint.status);
    const isRecentClosure = complaint.updatedAt && (new Date() - new Date(complaint.updatedAt)) / (1000 * 60 * 60 * 24) <= 7;
    const canReopen = isFinalStatus && isRecentClosure;
    const canFeedback = ['CLOSED', 'RESOLVED'].includes(complaint.status) && !complaint.feedback;

    return (
        <div className="citizen-complaint-audit min-vh-100 pb-5">
            <DashboardHeader
                portalName="Citizen Governance"
                userName={`Case Dossier #${id}`}
                wardName={complaint.wardName || "SECURED SECTOR"}
                subtitle="Citizen Empowerment & Resolution Monitoring"
                icon={Shield}
                actions={
                    <div className="d-flex gap-2">
                        <button onClick={() => navigate(-1)} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm border d-flex align-items-center gap-2 extra-small fw-black tracking-widest transition-all hover-shadow-md">
                            <ChevronLeft size={16} /> BACK
                        </button>
                        {canFeedback && (
                            <button onClick={() => setShowFeedbackModal(true)} className="btn rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-lg border-0 d-flex align-items-center gap-2" style={{ backgroundColor: '#F59E0B', color: 'white' }}>
                                <Star size={16} /> SUBMIT FEEDBACK
                            </button>
                        )}
                        {canReopen && (
                            <button onClick={() => setShowReopenModal(true)} className="btn rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-lg border-0 d-flex align-items-center gap-2" style={{ backgroundColor: '#EF4444', color: 'white' }}>
                                <RotateCcw size={16} /> REOPEN CASE
                            </button>
                        )}
                    </div>
                }
            />

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="row g-4">
                    {/* Main Command Panel */}
                    <div className="col-lg-8">
                        {/* Intelligence Deck */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-4 bg-light p-2 shadow-sm border text-primary" style={{ color: PRIMARY_COLOR, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={20} /></div>
                                    <div>
                                        <span className="extra-small fw-black text-dark uppercase tracking-widest d-block">Complaint Intelligence Deck</span>
                                        <span className="extra-small fw-bold text-muted opacity-40 uppercase">Operational Node</span>
                                    </div>
                                </div>
                                <div className="d-flex gap-1 bg-light p-1 rounded-pill border">
                                    {[
                                        { id: 'intelligence', label: 'INTEL', icon: Target },
                                        { id: 'evidence', label: 'EVIDENCE', icon: ImageIcon },
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
                                            <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-40">Original Briefing</h6>
                                            <h2 className="fw-black text-dark mb-4 uppercase tracking-tighter lh-sm">{complaint.title || 'RECORD_UNNAMED'}</h2>
                                            <p className="fw-bold text-dark leading-relaxed mb-0">{complaint.description || 'No descriptive intel provided.'}</p>
                                        </div>
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="p-4 rounded-4 border border-dashed text-center">
                                                    <MapPin size={24} className="text-primary mb-2" />
                                                    <h6 className="extra-small fw-black text-muted uppercase mb-1">Sector Location</h6>
                                                    <span className="small fw-black text-dark uppercase">{complaint.address || complaint.wardName || 'PMC CENTRAL'}</span>
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
                                    { role: 'FILING_CITIZEN', name: complaint.citizenName || 'YOU', icon: User, color: '#6366F1' },
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

                        {/* Citizen Sentiment (Rating/Feedback) */}
                        <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white mb-4 border-0">
                            <div className="card-header bg-warning p-4">
                                <h6 className="fw-black text-white mb-0 text-uppercase extra-small tracking-widest d-flex align-items-center gap-2">
                                    <MessageSquare size={16} /> Your Feedback
                                </h6>
                            </div>
                            <div className="card-body p-4">
                                {complaint.feedback || complaint.rating ? (
                                    <>
                                        <div className="mb-3 d-flex gap-1 text-warning">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={20} fill={star <= complaint.rating ? '#F59E0B' : 'white'} />
                                            ))}
                                        </div>
                                        <p className="extra-small fw-black text-dark mb-0 italic">"{complaint.feedback || 'No written feedback provided.'}"</p>
                                    </>
                                ) : (
                                    <div className="text-center py-3">
                                        <Star size={32} className="text-muted opacity-20 mb-2" />
                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">Awaiting Resolution Feedback</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="card border-0 bg-dark text-white rounded-4 p-4 position-relative overflow-hidden shadow-2xl">
                            <div className="position-absolute start-0 top-0 h-100 bg-success opacity-20" style={{ width: '4px' }}></div>
                            <ShieldAlert size={60} className="position-absolute end-0 bottom-0 m-n3 opacity-10 text-success" />
                            <h6 className="extra-small fw-black uppercase tracking-widest mb-3 text-success">Citizen Privacy Seal</h6>
                            <p className="extra-small fw-bold opacity-60 mb-0 uppercase leading-relaxed font-monospace" style={{ fontSize: '0.6rem', lineHeight: '1.6' }}>
                                Your identity and contact intelligence are encrypted. This dossier is strictly for PMC operational resolution and audit performance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center p-4 animate-fadeIn" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }} onClick={() => setShowFeedbackModal(false)}>
                    <div className="card border-0 shadow-2xl rounded-5 overflow-hidden animate-zoomIn" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
                        <div className="card-header p-4 border-0 text-white" style={{ backgroundColor: '#F59E0B' }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <h6 className="fw-black mb-0 uppercase extra-small tracking-widest">SUBMIT RESOLUTION FEEDBACK</h6>
                                <button onClick={() => setShowFeedbackModal(false)} className="btn btn-link text-white p-0"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="card-body p-5">
                            <div className="text-center mb-5">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 d-block">Overall Satisfaction</label>
                                <div className="d-flex justify-content-center gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setRating(star)} className="btn p-0 border-0 bg-transparent transform transition-all hover-scale-125">
                                            <Star size={40} fill={star <= rating ? '#F59E0B' : 'white'} stroke={star <= rating ? '#F59E0B' : '#E2E8F0'} strokeWidth={1.5} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3">Service Remarks</label>
                                <textarea className="form-control rounded-4 border-2 bg-light p-4 extra-small fw-bold shadow-none" rows="4" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} placeholder="Describe your experience with the PMC resolution unit..." />
                            </div>
                            <button onClick={handleSubmitFeedback} disabled={submitting} className="btn w-100 py-3 rounded-pill fw-black extra-small shadow-lg border-0 transition-all hover-up-tiny" style={{ backgroundColor: '#F59E0B', color: 'white' }}>
                                {submitting ? 'LOGGING...' : 'AUTHORIZE FEEDBACK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Strategic Reopen Modal */}
            {showReopenModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center p-4 animate-fadeIn" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }} onClick={() => setShowReopenModal(false)}>
                    <div className="card border-0 shadow-2xl rounded-5 overflow-hidden animate-zoomIn" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
                        <div className="card-header p-4 border-0 text-white bg-danger">
                            <div className="d-flex align-items-center justify-content-between">
                                <h6 className="fw-black mb-0 uppercase extra-small tracking-widest">REOPEN OPERATIONAL CASE</h6>
                                <button onClick={() => setShowReopenModal(false)} className="btn btn-link text-white p-0"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="card-body p-5">
                            <div className="p-4 rounded-4 bg-danger bg-opacity-5 border border-danger border-opacity-10 mb-5 d-flex gap-4 align-items-center">
                                <AlertTriangle size={32} className="text-danger" />
                                <p className="extra-small fw-bold text-dark opacity-70 mb-0 uppercase tracking-tight">Warning: Reopening a case restarts the operational lifecycle. Valid operational reasons are mandatory.</p>
                            </div>
                            <div className="mb-5">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3">Reactivation Justification</label>
                                <textarea className="form-control rounded-4 border-2 bg-light p-4 extra-small fw-bold shadow-none" rows="4" value={reopenReason} onChange={e => setReopenReason(e.target.value)} placeholder="Explain why the previous resolution was unsatisfactory..." />
                            </div>
                            <button onClick={handleReopen} disabled={submitting} className="btn btn-danger w-100 py-3 rounded-pill fw-black extra-small shadow-lg border-0 transition-all hover-up-tiny">
                                {submitting ? 'RE-DEPLOYING...' : 'RE-ACTIVATE DOSSIER'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tactical Lightbox */}
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
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .citizen-complaint-audit { font-family: 'Outfit', sans-serif; }
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
                .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}} />
        </div>
    );
};

export default ComplaintDetail;
