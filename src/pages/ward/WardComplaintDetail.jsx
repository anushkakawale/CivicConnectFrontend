import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Play, Upload, Camera, Clock,
    Zap, Loader, CheckCheck, X as CloseIcon,
    ShieldAlert, Activity, ShieldCheck, ClipboardCheck,
    UserPlus, CheckCircle, Smartphone, ArrowRight,
    MessageSquare, AlertTriangle, Info, ChevronLeft, RefreshCw
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ComplaintDetailView from '../../components/complaints/ComplaintDetailView';
import { calculateSlaStatus } from '../../utils/slaUtils';

/**
 * Strategic Ward Officer Complaint Detail
 * Integrated high-contrast management console.
 */
const WardComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [officers, setOfficers] = useState([]);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState(null);
    const [remarks, setRemarks] = useState('');
    const PRIMARY_COLOR = '#1254AF';

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [compRes, officersRes] = await Promise.all([
                apiService.complaint.getDetails(id),
                apiService.wardOfficer.getDepartmentOfficers()
            ]);

            const data = compRes.data || compRes;
            setComplaint(data);
            setOfficers(officersRes.data || officersRes || []);
            if (data.assignedOfficerId) setSelectedOfficer(data.assignedOfficerId);
        } catch (error) {
            console.error('Operational sync failed:', error);
            showToast('Unable to synchronize case data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (!remarks.trim()) return showToast('Remarks required for audit log.', 'warning');
        try {
            setActionLoading(true);
            if (action === 'APPROVE') {
                await apiService.wardOfficer.approveComplaint(id, { remarks });
                showToast('Resolution Verified & Locked.', 'success');
            } else {
                await apiService.wardOfficer.rejectComplaint(id, { remarks });
                showToast('Work Rejected: Unit Notified.', 'info');
            }
            navigate('/ward-officer/dashboard');
        } catch (err) { showToast('Operation failed.', 'error'); }
        finally { setActionLoading(false); }
    };

    const handleAssign = async () => {
        if (!selectedOfficer) return;
        try {
            setActionLoading(true);
            await apiService.wardOfficer.assignComplaint(id, { officerId: selectedOfficer });
            showToast('Deployment Successful: Officer Assigned.', 'success');
            loadData();
        } catch (err) { showToast('Assignment failed.', 'error'); }
        finally { setActionLoading(false); }
    };

    if (loading && !complaint) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted text-uppercase tracking-widest small animate-pulse">Syncing Case Node...</p>
            </div>
        );
    }

    if (!complaint) return null;

    const canReview = complaint.status === 'RESOLVED';
    const canAssign = ['SUBMITTED', 'ASSIGNED'].includes(complaint.status);

    return (
        <div className="ward-detail-strategic min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Ward Command Center"
                userName={complaint.title || `Audit Record #${complaint.complaintId || id}`}
                wardName={complaint.wardName || "PMC Ward Control"}
                subtitle={`Grievance ID: #${complaint.complaintId || id} • Official Operational Audit`}
                icon={ShieldCheck}
                showProfileInitials={true}
                actions={
                    <button onClick={() => navigate(-1)} className="btn btn-outline-light rounded-pill px-4 py-2 shadow-sm fw-black extra-small tracking-widest d-flex align-items-center gap-2 border transition-all hover-shadow-md text-white">
                        <ArrowLeft size={16} /> RETURN
                    </button>
                }
            />

            <div className="container-fluid px-5">
                <ComplaintDetailView
                    complaint={complaint}
                    images={complaint.images || []}
                    statusHistory={complaint.timeline || complaint.statusHistory || []}
                    slaCountdown={calculateSlaStatus(complaint)}
                    userRole="WARD_OFFICER"
                >
                    <div className="row g-4 mb-5">
                        {/* Assignment Control */}
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-lg bg-white p-5 h-100 gov-rounded elevation-2 border-top border-5 border-primary">
                                <h6 className="fw-black text-dark mb-4 uppercase tracking-[0.2em] opacity-40 border-bottom pb-3">Deployment Console</h6>
                                {officers.length === 0 ? (
                                    <div className="p-4 bg-light bg-opacity-50 border-dashed border-2 rounded-4 text-center">
                                        <ShieldAlert size={32} className="text-warning mb-3 mx-auto" strokeWidth={2.5} />
                                        <p className="extra-small fw-black text-dark uppercase tracking-widest mb-3">No Field Personnel Registered</p>
                                        <button
                                            onClick={() => navigate('/ward-officer/register-officer')}
                                            className="btn btn-primary w-100 py-3 fw-black extra-small tracking-widest shadow-premium theme-dark-bg border-0"
                                        >
                                            <UserPlus size={16} className="me-2" /> ENLIST OFFICER
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-light border gov-rounded mb-4">
                                        <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 d-block">Select Field Unit</label>
                                        <div className="d-flex gap-2">
                                            <select className="form-select border-0 bg-white p-3 fw-bold shadow-sm extra-small" value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}>
                                                <option value="">-- SEARCH OFFICIALS --</option>
                                                {officers.map(o => <option key={o.userId} value={o.userId}>{o.name} | {o.departmentName}</option>)}
                                            </select>
                                            <button onClick={handleAssign} disabled={!canAssign || actionLoading} className="btn btn-primary px-4 py-3 fw-black extra-small tracking-widest shadow-premium theme-dark-bg border-0">DEPLOY</button>
                                        </div>
                                    </div>
                                )}
                                {!canAssign && officers.length > 0 && <p className="extra-small fw-black text-center text-muted opacity-40 uppercase tracking-widest mb-0">Assignment protocol locked for status: {complaint.status}</p>}
                            </div>
                        </div>

                        {/* Audit Verification */}
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-lg bg-white p-5 h-100 gov-rounded elevation-2 border-top border-5" style={{ borderColor: '#10B981' }}>
                                <h6 className="fw-black text-dark mb-4 uppercase tracking-[0.2em] opacity-40 border-bottom pb-3">Rectification Audit</h6>
                                {canReview ? (
                                    <div className="d-flex flex-column gap-3">
                                        <textarea className="form-control border p-3 fw-bold shadow-sm extra-small" rows="3" placeholder="Field audit remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                                        <div className="d-flex gap-2">
                                            <button onClick={() => setShowActionModal('APPROVE')} className="btn btn-success flex-grow-1 py-3 fw-black extra-small tracking-widest shadow-premium border-0">VERIFY COMPLETE</button>
                                            <button onClick={() => setShowActionModal('REJECT')} className="btn btn-outline-danger flex-grow-1 py-3 fw-black extra-small tracking-widest border-2">REJECT WORK</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-100 d-flex flex-column align-items-center justify-content-center opacity-20">
                                        <Clock size={48} className="mb-2" />
                                        <p className="extra-small fw-black uppercase tracking-widest">Awaiting Field Resolution</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ComplaintDetailView>
            </div>

            {/* Verification Modal */}
            {showActionModal && (
                <div className="locked-modal-overlay">
                    <div className="card shadow-premium border-0 gov-rounded overflow-hidden animate-zoomIn" style={{ maxWidth: '450px', width: '90%', background: 'white' }}>
                        <div className="card-header border-0 p-5 theme-dark-bg text-white text-center" style={{ backgroundColor: showActionModal === 'APPROVE' ? '#10B981' : '#EF4444' }}>
                            {showActionModal === 'APPROVE' ? <CheckCircle size={48} className="mb-3" /> : <AlertTriangle size={48} className="mb-3" />}
                            <h5 className="fw-black mb-0 uppercase tracking-tight">{showActionModal === 'APPROVE' ? 'Lock Resolution' : 'Trigger Rework'}</h5>
                        </div>
                        <div className="card-body p-5">
                            <p className="extra-small fw-bold text-center text-muted uppercase tracking-widest opacity-75 mb-5">
                                {showActionModal === 'APPROVE' ? 'Final verification logs will be archived and the citizen will be notified.' : 'This node will be returned to the field unit for further rectification.'}
                            </p>
                            <div className="d-grid gap-3">
                                <button className="btn py-4 fw-black extra-small tracking-[0.2em] shadow-premium text-white border-0" style={{ backgroundColor: showActionModal === 'APPROVE' ? '#10B981' : '#EF4444' }} onClick={() => handleAction(showActionModal)}>CONFIRM AUDIT</button>
                                <button className="btn btn-light py-3 fw-black extra-small tracking-[0.2em] border-0" onClick={() => setShowActionModal(null)}>BACK</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .locked-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}} />
        </div>
    );
};

export default WardComplaintDetail;
