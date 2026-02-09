/**
 * Professional Admin Strategic Case Detail View
 * High-fidelity interface for comprehensive complaint auditing and supervisory control.
 * Implements a product-level tactical layout as requested.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShieldAlert, Activity, Clock, CheckCircle,
    AlertTriangle, ShieldCheck, Zap, Loader, X, CheckCheck,
    Search, FileText, Calendar, Building2, User, MapPin,
    ArrowRight, MessageSquare, RefreshCw, ChevronLeft, Layers,
    Smartphone, Mail, Info, ChevronDown, ChevronUp, Image as ImageIcon,
    Camera, TrendingUp, Timer, History as HistoryIcon
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { extractImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

const AdminComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [images, setImages] = useState([]);
    const [statusHistory, setStatusHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slaInfo, setSlaInfo] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [citizenDetailsExpanded, setCitizenDetailsExpanded] = useState(false);
    const [activeImageTab, setActiveImageTab] = useState('CITIZEN');
    const [selectedImage, setSelectedImage] = useState(null);

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [detailsRes, slaRes] = await Promise.all([
                apiService.complaint.getDetails(id),
                apiService.admin.getSlaDetails(id).catch(() => null)
            ]);
            const data = detailsRes.data || detailsRes;
            setComplaint(data);
            setImages(data.images || []);
            setStatusHistory(data.statusHistory || data.timeline || []);
            setSlaInfo(slaRes?.data || slaRes);
        } catch (error) {
            console.error('Data pull failed:', error);
            showToast('Unable to synchronize complaint record from registry.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseComplaint = async () => {
        if (!adminRemarks.trim()) return showToast('Audit remarks required for record closure.', 'warning');
        try {
            setActionLoading(true);
            await apiService.admin.closeComplaint(id, { remarks: adminRemarks });
            showToast('Case successfully archived in municipal registry.', 'success');
            setShowCloseModal(false);
            loadData();
        } catch (error) {
            showToast('Resolution protocol rejected by system.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !complaint) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted text-uppercase tracking-widest extra-small">Synchronizing Record Stream...</p>
            </div>
        );
    }

    if (!complaint) return null;

    const isReadyToClose = complaint.status === 'RESOLVED';
    const isClosed = complaint.status === 'CLOSED';

    const getStageImages = (stage) => {
        const stageMap = {
            'CITIZEN': ['INITIAL', 'BEFORE', 'SUBMITTED', 'CITIZEN_UPLOAD'],
            'WORK_STARTED': ['WORK_STARTED', 'BEFORE_WORK', 'START'],
            'IN_PROGRESS': ['IN_PROGRESS', 'DURING', 'PROGRESS'],
            'RESOLUTION': ['RESOLVED', 'AFTER', 'FINAL', 'RESOLUTION_PROOF']
        };
        return images.filter(img => stageMap[stage].includes((img.stage || '').toUpperCase().replace(/ /g, '_')));
    };

    const workflowStages = [
        { id: 'SUBMITTED', label: 'Submitted', icon: FileText },
        { id: 'APPROVED', label: 'Approved', icon: CheckCheck },
        { id: 'ASSIGNED', label: 'Assigned', icon: User },
        { id: 'IN_PROGRESS', label: 'In Progress', icon: Zap },
        { id: 'RESOLVED', label: 'Resolved', icon: CheckCircle },
        { id: 'CLOSED', label: 'Closed', icon: ShieldCheck }
    ];

    const currentStageIdx = workflowStages.findIndex(s => s.id === complaint.status);

    return (
        <div className="admin-complaint-detail-final bg-light min-vh-100 pb-5">
            {/* Sticky Tactical Header */}
            <div className="sticky-top bg-white shadow-sm border-bottom py-3" style={{ zIndex: 1020, top: '0px' }}>
                <div className="container-fluid px-4 px-lg-5">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <button onClick={() => navigate('/admin/complaints')} className="btn btn-light rounded-circle p-2 border-0">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <div className="d-flex align-items-center gap-2">
                                    <h5 className="fw-black text-dark mb-0 uppercase tracking-tight">#{complaint.complaintId || id}</h5>
                                    <span className="badge bg-primary bg-opacity-10 text-primary extra-small fw-black rounded-pill uppercase px-3 py-1" style={{ color: PRIMARY_COLOR }}>{complaint.category || 'General'}</span>
                                </div>
                                <p className="extra-small fw-bold text-muted mb-0 opacity-60">ADMINISTRATIVE AUDIT INTERFACE</p>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border bg-white shadow-sm">
                                <TrendingUp size={14} className={complaint.priority === 'CRITICAL' ? 'text-danger' : 'text-primary'} />
                                <span className={`extra-small fw-black uppercase ${complaint.priority === 'CRITICAL' ? 'text-danger' : 'text-primary'}`}>
                                    Priority: {complaint.priority || 'NORMAL'}
                                </span>
                            </div>
                            <StatusBadge status={complaint.status} size="md" />
                            {slaInfo && (
                                <div className={`d-flex align-items-center gap-2 px-3 py-1 rounded-pill border shadow-sm ${slaInfo.breached ? 'bg-danger text-white' : 'bg-warning text-dark'}`}>
                                    <Timer size={14} />
                                    <span className="extra-small fw-black uppercase">
                                        {slaInfo.breached ? 'SLA BREACHED' : slaInfo.remainingTime || 'SLA ACTIVE'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-4 px-lg-5 mt-4">
                <div className="row g-4">
                    {/* Left Panel - 70% */}
                    <div className="col-lg-8">
                        {/* Complaint Overview Card */}
                        <div className="card border-0 shadow-premium rounded-4 mb-4 overflow-hidden bg-white">
                            <div className="card-header bg-white py-4 px-4 px-lg-5 border-bottom-0">
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40 d-flex align-items-center gap-2">
                                    <FileText size={16} /> COMPLAINT OVERVIEW
                                </h6>
                            </div>
                            <div className="card-body px-4 px-lg-5 pb-5 pt-0">
                                <h3 className="fw-black text-dark mb-3 uppercase lh-sm">{complaint.title || 'No Title Provided'}</h3>
                                <p className="text-muted fw-medium lh-lg mb-5 opacity-80" style={{ fontSize: '1rem' }}>{complaint.description}</p>

                                <div className="row g-4">
                                    <div className="col-md-6 text-dark">
                                        <div className="p-4 rounded-4 bg-light border-0 h-100">
                                            <div className="extra-small fw-black text-primary uppercase tracking-widest mb-3" style={{ color: PRIMARY_COLOR }}>Location Profile</div>
                                            <div className="d-flex align-items-start gap-3">
                                                <MapPin size={20} className="text-muted opacity-40 flex-shrink-0" />
                                                <div>
                                                    <h6 className="fw-black text-dark mb-1 uppercase tracking-tight">{complaint.wardName || 'PMC WARD'}</h6>
                                                    <p className="extra-small fw-bold text-muted mb-0 lh-base uppercase">{complaint.address || 'Address Unspecified'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-4 rounded-4 bg-light border-0 h-100">
                                            <div className="extra-small fw-black text-primary uppercase tracking-widest mb-3" style={{ color: PRIMARY_COLOR }}>Submission Metadata</div>
                                            <div className="d-flex align-items-start gap-3">
                                                <Clock size={20} className="text-muted opacity-40 flex-shrink-0" />
                                                <div>
                                                    <h6 className="fw-black text-dark mb-1 uppercase tracking-tight">Timestamp</h6>
                                                    <p className="extra-small fw-bold text-muted mb-0 uppercase">
                                                        {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Citizen Details (Collapsible) */}
                        <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white overflow-hidden">
                            <div
                                className="card-header bg-white py-4 px-4 px-lg-5 border-0 d-flex justify-content-between align-items-center cursor-pointer hover-light transition-all"
                                onClick={() => setCitizenDetailsExpanded(!citizenDetailsExpanded)}
                            >
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40 d-flex align-items-center gap-2">
                                    <User size={16} /> CITIZEN DETAILS
                                </h6>
                                {citizenDetailsExpanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
                            </div>
                            {citizenDetailsExpanded && (
                                <div className="card-body px-4 px-lg-5 pb-5 pt-0 animate-fadeIn">
                                    <div className="row g-4 align-items-center">
                                        <div className="col-md-auto">
                                            <div className="rounded-circle p-1 border border-2 border-primary border-opacity-20">
                                                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-black" style={{ width: '64px', height: '64px', backgroundColor: PRIMARY_COLOR, fontSize: '1.5rem' }}>
                                                    {complaint.citizenName?.charAt(0) || 'C'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">{complaint.citizenName || 'Public Informant'}</h5>
                                            <div className="d-flex flex-wrap gap-4 mt-2">
                                                <div className="d-flex align-items-center gap-2 text-muted extra-small fw-bold">
                                                    <Smartphone size={14} className="opacity-40" /> {complaint.citizenMobile || 'UNAVAILABLE'}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 text-muted extra-small fw-bold">
                                                    <Mail size={14} className="opacity-40" /> {complaint.citizenEmail || 'PROTECTED'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-auto text-md-end">
                                            <div className="p-3 rounded-4 bg-light border border-dashed text-center">
                                                <h2 className="fw-black text-primary mb-0" style={{ color: PRIMARY_COLOR }}>1</h2>
                                                <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">Resolved Cases</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image & Media Section (Tabbed) */}
                        <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white overflow-hidden">
                            <div className="card-header bg-white py-4 px-4 px-lg-5 border-0">
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40 d-flex align-items-center gap-2">
                                    <ImageIcon size={16} /> VISUAL EVIDENCE & PROGRESS
                                </h6>
                            </div>
                            <div className="px-4 px-lg-5 mb-4">
                                <div className="bg-light p-1 rounded-pill d-flex gap-1">
                                    {[
                                        { id: 'CITIZEN', label: 'Citizen Upload', icon: Search },
                                        { id: 'WORK_STARTED', label: 'Work Started', icon: Zap },
                                        { id: 'IN_PROGRESS', label: 'In Progress', icon: Activity },
                                        { id: 'RESOLUTION', label: 'Resolution Proof', icon: CheckCircle }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveImageTab(tab.id)}
                                            className={`btn flex-fill rounded-pill py-2 extra-small fw-black uppercase tracking-widest transition-all d-flex align-items-center justify-content-center gap-2 ${activeImageTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-muted opacity-60'}`}
                                            style={activeImageTab === tab.id ? { backgroundColor: PRIMARY_COLOR } : {}}
                                        >
                                            <tab.icon size={14} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="card-body px-4 px-lg-5 pb-5 pt-0">
                                <div className="row g-3">
                                    {getStageImages(activeImageTab).length === 0 ? (
                                        <div className="col-12 py-5 text-center">
                                            <div className="rounded-circle bg-light d-inline-flex p-4 mb-3 opacity-40">
                                                <Camera size={40} className="text-muted" />
                                            </div>
                                            <h6 className="fw-black text-muted uppercase tracking-widest opacity-40">No visual records for this phase</h6>
                                        </div>
                                    ) : (
                                        getStageImages(activeImageTab).map((img, idx) => (
                                            <div key={idx} className="col-6 col-md-4 col-lg-3">
                                                <div
                                                    className="position-relative cursor-pointer rounded-4 overflow-hidden border-2 border-white shadow-sm hover-up transition-all h-100"
                                                    style={{ aspectRatio: '1/1' }}
                                                    onClick={() => setSelectedImage(img)}
                                                >
                                                    <img
                                                        src={extractImageUrl(img, id)}
                                                        className="w-100 h-100 object-fit-cover"
                                                        alt="evidence"
                                                        onError={(e) => { e.target.src = getPlaceholderImage('IMAGE'); }}
                                                    />
                                                    <div className="position-absolute bottom-0 start-0 w-100 p-2 glass-panel text-white extra-small fw-black text-center uppercase tracking-widest">
                                                        VIEW
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - 30% */}
                    <div className="col-lg-4">
                        {/* Status Card (Stepper) */}
                        <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white overflow-hidden">
                            <div className="card-header bg-white py-4 px-4 px-lg-5 border-0">
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40 d-flex align-items-center gap-2">
                                    <Activity size={16} /> LIFECYCLE TRACKER
                                </h6>
                            </div>
                            <div className="card-body px-4 px-lg-5 pb-5 pt-2">
                                <div className="stepper-vertical">
                                    {workflowStages.map((stage, idx) => {
                                        const isCompleted = idx < currentStageIdx;
                                        const isCurrent = idx === currentStageIdx;
                                        const isLast = idx === workflowStages.length - 1;

                                        return (
                                            <div key={stage.id} className={`d-flex gap-4 ${!isLast ? 'pb-4' : ''} position-relative`}>
                                                {!isLast && (
                                                    <div
                                                        className={`position-absolute h-100 border-start border-2`}
                                                        style={{ left: '15px', top: '35px', borderColor: isCompleted ? PRIMARY_COLOR : '#E2E8F0', opacity: isCompleted ? 1 : 0.5 }}
                                                    ></div>
                                                )}
                                                <div
                                                    className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm z-1 flex-shrink-0 transition-all ${isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white animate-pulse' : 'bg-light text-muted opacity-40'}`}
                                                    style={{ width: '32px', height: '32px', backgroundColor: isCurrent ? PRIMARY_COLOR : isCompleted ? '#10B981' : '' }}
                                                >
                                                    {isCompleted ? <CheckCircle size={16} /> : <stage.icon size={16} />}
                                                </div>
                                                <div className="pt-1">
                                                    <h6 className={`extra-small fw-black uppercase tracking-widest mb-0 ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted opacity-40'}`} style={isCurrent ? { color: PRIMARY_COLOR } : {}}>
                                                        {stage.label}
                                                    </h6>
                                                    {isCurrent && <span className="badge bg-primary bg-opacity-10 text-primary uppercase fw-black" style={{ fontSize: '8px', padding: '2px 8px' }}>ACTIVE</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Assigned Officer Card */}
                        <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white overflow-hidden">
                            <div className="card-header bg-white py-4 px-4 px-lg-5 border-0">
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40 d-flex align-items-center gap-2">
                                    <ShieldCheck size={16} /> AUTHORITY ASSIGNMENT
                                </h6>
                            </div>
                            <div className="card-body px-4 px-lg-5 pb-5 pt-0">
                                <div className="d-flex flex-column gap-4">
                                    <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light border-0">
                                        <div className="rounded-circle bg-white shadow-sm p-3 text-primary d-flex align-items-center justify-content-center">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-1 opacity-40">Functional Unit</p>
                                            <h6 className="fw-black text-dark mb-0 uppercase tracking-tight">{complaint.departmentName || 'GENERAL UNIT'}</h6>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light border-0">
                                        <div className="rounded-circle bg-white shadow-sm p-3 text-primary d-flex align-items-center justify-content-center">
                                            <User size={24} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-1 opacity-40">Assigned Operative</p>
                                            <h6 className="fw-black text-dark mb-0 uppercase tracking-tight text-truncate">{complaint.assignedOfficerName || 'NOT DISPATCHED'}</h6>
                                            <span className="extra-small fw-bold text-muted opacity-60">{complaint.assignedOfficerMobile || 'SECURE LINE'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white overflow-hidden">
                            <div className="card-header bg-white py-4 px-4 px-lg-5 border-0">
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40 d-flex align-items-center gap-2">
                                    <Zap size={16} /> ADMINISTRATIVE DIRECTIVES
                                </h6>
                            </div>
                            <div className="card-body px-4 px-lg-5 pb-5 pt-0">
                                <div className="d-grid gap-3">
                                    {!isClosed ? (
                                        <>
                                            <button
                                                className={`btn btn-success py-3 rounded-pill fw-black extra-small uppercase tracking-widest shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all hover-up ${!isReadyToClose ? 'opacity-50 grayscale' : ''}`}
                                                disabled={!isReadyToClose || actionLoading}
                                                onClick={() => setShowCloseModal(true)}
                                            >
                                                <CheckCircle size={18} /> Close Complaint
                                            </button>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <button className="btn btn-outline-primary w-100 py-3 rounded-pill fw-black extra-small uppercase tracking-widest border-2 transition-all hover-shadow-md d-flex align-items-center justify-content-center gap-2" disabled={actionLoading}>
                                                        <MessageSquare size={16} /> REQUERY
                                                    </button>
                                                </div>
                                                <div className="col-6">
                                                    <button className="btn btn-outline-danger w-100 py-3 rounded-pill fw-black extra-small uppercase tracking-widest border-2 transition-all hover-shadow-md d-flex align-items-center justify-content-center gap-2" disabled={actionLoading}>
                                                        <ShieldAlert size={16} /> ESCALATE
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="extra-small text-muted fw-bold text-center mt-2 opacity-50 uppercase tracking-widest">Buttons enabled after completion images exist</p>
                                        </>
                                    ) : (
                                        <div className="p-4 bg-dark text-white rounded-4 text-center border-0 shadow-lg position-relative overflow-hidden">
                                            <ShieldCheck size={84} className="position-absolute opacity-10" style={{ right: '-10px', bottom: '-10px' }} />
                                            <h6 className="fw-black uppercase tracking-widest mb-1">ARCHIVED IN LEDGER</h6>
                                            <p className="extra-small opacity-60 mb-0 uppercase fw-bold">No further actions required</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full-Width Activity Timeline (Audit Trail) */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden">
                            <div className="card-header bg-white py-4 px-4 px-lg-5 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40 d-flex align-items-center gap-2">
                                    <HistoryIcon size={16} /> STRATEGIC AUDIT TRAIL
                                </h6>
                                <span className="badge bg-light text-muted border extra-small fw-black rounded-pill px-3 py-1">CERTIFIED RECORDS</span>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light bg-opacity-50">
                                            <tr>
                                                <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest" style={{ width: '200px' }}>TIMESTAMP</th>
                                                <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest" style={{ width: '180px' }}>ACTION</th>
                                                <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest" style={{ width: '200px' }}>OPERATIVE</th>
                                                <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">REMARKS & SYSTEM NOTES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statusHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-5">
                                                        <div className="extra-small fw-black text-muted uppercase opacity-40">Generating audit history...</div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                statusHistory.map((h, i) => (
                                                    <tr key={i} className="transition-all hover-light">
                                                        <td className="px-5 py-4">
                                                            <div className="extra-small fw-black text-dark mb-1">{new Date(h.updatedAt).toLocaleDateString()}</div>
                                                            <div className="extra-small fw-bold text-muted opacity-40">{new Date(h.updatedAt).toLocaleTimeString()}</div>
                                                        </td>
                                                        <td>
                                                            <div className="badge bg-light border text-muted extra-small fw-black rounded-pill px-3 py-1 uppercase">{h.status?.replace(/_/g, ' ')}</div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-black extra-small" style={{ width: '28px', height: '28px', color: PRIMARY_COLOR }}>
                                                                    {h.changedByName?.charAt(0) || 'S'}
                                                                </div>
                                                                <div>
                                                                    <div className="extra-small fw-black text-dark uppercase tracking-tight">{h.changedByName || 'SYSTEM'}</div>
                                                                    <div className="extra-small fw-bold text-muted opacity-40 uppercase" style={{ fontSize: '8px' }}>{h.changedByRole?.replace(/_/g, ' ') || 'CORE ENGINE'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 pe-5">
                                                            <div className="p-3 rounded-4 bg-light border-0 position-relative" style={{ maxWidth: '600px' }}>
                                                                <p className="extra-small fw-bold text-dark mb-0 lh-base opacity-80">"{h.remarks || 'Transactional status shift approved by authoritative role.'}"</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer bg-light border-0 text-center py-4">
                                <p className="extra-small fw-black text-muted uppercase tracking-[0.4em] mb-0 opacity-40">END OF CASE AUDIT LOG</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Close Complaint Modal */}
            {showCloseModal && (
                <div className="modal-overlay">
                    <div className="card shadow-2xl border-0 rounded-4 overflow-hidden animate-zoomIn bg-white" style={{ maxWidth: '440px', width: '92%' }}>
                        <div className="p-5 bg-primary text-white text-center position-relative overflow-hidden" style={{ backgroundColor: PRIMARY_COLOR }}>
                            <Layers size={140} className="position-absolute opacity-10" style={{ right: '-30px', top: '-30px' }} />
                            <div className="rounded-circle p-3 bg-white bg-opacity-20 d-inline-flex mb-4 shadow-sm"><ShieldAlert size={42} /></div>
                            <h4 className="fw-black mb-1 uppercase tracking-tight position-relative">Audit Finalization</h4>
                            <p className="extra-small fw-bold uppercase tracking-widest opacity-60 mb-0 position-relative">Record Closure Certification</p>
                        </div>
                        <div className="card-body p-4 p-xl-5">
                            <div className="mb-5">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 px-1 d-block opacity-60">Authorized Auditor Remarks</label>
                                <textarea
                                    className="form-control border-2 bg-light p-4 fw-bold rounded-4 shadow-none extra-small transition-all focus-bg-white"
                                    rows="4"
                                    placeholder="Enter final closure justification and operational remarks..."
                                    value={adminRemarks}
                                    onChange={e => setAdminRemarks(e.target.value)}
                                />
                            </div>
                            <div className="d-grid gap-3">
                                <button className="btn btn-primary rounded-pill py-3 fw-black extra-small tracking-widest shadow-premium border-0 d-flex align-items-center justify-content-center gap-2 transition-all hover-up-tiny" onClick={handleCloseComplaint} disabled={actionLoading} style={{ backgroundColor: PRIMARY_COLOR }}>
                                    {actionLoading ? <RefreshCw size={18} className="animate-spin" /> : <><CheckCircle size={18} /> SIGN OFF AND ARCHIVE</>}
                                </button>
                                <button className="btn btn-link py-2 fw-black extra-small tracking-widest text-muted text-decoration-none uppercase opacity-60 hover-opacity-100 transition-all" onClick={() => setShowCloseModal(false)}>ABORT PROTOCOL</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div className="modal-overlay" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 3000 }} onClick={() => setSelectedImage(null)}>
                    <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center p-4">
                        <button className="position-absolute top-0 end-0 m-4 btn btn-white rounded-circle p-3 shadow-lg z-3 border-0" onClick={() => setSelectedImage(null)}>
                            <X size={32} />
                        </button>
                        <div className="card bg-transparent border-0 shadow-none text-center" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
                            <div className="rounded-4 overflow-hidden shadow-2xl border-2 border-white border-opacity-10 animate-zoomIn">
                                <img
                                    src={extractImageUrl(selectedImage, id)}
                                    className="img-fluid"
                                    style={{ maxHeight: '80vh' }}
                                    alt="full evidence"
                                    onError={(e) => { e.target.src = getPlaceholderImage('IMAGE'); }}
                                />
                            </div>
                            <div className="mt-4">
                                <span className="badge bg-primary px-4 py-2 rounded-pill extra-small fw-black uppercase tracking-widest" style={{ backgroundColor: PRIMARY_COLOR }}>
                                    {(selectedImage.stage || 'VISUAL EVIDENCE').replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-complaint-detail-final { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-up-tiny:hover { transform: translateY(-3px); }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .7; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .focus-bg-white:focus { background-color: #fff !important; border-color: ${PRIMARY_COLOR} !important; }
                .glass-panel { background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                .stepper-vertical { display: flex; flex-direction: column; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}} />
        </div>
    );
};

export default AdminComplaintDetail;
