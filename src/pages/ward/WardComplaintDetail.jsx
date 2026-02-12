
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, XCircle, UserPlus, Image as ImageIcon,
    Clock, Shield, FileText, AlertTriangle, RefreshCw, Send, MapPin, Activity,
    ShieldCheck, Zap, Star, X, CheckCircle2, ChevronRight, Info, User, Lock
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { getImageUrl } from '../../utils/imageUtils';
import { useMasterData } from '../../contexts/MasterDataContext';
import SlaCard from '../../components/complaints/SlaCard';
import OfficerAssignmentAlert from '../../components/complaints/OfficerAssignmentAlert';

/**
 * 🚀 Premium Ward Officer Complaint Detail
 * Approve/Reject with image review + Assignment
 */
const WardComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { wards, departments } = useMasterData();

    const [complaint, setComplaint] = useState(null);
    const [officers, setOfficers] = useState([]);
    const [slaInfo, setSlaInfo] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [remarks, setRemarks] = useState('');
    const [showModal, setShowModal] = useState(null);
    const [activeImage, setActiveImage] = useState(null);

    const PRIMARY_COLOR = '#244799';

    useEffect(() => {
        loadComplaintData();
    }, [id]);

    const loadComplaintData = async () => {
        try {
            setLoading(true);
            const [complaintRes, officersRes] = await Promise.all([
                apiService.complaint.getDetails(id),
                apiService.wardOfficer.getDepartmentOfficers().catch(() => [])
            ]);

            const data = complaintRes.data || complaintRes;
            setComplaint(data);
            setOfficers(officersRes.data || officersRes || []);

            // Unified DTO handles timeline and SLA
            if (data.history) setTimeline(data.history);
            if (data.slaDeadline) {
                setSlaInfo({
                    status: data.slaStatus || 'ACTIVE',
                    slaDeadline: data.slaDeadline
                });
            }

            if (data.assignedOfficerId) {
                setSelectedOfficer(data.assignedOfficerId.toString());
            }
        } catch (error) {
            console.error('Failed to load complaint:', error);
            showToast('Failed to load complaint details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedOfficer) {
            showToast('Please select an officer', 'warning');
            return;
        }

        try {
            setActionLoading(true);
            await apiService.wardOfficer.assignComplaint(id, { officerId: parseInt(selectedOfficer) });
            showToast('Officer assigned successfully!', 'success');
            loadComplaintData();
        } catch (error) {
            console.error('Assignment failed:', error);
            showToast(error.response?.data?.message || 'Failed to assign officer', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!remarks.trim()) {
            showToast('Please add remarks for approval', 'warning');
            return;
        }

        try {
            setActionLoading(true);
            await apiService.wardOfficer.approveComplaint(id, { remarks: remarks.trim() });
            showToast('Complaint approved successfully!', 'success');
            navigate('/ward-officer/dashboard');
        } catch (error) {
            console.error('Approval failed:', error);
            showToast(error.response?.data?.message || 'Failed to approve complaint', 'error');
        } finally {
            setActionLoading(false);
            setShowModal(null);
        }
    };

    const handleReject = async () => {
        if (!remarks.trim()) {
            showToast('Please add remarks for rejection', 'warning');
            return;
        }

        try {
            setActionLoading(true);
            await apiService.wardOfficer.rejectComplaint(id, { remarks: remarks.trim() });
            showToast('Complaint rejected and reassigned to department officer.', 'info');
            navigate('/ward-officer/dashboard');
        } catch (error) {
            console.error('Rejection failed:', error);
            showToast(error.response?.data?.message || 'Failed to reject complaint', 'error');
        } finally {
            setActionLoading(false);
            setShowModal(null);
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted text-uppercase tracking-widest small">Loading Complaint...</p>
            </div>
        );
    }

    if (!complaint) return null;

    const canAssign = ['SUBMITTED', 'ASSIGNED'].includes(complaint.status);
    const canReview = complaint.status === 'RESOLVED';

    // Group images
    // Unified Image Extraction & Attribution
    const images = complaint.images || complaint.imageUrls || [];
    const extractImageDetails = (slot) => {
        let imgObj = null;
        if (slot === 'INITIAL') {
            imgObj = images.find(im => (typeof im === 'string') || (['INITIAL', 'BEFORE_WORK', 'SUBMITTED', 'RECEIVED'].includes(im.stage || im.imageStage)));
            if (!imgObj && (typeof images[0] === 'string' || (!images[0].stage && !images[0].imageStage))) imgObj = images[0];
        } else if (slot === 'WORKING') {
            imgObj = images.find(im => typeof im === 'object' && ['IN_PROGRESS', 'WORK_STARTED', 'WORKING', 'FIELD_EVIDENCE'].includes(im.stage || im.imageStage));
        } else if (slot === 'RESOLVED') {
            imgObj = images.find(im => typeof im === 'object' && ['AFTER_RESOLUTION', 'RESOLUTION_PROOF', 'RESOLVED', 'FIXED'].includes(im.stage || im.imageStage));
        }

        const url = getImageUrl(imgObj?.imageUrl || imgObj, id);
        const uploader = typeof imgObj === 'object' ? (imgObj.uploadedBy || imgObj.officerName || (slot === 'INITIAL' ? (complaint?.citizenName || 'Citizen') : 'Officer')) : (slot === 'INITIAL' ? (complaint?.citizenName || 'Citizen') : 'Officer');
        const role = typeof imgObj === 'object' ? (imgObj.uploadedByRole || (slot === 'INITIAL' ? 'CITIZEN' : 'DEPT_OFFICER')) : (slot === 'INITIAL' ? 'CITIZEN' : 'DEPT_OFFICER');
        const time = imgObj?.uploadedAt ? new Date(imgObj.uploadedAt).toLocaleDateString() : 'SYNCED';

        return { url, uploader, role, time, exists: !!url && url !== '/placeholder.png' };
    };

    const slots = [
        { key: 'INITIAL', label: 'RECEIVED', sub: 'Citizen Source', icon: Send },
        { key: 'WORKING', label: 'WORKING', sub: 'Field Evidence', icon: Activity },
        { key: 'RESOLVED', label: 'RESOLVED', sub: 'Resolution Proof', icon: ShieldCheck }
    ];

    const wardInfo = wards?.find(w => w.wardId === complaint.wardId);
    const deptInfo = departments?.find(d => d.departmentId === complaint.departmentId);

    const displayWard = wardInfo?.areaName || complaint.wardName || complaint.ward?.areaName || 'Ward N/A';
    const displayDept = deptInfo?.departmentName || complaint.departmentName || complaint.department?.departmentName || 'General Department';

    return (
        <div className="ward-detail min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
            {/* Tactical Grid Background */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${PRIMARY_COLOR} 1px, transparent 1px), linear-gradient(90deg, ${PRIMARY_COLOR} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                zIndex: 0
            }}></div>

            <DashboardHeader
                portalName="Ward Officer Portal • Audit Console"
                userName={`Complaint #${complaint.complaintId || id} `}
                wardName={displayWard}
                subtitle={complaint.title || 'Complaint Detail'}
                icon={Shield}
                showProfileInitials={true}
                actions={
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm fw-black extra-small tracking-widest d-flex align-items-center gap-2 border transition-all hover-shadow-md"
                        style={{ color: '#173470' }}
                    >
                        <ArrowLeft size={16} /> BACK
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5 mt-4 position-relative" style={{ zIndex: 1 }}>
                <div className="row g-4">
                    {/* Left Column */}
                    <div className="col-lg-8">
                        {/* Personnel Alert Hub */}
                        <OfficerAssignmentAlert complaint={complaint} />

                        {/* Status Alert for Verification */}
                        {complaint.status === 'RESOLVED' && (
                            <div className="card border-0 shadow-premium rounded-4 bg-white mb-4 overflow-hidden border-start border-4" style={{ borderColor: '#F59E0B' }}>
                                <div className="card-body p-4 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-warning bg-opacity-10 p-2 text-warning"><AlertTriangle size={20} /></div>
                                        <div>
                                            <h6 className="fw-black text-dark mb-0 uppercase tracking-tight">Awaiting Verification</h6>
                                            <p className="extra-small text-muted fw-bold mb-0 opacity-60">Field work has been marked RESOLVED. Verification required.</p>
                                        </div>
                                    </div>
                                    <Clock size={24} className="text-warning opacity-20 animate-pulse" />
                                </div>
                            </div>
                        )}

                        {/* Assign Officer Section */}
                        {canAssign && (
                            <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white overflow-hidden border-bottom border-4" style={{ borderBottomColor: PRIMARY_COLOR }}>
                                <div className="card-header py-4 px-5 border-0 bg-transparent">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle p-2 bg-primary bg-opacity-10 text-primary" style={{ color: PRIMARY_COLOR }}><UserPlus size={18} /></div>
                                        <h6 className="mb-0 fw-black text-dark extra-small uppercase tracking-widest">Incident Dispatch Console</h6>
                                    </div>
                                </div>
                                <div className="card-body p-5 pt-0">
                                    {officers.length === 0 ? (
                                        <div className="text-center py-5 bg-light rounded-4 border-dashed border-2">
                                            <Users size={32} className="text-muted mb-3 opacity-20" />
                                            <h6 className="fw-black text-muted uppercase tracking-widest small mb-1">No Unit Operatives Found</h6>
                                            <p className="extra-small text-muted opacity-40 uppercase mb-4">You must enroll department specialists to assign work.</p>
                                            <button onClick={() => navigate('/ward-officer/register-officer')} className="btn btn-primary rounded-pill px-5 py-3 extra-small fw-black shadow-lg" style={{ backgroundColor: PRIMARY_COLOR }}>ENROLL DEPARTMENT SPECIALIST</button>
                                        </div>
                                    ) : (
                                        <div className="vstack gap-4">
                                            <div className="p-4 rounded-4 bg-light border">
                                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-40 d-block">Available Department Personnel ({displayDept})</label>
                                                <div className="d-flex gap-3">
                                                    <select className="form-select rounded-pill border-2 shadow-none extra-small fw-black p-3 bg-white" value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)}>
                                                        <option value="">SELECT PERSONNEL FOR DEPLOYMENT...</option>
                                                        {officers.filter(o => o.status !== 'DEACTIVATED').map(officer => (
                                                            <option key={officer.userId || officer.id} value={officer.userId || officer.id}>
                                                                {officer.name} • POLICE ID: {officer.userId || officer.id}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button onClick={handleAssign} disabled={!selectedOfficer || actionLoading} className="btn btn-primary rounded-pill px-5 fw-black extra-small shadow-lg border-0 transition-all hover-scale" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                        {actionLoading ? 'DEPLOYNIG...' : 'CONFIRM DISPATCH'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <span className="extra-small fw-bold text-muted uppercase tracking-tighter opacity-40">Need a different specialist? <button onClick={() => navigate('/ward-officer/officers')} className="btn btn-link p-0 extra-small fw-black text-primary text-decoration-none">VIEW ROSTER</button> or <button onClick={() => navigate('/ward-officer/register-officer')} className="btn btn-link p-0 extra-small fw-black text-primary text-decoration-none">REGISTER NEW</button></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white overflow-hidden">
                            <div className="card-header py-4 px-5 border-0 bg-transparent d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-black text-dark extra-small uppercase tracking-widest">Operational Detail</h6>
                                <StatusBadge status={complaint.status} size="sm" />
                            </div>
                            <div className="card-body p-5 pt-0">
                                <div className="p-4 bg-light rounded-4 border-start border-4 mb-5" style={{ borderColor: PRIMARY_COLOR }}>
                                    <h1 className="fw-black text-dark mb-0 uppercase tracking-tighter lh-1" style={{ fontSize: '1.8rem' }}>{complaint.title || 'RECORD_UNNAMED'}</h1>
                                </div>
                                <div className="row g-5">
                                    <div className="col-12">
                                        <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-40">Situation Assessment</label>
                                        <p className="fw-bold text-dark leading-relaxed mb-0" style={{ fontSize: '1.05rem' }}>{complaint.description || 'No descriptive intel provided.'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-40">Deployment Sector</label>
                                        <div className="d-flex align-items-center gap-2 extra-small fw-black text-dark uppercase"><MapPin size={14} className="text-primary" /> {displayWard}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-40">Functional Unit</label>
                                        <div className="d-flex align-items-center gap-2 extra-small fw-black text-dark uppercase"><Shield size={14} className="text-primary" /> {displayDept}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Gallery */}
                        <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden mb-4">
                            <div className="card-header py-4 px-5 border-0 bg-transparent">
                                <h6 className="mb-0 fw-black text-dark extra-small uppercase tracking-widest d-flex align-items-center gap-2">
                                    <ImageIcon size={16} className="text-primary" /> EVIDENCE REPOSITORY
                                </h6>
                            </div>
                            <div className="card-body p-5 pt-0">
                                <div className="row g-4">
                                    {slots.map((slot, i) => {
                                        const detail = extractImageDetails(slot.key);
                                        return (
                                            <div key={i} className="col-md-4">
                                                <div className={`p-4 border rounded-4 bg-light bg-opacity-40 h-100 transition-all ${detail.exists ? 'hover-up-tiny cursor-pointer border-primary shadow-sm' : 'opacity-60 border-dashed border-2'}`} onClick={() => detail.exists && setActiveImage(detail.url)}>
                                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className={`rounded-circle p-2 ${detail.exists ? 'bg-white border text-primary shadow-sm' : 'bg-transparent text-muted opacity-30'}`} style={detail.exists ? { color: PRIMARY_COLOR } : {}}>
                                                                <slot.icon size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="extra-small fw-black text-dark uppercase tracking-widest d-block">{slot.label}</span>
                                                                <span className="extra-small fw-bold text-muted opacity-40 uppercase" style={{ fontSize: '0.45rem' }}>{slot.sub}</span>
                                                            </div>
                                                        </div>
                                                        {detail.exists && <CheckCircle size={14} className="text-success" />}
                                                    </div>

                                                    {detail.exists ? (
                                                        <div className="position-relative overflow-hidden rounded-4 shadow-md bg-dark" style={{ aspectRatio: '4/3' }}>
                                                            <img src={detail.url} alt={slot.label} className="w-100 h-100 object-fit-cover" />
                                                            <div className="position-absolute top-0 start-0 p-3 w-100 z-1" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}><ArrowLeft size={10} className="text-white rotate-180" /></div>
                                                                    <div className="extra-small fw-black text-white uppercase tracking-tighter shadow-sm">{detail.uploader}</div>
                                                                </div>
                                                                <div className="extra-small fw-bold text-white opacity-60 uppercase mt-0.5" style={{ fontSize: '0.5rem', marginLeft: '24px' }}>{detail.role} • {detail.time}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-4 border-2 border-dashed d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-50" style={{ aspectRatio: '4/3' }}>
                                                            <ImageIcon size={28} className="text-muted opacity-10 mb-2" />
                                                            <span className="extra-small fw-black text-muted opacity-40 tracking-tight text-center px-4">DATA_PENDING</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Feedback Module */}
                        {complaint.feedback && (
                            <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden mb-4">
                                <div className="card-header py-4 px-5 border-0 bg-transparent">
                                    <h6 className="mb-0 fw-black text-dark extra-small uppercase tracking-widest">Post-Mission Feedback</h6>
                                </div>
                                <div className="card-body p-5 pt-0">
                                    <div className="p-4 bg-warning bg-opacity-5 rounded-4 border border-warning border-opacity-20">
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <div className="d-flex gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        size={20}
                                                        fill={star <= (complaint.feedback.rating >= 0 ? complaint.feedback.rating : 0) ? '#F59E0B' : 'none'}
                                                        stroke="#F59E0B"
                                                    />
                                                ))}
                                            </div>
                                            <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-60">Citizen Rating</span>
                                        </div>
                                        <div className="bg-white p-4 rounded-4 shadow-sm border">
                                            <p className="extra-small fw-bold text-dark mb-0 italic opacity-80 leading-relaxed">
                                                "{complaint.feedback.comment || complaint.feedbackComment || 'No qualitative feedback provided.'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {timeline.length > 0 && (
                            <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden mt-4">
                                <div className="card-header py-4 px-5 border-0 bg-transparent">
                                    <h6 className="mb-0 fw-black text-dark extra-small uppercase tracking-widest d-flex align-items-center gap-2">
                                        <Activity size={16} className="text-primary" /> Tracking History
                                    </h6>
                                </div>
                                <div className="card-body p-5 pt-0">
                                    <div className="vstack gap-0">
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

                                            return (
                                                <div key={idx} className="d-flex gap-4 position-relative pb-4">
                                                    {idx !== (timeline.length - 1) && (
                                                        <div className="position-absolute h-100 border-start border-2 border-primary border-opacity-10" style={{ left: '19px', top: '10px', zIndex: 0 }}></div>
                                                    )}
                                                    <div className="circ-white shadow-premium border border-primary border-opacity-10" style={{ width: '40px', height: '40px', zIndex: 1, minWidth: '40px' }}>
                                                        <StatusIcon size={18} strokeWidth={2.5} className="text-primary" />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <span className="extra-small fw-black text-dark uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>{log.status}</span>
                                                            <span className="extra-small text-muted fw-bold opacity-40">{new Date(log.changedAt || log.timestamp || log.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="extra-small text-muted fw-bold uppercase opacity-50 mb-1 d-flex align-items-center gap-2">
                                                            <User size={10} /> Action By: {log.changedBy || log.actionBy || (idx === 0 ? 'CITIZEN' : 'SYSTEM')}
                                                        </div>
                                                        {log.remarks && <p className="extra-small text-dark fw-bold mb-0 opacity-70 italic bg-light p-3 rounded-3 border-start border-2 border-primary border-opacity-20">"{log.remarks}"</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - SLA & Info */}
                    <div className="col-lg-4">
                        <SlaCard sla={complaint.slaDetails || (slaInfo ? {
                            status: slaInfo.status,
                            deadline: slaInfo.slaDeadline,
                            remainingHours: 0,
                            totalHoursAllocated: 24
                        } : null)} />

                        {/* Quick Info */}
                        <div className="card border-0 shadow-premium rounded-4">
                            <div className="card-header py-4 px-5 border-0 bg-white">
                                <h6 className="mb-0 fw-black text-dark extra-small uppercase tracking-widest">Quick Info</h6>
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                                    <div className="rounded-circle bg-primary bg-opacity-10 p-2" style={{ color: PRIMARY_COLOR }}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">ID</p>
                                        <p className="fw-bold text-dark mb-0">{complaint.complaintId || id}</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle bg-warning bg-opacity-10 p-2 text-warning">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">Created</p>
                                        <p className="fw-bold text-dark mb-0">
                                            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Sticky Action Footer for Review */}
            {/* Review Action Trigger Button (Floating) */}
            {canReview && !showModal && (
                <div className="fixed-bottom p-4 d-flex justify-content-center pointer-events-none" style={{ zIndex: 1020 }}>
                    <button
                        onClick={() => setShowModal('REVIEW')}
                        className="btn btn-dark rounded-pill px-5 py-3 shadow-lg fw-black extra-small tracking-widest d-flex align-items-center gap-3 pointer-events-auto hover-scale-105 transition-all"
                        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <ShieldCheck size={20} className="text-warning" />
                        REVIEW RESOLUTION
                    </button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .slide-up-animation { animation: slideUp 0.3s ease-out forwards; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}} />

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

            {/* Review & Action Modal */}
            {showModal === 'REVIEW' && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-md-center justify-content-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
                    onClick={() => setShowModal(null)}>
                    <div className="card border-0 shadow-2xl rounded-top-4 rounded-md-4 overflow-hidden w-100 bg-white animate-slideUp" style={{ maxWidth: '600px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                        <div className="card-header border-0 bg-white p-4 d-flex justify-content-between align-items-center sticky-top">
                            <h5 className="fw-black text-dark mb-0 uppercase tracking-tight flex-grow-1">Resolution Review</h5>
                            <button onClick={() => setShowModal(null)} className="btn btn-light rounded-circle p-2 ms-3"><X size={20} /></button>
                        </div>

                        <div className="card-body p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
                            {/* Evidence Snapshot */}
                            <div className="row g-3 mb-4">
                                {slots.filter(s => s.key !== 'INITIAL').map((slot, i) => {
                                    const detail = extractImageDetails(slot.key);
                                    return (
                                        <div key={i} className="col-6">
                                            <div className="p-3 bg-light rounded-4 border h-100 text-center">
                                                <div className="extra-small fw-black text-muted uppercase tracking-widest mb-2">{slot.label}</div>
                                                {detail.exists ? (
                                                    <div className="rounded-3 overflow-hidden shadow-sm position-relative group" onClick={() => setActiveImage(detail.url)} style={{ aspectRatio: '16/9' }}>
                                                        <img src={detail.url} className="w-100 h-100 object-fit-cover" alt={slot.label} />
                                                    </div>
                                                ) : (
                                                    <div className="rounded-3 border-dashed d-flex align-items-center justify-content-center text-muted opacity-40" style={{ aspectRatio: '16/9' }}>
                                                        <span className="extra-small">NO IMAGE</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Remarks Input */}
                            <div className="mb-4">
                                <label className="form-label extra-small fw-black text-muted uppercase tracking-widest mb-2">
                                    Official Remarks <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control rounded-4 bg-light border-0 px-4 py-3"
                                    rows="4"
                                    placeholder="Enter detailed remarks regarding the resolution quality or rejection reason..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="p-3 rounded-4 bg-indigo-50 border border-indigo-100 mb-2" style={{ backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }}>
                                <div className="d-flex gap-3">
                                    <Info size={20} className="text-primary flex-shrink-0" />
                                    <p className="extra-small text-muted fw-bold mb-0 opacity-80 lh-sm">
                                        Approving will forward this case for final closure. Rejecting will return it to the officer's queue as 'IN_PROGRESS'.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer bg-white border-top p-4">
                            <div className="d-flex gap-3">
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !remarks.trim()}
                                    className="btn btn-white border-danger text-danger rounded-pill py-3 fw-black extra-small flex-grow-1 d-flex justify-content-center align-items-center gap-2 hover-bg-danger hover-text-white transition-all"
                                >
                                    {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <XCircle size={18} />}
                                    REJECT RESOLUTION
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading || !remarks.trim()}
                                    className="btn btn-success rounded-pill py-3 fw-black extra-small flex-grow-1 d-flex justify-content-center align-items-center gap-2 shadow-lg hover-up transition-all"
                                    style={{ backgroundColor: '#10B981' }}
                                >
                                    {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={18} />}
                                    APPROVE & CLOSE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardComplaintDetail;
