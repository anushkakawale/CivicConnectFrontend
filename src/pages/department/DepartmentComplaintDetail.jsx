import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Play, Upload, Camera,
    Zap, Loader, CheckCheck, X as CloseIcon,
    ShieldAlert, Activity, ShieldCheck, ClipboardCheck, CheckCircle, RefreshCw, ChevronLeft, Smartphone
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ComplaintDetailView from '../../components/complaints/ComplaintDetailView';
import { calculateSlaStatus } from '../../utils/slaUtils';

/**
 * Strategic Department Officer Complaint Detail
 * Field force management console with photographic evidence locks.
 */
const DepartmentComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [images, setImages] = useState([]);
    const [statusHistory, setStatusHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStage, setUploadStage] = useState(null);
    const [showActionModal, setShowActionModal] = useState(null);
    const PRIMARY_COLOR = '#244799';

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [detailRes, imageRes] = await Promise.all([
                apiService.departmentOfficer.getComplaintDetails(id),
                apiService.complaint.getImages(id)
            ]);
            const data = detailRes.data || detailRes;
            setComplaint(data);
            setImages(imageRes.data || imageRes || []);
            setStatusHistory(data.statusHistory || data.timeline || []);
        } catch (err) {
            console.error('Field sync failed:', err);
            showToast('Unable to synchronize task data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (stage) => {
        if (!selectedFile) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('stage', stage);
            await apiService.complaint.uploadImage(id, formData);
            showToast('Photographic evidence uploaded.', 'success');
            setSelectedFile(null);
            setUploadStage(null);
            loadData();
        } catch (err) { showToast('Upload failed.', 'error'); }
        finally { setUploading(false); }
    };

    const handleAction = async (action) => {
        try {
            setActionLoading(true);
            if (action === 'START') {
                const hasInitial = images.some(img => ['INITIAL', 'BEFORE', 'BEFORE_WORK'].includes((img.stage || '').toUpperCase()));
                if (!hasInitial) return showToast('Upload "Before Work" photographic evidence first.', 'warning');
                await apiService.departmentOfficer.startWork(id);
                showToast('Protocol initiated: Work sequence active.', 'success');
            } else {
                const hasFinal = images.some(img => ['RESOLVED', 'AFTER', 'FINAL'].includes((img.stage || '').toUpperCase()));
                if (!hasFinal && images.length < 3) return showToast('Resolution documentation required.', 'warning');
                await apiService.departmentOfficer.resolveComplaint(id);
                showToast('Resolution successfully logged.', 'success');
            }
            setShowActionModal(null);
            loadData();
        } catch (err) { showToast('Operational sync failed.', 'error'); }
        finally { setActionLoading(false); }
    };

    if (loading && !complaint) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted text-uppercase tracking-widest small animate-heartbeat">Syncing Field Node...</p>
            </div>
        );
    }

    if (!complaint) return null;

    const canStart = complaint.status === 'ASSIGNED';
    const canResolve = complaint.status === 'IN_PROGRESS';
    const isResolved = ['RESOLVED', 'CLOSED'].includes(complaint.status);

    const UploadBox = ({ title, stage, icon: Icon, color, allowed }) => (
        <div className="col-md-4">
            <div className={`p-4 glass-panel gov-rounded border-dashed d-flex flex-column align-items-center justify-content-center text-center transition-standard ${!allowed ? 'opacity-40 grayscale pointer-events-none' : 'hover-scale'}`}
                style={{ border: `2px dashed ${color}40`, height: '220px', backgroundColor: 'white' }}>
                <div className="circ-white mb-3 shadow-sm" style={{ width: '52px', height: '52px', backgroundColor: `${color}15`, color: color }}>
                    <Icon size={22} />
                </div>
                <h6 className="extra-small fw-black text-dark uppercase tracking-widest mb-3 opacity-90">{title}</h6>

                {uploadStage === stage ? (
                    <div className="d-flex flex-column gap-2 w-100 animate-zoomIn px-3">
                        <span className="extra-small fw-bold text-dark truncate opacity-60 mb-1">{selectedFile.name}</span>
                        <button onClick={() => handleFileUpload(stage === 'INITIAL' ? 'BEFORE_WORK' : stage === 'PROGRESS' ? 'IN_PROGRESS' : 'AFTER_RESOLUTION')}
                            className="btn btn-premium w-100 py-2 extra-small" style={{ backgroundColor: color }}>
                            {uploading ? 'SYNCING...' : 'CONFIRM UPLOAD'}
                        </button>
                        <button onClick={() => { setSelectedFile(null); setUploadStage(null); }} className="btn btn-light w-100 py-1 extra-small border-0">CANCEL</button>
                    </div>
                ) : (
                    <label className={`btn btn-light border-0 py-2 px-4 extra-small fw-black tracking-widest shadow-sm gov-rounded cursor-pointer ${!allowed ? 'disabled' : ''}`}>
                        SELECT ASSET
                        <input type="file" className="d-none" disabled={!allowed} onChange={e => { setSelectedFile(e.target.files[0]); setUploadStage(stage); }} />
                    </label>
                )}
            </div>
        </div>
    );

    return (
        <div className="department-detail-strategic min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Field Operations Terminal"
                userName={complaint.title || `Protocol #${complaint.complaintId || id}`}
                wardName={complaint.wardByWardId?.areaName || complaint.wardName || "Municipal Sector"}
                subtitle={`Operational File ID: #${complaint.complaintId || id} • Field Force Command`}
                icon={ClipboardCheck}
                showProfileInitials={true}
                actions={
                    <button onClick={() => navigate(-1)} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm fw-black extra-small tracking-widest d-flex align-items-center gap-2 border transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <ArrowLeft size={16} /> RETURN
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5">
                <ComplaintDetailView
                    complaint={complaint}
                    images={images}
                    statusHistory={statusHistory}
                    slaCountdown={calculateSlaStatus(complaint)}
                    userRole="DEPARTMENT_OFFICER"
                >
                    <div className="row g-4 mb-5">
                        {/* Evidence Management */}
                        <div className="col-lg-12">
                            <div className="premium-card p-5 elevation-2 border-top border-5 border-primary">
                                <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                                    <h6 className="fw-black text-dark mb-0 uppercase tracking-[0.2em] opacity-40">Tactical Evidence Submission</h6>
                                    <div className="badge-rect-blue glass-panel-dark border-0">3-STAGE AUTH PROTOCOL</div>
                                </div>
                                <div className="row g-4">
                                    <UploadBox title="Initial Evidence" stage="INITIAL" icon={Camera} color="#1254AF" allowed={true} />
                                    <UploadBox title="Work Started Images" stage="PROGRESS" icon={Zap} color="#F59E0B" allowed={canResolve || isResolved} />
                                    <UploadBox title="Work Resolved Images" stage="FINAL" icon={CheckCircle} color="#10B981" allowed={canResolve || isResolved} />
                                </div>
                            </div>
                        </div>

                        {/* Task Execution Console */}
                        <div className="col-12 mt-4">
                            <div className="premium-card p-5 elevation-4 border-top border-5" style={{ borderColor: '#6366F1' }}>
                                <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                                    <h6 className="fw-black text-dark mb-0 uppercase tracking-[0.2em] opacity-40">Field Execution Workflow</h6>
                                    <span className="extra-small fw-black text-muted uppercase tracking-widest">Protocol ID: {id}</span>
                                </div>

                                <div className="row g-4 justify-content-center">
                                    <div className="col-md-5">
                                        <div className={`p-5 gov-rounded border text-center transition-standard ${canStart ? 'bg-primary bg-opacity-5 border-primary border-2 shadow-lg' : 'bg-light border-light grayscale opacity-50'}`}>
                                            <div className={`circ-white mx-auto mb-4 elevation-2 ${canStart ? 'animate-heartbeat' : ''}`} style={{ width: '64px', height: '64px', backgroundColor: canStart ? PRIMARY_COLOR : '#94A3B8', color: 'white' }}>
                                                {canStart ? <Play size={28} /> : <CheckCheck size={28} />}
                                            </div>
                                            <h5 className="fw-black text-dark uppercase tracking-tight mb-2">Phase 1: Initiation</h5>
                                            <p className="extra-small text-muted uppercase tracking-widest mb-4 opacity-60">Log arrival and verification</p>
                                            {canStart ? (
                                                <button onClick={() => setShowActionModal('START')} className="btn btn-premium px-5 w-100 btn-lg shadow-float">START WORK CYCLE</button>
                                            ) : (
                                                <div className="badge-rect-blue bg-success text-white w-100 py-3">NODE VERIFIED & ACTIVE</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <div className={`p-5 gov-rounded border text-center transition-standard ${canResolve ? 'bg-success bg-opacity-5 border-success border-2 shadow-lg' : 'bg-light border-light grayscale opacity-50'}`}>
                                            <div className="circ-white mx-auto mb-4 elevation-2" style={{ width: '64px', height: '64px', backgroundColor: canResolve || isResolved ? '#10B981' : '#94A3B8', color: 'white' }}>
                                                {isResolved ? <CheckCircle size={28} /> : <Zap size={28} />}
                                            </div>
                                            <h5 className="fw-black text-dark uppercase tracking-tight mb-2">Phase 2: Resolution</h5>
                                            <p className="extra-small text-muted uppercase tracking-widest mb-4 opacity-60">Certify rectification completion</p>
                                            {canResolve ? (
                                                <button onClick={() => setShowActionModal('RESOLVE')} className="btn btn-premium px-5 w-100 btn-lg shadow-float" style={{ backgroundColor: '#10B981' }}>SYNC COMPLETION</button>
                                            ) : (
                                                <div className={`badge-rect-blue w-100 py-3 ${isResolved ? 'bg-dark' : 'bg-light text-muted opacity-40'}`}>
                                                    {isResolved ? 'PROTOCOL FINALIZED' : 'PROTOCOL LOCKED'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ComplaintDetailView>
            </div>

            {/* Tactical Action Modal */}
            {showActionModal && (
                <div className="locked-modal-overlay">
                    <div className="card shadow-float border-0 gov-rounded overflow-hidden animate-zoomIn glass-panel" style={{ maxWidth: '480px', width: '90%', background: 'white' }}>
                        <div className="card-header border-0 p-5 theme-dark-bg text-white text-center" style={{ backgroundColor: showActionModal === 'START' ? PRIMARY_COLOR : '#10B981' }}>
                            {showActionModal === 'START' ? <Activity size={48} className="mb-4 animate-heartbeat" /> : <ShieldCheck size={48} className="mb-4" />}
                            <h4 className="fw-black mb-0 uppercase tracking-tight">{showActionModal === 'START' ? 'Initiate Work Sequence' : 'Finalize Resolution'}</h4>
                        </div>
                        <div className="card-body p-5">
                            <p className="extra-small fw-bold text-center text-muted uppercase tracking-widest opacity-75 mb-5 lh-base">
                                {showActionModal === 'START' ? 'This action logs the official start of rectification activities in the public audit record. Ensure field team presence.' : 'Certification requires that all field repairs are complete and photographic evidence is attached to the ledger.'}
                            </p>
                            <div className="vstack gap-3">
                                <button className="btn btn-premium py-4 shadow-float border-0"
                                    style={{ backgroundColor: showActionModal === 'START' ? PRIMARY_COLOR : '#10B981' }}
                                    disabled={actionLoading}
                                    onClick={() => handleAction(showActionModal)}>
                                    {actionLoading ? 'LOGGING ACTION...' : 'CONFIRM & SYNC COMMAND'}
                                </button>
                                <button className="btn btn-light py-3 fw-black extra-small tracking-[0.2em] border-0" onClick={() => setShowActionModal(null)}>DISMISS</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .locked-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .grayscale { filter: grayscale(1); }
            `}} />
        </div>
    );
};

export default DepartmentComplaintDetail;
